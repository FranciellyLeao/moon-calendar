import React, { useState } from 'react';
import type { AstronomyData, Ritual, UserSettings } from '../types';
import { INITIAL_RITUALS, INITIAL_AFFIRMATIONS } from '../utils/ritualsData';
import { t } from '../utils/i18n';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Clock, Heart, RefreshCw } from 'lucide-react';

interface RitualsLibraryProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const RitualsLibrary: React.FC<RitualsLibraryProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);

  const filteredRituals = INITIAL_RITUALS.filter((r: Ritual) => {
    if (selectedCategory === 'all') return true;
    return r.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleNextAffirmation = () => {
    setAffirmationIdx((prev) => (prev + 1) % INITIAL_AFFIRMATIONS.length);
    setRepeatCount(0);
  };

  const handleRepeatAffirmation = () => {
    const nextCount = repeatCount + 1;
    setRepeatCount(nextCount);
    if (nextCount === 3) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }
  };

  const currentAffirmation = INITIAL_AFFIRMATIONS[affirmationIdx];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <Flame className="w-3.5 h-3.5 text-white" /> {t('ritualsTitle', lang)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Biblioteca de Rituais & Afirmações
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Práticas sagradas de auto-cuidado, banhos de ervas e alinhamento de intenções.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center text-xs">
          <div className="text-neutral-400 text-[10px]">Fase Recomendada</div>
          <div className="text-white font-semibold">{astroData.phaseName}</div>
        </div>
      </div>

      {/* Daily Affirmation Card */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 text-center">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-white" /> Afirmação Lunar Diária
        </div>

        <p className="text-lg sm:text-xl font-medium text-white max-w-2xl mx-auto leading-relaxed">
          "{currentAffirmation.text}"
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRepeatAffirmation}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Heart className="w-3.5 h-3.5 fill-black" />
            Repetir Afirmação ({repeatCount}/3)
          </button>

          <button
            onClick={handleNextAffirmation}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs border border-white/10 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            Outra Afirmação
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'all', label: 'Todos os Rituais' },
          { id: 'bath', label: 'Banhos & Ervas 🌿' },
          { id: 'tea', label: 'Chás Sagrados 🫖' },
          { id: 'new moon', label: 'Lua Nova 🌑' },
          { id: 'full moon', label: 'Lua Cheia 🌕' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-white text-black font-semibold'
                : 'bg-[#1c1c1e] text-neutral-400 border border-white/10 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rituals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRituals.map((ritual: Ritual) => (
          <div
            key={ritual.id}
            onClick={() => setSelectedRitual(ritual)}
            className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-3 cursor-pointer hover:border-white/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white">
                  {ritual.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" /> {ritual.durationMin} min
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{ritual.title}</h3>
              <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                {ritual.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-white/5">
              <span>Avaliação: ⭐ {ritual.rating}/5</span>
              <span className="font-semibold text-white">Ver Ritual →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ritual Inspector Modal */}
      {selectedRitual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">{selectedRitual.title}</h2>
              <button
                onClick={() => setSelectedRitual(null)}
                className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">{selectedRitual.description}</p>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">🌿 Ingredientes Necessários:</div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {selectedRitual.ingredients.map((ing, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-neutral-300">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">🔮 Passo a Passo:</div>
              <ol className="space-y-2 text-xs text-neutral-300">
                {selectedRitual.steps.map((step, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                    <span className="font-bold text-white">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRitual(null)}
                className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs"
              >
                Concluir Prática
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
