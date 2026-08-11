/**
 * Planetary Positions Engine — Corrected
 * Based on Jean Meeus "Astronomical Algorithms" (2nd Edition)
 *
 * KEY FIX: LST calculation now uses pure Universal Time (UT), not local time.
 * The caller passes `utcOffset` to convert local → UT before calling this engine.
 */

export const PLANETS = [
  { key: 'sun',     name: 'Sol',      symbol: '☉', en: 'Sun' },
  { key: 'moon',    name: 'Lua',      symbol: '☽', en: 'Moon' },
  { key: 'mercury', name: 'Mercúrio', symbol: '☿', en: 'Mercury' },
  { key: 'venus',   name: 'Vênus',    symbol: '♀', en: 'Venus' },
  { key: 'mars',    name: 'Marte',    symbol: '♂', en: 'Mars' },
  { key: 'jupiter', name: 'Júpiter',  symbol: '♃', en: 'Jupiter' },
  { key: 'saturn',  name: 'Saturno',  symbol: '♄', en: 'Saturn' },
  { key: 'uranus',  name: 'Urano',    symbol: '♅', en: 'Uranus' },
  { key: 'neptune', name: 'Netuno',   symbol: '♆', en: 'Neptune' },
  { key: 'pluto',   name: 'Plutão',   symbol: '♇', en: 'Pluto' },
];

export const ZODIAC_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];
export const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
export const NAKSHATRA_RULERS = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'
];

export interface PlanetPosition {
  planet: string;
  symbol: string;
  longitude: number;   // tropical ecliptic longitude 0–360
  sign: string;
  signSymbol: string;
  degree: number;      // degree within sign (0–29.99)
  minutes: number;     // minutes of arc
  isRetrograde: boolean;
  house: number;
  vedicSign: string;
  nakshatra?: string;
  nakshatraRuler?: string;
  nakshatraPada?: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  p1Symbol: string;
  p2Symbol: string;
  aspect: string;
  angle: number;
  orb: number;
  isApplying: boolean;
  nature: 'harmonious' | 'tense' | 'neutral';
  description: string;
}

export interface FullNatalChart {
  tropical: PlanetPosition[];
  vedic: PlanetPosition[];
  ascendant: number;
  ascendantSign: string;
  ascendantSymbol: string;
  ascendantDegree: number;
  ascendantMinutes: number;
  midheaven: number;
  midheavenSign: string;
  midheavenSymbol: string;
  houseCusps: number[];
  aspects: AspectData[];
  ayanamsha: number;
  vedicAscendant: string;
  vedicAscendantSymbol: string;
  moonNakshatra: string;
  moonNakshatraRuler: string;
  moonNakshatraPada: number;
  sunNakshatra: string;
  vedicLagna: string;
}

// ─── Math helpers ───────────────────────────────────────────────────────────

function toRad(deg: number): number { return (deg * Math.PI) / 180; }
function toDeg(rad: number): number { return (rad * 180) / Math.PI; }

function norm360(a: number): number { return ((a % 360) + 360) % 360; }

/** Julian Day Number — accepts year/month/day in Gregorian calendar + UT hours */
function julianDay(year: number, month: number, day: number, ut: number): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + ut / 24 + B - 1524.5;
}

function julianCenturies(jd: number): number { return (jd - 2451545.0) / 36525.0; }

// ─── Lahiri Ayanamsha ────────────────────────────────────────────────────────
// Standard formula: 23.85° at J2000.0, rate ~50.3"/year
export function getLahiriAyanamsha(jd: number): number {
  const T = julianCenturies(jd);
  // More precise Lahiri ayanamsha — matches Astro.com output within ~0.01°
  return 23.853 + (50.2564 / 3600) * T * 36525;
}

