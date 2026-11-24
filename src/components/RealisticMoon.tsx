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
      {/* Ethereal Atmospheric Halo / Golden Champagne Corona */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(230, 202, 101, ${0.06 + fraction * 0.16}) 0%, rgba(230, 202, 101, ${0.02 + fraction * 0.06}) 48%, transparent 72%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.28)',
        }}
      />

      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_16px_40px_rgba(0,0,0,0.95)]"
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

          {/* Earthshine Dark Side Gradient */}
          <radialGradient id="earthshineGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#151413" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#0b0a09" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#040404" stopOpacity="0.98" />
          </radialGradient>

          {/* Spherical 3D Lighting Dome Gradient */}
          <radialGradient id="sphere3DLight" cx={isWaxing ? '68%' : '32%'} cy="36%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="45%" stopColor="#f7f3e6" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
          </radialGradient>

          {/* Champagne Gold Corona Rim Gradient */}
          <radialGradient id="coronaRim" cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="transparent" />
            <stop offset="97%" stopColor="rgba(230, 202, 101, 0.35)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
          </radialGradient>
        </defs>

        {/* ── Layer 1: Dark Side Base Sphere & Subtle Earthshine ── */}
        <circle cx={cx} cy={cy} r={r} fill="#050505" />

        {/* Unlit Earthshine Texture Silhouette */}
        <g clipPath="url(#moonDiscClip)" opacity={0.16}>
          <image
            href="/moon-full-disc.png"
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
        <circle cx={cx} cy={cy} r={r} fill="url(#earthshineGrad)" />

        {/* ── Layer 2: Photorealistic Illuminated Surface ── */}
        {!isNew && (
          <g clipPath="url(#phaseIllumClip)">
            {/* NASA High-Resolution Photorealistic Disc */}
            <image
              href="/moon-full-disc.png"
              x={cx - r}
              y={cy - r}
              width={r * 2}
              height={r * 2}
              preserveAspectRatio="xMidYMid meet"
            />

            {/* 3D Spherical Volume Shading Overlay */}
            <circle cx={cx} cy={cy} r={r} fill="url(#sphere3DLight)" />
          </g>
        )}

        {/* ── Layer 3: Subtle Atmospheric Rim & Hairline ── */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#coronaRim)"
          strokeWidth="1.2"
          opacity={0.8}
        />

        {/* Outer Hairline Border */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 0.5}
          fill="none"
          stroke="rgba(230, 202, 101, 0.18)"
          strokeWidth="0.7"
        />
      </svg>
    </div>
  );
};
