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
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn text-[#f4f1ea]">
      {/* ── Compact & Ethereal Celestial Hero Card ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-moonly rounded-[28px] p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Discreet ambient champagne glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#E6CA65]/[0.03] blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center relative z-10">
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
                size={200}
              />
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-medium text-[#E6CA65] shadow-sm">
                <span>{astroData.illumination}% Iluminada</span>
              </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
              {phasePt}
            </h2>
            <p className="text-xs sm:text-sm text-[#E6CA65]/90 mt-1 font-medium flex items-center gap-1.5">
              <span className="text-base">{astroData.zodiacSymbol}</span>
              <span>Lua em {astroData.zodiacSign}</span>
            </p>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#E6CA65]" />
                <span>Compartilhar Story</span>
              </button>

              <button
                onClick={() => openDayDetails(now)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6CA65]/10 hover:bg-[#E6CA65]/20 text-[#E6CA65] border border-[#E6CA65]/25 text-xs font-medium transition-all"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Essential Info & Timing Windows */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#E6CA65] text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" /> Ritmo: {guide.overallLabel} ({guide.overallEnergy}%)
              </span>
              {astroData.isVoidOfCourse && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Lua Fora de Curso
                </span>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold tracking-widest text-[#E6CA65] uppercase flex items-center gap-1.5 mb-1">
                <span>{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span>•</span>
                <span>Dia regido por {guide.planetaryDayRuler}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Sincronia Lunar & Ritmo do Dia
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                A Lua transita por <strong className="text-[#E6CA65] font-semibold">{astroData.zodiacSign}</strong>. Excelente vibração para intuição, práticas reflexivas e harmonia energética.
              </p>
            </div>

            {/* Timing Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              {[
                { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
                { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
                { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
                { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
              ].map(({ label, val, icon: Icon }) => (
                <div
                  key={label}
                  className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-medium mb-0.5">
                    <Icon className="w-3 h-3 text-[#E6CA65]" /> {label}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white font-mono">{val}</div>
                </div>
              ))}
            </div>

            {/* Collapsible Specs */}
            <div>
              <button
                onClick={() => setShowFullSpecs(!showFullSpecs)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-[11px] font-medium transition-all"
              >
                <span>{showFullSpecs ? 'Ocultar especificações' : 'Especificações completas'}</span>
                {showFullSpecs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {showFullSpecs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-2.5 p-3.5 rounded-2xl bg-black/60 border border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs"
                  >
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Idade da Lua:</span>
                      <div className="font-semibold text-white text-xs font-mono">{astroData.lunarAge.toFixed(1)} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Distância:</span>
                      <div className="font-semibold text-white text-xs font-mono">{astroData.distanceKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Altitude Atual:</span>
                      <div className="font-semibold text-white text-xs font-mono">{astroData.altitudeDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Próxima Lua Cheia:</span>
                      <div className="font-semibold text-white text-xs">{astroData.nextFullMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Próxima Lua Nova:</span>
                      <div className="font-semibold text-white text-xs">{astroData.nextNewMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Azimute:</span>
                      <div className="font-semibold text-white text-xs font-mono">{astroData.azimuthDeg.toFixed(1)}°</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Integrated Daily Affirmation Card (Hero Footer) */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#E6CA65]/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#E6CA65] font-semibold text-[11px] uppercase tracking-wider">
                <Feather className="w-3.5 h-3.5" />
                <span>Afirmação do Dia • {todayAffirmation.theme}</span>
              </div>
              <span className="text-[11px] text-neutral-400 group-hover:text-[#E6CA65] flex items-center gap-1 transition-colors">
                <RotateCw className="w-3 h-3 text-[#E6CA65] group-hover:rotate-180 transition-transform duration-500" />
                <span>{isFlipped ? 'Ver afirmação' : 'Ver reflexão cósmica'}</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-1.5"
                >
                  <p className="text-sm sm:text-base font-medium text-white italic leading-relaxed">
                    "{todayAffirmation.text}"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#E6CA65]/80 font-medium">
                      ✦ Inspire três vezes e ancore esta intenção hoje.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveAffirmationToJournal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6CA65]/10 hover:bg-[#E6CA65]/20 text-[#E6CA65] border border-[#E6CA65]/25 text-[11px] font-medium transition-all"
                    >
                      {isAffirmationSaved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Salvo!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
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
                  className="space-y-2"
                >
                  <h4 className="text-xs font-bold text-[#E6CA65]">Reflexão Cósmica sob a Lua em {astroData.zodiacSign}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A energia lunar em {astroData.zodiacSign} amplifica a clareza para discernir suas verdadeiras prioridades. Dedique alguns minutos para registrar suas percepções e alinhar seus próximos passos.
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveAffirmationToJournal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6CA65]/15 hover:bg-[#E6CA65]/25 text-[#E6CA65] border border-[#E6CA65]/30 text-xs font-semibold transition-all shadow-sm"
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
        </div>
      </motion.div>

      {/* ── Apple HIG Segmented Pill Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-center pt-2 pb-1">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl max-w-full overflow-x-auto no-scrollbar gap-1.5 shadow-lg">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = dashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardPill"
                    className="absolute inset-0 bg-white/[0.12] border border-white/[0.16] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Práticas Favoráveis */}
              <div className="glass-panel rounded-3xl p-6 space-y-4 border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#E6CA65]" /> Práticas Favoráveis Hoje
                  </h3>
                  <button
                    onClick={() => setActiveTab('rituals')}
                    className="text-xs font-semibold text-[#E6CA65] hover:text-[#E6CA65]/80 transition-all flex items-center gap-1"
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
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between transition-all hover:border-white/[0.1]"
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
                              ? 'bg-[#E6CA65]/15 text-[#E6CA65] border border-[#E6CA65]/30'
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

              {/* Right Column: Alinhamento, Cautela e Newsletter */}
              <div className="space-y-6">
                {/* Natal Vibe Card */}
                <div className="glass-panel rounded-3xl p-6 space-y-3.5 border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E6CA65]" /> Alinhamento Pessoal
                    </h3>
                    {userSign && (
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-medium">
                        Sol em {userSign}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    O trânsito atual da Lua no signo de <strong className="text-white font-medium">{astroData.zodiacSign}</strong> traz uma vibração propícia para foco mental, alinhamento de metas e escuta intuitiva.
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => setActiveTab('astrology')}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs border border-white/[0.08] flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span>Consultar Meu Mapa Astral Completo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E6CA65]" />
                    </button>
                  </div>
                </div>

                {/* What to Avoid */}
                <div className="glass-panel rounded-3xl p-5 space-y-3 border border-white/[0.06]">
                  <h4 className="text-xs font-bold text-[#E6CA65] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> O Que Evitar Hoje
                  </h4>
                  <div className="space-y-2">
                    {bottom2.map((act) => (
                      <div key={act.labelPt} className="p-3 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-base">{act.emoji}</span>
                          <span className="font-medium text-white">{act.labelPt}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">Requer cautela</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private & Clean Newsletter Box */}
                <div className="glass-panel rounded-3xl p-5 space-y-3 border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
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
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E6CA65]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#E6CA65]/20 hover:bg-[#E6CA65]/30 text-[#E6CA65] border border-[#E6CA65]/40 font-semibold text-xs transition-colors flex-shrink-0"
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