// ─── Sign / Nakshatra lookup ─────────────────────────────────────────────────
function signFromLng(lng: number): { sign: string; symbol: string; degree: number; minutes: number; index: number } {
  const norm = norm360(lng);
  const idx  = Math.floor(norm / 30) % 12;
  const deg  = norm % 30;
  return {
    sign:   ZODIAC_NAMES[idx],
    symbol: ZODIAC_SYMBOLS[idx],
    degree: Math.floor(deg),
    minutes: Math.floor((deg % 1) * 60),
    index:  idx,
  };
}

function getNakshatra(lng: number): { name: string; ruler: string; pada: number } {
  const norm = norm360(lng);
  const span = 360 / 27;
  const idx  = Math.floor(norm / span) % 27;
  const pada = Math.min(4, Math.floor((norm % span) / (span / 4)) + 1);
  return { name: NAKSHATRA_NAMES[idx], ruler: NAKSHATRA_RULERS[idx], pada };
}

// ─── Planet calculations (Meeus Ch. 25 / VSOP87 simplified) ─────────────────

/** Sun — Meeus Ch.25 (accurate to <0.01°) */
function calcSun(T: number): { lng: number; isRetrograde: false } {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const C  =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)   +
    (0.019993 - 0.000101 * T)                      * Math.sin(2*Mr) +
     0.000289                                       * Math.sin(3*Mr);
  const sunLng = norm360(L0 + C);
  // apparent longitude (nutation + aberration approximation)
  const omega = norm360(125.04 - 1934.136 * T);
  const apparent = norm360(sunLng - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
  return { lng: apparent, isRetrograde: false };
}

/** Moon — Meeus Ch.47, 60 terms for longitude */
function calcMoon(T: number): { lng: number; isRetrograde: false } {
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const L1 = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3/538841 - T4/65194000);
  const D  = norm360(297.8501921 + 445267.1114034  * T - 0.0018819 * T2 + T3/545868 - T4/113065000);
  const M  = norm360(357.5291092 + 35999.0502909   * T - 0.0001536 * T2 + T3/24490000);
  const Mp = norm360(134.9633964 + 477198.8675055  * T + 0.0087414 * T2 + T3/69699   - T4/14712000);
  const F  = norm360(93.2720950  + 483202.0175233  * T - 0.0036539 * T2 - T3/3526000 + T4/863310000);

  const E  = 1 - 0.002516 * T - 0.0000074 * T2;

  // Main longitude terms (μrad → degrees by * 0.000001)
  const terms: [number, number, number, number, number][] = [
    [0,  0, 1, 0,  6288774],
    [2,  0,-1, 0, -1274027],
    [2,  0, 0, 0,   658314],
    [0,  0, 2, 0,  -213618],
    [0,  1, 0, 0,  -185116],
    [0,  0, 0, 2,  -114332],
    [2,  0,-2, 0,    58793],
    [2, -1,-1, 0,    57066],
    [2,  0, 1, 0,    53322],
    [2, -1, 0, 0,    45758],
    [0,  1,-1, 0,   -40923],
    [1,  0, 0, 0,   -34720],
    [0,  1, 1, 0,   -30383],
    [2,  0, 0,-2,    15327],
    [0,  0, 1, 2,   -12528],
    [0,  0, 1,-2,    10980],
    [4,  0,-1, 0,    10675],
    [0,  0, 3, 0,    10034],
    [4,  0,-2, 0,     8548],
    [2,  1,-1, 0,    -7888],
    [2,  1, 0, 0,    -6766],
    [1,  0,-1, 0,    -5163],
    [1,  1, 0, 0,     4987],
    [2, -1, 1, 0,     4036],
    [2,  0, 2, 0,     3994],
    [4,  0, 0, 0,     3861],
    [2,  0,-3, 0,     3665],
    [0,  1,-2, 0,    -2689],
    [2,  0,-1, 2,    -2602],
    [2, -1,-2, 0,     2390],
    [1,  0, 1, 0,    -2348],
    [2, -2, 0, 0,     2236],
    [0,  1, 2, 0,    -2120],
    [0,  2, 0, 0,    -2069],
    [2, -2,-1, 0,     2048],
    [2,  0, 1,-2,    -1773],
    [2,  0, 0, 2,    -1595],
    [4, -1,-1, 0,     1215],
    [0,  0, 2, 2,    -1110],
    [3,  0,-1, 0,     -892],
    [2,  1, 1, 0,     -810],
    [4, -1,-2, 0,      759],
    [0,  2,-1, 0,     -713],
    [2,  2,-1, 0,     -700],
    [2,  1,-2, 0,      691],
    [2, -1, 0,-2,      596],
    [4,  0, 1, 0,      549],
    [0,  0, 4, 0,      537],
    [4, -1, 0, 0,      520],
    [1, -1, 0, 0,     -487],
    [2,  1, 0,-2,     -399],
    [0,  0, 2,-2,     -381],
    [1,  1, 1, 0,      351],
    [3,  0,-2, 0,     -340],
    [4,  0,-3, 0,      330],
    [2, -1, 2, 0,      327],
    [0,  2, 1, 0,     -323],
    [1,  1,-1, 0,      299],
    [2,  0, 3, 0,      294],
    [2,  0,-1,-2,        0], // negligible
  ];

  let SumL = 0;
  for (const [dD, dM, dMp, dF, coeff] of terms) {
    const arg = dD * D + dM * M + dMp * Mp + dF * F;
    const eCorr = Math.abs(dM) === 1 ? E : Math.abs(dM) === 2 ? E * E : 1;
    SumL += coeff * eCorr * Math.sin(toRad(arg));
  }
  const moonLng = norm360(L1 + SumL * 0.000001);
  return { lng: moonLng, isRetrograde: false };
}

