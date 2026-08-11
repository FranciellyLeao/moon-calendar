import React from 'react';
import type { UserSettings } from '../types';
import { getAstronomyData, getMoonZodiacSign } from '../utils/astronomy';
import { getDayActivityGuide } from '../utils/activityTiming';
import { Moon, Sunrise, Sunset, X, Zap } from 'lucide-react';

interface DayDetailsModalProps {
  date: Date | null;
  settings: UserSettings;
  onClose: () => void;
}

const PHASE_NAMES_PT: Record<string, string> = {
  'New Moon':        'Lua Nova',
  'Waxing Crescent': 'Lua Crescente',
  'First Quarter':   'Quarto Crescente',
  'Waxing Gibbous':  'Gibosa Crescente',
  'Full Moon':       'Lua Cheia',
  'Waning Gibbous':  'Gibosa Minguante',
  'Last Quarter':    'Quarto Minguante',
  'Waning Crescent': 'Lua Minguante',
};

const RATING_STYLE: Record<string, string> = {
  excellent: 'bg-green-500/15 border-green-500/30 text-green-300',
  good:      'bg-blue-500/15 border-blue-500/20 text-blue-300',
  neutral:   'bg-white/5 border-white/10 text-neutral-300',
  challenging: 'bg-red-500/10 border-red-500/20 text-red-300',
};

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ date, settings, onClose }) => {
  if (!date) return null;

  const astroData  = getAstronomyData(date, settings.location.lat, settings.location.lng);
  const zodiacInfo = getMoonZodiacSign(date);
  const guide = getDayActivityGuide(
    date,
    astroData.phaseName,
    zodiacInfo.name,
    zodiacInfo.symbol,
    astroData.isVoidOfCourse
  );

  const phasePt = PHASE_NAMES_PT[astroData.phaseName] || astroData.phaseName;
  const top4    = guide.activities.slice(0, 4);

  const MOON_EMOJI: Record<string, string> = {
    new: '🌑', waxing_crescent: '🌒', first_quarter: '🌓', waxing_gibbous: '🌔',
    full: '🌕', waning_gibbous: '🌖', last_quarter: '🌗', waning_crescent: '🌘',
  };
  const moonEmoji = MOON_EMOJI[astroData.phaseCode] || '🌙';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1c1c1e] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 w-full sm:max-w-lg space-y-5 border border-white/10 relative max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{moonEmoji}</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {phasePt} · {astroData.illumination}% iluminada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lunar Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 p-3 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-neutral-400">Signo da Lua</div>
              <div className="text-sm font-bold text-white mt-0.5">{zodiacInfo.symbol} {zodiacInfo.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-neutral-400">Regente do Dia</div>
              <div className="text-sm font-bold text-white mt-0.5">{guide.planetaryDayRuler}</div>
            </div>
          </div>

          {[
            { icon: <Moon className="w-3.5 h-3.5 text-white" />, label: 'Nascer da Lua', val: astroData.moonrise },
            { icon: <Moon className="w-3.5 h-3.5 text-neutral-400" />, label: 'Pôr da Lua', val: astroData.moonset },
            { icon: <Sunrise className="w-3.5 h-3.5 text-amber-300" />, label: 'Nascer do Sol', val: astroData.sunrise },
            { icon: <Sunset className="w-3.5 h-3.5 text-orange-400" />, label: 'Pôr do Sol', val: astroData.sunset },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-neutral-400 flex items-center gap-1 text-[11px]">{item.icon} {item.label}</div>
              <div className="text-sm font-semibold text-white">{item.val}</div>
            </div>
          ))}
        </div>

        {/* Void of Course warning */}
        {astroData.isVoidOfCourse && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-xs text-orange-200">
            <span className="text-base">⚠️</span>
            <div>
              <span className="font-semibold block">Lua Vazia de Curso (VoC)</span>
              <span className="text-orange-300 opacity-80">Evite começar projetos novos, assinar contratos ou tomar decisões importantes hoje.</span>
            </div>
          </div>
        )}

        {/* Energy bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-white" /> Energia Geral do Dia
            </span>
            <span className="font-bold text-white">{guide.overallEnergy}% · {guide.overallLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${guide.overallEnergy}%` }}
            />
          </div>
        </div>

        {/* Activity Guide */}
        <div>
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-2">
            🎯 Melhores Atividades
          </div>
          <div className="grid grid-cols-2 gap-2">
            {top4.map(act => (
              <div key={act.category}
                className={`p-3 rounded-xl border flex items-start gap-2 ${RATING_STYLE[act.rating]}`}>
                <span className="text-base leading-none">{act.emoji}</span>
                <div>
                  <div className="text-xs font-semibold">{act.labelPt}</div>
                  {act.bestTime && (
                    <div className="text-[10px] opacity-70 mt-0.5">🕐 {act.bestTime}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {top4[0]?.tip && (
            <p className="text-[11px] text-neutral-400 leading-relaxed mt-2 px-1">
              💡 {top4[0].tip}
            </p>
          )}
        </div>

        {/* Extra data */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Idade Lunar</span>
            <span className="font-semibold text-white">{astroData.lunarAge} dias</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Distância da Terra</span>
            <span className="font-semibold text-white">{astroData.distanceKm.toLocaleString('pt-BR')} km</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Lua Vazia de Curso</span>
            <span className={`font-semibold ${astroData.isVoidOfCourse ? 'text-orange-400' : 'text-green-400'}`}>
              {astroData.isVoidOfCourse ? '⚠️ Sim' : '✅ Não'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
