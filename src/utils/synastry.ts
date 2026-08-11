import type { NatalChart } from '../types';

export interface SynastryResult {
  person1: NatalChart;
  person2: NatalChart;
  overallScore: number; // 0 - 100%
  romanticScore: number;
  communicationScore: number;
  emotionalScore: number;
  sunCompatibility: string;
  moonCompatibility: string;
  elementalHarmonies: string[];
  challenges: string[];
  relationshipAdvice: string;
}

const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

function getElementCompatibility(elem1: string, elem2: string): number {
  if (elem1 === elem2) return 90;
  if ((elem1 === 'Fire' && elem2 === 'Air') || (elem1 === 'Air' && elem2 === 'Fire')) return 95;
  if ((elem1 === 'Earth' && elem2 === 'Water') || (elem1 === 'Water' && elem2 === 'Earth')) return 95;
  if ((elem1 === 'Fire' && elem2 === 'Water') || (elem1 === 'Water' && elem2 === 'Fire')) return 60;
  if ((elem1 === 'Earth' && elem2 === 'Fire') || (elem1 === 'Fire' && elem2 === 'Earth')) return 65;
  return 75;
}

export function calculateSynastry(person1: NatalChart, person2: NatalChart): SynastryResult {
  const elem1 = ZODIAC_ELEMENTS[person1.sunSign] || 'Fire';
  const elem2 = ZODIAC_ELEMENTS[person2.sunSign] || 'Fire';

  const moonElem1 = ZODIAC_ELEMENTS[person1.moonSign] || 'Water';
  const moonElem2 = ZODIAC_ELEMENTS[person2.moonSign] || 'Water';

  const sunScore = getElementCompatibility(elem1, elem2);
  const moonScore = getElementCompatibility(moonElem1, moonElem2);
  const ascScore = getElementCompatibility(
    ZODIAC_ELEMENTS[person1.risingSign] || 'Air',
    ZODIAC_ELEMENTS[person2.risingSign] || 'Air'
  );

  const isSunMoonMirror =
    person1.sunSign === person2.moonSign || person1.moonSign === person2.sunSign;
  const bonus = isSunMoonMirror ? 10 : 0;

  const romanticScore = Math.min(100, Math.round((sunScore * 0.4 + moonScore * 0.4 + ascScore * 0.2) + bonus));
  const communicationScore = Math.min(100, Math.round((sunScore * 0.6 + ascScore * 0.4)));
  const emotionalScore = Math.min(100, Math.round((moonScore * 0.7 + sunScore * 0.3) + bonus));
  const overallScore = Math.round((romanticScore + communicationScore + emotionalScore) / 3);

  const sunCompatibility = `Sol em ${person1.sunSign} (${elem1}) e Sol em ${person2.sunSign} (${elem2}): ${
    elem1 === elem2
      ? 'Afinidade natural e mesmos valores de vida.'
      : (elem1 === 'Fire' && elem2 === 'Air') || (elem1 === 'Earth' && elem2 === 'Water')
      ? 'Combinação altamente estimulante e complementar.'
      : 'Diferenças de ritmo que geram aprendizado contínuo.'
  }`;

  const moonCompatibility = `Lua em ${person1.moonSign} e Lua em ${person2.moonSign}: ${
    moonElem1 === moonElem2
      ? 'Sintonia emocional profunda. Sentem-se em casa juntas.'
      : 'Formas distintas de processar sentimentos. Diálogo é a chave.'
  }`;

  const elementalHarmonies = [
    `Equilíbrio ${elem1} + ${elem2}`,
    isSunMoonMirror ? 'Espelhamento Sagrado Sol-Lua (Almas Gêmeas)' : 'Troca Energética Única',
  ];

  const challenges = [
    elem1 !== elem2 ? `Diferença entre a impulsividade de ${elem1} e a abordagem de ${elem2}.` : 'Risco de complacência por excesso de semelhança.',
    moonElem1 !== moonElem2 ? 'Necessidades de segurança emocional que exigem paciência.' : 'Intensidade emocional multiplicada nos dias de Lua Cheia.',
  ];

  const relationshipAdvice = `Para cultivar a harmonia entre ${person1.sunSign} e ${person2.sunSign}, celebrem as virtudes únicas de cada um. Nas fases de Lua Nova, planejem projetos em conjunto; na Lua Cheia, reservem tempo para conversas de coração aberto.`;

  return {
    person1,
    person2,
    overallScore,
    romanticScore,
    communicationScore,
    emotionalScore,
    sunCompatibility,
    moonCompatibility,
    elementalHarmonies,
    challenges,
    relationshipAdvice,
  };
}
