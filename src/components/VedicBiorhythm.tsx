import React, { useState, useEffect } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { calcFullVedicBiorhythm } from '../utils/vedicBiorhythm';
import { Activity, Flame, Moon, Sparkles, HeartPulse, Brain, Zap, Shield, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface VedicBiorhythmProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const VedicBiorhythmView: React.FC<VedicBiorhythmProps> = ({ settings, astroData }) => {
  const [birthDateInput, setBirthDateInput] = useState<string>(
    settings.natalChart?.birthDate || '1995-05-15'
  );

  useEffect(() => {
    if (settings.natalChart?.birthDate) {
      setBirthDateInput(settings.natalChart.birthDate);
    }
  }, [settings.natalChart?.birthDate]);

  const birthDate = new Date(birthDateInput || '1995-05-15');
  const now = new Date();

  // Estimate today's sidereal longitude from AstroData or fallback
  const moonSiderealLng = astroData.illumination * 3.6;
  const data = calcFullVedicBiorhythm(birthDate, now, moonSiderealLng);

  const { taraBala, doshaRhythm, biorhythmScores } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn text-[#F3F4F6]">
      {/* HIG Floating Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-bold mb-2.5 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Biorritmo Védico & Relógio Ayurvédico
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-amber-300" />
            <span>Seus Ciclos Vitais (Jyotish)</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1.5 max-w-2xl font-normal leading-relaxed">
            Monitore o alinhamento das suas energias vitais (Prana & Ojas), o biorritmo das mansões lunares (Tara Bala) e a fase biológica do seu relógio dosha.
          </p>
        </div>

        {/* Date Controls Input */}
        <div className="bg-[#1C1C1E] border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-lg shrink-0">
          <Calendar className="w-4 h-4 text-amber-300" />
          <div className="text-xs">
            <span className="block text-[10px] text-neutral-400 font-medium">Nascimento:</span>
            <input
              type="date"
              value={birthDateInput}
              onChange={(e) => setBirthDateInput(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none text-xs"
            />
          </div>
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tara Bala (Nakshatra Biorhythm) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#121218]/80 backdrop-blur-xl rounded-[28px] p-6 border border-white/[0.08] hover:border-amber-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-amber-300" /> Tara Bala Lunar
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  taraBala.type === 'favorable'
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                    : taraBala.type === 'challenging'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-neutral-300'
                }`}
              >
                {taraBala.type === 'favorable' ? 'Favorável' : taraBala.type === 'challenging' ? 'Cautela' : 'Neutro'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">{taraBala.namePt}</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mt-2">{taraBala.description}</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-amber-200 font-semibold block">💡 Recomendação do Dia:</span>
            <p className="text-xs text-white leading-relaxed">{taraBala.recommendation}</p>
          </div>
        </motion.div>

        {/* Card 2: Ayurvedic Dosha Clock */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#121218]/80 backdrop-blur-xl rounded-[28px] p-6 border border-amber-300/20 hover:border-amber-300/40 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-300" /> Relógio Ayurvédico
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                {doshaRhythm.hoursRange}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 rounded-2xl bg-black/50 border border-white/10">
                {doshaRhythm.emoji}
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Fase {doshaRhythm.currentDosha}</h3>
                <span className="text-xs text-amber-200/90 font-medium">{doshaRhythm.element}</span>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed mt-3">{doshaRhythm.quality}</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs">
            <div className="flex items-center gap-1 text-amber-200 font-semibold text-[10px]">
              <span>🔥 Atividade Ideal:</span>
            </div>
            <p className="text-white leading-relaxed">{doshaRhythm.bestActivity}</p>
          </div>
        </motion.div>

        {/* Card 3: Prana & Ojas Vitality Level */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#121218]/80 backdrop-blur-xl rounded-[28px] p-6 border border-white/[0.08] hover:border-amber-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-300" /> Prana & Ojas (Panchang)
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Tithi Atual</span>
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">{data.tithiPhaseName}</h3>

            <div className="space-y-3 pt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> Prana (Energia Vital)
                  </span>
                  <span className="font-bold text-white">{data.pranaLevel}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-700"
                    style={{ width: `${data.pranaLevel}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-300" /> Ojas (Imunidade & Estabilidade)
                  </span>
                  <span className="font-bold text-white">{data.ojasLevel}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-200 transition-all duration-700"
                    style={{ width: `${data.ojasLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#A1A1AA] pt-1">
            Nakshatra Natal: <strong className="text-white">{data.birthNakshatra}</strong> • Hoje: <strong className="text-amber-200">{data.todayNakshatra}</strong>
          </div>
        </motion.div>
      </div>

      {/* Interactive SVG Biorhythm Sine Waves (-7 to +7 days) */}
      <div className="bg-[#121218]/80 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-white/10 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-300" />
              <span>Ondas dos Três Ciclos Biológicos (15 Dias)</span>
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1 font-normal">
              Tendência geral hoje: <strong className="text-amber-200 font-semibold">{biorhythmScores.dominantTrend}</strong> ({biorhythmScores.overallScore}% Alinhamento).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Físico (23d)</span>
            <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Emocional (28d)</span>
            <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Intelectual (33d)</span>
          </div>
        </div>

        {/* SVG Sine Wave Canvas */}
        {(() => {
          const daysRange = Array.from({ length: 15 }, (_, i) => i - 7);
          const width = 600;
          const height = 160;
          const paddingX = 30;
          const usableW = width - 2 * paddingX;
          const midY = height / 2;
          const maxAmp = 55;

          const getCoords = (dayOffset: number, period: number) => {
            const date = new Date(now.getTime() + dayOffset * 86400000);
            const daysDiff = (date.getTime() - birthDate.getTime()) / 86400000;
            const val = Math.sin((2 * Math.PI * daysDiff) / period);
            const x = paddingX + ((dayOffset + 7) / 14) * usableW;
            const y = midY - val * maxAmp;
            return { x, y, val: Math.round(val * 100) };
          };

          const physPoints = daysRange.map((d) => getCoords(d, 23));
          const emoPoints = daysRange.map((d) => getCoords(d, 28));
          const intelPoints = daysRange.map((d) => getCoords(d, 33));

          const makePath = (points: { x: number; y: number }[]) =>
            points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '');

          const todayPhys = physPoints[7];
          const todayEmo = emoPoints[7];
          const todayIntel = intelPoints[7];

          return (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px] overflow-visible">
                  {/* Grid Lines */}
                  <line x1={paddingX} y1={midY} x2={width - paddingX} y2={midY} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                  <line x1={paddingX} y1={midY - maxAmp} x2={width - paddingX} y2={midY - maxAmp} stroke="rgba(255,255,255,0.04)" />
                  <line x1={paddingX} y1={midY + maxAmp} x2={width - paddingX} y2={midY + maxAmp} stroke="rgba(255,255,255,0.04)" />

                  {/* Today Vertical Guide */}
                  <line x1={todayPhys.x} y1={10} x2={todayPhys.x} y2={height - 10} stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x={todayPhys.x} y={12} fill="#FBBF24" fontSize="10" fontWeight="bold" textAnchor="middle">
                    HOJE
                  </text>

                  {/* Wave Paths */}
                  <path d={makePath(physPoints)} fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
                  <path d={makePath(emoPoints)} fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
                  <path d={makePath(intelPoints)} fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Today Dots */}
                  <circle cx={todayPhys.x} cy={todayPhys.y} r="5" fill="#F87171" stroke="#FFFFFF" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                  <circle cx={todayEmo.x} cy={todayEmo.y} r="5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  <circle cx={todayIntel.x} cy={todayIntel.y} r="5" fill="#C084FC" stroke="#FFFFFF" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                </svg>
              </div>

              {/* Days labels */}
              <div className="flex justify-between text-[10px] text-neutral-400 font-medium px-2">
                <span>-7 dias</span>
                <span>-3 dias</span>
                <span className="text-amber-300 font-bold">Hoje</span>
                <span>+3 dias</span>
                <span>+7 dias</span>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-white/10">
          {/* Physical Cycle (23 days) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-400" /> Físico (23d)
              </span>
              <span className="font-bold text-red-400">{biorhythmScores.physical > 0 ? `+${biorhythmScores.physical}%` : `${biorhythmScores.physical}%`}</span>
            </div>
            <div className="h-2 rounded-full bg-black/60 overflow-hidden">
              <div
                className="h-full bg-red-400 transition-all duration-500"
                style={{ width: `${Math.abs(biorhythmScores.physical)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400">Resistência corporal, energia física e força muscular.</p>
          </div>

          {/* Emotional Cycle (28 days) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-400" /> Emocional (28d)
              </span>
              <span className="font-bold text-blue-400">{biorhythmScores.emotional > 0 ? `+${biorhythmScores.emotional}%` : `${biorhythmScores.emotional}%`}</span>
            </div>
            <div className="h-2 rounded-full bg-black/60 overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-500"
                style={{ width: `${Math.abs(biorhythmScores.emotional)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400">Sensibilidade interpessoal, humor e intuição.</p>
          </div>

          {/* Intellectual Cycle (33 days) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-400" /> Intelectual (33d)
              </span>
              <span className="font-bold text-purple-400">{biorhythmScores.intellectual > 0 ? `+${biorhythmScores.intellectual}%` : `${biorhythmScores.intellectual}%`}</span>
            </div>
            <div className="h-2 rounded-full bg-black/60 overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-500"
                style={{ width: `${Math.abs(biorhythmScores.intellectual)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400">Capacidade analítica, aprendizado e clareza mental.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
