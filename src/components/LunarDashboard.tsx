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
  const userSign = settings.natalChart?.sunSign;

  const todayAffirmation = DAILY_AFFIRMATIONS[now.getDate() % DAILY_AFFIRMATIONS.length];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Sleek Moonly Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-moonly rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

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
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative overflow-hidden border border-amber-300/30 flex items-center justify-center bg-[#050508] shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                <div
                  className="absolute inset-0 rounded-full opacity-95 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 35% 35%, #fffdf0 0%, #d4af37 35%, #2a2212 75%, #050508 100%)',
                  }}
                />
                <div className="relative z-10 text-6xl drop-shadow-2xl">
                  {moonEmoji}
                </div>
                <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-amber-200 uppercase tracking-widest">
                  {astroData.illumination}% Iluminada
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl font-bold text-white mt-4 flex items-center gap-2 tracking-tight">
              <span>{phasePt}</span>
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 font-medium flex items-center gap-1.5">
              <span>{astroData.zodiacSymbol}</span>
              <span>Lua em {astroData.zodiacSign}</span>
            </p>
          </div>

          {/* Essential Info & Daily Vibe */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Ritmo Energético: {guide.overallLabel} ({guide.overallEnergy}%)
              </span>
              {astroData.isVoidOfCourse && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Lua Fora de Curso
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Calendário Lunar & Energia Cósmica
              </h1>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed font-normal">
                Dia regido por <strong className="text-amber-200">{guide.planetaryDayRuler}</strong>. Aproveite este momento para intuição, alinhamento interior e reconexão.
              </p>
            </div>

            {/* Quick Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { label: 'Nascer da Lua', val: astroData.moonrise || '--:--', icon: Moon },
                { label: 'Ocaso da Lua', val: astroData.moonset || '--:--', icon: Sunset },
                { label: 'Nascer do Sol', val: astroData.sunrise || '--:--', icon: Sunrise },
                { label: 'Pôr do Sol', val: astroData.sunset || '--:--', icon: Sun },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-medium mb-0.5">
                    <Icon className="w-3 h-3 text-amber-300" /> {label}
                  </div>
                  <div className="text-xs font-bold text-white">{val}</div>
                </div>
              ))}
            </div>

            {/* Collapsible Specs Toggle */}
            <div className="pt-2">
              <button
                onClick={() => setShowFullSpecs(!showFullSpecs)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-semibold transition-all"
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
                    className="overflow-hidden mt-3 p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <span className="text-neutral-400 text-[10px]">Idade da Lua:</span>
                      <div className="font-semibold text-white">{astroData.lunarAge.toFixed(1)} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px]">Distância:</span>
                      <div className="font-semibold text-white">{astroData.distanceKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px]">Altitude:</span>
                      <div className="font-semibold text-white">{astroData.altitudeDeg.toFixed(1)}°</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px]">Próxima Lua Cheia:</span>
                      <div className="font-semibold text-white">{astroData.nextFullMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px]">Próxima Lua Nova:</span>
                      <div className="font-semibold text-white">{astroData.nextNewMoon.daysLeft} dias</div>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px]">Azimute:</span>
                      <div className="font-semibold text-white">{astroData.azimuthDeg.toFixed(1)}°</div>
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
        className="glass-panel-gold rounded-3xl p-6 sm:p-8 cursor-pointer relative overflow-hidden shadow-xl"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Feather className="w-4 h-4" /> Afirmação do Dia • {todayAffirmation.theme}
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <RotateCw className="w-3 h-3" /> Clique para virar
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
              className="space-y-2"
            >
              <p className="text-base sm:text-lg font-medium text-white italic leading-relaxed">
                "{todayAffirmation.text}"
              </p>
              <span className="text-xs text-amber-300/80 font-semibold block pt-1">
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
              <p className="text-xs text-neutral-200 leading-relaxed">
                A Lua em {astroData.zodiacSign} fortalece a capacidade de harmonizar pensamento e sentimento. Mantenha seu espaço sagrado limpo hoje.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid: Recommended Activities & Astrological Vibe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Activities Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" /> Práticas Favoráveis Hoje
            </h3>
            <button
              onClick={() => setActiveTab('rituals')}
              className="text-[11px] font-semibold text-neutral-400 hover:text-white transition-all"
            >
              Ver Rituais →
            </button>
          </div>

          <div className="space-y-2.5">
            {top3.map((act) => (
              <motion.div
                key={act.labelPt}
                whileHover={{ scale: 1.01, x: 4 }}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{act.emoji}</span>
                    <span>{act.labelPt}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{act.tip}</div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-amber-200 uppercase">
                  {act.rating}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Natal Aligned Vibe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300" /> Alinhamento Pessoal
              </h3>
              {userSign && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-semibold">
                  Sol em {userSign}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              O trânsito atual da Lua no signo de <strong className="text-white">{astroData.zodiacSign}</strong> traz uma vibração propícia para foco mental, alinhamento de intenções e escuta intuitiva.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('astrology')}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all text-center border border-white/10"
            >
              Consultar Meu Mapa Astral Completo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