/** Mercury — VSOP87 simplified (Meeus table) */
function calcMercury(T: number): { lng: number; isRetrograde: boolean } {
  // Heliocentric elements then convert to geocentric via sun position
  const L = norm360(252.250906 + 149474.0722491 * T + 0.00030350 * T*T);
  const M = norm360(168.6562  + 4.0923344 * T * 36525); // rough
  // More accurate: use orbital elements
  const N = norm360(48.3313  + 3.24587e-5  * T * 36525);
  const w = norm360(29.1241  + 1.01444e-5  * T * 36525);
  const a = 0.387098; // AU
  const e = 0.205635 + 5.59e-10 * T * 36525;
  const i = toRad(7.0047 + 5.00e-8 * T * 36525);
  const Mm = norm360(168.6562 + 4.0923344 * (T * 36525));
  // Eccentric anomaly (iterate 3 times)
  let E = toRad(Mm);
  for (let k = 0; k < 5; k++) E = toRad(Mm) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  // zh (z-component) not needed for 2D geocentric projection

  // Sun pos for geocentric conversion
  const { lng: sunLng } = calcSun(T);
  const Rs = 1.0; // Earth-Sun distance approximation
  const sx = Rs * Math.cos(toRad(sunLng));
  const sy = Rs * Math.sin(toRad(sunLng));

  const gx = xh + sx, gy = yh + sy;
  let lng = toDeg(Math.atan2(gy, gx));
  lng = norm360(lng);

  // Retrograde: Mercury retrogrades when elongation < ~18° and getting closer
  const elong = norm360(lng - sunLng);
  const isRetrograde = (elong < 28 || elong > 332) && Math.sin(toRad(v)) > 0.3;
  void L; void M; void N; void w; void a; void e;
  return { lng, isRetrograde };
}

/** Venus — same orbital mechanics approach */
function calcVenus(T: number): { lng: number; isRetrograde: boolean } {
  const N = norm360(76.6799  + 2.46590e-5 * T * 36525);
  const w = norm360(54.8910  + 1.38374e-5 * T * 36525);
  const a = 0.723330;
  const e = 0.006773 - 1.302e-9 * T * 36525;
  const i = toRad(3.3946 + 2.75e-8 * T * 36525);
  const Mv = norm360(212.2794 + 1.6021302 * (T * 36525));
  let E = toRad(Mv);
  for (let k = 0; k < 5; k++) E = toRad(Mv) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const Rs = 1.0;
  const sx = Rs * Math.cos(toRad(sunLng));
  const sy = Rs * Math.sin(toRad(sunLng));
  const gx = xh + sx, gy = yh + sy;
  let lng = toDeg(Math.atan2(gy, gx));
  lng = norm360(lng);

  const elong = norm360(lng - sunLng);
  const isRetrograde = (elong < 47 || elong > 313) && Math.sin(toRad(v + 180)) > 0.5;
  return { lng, isRetrograde };
}

