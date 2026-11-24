import React, { useState, useMemo } from 'react';
import type { UserSettings } from '../types';
import { t } from '../utils/i18n';
import { getMoonPhaseName, getMoonZodiacSign } from '../utils/astronomy';
import { getDayActivityGuide, type ActivityCategory } from '../utils/activityTiming';
import { calcFullVedicBiorhythm } from '../utils/vedicBiorhythm';
import * as SunCalc from 'suncalc';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [showVedicBiorhythm, setShowVedicBiorhythm] = useState<boolean>(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const birthDate = new Date(settings.natalChart?.birthDate || '1995-05-15');

  // Pre-compute month data
  const monthData = useMemo(() => {
    const data: Array<{
      moon: { symbol: string; phaseCode: string; fractionPct: number };
      moonSign: string;
      moonSignSymbol: string;
      isVoidOfCourse: boolean;
      phaseName: string;
      activityGuide: ReturnType<typeof getDayActivityGuide>;
      vedicBio: ReturnType<typeof calcFullVedicBiorhythm>;
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
      const vedicBio = calcFullVedicBiorhythm(birthDate, dateObj, illum.fraction * 360);

      data.push({
        moon: { symbol, phaseCode: phaseInfo.code, fractionPct: Math.round(illum.fraction * 100) },
        moonSign: zodiac.name,
        moonSignSymbol: zodiac.symbol,
        isVoidOfCourse: isVoc,
        phaseName: phaseInfo.name,
        activityGuide,
        vedicBio,
      });
    }

    return data;
  }, [year, month, daysInMonth, birthDate]);

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
    <div className="space-y-5 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Sleek Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06] pt-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.04] text-[#E6CA65] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
            {currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVedicBiorhythm(!showVedicBiorhythm)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showVedicBiorhythm
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/35 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Biorritmo Védico</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium transition-all"
          >
            {t('todayButton', lang)}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Clean Filters Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3 pb-4 border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-neutral-400 text-xs font-medium whitespace-nowrap mr-1">
            Filtro de Atividade:
          </span>
          {ACTIVITY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActivityFilter(f.id as ActivityCategory | 'all')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activityFilter === f.id
                  ? 'bg-gradient-to-r from-[#fbe396] to-[#e5c158] text-[#15111b] font-bold shadow-md'
                  : 'bg-white/[0.04] text-neutral-300 hover:text-white'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
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
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterPhase === f.id
                  ? 'bg-white/20 text-white font-semibold'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400 py-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-white/[0.01] opacity-10" />
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

          const taraBala = dayData.vedicBio.taraBala;

          return (
            <motion.div
              key={dayNum}
              onClick={() => openDayDetails(dateObj)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`h-20 sm:h-24 rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative border ${
                isToday
                  ? 'bg-amber-300/15 border-amber-300/50 ring-1 ring-amber-300/30'
                  : isBestDay && activityFilter !== 'all'
                  ? 'bg-green-500/10 border-green-500/40 hover:border-green-500/60'
                  : isMatchFilter
                  ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.05]'
                  : 'bg-white/[0.01] opacity-25 hover:opacity-60 border-white/[0.02]'
              }`}
            >
              {/* Header inside cell */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-amber-300 text-[#15111b]' : 'text-neutral-300'
                  }`}
                >
                  {dayNum}
                </span>

                {showVedicBiorhythm ? (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      taraBala.type === 'favorable'
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : taraBala.type === 'challenging'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {taraBala.name.split(' ')[0]}
                  </span>
                ) : actScore ? (
                  <div className={`w-2 h-2 rounded-full ${RATING_DOT[actScore.rating]}`} />
                ) : (
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
                {dayData.isVoidOfCourse ? (
                  <span className="text-orange-400 font-bold">VoC</span>
                ) : (
                  <span className="text-[9px] text-amber-200/80 font-semibold">{dayData.vedicBio.biorhythmScores.overallScore}%</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 px-2 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Tara Bala Favorável
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Tara Bala Cautela
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-400" /> Neutro
          </span>
        </div>
        <div className="text-amber-300 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" /> Clique no dia para abrir o relatório completo de Biorritmo Védico
        </div>
      </div>
    </div>
  );
};
