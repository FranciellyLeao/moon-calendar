/**
 * Core Astronomical Time & Coordinate Systems
 * Based on Jean Meeus "Astronomical Algorithms" (2nd Ed.) Cap 7, 12, 14
 */
import { normalizeDegrees, toRad, toDeg } from './format';

/** Convert local birth date & time to Julian Day (UT) */
export function julianDay(year: number, month: number, day: number, utHours: number): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utHours / 24 + B - 1524.5;
}

/** Julian Centuries T since epoch J2000.0 */
export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/** Greenwich Mean Sidereal Time (GMST) in degrees at UT */
export function calcGMST(jd: number): number {
  const T = julianCenturies(jd);
  const GMST = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000.0;
  return normalizeDegrees(GMST);
}

/** Local Sidereal Time (LST / RAMC) in degrees */
export function calcLST(jd: number, lngDeg: number): number {
  return normalizeDegrees(calcGMST(jd) + lngDeg);
}

/** Mean Obliquity of Ecliptic (epsilon) in degrees */
export function calcObliquity(T: number): number {
  return 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
}

/**
 * 100% Mathematically Correct Ascendant Formula (Meeus Cap 14)
 * Asc = atan2( cos(LST), -sin(LST)*cos(eps) - tan(lat)*sin(eps) )
 */
export function calcAscendant(lst: number, lat: number, eps: number): number {
  const lstR = toRad(lst);
  const latR = toRad(lat);
  const epsR = toRad(eps);
  const y = Math.cos(lstR);
  const x = -Math.sin(lstR) * Math.cos(epsR) - Math.tan(latR) * Math.sin(epsR);
  return normalizeDegrees(toDeg(Math.atan2(y, x)));
}

/**
 * Mathematically Correct Midheaven Formula (MC)
 * MC = atan2( sin(LST), cos(LST)*cos(eps) )
 */
export function calcMidheaven(lst: number, eps: number): number {
  const lstR = toRad(lst);
  const epsR = toRad(eps);
  const y = Math.sin(lstR);
  const x = Math.cos(lstR) * Math.cos(epsR);
  return normalizeDegrees(toDeg(Math.atan2(y, x)));
}
