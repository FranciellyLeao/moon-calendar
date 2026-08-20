import type { NatalChart } from '../types';
import { ZODIAC_SIGNS } from './astronomy';
import { calcFullNatalChart } from './planetaryPositions';

export interface CityCoordinates {
  name: string;
  country: string;
  lat: number;
  lng: number;
  defaultUtcOffset: number;
}

export const CITIES_DATABASE: CityCoordinates[] = [
  // Santa Catarina & South
  { name: 'Balneário Camboriú', country: 'Brasil', lat: -26.9906, lng: -48.6347, defaultUtcOffset: -3 },
  { name: 'Itajaí', country: 'Brasil', lat: -26.9080, lng: -48.6619, defaultUtcOffset: -3 },
  { name: 'Florianópolis', country: 'Brasil', lat: -27.5954, lng: -48.5480, defaultUtcOffset: -3 },
  { name: 'Joinville', country: 'Brasil', lat: -26.3045, lng: -48.8487, defaultUtcOffset: -3 },
  { name: 'Blumenau', country: 'Brasil', lat: -26.9194, lng: -49.0661, defaultUtcOffset: -3 },
  { name: 'Chapecó', country: 'Brasil', lat: -27.1004, lng: -52.6152, defaultUtcOffset: -3 },
  { name: 'Criciúma', country: 'Brasil', lat: -28.6773, lng: -49.3704, defaultUtcOffset: -3 },
  { name: 'Lages', country: 'Brasil', lat: -27.8160, lng: -50.3260, defaultUtcOffset: -3 },
  { name: 'Jaraguá do Sul', country: 'Brasil', lat: -26.4851, lng: -49.0805, defaultUtcOffset: -3 },
  { name: 'Tubarão', country: 'Brasil', lat: -28.4728, lng: -49.0142, defaultUtcOffset: -3 },
  { name: 'Brusque', country: 'Brasil', lat: -27.0979, lng: -48.9130, defaultUtcOffset: -3 },
  { name: 'São José', country: 'Brasil', lat: -27.6136, lng: -48.6366, defaultUtcOffset: -3 },
  { name: 'Palhoça', country: 'Brasil', lat: -27.6447, lng: -48.6694, defaultUtcOffset: -3 },
  { name: 'Camboriú', country: 'Brasil', lat: -27.0244, lng: -48.6553, defaultUtcOffset: -3 },
  { name: 'Navegantes', country: 'Brasil', lat: -26.8986, lng: -48.6536, defaultUtcOffset: -3 },
  // Major Capitals & Metropolises
  { name: 'São Paulo', country: 'Brasil', lat: -23.5505, lng: -46.6333, defaultUtcOffset: -3 },
  { name: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lng: -43.1729, defaultUtcOffset: -3 },
  { name: 'Brasília', country: 'Brasil', lat: -15.7975, lng: -47.8919, defaultUtcOffset: -3 },
  { name: 'Salvador', country: 'Brasil', lat: -12.9777, lng: -38.5016, defaultUtcOffset: -3 },
  { name: 'Fortaleza', country: 'Brasil', lat: -3.7319, lng: -38.5267, defaultUtcOffset: -3 },
  { name: 'Belo Horizonte', country: 'Brasil', lat: -19.9167, lng: -43.9345, defaultUtcOffset: -3 },
  { name: 'Manaus', country: 'Brasil', lat: -3.1190, lng: -60.0217, defaultUtcOffset: -4 },
  { name: 'Curitiba', country: 'Brasil', lat: -25.4284, lng: -49.2733, defaultUtcOffset: -3 },
  { name: 'Recife', country: 'Brasil', lat: -8.0476, lng: -34.8770, defaultUtcOffset: -3 },
  { name: 'Porto Alegre', country: 'Brasil', lat: -30.0346, lng: -51.2177, defaultUtcOffset: -3 },
  { name: 'Belém', country: 'Brasil', lat: -1.4558, lng: -48.4902, defaultUtcOffset: -3 },
  { name: 'Goiânia', country: 'Brasil', lat: -16.6869, lng: -49.2648, defaultUtcOffset: -3 },
  { name: 'Campinas', country: 'Brasil', lat: -22.9099, lng: -47.0626, defaultUtcOffset: -3 },
  { name: 'Vitória', country: 'Brasil', lat: -20.3155, lng: -40.3128, defaultUtcOffset: -3 },
  { name: 'Lisboa', country: 'Portugal', lat: 38.7223, lng: -9.1393, defaultUtcOffset: 0 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291, defaultUtcOffset: 0 },
  { name: 'Madrid', country: 'Espanha', lat: 40.4168, lng: -3.7038, defaultUtcOffset: 1 },
  { name: 'Nova York', country: 'EUA', lat: 40.7128, lng: -74.0060, defaultUtcOffset: -5 },
  { name: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278, defaultUtcOffset: 0 },
  { name: 'Paris', country: 'França', lat: 48.8566, lng: 2.3522, defaultUtcOffset: 1 },
  { name: 'Tóquio', country: 'Japão', lat: 35.6762, lng: 139.6503, defaultUtcOffset: 9 },
];

export function findCity(cityName: string): CityCoordinates | undefined {
  const norm = cityName.trim().toLowerCase();
  return CITIES_DATABASE.find(
    (c) => c.name.toLowerCase() === norm || c.name.toLowerCase().includes(norm)
  );
}

/** Geocode city using OpenStreetMap Nominatim API for any unlisted city */
export async function geocodeCityOnline(cityName: string): Promise<CityCoordinates | null> {
  const localMatch = findCity(cityName);
  if (localMatch) return localMatch;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return {
        name: data[0].display_name.split(',')[0],
        country: 'Global',
        lat,
        lng,
        defaultUtcOffset: -3,
      };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return null;
}

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
