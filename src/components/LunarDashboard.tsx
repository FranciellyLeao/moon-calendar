import React, { useState } from 'react';
import { getStoredJournal, saveStoredJournal, saveSubscriber, getStoredSubscribers } from '../utils/storage';
import type { AstronomyData, UserSettings, JournalEntry } from '../types';
import { getDayActivityGuide } from '../utils/activityTiming';
import { getMoonZodiacSign } from '../utils/astronomy';
import { MoonTimelineScrubber } from './MoonTimelineScrubber';
import { CosmicMuhurtha } from './CosmicMuhurtha';
import { SocialShareModal } from './SocialShareModal';
import {
  Moon,
  Sunset,
  Sunrise,
  Sparkles,
  AlertCircle,
  Sun,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  Feather,
  RotateCw,
  ShieldAlert,
  ArrowRight,
  Mail,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LunarDashboardProps {
  astroData: AstronomyData;
  settings: UserSettings;
  setActiveTab: (tab: string) => void;
  openDayDetails: (date: Date) => void;
}

const PHASE_NAMES_PT: Record<string, string> = {
  'New Moon': 'Lua Nova',
  'Waxing Crescent': 'Lua Crescente',
  'First Quarter': 'Quarto Crescente',
  'Waxing Gibbous': 'Gibosa Crescente',
  'Full Moon': 'Lua Cheia',
  'Waning Gibbous': 'Gibosa Minguante',
  'Last Quarter': 'Quarto Minguante',
  'Waning Crescent': 'Lua Minguante',
};

const MOON_EMOJIS: Record<string, string> = {
  new: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
};

const DAILY_AFFIRMATIONS = [
  { text: "Confio nos ritmos naturais do universo e na sabedoria da minha própria intuição.", theme: "Intuição & Confiança" },
  { text: "Estou aberto a receber abundância, amor e clareza em todas as minhas decisões.", theme: "Abertura & Clareza" },
  { text: "Liberto o que não serve mais e abro espaço para novos ciclos iluminados.", theme: "Renovação & Leveza" },
  { text: "Minha energia é sagrada e alinhada com as estrelas e marés cósmicas.", theme: "Conexão Cósmica" },
];

export const LunarDashboard: React.FC<LunarDashboardProps> = ({
  astroData,
  settings,
  setActiveTab,
  openDayDetails,
}) => {
  const now = new Date();
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAffirmationSaved, setIsAffirmationSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Email subscription state
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionFeedback, setSubscriptionFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(() => getStoredSubscribers().length);

  const handleSaveAffirmationToJournal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentJournal = getStoredJournal();
    const newEntry: JournalEntry = {
      id: 'j-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: `Intenção: ${todayAffirmation.theme}`,
      content: `Afirmação Diária (${todayAffirmation.theme}):\n"${todayAffirmation.text}"\n\nReflexão: A Lua em ${astroData.zodiacSign} fortalece a harmonia interior.`,
      moonPhase: astroData.phaseName,
      moonSign: astroData.zodiacSign,
      tags: ['Afirmação', todayAffirmation.theme],
      isFavorite: true,
    };
    saveStoredJournal([newEntry, ...currentJournal]);
    setIsAffirmationSaved(true);
    setTimeout(() => setIsAffirmationSaved(false), 3000);
  };

  const phaseCode = astroData.phaseCode;
  const phasePt = PHASE_NAMES_PT[astroData.phaseName] || astroData.phaseName;
  const moonEmoji = MOON_EMOJIS[phaseCode] || '🌙';

  const zodiac = getMoonZodiacSign(now);
  const guide = getDayActivityGuide(
    now,
    astroData.phaseName,
    zodiac.name,
    zodiac.symbol,
    astroData.isVoidOfCourse
  );
  const top3 = guide.activities.slice(0, 3);
  const bottom2 = guide.activities.slice(-2);
  const userSign = settings.natalChart?.sunSign;

  const todayAffirmation = DAILY_AFFIRMATIONS[now.getDate() % DAILY_AFFIRMATIONS.length];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const res = saveSubscriber(emailInput, 'dashboard_newsletter');
    setSubscriptionFeedback({
      success: res.success,
      message: res.message,
    });
    setSubscriberCount(res.count);
    if (res.success) {
      setEmailInput('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn text-[#f4f1ea]">
      {/* ── Ultra-Premium Celestial Hero Card ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-moonly rounded-3xl p-6 sm:p-9 relative overflow-hidden"
      >
        {/* Discreet ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400/[0.04] blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Moon Visual with tactile interaction */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <motion.div
              className="relative group cursor-pointer"
              onClick={() => openDayDetails(now)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Clique para ver os detalhes completos deste dia"
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative overflow-hidden border border-amber-300/30 flex items-center justify-center bg-[#07070a] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.8)]">
                {/* Subtle realistic lunar disc atmosphere */}
                <div
                  className="absolute inset-0 rounded-full opacity-90 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 35% 35%, #f7f4e9 0%, #c4ab6c 38%, #1f1b14 78%, #07070a 100%)',
                  }}
                />
                <div className="relative z-10 text-6xl select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {moonEmoji}
                </div>
                <div className="absolute bottom-3.5 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-amber-200 uppercase tracking-widest">
                  {astroData.illumination}% Iluminada
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 tracking-tight">
              {phasePt}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-1 font-medium flex items-center gap-1.5">
              <span className="text-base">{astroData.zodiacSymbol}</span>
              <span>Lua em {astroData.zodiacSign}</span>
            </p>

            {/* Quick action: Open Social Story Card */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Compartilhar Story</span>
              </button>

              <button
                onClick={() => setActiveTab('oracle')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border border-amber-400/25 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Oráculo Lunar</span>
              </button>
            </div>
          </div>

          {/* Essential Info & Editorial Context */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-200 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ritmo Energético: {guide.overallLabel} ({guide.overallEnergy}%)
              </span>
              {astroData.isVoidOfCourse && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Lua Fora de Curso
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Calendário Lunar & Sincronia Cósmica
              </h1>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                Dia regido por <strong className="text-amber-200 font-semibold">{guide.planetaryDayRuler}</strong>. Aproveite este momento para intuição, alinhamento interior e reconexão profunda com seu ritmo natural.
              </p>
            </div>

            {/* Quick Astronomical Specs Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
                { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
                { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
                { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
              ].map(({ label, val, icon: Icon }) => (
                <div
                  key={label}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col items-center justify-center text-center"
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-medium mb-1">
                    <Icon className="w-3.5 h-3.5 text-amber-300/80" /> {label}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white font-mono">{val}</div>
                </div>
              ))}
            </div>

            {/* Collapsible Specs Button */}
            <div className="pt-1">
              <button
                onClick={() => setShowFullSpecs(!showFullSpecs)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-all"
              >
                <span>{showFullSpecs ? 'Ocultar dados astronômicos' : 'Ver especificações completas'}</span>
                {showFullSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showFullSpecs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-3 p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Idade da Lua:</span>
                      <div className="font-bold text-white text-xs sm:text-sm font-mono">{astroData.lunarAge.toFixed(1)} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Distância:</span>
                      <div className="font-bold text-white text-xs sm:text-sm font-mono">{astroData.distanceKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Altitude Atual:</span>
                      <div className="font-bold text-white text-xs sm:text-sm font-mono">{astroData.altitudeDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Próxima Lua Cheia:</span>
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.nextFullMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Próxima Lua Nova:</span>
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.nextNewMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Azimute:</span>
                      <div className="font-bold text-white text-xs sm:text-sm font-mono">{astroData.azimuthDeg.toFixed(1)}°</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Interactive 24-Hour Moon Timeline Scrubber ─────────────────────── */}
      <MoonTimelineScrubber settings={settings} astroData={astroData} />

      {/* ── Daily Auspicious Muhurtha & Timing Windows ─────────────────────── */}
      <CosmicMuhurtha settings={settings} astroData={astroData} />

      {/* ── Daily Editorial Affirmation & Intention ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="glass-panel-gold rounded-3xl p-6 sm:p-8 cursor-pointer relative overflow-hidden"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Feather className="w-4 h-4 text-amber-300" /> Afirmação do Dia • {todayAffirmation.theme}
          </div>
          <span className="text-xs text-neutral-400 hover:text-amber-200 flex items-center gap-1.5 font-medium transition-colors">
            <RotateCw className="w-3.5 h-3.5 text-amber-300" /> Clique para virar
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5"
            >
              <p className="text-base sm:text-lg font-medium text-white italic leading-relaxed">
                "{todayAffirmation.text}"
              </p>
              <span className="text-xs text-amber-200/80 font-medium block pt-1">
                ✦ Inspire profundamente três vezes e ancore esta intenção em seu dia.
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-bold text-amber-200">Reflexão Cósmica</h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                A Lua em {astroData.zodiacSign} harmoniza a lucidez dos pensamentos com a intuição do coração. Reserve alguns minutos para registrar seus sentimentos.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAffirmationToJournal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 hover:bg-amber-400 hover:text-black font-semibold text-xs transition-all shadow-md"
                >
                  {isAffirmationSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Salvo no Diário!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Salvar intenção no meu Diário</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── 2-Column Balanced Grid: Auspicious Practices & Personal Guidance ─ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Recommended Activities */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" /> Práticas Favoráveis Hoje
            </h3>
            <button
              onClick={() => setActiveTab('rituals')}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1"
            >
              Ver Rituais <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {top3.map((act) => {
              const isExcellent = act.rating === 'excellent';
              return (
                <div
                  key={act.labelPt}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between transition-all hover:border-white/10"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-base">{act.emoji}</span>
                      <span>{act.labelPt}</span>
                    </div>
                    <div className="text-xs text-neutral-300 leading-relaxed mt-1">{act.tip}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                      isExcellent
                        ? 'bg-amber-400/15 text-amber-200 border border-amber-400/30'
                        : 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/30'
                    }`}
                  >
                    {isExcellent ? 'Excelente' : 'Favorável'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Personal Natal + What to Avoid + Real Newsletter */}
        <div className="space-y-6">
          {/* Natal Aligned Vibe Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 border border-white/10">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" /> Alinhamento Pessoal
                </h3>
                {userSign && (
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium">
                    Sol em {userSign}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                O trânsito atual da Lua no signo de <strong className="text-white font-medium">{astroData.zodiacSign}</strong> traz uma vibração propícia para foco mental, alinhamento de metas e escuta intuitiva.
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setActiveTab('astrology')}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Consultar Meu Mapa Astral Completo</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* What to Avoid Today */}
          <div className="glass-panel rounded-3xl p-5 space-y-3 border border-white/10">
            <h4 className="text-xs font-bold text-amber-200/90 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> O Que Evitar Hoje
            </h4>
            <div className="space-y-2">
              {bottom2.map((act) => (
                <div key={act.labelPt} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base">{act.emoji}</span>
                    <span className="font-medium text-white">{act.labelPt}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Requer cautela</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real Functional Email Newsletter Box */}
          <div className="glass-panel-moonly rounded-3xl p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-amber-300" /> Diário Lunar por E-mail
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {subscriberCount} assinantes
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Receba o horóscopo da Lua, alertas de fases e rituais no seu e-mail para manter seu alinhamento diário.
            </p>

            {subscriptionFeedback ? (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  subscriptionFeedback.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                }`}
              >
                {subscriptionFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{subscriptionFeedback.message}</span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Seu melhor e-mail..."
                  required
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold text-xs transition-colors flex-shrink-0"
                >
                  Inscrever
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Social Share Story Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        astroData={astroData}
        settings={settings}
        dailyAffirmation={todayAffirmation}
      />
    </div>
  );
};
