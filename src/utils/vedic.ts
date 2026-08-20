/**
 * Vedic Astrology (Jyotish) Engine
 * Lahiri Ayanamsha, Sidereal Zodiac, and 27 Nakshatras with Padas 1-4
 */
import { normalizeDegrees } from './format';

export const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

export const NAKSHATRA_RULERS = [
  'Ketu','Vênus','Sol','Lua','Marte','Rahu','Júpiter','Saturno','Mercúrio',
  'Ketu','Vênus','Sol','Lua','Marte','Rahu','Júpiter','Saturno','Mercúrio',
  'Ketu','Vênus','Sol','Lua','Marte','Rahu','Júpiter','Saturno','Mercúrio'
];

/** Lahiri Ayanamsha for Julian Centuries T */
export function getLahiriAyanamsha(T: number): number {
  return 23.853 + (50.2564 / 3600) * T * 36525;
}

/** Convert Tropical longitude to Sidereal (Lahiri) */
export function toSiderealLongitude(tropicalLng: number, ayanamsha: number): number {
  return normalizeDegrees(tropicalLng - ayanamsha);
}

/** Get Nakshatra name, planetary ruler, and Pada (1-4) for a given sidereal or tropical longitude */
export function getNakshatraInfo(longitude: number): { name: string; ruler: string; pada: number } {
  const norm = normalizeDegrees(longitude);
  const span = 360 / 27;
  const idx  = Math.floor(norm / span) % 27;
  const pada = Math.min(4, Math.floor((norm % span) / (span / 4)) + 1);
  return { name: NAKSHATRA_NAMES[idx], ruler: NAKSHATRA_RULERS[idx], pada };
}
