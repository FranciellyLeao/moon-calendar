import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import type { NatalChart, UserSettings } from '../types';
import type { PlanetPosition, AspectData } from '../utils/planetaryPositions';
import { chartAngle, formatDMS } from '../utils/format';
import { calculateNatalChart, SIGN_DESCRIPTIONS } from '../utils/astrology';
import { CITIES_DATABASE, findCity, geocodeCityOnline } from '../utils/geocoding';
import { generateAINatalChartReading } from '../utils/gemini';
import { generateOfflineNatalReading } from '../utils/astrologyEngine';
import { resetSwissEphemeris } from '../utils/swissEphemeris';
import {
  Sparkles, Calendar, Clock, MapPin, Flame, Mountain,
  Wind, Droplets, Bot, Loader2, Cpu, Star, Grid3x3, ChevronDown, ChevronUp, Layers, Search, RefreshCw, Filter
} from 'lucide-react';

interface AstrologyChartProps {
  settings: UserSettings;
  onSaveNatalChart: (chart: NatalChart) => void;
}

type Tab = 'tropical' | 'vedic' | 'aspects' | 'houses';

const ASPECT_COLORS: Record<string, string> = {
  'Conjunção': 'text-white',
  'Oposição': 'text-red-400',
  'Quadratura': 'text-orange-400',
  'Trígono': 'text-green-400',
  'Sextil': 'text-blue-400',
  'Quincúncio': 'text-yellow-400',
  'Semi-sextil': 'text-cyan-300',
  'Semiquadratura': 'text-pink-400',
  'Quintil': 'text-emerald-300',
  'Septil': 'text-purple-300',
  'Nonil': 'text-[#d5a4c8]',
  'Decil': 'text-amber-200',
};

const ASPECT_BG: Record<string, string> = {
  'Conjunção': 'bg-white/10 border-white/20',
  'Oposição': 'bg-red-500/10 border-red-500/20',
  'Quadratura': 'bg-orange-500/10 border-orange-500/20',
  'Trígono': 'bg-green-500/10 border-green-500/20',
  'Sextil': 'bg-blue-500/10 border-blue-500/20',
  'Quincúncio': 'bg-yellow-500/10 border-yellow-500/20',
  'Semi-sextil': 'bg-cyan-500/10 border-cyan-500/20',
  'Semiquadratura': 'bg-pink-500/10 border-pink-500/20',
  'Quintil': 'bg-emerald-500/10 border-emerald-500/20',
  'Septil': 'bg-purple-500/10 border-purple-500/20',
  'Nonil': 'bg-fuchsia-500/10 border-fuchsia-500/20',
  'Decil': 'bg-amber-500/10 border-amber-500/20',
};

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const softSpring = { type: 'spring' as const, stiffness: 260, damping: 24 };

const NATURE_ICON: Record<string, string> = {
  harmonious: '💚',
  tense: '🔴',
  neutral: '⚪',
};

/**
 * Anti-collision algorithm for radial planet staggering
 */
function getRadialLevels(planets: PlanetPosition[]): number[] {
  const sorted = planets.map((p, originalIdx) => ({ lng: p.longitude, originalIdx }))
    .sort((a, b) => a.lng - b.lng);

  const levels = new Array(planets.length).fill(0);
  for (let i = 0; i < sorted.length; i++) {
    let clusterIdx = 0;
    for (let j = i - 1; j >= 0; j--) {
      const diff = Math.abs(sorted[i].lng - sorted[j].lng);
      const dist = Math.min(diff, 360 - diff);
      if (dist < 6) {
        clusterIdx = (levels[sorted[j].originalIdx] + 1) % 3;
      } else {
        break;
      }
    }
    levels[sorted[i].originalIdx] = clusterIdx;
  }
  return levels;
}

/**
 * SVG Mandala Wheel Renderer
 * Ascendant (ascendant, ascendant) === 180° (Left horizontal axis / 9 o'clock)
 */
