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
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <Sun className="w-3.5 h-3.5 text-white" /> Previsão Astrológica
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Horóscopo & Energia Celestial
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Orientações diárias alinhadas às fases da lua e signos zodiacais.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenerateHoroscope('offline')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-neutral-300" /> Motor Interno
            </button>

            <button
              onClick={() => handleGenerateHoroscope('gemini')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" /> Gemini 2.0 IA
                </>
              )}
            </button>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
            <span className="text-xl">{reading.symbol}</span>
            <span className="text-white font-medium">{reading.sign} ({reading.dates})</span>
          </div>
        </div>
      </div>

      {/* Segmented Sign Selector */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 bg-[#1c1c1e] p-2 rounded-2xl border border-white/10">
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
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{r.symbol}</span>
              <span className="text-[10px] mt-0.5">{sign}</span>
            </button>
          );
        })}
      </div>

      {/* AI Reading Container */}
      {aiReading && (
        <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" /> Leitura Sintetizada para {selectedSign}
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

      {/* Standard Reading Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Previsão Diária para {reading.sign}
            </h2>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white font-medium">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
              <span>{reading.energyScore}/10 Energia</span>
            </div>
          </div>

          <p className="text-sm text-neutral-200 leading-relaxed bg-black/40 p-5 rounded-2xl border border-white/5">
            "{reading.prediction}"
          </p>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs">
            <Compass className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                {t('dailyAdvice', lang)}
              </div>
              <div className="text-neutral-300 mt-1">
                {reading.dailyAdvice}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-400">{t('luckyColor', lang)}</div>
              <div className="text-sm font-semibold text-white">{reading.luckyColor}</div>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-400">{t('luckyNumber', lang)}</div>
              <div className="text-lg font-bold text-white">{reading.luckyNumber}</div>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-400">{t('compatibility', lang)}</div>
              <div className="text-sm font-semibold text-white">{reading.compatibility}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
