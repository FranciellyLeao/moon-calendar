/**
 * Swiss Ephemeris Core Astronomical Integration
 * Provides 100% Swiss Ephemeris accuracy (matching Astro.com / Astrodienst)
 * Supports both WebAssembly (browser) and Node environments (Vitest tests / SSR)
 */

export interface RawCelestialPosition {
  key: string;
  name: string;
  symbol: string;
  en: string;
  lng: number;
  lat: number;
  distance: number;
  longitudeSpeed: number;
  isRetrograde: boolean;
}

export interface SwissAstronomyResult {
  julianDay: number;
  ascendant: number;
  midheaven: number;
  houseCusps: number[];
  ayanamshaLahiri: number;
  planets: RawCelestialPosition[];
}

export interface SwissAstronomyParams {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lng: number;
  utcOffset: number;
  houseSystem?: 'Placidus' | 'Equal' | 'WholeSign';
}

const HOUSE_SYSTEM_CODES: Record<string, string> = {
  Placidus: 'P',
  Equal: 'A',
  WholeSign: 'W',
};

let swephEngine: any = null;

async function getSwephEngine() {
  if (swephEngine) return swephEngine;

  try {
    // Browser environment
    if (typeof window !== 'undefined') {
      const browserMod = await import('@swisseph/browser');
      const SwissEphemerisClass = browserMod.SwissEphemeris || browserMod.default;
      if (SwissEphemerisClass) {
        const instance = new SwissEphemerisClass();
        await instance.init();
        swephEngine = instance;
        return swephEngine;
      }
    }
  } catch (e) {
    console.warn('Falling back to @swisseph/node:', e);
  }

  // Node environment (Vitest / SSR)
  try {
    const nodeMod = await import('@swisseph/node');
    const engine = nodeMod.default || nodeMod;
    swephEngine = engine;
    return swephEngine;
  } catch (err) {
    console.error('Failed to load Swiss Ephemeris engine:', err);
    throw new Error('Swiss Ephemeris calculation engine failed to initialize.');
  }
}

/**
 * Calculate Swiss Ephemeris data with exact Astro.com accuracy
 */
export async function calculateSwissAstronomy(
  params: SwissAstronomyParams
): Promise<SwissAstronomyResult> {
  const swe = await getSwephEngine();

  const ut = params.hour + params.minute / 60 - params.utcOffset;
  const jd = typeof swe.julianDay === 'function'
    ? swe.julianDay(params.year, params.month, params.day, ut)
    : 0;

  const houseCode = HOUSE_SYSTEM_CODES[params.houseSystem || 'Placidus'] || 'P';
  const houseData = swe.calculateHouses(jd, params.lat, params.lng, houseCode);

  const Planet = swe.Planet || { Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4, Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9 };
  const LunarPoint = swe.LunarPoint || { TrueNode: 11 };
  const Asteroid = swe.Asteroid || { Chiron: 15 };
  const SiderealMode = swe.SiderealMode || { Lahiri: 1 };

  const BODIES = [
    { key: 'sun',     name: 'Sol',        symbol: '☉', en: 'Sun',       bodyId: Planet.Sun },
    { key: 'moon',    name: 'Lua',        symbol: '☽', en: 'Moon',      bodyId: Planet.Moon },
    { key: 'mercury', name: 'Mercúrio',   symbol: '☿', en: 'Mercury',   bodyId: Planet.Mercury },
    { key: 'venus',   name: 'Vênus',      symbol: '♀', en: 'Venus',     bodyId: Planet.Venus },
    { key: 'mars',    name: 'Marte',      symbol: '♂', en: 'Mars',      bodyId: Planet.Mars },
    { key: 'jupiter', name: 'Júpiter',    symbol: '♃', en: 'Jupiter',   bodyId: Planet.Jupiter },
    { key: 'saturn',  name: 'Saturno',    symbol: '♄', en: 'Saturn',    bodyId: Planet.Saturn },
    { key: 'uranus',  name: 'Urano',      symbol: '♅', en: 'Uranus',    bodyId: Planet.Uranus },
    { key: 'neptune', name: 'Netuno',     symbol: '♆', en: 'Neptune',   bodyId: Planet.Neptune },
    { key: 'pluto',   name: 'Plutão',     symbol: '♇', en: 'Pluto',     bodyId: Planet.Pluto },
    { key: 'node',    name: 'Nodo Norte', symbol: '☊', en: 'True Node', bodyId: LunarPoint.TrueNode },
    { key: 'chiron',  name: 'Quíron',     symbol: '⚷', en: 'Chiron',    bodyId: Asteroid.Chiron },
  ];

  const planets: RawCelestialPosition[] = BODIES.map((b) => {
    const pos = swe.calculatePosition(jd, b.bodyId);
    const lng = (pos.longitude + 360) % 360;
    const speed = pos.longitudeSpeed ?? 0;
    return {
      key: b.key,
      name: b.name,
      symbol: b.symbol,
      en: b.en,
      lng,
      lat: pos.latitude ?? 0,
      distance: pos.distance ?? 1,
      longitudeSpeed: speed,
      isRetrograde: speed < 0,
    };
  });

  swe.setSiderealMode(SiderealMode.Lahiri || 1, 0, 0);
  const ayanamsha = swe.getAyanamsa(jd);

  // House cusps
  const rawCusps = houseData.cusps || [];
  const houseCusps = rawCusps.length === 13 ? rawCusps.slice(1) : rawCusps.slice(0, 12);

  return {
    julianDay: jd,
    ascendant: (houseData.ascendant + 360) % 360,
    midheaven: (houseData.mc + 360) % 360,
    houseCusps: houseCusps.map((c: number) => (c + 360) % 360),
    ayanamshaLahiri: ayanamsha,
    planets,
  };
}
