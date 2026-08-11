import React, { useState } from 'react';
import type { AstronomyData, IntentionGoal, UserSettings } from '../types';
import { getStoredIntentions, saveStoredIntentions } from '../utils/storage';
import { t } from '../utils/i18n';
import confetti from 'canvas-confetti';
import { Target, Plus, CheckCircle2, Circle, Trash2, Award } from 'lucide-react';

interface IntentionsTrackerProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const IntentionsTracker: React.FC<IntentionsTrackerProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const [intentions, setIntentions] = useState<IntentionGoal[]>(getStoredIntentions());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsInput, setStepsInput] = useState('Meditar por 10min, Escrever gratidão, Desconectar das telas');

  const handleSaveIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const checklist = stepsInput
      .split(',')
      .map((s, idx) => ({ id: `step-${idx}-${Date.now()}`, text: s.trim(), done: false }))
      .filter((s) => s.text.length > 0);

    const newGoal: IntentionGoal = {
      id: Date.now().toString(),
      title,
      description: description || 'Minha intenção sagrada',
      targetPhase: astroData.phaseName,
      createdAt: new Date().toISOString(),
      progress: 0,
      checklist,
      isArchived: false,
    };

    const updated = [newGoal, ...intentions];
    setIntentions(updated);
    saveStoredIntentions(updated);

    setTitle('');
    setDescription('');
    setIsFormOpen(false);
  };

  const handleToggleStep = (goalId: string, stepId: string) => {
    const updated = intentions.map((goal) => {
      if (goal.id !== goalId) return goal;

      const newChecklist = goal.checklist.map((step) =>
        step.id === stepId ? { ...step, done: !step.done } : step
      );

      const completedCount = newChecklist.filter((s) => s.done).length;
      const progress = Math.round((completedCount / newChecklist.length) * 100);
      const isAllDone = progress === 100;

      if (isAllDone && goal.progress < 100) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      return {
        ...goal,
        checklist: newChecklist,
        progress,
      };
    });

    setIntentions(updated);
    saveStoredIntentions(updated);
  };

  const handleDeleteIntention = (id: string) => {
    if (!confirm('Deseja excluir esta intenção?')) return;
    const updated = intentions.filter((i) => i.id !== id);
    setIntentions(updated);
    saveStoredIntentions(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <Target className="w-3.5 h-3.5 text-white" /> {t('intentionsTitle', lang)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gestão de Intenções Lunares
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Plante sementes de intenção na Lua Nova e acompanhe o progresso até a Lua Cheia.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          {isFormOpen ? 'Fechar Form' : t('newIntention', lang)}
        </button>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSaveIntention} className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 animate-fadeIn text-xs">
          <h2 className="text-base font-bold text-white mb-2">Nova Intenção Sagrada</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Nome da Intenção</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cultivar clareza mental e paz..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Descrição / Detalhes</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Práticas diárias para fortalecimento pessoal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Passos do Checklist (separados por vírgula)</label>
            <input
              type="text"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="Passo 1, Passo 2, Passo 3"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold"
            >
              Plantar Intenção
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intentions.map((goal) => (
          <div
            key={goal.id}
            className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300 font-medium">
                  {goal.targetPhase}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{goal.progress}%</span>
                  <button
                    onClick={() => handleDeleteIntention(goal.id)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {goal.progress === 100 && <Award className="w-4 h-4 text-white shrink-0" />}
                {goal.title}
              </h3>
              <p className="text-xs text-neutral-400">{goal.description}</p>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                {goal.checklist.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => handleToggleStep(goal.id, step.id)}
                    className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer p-2 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all"
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                    <span className={step.done ? 'line-through text-neutral-500' : ''}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-white/5">
              <span>Fase: {goal.targetPhase}</span>
              <span>Criado: {new Date(goal.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
