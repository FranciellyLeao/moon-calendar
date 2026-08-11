import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { t } from '../utils/i18n';
import { getMoonPhaseName } from '../utils/astronomy';
import * as SunCalc from 'suncalc';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';

interface CalendarViewProps {
  settings: UserSettings;
  openDayDetails: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ settings, openDayDetails }) => {
  const lang = settings.language;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPhase, setFilterPhase] = useState<'all' | 'new' | 'quarter' | 'full'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderMoonIcon = (dateObj: Date) => {
    const illum = SunCalc.getMoonIllumination(dateObj);
    const phaseInfo = getMoonPhaseName(illum.phase);

    let symbol = '🌑';
    if (phaseInfo.code === 'waxing_crescent') symbol = '🌒';
    else if (phaseInfo.code === 'first_quarter') symbol = '🌓';
    else if (phaseInfo.code === 'waxing_gibbous') symbol = '🌔';
    else if (phaseInfo.code === 'full') symbol = '🌕';
    else if (phaseInfo.code === 'waning_gibbous') symbol = '🌖';
    else if (phaseInfo.code === 'last_quarter') symbol = '🌗';
    else if (phaseInfo.code === 'waning_crescent') symbol = '🌘';

    return { symbol, phaseCode: phaseInfo.code, fractionPct: Math.round(illum.fraction * 100) };
  };

  const todayStr = new Date().toDateString();

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Controls */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900/60 text-amber-300 border border-white/5">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-xl glass-panel hover:bg-white/5 text-amber-300 text-xs font-medium border border-amber-400/20"
          >
            {t('todayButton', lang)}
          </button>

          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl glass-panel hover:bg-white/5 text-slate-300 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl glass-panel hover:bg-white/5 text-slate-300 border border-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>
        {[
          { id: 'all', label: t('filterAll', lang) },
          { id: 'new', label: t('filterNew', lang) },
          { id: 'quarter', label: t('filterQuarter', lang) },
          { id: 'full', label: t('filterFull', lang) },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterPhase(f.id as any)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              filterPhase === f.id
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'glass-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="py-1.5 glass-panel rounded-lg">
            {d}
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-slate-950/20 opacity-20" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateObj = new Date(year, month, dayNum);
          const isToday = dateObj.toDateString() === todayStr;
          const moon = renderMoonIcon(dateObj);

          let isMatchFilter = true;
          if (filterPhase === 'new' && moon.phaseCode !== 'new') isMatchFilter = false;
          if (filterPhase === 'full' && moon.phaseCode !== 'full') isMatchFilter = false;
          if (filterPhase === 'quarter' && !moon.phaseCode.includes('quarter')) isMatchFilter = false;

          return (
            <div
              key={dayNum}
              onClick={() => openDayDetails(dateObj)}
              className={`h-20 sm:h-24 rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative group border ${
                isToday
                  ? 'glass-panel-gold border-amber-400/50'
                  : isMatchFilter
                  ? 'glass-panel hover:border-amber-400/30'
                  : 'glass-panel opacity-30 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  {moon.fractionPct}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-0.5">
                <span className="text-xl sm:text-2xl filter drop-shadow group-hover:scale-105 transition-transform">
                  {moon.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400">
                <span className="truncate max-w-[55px]">
                  {moon.phaseCode.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
