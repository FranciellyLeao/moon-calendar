import React, { useState } from 'react';
import type { AstronomyData, JournalEntry, UserSettings } from '../types';
import { getStoredJournal, saveStoredJournal } from '../utils/storage';
import { BookOpen, Plus, Search, Star, Calendar as CalendarIcon, Trash2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn text-[#F3F4F6]">
      {/* iOS HIG Floating Header (Sem caixa em volta, título flutuante) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-300" />
            <span>Diário de Reflexão Lunar</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1.5 max-w-xl font-normal leading-relaxed">
            Registre suas intenções e reflexões diárias sincronizadas com as fases da Lua e posições astrológicas.
          </p>
        </div>

        {/* Translucent Glass CTA Button (HIG Style) */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 rounded-full bg-amber-300/15 hover:bg-amber-300/25 text-amber-200 border border-amber-300/30 backdrop-blur-md text-xs font-bold shadow-[0_0_15px_rgba(251,191,36,0.15)] flex items-center gap-2 transition-all shrink-0"
        >
          {isFormOpen ? <X className="w-4 h-4 text-amber-300" /> : <Plus className="w-4 h-4 text-amber-300" />}
          <span>{isFormOpen ? 'Fechar Form' : 'Nova Reflexão'}</span>
        </motion.button>
      </div>

      {/* Form Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSaveEntry}
            className="overflow-hidden bg-[#121218]/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/10 space-y-4 shadow-2xl text-xs"
          >
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-300" /> Nova Anotação Lunar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A1A1AA] mb-1 font-medium">Título da Reflexão</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Minhas intenções para a Lua Nova..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-300/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1 font-medium">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="ex: gratidão, trabalho, rituais"
                  className="w-full px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-300/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A1A1AA] mb-1 font-medium">Sua Reflexão</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Escreva livremente o que sente hoje..."
                className="w-full px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-300/50 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-[#15111b] font-bold transition-colors"
              >
                Salvar Registro
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Floating Unboxed Search Bar & Deconstructed Filter Chips */}
      <div className="space-y-3">
        {/* Floating Standalone iOS Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nas anotações..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-300/50 shadow-md text-xs sm:text-sm transition-all"
          />
        </div>

        {/* Free Floating Horizontal Scroll Filter Chips */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedTag === null
                  ? 'bg-gradient-to-r from-[#fbe396] to-[#e5c158] text-[#15111b] shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Todas</span>
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-[#fbe396] to-[#e5c158] text-[#15111b] font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List Cards with Squircle Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full bg-[#121218]/70 backdrop-blur-xl rounded-[28px] p-12 border border-white/10 text-center space-y-3 shadow-xl">
            <BookOpen className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="text-sm sm:text-base font-bold text-white">Nenhuma anotação encontrada</div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
              Comece escrevendo seu primeiro diário lunar para registrar seu crescimento pessoal e intenções.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              whileHover={{ y: -3, scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#121218]/70 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/[0.08] hover:border-amber-300/30 space-y-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-200/90">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
                    {new Date(entry.date).toLocaleDateString(lang, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(entry.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        entry.isFavorite ? 'text-amber-300' : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-300' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {entry.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap font-normal">
                  {entry.content}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-200 text-[11px] font-semibold">
                    {entry.moonPhase}
                  </span>
                  <span className="text-[11px] text-neutral-300 font-medium">Lua em {entry.moonSign}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {entry.tags.map((t) => (
                    <span key={t} className="text-[11px] text-neutral-400 font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
