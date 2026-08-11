import React, { useState } from 'react';
import type { AstronomyData, JournalEntry, UserSettings } from '../types';
import { getStoredJournal, saveStoredJournal } from '../utils/storage';
import { t } from '../utils/i18n';
import { BookOpen, Plus, Search, Star, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

interface LunarJournalProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const LunarJournal: React.FC<LunarJournalProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const [entries, setEntries] = useState<JournalEntry[]>(getStoredJournal());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('intenções, gratidão');

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title,
      content,
      moonPhase: astroData.phaseName,
      moonSign: astroData.zodiacSign,
      tags,
      isFavorite: false,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStoredJournal(updated);

    setTitle('');
    setContent('');
    setIsFormOpen(false);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    setEntries(updated);
    saveStoredJournal(updated);
  };

  const handleDeleteEntry = (id: string) => {
    if (!confirm('Deseja excluir esta anotação?')) return;
    const updated = entries.filter((entry) => entry.id !== id);
    setEntries(updated);
    saveStoredJournal(updated);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? entry.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <BookOpen className="w-3.5 h-3.5 text-white" /> {t('journalTitle', lang)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Diário de Reflexão Lunar
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Registre suas reflexões diárias sincronizadas com as fases da lua.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          {isFormOpen ? 'Fechar Form' : t('newEntry', lang)}
        </button>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSaveEntry} className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 animate-fadeIn text-xs">
          <h2 className="text-base font-bold text-white mb-2">Nova Anotação Lunar</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Título da Reflexão</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minhas intenções para a Lua Nova..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="ex: gratidão, trabalho, rituais"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Sua Reflexão</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Escreva livremente o que sente hoje..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white resize-none"
              required
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
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nas anotações..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedTag === null
                ? 'bg-white text-black font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full bg-[#1c1c1e] rounded-3xl p-12 border border-white/10 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="text-sm font-semibold text-white">Nenhuma anotação encontrada</div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Comece escrevendo seu primeiro diário lunar para registrar seu crescimento pessoal.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                    {new Date(entry.date).toLocaleDateString(lang, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(entry.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        entry.isFavorite ? 'text-white' : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 rounded-lg text-neutral-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{entry.title}</h3>

                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white font-medium">
                    {entry.moonPhase}
                  </span>
                  <span>{entry.moonSign}</span>
                </div>

                <div className="flex items-center gap-1">
                  {entry.tags.map((t) => (
                    <span key={t} className="text-neutral-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
