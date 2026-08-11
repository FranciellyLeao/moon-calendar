import type { AstronomyData, LunarPhaseName } from '../types';
import * as SunCalc from 'suncalc';

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', portuguese: 'Áries', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', portuguese: 'Touro', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', portuguese: 'Gêmeos', element: 'Air' },
  { name: 'Cancer', symbol: '♋', portuguese: 'Câncer', element: 'Water' },
  { name: 'Leo', symbol: '♌', portuguese: 'Leão', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', portuguese: 'Virgem', element: 'Earth' },
  { name: 'Libra', symbol: '♎', portuguese: 'Libra', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', portuguese: 'Escorpião', element: 'Water' },
  { name: 'Sagittarius', symbol: '♐', portuguese: 'Sagitário', element: 'Fire' },
  { name: 'Capricorn', symbol: '♑', portuguese: 'Capricórnio', element: 'Earth' },
  { name: 'Aquarius', symbol: '♒', portuguese: 'Aquário', element: 'Air' },
  { name: 'Pisces', symbol: '♓', portuguese: 'Peixes', element: 'Water' },
];

export function getMoonPhaseName(phaseAngle: number): { name: LunarPhaseName; code: string } {
  const p = (phaseAngle + 1) % 1;

  if (p < 0.03 || p >= 0.97) {
    return { name: 'New Moon', code: 'new' };
  } else if (p >= 0.03 && p < 0.22) {
    return { name: 'Waxing Crescent', code: 'waxing_crescent' };
  } else if (p >= 0.22 && p < 0.28) {
    return { name: 'First Quarter', code: 'first_quarter' };
  } else if (p >= 0.28 && p < 0.47) {
    return { name: 'Waxing Gibbous', code: 'waxing_gibbous' };
  } else if (p >= 0.47 && p < 0.53) {
    return { name: 'Full Moon', code: 'full' };
  } else if (p >= 0.53 && p < 0.72) {
    return { name: 'Waning Gibbous', code: 'waning_gibbous' };
  } else if (p >= 0.72 && p < 0.78) {
    return { name: 'Last Quarter', code: 'last_quarter' };
  } else {
    return { name: 'Waning Crescent', code: 'waning_crescent' };
  }
}

/**
 * High-precision Jean Meeus algorithm for Moon Ecliptic Longitude
 */
export function getMoonZodiacSign(date: Date): { name: string; symbol: string; deg: number } {
  const d = (date.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) / (1000 * 60 * 60 * 24);

  // Mean ecliptic longitude of Moon
  const L0 = (218.316 + 13.176396 * d) % 360;
  // Mean anomaly of Moon
  const M = (134.963 + 13.064993 * d) % 360;
  // Mean anomaly of Sun
  const Msun = (357.529 + 0.985600 * d) % 360;
  // Mean elongation of Moon
  const D = (297.850 + 12.190749 * d) % 360;

  // Ecliptic Longitude with major perturbation terms
  let lambda =
    L0 +
    6.289 * Math.sin((M * Math.PI) / 180) -
    1.274 * Math.sin(((2 * D - M) * Math.PI) / 180) +
    0.658 * Math.sin(((2 * D) * Math.PI) / 180) -
    0.186 * Math.sin((Msun * Math.PI) / 180) -
    0.059 * Math.sin(((2 * M) * Math.PI) / 180);

  lambda = (lambda + 3600) % 360;

  const signIndex = Math.floor(lambda / 30);
  const zodiac = ZODIAC_SIGNS[signIndex % 12];
  return {
    name: zodiac.name,
    symbol: zodiac.symbol,
    deg: Math.round(lambda % 30),
  };
}

function formatTimeString(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function findNextPhase(startDate: Date, targetPhaseCode: 'full' | 'new'): { date: string; daysLeft: number } {
  const checkDate = new Date(startDate);
  for (let i = 0; i < 35; i++) {
    checkDate.setDate(checkDate.getDate() + 1);
    const illum = SunCalc.getMoonIllumination(checkDate);
    const phaseInfo = getMoonPhaseName(illum.phase);
    if (phaseInfo.code === targetPhaseCode) {
      const diffMs = checkDate.getTime() - startDate.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        date: checkDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        daysLeft,
      };
    }
  }
  return { date: 'In ~15 days', daysLeft: 15 };
}

export function getAstronomyData(date: Date = new Date(), lat: number = -23.5505, lng: number = -46.6333): AstronomyData {
  const illum = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);
  const sunTimes = SunCalc.getTimes(date, lat, lng);
  const moonPos = SunCalc.getMoonPosition(date, lat, lng);

  const phaseInfo = getMoonPhaseName(illum.phase);
  const zodiac = getMoonZodiacSign(date);

  const nextFull = findNextPhase(date, 'full');
  const nextNew = findNextPhase(date, 'new');

  const distanceKm = Math.round(moonPos.distance || 384400);
  const isVoidOfCourse = zodiac.deg >= 27;

  return {
    phaseName: phaseInfo.name,
    phaseCode: phaseInfo.code,
    illumination: Math.round(illum.fraction * 100),
    lunarAge: Math.round(illum.phase * 29.53 * 10) / 10,
    fraction: illum.fraction,
    moonrise: formatTimeString(moonTimes.rise),
    moonset: formatTimeString(moonTimes.set),
    sunrise: formatTimeString(sunTimes.sunrise),
    sunset: formatTimeString(sunTimes.sunset),
    goldenHour: formatTimeString(sunTimes.goldenHour),
    blueHour: formatTimeString(sunTimes.dusk),
    zodiacSign: zodiac.name,
    zodiacSymbol: zodiac.symbol,
    isVoidOfCourse,
    nextFullMoon: nextFull,
    nextNewMoon: nextNew,
    distanceKm,
    altitudeDeg: Math.round((moonPos.altitude * 180) / Math.PI),
    azimuthDeg: Math.round((moonPos.azimuth * 180) / Math.PI + 180),
  };
}
