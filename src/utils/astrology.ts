import type { NatalChart } from '../types';
import { ZODIAC_SIGNS } from './astronomy';
import { calcFullNatalChart } from './planetaryPositions';
import { findCity } from './geocoding';

export { CITIES_DATABASE, findCity, geocodeCityOnline, type CityCoordinates } from './geocoding';

export function getSunZodiacSign(month: number, day: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11];
}

export function calculateNatalChart(
  birthDateStr: string,
  birthTimeStr: string,
  birthCity: string,
  lat?: number,
  lng?: number,
  utcOffset?: number,
  houseSystem: 'Placidus' | 'Equal' | 'WholeSign' = 'Placidus'
): NatalChart {
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const [hours, minutes] = (birthTimeStr || '12:00').split(':').map(Number);

  const cityMatch = findCity(birthCity);
  const finalLat = lat ?? cityMatch?.lat ?? -26.9906; // Default to Balneário Camboriú if not found
  const finalLng = lng ?? cityMatch?.lng ?? -48.6347;
  const finalUtcOffset = utcOffset ?? cityMatch?.defaultUtcOffset ?? -3;

  const fullChart = calcFullNatalChart(
    year, month, day,
    hours, minutes,
    finalLat, finalLng, finalUtcOffset,
    houseSystem
  );

  const sunPlanet  = fullChart.tropical.find((p) => p.planet === 'Sol')!;
  const moonPlanet = fullChart.tropical.find((p) => p.planet === 'Lua')!;

  const sunZodiac    = ZODIAC_SIGNS.find((z) => z.name === sunPlanet.sign)  || ZODIAC_SIGNS[0];
  const moonZodiac   = ZODIAC_SIGNS.find((z) => z.name === moonPlanet.sign) || ZODIAC_SIGNS[0];
  const risingZodiac = ZODIAC_SIGNS.find((z) => z.name === fullChart.ascendantSign) || ZODIAC_SIGNS[0];

  const ascSignIdx = ZODIAC_SIGNS.findIndex((z) => z.name === fullChart.ascendantSign);
  const houses = Array.from({ length: 12 }, (_, i) => {
    const s = ZODIAC_SIGNS[(ascSignIdx + i) % 12];
    return { house: i + 1, sign: s.name, symbol: s.symbol };
  });

  const ELEMENT_MAP: Record<string, string> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
  };
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const weighted = [
    { sign: sunPlanet.sign, w: 3 },
    { sign: moonPlanet.sign, w: 3 },
    { sign: fullChart.ascendantSign, w: 2 },
    ...fullChart.tropical.filter((p) => !['Sol','Lua'].includes(p.planet)).map((p) => ({ sign: p.sign, w: 1 })),
  ];
  let totalW = 0;
  weighted.forEach(({ sign, w }) => {
    const el = ELEMENT_MAP[sign] as keyof typeof elementCounts;
    if (el) { elementCounts[el] += w; totalW += w; }
  });
  const elements = {
    fire:  Math.round((elementCounts.Fire  / totalW) * 100) || 25,
    earth: Math.round((elementCounts.Earth / totalW) * 100) || 25,
    air:   Math.round((elementCounts.Air   / totalW) * 100) || 25,
    water: Math.round((elementCounts.Water / totalW) * 100) || 25,
  };

  const nextReturn = new Date(year, month - 1, day);
  nextReturn.setFullYear(new Date().getFullYear());
  if (nextReturn < new Date()) nextReturn.setFullYear(new Date().getFullYear() + 1);

  return {
    birthDate: birthDateStr,
    birthTime: birthTimeStr,
    birthCity,
    lat: finalLat,
    lng: finalLng,
    utcOffset: finalUtcOffset,
    timezone: cityMatch?.timezone || 'America/Sao_Paulo',
    houseSystem,
    sunSign: sunZodiac.name,
    sunSymbol: sunZodiac.symbol,
    moonSign: moonZodiac.name,
    moonSymbol: moonZodiac.symbol,
    risingSign: risingZodiac.name,
    risingSymbol: risingZodiac.symbol,
    elements,
    houses,
    lunarReturnDate: nextReturn.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }),
    fullChart,
  };
}

export const SIGN_DESCRIPTIONS: Record<string, { pt: string; en: string }> = {
  Aries:       { pt: 'Pioneiro, corajoso e apaixonado. Move-se com energia de fogo pura e iniciativa rápida.', en: 'Pioneering, courageous, and passionate. Driven by pure fire energy and quick initiative.' },
  Taurus:      { pt: 'Estável, focado na beleza, conforto e na força dos ritmos naturais da terra.', en: 'Grounded, stable, aligned with physical beauty, comfort, and natural earth rhythms.' },
  Gemini:      { pt: 'Curioso, comunicativo e versátil. Adapta-se rapidamente como a brisa da primavera.', en: 'Curious, communicative, and versatile. Adapts quickly like a fresh spring breeze.' },
  Cancer:      { pt: 'Intuitivo, protetor e profundamente conectado às marés emocionais da Lua.', en: 'Intuitive, protective, and deeply attuned to the emotional tides of the Moon.' },
  Leo:         { pt: 'Radiante, generoso e magnético. Carrega o brilho aquecido do Sol central.', en: 'Radiant, generous, and magnetic. Carries the warm glow of the central Sun.' },
  Virgo:       { pt: 'Analítico, dedicado ao aperfeiçoamento, saúde, rituais diários e discernimento.', en: 'Analytical, dedicated to self-improvement, health, daily rituals, and clarity.' },
  Libra:       { pt: 'Harmonioso, diplomático e amante da estética, das artes e dos relacionamentos.', en: 'Harmonious, diplomatic, lover of aesthetics, fine arts, and balanced relationships.' },
  Scorpio:     { pt: 'Profundo, transformador e místico. Navega pelas correntes ocultas da regeneração.', en: 'Deep, transformative, and mystical. Navigates the hidden currents of rebirth.' },
  Sagittarius: { pt: 'Expansivo, filosófico e aventureiro. Busca sempre a verdade nos horizontes distantes.', en: 'Expansive, philosophical, and adventurous. Always seeking truth on distant horizons.' },
  Capricorn:   { pt: 'Determinado, disciplinado e mestre na construção de realizações duradouras.', en: 'Determined, disciplined, and a master at constructing long-lasting achievements.' },
  Aquarius:    { pt: 'Visionário, original e humanitário. Traz as brisas inovadoras do futuro.', en: 'Visionary, original, and humanitarian. Brings innovative breezes from the future.' },
  Pisces:      { pt: 'Empático, sonhador e místico. Conectado ao oceano infinito da intuição universal.', en: 'Empathic, dreamy, and mystical. Connected to the infinite ocean of universal intuition.' },
};
