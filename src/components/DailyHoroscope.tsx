import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { ZODIAC_READINGS } from '../utils/horoscopes';
import { t } from '../utils/i18n';
import { generateAIHoroscope } from '../utils/gemini';
import { generateOfflineHoroscope } from '../utils/astrologyEngine';
import { Sun, Star, Heart, Compass, Sparkles, Palette, Hash, Bot, Loader2, Cpu } from 'lucide-react';

interface DailyHoroscopeProps {
  settings: UserSettings;
  astroData: AstronomyData;
  openSettingsModal?: () => void;
}

export const DailyHoroscope: React.FC<DailyHoroscopeProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const userSunSign = settings.natalChart?.sunSign || 'Taurus';
  const [selectedSign, setSelectedSign] = useState<string>(userSunSign);

  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'gemini' | 'offline'>('offline');

  const reading = ZODIAC_READINGS[selectedSign] || ZODIAC_READINGS['Taurus'];
  const signList = Object.keys(ZODIAC_READINGS);

  const handleGenerateHoroscope = async (mode: 'gemini' | 'offline') => {
    setIsGeneratingAI(true);
    setEngineType(mode);
    try {
      if (mode === 'gemini') {
        const text = await generateAIHoroscope(selectedSign, settings.natalChart, astroData, lang);
        setAiReading(text);
      } else {
        const text = generateOfflineHoroscope(selectedSign, settings.natalChart, astroData);
        setAiReading(text);
      }
    } catch {
      const text = generateOfflineHoroscope(selectedSign, settings.natalChart, astroData);
      setAiReading(text);
      setEngineType('offline');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pt-2 pb-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[#E6CA65] text-xs font-medium mb-2">
            <Sun className="w-3.5 h-3.5 text-[#E6CA65]" /> Previsão Astrológica
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Horóscopo & Energia Celestial
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mt-1">
            Orientações diárias alinhadas às fases da lua e signos zodiacais.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenerateHoroscope('offline')}
              disabled={isGeneratingAI}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-medium text-xs transition-all flex items-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-neutral-400" /> Motor Interno
            </button>

            <button
              onClick={() => handleGenerateHoroscope('gemini')}
              disabled={isGeneratingAI}
              className="px-4 py-1.5 rounded-full bg-[#E6CA65] hover:bg-[#ebd57e] text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> Gerando...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-black" /> Gemini 2.0 IA
                </>
              )}
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-xs font-medium text-[#E6CA65]">
            <span className="text-base">{reading.symbol}</span>
            <span>{reading.sign} ({reading.dates})</span>
          </div>
        </div>
      </div>

      {/* Segmented Sign Selector */}
      <div className="flex items-center p-1 rounded-full bg-white/[0.03] backdrop-blur-xl overflow-x-auto no-scrollbar gap-1">
        {signList.map((sign) => {
          const r = ZODIAC_READINGS[sign];
          const isSelected = selectedSign === sign;
          return (
            <button
              key={sign}
              onClick={() => {
                setSelectedSign(sign);
                setAiReading(null);
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-base">{r.symbol}</span>
              <span>{sign}</span>
            </button>
          );
        })}
      </div>

      {/* AI Reading Container */}
      {aiReading && (
        <div className="space-y-3 pb-6 border-b border-white/[0.06] animate-fadeIn">
          <div className="flex items-center justify-between text-white font-medium text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E6CA65]" /> Leitura Sintetizada para {selectedSign}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-neutral-400 font-mono">
              {engineType === 'gemini' ? 'Gemini IA' : 'Motor Interno'}
            </span>
          </div>

          <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-[#E6CA65]/40 py-1">
            {aiReading}
          </div>
        </div>
      )}

      {/* Standard Reading Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-white flex items-center gap-2">
              Previsão Diária para <strong className="font-semibold text-[#E6CA65]">{reading.sign}</strong>
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-xs text-[#E6CA65] font-medium">
              <Star className="w-3.5 h-3.5 text-[#E6CA65] fill-[#E6CA65]" />
              <span>{reading.energyScore}/10 Energia</span>
            </div>
          </div>

          <div className="pl-4 border-l-2 border-[#E6CA65]/50 py-1">
            <p className="text-base sm:text-lg font-light text-neutral-200 italic leading-relaxed">
              "{reading.prediction}"
            </p>
          </div>

          <div className="pt-2 flex items-start gap-3 text-xs sm:text-sm text-neutral-400">
            <Compass className="w-4 h-4 text-[#E6CA65] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                {t('dailyAdvice', lang)}
              </div>
              <div className="text-neutral-300 mt-1 leading-relaxed">
                {reading.dailyAdvice}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column - Clean Typographic Stats Row / Grid */}
        <div className="lg:col-span-4 space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-white/[0.06] lg:pl-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[#E6CA65]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{t('luckyColor', lang)}</div>
              <div className="text-sm font-medium text-white">{reading.luckyColor}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[#E6CA65]">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{t('luckyNumber', lang)}</div>
              <div className="text-base font-semibold text-white font-mono">{reading.luckyNumber}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[#E6CA65]">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{t('compatibility', lang)}</div>
              <div className="text-sm font-medium text-white">{reading.compatibility}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
