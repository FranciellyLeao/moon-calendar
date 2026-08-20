/**
 * House Systems Calculation Engine
 * Supports Placidus (Swiss Ephemeris semi-arc iteration), Equal House, Whole Sign
 */
import { normalizeDegrees, toRad, toDeg } from './format';

export type HouseSystemType = 'Placidus' | 'Equal' | 'WholeSign';

/**
 * True Placidus Semi-Arc Iterative Cusps (Swiss Ephemeris Standard)
 */
export function calcPlacidusCusps(asc: number, mc: number, lat: number, eps: number, lst: number): number[] {
  const cusps = new Array(12);
  cusps[0] = asc;                       // House 1 (ASC)
  cusps[9] = mc;                        // House 10 (MC)
  cusps[6] = normalizeDegrees(asc + 180); // House 7 (DSC)
  cusps[3] = normalizeDegrees(mc + 180);  // House 4 (IC)

  const latR = toRad(lat);
  const epsR = toRad(eps);

  function solveCusp(RAMC_h: number, factor: number, isAboveHorizon: boolean): number {
    let cuspRad = toRad(RAMC_h);
    for (let k = 0; k < 6; k++) {
      const sinDecl = Math.sin(epsR) * Math.sin(cuspRad);
      const tanDecl = sinDecl / Math.sqrt(Math.max(1e-10, 1 - sinDecl * sinDecl));
      const val = Math.tan(latR) * tanDecl;
      const ascDiff = Math.asin(Math.max(-0.9999, Math.min(0.9999, val)));
      const targetM = isAboveHorizon
        ? RAMC_h + toDeg(ascDiff) * factor
        : RAMC_h - toDeg(ascDiff) * factor;
      cuspRad = toRad(targetM);
    }
    const sinM = Math.sin(cuspRad);
    const cosM = Math.cos(cuspRad);
    return normalizeDegrees(toDeg(Math.atan2(sinM, cosM * Math.cos(epsR))));
  }

  const cusp11 = solveCusp(lst + 30, 1/3, true);
  const cusp12 = solveCusp(lst + 60, 2/3, true);
  const cusp2  = solveCusp(lst + 120, 2/3, false);
  const cusp3  = solveCusp(lst + 150, 1/3, false);

  cusps[10] = cusp11;
  cusps[11] = cusp12;
  cusps[1]  = cusp2;
  cusps[2]  = cusp3;
  cusps[4]  = normalizeDegrees(cusp11 + 180);
  cusps[5]  = normalizeDegrees(cusp12 + 180);
  cusps[7]  = normalizeDegrees(cusp2 + 180);
  cusps[8]  = normalizeDegrees(cusp3 + 180);

  if (Math.abs(lat) >= 66) {
    return Array.from({ length: 12 }, (_, i) => normalizeDegrees(asc + i * 30));
  }
  return cusps;
}

/** Equal house cusps starting from Ascendant */
export function calcEqualCusps(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees(asc + i * 30));
}

/** Whole sign house cusps starting from sign boundary */
export function calcWholeSignCusps(asc: number): number[] {
  const ascSignIdx = Math.floor(asc / 30);
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees((ascSignIdx + i) * 30));
}

/** Select cusps based on chosen house system */
export function calcHouseCusps(
  system: HouseSystemType,
  asc: number,
  mc: number,
  lat: number,
  eps: number,
  lst: number
): number[] {
  if (system === 'Equal') return calcEqualCusps(asc);
  if (system === 'WholeSign') return calcWholeSignCusps(asc);
  return calcPlacidusCusps(asc, mc, lat, eps, lst);
}

/** Locate house number (1-12) for a given planet ecliptic longitude */
export function getHouseForLongitude(planetLng: number, cusps: number[]): number {
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
