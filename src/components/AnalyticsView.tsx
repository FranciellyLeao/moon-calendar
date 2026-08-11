import React from 'react';
import type { UserSettings } from '../types';
import { t } from '../utils/i18n';
import { BarChart3, TrendingUp, Flame, Calendar, Award } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface AnalyticsViewProps {
  settings: UserSettings;
}

const MOOD_DATA = [
  { phase: 'Lua Nova', energy: 6, focus: 8 },
  { phase: 'Crescente', energy: 8, focus: 9 },
  { phase: 'Q. Crescente', energy: 7, focus: 7 },
  { phase: 'Gibosa', energy: 9, focus: 8 },
  { phase: 'Lua Cheia', energy: 10, focus: 6 },
  { phase: 'Disseminante', energy: 8, focus: 7 },
  { phase: 'Q. Minguante', energy: 6, focus: 8 },
  { phase: 'Minguante', energy: 5, focus: 9 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ settings }) => {
  const lang = settings.language;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-white" /> {t('analyticsTitle', lang)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Insights & Mapeamento de Humor
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Análise de tendência de energia, produtividade e hábitos ao longo dos ciclos lunares.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs">
          <Award className="w-5 h-5 text-white" />
          <div>
            <div className="text-neutral-400 text-[10px]">Sequência Ativa</div>
            <div className="text-white font-bold">14 Dias de Registro ⚡</div>
          </div>
        </div>
      </div>

      {/* Main Energy vs Moon Phase Chart */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white" />
            Flutuação de Energia & Foco por Fase Lunar
          </h2>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white" /> Energia
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" /> Foco
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOOD_DATA}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8e8e93" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8e8e93" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="phase" stroke="#636366" fontSize={11} tickLine={false} />
              <YAxis stroke="#636366" fontSize={11} tickLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1c1e',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Area type="monotone" dataKey="energy" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
              <Area type="monotone" dataKey="focus" stroke="#8e8e93" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap & Habit Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-white" />
            Consistência de Registro (Últimos 28 dias)
          </h3>
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded-md border border-white/5 transition-all ${
                  i % 3 === 0
                    ? 'bg-white'
                    : i % 2 === 0
                    ? 'bg-white/40'
                    : 'bg-white/10'
                }`}
                title={`Dia ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            Resumo do Ciclo Atual
          </h3>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span>Pico de Produtividade</span>
              <span className="font-semibold text-white">Lua Crescente (85%)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span>Melhor Fase para Reflexão</span>
              <span className="font-semibold text-white">Lua Minguante (92%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