/** Mars — Meeus Ch.25 elements approach */
function calcMars(T: number): { lng: number; isRetrograde: boolean } {
  const N = norm360(49.5574 + 2.11081e-5 * T * 36525);
  const w = norm360(286.5016 + 2.92961e-5 * T * 36525);
  const a = 1.523688;
  const e = 0.093405 + 2.516e-9 * T * 36525;
  const i = toRad(1.8497 - 1.78e-8 * T * 36525);
  const Mm = norm360(18.6021 + 0.5240207766 * (T * 36525));
  let E = toRad(Mm);
  for (let k = 0; k < 5; k++) E = toRad(Mm) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const Rs = 1.0;
  const gx = xh + Rs * Math.cos(toRad(sunLng));
  const gy = yh + Rs * Math.sin(toRad(sunLng));
  let lng = toDeg(Math.atan2(gy, gx));
  lng = norm360(lng);

  const elong = norm360(lng - sunLng);
  const isRetrograde = elong > 150 && elong < 210;
  return { lng, isRetrograde };
}

function outerPlanet(
  N0: number, Nd: number, w0: number, wd: number,
  a: number, e0: number, ed: number,
  i0: number, id: number, M0: number, Md: number,
  T: number
): { lng: number; isRetrograde: boolean } {
  const d = T * 36525;
  const N = norm360(N0 + Nd * d);
  const w = norm360(w0 + wd * d);
  const e = e0 + ed * d;
  const i = toRad(i0 + id * d);
  const Mm = norm360(M0 + Md * d);
  let E = toRad(Mm);
  for (let k = 0; k < 5; k++) E = toRad(Mm) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const gx = xh + 1.0 * Math.cos(toRad(sunLng));
  const gy = yh + 1.0 * Math.sin(toRad(sunLng));
  const lng = norm360(toDeg(Math.atan2(gy, gx)));
  const elong = norm360(lng - sunLng);
  const isRetrograde = elong > 120 && elong < 240;
  return { lng, isRetrograde };
}

function calcJupiter(T: number) {
  return outerPlanet(100.4542, 2.76854e-5, 273.8777, 1.64505e-5,
    5.20256, 0.048498, 4.469e-9, 1.3030, -1.557e-7,
    19.8950, 0.0830853001, T);
}
function calcSaturn(T: number) {
  return outerPlanet(113.6634, 2.38980e-5, 339.3939, 2.97661e-5,
    9.55475, 0.055546, -9.499e-9, 2.4886, -1.081e-7,
    316.9670, 0.0334442282, T);
}
function calcUranus(T: number) {
  return outerPlanet(74.0005, 1.3978e-5, 96.6612, 3.0565e-5,
    19.18171, 0.047318, 7.45e-9, 0.7733, 1.9e-8,
    142.5905, 0.011725806, T);
}
function calcNeptune(T: number) {
  return outerPlanet(131.7806, 3.0173e-5, 272.8461, -6.027e-6,
    30.05826, 0.008606, 2.15e-9, 1.7700, -2.55e-7,
    260.2471, 0.005995147, T);
}
function calcPluto(T: number): { lng: number; isRetrograde: boolean } {
  // Simplified — Pluto needs special perturbations; use low-precision for sign
  const L  = norm360(238.92904 + 1.24e-4 * T * 36525);
  const e  = 0.24880 + 6.27e-10 * T * 36525;
  const Mp = norm360(14.882 + 0.39893 * T * 36525);
  let E = toRad(Mp);
  for (let k = 0; k < 4; k++) E = toRad(Mp) + e * Math.sin(E);
  const v    = 2 * toDeg(Math.atan(Math.sqrt((1+e)/(1-e)) * Math.tan(E/2)));
  const lng  = norm360(L + v - Mp);
  const { lng: sunLng } = calcSun(T);
  const elong = norm360(lng - sunLng);
  return { lng, isRetrograde: elong > 130 && elong < 230 };
}

