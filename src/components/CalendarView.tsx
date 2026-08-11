import React, { useState, useMemo } from 'react';
import type { UserSettings } from '../types';
import { t } from '../utils/i18n';
import { getMoonPhaseName, getMoonZodiacSign } from '../utils/astronomy';
import { getDayActivityGuide, type ActivityCategory } from '../utils/activityTiming';
import * as SunCalc from 'suncalc';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  settings: UserSettings;
  openDayDetails: (date: Date) => void;
}

const ACTIVITY_FILTERS: { id: ActivityCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Todas Atividades', emoji: '🌙' },
  { id: 'creativity', label: 'Criatividade', emoji: '🎨' },
  { id: 'beauty', label: 'Beleza', emoji: '✨' },
  { id: 'career', label: 'Carreira', emoji: '💼' },
  { id: 'love', label: 'Amor', emoji: '❤️' },
  { id: 'health', label: 'Saúde', emoji: '🌿' },
  { id: 'finances', label: 'Finanças', emoji: '💰' },
  { id: 'spiritual', label: 'Espiritual', emoji: '🔮' },
];

const RATING_DOT: Record<string, string> = {
  excellent: 'bg-green-400',
  good: 'bg-blue-400',
  neutral: 'bg-neutral-500',
  challenging: 'bg-red-400',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ settings, openDayDetails }) => {
  const lang = settings.language;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPhase, setFilterPhase] = useState<'all' | 'new' | 'quarter' | 'full'>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityCategory | 'all'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Pre-compute month data
  const monthData = useMemo(() => {
    const data: Array<{
      moon: { symbol: string; phaseCode: string; fractionPct: number };
      moonSign: string;
      moonSignSymbol: string;
      isVoidOfCourse: boolean;
      phaseName: string;
      activityGuide: ReturnType<typeof getDayActivityGuide>;
    }> = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const illum = SunCalc.getMoonIllumination(dateObj);
      const phaseInfo = getMoonPhaseName(illum.phase);
      const zodiac = getMoonZodiacSign(dateObj);
      const isVoc = zodiac.deg >= 27;

      let symbol = '🌑';
      if (phaseInfo.code === 'waxing_crescent') symbol = '🌒';
      else if (phaseInfo.code === 'first_quarter') symbol = '🌓';
      else if (phaseInfo.code === 'waxing_gibbous') symbol = '🌔';
      else if (phaseInfo.code === 'full') symbol = '🌕';
      else if (phaseInfo.code === 'waning_gibbous') symbol = '🌖';
      else if (phaseInfo.code === 'last_quarter') symbol = '🌗';
      else if (phaseInfo.code === 'waning_crescent') symbol = '🌘';

      const activityGuide = getDayActivityGuide(dateObj, phaseInfo.name, zodiac.name, zodiac.symbol, isVoc);

      data.push({
        moon: { symbol, phaseCode: phaseInfo.code, fractionPct: Math.round(illum.fraction * 100) },
        moonSign: zodiac.name,
        moonSignSymbol: zodiac.symbol,
        isVoidOfCourse: isVoc,
        phaseName: phaseInfo.name,
        activityGuide,
      });
    }

    return data;
  }, [year, month, daysInMonth]);

  const todayStr = new Date().toDateString();

  // Top days calculation
  const bestDays = useMemo(() => {
    if (activityFilter === 'all') return new Set<number>();
    const sorted = monthData
      .map((d, i) => {
        const act = d.activityGuide.activities.find(a => a.category === activityFilter);
        return { day: i + 1, score: act?.score ?? 0 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return new Set(sorted.map(s => s.day));
  }, [activityFilter, monthData]);

  return (
    <div className="space-y-5 animate-fadeIn max-w-5xl mx-auto">
      {/* Sleek Header & Controls */}
      <div className="bg-[#1c1c1e] rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/5 text-white border border-white/10">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
          >
            {t('todayButton', lang)}
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Filters Row */}
      <div className="bg-[#1c1c1e] rounded-2xl p-3 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-neutral-400 text-xs font-medium whitespace-nowrap mr-1">
            Filtro de Atividade:
          </span>
          {ACTIVITY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActivityFilter(f.id as ActivityCategory | 'all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                activityFilter === f.id
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white border-white/5'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
          <span className="text-neutral-400 text-xs font-medium whitespace-nowrap mr-1">
            Fase da Lua:
          </span>
          {[
            { id: 'all', label: t('filterAll', lang) },
            { id: 'new', label: t('filterNew', lang) },
            { id: 'quarter', label: t('filterQuarter', lang) },
            { id: 'full', label: t('filterFull', lang) },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterPhase(f.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                filterPhase === f.id
                  ? 'bg-white/15 text-white border-white/30 font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="py-2 bg-white/5 rounded-xl border border-white/5">
            {d}
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-white/2 opacity-10" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateObj = new Date(year, month, dayNum);
          const isToday = dateObj.toDateString() === todayStr;
          const dayData = monthData[idx];
          const moon = dayData.moon;
          const isBestDay = bestDays.has(dayNum);

          let isMatchFilter = true;
          if (filterPhase === 'new' && moon.phaseCode !== 'new') isMatchFilter = false;
          if (filterPhase === 'full' && moon.phaseCode !== 'full') isMatchFilter = false;
          if (filterPhase === 'quarter' && !moon.phaseCode.includes('quarter')) isMatchFilter = false;

          const actScore = activityFilter !== 'all'
            ? dayData.activityGuide.activities.find(a => a.category === activityFilter)
            : null;

          return (
            <div
              key={dayNum}
              onClick={() => openDayDetails(dateObj)}
              className={`h-20 sm:h-24 rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative border ${
                isToday
                  ? 'bg-white/10 border-white/40 ring-1 ring-white/30'
                  : isBestDay && activityFilter !== 'all'
                  ? 'bg-green-500/10 border-green-500/40 hover:border-green-500/60'
                  : isMatchFilter
                  ? 'bg-[#1c1c1e] hover:bg-white/10 border-white/10'
                  : 'bg-[#1c1c1e] opacity-25 hover:opacity-60 border-white/5'
              }`}
            >
              {/* Header inside cell */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-white text-black' : 'text-neutral-300'
                  }`}
                >
                  {dayNum}
                </span>

                {actScore && (
                  <div className={`w-2 h-2 rounded-full ${RATING_DOT[actScore.rating]}`} />
                )}

                {!actScore && (
                  <span className="text-[9px] text-neutral-500">
                    {moon.fractionPct}%
                  </span>
                )}
              </div>

              {/* Moon symbol */}
              <div className="flex items-center justify-center my-0.5">
                <span className="text-xl sm:text-2xl filter drop-shadow">
                  {moon.symbol}
                </span>
              </div>

              {/* Footer inside cell */}
              <div className="flex items-center justify-between text-[9px] text-neutral-400">
                <span>{dayData.moonSignSymbol}</span>
                {dayData.isVoidOfCourse && (
                  <span className="text-orange-400 font-bold">VoC</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simplified Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 px-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" /> Excelente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Bom
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-500" /> Neutro
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Desafiador
          </span>
        </div>
        <div className="text-orange-400 font-medium">
          VoC: Lua Vazia de Curso
        </div>
      </div>
    </div>
  );
};
