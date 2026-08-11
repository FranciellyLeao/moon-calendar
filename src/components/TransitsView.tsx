import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { getPlanetaryTransits, type PlanetaryTransit } from '../utils/transits';
import { Compass, AlertTriangle } from 'lucide-react';

interface TransitsViewProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const TransitsView: React.FC<TransitsViewProps> = () => {
  const [transits] = useState<PlanetaryTransit[]>(() => getPlanetaryTransits(new Date()));
  const retrogrades = transits.filter((t) => t.isRetrograde);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <Compass className="w-3.5 h-3.5 text-white" /> Trânsitos Planetários & Retrógrados
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Mapa de Trânsitos em Tempo Real
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Acompanhe a posição dos 8 corpos celestes e os impactos dos movimentos retrógrados.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center text-xs">
          <div className="text-neutral-400 text-[10px]">Planetas Retrógrados</div>
          <div className="text-white font-bold">{retrogrades.length} Ativo(s) ☿</div>
        </div>
      </div>

      {/* Retrograde Status Alert Banner */}
      {retrogrades.length > 0 && (
        <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Alerta de Planetas Retrógrados Ativos
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
            {retrogrades.map((r) => (
              <div key={r.planet} className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="text-lg">{r.symbol}</span> {r.planet} Retrógrado em {r.sign} ({r.degree}°)
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">{r.influence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planetary Transits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {transits.map((p) => (
          <div
            key={p.planet}
            className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl text-white">{p.symbol}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    p.isRetrograde
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold'
                      : 'bg-white/5 text-neutral-400 border-white/10'
                  }`}
                >
                  {p.isRetrograde ? 'Rx Retrógrado' : 'Direto'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{p.planet}</h3>

              <div className="text-xs text-neutral-300 font-medium">
                {p.sign} a {p.degree}°
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">{p.influence}</p>
            </div>

            <div className="pt-3 border-t border-white/5 text-[10px] text-neutral-500 flex justify-between">
              <span>Elemento: {p.element}</span>
              <span>Posição Relativa</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