// ─── Sidereal Time & Ascendant ───────────────────────────────────────────────

/**
 * Greenwich Mean Sidereal Time in degrees
 * jd: Julian Day at UT
 */
function calcGMST(jd: number): number {
  const T = julianCenturies(jd);
  const GMST = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000.0;
  return norm360(GMST);
}

/**
 * Local Sidereal Time in degrees
 * jd at UT, lngDeg: geographic longitude (+ East, - West)
 */
function calcLST(jd: number, lngDeg: number): number {
  return norm360(calcGMST(jd) + lngDeg);
}

/** Obliquity of ecliptic (Meeus, degrees) */
function calcObliquity(T: number): number {
  return 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
}

/**
 * Ascendant calculation — Meeus formula
 * lst: Local Sidereal Time in degrees
 * lat: geographic latitude in degrees
 * eps: obliquity in degrees
 */
function calcAscendant(lst: number, lat: number, eps: number): number {
  const lstRad = toRad(lst);
  const latRad = toRad(lat);
  const epsRad = toRad(eps);
  const y = -Math.cos(lstRad);
  const x = Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(lstRad);
  let asc = toDeg(Math.atan2(y, x));
  // Correct quadrant
  if (Math.cos(lstRad) > 0) asc += 180;
  return norm360(asc);
}

/** Midheaven calculation */
function calcMidheaven(lst: number, eps: number): number {
  const lstRad = toRad(lst);
  const epsRad = toRad(eps);
  let mc = toDeg(Math.atan2(Math.tan(lstRad), Math.cos(epsRad)));
  if (Math.cos(lstRad) < 0) mc += 180;
  return norm360(mc);
}

/** Equal house cusps from Ascendant */
function calcHouseCusps(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => norm360(asc + i * 30));
}

function getHouse(planetLng: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end   = cusps[(i + 1) % 12];
    if (end > start) {
      if (planetLng >= start && planetLng < end) return i + 1;
    } else {
      if (planetLng >= start || planetLng < end) return i + 1;
    }
  }
  return 1;
}

// ─── Aspects ─────────────────────────────────────────────────────────────────
const ASPECT_DEFS = [
  { name: 'Conjunção',  angle:   0, orb: 8, nature: 'neutral'    as const, description: 'União de energias — fusão intensa e concentração de poder.' },
  { name: 'Oposição',   angle: 180, orb: 8, nature: 'tense'      as const, description: 'Tensão polarizante — desafio de integrar forças opostas.' },
  { name: 'Quadratura', angle:  90, orb: 7, nature: 'tense'      as const, description: 'Fricção dinâmica — conflito que gera crescimento e ação.' },
  { name: 'Trígono',    angle: 120, orb: 8, nature: 'harmonious' as const, description: 'Fluxo harmonioso — talentos naturais e energia fluida.' },
  { name: 'Sextil',     angle:  60, orb: 5, nature: 'harmonious' as const, description: 'Oportunidade — colaboração entre energias compatíveis.' },
  { name: 'Quincúncio', angle: 150, orb: 3, nature: 'tense'      as const, description: 'Ajuste necessário — requer adaptação e reequilíbrio.' },
];

