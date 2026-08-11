import React, { useState } from 'react';
import type { NatalChart, UserSettings } from '../types';
import type { PlanetPosition, AspectData } from '../utils/planetaryPositions';
import { calculateNatalChart, SIGN_DESCRIPTIONS } from '../utils/astrology';
import { generateAINatalChartReading } from '../utils/gemini';
import { generateOfflineNatalReading } from '../utils/astrologyEngine';
import {
  Sparkles, Calendar, Clock, MapPin, Compass, Flame, Mountain,
  Wind, Droplets, Bot, Loader2, Cpu, Star, Grid3x3, ChevronDown, ChevronUp
} from 'lucide-react';

interface AstrologyChartProps {
  settings: UserSettings;
  onSaveNatalChart: (chart: NatalChart) => void;
}

type Tab = 'tropical' | 'vedic' | 'aspects' | 'houses';

const ASPECT_COLORS: Record<string, string> = {
  'Conjunção': 'text-white',
  'Oposição': 'text-red-400',
  'Quadratura': 'text-orange-400',
  'Trígono': 'text-green-400',
  'Sextil': 'text-blue-400',
  'Quincúncio': 'text-yellow-400',
};

const ASPECT_BG: Record<string, string> = {
  'Conjunção': 'bg-white/10 border-white/20',
  'Oposição': 'bg-red-500/10 border-red-500/20',
  'Quadratura': 'bg-orange-500/10 border-orange-500/20',
  'Trígono': 'bg-green-500/10 border-green-500/20',
  'Sextil': 'bg-blue-500/10 border-blue-500/20',
  'Quincúncio': 'bg-yellow-500/10 border-yellow-500/20',
};

const NATURE_ICON: Record<string, string> = {
  harmonious: '💚',
  tense: '🔴',
  neutral: '⚪',
};

/** SVG Wheel for tropical chart */
const ChartWheel: React.FC<{ planets: PlanetPosition[]; ascendant: number }> = ({ planets, ascendant }) => {
  const cx = 150, cy = 150;
  const outerR = 130, innerR = 100, coreR = 60, centerR = 20;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      {/* Outer zodiac ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx={cx} cy={cy} r={centerR} fill="#0a0a0a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      {/* House lines (12 segments) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = ((i * 30 - ascendant + 180) * Math.PI) / 180;
        const x1 = cx + coreR * Math.cos(angle);
        const y1 = cy + coreR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.06)" strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />
        );
      })}

      {/* Zodiac sign symbols in ring */}
      {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((sym, i) => {
        const angle = ((i * 30 + 15 - ascendant + 180) * Math.PI) / 180;
        const r = (outerR + innerR) / 2;
        return (
          <text key={i} x={cx + r * Math.cos(angle)} y={cy + r * Math.sin(angle)}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.35)" fontSize="9">
            {sym}
          </text>
        );
      })}

      {/* Planets */}
      {planets.slice(0, 10).map((planet, i) => {
        const angle = ((planet.longitude - ascendant + 180) * Math.PI) / 180;
        const r = innerR - 12 - (i % 3) * 10;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        return (
          <g key={planet.planet}>
            <circle cx={px} cy={py} r="9" fill="#1c1c1e" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
              fill={planet.isRetrograde ? '#ff9f0a' : '#ffffff'} fontSize="8" fontWeight="bold">
              {planet.symbol}
            </text>
          </g>
        );
      })}

      {/* ASC line */}
      <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy}
        stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x={cx - outerR + 5} y={cy - 5} fill="white" fontSize="7" fontWeight="bold">ASC</text>

      {/* Center label */}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="6" opacity={0.7}>MAPA</text>
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="6" opacity={0.7}>NATAL</text>
    </svg>
  );
};

