import React, { useState } from 'react';
import type { AstronomyData, CycleLog, UserSettings } from '../types';
import { getStoredCycleLogs, saveStoredCycleLogs } from '../utils/storage';
import { t } from '../utils/i18n';
import { HeartPulse } from 'lucide-react';

interface CycleTrackerProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const CycleTracker: React.FC<CycleTrackerProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const [logs, setLogs] = useState<CycleLog[]>(getStoredCycleLogs());

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [flowIntensity, setFlowIntensity] = useState<'Light' | 'Medium' | 'Heavy'>('Medium');
  const [symptomsInput, setSymptomsInput] = useState('cólica leve, energia alta');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const symptoms = symptomsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const newLog: CycleLog = {
      id: Date.now().toString(),
      startDate,
      flowIntensity,
      symptoms,
      mood: astroData.phaseName,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    saveStoredCycleLogs(updated);
  };

  const lastLog = logs[0] || {
    startDate: '2026-08-01',
    flowIntensity: 'Medium',
    symptoms: ['bem-estar'],
    mood: 'New Moon',
  };

  const nextPeriodDate = new Date(lastLog.startDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + 28);

  const ovulationDate = new Date(lastLog.startDate);
  ovulationDate.setDate(ovulationDate.getDate() + 14);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-white" /> {t('cycleTitle', lang)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sincronia Menstrual & Lunar
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Conecte as fases do seu ciclo corporal com as marés e ritmos da lua.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center text-xs">
          <div className="text-neutral-400 text-[10px]">Fase Lunar</div>
          <div className="text-white font-semibold">{astroData.phaseName}</div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Última Menstruação</div>
          <div className="text-xl font-bold text-white">
            {new Date(lastLog.startDate).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-[11px] text-neutral-400">Fluxo: {lastLog.flowIntensity}</div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Próxima Menstruação</div>
          <div className="text-xl font-bold text-white">
            {nextPeriodDate.toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-[11px] text-neutral-400">Previsão em ~28 dias</div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Janela Ovulatória</div>
          <div className="text-xl font-bold text-white">
            {ovulationDate.toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-[11px] text-neutral-400">Pico de fertilidade e energia</div>
        </div>
      </div>

      {/* Add Log Form */}
      <form onSubmit={handleAddLog} className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 text-xs">
        <h2 className="text-base font-bold text-white">Registrar Novo Ciclo</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Data de Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Intensidade do Fluxo</label>
            <select
              value={flowIntensity}
              onChange={(e) => setFlowIntensity(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
            >
              <option value="Light">Leve 💧</option>
              <option value="Medium">Médio 💧💧</option>
              <option value="Heavy">Intenso 💧💧💧</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Sintomas (vírgulas)</label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="cólica, sensibilidade, vitalidade"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold"
          >
            Salvar Registro de Ciclo
          </button>
        </div>
      </form>
    </div>
  );
};
