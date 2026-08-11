import React, { useState } from 'react';
import type { NatalChart, UserSettings } from '../types';
import type { PlanetPosition, AspectData } from '../utils/planetaryPositions';
import { calculateNatalChart, CITIES_DATABASE, findCity, SIGN_DESCRIPTIONS } from '../utils/astrology';
import { generateAINatalChartReading } from '../utils/gemini';
import { generateOfflineNatalReading } from '../utils/astrologyEngine';
import {
  Sparkles, Calendar, Clock, MapPin, Compass, Flame, Mountain,
  Wind, Droplets, Bot, Loader2, Cpu, Star, Grid3x3, ChevronDown, ChevronUp, Layers
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

/** SVG Wheel matching Astro.com standard orientation (ASC on left horizontal axis) */
const ChartWheel: React.FC<{ planets: PlanetPosition[]; ascendant: number; cusps: number[] }> = ({ planets, ascendant, cusps }) => {
  const cx = 150, cy = 150;
  const outerR = 135, innerR = 100, coreR = 60, centerR = 22;

  // Transform longitude to SVG angle such that Ascendant longitude aligns with 180° (Left = 9 o'clock)
  const lngToAngle = (lng: number) => {
    const rel = (lng - ascendant + 360) % 360;
    // Ascendant (rel = 0) is at Math.PI (180 deg / left). Increasing longitude goes counter-clockwise.
    return (180 - rel) * (Math.PI / 180);
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl">
      {/* Outer zodiac ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx={cx} cy={cy} r={centerR} fill="#0a0a0a" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      {/* House Cusp lines */}
      {cusps.map((cuspLng, i) => {
        const angle = lngToAngle(cuspLng);
        const x1 = cx + coreR * Math.cos(angle);
        const y1 = cy + coreR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        const isAxis = i === 0 || i === 9; // ASC (House 1) or MC (House 10)
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isAxis ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.12)"}
            strokeWidth={isAxis ? 1.5 : 0.8}
            strokeDasharray={isAxis ? undefined : "3 3"}
          />
        );
      })}

      {/* Zodiac sign symbols in outer ring */}
      {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((sym, i) => {
        const signLng = i * 30 + 15; // center of sign
        const angle = lngToAngle(signLng);
        const r = (outerR + innerR) / 2;
        return (
          <text key={i} x={cx + r * Math.cos(angle)} y={cy + r * Math.sin(angle)}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="medium">
            {sym}
          </text>
        );
      })}

      {/* Planets */}
      {planets.slice(0, 10).map((planet, i) => {
        const angle = lngToAngle(planet.longitude);
        const r = innerR - 14 - (i % 3) * 11;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        return (
          <g key={planet.planet}>
            <circle cx={px} cy={py} r="9" fill="#1c1c1e" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
              fill={planet.isRetrograde ? '#ff9f0a' : '#ffffff'} fontSize="8" fontWeight="bold">
              {planet.symbol}
            </text>
          </g>
        );
      })}

      {/* Horizontal ASC Axis line (Left = ASC) */}
      <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy}
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x={cx - outerR + 6} y={cy - 5} fill="white" fontSize="8" fontWeight="bold">ASC</text>
      <text x={cx + outerR - 22} y={cy - 5} fill="rgba(255,255,255,0.5)" fontSize="7">DSC</text>

      {/* Center Label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">ASTRO.COM</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6">PRECISION</text>
    </svg>
  );
};

export const AstrologyChart: React.FC<AstrologyChartProps> = ({ settings, onSaveNatalChart }) => {
  const lang = settings.language;
  const initialChart = settings.natalChart || calculateNatalChart('1995-05-15', '08:30', 'São Paulo', -23.5505, -46.6333, -3, 'Placidus');

  const [birthDate, setBirthDate] = useState(initialChart.birthDate || '1995-05-15');
  const [birthTime, setBirthTime] = useState(initialChart.birthTime || '08:30');
  const [birthCity, setBirthCity] = useState(initialChart.birthCity || 'São Paulo');
  const [lat, setLat] = useState<number>(initialChart.lat ?? -23.5505);
  const [lng, setLng] = useState<number>(initialChart.lng ?? -46.6333);

  const browserOffset = -(new Date().getTimezoneOffset() / 60);
  const [utcOffset, setUtcOffset] = useState<number>(initialChart.utcOffset ?? browserOffset);
  const [houseSystem, setHouseSystem] = useState<'Placidus' | 'Equal' | 'WholeSign'>('Placidus');

  const [chart, setChart] = useState<NatalChart>(initialChart);
  const [activeTab, setActiveTab] = useState<Tab>('tropical');
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'gemini' | 'offline'>('offline');
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);

  const handleCityChange = (cityName: string) => {
    setBirthCity(cityName);
    const match = findCity(cityName);
    if (match) {
      setLat(match.lat);
      setLng(match.lng);
      setUtcOffset(match.defaultUtcOffset);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newChart = calculateNatalChart(birthDate, birthTime, birthCity, lat, lng, utcOffset, houseSystem);
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
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
          <span>{p.planet}</span>
          {p.isRetrograde && (
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              ℞ Retrógrado
            </span>
          )}
        </div>
        <div className="text-[11px] text-neutral-400 mt-0.5">
          {p.signSymbol} <strong className="text-neutral-200">{p.signPt}</strong> ({p.sign}) — {p.degree}°{String(p.minutes).padStart(2,'0')}'
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-medium text-neutral-300">Casa {p.house}</div>
      </div>
    </div>
  );

  const renderVedicRow = (p: PlanetPosition) => (
    <div key={p.planet}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">{p.planet}</div>
        <div className="text-[11px] text-neutral-400">
          {p.signSymbol} <strong className="text-neutral-200">{p.vedicSign}</strong> — {p.degree}°{String(p.minutes).padStart(2,'0')}'
        </div>
        {p.nakshatra && (
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Nakshatra: <span className="text-neutral-300">{p.nakshatra}</span> ({p.nakshatraRuler}) Pada {p.nakshatraPada}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-xs font-medium text-neutral-300">Casa {p.house}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Precisão Padrão Astro.com / Suíço
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Mapa Astral Completo
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl mt-1">
              Cálculo exato de Sol, Lua, 8 planetas, Ascendente, Casas ({houseSystem}) e Aspectos.
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

        {/* Big 3 Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {[
            { label: '☉ Sol', value: `${chart.sunSymbol} ${fullChart?.tropical[0]?.signPt || chart.sunSign}` },
            { label: '☽ Lua', value: `${chart.moonSymbol} ${fullChart?.tropical[1]?.signPt || chart.moonSign}` },
            { label: '↑ Ascendente', value: `${chart.risingSymbol} ${fullChart?.ascendantSignPt || chart.risingSign}` },
            ...(fullChart ? [{ label: 'MC (Meio do Céu)', value: `${fullChart.midheavenSymbol} ${fullChart.midheavenSignPt}` }] : []),
          ].map(b => (
            <div key={b.label} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1.5">{b.label}:</span>
              <span className="text-xs font-semibold text-white">{b.value}</span>
            </div>
          ))}
          {fullChart && (
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1.5">Ayanamsha:</span>
              <span className="text-xs font-semibold text-white">{fullChart.ayanamsha}°</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Reading Synthesis */}
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form + Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" /> Dados de Nascimento Exactos
            </h2>

            <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Data de Nascimento
                </label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Hora Local Exata (HH:MM)
                </label>
                <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Cidade de Nascimento</span>
                  <span className="text-[10px] text-neutral-500">Auto-coordenadas</span>
                </label>
                <input
                  type="text"
                  value={birthCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder="Ex: São Paulo, Lisboa, Rio..."
                  list="city-options"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                  required
                />
                <datalist id="city-options">
                  {CITIES_DATABASE.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium text-[11px]">Fuso UTC</label>
                  <input
                    type="number"
                    value={utcOffset}
                    step="0.5"
                    min="-12"
                    max="14"
                    onChange={(e) => setUtcOffset(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium text-[11px] flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Sistema Casas
                  </label>
                  <select
                    value={houseSystem}
                    onChange={(e) => setHouseSystem(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none text-xs"
                  >
                    <option value="Placidus">Placidus (Astro.com)</option>
                    <option value="Equal">Casas Iguais</option>
                    <option value="WholeSign">Whole Sign</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Latitude:</span> <strong className="text-neutral-200">{lat.toFixed(4)}°</strong>
                </div>
                <div className="flex justify-between">
                  <span>Longitude:</span> <strong className="text-neutral-200">{lng.toFixed(4)}°</strong>
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all mt-2 shadow-sm">
                Recalcular Mapa Astral
              </button>
            </form>
          </div>

          {/* Elements Distribution */}
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
        </div>

        {/* Right Wheel + Tabs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Wheel Visual */}
          {fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 text-center">
                Roda Zodiacal (Alinhamento Astro.com — ASC a Oeste/Esquerda)
              </h2>
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
                <ChartWheel planets={fullChart.tropical} ascendant={fullChart.ascendant} cusps={fullChart.houseCusps} />
              </div>
            </div>
          )}

          {/* Tab Selector */}
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Posições Planetárias (Tropical)</h3>
                </div>
                <span className="text-[11px] text-neutral-400">Sistema: {houseSystem}</span>
              </div>
              <div className="space-y-1.5">
                {fullChart.tropical.map(renderPlanetRow)}
              </div>
            </div>
          )}

          {/* Vedic Tab */}
          {activeTab === 'vedic' && fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕉️</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Jyotish — Zodíaco Védico (Sidéreo)</h3>
                    <p className="text-[10px] text-neutral-400">Ayanamsha Lahiri: {fullChart.ayanamsha}°</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {fullChart.vedic.map(renderVedicRow)}
              </div>
            </div>
          )}

          {/* Aspects Tab */}
          {activeTab === 'aspects' && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h3 className="text-sm font-bold text-white">Aspectos Astrológicos</h3>
                </div>
                <span className="text-xs text-neutral-400">{aspects.length} aspectos</span>
              </div>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
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
          {activeTab === 'houses' && fullChart && (
            <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Cúspides das 12 Casas ({houseSystem})</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOUSE_MEANINGS.map(({ house, meaning, area }, i) => {
                  const cuspLng = fullChart.houseCusps[i];
                  const houseData = chart.houses[i];
                  return (
                    <div key={house}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{house}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>{houseData?.symbol}</span>
                          <span>{houseData?.sign}</span>
                          <span className="text-[10px] text-neutral-400">({Math.floor(cuspLng % 30)}°)</span>
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

          {/* Big 3 Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Sol ☉', sign: fullChart?.tropical[0]?.signPt || chart.sunSign, symbol: chart.sunSymbol, desc: sunDesc },
              { label: 'Lua ☽', sign: fullChart?.tropical[1]?.signPt || chart.moonSign, symbol: chart.moonSymbol, desc: moonDesc },
              { label: 'Ascendente ↑', sign: fullChart?.ascendantSignPt || chart.risingSign, symbol: chart.risingSymbol, desc: risingDesc },
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
  { house: 'I (ASC)', area: 'Identidade', meaning: 'Aparência, personalidade e início de tudo.' },
  { house: 'II', area: 'Recursos', meaning: 'Finanças, valores pessoais e posses.' },
  { house: 'III', area: 'Comunicação', meaning: 'Mente, fala, irmãos e viagens curtas.' },
  { house: 'IV (IC)', area: 'Lar & Família', meaning: 'Raízes, infância, lar e vida privada.' },
  { house: 'V', area: 'Criatividade', meaning: 'Amor, prazer, filhos e expressão artística.' },
  { house: 'VI', area: 'Saúde & Trabalho', meaning: 'Rotinas, saúde, serviço diário.' },
  { house: 'VII (DSC)', area: 'Parcerias', meaning: 'Casamento, sociedades e relacionamentos.' },
  { house: 'VIII', area: 'Transformação', meaning: 'Morte, heranças, sexualidade e ocultismo.' },
  { house: 'IX', area: 'Expansão', meaning: 'Filosofia, viagens longas, religião e espiritualidade.' },
  { house: 'X (MC)', area: 'Carreira', meaning: 'Status, reputação e vida pública.' },
  { house: 'XI', area: 'Comunidade', meaning: 'Amizades, grupos, sonhos e objetivos futuros.' },
  { house: 'XII', area: 'Espiritualidade', meaning: 'Inconsciente, karma, recolhimento e transcendência.' },
];
