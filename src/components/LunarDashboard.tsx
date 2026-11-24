import React, { useState } from 'react';
import { getStoredJournal, saveStoredJournal, saveSubscriber } from '../utils/storage';
import type { AstronomyData, UserSettings, JournalEntry } from '../types';
import { getDayActivityGuide } from '../utils/activityTiming';
import { getMoonZodiacSign } from '../utils/astronomy';
import { MoonTimelineScrubber } from './MoonTimelineScrubber';
import { CosmicMuhurtha } from './CosmicMuhurtha';
import { SocialShareModal } from './SocialShareModal';
import { LunarOracle } from './LunarOracle';
import { RealisticMoon } from './RealisticMoon';
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
  Clock,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LunarDashboardProps {
  astroData: AstronomyData;
  settings: UserSettings;
  setActiveTab: (tab: string) => void;
  openDayDetails: (date: Date) => void;
}

type DashboardTab = 'summary' | 'oracle' | 'timeline' | 'muhurtha';

const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'summary', label: 'Resumo do Dia', icon: Sparkles },
  { id: 'oracle', label: 'Oráculo Lunar', icon: Compass },
  { id: 'timeline', label: 'Linha do Tempo 24h', icon: Clock },
  { id: 'muhurtha', label: 'Timing Cósmico', icon: Zap },
];

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

const DAILY_AFFIRMATIONS = [
  { text: 'Confio nos ritmos naturais do universo e na sabedoria da minha própria intuição.', theme: 'Intuição & Confiança' },
  { text: 'Estou aberto a receber abundância, amor e clareza em todas as minhas decisões.', theme: 'Abertura & Clareza' },
  { text: 'Liberto o que não serve mais e abro espaço para novos ciclos iluminados.', theme: 'Renovação & Leveza' },
  { text: 'Minha energia é sagrada e alinhada com as estrelas e marés cósmicas.', theme: 'Conexão Cósmica' },
];

