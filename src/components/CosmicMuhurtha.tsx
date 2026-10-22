import React from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { Sparkles, AlertTriangle, ShieldCheck, Sun, Briefcase, MessageSquare, Feather, Bed } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Timing Cósmico • Muhurtha Diário</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Janelas Propícias de Ação & Pausa
          </h3>
          <p className="text-xs text-neutral-300">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {windows.map((win) => {
          const active = isWindowActive(win);
          const Icon = win.icon;

          return (
            <motion.div
              key={win.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                active
                  ? 'bg-amber-400/[0.07] border-amber-400/40 shadow-[0_4px_20px_rgba(212,175,55,0.08)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      active
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {win.title}
                    </h4>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {win.startTime} – {win.endTime}
                    </span>
                  </div>
                </div>

                {active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider animate-pulse-soft">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Janela Ativa</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {win.planetaryRuler}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {win.recommendation}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Regência: <strong className="text-neutral-200">{win.planetaryRuler}</strong></span>
                </span>
                <span className="text-amber-200/90 font-medium">
                  {win.energyLabel}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
