export type LunarPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface AstronomyData {
  phaseName: LunarPhaseName;
  phaseCode: string;
  illumination: number; // 0 - 100%
  lunarAge: number; // 0 - 29.53 days
  fraction: number; // 0 - 1
  moonrise: string;
  moonset: string;
  sunrise: string;
  sunset: string;
  goldenHour: string;
  blueHour: string;
  zodiacSign: string;
  zodiacSymbol: string;
  isVoidOfCourse: boolean;
  nextFullMoon: { date: string; daysLeft: number };
  nextNewMoon: { date: string; daysLeft: number };
  distanceKm: number;
  altitudeDeg: number;
  azimuthDeg: number;
}

export interface NatalChart {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat?: number;
  lng?: number;
  sunSign: string;
  sunSymbol: string;
  moonSign: string;
  moonSymbol: string;
  risingSign: string;
  risingSymbol: string;
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  houses: { house: number; sign: string; symbol: string }[];
  lunarReturnDate: string;
}

export interface ZodiacReading {
  sign: string;
  symbol: string;
  element: string;
  dates: string;
  prediction: string;
  energyScore: number; // 1-10
  luckyColor: string;
  luckyNumber: number;
  compatibility: string;
  dailyAdvice: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  moonPhase: LunarPhaseName;
  moonSign: string;
  tags: string[];
  isFavorite: boolean;
  isEncrypted?: boolean;
}

export interface IntentionGoal {
  id: string;
  title: string;
  description: string;
  targetPhase: LunarPhaseName;
  createdAt: string;
  progress: number; // 0 - 100
  checklist: { id: string; text: string; done: boolean }[];
  isArchived: boolean;
}

export interface Ritual {
  id: string;
  title: string;
  category: 'New Moon' | 'Full Moon' | 'Waning' | 'Waxing' | 'Crystals' | 'Baths' | 'Tea & Herbs';
  description: string;
  ingredients: string[];
  steps: string[];
  durationMin: number;
  rating: number;
  isCompleted?: boolean;
}

export interface Affirmation {
  id: string;
  text: string;
  category: string;
  phase: LunarPhaseName | 'All';
  repeatCount: number;
}

export interface CycleLog {
  id: string;
  startDate: string;
  endDate?: string;
  symptoms: string[];
  flowIntensity: 'Light' | 'Medium' | 'Heavy' | 'Spotting';
  mood: string;
  notes?: string;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface UserSettings {
  language: 'pt-BR' | 'en' | 'es' | 'fr';
  theme: 'cosmic-dark' | 'solar-light' | 'nebula-purple';
  location: LocationInfo;
  notifications: {
    fullMoon: boolean;
    newMoon: boolean;
    dailyHoroscope: boolean;
    cycleReminders: boolean;
  };
  natalChart?: NatalChart;
}
