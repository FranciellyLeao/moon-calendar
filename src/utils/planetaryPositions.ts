/**
 * Planetary Positions & Natal Chart Calculation Pipeline
 * Backed directly by Swiss Ephemeris (@swisseph/browser / @swisseph/node)
 */
import { normalizeDegrees, formatDMS, chartAngle } from './format';
import { getHouseForLongitude, type HouseSystemType } from './houses';
import { getNakshatraInfo, toSiderealLongitude, getLahiriAyanamsha } from './vedic';
import {
  calculateSwissAstronomy,
  type RawCelestialPosition,
} from './swissEphemeris';

export { normalizeDegrees, formatDMS, chartAngle };
export { getHouseForLongitude, type HouseSystemType };
export { getLahiriAyanamsha, toSiderealLongitude, getNakshatraInfo };

export const ZODIAC_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

export const ZODIAC_NAMES_PT = [
  'Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
  'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'
];

export const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','FH'];

export interface PlanetPosition {
  planet: string;
  symbol: string;
  longitude: number;           // tropical ecliptic longitude (0-360)
  tropicalLongitude: number;   // explicit tropical longitude
  siderealLongitude: number;   // explicit sidereal longitude
  longitudeSpeed: number;      // angular speed (°/day)
  isRetrograde: boolean;       // longitudeSpeed < 0
  sign: string;
  signPt: string;
  signSymbol: string;
  degree: number;
  minutes: number;
  seconds: number;
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
  ascendantSignPt: string;
  ascendantSymbol: string;
  ascendantDegree: number;
  ascendantMinutes: number;
  midheaven: number;
  midheavenSign: string;
  midheavenSignPt: string;
  midheavenSymbol: string;
  houseSystem: HouseSystemType;
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

function signFromLng(lng: number) {
  const norm = normalizeDegrees(lng);
  const idx  = Math.floor(norm / 30) % 12;
  const deg  = norm % 30;
  const minutesTotal = (deg % 1) * 60;
  return {
    sign:   ZODIAC_NAMES[idx],
    signPt: ZODIAC_NAMES_PT[idx],
    symbol: ZODIAC_SYMBOLS[idx],
    degree: Math.floor(deg),
    minutes: Math.floor(minutesTotal),
    seconds: Math.floor((minutesTotal % 1) * 60),
    index:  idx,
  };
}

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

/**
 * Calculate full natal chart pipeline using Swiss Ephemeris
 */
export async function calcFullNatalChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
  utcOffset: number = -3,
  houseSystem: HouseSystemType = 'Placidus'
): Promise<FullNatalChart> {
  const swiss = await calculateSwissAstronomy({
    year, month, day, hour, minute, lat, lng, utcOffset, houseSystem
  });

  const cusps = swiss.houseCusps;
  const ayanamsha = swiss.ayanamshaLahiri;

  function makePlanet(p: RawCelestialPosition, tropical = true): PlanetPosition {
    const tropicalLng = normalizeDegrees(p.lng);
    const siderealLng = toSiderealLongitude(tropicalLng, ayanamsha);
    const longitude   = tropical ? tropicalLng : siderealLng;
    const s = signFromLng(longitude);

    // Nakshatras are strictly calculated from sidereal longitude
    const nak = getNakshatraInfo(siderealLng);
    const houseCuspsUsed = tropical ? cusps : cusps.map(c => toSiderealLongitude(c, ayanamsha));

    return {
      planet: p.name,
      symbol: p.symbol,
      longitude,
      tropicalLongitude: tropicalLng,
      siderealLongitude: siderealLng,
      longitudeSpeed: p.longitudeSpeed,
      isRetrograde: p.isRetrograde,
      sign: s.sign,
      signPt: s.signPt,
      signSymbol: s.symbol,
      degree: s.degree,
      minutes: s.minutes,
      seconds: s.seconds,
      house: getHouseForLongitude(longitude, houseCuspsUsed),
      vedicSign: signFromLng(siderealLng).signPt,
      nakshatra: nak.name,
      nakshatraRuler: nak.ruler,
      nakshatraPada: nak.pada,
    };
  }

  const tropical = swiss.planets.map(p => makePlanet(p, true));
  const vedic    = swiss.planets.map(p => makePlanet(p, false));
  const aspects  = calcAspects(tropical);

  const ascLng = normalizeDegrees(swiss.ascendant);
  const mcLng  = normalizeDegrees(swiss.midheaven);
  const ascInfo = signFromLng(ascLng);
  const mcInfo  = signFromLng(mcLng);

  const vAscLng  = toSiderealLongitude(ascLng, ayanamsha);
  const vAscInfo = signFromLng(vAscLng);

  const moonVedic = vedic.find(p => p.planet === 'Lua')!;
  const sunVedic  = vedic.find(p => p.planet === 'Sol')!;
  const moonNak = getNakshatraInfo(moonVedic.siderealLongitude);
  const sunNak  = getNakshatraInfo(sunVedic.siderealLongitude);

  return {
    tropical, vedic,
    ascendant: ascLng,
    ascendantSign: ascInfo.sign,
    ascendantSignPt: ascInfo.signPt,
    ascendantSymbol: ascInfo.symbol,
    ascendantDegree: ascInfo.degree, ascendantMinutes: ascInfo.minutes,
    midheaven: mcLng,
    midheavenSign: mcInfo.sign,
    midheavenSignPt: mcInfo.signPt,
    midheavenSymbol: mcInfo.symbol,
    houseSystem,
    houseCusps: cusps, aspects, ayanamsha: Math.round(ayanamsha * 100) / 100,
    vedicAscendant: vAscInfo.signPt, vedicAscendantSymbol: vAscInfo.symbol,
    moonNakshatra: moonNak.name, moonNakshatraRuler: moonNak.ruler, moonNakshatraPada: moonNak.pada,
    sunNakshatra: sunNak.name, vedicLagna: vAscInfo.signPt,
  };
}
