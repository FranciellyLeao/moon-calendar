/**
 * Planetary Ephemeris Engine
 * Jean Meeus "Astronomical Algorithms" (2nd Ed.) Cap 25 & 47
 */
import { normalizeDegrees, toRad, toDeg } from './format';

export interface RawCelestialPosition {
  key: string;
  name: string;
  symbol: string;
  en: string;
  lng: number;
  isRetrograde: boolean;
}

export function calcSun(T: number): { lng: number; isRetrograde: false } {
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const C  =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)   +
    (0.019993 - 0.000101 * T)                      * Math.sin(2*Mr) +
     0.000289                                       * Math.sin(3*Mr);
  const sunLng = normalizeDegrees(L0 + C);
  const omega = normalizeDegrees(125.04 - 1934.136 * T);
  const apparent = normalizeDegrees(sunLng - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
  return { lng: apparent, isRetrograde: false };
}

export function calcMoon(T: number): { lng: number; isRetrograde: false } {
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const L1 = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3/538841 - T4/65194000);
  const D  = normalizeDegrees(297.8501921 + 445267.1114034  * T - 0.0018819 * T2 + T3/545868 - T4/113065000);
  const M  = normalizeDegrees(357.5291092 + 35999.0502909   * T - 0.0001536 * T2 + T3/24490000);
  const Mp = normalizeDegrees(134.9633964 + 477198.8675055  * T + 0.0087414 * T2 + T3/69699   - T4/14712000);
  const F  = normalizeDegrees(93.2720950  + 483202.0175233  * T - 0.0036539 * T2 - T3/3526000 + T4/863310000);

  const E  = 1 - 0.002516 * T - 0.0000074 * T2;

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
  ];

  let SumL = 0;
  for (const [dD, dM, dMp, dF, coeff] of terms) {
    const arg = dD * D + dM * M + dMp * Mp + dF * F;
    const eCorr = Math.abs(dM) === 1 ? E : Math.abs(dM) === 2 ? E * E : 1;
    SumL += coeff * eCorr * Math.sin(toRad(arg));
  }
  const moonLng = normalizeDegrees(L1 + SumL * 0.000001);
  return { lng: moonLng, isRetrograde: false };
}

export function calcMercury(T: number): { lng: number; isRetrograde: boolean } {
  const N = normalizeDegrees(48.3313  + 3.24587e-5  * T * 36525);
  const w = normalizeDegrees(29.1241  + 1.01444e-5  * T * 36525);
  const a = 0.387098;
  const e = 0.205635 + 5.59e-10 * T * 36525;
  const i = toRad(7.0047 + 5.00e-8 * T * 36525);
  const Mm = normalizeDegrees(168.6562 + 4.0923344 * (T * 36525));
  let E = toRad(Mm);
  for (let k = 0; k < 5; k++) E = toRad(Mm) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const gx = xh + Math.cos(toRad(sunLng));
  const gy = yh + Math.sin(toRad(sunLng));
  const lng = normalizeDegrees(toDeg(Math.atan2(gy, gx)));

  const elong = normalizeDegrees(lng - sunLng);
  const isRetrograde = (elong < 28 || elong > 332) && Math.sin(toRad(v)) > 0.3;
  return { lng, isRetrograde };
}

export function calcVenus(T: number): { lng: number; isRetrograde: boolean } {
  const N = normalizeDegrees(76.6799  + 2.46590e-5 * T * 36525);
  const w = normalizeDegrees(54.8910  + 1.38374e-5 * T * 36525);
  const a = 0.723330;
  const e = 0.006773 - 1.302e-9 * T * 36525;
  const i = toRad(3.3946 + 2.75e-8 * T * 36525);
  const Mv = normalizeDegrees(212.2794 + 1.6021302 * (T * 36525));
  let E = toRad(Mv);
  for (let k = 0; k < 5; k++) E = toRad(Mv) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const gx = xh + Math.cos(toRad(sunLng));
  const gy = yh + Math.sin(toRad(sunLng));
  const lng = normalizeDegrees(toDeg(Math.atan2(gy, gx)));

  const elong = normalizeDegrees(lng - sunLng);
  const isRetrograde = (elong < 47 || elong > 313) && Math.sin(toRad(v + 180)) > 0.5;
  return { lng, isRetrograde };
}

