import React, { useState } from 'react';
import type { NatalChart, UserSettings } from '../types';
import { calculateNatalChart, SIGN_DESCRIPTIONS } from '../utils/astrology';
import { t } from '../utils/i18n';
import { generateAINatalChartReading } from '../utils/gemini';
import { generateOfflineNatalReading } from '../utils/astrologyEngine';
import { Sparkles, Calendar, Clock, MapPin, Compass, Flame, Mountain, Wind, Droplets, Bot, Loader2, Cpu } from 'lucide-react';

interface AstrologyChartProps {
  settings: UserSettings;
  onSaveNatalChart: (chart: NatalChart) => void;
}

export const AstrologyChart: React.FC<AstrologyChartProps> = ({ settings, onSaveNatalChart }) => {
  const lang = settings.language;
  const initialChart = settings.natalChart || calculateNatalChart('1995-05-15', '08:30', 'São Paulo');

  const [birthDate, setBirthDate] = useState(initialChart.birthDate || '1995-05-15');
  const [birthTime, setBirthTime] = useState(initialChart.birthTime || '08:30');
  const [birthCity, setBirthCity] = useState(initialChart.birthCity || 'São Paulo');
  const [chart, setChart] = useState<NatalChart>(initialChart);

  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'gemini' | 'offline'>('offline');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newChart = calculateNatalChart(birthDate, birthTime, birthCity);
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white" /> Mapa Astral Personalizado
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t('natalChartTitle', lang)}
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            {t('natalChartSubtitle', lang)}
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-3">
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analisando Mapa...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" /> Gemini 2.0 IA
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-neutral-400 mr-1">{t('sunSign', lang)}:</span>
              <span className="text-xs font-semibold text-white">
                {chart.sunSymbol} {chart.sunSign}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-neutral-400 mr-1">{t('moonSign', lang)}:</span>
              <span className="text-xs font-semibold text-white">
                {chart.moonSymbol} {chart.moonSign}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[11px] text-neutral-400 mr-1">{t('risingSign', lang)}:</span>
              <span className="text-xs font-semibold text-white">
                {chart.risingSymbol} {chart.risingSign}
              </span>
            </div>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-white" />
            Dados de Nascimento
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" /> {t('birthDate', lang)}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" /> {t('birthTime', lang)}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {t('birthCity', lang)}
              </label>
              <input
                type="text"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                placeholder="Ex: São Paulo..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all mt-4"
            >
              {t('calculateChart', lang)}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {t('elements', lang)}
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-white" /> {t('fire', lang)}
                  </span>
                  <span>{chart.elements.fire}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${chart.elements.fire}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-white" /> {t('earth', lang)}
                  </span>
                  <span>{chart.elements.earth}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black overflow-hidden">
                  <div className="h-full bg-white/80" style={{ width: `${chart.elements.earth}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-white" /> {t('air', lang)}
                  </span>
                  <span>{chart.elements.air}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black overflow-hidden">
                  <div className="h-full bg-white/60" style={{ width: `${chart.elements.air}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-white" /> {t('water', lang)}
                  </span>
                  <span>{chart.elements.water}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black overflow-hidden">
                  <div className="h-full bg-white/40" style={{ width: `${chart.elements.water}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              {t('astralWheelTitle', lang)}
            </h2>

            <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-2">
              <svg viewBox="0 0 300 300" className="w-full h-full">
                <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
                <circle cx="150" cy="150" r="115" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                <circle cx="150" cy="150" r="70" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="25" fill="#000000" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />

                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 150 + 25 * Math.cos(angle);
                  const y1 = 150 + 25 * Math.sin(angle);
                  const x2 = 150 + 140 * Math.cos(angle);
                  const y2 = 150 + 140 * Math.sin(angle);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                  );
                })}

                <circle cx="150" cy="50" r="8" fill="#ffffff" />
                <text x="150" y="53" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">☉</text>

                <circle cx="230" cy="180" r="8" fill="#a1a1a6" />
                <text x="230" y="183" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">☽</text>

                <line x1="10" y1="150" x2="290" y2="150" stroke="#ffffff" strokeWidth="1.5" />
                <text x="25" y="142" fill="#ffffff" fontSize="10" fontWeight="bold">ASC</text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 space-y-1">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">{t('sunSign', lang)}</div>
              <div className="text-base font-bold text-white">{chart.sunSymbol} {chart.sunSign}</div>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                {lang === 'pt-BR' ? sunDesc.pt : sunDesc.en}
              </p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 space-y-1">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">{t('moonSign', lang)}</div>
              <div className="text-base font-bold text-white">{chart.moonSymbol} {chart.moonSign}</div>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                {lang === 'pt-BR' ? moonDesc.pt : moonDesc.en}
              </p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 space-y-1">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">{t('risingSign', lang)}</div>
              <div className="text-base font-bold text-white">{chart.risingSymbol} {chart.risingSign}</div>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                {lang === 'pt-BR' ? risingDesc.pt : risingDesc.en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
