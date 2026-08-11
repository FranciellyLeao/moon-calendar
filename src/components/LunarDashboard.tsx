import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { getDayActivityGuide } from '../utils/activityTiming';
import { getMoonZodiacSign } from '../utils/astronomy';
import {
  Moon,
  Sunset,
  Sunrise,
  Compass,
  Sparkles,
  AlertCircle,
  Eye,
  BookOpen,
  Sun,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LunarDashboardProps {
  astroData: AstronomyData;
  settings: UserSettings;
  setActiveTab: (tab: string) => void;
  openDayDetails: (date: Date) => void;
}

const PHASE_NAMES_PT: Record<string, string> = {
  'New Moon': 'Lua Nova',
  'Waxing Crescent': 'Lua Crescente',
  'First Quarter': 'Quarto Crescente',
  'Waxing Gibbous': 'Gibosa Crescente',
  'Full Moon': 'Lua Cheia',
  'Waning Gibbous': 'Gibosa Minguante',
  'Last Quarter': 'Quarto Minguante',
  'Waning Crescent': 'Lua Minguante',
};

const MOON_EMOJIS: Record<string, string> = {
  new: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
};

export const LunarDashboard: React.FC<LunarDashboardProps> = ({
  astroData,
  settings,
  setActiveTab,
  openDayDetails,
}) => {
  const now = new Date();
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const phaseCode = astroData.phaseCode;
  const phasePt = PHASE_NAMES_PT[astroData.phaseName] || astroData.phaseName;
  const moonEmoji = MOON_EMOJIS[phaseCode] || '🌙';

  const zodiac = getMoonZodiacSign(now);
  const guide = getDayActivityGuide(
    now,
    astroData.phaseName,
    zodiac.name,
    zodiac.symbol,
    astroData.isVoidOfCourse
  );
  const top3 = guide.activities.slice(0, 3);
  const userSign = settings.natalChart?.sunSign;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Sleek Hero Card */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Moon Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => openDayDetails(now)}
            >
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full relative overflow-hidden border border-white/20 flex items-center justify-center bg-black shadow-2xl">
                <div
                  className="absolute inset-0 rounded-full opacity-90"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 35% 35%, #ffffff 0%, #a1a1a6 50%, #1c1c1e 90%)',
                  }}
                />
                <div className="absolute inset-0 rounded-full mix-blend-overlay opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
                <div
                  className="absolute inset-0 rounded-full transition-all duration-700"
                  style={{
                    background:
                      phaseCode === 'new'
                        ? 'rgba(0,0,0,0.96)'
                        : phaseCode === 'full'
                        ? 'transparent'
                        : phaseCode.includes('waxing')
                        ? `linear-gradient(90deg, rgba(0,0,0,0.95) ${Math.max(
                            0,
                            100 - astroData.illumination
                          )}%, transparent 100%)`
                        : `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.95) ${Math.min(
                            100,
                            astroData.illumination
                          )}%)`,
                  }}
                />
                <div className="absolute bottom-3 px-3 py-0.5 rounded-full bg-black/80 border border-white/20 text-white text-[11px] font-medium backdrop-blur-md">
                  {astroData.illumination}% iluminada
                </div>
              </div>
              <div className="absolute -top-1 -right-1 text-2xl group-hover:scale-110 transition-transform">
                {moonEmoji}
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-white tracking-tight">
              {phasePt}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Idade Lunar: <span className="text-white font-medium">{astroData.lunarAge}d</span> (ciclo 29,5d)
            </p>
          </div>

          {/* Core Info & Actions */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 text-neutral-300">
                <span className="text-white">{astroData.zodiacSymbol}</span>
                <span>
                  Lua em{' '}
                  <strong className="text-white font-semibold">
                    {astroData.zodiacSign}
                  </strong>
                </span>
              </div>

              {astroData.isVoidOfCourse ? (
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Lua Vazia de Curso</span>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-300">
                  ✅ Lua Ativa
                </div>
              )}

              {userSign && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
                  ☉ Sol: <strong className="text-white">{userSign}</strong>
                </div>
              )}
            </div>

            {/* Clean Countdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Próxima Cheia</span>
                  <Moon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {astroData.nextFullMoon.date}
                </div>
                <div className="text-[10px] text-neutral-500">
                  em ~{astroData.nextFullMoon.daysLeft} dias
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Próxima Nova</span>
                  <Moon className="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {astroData.nextNewMoon.date}
                </div>
                <div className="text-[10px] text-neutral-500">
                  em ~{astroData.nextNewMoon.daysLeft} dias
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('journal')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" /> Diário
              </button>

              <button
                onClick={() => setActiveTab('astrology')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" /> Mapa Astral
              </button>

              <button
                onClick={() => openDayDetails(now)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-300" /> Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Energy & Activity Summary Card */}
      <div className="bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white">Energia do Dia</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${guide.overallEnergy}%` }}
              />
            </div>
            <span className="text-xs text-white font-bold">{guide.overallEnergy}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {top3.map((act) => (
            <div
              key={act.category}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8"
            >
              <span className="text-2xl">{act.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {act.labelPt}
                </div>
                {act.bestTime && (
                  <div className="text-[10px] text-neutral-400">
                    🕐 {act.bestTime}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-green-400">
                {act.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Collapsible Specs */}
      <div className="bg-[#1c1c1e] rounded-3xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowFullSpecs(!showFullSpecs)}
          className="w-full p-4 flex items-center justify-between text-xs font-medium text-neutral-300 hover:text-white transition-all"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Compass className="w-4 h-4 text-neutral-400" />
            Horários Sol/Lua & Dados Astronômicos Avançados
          </span>
          {showFullSpecs ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {showFullSpecs && (
          <div className="p-4 pt-0 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fadeIn">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                <Moon className="w-3 h-3 text-white" /> Nascer Lua
              </span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.moonrise}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                <Moon className="w-3 h-3 text-neutral-400" /> Pôr Lua
              </span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.moonset}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                <Sunrise className="w-3 h-3 text-amber-300" /> Nascer Sol
              </span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.sunrise}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                <Sunset className="w-3 h-3 text-orange-400" /> Pôr Sol
              </span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.sunset}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px]">Distância</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.distanceKm.toLocaleString('pt-BR')} km
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-neutral-400 text-[11px]">Altitude / Azimute</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.altitudeDeg}° / {astroData.azimuthDeg}°
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 col-span-2">
              <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-300" /> Hora Dourada & Azul
              </span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {astroData.goldenHour} / {astroData.blueHour}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