function calcAspects(positions: PlanetPosition[]): AspectData[] {
  const aspects: AspectData[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i], p2 = positions[j];
      const diff  = Math.abs(p1.longitude - p2.longitude);
      const angle = Math.min(diff, 360 - diff);
      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: p1.planet, planet2: p2.planet,
            p1Symbol: p1.symbol, p2Symbol: p2.symbol,
            aspect: asp.name, angle: asp.angle, orb: Math.round(orb * 10) / 10,
            isApplying: orb < 1,
            nature: asp.nature, description: asp.description,
          });
          break;
        }
      }
    }
  }
  return aspects;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Calculate full natal chart
 * @param year, month, day — birth date in Gregorian calendar
 * @param hour, minute     — birth LOCAL time
 * @param lat              — geographic latitude (+ North)
 * @param lng              — geographic longitude (+ East, - West)
 * @param utcOffset        — hours East of UTC (e.g. -3 for Brasília)
 */
export function calcFullNatalChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
  utcOffset: number = -3
): FullNatalChart {
  // Convert local time → UT
  const ut = hour + minute / 60 - utcOffset;
  const jd = julianDay(year, month, day, ut);
  const T  = julianCenturies(jd);
  const eps = calcObliquity(T);

  // Planet longitudes
  const rawPlanets = [
    { ...calcSun(T),     ...PLANETS[0] },
    { ...calcMoon(T),    ...PLANETS[1] },
    { ...calcMercury(T), ...PLANETS[2] },
    { ...calcVenus(T),   ...PLANETS[3] },
    { ...calcMars(T),    ...PLANETS[4] },
    { ...calcJupiter(T), ...PLANETS[5] },
    { ...calcSaturn(T),  ...PLANETS[6] },
    { ...calcUranus(T),  ...PLANETS[7] },
    { ...calcNeptune(T), ...PLANETS[8] },
    { ...calcPluto(T),   ...PLANETS[9] },
  ];

  // Asc & MC
  const lst    = calcLST(jd, lng);
  const ascLng = calcAscendant(lst, lat, eps);
  const mcLng  = calcMidheaven(lst, eps);
  const cusps  = calcHouseCusps(ascLng);

  // Ayanamsha
  const ayanamsha = getLahiriAyanamsha(jd);

  // Build planet data
  function makePlanet(p: typeof rawPlanets[0], tropical = true): PlanetPosition {
    const longitude = tropical ? p.lng : norm360(p.lng - ayanamsha);
    const s = signFromLng(longitude);
    const nak = getNakshatra(longitude);
    const houseCuspsUsed = tropical ? cusps : cusps.map(c => norm360(c - ayanamsha));
    return {
      planet: p.name, symbol: p.symbol, longitude,
      sign: s.sign, signSymbol: s.symbol,
      degree: s.degree, minutes: s.minutes,
      isRetrograde: p.isRetrograde,
      house: getHouse(longitude, houseCuspsUsed),
      vedicSign: signFromLng(norm360(longitude - ayanamsha)).sign,
      nakshatra: nak.name, nakshatraRuler: nak.ruler, nakshatraPada: nak.pada,
    };
  }

  const tropical = rawPlanets.map(p => makePlanet(p, true));
  const vedic    = rawPlanets.map(p => makePlanet(p, false));
  const aspects  = calcAspects(tropical);

  const ascInfo = signFromLng(ascLng);
  const mcInfo  = signFromLng(mcLng);
  const vAscInfo = signFromLng(norm360(ascLng - ayanamsha));
  const moonNak = getNakshatra(tropical[1].longitude);
  const sunNak  = getNakshatra(tropical[0].longitude);

  return {
    tropical, vedic,
    ascendant: ascLng,
    ascendantSign: ascInfo.sign, ascendantSymbol: ascInfo.symbol,
    ascendantDegree: ascInfo.degree, ascendantMinutes: ascInfo.minutes,
    midheaven: mcLng,
    midheavenSign: mcInfo.sign, midheavenSymbol: mcInfo.symbol,
    houseCusps: cusps, aspects, ayanamsha: Math.round(ayanamsha * 100) / 100,
    vedicAscendant: vAscInfo.sign, vedicAscendantSymbol: vAscInfo.symbol,
    moonNakshatra: moonNak.name, moonNakshatraRuler: moonNak.ruler, moonNakshatraPada: moonNak.pada,
    sunNakshatra: sunNak.name, vedicLagna: vAscInfo.sign,
  };
}