export function calcMars(T: number): { lng: number; isRetrograde: boolean } {
  const N = normalizeDegrees(49.5574 + 2.11081e-5 * T * 36525);
  const w = normalizeDegrees(286.5016 + 2.92961e-5 * T * 36525);
  const a = 1.523688;
  const e = 0.093405 + 2.516e-9 * T * 36525;
  const i = toRad(1.8497 - 1.78e-8 * T * 36525);
  const Mm = normalizeDegrees(18.6021 + 0.5240207766 * (T * 36525));
  let E = toRad(Mm);
  for (let k = 0; k < 5; k++) E = toRad(Mm) + e * Math.sin(E);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e*e) * Math.sin(E);
  const v  = toDeg(Math.atan2(yv, xv));
  const r  = Math.sqrt(xv*xv + yv*yv);
  const xh = r * (Math.cos(toRad(N)) * Math.cos(toRad(v + w - N)) - Math.sin(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));
  const yh = r * (Math.sin(toRad(N)) * Math.cos(toRad(v + w - N)) + Math.cos(toRad(N)) * Math.sin(toRad(v + w - N)) * Math.cos(i));

  const { lng: sunLng } = calcSun(T);
  const gx = xh + Math.cos(toRad(sunLng));
  const gy = yh + Math.sin(toRad(sunLng));
  const lng = normalizeDegrees(toDeg(Math.atan2(gy, gx)));

  const elong = normalizeDegrees(lng - sunLng);
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
  const N = normalizeDegrees(N0 + Nd * d);
  const w = normalizeDegrees(w0 + wd * d);
  const e = e0 + ed * d;
  const i = toRad(i0 + id * d);
  const Mm = normalizeDegrees(M0 + Md * d);
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
  const lng = normalizeDegrees(toDeg(Math.atan2(gy, gx)));
  const elong = normalizeDegrees(lng - sunLng);
  const isRetrograde = elong > 120 && elong < 240;
  return { lng, isRetrograde };
}

export function calcJupiter(T: number) {
  return outerPlanet(100.4542, 2.76854e-5, 273.8777, 1.64505e-5,
    5.20256, 0.048498, 4.469e-9, 1.3030, -1.557e-7,
    19.8950, 0.0830853001, T);
}
export function calcSaturn(T: number) {
  return outerPlanet(113.6634, 2.38980e-5, 339.3939, 2.97661e-5,
    9.55475, 0.055546, -9.499e-9, 2.4886, -1.081e-7,
    316.9670, 0.0334442282, T);
}
export function calcUranus(T: number) {
  return outerPlanet(74.0005, 1.3978e-5, 96.6612, 3.0565e-5,
    19.18171, 0.047318, 7.45e-9, 0.7733, 1.9e-8,
    142.5905, 0.011725806, T);
}
export function calcNeptune(T: number) {
  return outerPlanet(131.7806, 3.0173e-5, 272.8461, -6.027e-6,
    30.05826, 0.008606, 2.15e-9, 1.7700, -2.55e-7,
    260.2471, 0.005995147, T);
}
export function calcPluto(T: number): { lng: number; isRetrograde: boolean } {
  const L  = normalizeDegrees(238.92904 + 1.24e-4 * T * 36525);
  const e  = 0.24880 + 6.27e-10 * T * 36525;
  const Mp = normalizeDegrees(14.882 + 0.39893 * T * 36525);
  let E = toRad(Mp);
  for (let k = 0; k < 4; k++) E = toRad(Mp) + e * Math.sin(E);
  const v    = 2 * toDeg(Math.atan(Math.sqrt((1+e)/(1-e)) * Math.tan(E/2)));
  const lng  = normalizeDegrees(L + v - Mp);
  const { lng: sunLng } = calcSun(T);
  const elong = normalizeDegrees(lng - sunLng);
  return { lng, isRetrograde: elong > 130 && elong < 230 };
}

export function calcTrueNode(T: number): { lng: number; isRetrograde: boolean } {
  const omega = normalizeDegrees(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
  return { lng: omega, isRetrograde: true };
}

export function calcChiron(T: number): { lng: number; isRetrograde: boolean } {
  const L = normalizeDegrees(238.5 + 7.085 * T * 36525 / 365.25);
  const { lng: sunLng } = calcSun(T);
  const elong = normalizeDegrees(L - sunLng);
  return { lng: L, isRetrograde: elong > 140 && elong < 220 };
}

/** Calculate all 12 celestial bodies for Julian Century T */
export function calcAllEphemeris(T: number): RawCelestialPosition[] {
  return [
    { key: 'sun',     name: 'Sol',         symbol: '☉', en: 'Sun',       ...calcSun(T) },
    { key: 'moon',    name: 'Lua',         symbol: '☽', en: 'Moon',      ...calcMoon(T) },
    { key: 'mercury', name: 'Mercúrio',    symbol: '☿', en: 'Mercury',   ...calcMercury(T) },
    { key: 'venus',   name: 'Vênus',       symbol: '♀', en: 'Venus',     ...calcVenus(T) },
    { key: 'mars',    name: 'Marte',       symbol: '♂', en: 'Mars',      ...calcMars(T) },
    { key: 'jupiter', name: 'Júpiter',     symbol: '♃', en: 'Jupiter',   ...calcJupiter(T) },
    { key: 'saturn',  name: 'Saturno',     symbol: '♄', en: 'Saturn',    ...calcSaturn(T) },
    { key: 'uranus',  name: 'Urano',       symbol: '♅', en: 'Uranus',    ...calcUranus(T) },
    { key: 'neptune', name: 'Netuno',      symbol: '♆', en: 'Neptune',   ...calcNeptune(T) },
    { key: 'pluto',   name: 'Plutão',      symbol: '♇', en: 'Pluto',     ...calcPluto(T) },
    { key: 'node',    name: 'Nodo Norte',  symbol: '☊', en: 'True Node', ...calcTrueNode(T) },
    { key: 'chiron',  name: 'Quíron',       symbol: '⚷', en: 'Chiron',    ...calcChiron(T) },
  ];
}
