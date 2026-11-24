import React, { useState, useMemo } from 'react';
import * as SunCalc from 'suncalc';
import type { AstronomyData, UserSettings } from '../types';
import { Compass, Clock, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface MoonTimelineScrubberProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

function getCardinalDirection(azimuthDeg: number): string {
  const directions = [
    'Norte (N)', 'Norte-Nordeste (NNE)', 'Nordeste (NE)', 'Leste-Nordeste (ENE)',
    'Leste (L)', 'Leste-Sudeste (ESE)', 'Sudeste (SE)', 'Sul-Sudeste (SSE)',
    'Sul (S)', 'Sul-Sudoeste (SSO)', 'Sudoeste (SO)', 'Oeste-Sudoeste (OSO)',
    'Oeste (O)', 'Oeste-Noroeste (ONO)', 'Noroeste (NO)', 'Norte-Noroeste (NNO)',
  ];
  const index = Math.round((azimuthDeg % 360) / 22.5) % 16;
  return directions[index];
}

function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr || timeStr === '--:--') return null;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':').map(Number);
  let h = parts[0] || 0;
  const m = parts[1] || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export const MoonTimelineScrubber: React.FC<MoonTimelineScrubberProps> = ({
  settings,
  astroData,
}) => {
  const now = new Date();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(currentMinutesFromMidnight);

  const { lat, lng } = settings.location;

  // Generate 24 hourly curve points for today
  const hourlyData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const points: { hour: number; altitude: number; azimuth: number }[] = [];
    let maxAlt = -90;
    let maxAltHour = 12;

    for (let h = 0; h <= 24; h++) {
      const d = new Date(today.getTime() + h * 3600 * 1000);
      const pos = SunCalc.getMoonPosition(d, lat, lng);
      const altDeg = pos.altitude;
      const azDeg = ((pos.azimuth % 360) + 360) % 360;
      points.push({ hour: h, altitude: altDeg, azimuth: azDeg });

      if (altDeg > maxAlt) {
        maxAlt = altDeg;
        maxAltHour = h;
      }
    }

    return { points, maxAlt, maxAltHour };
  }, [lat, lng]);

  // Compute lunar position for currently selected minutes
  const activePosition = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today.getTime() + selectedMinutes * 60 * 1000);

    const pos = SunCalc.getMoonPosition(targetDate, lat, lng);
    const illum = SunCalc.getMoonIllumination(targetDate);

    const altDeg = pos.altitude;
    const azDeg = ((pos.azimuth % 360) + 360) % 360;

    const hours = Math.floor(selectedMinutes / 60);
    const mins = selectedMinutes % 60;
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const isVisible = altDeg > 0;
    const cardinal = getCardinalDirection(azDeg);

    return {
      timeFormatted,
      altitudeDeg: altDeg,
      azimuthDeg: azDeg,
      cardinal,
      illumination: Math.round(illum.fraction * 100),
      isVisible,
      distanceKm: Math.round(pos.distance || 384400),
    };
  }, [selectedMinutes, lat, lng]);

  // SVG dimensions for altitude curve
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 24;
  const paddingY = 24;

  const points = hourlyData.points;
  const minAlt = Math.min(...points.map((p) => p.altitude), -30);
  const maxAlt = Math.max(...points.map((p) => p.altitude), 60);
  const altRange = Math.max(maxAlt - minAlt, 1);

  const getX = (hourFraction: number) =>
    paddingX + (hourFraction / 24) * (svgWidth - paddingX * 2);

  const getY = (alt: number) => {
    const norm = (alt - minAlt) / altRange;
    return svgHeight - paddingY - norm * (svgHeight - paddingY * 2);
  };

  // Generate SVG path string
  const pathD = points.reduce((acc, p, i) => {
    const x = getX(p.hour);
    const y = getY(p.altitude);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Horizon Y (alt = 0)
  const horizonY = getY(0);

  // Current scrubbed point coordinates
  const currentScrubbedHour = selectedMinutes / 60;
  const scrubX = getX(currentScrubbedHour);
  const scrubY = getY(activePosition.altitudeDeg);

  return (
    <div className="relative space-y-6 pt-2 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Trajetória & Visibilidade 24h</span>
          </div>
          <h3 className="text-lg sm:text-xl font-light text-white mt-1 tracking-tight">
            Linha do Tempo Lunar Contínua
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Arraste para visualizar altitude, azimute e visibilidade da Lua ao longo do dia em {settings.location.name}.
          </p>
        </div>

        {/* Quick jump to Now */}
        <button
          onClick={() => setSelectedMinutes(currentMinutesFromMidnight)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3 h-3 text-amber-300" />
          <span>Voltar para Agora ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
        </button>
      </div>

      {/* SVG Arc Trajectory */}
      <div className="relative w-full overflow-hidden rounded-2xl py-2 sm:py-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-32 sm:h-40 overflow-visible"
        >
          <defs>
            <linearGradient id="lunarCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizon Line (0° altitude) */}
          <line
            x1={paddingX}
            y1={horizonY}
            x2={svgWidth - paddingX}
            y2={horizonY}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={svgWidth - paddingX - 4}
            y={horizonY - 4}
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            Horizonte (0°)
          </text>

          {/* Area under curve above horizon */}
          <path
            d={`${pathD} L ${getX(24)} ${horizonY} L ${getX(0)} ${horizonY} Z`}
            fill="url(#areaFill)"
          />

          {/* Main Trajectory Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lunarCurveGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Hour tick marks */}
          {[0, 6, 12, 18, 24].map((h) => {
            const x = getX(h);
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={svgHeight - paddingY}
                  x2={x}
                  y2={svgHeight - paddingY + 5}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={svgHeight - 8}
                  fill="rgba(255, 255, 255, 0.45)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {String(h).padStart(2, '0')}h
                </text>
              </g>
            );
          })}

          {/* Scrubber vertical guide line */}
          <line
            x1={scrubX}
            y1={paddingY}
            x2={scrubX}
            y2={svgHeight - paddingY}
            stroke="#d4af37"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* Moon Position Indicator on Curve */}
          <circle
            cx={scrubX}
            cy={scrubY}
            r="8"
            fill="#d4af37"
            fillOpacity="0.3"
          />
          <circle
            cx={scrubX}
            cy={scrubY}
            r="4.5"
            fill="#ffffff"
            stroke="#d4af37"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Interactive Range Slider (Scrubber) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>00:00</span>
          <span className="text-amber-200 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            {activePosition.timeFormatted}
          </span>
          <span>23:59</span>
        </div>

        <input
          type="range"
          min={0}
          max={1439}
          step={5}
          value={selectedMinutes}
          onChange={(e) => setSelectedMinutes(Number(e.target.value))}
          className="w-full h-2 rounded-lg bg-neutral-800 accent-[#d4af37] cursor-pointer"
        />
      </div>

      {/* Real-time Astronomical Metrics at Scrubbed Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-y border-white/[0.06]">
        {/* Status */}
        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
            {activePosition.isVisible ? (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span>Condição</span>
          </div>
          <div className={`text-xs sm:text-sm font-semibold ${activePosition.isVisible ? 'text-emerald-300' : 'text-neutral-400'}`}>
            {activePosition.isVisible ? 'Visível no Céu' : 'Sob o Horizonte'}
          </div>
        </div>

        {/* Altitude */}
        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">Altitude</div>
          <div className="text-xs sm:text-sm font-semibold text-white font-mono">
            {activePosition.altitudeDeg > 0 ? `+${activePosition.altitudeDeg.toFixed(1)}°` : `${activePosition.altitudeDeg.toFixed(1)}°`}
          </div>
        </div>

        {/* Azimuth & Compass */}
        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Azimute</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-white font-mono">
            {activePosition.azimuthDeg.toFixed(0)}°
            <span className="text-[10px] text-amber-200/80 font-sans block truncate font-medium">
              {activePosition.cardinal}
            </span>
          </div>
        </div>

        {/* Illumination & Distance */}
        <div className="space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">Iluminação</div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            {activePosition.illumination}%
            <span className="text-[10px] text-neutral-400 font-mono block">
              {activePosition.distanceKm.toLocaleString()} km
            </span>
          </div>
        </div>
      </div>

      {/* Key Milestones of the Day */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs text-neutral-300">
        <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
          Marcos de Hoje:
        </span>
        <button
          onClick={() => {
            const mins = parseTimeToMinutes(astroData.moonrise);
            if (mins !== null) setSelectedMinutes(mins);
          }}
          className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-all font-mono text-xs"
        >
          Nascer: <strong className="text-white font-semibold">{astroData.moonrise || '--:--'}</strong>
        </button>

        <button
          onClick={() => setSelectedMinutes(hourlyData.maxAltHour * 60)}
          className="px-3 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 transition-all font-mono text-xs"
        >
          Zênite (Pico): <strong className="text-amber-300 font-semibold">+{hourlyData.maxAlt.toFixed(1)}° ({hourlyData.maxAltHour}:00)</strong>
        </button>

        <button
          onClick={() => {
            const mins = parseTimeToMinutes(astroData.moonset);
            if (mins !== null) setSelectedMinutes(mins);
          }}
          className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-all font-mono text-xs"
        >
          Ocaso: <strong className="text-white font-semibold">{astroData.moonset || '--:--'}</strong>
        </button>
      </div>
    </div>
  );
};