export const AstrologyChart: React.FC<AstrologyChartProps> = ({ settings, onSaveNatalChart }) => {
  const lang = settings.language;
  const initialChart = settings.natalChart || calculateNatalChart('1995-05-15', '08:30', 'São Paulo', -23.55, -46.63, -3);

  const [birthDate, setBirthDate] = useState(initialChart.birthDate || '1995-05-15');
  const [birthTime, setBirthTime] = useState(initialChart.birthTime || '08:30');
  const [birthCity, setBirthCity] = useState(initialChart.birthCity || 'São Paulo');
  // Auto-detect UTC offset from browser; allow user override
  const browserOffset = -(new Date().getTimezoneOffset() / 60);
  const [utcOffset, setUtcOffset] = useState(initialChart.utcOffset ?? browserOffset);
  const [chart, setChart] = useState<NatalChart>(initialChart);
  const [activeTab, setActiveTab] = useState<Tab>('tropical');
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'gemini' | 'offline'>('offline');
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Use location from settings (set in SettingsModal)
    const lat = settings.location.lat;
    const lng = settings.location.lng;
    const newChart = calculateNatalChart(birthDate, birthTime, birthCity, lat, lng, utcOffset);
    setChart(newChart);
    setAiReading(null);
    onSaveNatalChart(newChart);
  };

  const handleGenerateNatalReading = async (mode: 'gemini' | 'offline') => {
    setIsGeneratingAI(true);
    setEngineType(mode);
    try {
      if (mode === 'gemini') {
        const text = await generateAINatalChartReading(chart, lang);
        setAiReading(text);
      } else {
        const text = generateOfflineNatalReading(chart);
        setAiReading(text);
      }
    } catch {
      const text = generateOfflineNatalReading(chart);
      setAiReading(text);
      setEngineType('offline');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const sunDesc = SIGN_DESCRIPTIONS[chart.sunSign] || SIGN_DESCRIPTIONS['Taurus'];
  const moonDesc = SIGN_DESCRIPTIONS[chart.moonSign] || SIGN_DESCRIPTIONS['Scorpio'];
  const risingDesc = SIGN_DESCRIPTIONS[chart.risingSign] || SIGN_DESCRIPTIONS['Cancer'];

  const fullChart = chart.fullChart;
  const aspects: AspectData[] = fullChart?.aspects || [];

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'tropical', label: 'Tropical', emoji: '☀️' },
    { id: 'vedic', label: 'Védico', emoji: '🕉️' },
    { id: 'aspects', label: 'Aspectos', emoji: '⭐' },
    { id: 'houses', label: 'Casas', emoji: '🏠' },
  ];

  const renderPlanetRow = (p: PlanetPosition) => (
    <div key={p.planet}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">{p.planet}</div>
        <div className="text-[11px] text-neutral-400">
          {p.signSymbol} {p.sign} — {p.degree}°{String(p.minutes ?? 0).padStart(2,'0')}'
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-neutral-500">Casa {p.house}</div>
        {p.isRetrograde && (
          <span className="text-[9px] text-orange-400 font-bold">℞</span>
        )}
      </div>
    </div>
  );

  const renderVedicRow = (p: PlanetPosition) => (
    <div key={p.planet}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">{p.planet}</div>
        <div className="text-[11px] text-neutral-400">{p.signSymbol} {p.sign}</div>
        {p.nakshatra && (
          <div className="text-[10px] text-neutral-500">
            Nakshatra: {p.nakshatra} ({p.nakshatraRuler}) Pada {p.nakshatraPada}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-[10px] text-neutral-500">Casa {p.house}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Mapa Astral Personalizado
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Mapa Astral
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl mt-1">
              Tropical (Ocidental) & Védico (Jyotish) — 10 planetas, casas, aspectos e Nakshatras
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenerateNatalReading('offline')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-neutral-300" /> Motor Interno
            </button>
            <button
              onClick={() => handleGenerateNatalReading('gemini')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all"
            >
              {isGeneratingAI ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <><Bot className="w-4 h-4" /> Gemini IA</>
              )}
            </button>
          </div>
        </div>

        {/* Big 3 badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {[
            { label: '☉ Sol', value: `${chart.sunSymbol} ${chart.sunSign}` },
            { label: '☽ Lua', value: `${chart.moonSymbol} ${chart.moonSign}` },
            { label: '↑ Asc', value: `${chart.risingSymbol} ${chart.risingSign}` },
            ...(fullChart ? [{ label: 'MC', value: `${fullChart.midheavenSymbol} ${fullChart.midheavenSign}` }] : []),
          ].map(b => (
            <div key={b.label} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1">{b.label}:</span>
              <span className="text-xs font-semibold text-white">{b.value}</span>
            </div>
          ))}
          {fullChart && (
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1">Ayanamsha:</span>
              <span className="text-xs font-semibold text-white">{fullChart.ayanamsha}°</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Reading */}
      {aiReading && (
        <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" /> Síntese do Mapa Astral
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
              {engineType === 'gemini' ? 'Gemini IA' : 'Motor Interno'}
            </span>
          </div>
          <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap bg-black/50 p-5 rounded-2xl border border-white/10">
            {aiReading}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form + Elements */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" /> Dados de Nascimento
            </h2>

            <form onSubmit={handleCalculate} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Data
                </label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Hora (local)
                </label>
                <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Cidade
                </label>
                <input type="text" value={birthCity} onChange={(e) => setBirthCity(e.target.value)}
                  placeholder="Ex: São Paulo..." required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center justify-between">
                <span>Fuso UTC (ex: -3 = Brasília)</span>
                <button type="button" onClick={() => setUtcOffset(browserOffset)}
                  className="text-[10px] text-neutral-500 hover:text-white underline">
                  Auto-detectar
                </button>
              </label>
              <input type="number" value={utcOffset} step="0.5" min="-12" max="14"
                onChange={(e) => setUtcOffset(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" />
              <p className="text-[10px] text-neutral-600 mt-0.5">Detectado pelo browser: UTC{browserOffset >= 0 ? '+' : ''}{browserOffset}</p>
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all mt-2">
                Calcular Mapa
              </button>
            </form>
          </div>

          {/* Elements */}
          <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Distribuição dos Elementos
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                { label: '🔥 Fogo', val: chart.elements.fire, icon: Flame },
                { label: '⛰️ Terra', val: chart.elements.earth, icon: Mountain },
                { label: '💨 Ar', val: chart.elements.air, icon: Wind },
                { label: '💧 Água', val: chart.elements.water, icon: Droplets },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div className="flex justify-between text-neutral-300 mb-1">
                    <span>{label}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black overflow-hidden">
                    <div className="h-full bg-white transition-all duration-700" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vedic quick info */}
          {fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                🕉️ Védico Rápido
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Lagna (Asc Védico)</span>
                  <span className="text-white font-semibold">{fullChart.vedicAscendant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Nakshatra Lunar</span>
                  <span className="text-white font-semibold">{fullChart.moonNakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Regente do Naksh.</span>
                  <span className="text-white font-semibold">{fullChart.moonNakshatraRuler}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pada da Lua</span>
                  <span className="text-white font-semibold">{fullChart.moonNakshatraPada}º Pada</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Nakshatra Solar</span>
                  <span className="text-white font-semibold">{fullChart.sunNakshatra}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chart + Tabs */}
        <div className="lg:col-span-8 space-y-5">
          {/* Wheel */}
          {fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 text-center">
                Roda do Mapa Natal (Tropical)
              </h2>
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
                <ChartWheel planets={fullChart.tropical} ascendant={fullChart.ascendant} />
              </div>
            </div>
          )}

          {/* Tab selector */}
          <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-2xl p-2 border border-white/10">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}>
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>

          {/* Tropical Tab */}
          {activeTab === 'tropical' && fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">Planetas — Zodíaco Tropical</h3>
              </div>
              <div className="space-y-1.5">
                {fullChart.tropical.map(renderPlanetRow)}
              </div>
              <p className="text-[10px] text-neutral-500 mt-2">
                ℞ = Retrógrado · Posições em Tempo Sidéreo Local para {chart.birthCity}
              </p>
            </div>
          )}

          {/* Vedic Tab */}
          {activeTab === 'vedic' && fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🕉️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Jyotish — Zodíaco Védico (Sidereo)</h3>
                  <p className="text-[10px] text-neutral-400">Ayanamsha Lahiri: {fullChart.ayanamsha}°</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {fullChart.vedic.map(renderVedicRow)}
              </div>
              <div className="mt-4 p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                <div className="text-xs font-bold text-neutral-300 mb-2">ℹ️ O que é o Zodíaco Védico?</div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  O Jyotish usa o Zodíaco Sidéreo, que leva em conta a precessão equinocial. 
                  O Ayanamsha Lahiri subtrai aproximadamente <strong className="text-white">{Math.round(fullChart.ayanamsha)}°</strong> das posições tropicais, 
                  deslocando os planetas ~1 signo para trás. 
                  Lagna = Ascendente Védico (<strong className="text-white">{fullChart.vedicLagna}</strong>).
                  Os Nakshatras dividem o céu em 27 mansões lunares de 13°20' cada.
                </p>
              </div>
            </div>
          )}

          {/* Aspects Tab */}
          {activeTab === 'aspects' && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⭐</span>
                <h3 className="text-sm font-bold text-white">Aspectos Astrológicos</h3>
                <span className="ml-auto text-xs text-neutral-400">{aspects.length} encontrados</span>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { name: 'Conjunção ☌', cls: 'text-white' },
                  { name: 'Trígono △', cls: 'text-green-400' },
                  { name: 'Sextil ⚹', cls: 'text-blue-400' },
                  { name: 'Quadratura □', cls: 'text-orange-400' },
                  { name: 'Oposição ☍', cls: 'text-red-400' },
                  { name: 'Quincúncio Qx', cls: 'text-yellow-400' },
                ].map(l => (
                  <span key={l.name} className={`text-[10px] font-medium ${l.cls}`}>{l.name}</span>
                ))}
              </div>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {aspects.length === 0 && (
                  <p className="text-neutral-400 text-xs text-center py-8">
                    Calcule seu mapa para ver os aspectos
                  </p>
                )}
                {aspects.map((asp, i) => (
                  <div key={i}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${ASPECT_BG[asp.aspect] || 'bg-white/5 border-white/10'}`}
                    onClick={() => setExpandedAspect(expandedAspect === i ? null : i)}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.p1Symbol}
                      </span>
                      <span className={`text-xs font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.aspect}
                      </span>
                      <span className={`text-sm font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.p2Symbol}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">
                        {asp.planet1} × {asp.planet2}
                      </span>
                      <span className="ml-auto text-[10px] text-neutral-500">
                        orb {asp.orb}° {NATURE_ICON[asp.nature]}
                      </span>
                      {expandedAspect === i
                        ? <ChevronUp className="w-3 h-3 text-neutral-400" />
                        : <ChevronDown className="w-3 h-3 text-neutral-400" />
                      }
                    </div>
                    {expandedAspect === i && (
                      <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                        {asp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Houses Tab */}
          {activeTab === 'houses' && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Grid3x3 className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">12 Casas Astrológicas (Equal House)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOUSE_MEANINGS.map(({ house, meaning, area }, i) => {
                  const houseData = chart.houses[i];
                  return (
                    <div key={house}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{house}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1">
                          <span>{houseData?.symbol}</span>
                          <span>{houseData?.sign}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">{area}</div>
                        <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{meaning}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Big 3 descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Sol ☉', sign: chart.sunSign, symbol: chart.sunSymbol, desc: sunDesc },
              { label: 'Lua ☽', sign: chart.moonSign, symbol: chart.moonSymbol, desc: moonDesc },
              { label: 'Ascendente ↑', sign: chart.risingSign, symbol: chart.risingSymbol, desc: risingDesc },
            ].map(({ label, sign, symbol, desc }) => (
              <div key={label} className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 space-y-1">
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">{label}</div>
                <div className="text-base font-bold text-white">{symbol} {sign}</div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  {lang === 'pt-BR' ? desc.pt : desc.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HOUSE_MEANINGS = [
  { house: 'I', area: 'Identidade', meaning: 'Aparência, personalidade e início de tudo.' },
  { house: 'II', area: 'Recursos', meaning: 'Finanças, valores pessoais e posses.' },
  { house: 'III', area: 'Comunicação', meaning: 'Mente, fala, irmãos e viagens curtas.' },
  { house: 'IV', area: 'Lar & Família', meaning: 'Raízes, infância, lar e vida privada.' },
  { house: 'V', area: 'Criatividade', meaning: 'Amor, prazer, filhos e expressão artística.' },
  { house: 'VI', area: 'Saúde & Trabalho', meaning: 'Rotinas, saúde, serviço diário.' },
  { house: 'VII', area: 'Parcerias', meaning: 'Casamento, sociedades e relacionamentos.' },
  { house: 'VIII', area: 'Transformação', meaning: 'Morte, heranças, sexualidade e ocultismo.' },
  { house: 'IX', area: 'Expansão', meaning: 'Filosofia, viagens longas, religião e espiritualidade.' },
  { house: 'X', area: 'Carreira (MC)', meaning: 'Status, reputação e vida pública.' },
  { house: 'XI', area: 'Comunidade', meaning: 'Amizades, grupos, sonhos e objetivos futuros.' },
  { house: 'XII', area: 'Espiritualidade', meaning: 'Inconsciente, karma, recolhimento e transcendência.' },
];
