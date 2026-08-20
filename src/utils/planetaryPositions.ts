/**
 * Planetary Positions & Natal Chart Calculation Pipeline
 * Re-exports modularized astronomy components
 */
import { normalizeDegrees, formatDMS, chartAngle } from './format';
import { julianDay, julianCenturies, calcObliquity, calcLST, calcAscendant, calcMidheaven } from './astronomyCore';
import { calcHouseCusps, getHouseForLongitude, type HouseSystemType } from './houses';
import { calcAllEphemeris, type RawCelestialPosition } from './ephemeris';
import { getLahiriAyanamsha, toSiderealLongitude, getNakshatraInfo } from './vedic';

export { normalizeDegrees, formatDMS, chartAngle };
export { julianDay, julianCenturies, calcObliquity, calcLST, calcAscendant, calcMidheaven };
export { calcHouseCusps, getHouseForLongitude, type HouseSystemType };
export { getLahiriAyanamsha, toSiderealLongitude, getNakshatraInfo };

export const ZODIAC_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

export const ZODIAC_NAMES_PT = [
  'Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
  'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'
];

export const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export interface PlanetPosition {
  planet: string;
  symbol: string;
  longitude: number;   // tropical ecliptic longitude 0–360
  sign: string;
  signPt: string;
  signSymbol: string;
  degree: number;      // degree within sign (0–29.99)
  minutes: number;     // minutes of arc
  seconds: number;     // seconds of arc
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
 * Calculate full natal chart pipeline
 */
export function calcFullNatalChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
  utcOffset: number = -3,
  houseSystem: HouseSystemType = 'Placidus'
): FullNatalChart {
  const ut = hour + minute / 60 - utcOffset;
  const jd = julianDay(year, month, day, ut);
  const T  = julianCenturies(jd);
  const eps = calcObliquity(T);

  const rawPlanets: RawCelestialPosition[] = calcAllEphemeris(T);

  const lst    = calcLST(jd, lng);
  const ascLng = calcAscendant(lst, lat, eps);
  const mcLng  = calcMidheaven(lst, eps);
  const cusps  = calcHouseCusps(houseSystem, ascLng, mcLng, lat, eps, lst);

  const ayanamsha = getLahiriAyanamsha(T);

  function makePlanet(p: RawCelestialPosition, tropical = true): PlanetPosition {
    const longitude = tropical ? p.lng : toSiderealLongitude(p.lng, ayanamsha);
    const s = signFromLng(longitude);
    const nak = getNakshatraInfo(longitude);
    const houseCuspsUsed = tropical ? cusps : cusps.map(c => toSiderealLongitude(c, ayanamsha));
    return {
      planet: p.name, symbol: p.symbol, longitude,
      sign: s.sign, signPt: s.signPt, signSymbol: s.symbol,
      degree: s.degree, minutes: s.minutes, seconds: s.seconds,
      isRetrograde: p.isRetrograde,
      house: getHouseForLongitude(longitude, houseCuspsUsed),
      vedicSign: signFromLng(toSiderealLongitude(p.lng, ayanamsha)).signPt,
      nakshatra: nak.name, nakshatraRuler: nak.ruler, nakshatraPada: nak.pada,
    };
  }

  const tropical = rawPlanets.map(p => makePlanet(p, true));
  const vedic    = rawPlanets.map(p => makePlanet(p, false));
  const aspects  = calcAspects(tropical);

  const ascInfo = signFromLng(ascLng);
  const mcInfo  = signFromLng(mcLng);
  const vAscInfo = signFromLng(toSiderealLongitude(ascLng, ayanamsha));
  const moonNak = getNakshatraInfo(tropical[1].longitude);
  const sunNak  = getNakshatraInfo(tropical[0].longitude);

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
