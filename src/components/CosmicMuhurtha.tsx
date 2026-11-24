import React from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { Sparkles, AlertTriangle, ShieldCheck, Sun, Briefcase, MessageSquare, Feather, Bed } from 'lucide-react';

interface CosmicMuhurthaProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

interface MuhurthaWindow {
  id: string;
  category: 'focus' | 'contracts' | 'rituals' | 'rest';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "11:00"
  rating: 'auspicious' | 'moderate' | 'caution';
  energyLabel: string;
  recommendation: string;
  planetaryRuler: string;
}

export const CosmicMuhurtha: React.FC<CosmicMuhurthaProps> = ({
  astroData,
}) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper to parse "HH:MM" (or "HH:MM AM/PM") to minutes from midnight
  const toMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const isPM = /pm/i.test(timeStr);
    const isAM = /am/i.test(timeStr);
    const clean = timeStr.replace(/[^0-9:]/g, '');
    const parts = clean.split(':').map(Number);
    let h = parts[0] || 0;
    const m = parts[1] || 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  };

  // Derive realistic astronomical time slots based on sunrise / sunset & day ruler
  const sunriseMinutes = astroData.sunrise && astroData.sunrise !== '--:--'
    ? toMinutes(astroData.sunrise)
    : 6 * 60; // default 06:00
  const sunsetMinutes = astroData.sunset && astroData.sunset !== '--:--'
    ? toMinutes(astroData.sunset)
    : 18 * 60 + 30; // default 18:30

  // Format minutes to "HH:MM"
  const fmt = (mins: number) => {
    const wrapped = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(wrapped / 60);
    const m = wrapped % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const windows: MuhurthaWindow[] = [
    {
      id: 'rituals-morning',
      category: 'rituals',
      title: 'Brahma Muhurtha & Rituais Matinais',
      icon: Feather,
      startTime: fmt(sunriseMinutes - 96), // 1h36 before sunrise
      endTime: fmt(sunriseMinutes - 24),
      rating: 'auspicious',
      energyLabel: 'Pico Espiritual',
      recommendation: 'Clareza mental cristalina para meditação profunda, intenções diárias e ioga.',
      planetaryRuler: 'Lua & Júpiter',
    },
    {
      id: 'focus-morning',
      category: 'focus',
      title: 'Foco Profissional & Decisões Críticas',
      icon: Briefcase,
      startTime: fmt(sunriseMinutes + 60),
      endTime: fmt(sunriseMinutes + 240),
      rating: astroData.isVoidOfCourse ? 'caution' : 'auspicious',
      energyLabel: astroData.isVoidOfCourse ? 'Atenção (Lua Fora de Curso)' : 'Janela de Alta Produtividade',
      recommendation: astroData.isVoidOfCourse
        ? 'Lua Fora de Curso: priorize tarefas rotineiras e planejamento; evite assinaturas irreversíveis.'
        : 'Impulso executivo excelente. Ideal para liderar reuniões estratégicas e resolver pendências complexas.',
      planetaryRuler: 'Sol & Marte',
    },
    {
      id: 'negotiations-afternoon',
      category: 'contracts',
      title: 'Negociações, Vendas & Contratos',
      icon: MessageSquare,
      startTime: fmt(sunriseMinutes + 360),
      endTime: fmt(sunsetMinutes - 60),
      rating: 'auspicious',
      energyLabel: 'Harmonia & Diálogo Fluido',
      recommendation: 'Momento oportuno para conversas diplomáticas, propostas comerciais e alinhamento interpessoal.',
      planetaryRuler: 'Mercúrio & Vênus',
    },
    {
      id: 'rest-night',
      category: 'rest',
      title: 'Descompressão, Regeneração & Sono',
      icon: Bed,
      startTime: fmt(sunsetMinutes + 120),
      endTime: fmt(sunsetMinutes + 360),
      rating: 'auspicious',
      energyLabel: 'Restauração Celular',
      recommendation: 'Reduza a exposição a telas luminosas. Chás relaxantes e leitura propiciam sono reparador.',
      planetaryRuler: 'Lua Noturna & Saturno',
    },
  ];

  const isWindowActive = (win: MuhurthaWindow) => {
    const s = toMinutes(win.startTime);
    const e = toMinutes(win.endTime);
    if (e > s) {
      return currentMinutes >= s && currentMinutes <= e;
    }
    // Overnight window (e.g. 22:00 to 02:00)
    return currentMinutes >= s || currentMinutes <= e;
  };

  return (
    <div className="relative space-y-5 pt-2 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Timing Cósmico • Muhurtha Diário</span>
          </div>
          <h3 className="text-lg font-light text-white mt-1 tracking-tight">
            Janelas Propícias de Ação & Pausa
          </h3>
          <p className="text-xs text-neutral-400">
            Horários calculados a partir da transição solar-lunar e regências planetárias de hoje.
          </p>
        </div>

        {astroData.isVoidOfCourse && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold self-start sm:self-auto">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Lua Fora de Curso Ativa</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-white/[0.06] pt-1">
        {windows.map((win) => {
          const active = isWindowActive(win);
          const Icon = win.icon;

          return (
            <div
              key={win.id}
              className={`py-4 sm:py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                active ? 'bg-amber-400/[0.03] -mx-4 px-4 rounded-2xl' : ''
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    active
                      ? 'bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-white/[0.04] text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-medium text-white leading-tight">
                      {win.title}
                    </h4>
                    {active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-semibold tracking-wide">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Agora</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {win.energyLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                    {win.recommendation}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1 text-[#E6CA65]/90">
                      <ShieldCheck className="w-3 h-3 text-[#E6CA65]" />
                      <span>Regência: <strong className="text-neutral-200 font-medium">{win.planetaryRuler}</strong></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Window column */}
              <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-1 pl-12 md:pl-0">
                <span className="text-xs sm:text-base font-semibold font-mono text-white">
                  {win.startTime} – {win.endTime}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                  {win.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
