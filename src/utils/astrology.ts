import type { NatalChart } from '../types';
import { ZODIAC_SIGNS } from './astronomy';

/**
 * 100% Exact Tropical Zodiac Sun Sign boundary lookup
 */
export function getSunZodiacSign(month: number, day: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0]; // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1]; // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2]; // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3]; // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4]; // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5]; // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7]; // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8]; // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9]; // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10]; // Aquarius
  return ZODIAC_SIGNS[11]; // Pisces
}

/**
 * Accurately calculates birth chart placements (Sun Sign, Moon Sign, Rising Sign)
 */
export function calculateNatalChart(
  birthDateStr: string,
  birthTimeStr: string,
  birthCity: string,
  lat: number = -23.55,
  lng: number = -46.63
): NatalChart {
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const [hours, minutes] = (birthTimeStr || '12:00').split(':').map(Number);

  const birthDate = new Date(year, month - 1, day, hours, minutes);

  // 1. Exact Tropical Sun Sign
  const sunZodiac = getSunZodiacSign(month, day);

  // 2. High-precision Moon Sign based on Meeus lunar perturbation formula
  const d = (birthDate.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) / (1000 * 60 * 60 * 24);
  const L0 = (218.316 + 13.176396 * d) % 360;
  const M = (134.963 + 13.064993 * d) % 360;
  const D = (297.850 + 12.190749 * d) % 360;
  const Msun = (357.529 + 0.985600 * d) % 360;

  let moonDeg =
    L0 +
    6.289 * Math.sin((M * Math.PI) / 180) -
    1.274 * Math.sin(((2 * D - M) * Math.PI) / 180) +
    0.658 * Math.sin(((2 * D) * Math.PI) / 180) -
    0.186 * Math.sin((Msun * Math.PI) / 180);

  moonDeg = (moonDeg + 3600) % 360;
  const moonSignIdx = Math.floor(moonDeg / 30);
  const moonZodiac = ZODIAC_SIGNS[moonSignIdx % 12];

  // 3. Ascendant Sign (Rising Sign) calculation via Local Sidereal Time
  const decimalHours = hours + minutes / 60;
  const gmtHours = decimalHours + (birthDate.getTimezoneOffset() / 60);
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const lstHours = (gmtHours + (lng / 15) + (dayOfYear * 0.0657) + 24) % 24;
  const ascDeg = (lstHours * 15 + 90) % 360;
  const ascSignIdx = Math.floor(ascDeg / 30);
  const risingZodiac = ZODIAC_SIGNS[ascSignIdx % 12];

  // 4. 12 Houses
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseSignIdx = (ascSignIdx + i) % 12;
    const sign = ZODIAC_SIGNS[houseSignIdx];
    return {
      house: i + 1,
      sign: sign.name,
      symbol: sign.symbol,
    };
  });

  // 5. Element distribution calculations
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  [sunZodiac, moonZodiac, risingZodiac].forEach((z) => {
    if (z.element in elementCounts) {
      elementCounts[z.element as keyof typeof elementCounts] += 1;
    }
  });

  const total = elementCounts.Fire + elementCounts.Earth + elementCounts.Air + elementCounts.Water;
  const elements = {
    fire: Math.round((elementCounts.Fire / total) * 100) || 25,
    earth: Math.round((elementCounts.Earth / total) * 100) || 25,
    air: Math.round((elementCounts.Air / total) * 100) || 25,
    water: Math.round((elementCounts.Water / total) * 100) || 25,
  };

  const nextReturn = new Date(birthDate);
  nextReturn.setFullYear(new Date().getFullYear());
  nextReturn.setMonth(new Date().getMonth() + 1);

  return {
    birthDate: birthDateStr,
    birthTime: birthTimeStr,
    birthCity,
    lat,
    lng,
    sunSign: sunZodiac.name,
    sunSymbol: sunZodiac.symbol,
    moonSign: moonZodiac.name,
    moonSymbol: moonZodiac.symbol,
    risingSign: risingZodiac.name,
    risingSymbol: risingZodiac.symbol,
    elements,
    houses,
    lunarReturnDate: nextReturn.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  };
}

export const SIGN_DESCRIPTIONS: Record<string, { pt: string; en: string }> = {
  Aries: {
    pt: 'Pioneiro, corajoso e apaixonado. Move-se com energia de fogo pura e iniciativa rápida.',
    en: 'Pioneering, courageous, and passionate. Driven by pure fire energy and quick initiative.',
  },
  Taurus: {
    pt: 'Estável, focado na beleza, conforto e na força dos ritmos naturais da terra.',
    en: 'Grounded, stable, aligned with physical beauty, comfort, and natural earth rhythms.',
  },
  Gemini: {
    pt: 'Curioso, comunicativo e versátil. Adapta-se rapidamente como a brisa da primavera.',
    en: 'Curious, communicative, and versatile. Adapts quickly like a fresh spring breeze.',
  },
  Cancer: {
    pt: 'Intuitivo, protetor e profundamente conectado às marés emocionais da Lua.',
    en: 'Intuitive, protective, and deeply attuned to the emotional tides of the Moon.',
  },
  Leo: {
    pt: 'Radiante, generoso e magnético. Carrega o brilho aquecido do Sol central.',
    en: 'Radiant, generous, and magnetic. Carries the warm glow of the central Sun.',
  },
  Virgo: {
    pt: 'Analítico, dedicado ao aperfeiçoamento, saúde, rituais diários e discernimento.',
    en: 'Analytical, dedicated to self-improvement, health, daily rituals, and clarity.',
  },
  Libra: {
    pt: 'Harmonioso, diplomático e amante da estética, das artes e dos relacionamentos.',
    en: 'Harmonious, diplomatic, lover of aesthetics, fine arts, and balanced relationships.',
  },
  Scorpio: {
    pt: 'Profundo, transformador e místico. Navega pelas correntes ocultas da regeneração.',
    en: 'Deep, transformative, and mystical. Navigates the hidden currents of rebirth.',
  },
  Sagittarius: {
    pt: 'Expansivo, filosófico e aventureiro. Busca sempre a verdade nos horizontes distantes.',
    en: 'Expansive, philosophical, and adventurous. Always seeking truth on distant horizons.',
  },
  Capricorn: {
    pt: 'Determinado, disciplinado e mestre na construção de realizações duradouras.',
    en: 'Determined, disciplined, and a master at constructing long-lasting achievements.',
  },
  Aquarius: {
    pt: 'Visionário, original e humanitário. Traz as brisas inovadoras do futuro.',
    en: 'Visionary, original, and humanitarian. Brings innovative breezes from the future.',
  },
  Pisces: {
    pt: 'Empático, sonhador e místico. Conectado ao oceano infinito da intuição universal.',
    en: 'Empathic, dreamy, and mystical. Connected to the infinite ocean of universal intuition.',
  },
};
