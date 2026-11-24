import React, { useState } from 'react';
import { getStoredJournal, saveStoredJournal } from '../utils/storage';
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
  Sun,
  Zap,
  ChevronDown,
  ChevronUp,
  Feather,
  ShieldAlert,
  ArrowRight,
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
  { id: 'summary', label: 'Energia do Dia', icon: Sparkles },
  { id: 'timeline', label: 'Linha do Tempo 24h', icon: Clock },
  { id: 'muhurtha', label: 'Timing Cósmico', icon: Sun },
  { id: 'oracle', label: 'Oráculo Lunar', icon: Compass },
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
  const [isAffirmationSaved, setIsAffirmationSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const todayAffirmation = DAILY_AFFIRMATIONS[now.getDate() % DAILY_AFFIRMATIONS.length];

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
    setTimeout(() => setIsAffirmationSaved(false), 2500);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-fadeIn text-[#f4f1ea] px-2 sm:px-0">
      {/* ── Studio Celestial Hero ─────────────────────────────────────────── */}
      <div className="relative pt-4 pb-2 flex flex-col items-center text-center">
        {/* Discreet ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#E6CA65]/[0.035] blur-3xl pointer-events-none" />

        {/* Photorealistic Moon Anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="cursor-pointer" onClick={() => openDayDetails(now)}>
            <RealisticMoon
              illumination={astroData.illumination}
              phaseCode={astroData.phaseCode}
              size={240}
            />
          </div>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] text-xs font-mono font-medium text-[#E6CA65]">
            <span>{astroData.illumination}% Iluminada</span>
            <span className="opacity-40">•</span>
            <span>Lua em {astroData.zodiacSign}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-white mt-3 tracking-tight">
            {phasePt}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md font-light leading-relaxed">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          {/* Clean Quick Actions */}
          <div className="mt-4 flex items-center gap-2.5">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-[#E6CA65]" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={() => openDayDetails(now)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E6CA65]/10 hover:bg-[#E6CA65]/20 text-[#E6CA65] text-xs font-medium transition-all"
            >
              <span>Detalhes Celestiais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Celestial Ephemeris Line */}
        <div className="w-full max-w-2xl mt-8 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
            { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
            { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
            { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                <Icon className="w-3.5 h-3.5 text-[#E6CA65]/80" />
                <span>{label}</span>
              </div>
              <div className="text-sm font-semibold text-white font-mono mt-0.5">
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Astronomical Specs */}
        <div className="mt-3">
          <button
            onClick={() => setShowFullSpecs(!showFullSpecs)}
            className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-300 text-xs font-medium transition-colors"
          >
            <span>{showFullSpecs ? 'Menos dados' : 'Mais dados astronômicos'}</span>
            {showFullSpecs ? <ChevronUp className="w-3 h-3 text-[#E6CA65]" /> : <ChevronDown className="w-3 h-3 text-[#E6CA65]" />}
          </button>

          <AnimatePresence>
            {showFullSpecs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs max-w-xl mx-auto text-left"
              >
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Idade da Lua</span>
                  <div className="font-semibold text-white font-mono mt-0.5">{astroData.lunarAge.toFixed(1)} dias</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Distância</span>
                  <div className="font-semibold text-white font-mono mt-0.5">{astroData.distanceKm.toLocaleString()} km</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Altitude</span>
                  <div className="font-semibold text-white font-mono mt-0.5">{astroData.altitudeDeg.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Próxima Lua Cheia</span>
                  <div className="font-semibold text-white mt-0.5">{astroData.nextFullMoon.daysLeft} dias</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Próxima Lua Nova</span>
                  <div className="font-semibold text-white mt-0.5">{astroData.nextNewMoon.daysLeft} dias</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Azimute</span>
                  <div className="font-semibold text-white font-mono mt-0.5">{astroData.azimuthDeg.toFixed(1)}°</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editorial Daily Affirmation */}
        <div className="w-full max-w-2xl mt-6 pt-5 border-t border-white/[0.06] text-left">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[#E6CA65] font-medium text-xs uppercase tracking-widest">
              <Feather className="w-3.5 h-3.5" />
              <span>Afirmação do Dia • {todayAffirmation.theme}</span>
            </div>
            <button
              type="button"
              onClick={handleSaveAffirmationToJournal}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E6CA65] hover:underline"
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
          <p className="text-base font-light text-neutral-200 italic leading-relaxed pl-3 border-l-2 border-[#E6CA65]/50">
            "{todayAffirmation.text}"
          </p>
        </div>
      </div>

      {/* ── Minimalist Segmented Pill Navigation ──────────────────────────── */}
      <div className="flex items-center justify-center pt-2">
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

      {/* ── Clean Tab Content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dashboardTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pb-12"
        >
          {/* TAB 1: Energia do Dia (Combined Clean Editorial List) */}
          {dashboardTab === 'summary' && (
            <div className="space-y-6 max-w-3xl mx-auto pt-2">
              {/* Favoráveis */}
              <div className="space-y-3 pb-6 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#E6CA65]" /> Práticas em Sintonia Hoje
                  </h3>
                  <button
                    onClick={() => setActiveTab('rituals')}
                    className="text-xs font-medium text-[#E6CA65] hover:text-[#E6CA65]/80 transition-all flex items-center gap-1"
                  >
                    Ver Rituais <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {top3.map((act) => (
                    <div
                      key={act.labelPt}
                      className="py-3 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-normal text-white flex items-center gap-2">
                          <span>{act.emoji}</span>
                          <span className="font-medium">{act.labelPt}</span>
                        </div>
                        <div className="text-xs text-neutral-400 leading-relaxed mt-0.5">{act.tip}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6CA65]/10 text-[#E6CA65] uppercase shrink-0">
                        {act.rating === 'excellent' ? 'Excelente' : 'Favorável'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evitar */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Requer Atenção & Cautela
                </h4>
                <div className="divide-y divide-white/[0.04]">
                  {bottom2.map((act) => (
                    <div key={act.labelPt} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{act.emoji}</span>
                        <span className="font-normal text-neutral-300">{act.labelPt}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">Energia desacelerada</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Linha do Tempo 24h */}
          {dashboardTab === 'timeline' && (
            <MoonTimelineScrubber settings={settings} astroData={astroData} />
          )}

          {/* TAB 3: Timing Cósmico */}
          {dashboardTab === 'muhurtha' && (
            <CosmicMuhurtha settings={settings} astroData={astroData} />
          )}

          {/* TAB 4: Oráculo Diário */}
          {dashboardTab === 'oracle' && (
            <LunarOracle
              settings={settings}
              astroData={astroData}
              onNavigateToJournal={() => setActiveTab('journal')}
            />
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