const ChartWheel: React.FC<{ planets: PlanetPosition[]; ascendant: number; cusps: number[]; aspects: AspectData[] }> = ({ planets, ascendant, cusps, aspects }) => {
  const cx = 150, cy = 150;
  const outerR = 135, innerR = 100, coreR = 60, centerR = 20;

  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);

  const getSvgRad = (longitude: number) => {
    const angle = chartAngle(longitude, ascendant);
    return (angle * Math.PI) / 180;
  };

  const radialLevels = getRadialLevels(planets);

  return (
    <div className="relative w-full h-full">
      <motion.svg
        viewBox="0 0 300 300"
        className="w-full h-full drop-shadow-[0_24px_50px_rgba(80,62,130,0.24)]"
        initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* Outer zodiac ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={cx} cy={cy} r={centerR} fill="#0a0a0a" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

        {/* House Cusp lines */}
        {cusps.map((cuspLng, i) => {
          const rad = getSvgRad(cuspLng);
          const x1 = cx + coreR * Math.cos(rad);
          const y1 = cy - coreR * Math.sin(rad);
          const x2 = cx + outerR * Math.cos(rad);
          const y2 = cy - outerR * Math.sin(rad);
          const isAxis = i === 0 || i === 9; // ASC (House 1) or MC (House 10)
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isAxis ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.12)"}
              strokeWidth={isAxis ? 1.5 : 0.8}
              strokeDasharray={isAxis ? undefined : "3 3"}
            />
          );
        })}

        {/* Internal Aspect Chords with Interactive Highlight */}
        {aspects.slice(0, 25).map((asp, idx) => {
          const p1 = planets.find(p => p.planet === asp.planet1);
          const p2 = planets.find(p => p.planet === asp.planet2);
          if (!p1 || !p2) return null;

          const rad1 = getSvgRad(p1.longitude);
          const rad2 = getSvgRad(p2.longitude);

          const x1 = cx + coreR * Math.cos(rad1);
          const y1 = cy - coreR * Math.sin(rad1);
          const x2 = cx + coreR * Math.cos(rad2);
          const y2 = cy - coreR * Math.sin(rad2);

          const isConnectedToHovered = hoveredPlanet && (asp.planet1 === hoveredPlanet.planet || asp.planet2 === hoveredPlanet.planet);
          const isDimmed = hoveredPlanet && !isConnectedToHovered;

          const baseColor = asp.nature === 'harmonious'
            ? 'rgba(52,211,153,0.35)'
            : asp.nature === 'tense'
            ? 'rgba(248,113,113,0.35)'
            : 'rgba(255,255,255,0.2)';

          const strokeColor = isConnectedToHovered
            ? (asp.nature === 'harmonious' ? '#34D399' : asp.nature === 'tense' ? '#F87171' : '#FBBF24')
            : isDimmed
            ? 'rgba(255,255,255,0.04)'
            : baseColor;

          const strokeWidth = isConnectedToHovered ? 2.5 : (asp.isMinor ? 0.6 : 1);

          return (
            <line
              key={idx}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={asp.isMinor && !isConnectedToHovered ? "2 2" : undefined}
            />
          );
        })}

        {/* Zodiac sign symbols in outer ring */}
        {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((sym, i) => {
          const signCenterLng = i * 30 + 15;
          const rad = getSvgRad(signCenterLng);
          const r = (outerR + innerR) / 2;
          return (
            <text key={i} x={cx + r * Math.cos(rad)} y={cy - r * Math.sin(rad)}
              textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="medium">
              {sym}
            </text>
          );
        })}

        {/* Planets with radial level staggering & Interactive Hover */}
        {planets.map((planet, i) => {
          const rad = getSvgRad(planet.longitude);
          const level = radialLevels[i] || 0;
          const r = innerR - 14 - level * 11;
          const px = cx + r * Math.cos(rad);
          const py = cy - r * Math.sin(rad);
          const isHovered = hoveredPlanet?.planet === planet.planet;

          return (
            <motion.g
              key={planet.planet}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: isHovered ? 1.3 : 1 }}
              transition={{ ...softSpring, delay: 0.18 + i * 0.03 }}
              style={{ transformOrigin: `${px}px ${py}px`, cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPlanet(planet)}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={() => setHoveredPlanet(hoveredPlanet?.planet === planet.planet ? null : planet)}
            >
              <circle
                cx={px} cy={py} r={isHovered ? "11" : "8.5"}
                fill={isHovered ? "#FBBF24" : "#1c1c1e"}
                stroke={isHovered ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                strokeWidth={isHovered ? "2" : "1"}
                className={isHovered ? "drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" : ""}
              />
              <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
                fill={isHovered ? "#000000" : (planet.isRetrograde ? '#ff9f0a' : '#ffffff')}
                fontSize={isHovered ? "8.5" : "7.5"} fontWeight="bold">
                {planet.symbol}
              </text>
            </motion.g>
          );
        })}

        {/* Horizontal ASC Axis line (Left = ASC) */}
        <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={cx - outerR + 6} y={cy - 5} fill="white" fontSize="8" fontWeight="bold">ASC</text>
        <text x={cx + outerR - 22} y={cy - 5} fill="rgba(255,255,255,0.5)" fontSize="7">DSC</text>

        {/* Center Label */}
        <text x={cx} y={cy - 3} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="bold">SWISS EPHEMERIS</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="5.5">100% ASTRO.COM</text>
      </motion.svg>

      {/* Floating Glassmorphism Planet Tooltip */}
      <AnimatePresence>
        {hoveredPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#141419]/95 border border-amber-300/40 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl pointer-events-none text-center z-30 space-y-0.5"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white">
              <span className="text-amber-300 text-sm">{hoveredPlanet.symbol}</span>
              <span className="capitalize">{hoveredPlanet.planet}</span>
              {hoveredPlanet.isRetrograde && (
                <span className="text-[10px] text-amber-400 font-extrabold px-1 rounded bg-amber-400/20">Rx</span>
              )}
            </div>
            <div className="text-[11px] text-neutral-300 font-medium">
              {hoveredPlanet.sign} • Casa {hoveredPlanet.house}
            </div>
            <div className="text-[10px] text-amber-200/90 font-semibold">
              {formatDMS(hoveredPlanet.degree)} (° ' ")
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AstrologyChart: React.FC<AstrologyChartProps> = ({ settings, onSaveNatalChart }) => {
  const lang = settings.language;
  const initialChart = settings.natalChart ?? null;

  const [birthDate, setBirthDate] = useState(initialChart?.birthDate || '1995-05-15');
  const [birthTime, setBirthTime] = useState(initialChart?.birthTime || '08:30');
  const [birthCity, setBirthCity] = useState(initialChart?.birthCity || 'São Paulo');
  const [lat, setLat] = useState<number>(initialChart?.lat ?? -23.5505);
  const [lng, setLng] = useState<number>(initialChart?.lng ?? -46.6333);

  const [utcOffset, setUtcOffset] = useState<number>(initialChart?.utcOffset ?? -3);
  const [houseSystem, setHouseSystem] = useState<'Placidus' | 'Equal' | 'WholeSign'>(
    initialChart?.houseSystem ?? 'Placidus'
  );
  const [showMinorAspects, setShowMinorAspects] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(!initialChart);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  const [chart, setChart] = useState<NatalChart | null>(initialChart);
  const [activeTab, setActiveTab] = useState<Tab>('tropical');
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [engineType, setEngineType] = useState<'gemini' | 'offline'>('offline');
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (settings.natalChart) {
      setBirthDate(settings.natalChart.birthDate || '1995-05-15');
      setBirthTime(settings.natalChart.birthTime || '08:30');
      setBirthCity(settings.natalChart.birthCity || 'São Paulo');
      if (settings.natalChart.lat) setLat(settings.natalChart.lat);
      if (settings.natalChart.lng) setLng(settings.natalChart.lng);
      if (settings.natalChart.utcOffset) setUtcOffset(settings.natalChart.utcOffset);
    }
  }, [settings.natalChart]);

  // Auto-trigger natal chart reading synthesis post-calculation
  useEffect(() => {
    if (chart && !aiReading && !isGeneratingAI) {
      handleGenerateNatalReading('offline');
    }
  }, [chart]);

  useEffect(() => {
    if (initialChart) return;

    let cancelled = false;

    (async () => {
      setIsCalculating(true);
      setCalculationError(null);

      try {
        const firstChart = await calculateNatalChart(
          '1995-05-15',
          '08:30',
          'São Paulo',
          -23.5505,
          -46.6333,
          -3,
          'Placidus'
        );

        if (!cancelled) {
          setChart(firstChart);
          onSaveNatalChart(firstChart);
        }
      } catch (error) {
        console.error('[AstrologyChart] Erro ao calcular mapa inicial:', error);
        if (!cancelled) {
          setCalculationError(
            error instanceof Error
              ? error.message
              : 'Erro desconhecido ao calcular o mapa astral.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleCityChange = (cityName: string) => {
    setBirthCity(cityName);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const match = findCity(cityName);
    if (match) {
      setLat(match.lat);
      setLng(match.lng);
      setUtcOffset(match.defaultUtcOffset);
      return;
    }

    if (cityName.trim().length > 3) {
      setIsGeocoding(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const online = await geocodeCityOnline(cityName);
        if (online) {
          setLat(online.lat);
          setLng(online.lng);
          setUtcOffset(online.defaultUtcOffset);
        }
        setIsGeocoding(false);
      }, 600);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const newChart = await calculateNatalChart(
        birthDate, birthTime, birthCity, lat, lng, utcOffset, houseSystem
      );
      setChart(newChart);
      setAiReading(null);
      onSaveNatalChart(newChart);
    } catch (error) {
      console.error('[AstrologyChart] Erro ao recalcular:', error);
      setCalculationError(
        error instanceof Error ? error.message : 'Erro ao calcular o mapa astral.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateNatalReading = async (mode: 'gemini' | 'offline') => {
    if (!chart) return;
    setIsGeneratingAI(true);
    setEngineType(mode);
    try {
      if (mode === 'gemini') {
        const text = await generateAINatalChartReading(chart, lang);
        setAiReading(text);
      } else {
        const text = generateOfflineNatalReading(chart);
        setAiReading(text);
      }
    } catch {
      const text = generateOfflineNatalReading(chart);
      setAiReading(text);
      setEngineType('offline');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Error boundary view with retry button
  if (!chart && calculationError) {
    return (
      <div className="mx-auto max-w-xl rounded-[32px] border border-red-400/20 bg-[#151019] p-8 text-center shadow-2xl my-12">
        <div className="text-3xl text-amber-300">✦</div>

        <h2 className="mt-4 text-xl font-semibold text-white">
          Não conseguimos carregar seu céu
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/70">
          {calculationError}
        </p>

        <button
          type="button"
          onClick={() => {
            resetSwissEphemeris();
            setCalculationError(null);
            setRetryKey((value) => value + 1);
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#eee6ff] px-6 py-3 text-sm font-semibold text-[#17121d] hover:bg-white transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!chart || isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-white gap-3 p-8 bg-[#0c0912] rounded-[36px] border border-white/10 max-w-xl mx-auto text-center shadow-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
        <span className="font-semibold text-sm">Montando seu céu com a Swiss Ephemeris...</span>
        <span className="text-xs text-neutral-400">Carregando posições planetárias, casas e aspectos de alta precisão.</span>
      </div>
    );
  }

  const sunDesc = SIGN_DESCRIPTIONS[chart.sunSign] || SIGN_DESCRIPTIONS['Taurus'];
  const moonDesc = SIGN_DESCRIPTIONS[chart.moonSign] || SIGN_DESCRIPTIONS['Scorpio'];
  const risingDesc = SIGN_DESCRIPTIONS[chart.risingSign] || SIGN_DESCRIPTIONS['Cancer'];

  const fullChart = chart.fullChart;
  const rawAspects: AspectData[] = fullChart?.aspects || [];
  const filteredAspects = showMinorAspects ? rawAspects : rawAspects.filter(a => !a.isMinor);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'tropical', label: 'Tropical', emoji: '☀️' },
    { id: 'vedic', label: 'Védico', emoji: '🕉️' },
    { id: 'aspects', label: 'Aspectos', emoji: '⭐' },
    { id: 'houses', label: 'Casas', emoji: '🏠' },
  ];

  const renderPlanetRow = (p: PlanetPosition, _i: number) => (
    <motion.div key={p.planet}
      variants={fadeUp}
      whileHover={{ x: 4, scale: 1.008 }}
      transition={softSpring}
      className="group flex items-center gap-3 py-3 px-3.5 rounded-[18px] bg-white/[0.035] border border-white/[0.07] hover:bg-white/[0.055] hover:border-[#c7b6ff]/25 transition-colors">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
          <span>{p.planet}</span>
          {p.isRetrograde && (
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              ℞ Retrógrado
            </span>
          )}
        </div>
        <div className="text-[11px] text-neutral-400 mt-0.5">
          {p.signSymbol} <strong className="text-neutral-200">{p.signPt}</strong> — {formatDMS(p.longitude, true)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-medium text-neutral-300">Casa {p.house}</div>
      </div>
    </motion.div>
  );

  const renderVedicRow = (p: PlanetPosition, _i: number) => (
    <motion.div key={p.planet}
      variants={fadeUp}
      whileHover={{ x: 4, scale: 1.008 }}
      transition={softSpring}
      className="group flex items-center gap-3 py-3 px-3.5 rounded-[18px] bg-white/[0.035] border border-white/[0.07] hover:bg-white/[0.055] hover:border-[#c7b6ff]/25 transition-colors">
      <span className="text-lg w-7 text-center">{p.symbol}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">{p.planet}</div>
        <div className="text-[11px] text-neutral-400">
          {p.signSymbol} <strong className="text-neutral-200">{p.vedicSign}</strong> — {formatDMS(p.longitude, true)}
        </div>
        {p.nakshatra && (
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Nakshatra: <span className="text-neutral-300">{p.nakshatra}</span> ({p.nakshatraRuler}) Pada {p.nakshatraPada}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-xs font-medium text-neutral-300">Casa {p.house}</div>
      </div>
    </motion.div>
  );

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="relative isolate space-y-6 max-w-6xl mx-auto overflow-hidden rounded-[36px] bg-[#0d0b13] p-3 sm:p-5 text-[#f7f3ee] shadow-[0_36px_120px_rgba(0,0,0,0.38)]"
    >
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 -z-10 h-80 w-80 rounded-full bg-[#7a5cff]/20 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute top-[38%] -left-32 -z-10 h-72 w-72 rounded-full bg-[#d5a4c8]/10 blur-[100px]" />
      {/* Header Banner */}
      <motion.section variants={fadeUp} className="relative overflow-hidden bg-[linear-gradient(135deg,#1d1828_0%,#15121d_58%,#21182a_100%)] rounded-[32px] p-6 sm:p-8 border border-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div aria-hidden className="absolute -top-16 right-6 h-40 w-40 rounded-full bg-[#bca8ff]/15 blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[#ded7e8] text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Algoritmo Swiss Ephemeris Astro.com 100%
            </div>
            <h1 className="max-w-2xl text-3xl sm:text-5xl font-semibold text-[#fbf7f1] tracking-[-0.035em] leading-[0.98]">
              Seu céu, traduzido em clareza
            </h1>
            <p className="text-sm sm:text-base text-[#bcb5c6] max-w-2xl mt-3 leading-relaxed">
              Uma leitura visual do seu mapa natal com planetas, casas, aspectos maiores e menores, Lilith, Parte da Fortuna e Vértice.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={softSpring}
              onClick={() => handleGenerateNatalReading('offline')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-neutral-300" /> Motor Interno
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={softSpring}
              onClick={() => handleGenerateNatalReading('gemini')}
              disabled={isGeneratingAI}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all"
            >
              {isGeneratingAI ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <><Bot className="w-4 h-4" /> Gemini IA</>
              )}
            </motion.button>
          </div>
        </div>

        {/* Big 3 & Extended Points Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {[
            { label: '☉ Sol', value: `${chart.sunSymbol} ${fullChart?.tropical[0]?.signPt || chart.sunSign}` },
            { label: '☽ Lua', value: `${chart.moonSymbol} ${fullChart?.tropical[1]?.signPt || chart.moonSign}` },
            { label: '↑ Ascendente', value: `${chart.risingSymbol} ${fullChart?.ascendantSignPt || chart.risingSign}` },
            ...(fullChart ? [
              { label: 'MC (Meio do Céu)', value: `${fullChart.midheavenSymbol} ${fullChart.midheavenSignPt}` },
              { label: '⚸ Lilith', value: fullChart.tropical.find(p => p.planet === 'Lilith')?.signPt || 'Câncer' },
              { label: '⊗ Fortuna', value: fullChart.tropical.find(p => p.planet === 'Parte da Fortuna')?.signPt || 'Áries' },
            ] : []),
          ].map(b => (
            <div key={b.label} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1.5">{b.label}:</span>
              <span className="text-xs font-semibold text-white">{b.value}</span>
            </div>
          ))}
          {fullChart && (
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 mr-1.5">Ayanamsha:</span>
              <span className="text-xs font-semibold text-white">{fullChart.ayanamsha}°</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* AI Reading Synthesis */}
      <AnimatePresence mode="wait">
      {aiReading && (
        <motion.section
          key="ai-reading"
          variants={fadeUp}
          initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
          className="bg-[#17141e]/95 rounded-[30px] p-6 sm:p-8 border border-white/[0.08] space-y-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center justify-between text-white font-bold text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" /> Síntese do Mapa Astral
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
              {engineType === 'gemini' ? 'Gemini IA' : 'Motor Interno'}
            </span>
          </div>
          <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap bg-black/50 p-5 rounded-2xl border border-white/10">
            {aiReading}
          </div>
        </motion.section>
      )}
      </AnimatePresence>

      {/* Main 2-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sticky Mandala Wheel (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
          {fullChart && (
            <motion.section variants={fadeUp} className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(145,119,214,0.12),transparent_48%),#17141e] rounded-[34px] p-5 sm:p-7 border border-white/[0.08] shadow-[0_26px_80px_rgba(0,0,0,0.24)]">
              <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3 text-center">
                Mandala Astrológica — Passe o mouse nos planetas
              </h2>
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
                <ChartWheel planets={fullChart.tropical} ascendant={fullChart.ascendant} cusps={fullChart.houseCusps} aspects={filteredAspects} />
              </div>
            </motion.section>
          )}

          {/* Elements Distribution */}
          <div className="bg-[#17141e]/92 backdrop-blur-xl rounded-[30px] p-5 border border-white/[0.08] space-y-3.5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Distribuição dos Elementos
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '🔥 Fogo', val: chart.elements.fire, icon: Flame },
                { label: '⛰️ Terra', val: chart.elements.earth, icon: Mountain },
                { label: '💨 Ar', val: chart.elements.air, icon: Wind },
                { label: '💧 Água', val: chart.elements.water, icon: Droplets },
              ].map(({ label, val }) => (
                <div key={label} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between text-neutral-300 text-[11px]">
                    <span>{label}</span>
                    <span className="font-bold text-white">{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black overflow-hidden">
                    <div className="h-full bg-white transition-all duration-700 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tab Inspector & Collapsible Birth Bar (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Collapsible Birth Bar */}
          <div className="bg-[#17141e]/92 backdrop-blur-xl rounded-[24px] border border-white/[0.08] overflow-hidden shadow-lg">
            <div
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>
                  <strong>{birthCity}</strong> · {birthDate} às {birthTime} ({houseSystem})
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
                <span>{isFormOpen ? 'Ocultar' : 'Editar Dados'}</span>
                {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            <AnimatePresence>
              {isFormOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5 pb-5 pt-2 border-t border-white/10"
                >
                  <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Data de Nascimento
                        </label>
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Hora Local Exata (HH:MM)
                        </label>
                        <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Cidade de Nascimento</span>
                        {isGeocoding && <span className="text-[10px] text-amber-300 animate-pulse flex items-center gap-1"><Search className="w-3 h-3" /> Buscando...</span>}
                      </label>
                      <input
                        type="text"
                        value={birthCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder="Ex: São Paulo, Balneário Camboriú..."
                        list="city-options"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                        required
                      />
                      <datalist id="city-options">
                        {CITIES_DATABASE.map(c => (
                          <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
                        ))}
                      </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium text-[11px]">Fuso UTC</label>
                        <input
                          type="number"
                          value={utcOffset}
                          step="0.5"
                          min="-12"
                          max="14"
                          onChange={(e) => setUtcOffset(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium text-[11px] flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Sistema Casas
                        </label>
                        <select
                          value={houseSystem}
                          onChange={(e) => setHouseSystem(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none text-xs"
                        >
                          <option value="Placidus">Placidus (Astro.com)</option>
                          <option value="Equal">Casas Iguais</option>
                          <option value="WholeSign">Whole Sign</option>
                        </select>
                      </div>
                    </div>

                    <motion.button type="submit"
                      disabled={isCalculating}
                      whileHover={isCalculating ? undefined : { y: -2, scale: 1.005 }}
                      whileTap={isCalculating ? undefined : { scale: 0.985 }}
                      transition={softSpring}
                      className="w-full py-3 rounded-xl bg-[#f6f0e8] hover:bg-white text-[#15121b] font-semibold text-xs transition-colors shadow-md disabled:opacity-50 disabled:cursor-wait">
                      {isCalculating ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Recalculando...</span>
                      ) : (
                        'Confirmar e Atualizar Mapa'
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab Selector */}
          <motion.div variants={fadeUp} className="flex items-center gap-1.5 bg-[#17141e]/90 rounded-[22px] p-1.5 border border-white/[0.08] backdrop-blur-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-[16px] text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? 'text-[#15121b]' : 'text-[#aaa3b3] hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="active-chart-tab"
                    className="absolute inset-0 rounded-[16px] bg-[#f4eee6]"
                    transition={softSpring}
                  />
                )}
                <span className="relative z-10 truncate">{tab.emoji} {tab.label}</span>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
          {/* Tropical Tab */}
          {activeTab === 'tropical' && fullChart && (
            <motion.section key="tropical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="bg-[#17141e]/92 backdrop-blur-xl rounded-[30px] p-5 border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.18)] space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Posições Planetárias & Pontos Exatos</h3>
                </div>
                <span className="text-[11px] text-neutral-400">Sistema: {houseSystem}</span>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
                {fullChart.tropical.map(renderPlanetRow)}
              </motion.div>
            </motion.section>
          )}

          {/* Vedic Tab */}
          {activeTab === 'vedic' && fullChart && (
            <motion.section key="vedic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="bg-[#17141e]/92 backdrop-blur-xl rounded-[30px] p-5 border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.18)] space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕉️</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Jyotish — Zodíaco Védico (Sidéreo)</h3>
                    <p className="text-[10px] text-neutral-400">Ayanamsha Lahiri: {fullChart.ayanamsha}°</p>
                  </div>
                </div>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
                {fullChart.vedic.map(renderVedicRow)}
              </motion.div>
            </motion.section>
          )}

          {/* Aspects Tab */}
          {activeTab === 'aspects' && (
            <motion.section key="aspects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="bg-[#17141e]/92 backdrop-blur-xl rounded-[30px] p-5 border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.18)] space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h3 className="text-sm font-bold text-white">Aspectos Astrológicos</h3>
                </div>
                <button
                  onClick={() => setShowMinorAspects(!showMinorAspects)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    showMinorAspects ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>{showMinorAspects ? 'Aspectos Menores Ativos' : 'Apenas Maiores'}</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredAspects.map((asp, i) => (
                  <div key={i}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${ASPECT_BG[asp.aspect] || 'bg-white/5 border-white/10'}`}
                    onClick={() => setExpandedAspect(expandedAspect === i ? null : i)}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.p1Symbol}
                      </span>
                      <span className={`text-xs font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.aspect}
                      </span>
                      <span className={`text-sm font-bold ${ASPECT_COLORS[asp.aspect] || 'text-white'}`}>
                        {asp.p2Symbol}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">
                        {asp.planet1} × {asp.planet2}
                      </span>
                      <span className="ml-auto text-[10px] text-neutral-500">
                        orb {asp.orb}° {NATURE_ICON[asp.nature]}
                      </span>
                      {expandedAspect === i
                        ? <ChevronUp className="w-3 h-3 text-neutral-400" />
                        : <ChevronDown className="w-3 h-3 text-neutral-400" />
                      }
                    </div>
                    {expandedAspect === i && (
                      <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                        {asp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Houses Tab */}
          {activeTab === 'houses' && fullChart && (
            <motion.section key="houses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="bg-[#17141e]/92 backdrop-blur-xl rounded-[30px] p-5 border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.18)] space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Cúspides das 12 Casas ({houseSystem})</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOUSE_MEANINGS.map(({ house, meaning, area }, i) => {
                  const cuspLng = fullChart.houseCusps[i];
                  const houseData = chart.houses[i];
                  return (
                    <div key={house}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{house}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>{houseData?.symbol}</span>
                          <span>{houseData?.sign}</span>
                          <span className="text-[10px] text-neutral-400">({formatDMS(cuspLng)})</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">{area}</div>
                        <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{meaning}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          </AnimatePresence>

          {/* Big 3 Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Sol ☉', sign: fullChart?.tropical[0]?.signPt || chart.sunSign, symbol: chart.sunSymbol, desc: sunDesc },
              { label: 'Lua ☽', sign: fullChart?.tropical[1]?.signPt || chart.moonSign, symbol: chart.moonSymbol, desc: moonDesc },
              { label: 'Ascendente ↑', sign: fullChart?.ascendantSignPt || chart.risingSign, symbol: chart.risingSymbol, desc: risingDesc },
            ].map(({ label, sign, symbol, desc }) => (
              <motion.div key={label} whileHover={{ y: -4 }} transition={softSpring} className="bg-[#17141e]/92 rounded-[24px] p-4 border border-white/[0.08] shadow-[0_14px_40px_rgba(0,0,0,0.16)] space-y-1">
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">{label}</div>
                <div className="text-base font-bold text-white">{symbol} {sign}</div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  {lang === 'pt-BR' ? desc.pt : desc.en}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </MotionConfig>
  );
};

const HOUSE_MEANINGS = [
  { house: 'I (ASC)', area: 'Identidade', meaning: 'Aparência, personalidade e início de tudo.' },
  { house: 'II', area: 'Recursos', meaning: 'Finanças, valores pessoais e posses.' },
  { house: 'III', area: 'Comunicação', meaning: 'Mente, fala, irmãos e viagens curtas.' },
  { house: 'IV (IC)', area: 'Lar & Família', meaning: 'Raízes, infância, lar e vida privada.' },
  { house: 'V', area: 'Criatividade', meaning: 'Amor, prazer, filhos e expressão artística.' },
  { house: 'VI', area: 'Saúde & Trabalho', meaning: 'Rotinas, saúde, serviço diário.' },
  { house: 'VII (DSC)', area: 'Parcerias', meaning: 'Casamento, sociedades e relacionamentos.' },
  { house: 'VIII', area: 'Transformação', meaning: 'Morte, heranças, sexualidade e ocultismo.' },
  { house: 'IX', area: 'Expansão', meaning: 'Filosofia, viagens longas, religião e espiritualidade.' },
  { house: 'X (MC)', area: 'Carreira', meaning: 'Status, reputação e vida pública.' },
  { house: 'XI', area: 'Comunidade', meaning: 'Amizades, grupos, sonhos e objetivos futuros.' },
  { house: 'XII', area: 'Espiritualidade', meaning: 'Inconsciente, karma, recolhimento e transcendência.' },
];
