import React from 'react';
import type { UserSettings } from '../types';
import { getAstronomyData } from '../utils/astronomy';
import { t } from '../utils/i18n';
import { Moon, Sunrise, Sunset, X } from 'lucide-react';

interface DayDetailsModalProps {
  date: Date | null;
  settings: UserSettings;
  onClose: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ date, settings, onClose }) => {
  if (!date) return null;

  const lang = settings.language;
  const astroData = getAstronomyData(date, settings.location.lat, settings.location.lng);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-white/10 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Moon className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold">
              {date.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-center space-y-2">
          <div className="text-xs text-neutral-400 font-medium">Fase Lunar no Dia</div>
          <div className="text-xl font-bold text-white">
            {t(astroData.phaseName, lang)} ({astroData.illumination}%)
          </div>
          <div className="text-xs text-neutral-400">
            Signo da Lua: <strong className="text-white">{astroData.zodiacSymbol} {astroData.zodiacSign}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-neutral-400 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-white" /> {t('moonrise', lang)}
            </div>
            <div className="text-sm font-semibold text-white">{astroData.moonrise}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-neutral-400 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-neutral-400" /> {t('moonset', lang)}
            </div>
            <div className="text-sm font-semibold text-white">{astroData.moonset}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-neutral-400 flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" /> {t('sunrise', lang)}
            </div>
            <div className="text-sm font-semibold text-white">{astroData.sunrise}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-neutral-400 flex items-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-orange-400" /> {t('sunset', lang)}
            </div>
            <div className="text-sm font-semibold text-white">{astroData.sunset}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Idade da Lua (Dias):</span>
            <span className="font-semibold text-white">{astroData.lunarAge} dias</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Distância da Terra:</span>
            <span className="font-semibold text-white">{astroData.distanceKm.toLocaleString()} km</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Status Void-of-Course:</span>
            <span className="font-semibold text-white">
              {astroData.isVoidOfCourse ? 'Sim (Sem aspectos)' : 'Não (Ativa)'}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
