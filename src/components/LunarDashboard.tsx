import React from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { t } from '../utils/i18n';
import {
  Moon,
  Sunset,
  Sunrise,
  Compass,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Eye,
  BookOpen,
  Sun,
} from 'lucide-react';

interface LunarDashboardProps {
  astroData: AstronomyData;
  settings: UserSettings;
  setActiveTab: (tab: string) => void;
  openDayDetails: (date: Date) => void;
}

export const LunarDashboard: React.FC<LunarDashboardProps> = ({
  astroData,
  settings,
  setActiveTab,
  openDayDetails,
}) => {
  const lang = settings.language;
  const now = new Date();
  const phaseCode = astroData.phaseCode;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Apple HIG Hero Card */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Moon Render */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative group cursor-pointer" onClick={() => openDayDetails(now)}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative overflow-hidden border border-white/20 flex items-center justify-center bg-black">
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
                        ? 'rgba(0, 0, 0, 0.96)'
                        : phaseCode === 'full'
                        ? 'transparent'
                        : phaseCode.includes('waxing')
                        ? `linear-gradient(90deg, rgba(0,0,0,0.95) ${Math.max(0, 100 - astroData.illumination)}%, transparent 100%)`
                        : `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.95) ${Math.min(100, astroData.illumination)}%)`,
                  }}
                />

                <div className="absolute bottom-3 px-3 py-0.5 rounded-full bg-black/80 border border-white/20 text-white text-[11px] font-medium backdrop-blur-md">
                  {astroData.illumination}% Illumination
                </div>
              </div>
            </div>

            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t(astroData.phaseName, lang)}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {t('lunarAge', lang)}: <span className="text-white font-medium">{astroData.lunarAge}</span> {t('days', lang)} (29.5d)
            </p>
          </div>

          {/* Right Specs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 text-neutral-300">
                <span className="text-white">{astroData.zodiacSymbol}</span>
                <span>{t('zodiacSign', lang)}: <strong className="text-white font-medium">{astroData.zodiacSign}</strong></span>
              </div>

              {astroData.isVoidOfCourse ? (
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Void of Course Active</span>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-400">
                  VoC: Normal
                </div>
              )}
            </div>

            {/* Next Countdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{t('nextFullMoon', lang)}</span>
                  <Moon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {astroData.nextFullMoon.date}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  In ~{astroData.nextFullMoon.daysLeft} days
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{t('nextNewMoon', lang)}</span>
                  <Moon className="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {astroData.nextNewMoon.date}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  In ~{astroData.nextNewMoon.daysLeft} days
                </div>
              </div>
            </div>

            {/* Celestial Timing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                  <Moon className="w-3 h-3 text-white" /> {t('moonrise', lang)}
                </span>
                <span className="text-sm font-semibold text-white mt-1">{astroData.moonrise}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                  <Moon className="w-3 h-3 text-neutral-400" /> {t('moonset', lang)}
                </span>
                <span className="text-sm font-semibold text-white mt-1">{astroData.moonset}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                  <Sunrise className="w-3 h-3 text-amber-300" /> {t('sunrise', lang)}
                </span>
                <span className="text-sm font-semibold text-white mt-1">{astroData.sunrise}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                  <Sunset className="w-3 h-3 text-orange-400" /> {t('sunset', lang)}
                </span>
                <span className="text-sm font-semibold text-white mt-1">{astroData.sunset}</span>
              </div>
            </div>

            {/* Apple HIG Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('journal')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t('newEntry', lang)}
              </button>

              <button
                onClick={() => setActiveTab('astrology')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                {t('tabAstrology', lang)}
              </button>

              <button
                onClick={() => openDayDetails(now)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-300" />
                {t('dayDetails', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">{t('distance', lang)}</div>
            <div className="text-base font-semibold text-white">
              {astroData.distanceKm.toLocaleString()} km
            </div>
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Altitude & Azimuth</div>
            <div className="text-base font-semibold text-white">
              {astroData.altitudeDeg}° / {astroData.azimuthDeg}°
            </div>
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">{t('goldenHour', lang)} & Blue Hour</div>
            <div className="text-sm font-semibold text-white">
              {astroData.goldenHour} / {astroData.blueHour}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