export const LunarDashboard: React.FC<LunarDashboardProps> = ({
  astroData,
  settings,
  setActiveTab,
  openDayDetails,
}) => {
  const now = new Date();
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('summary');
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAffirmationSaved, setIsAffirmationSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Email subscription state (without public count display)
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionFeedback, setSubscriptionFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  const phasePt = PHASE_NAMES_PT[astroData.phaseName] || astroData.phaseName;

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
    if (res.success) {
      setEmailInput('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn text-[#f4f1ea]">
      {/* ── Unboxed, Airy & Ethereal Celestial Hero ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative pt-2 pb-6 sm:pt-4 sm:pb-8"
      >
        {/* Discreet ambient champagne glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E6CA65]/[0.035] blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Moon Visual with tactile interaction */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <motion.div
              className="relative group cursor-pointer flex flex-col items-center"
              onClick={() => openDayDetails(now)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Clique para ver os detalhes astronômicos deste dia"
            >
              <RealisticMoon
                illumination={astroData.illumination}
                phaseCode={astroData.phaseCode}
                size={210}
              />
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[11px] font-mono font-medium text-[#E6CA65]">
                <span>{astroData.illumination}% Iluminada</span>
              </div>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-light text-white mt-3.5 tracking-tight">
              {phasePt}
            </h2>
            <p className="text-xs sm:text-sm text-[#E6CA65]/90 mt-1 font-medium flex items-center gap-1.5">
              <span className="text-base">{astroData.zodiacSymbol}</span>
              <span>Lua em {astroData.zodiacSign}</span>
            </p>

            {/* Quick Actions */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#E6CA65]" />
                <span>Compartilhar Story</span>
              </button>

              <button
                onClick={() => openDayDetails(now)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6CA65]/10 hover:bg-[#E6CA65]/20 text-[#E6CA65] text-xs font-medium transition-all"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Essential Info & Timing Windows */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] text-[#E6CA65] text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" /> Ritmo: {guide.overallLabel} ({guide.overallEnergy}%)
              </span>
              {astroData.isVoidOfCourse && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Lua Fora de Curso
                </span>
              )}
            </div>

            <div>
              <div className="text-[11px] font-medium tracking-widest text-[#E6CA65] uppercase flex items-center gap-2 mb-1.5">
                <span>{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span className="opacity-40">•</span>
                <span>Dia regido por {guide.planetaryDayRuler}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-snug">
                Sincronia Lunar & Ritmo do Dia
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                A Lua transita por <strong className="text-[#E6CA65] font-medium">{astroData.zodiacSign}</strong>. Excelente vibração para intuição, práticas reflexivas e harmonia energética.
              </p>
            </div>

            {/* Time & Astronomy Metrics - Clean Typographic stat row with balanced subtle dividers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 sm:py-4 border-y border-white/[0.06]">
              {[
                { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
                { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
                { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
                { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
              ].map(({ label, val, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-start justify-center"
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                    <Icon className="w-3.5 h-3.5 text-[#E6CA65]/80" />
                    <span>{label}</span>
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-white font-mono mt-0.5">
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Collapsible Specs */}
            <div>
              <button
                onClick={() => setShowFullSpecs(!showFullSpecs)}
                className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
              >
                <span>{showFullSpecs ? 'Ocultar especificações' : 'Especificações completas'}</span>
                {showFullSpecs ? <ChevronUp className="w-3 h-3 text-[#E6CA65]" /> : <ChevronDown className="w-3 h-3 text-[#E6CA65]" />}
              </button>

              <AnimatePresence>
                {showFullSpecs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Idade da Lua</span>
                      <div className="font-semibold text-white text-xs font-mono mt-0.5">{astroData.lunarAge.toFixed(1)} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Distância</span>
                      <div className="font-semibold text-white text-xs font-mono mt-0.5">{astroData.distanceKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Altitude Atual</span>
                      <div className="font-semibold text-white text-xs font-mono mt-0.5">{astroData.altitudeDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Próxima Lua Cheia</span>
                      <div className="font-semibold text-white text-xs mt-0.5">{astroData.nextFullMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Próxima Lua Nova</span>
                      <div className="font-semibold text-white text-xs mt-0.5">{astroData.nextNewMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Azimute</span>
                      <div className="font-semibold text-white text-xs font-mono mt-0.5">{astroData.azimuthDeg.toFixed(1)}°</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Floating Editorial Daily Affirmation */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[#E6CA65] font-medium text-xs uppercase tracking-widest">
              <Feather className="w-3.5 h-3.5" />
              <span>Afirmação do Dia • {todayAffirmation.theme}</span>
            </div>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-[11px] text-neutral-400 hover:text-[#E6CA65] flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-[#E6CA65]" />
              <span>{isFlipped ? 'Ver afirmação' : 'Ver reflexão cósmica'}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="pl-4 border-l-2 border-[#E6CA65]/40 py-1 space-y-2"
              >
                <p className="text-base sm:text-lg font-light text-white italic leading-relaxed">
                  "{todayAffirmation.text}"
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-[#E6CA65]/80 font-normal">
                    ✦ Inspire três vezes e ancore esta intenção hoje.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveAffirmationToJournal}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#E6CA65] hover:bg-white/[0.05] transition-all"
                  >
                    {isAffirmationSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Salvo no Diário!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Salvar no Diário</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="pl-4 border-l-2 border-[#E6CA65]/40 py-1 space-y-2"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E6CA65]">
                  Reflexão Cósmica sob a Lua em {astroData.zodiacSign}
                </h4>
                <p className="text-sm font-light text-neutral-300 leading-relaxed">
                  A energia lunar em {astroData.zodiacSign} amplifica a clareza para discernir suas verdadeiras prioridades. Dedique alguns minutos para registrar suas percepções e alinhar seus próximos passos.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAffirmationToJournal}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#E6CA65] hover:bg-white/[0.05] transition-all"
                  >
                    {isAffirmationSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Salvo no Diário!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Salvar intenção no Diário</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Apple HIG Segmented Pill Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-center pt-2 pb-2">
        <div className="inline-flex items-center p-1 rounded-full bg-white/[0.03] backdrop-blur-2xl max-w-full overflow-x-auto no-scrollbar gap-1">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = dashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardPill"
                    className="absolute inset-0 bg-white/[0.1] rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6CA65]' : 'text-neutral-400'}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Tab View Content ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dashboardTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* TAB 1: Resumo do Dia */}
          {dashboardTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
              {/* Left Column: Práticas Favoráveis (Typographic list) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#E6CA65]" /> Práticas Favoráveis Hoje
                  </h3>
                  <button
                    onClick={() => setActiveTab('rituals')}
                    className="text-xs font-medium text-[#E6CA65] hover:text-[#E6CA65]/80 transition-all flex items-center gap-1"
                  >
                    Ver Rituais <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {top3.map((act) => {
                    const isExcellent = act.rating === 'excellent';
                    return (
                      <div
                        key={act.labelPt}
                        className="py-3.5 flex items-start justify-between gap-3 group transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            <span className="text-base">{act.emoji}</span>
                            <span>{act.labelPt}</span>
                          </div>
                          <div className="text-xs text-neutral-400 leading-relaxed mt-1">{act.tip}</div>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            isExcellent
                              ? 'bg-[#E6CA65]/10 text-[#E6CA65]'
                              : 'bg-emerald-400/10 text-emerald-300'
                          }`}
                        >
                          {isExcellent ? 'Excelente' : 'Favorável'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Alinhamento, Cautela e Newsletter */}
              <div className="md:col-span-5 space-y-6">
                {/* Natal Vibe Card */}
                <div className="space-y-3 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E6CA65]" /> Alinhamento Pessoal
                    </h3>
                    {userSign && (
                      <span className="text-xs font-medium text-[#E6CA65]/80">
                        Sol em {userSign}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    O trânsito atual da Lua no signo de <strong className="text-white font-medium">{astroData.zodiacSign}</strong> traz uma vibração propícia para foco mental, alinhamento de metas e escuta intuitiva.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => setActiveTab('astrology')}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E6CA65] hover:text-[#E6CA65]/80 transition-colors"
                    >
                      <span>Consultar Mapa Astral Completo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* What to Avoid */}
                <div className="space-y-3 pb-5 border-b border-white/[0.06]">
                  <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> O Que Evitar Hoje
                  </h4>
                  <div className="divide-y divide-white/[0.04]">
                    {bottom2.map((act) => (
                      <div key={act.labelPt} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-base">{act.emoji}</span>
                          <span className="font-normal text-neutral-300">{act.labelPt}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">Requer cautela</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private & Clean Newsletter Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm">
                      <Mail className="w-4 h-4 text-[#E6CA65]" /> Diário Lunar por E-mail
                    </div>
                    <span className="text-[10px] text-[#E6CA65]/80 font-medium">
                      Edição Diária Gratuita
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Receba o horóscopo da Lua, alertas de fases e rituais diretamente no seu e-mail para manter seu alinhamento diário.
                  </p>

                  {subscriptionFeedback ? (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        subscriptionFeedback.success
                          ? 'bg-emerald-500/10 text-emerald-200'
                          : 'bg-amber-500/10 text-amber-200'
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
                        className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#E6CA65] placeholder:text-neutral-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full bg-[#E6CA65] hover:bg-[#ebd57e] text-black font-semibold text-xs transition-colors shrink-0 shadow-sm"
                      >
                        Inscrever
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Oráculo Lunar (Immersive Daily Tarot Draw) */}
          {dashboardTab === 'oracle' && (
            <div className="space-y-4">
              <LunarOracle
                settings={settings}
                astroData={astroData}
                onNavigateToJournal={() => setActiveTab('journal')}
              />
            </div>
          )}

          {/* TAB 3: Linha do Tempo 24h (Interactive Scrubber) */}
          {dashboardTab === 'timeline' && (
            <MoonTimelineScrubber settings={settings} astroData={astroData} />
          )}

          {/* TAB 4: Timing Cósmico (Muhurtha Windows) */}
          {dashboardTab === 'muhurtha' && (
            <CosmicMuhurtha settings={settings} astroData={astroData} />
          )}
        </motion.div>
      </AnimatePresence>

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
