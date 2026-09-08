import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { getDayActivityGuide } from '../utils/activityTiming';
import { getMoonZodiacSign } from '../utils/astronomy';
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
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

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
    if (emailInput.trim()) {
      setEmailSubscribed(true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn text-[#F3F4F6]">
      {/* Sleek Moonly Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-moonly rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Moon Visual with Floating 3D Glow Effect */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <motion.div
              className="relative group cursor-pointer"
              onClick={() => openDayDetails(now)}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative overflow-hidden border border-amber-300/40 flex items-center justify-center bg-[#050508] shadow-[0_0_60px_rgba(255,215,0,0.22)]">
                <div
                  className="absolute inset-0 rounded-full opacity-95 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 35% 35%, #fffdf0 0%, #d4af37 35%, #2a2212 75%, #050508 100%)',
                  }}
                />
                <div className="relative z-10 text-6xl drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                  {moonEmoji}
                </div>
                <div className="absolute bottom-3 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-300/30 text-[10px] font-bold text-amber-200 uppercase tracking-widest shadow-md">
                  {astroData.illumination}% Iluminada
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 flex items-center gap-2 tracking-tight drop-shadow">
              <span>{phasePt}</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-1 font-semibold flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-base">{astroData.zodiacSymbol}</span>
              <span>Lua em {astroData.zodiacSign}</span>
            </p>
          </div>

          {/* Essential Info & Daily Vibe */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ritmo Energético: {guide.overallLabel} ({guide.overallEnergy}%)
              </span>
              {astroData.isVoidOfCourse && (
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/35 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Lua Fora de Curso
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Calendário Lunar & Energia Cósmica
              </h1>
              <p className="text-sm sm:text-base text-[#E5E7EB] mt-2.5 leading-relaxed font-normal">
                Dia regido por <strong className="text-amber-200 font-semibold">{guide.planetaryDayRuler}</strong>. Aproveite este momento para intuição, alinhamento interior e reconexão profunda.
              </p>
            </div>

            {/* Quick Spec Chips (Chips de Dados Astronômicos) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
                { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
                { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
                { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition-all flex flex-col items-center justify-center text-center shadow-lg group">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-200/90 font-medium mb-1 group-hover:text-amber-200 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]" /> {label}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white tracking-wide">{val}</div>
                </div>
              ))}
            </div>

            {/* Collapsible Specs Accordion Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowFullSpecs(!showFullSpecs)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-300/30 text-amber-300 text-xs font-semibold transition-all shadow-md"
              >
                <span>{showFullSpecs ? 'Ocultar detalhes astronômicos' : 'Ver especificações completas'}</span>
                {showFullSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showFullSpecs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-3 p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Idade da Lua:</span>
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.lunarAge.toFixed(1)} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Distância:</span>
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.distanceKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] font-medium">Altitude:</span>
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.altitudeDeg.toFixed(1)}°</div>
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
                      <div className="font-bold text-white text-xs sm:text-sm">{astroData.azimuthDeg.toFixed(1)}°</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Moonly Daily Affirmation Card Flip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel-gold rounded-3xl p-6 sm:p-8 cursor-pointer relative overflow-hidden shadow-xl border border-amber-300/20"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Feather className="w-4 h-4 text-amber-300" /> Afirmação do Dia • {todayAffirmation.theme}
          </div>
          <span className="text-xs text-neutral-300 hover:text-amber-200 flex items-center gap-1.5 font-medium transition-colors">
            <RotateCw className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Clique para virar
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5"
            >
              <p className="text-base sm:text-xl font-medium text-white italic leading-relaxed">
                "{todayAffirmation.text}"
              </p>
              <span className="text-xs text-amber-200/90 font-semibold block pt-1">
                ✨ Inspire profundamente 3 vezes e repita mentalmente esta intenção.
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-bold text-amber-200">Reflexão Cósmica</h4>
              <p className="text-xs sm:text-sm text-[#E5E7EB] leading-relaxed">
                A Lua em {astroData.zodiacSign} fortalece a capacidade de harmonizar pensamento e sentimento. Mantenha seu espaço sagrado limpo hoje e direcione sua intenção com presença.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Balanced 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Recommended Activities Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel rounded-3xl p-6 space-y-4 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" /> Práticas Favoráveis Hoje
            </h3>
            <button
              onClick={() => setActiveTab('rituals')}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1"
            >
              Ver Rituais <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {top3.map((act) => {
              const isExcellent = act.rating === 'excellent';
              return (
                <motion.div
                  key={act.labelPt}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between transition-all hover:bg-white/[0.07]"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-base">{act.emoji}</span>
                      <span>{act.labelPt}</span>
                    </div>
                    <div className="text-xs text-[#E5E7EB] leading-relaxed mt-1">{act.tip}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                      isExcellent
                        ? 'bg-amber-400/15 text-amber-200 border border-amber-400/35 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                        : 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/35 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                    }`}
                  >
                    {isExcellent ? 'Excelente' : 'Favorável'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column: Personal Alignment + What to Avoid + Daily Email Digest */}
        <div className="space-y-6">
          {/* Natal Aligned Vibe Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel rounded-3xl p-6 space-y-4 border border-white/10"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" /> Alinhamento Pessoal
                </h3>
                {userSign && (
                  <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-bold shadow-sm">
                    Sol em {userSign}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#E5E7EB] leading-relaxed">
                O trânsito atual da Lua no signo de <strong className="text-white font-semibold">{astroData.zodiacSign}</strong> traz uma vibração propícia para foco mental, alinhamento de intenções e escuta intuitiva.
              </p>
            </div>

            {/* Prominent Primary Call-to-Action Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('astrology')}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#fbe396] via-[#e5c158] to-[#fbe396] text-[#15111b] font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(229,193,88,0.25)] hover:shadow-[0_12px_30px_rgba(229,193,88,0.4)] transition-all border border-amber-200/50 flex items-center justify-center gap-2"
              >
                <span>Consultar Meu Mapa Astral Completo</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* What to Avoid Today (O que evitar hoje ⚠️) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass-panel rounded-3xl p-5 space-y-3 border border-white/10"
          >
            <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> O Que Evitar Hoje
            </h4>
            <div className="space-y-2">
              {bottom2.map((act) => (
                <div key={act.labelPt} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base">{act.emoji}</span>
                    <span className="font-semibold text-white">{act.labelPt}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">Requer cautela</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily Email Retention Digest */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-panel-moonly rounded-3xl p-5 space-y-3 border border-amber-300/20"
          >
            <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
              <Mail className="w-4 h-4 text-amber-300" /> Receba o Diário Lunar em seu E-mail
            </div>
            <p className="text-xs text-[#E5E7EB] leading-relaxed">
              Receba diariamente o horóscopo da Lua, fases e rituais no seu e-mail para não perder nenhum alinhamento.
            </p>

            {emailSubscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Inscrição confirmada! Você receberá os boletins diários.
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
                  className="px-4 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-[#15111b] font-bold text-xs transition-colors flex-shrink-0"
                >
                  Inscrever
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
