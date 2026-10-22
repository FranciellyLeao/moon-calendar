import React from 'react';

interface RealisticMoonProps {
  illumination: number; // 0 to 100
  phaseCode: string;   // 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent'
  size?: number;       // default 200
  className?: string;
}

export const RealisticMoon: React.FC<RealisticMoonProps> = ({
  illumination,
  phaseCode,
  size = 200,
  className = '',
}) => {
  const cx = 110;
  const cy = 110;
  const r = 88;

  // Determine if moon is waxing (light on the right) or waning (light on the left)
  const isWaxing =
    phaseCode.includes('waxing') ||
    phaseCode === 'first_quarter' ||
    (phaseCode === 'new' && illumination > 0);

  const isFull = illumination >= 98 || phaseCode === 'full';
  const isNew = illumination <= 2 || phaseCode === 'new';

  const fraction = Math.max(0, Math.min(100, illumination)) / 100;

  // Semi-minor axis for terminator ellipse
  const rx = Math.max(0.1, r * Math.abs(2 * fraction - 1));

  // Determine sweep directions for SVG path
  let illuminatedPath = '';

  if (isFull) {
    illuminatedPath = `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`;
  } else if (isNew) {
    illuminatedPath = '';
  } else if (isWaxing) {
    if (fraction <= 0.5) {
      // Waxing crescent: outer limb on right (sweep 1), inner terminator curves right (sweep 0)
      illuminatedPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 0 ${cx} ${cy - r} Z`;
    } else {
      // Waxing gibbous: outer limb on right (sweep 1), inner terminator curves left (sweep 1)
      illuminatedPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 1 ${cx} ${cy - r} Z`;
    }
  } else {
    // Waning
    if (fraction <= 0.5) {
      // Waning crescent: outer limb on left (sweep 0), inner terminator curves left (sweep 1)
      illuminatedPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 1 ${cx} ${cy - r} Z`;
    } else {
      // Waning gibbous: outer limb on left (sweep 0), inner terminator curves right (sweep 0)
      illuminatedPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 0 ${cx} ${cy - r} Z`;
    }
  }

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ethereal Outer Atmospheric Halo / Corona */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(230, 202, 101, ${0.08 + fraction * 0.14}) 0%, rgba(230, 202, 101, ${0.03 + fraction * 0.05}) 50%, transparent 72%)`,
          filter: 'blur(16px)',
          transform: 'scale(1.22)',
        }}
      />

      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_12px_36px_rgba(0,0,0,0.9)]"
      >
        <defs>
          {/* Base Moon Circular Clip */}
          <clipPath id="moonDiscClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>

          {/* Phase Illumination Clip */}
          <clipPath id="phaseIllumClip">
            <path d={illuminatedPath} />
          </clipPath>

          {/* Soft blur for organic lunar maria */}
          <filter id="mareBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>

          {/* Fine blur for crater rays */}
          <filter id="craterRayBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>

          {/* Spherical Highland Base Gradient */}
          <radialGradient id="highlandBase" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#f3efe2" />
            <stop offset="35%" stopColor="#d8d3c5" />
            <stop offset="70%" stopColor="#9e998c" />
            <stop offset="100%" stopColor="#4f4c45" />
          </radialGradient>

          {/* Earthshine Unlit Dark Side Shading */}
          <radialGradient id="earthshineGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#141312" />
            <stop offset="65%" stopColor="#0a0a09" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          {/* Spherical 3D Lighting Dome Gradient */}
          <radialGradient id="sphere3DLight" cx={isWaxing ? '68%' : '32%'} cy="36%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#f7f3e6" stopOpacity="0.1" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </radialGradient>

          {/* Champagne Gold Corona Rim Gradient */}
          <radialGradient id="coronaRim" cx="50%" cy="50%" r="50%">
            <stop offset="92%" stopColor="transparent" />
            <stop offset="98%" stopColor="rgba(230, 202, 101, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
          </radialGradient>
        </defs>

        {/* ── Layer 1: Dark Side (Earthshine & Base Night Sphere) ──────── */}
        <circle cx={cx} cy={cy} r={r} fill="url(#earthshineGrad)" />

        {/* Faint night-side maria outline */}
        <g clipPath="url(#moonDiscClip)" opacity="0.15">
          <ellipse cx="80" cy="95" rx="36" ry="32" fill="#000000" filter="url(#mareBlur)" />
          <ellipse cx="140" cy="85" rx="28" ry="24" fill="#000000" filter="url(#mareBlur)" />
          <ellipse cx="110" cy="140" rx="32" ry="22" fill="#000000" filter="url(#mareBlur)" />
        </g>

        {/* ── Layer 2: Illuminated Side with Realistic Maria & Craters ── */}
        {!isNew && (
          <g clipPath="url(#phaseIllumClip)">
            {/* Base lunar highland surface */}
            <circle cx={cx} cy={cy} r={r} fill="url(#highlandBase)" />

            {/* Realistic Maria (Basaltic Seas) */}
            <g clipPath="url(#moonDiscClip)" filter="url(#mareBlur)" opacity="0.68">
              {/* Oceanus Procellarum (Northwest large dark expanse) */}
              <path
                d="M 50 70 Q 75 60 90 85 Q 98 120 75 145 Q 45 140 45 100 Z"
                fill="#2e2b26"
              />
              {/* Mare Imbrium (Round sea northwest) */}
              <ellipse cx="82" cy="74" rx="22" ry="18" fill="#292622" />
              {/* Mare Serenitatis & Mare Tranquillitatis (Northeast) */}
              <ellipse cx="132" cy="80" rx="19" ry="17" fill="#2d2a25" />
              <ellipse cx="144" cy="108" rx="21" ry="18" fill="#282622" />
              {/* Mare Crisium (Crisium isolated oval far east) */}
              <ellipse cx="170" cy="88" rx="12" ry="9" fill="#23211e" />
              {/* Mare Fecunditatis (Southeast) */}
              <ellipse cx="156" cy="130" rx="18" ry="14" fill="#2a2723" />
              {/* Mare Nectaris & Mare Nubium (South central) */}
              <ellipse cx="134" cy="144" rx="14" ry="12" fill="#2c2925" />
              <ellipse cx="88" cy="132" rx="19" ry="15" fill="#292723" />
              <ellipse cx="64" cy="142" rx="13" ry="11" fill="#2c2925" />
            </g>

            {/* Tycho Crater & Radial Ray System (South Pole) */}
            <g clipPath="url(#moonDiscClip)" filter="url(#craterRayBlur)">
              {/* Tycho rays extending across southern lunar highlands */}
              <line x1="110" y1="168" x2="60" y2="120" stroke="#fcfaf5" strokeWidth="1.2" opacity="0.45" />
              <line x1="110" y1="168" x2="165" y2="125" stroke="#fcfaf5" strokeWidth="1.1" opacity="0.42" />
              <line x1="110" y1="168" x2="110" y2="105" stroke="#fcfaf5" strokeWidth="1.3" opacity="0.48" />
              <line x1="110" y1="168" x2="80" y2="185" stroke="#fcfaf5" strokeWidth="0.9" opacity="0.38" />
              <line x1="110" y1="168" x2="145" y2="185" stroke="#fcfaf5" strokeWidth="0.9" opacity="0.38" />

              {/* Tycho crater central peak & rim */}
              <circle cx="110" cy="168" r="4.5" fill="#ffffff" opacity="0.85" />
              <circle cx="110" cy="168" r="2" fill="#ded9cc" />

              {/* Copernicus crater (Center-West) */}
              <circle cx="82" cy="104" r="5" fill="#ffffff" opacity="0.65" />
              <circle cx="82" cy="104" r="2.5" fill="#36332d" opacity="0.6" />

              {/* Kepler crater */}
              <circle cx="62" cy="102" r="3.2" fill="#ffffff" opacity="0.6" />

              {/* Aristarchus bright crater (Northwest) */}
              <circle cx="56" cy="78" r="3.5" fill="#ffffff" opacity="0.8" />
            </g>

            {/* 3D Spherical Volume Shading Overlay */}
            <circle cx={cx} cy={cy} r={r} fill="url(#sphere3DLight)" />
          </g>
        )}

        {/* ── Layer 3: Lunar Rim & Specular Corona ────────────────────── */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#coronaRim)"
          strokeWidth="1.5"
          opacity={0.75}
        />

        {/* Outer Hairline Border */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 0.5}
          fill="none"
          stroke="rgba(230, 202, 101, 0.22)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};
