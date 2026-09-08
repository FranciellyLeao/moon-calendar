/**
 * Vedic Biorhythm & Panchang Biological Rhythms Engine
 * Calculates:
 * 1. Tara Bala (Nakshatra Biorhythm - 9 Vedic Tara States)
 * 2. Ayurvedic Daily Doshic Rhythm (Vata-Pitta-Kapha Clock)
 * 3. Tithi Prana & Ojas Vitality
 * 4. Tri-Phase Biological Sine Waves (Physical, Emotional, Intellectual)
 */

import { getNakshatraInfo, toSiderealLongitude, getLahiriAyanamsha } from './vedic';

export interface TaraBalaResult {
  taraNumber: number; // 1 to 9
  name: string;
  namePt: string;
  type: 'favorable' | 'neutral' | 'challenging';
  percentage: number;
  description: string;
  recommendation: string;
}

export interface DoshicRhythmResult {
  currentDosha: 'Kapha' | 'Pitta' | 'Vata';
  element: string;
  emoji: string;
  quality: string;
  bestActivity: string;
  foodTip: string;
  hoursRange: string;
}

export interface SineBiorhythmResult {
  physical: number;    // -100 to +100
  emotional: number;   // -100 to +100
  intellectual: number;// -100 to +100
  overallScore: number;// 0 to 100
  dominantTrend: string;
}

export interface FullVedicBiorhythm {
  taraBala: TaraBalaResult;
  doshaRhythm: DoshicRhythmResult;
  biorhythmScores: SineBiorhythmResult;
  pranaLevel: number; // 0-100%
  ojasLevel: number;  // 0-100%
  tithiPhaseName: string;
  birthNakshatra: string;
  todayNakshatra: string;
}

const TARA_BALA_DEFINITIONS: Record<number, Omit<TaraBalaResult, 'taraNumber' | 'percentage'>> = {
  1: {
    name: 'Janma Tara',
    namePt: 'Tara do Nascimento (Janma)',
    type: 'neutral',
    description: 'Dia focado na sua identidade e corpo físico. Requer autocuidado e moderação.',
    recommendation: 'Alimente-se bem, evite sobrecarga física e pratique meditação suave.',
  },
  2: {
    name: 'Sampat Tara',
    namePt: 'Tara da Prosperidade (Sampat)',
    type: 'favorable',
    description: 'Momento de grande abundância, prosperidade financeira e ganhos materiais.',
    recommendation: 'Excelente para acordos comerciais, compras importantes e investimentos.',
  },
  3: {
    name: 'Vipat Tara',
    namePt: 'Tara da Cautela (Vipat)',
    type: 'challenging',
    description: 'Energia de imprevistos e desafios temporários. Requer atenção dobrada.',
    recommendation: 'Evite assinar contratos de risco, discussões impulsivas ou viagens estressantes.',
  },
  4: {
    name: 'Kshema Tara',
    namePt: 'Tara do Bem-Estar (Kshema)',
    type: 'favorable',
    description: 'Proteção cósmica, saúde, conforto e estabilidade emocional em alta.',
    recommendation: 'Ótimo para cuidar do corpo, passar tempo em família e iniciar tratamentos.',
  },
  5: {
    name: 'Pratyak Tara',
    namePt: 'Tara do Foco (Pratyak)',
    type: 'challenging',
    description: 'Fricção e resistências externas. Pede resiliência e paciência estratégica.',
    recommendation: 'Mantenha a calma, não force resultados e evite confrontos desnecessários.',
  },
  6: {
    name: 'Sadhana Tara',
    namePt: 'Tara da Conquista (Sadhana)',
    type: 'favorable',
    description: 'Sucesso em realizações, práticas espirituais, estudos e grandes metas.',
    recommendation: 'Dedique-se a projetos complexos, aprendizado e práticas meditativas.',
  },
  7: {
    name: 'Naidhana Tara',
    namePt: 'Tara da Introspecção (Naidhana)',
    type: 'challenging',
    description: 'Energia de recolhimento, purificação e renovação profunda.',
    recommendation: 'Descanse, evite sobrecargas e desintoxique a mente de pensamentos pesados.',
  },
  8: {
    name: 'Mitra Tara',
    namePt: 'Tara da Amizade (Mitra)',
    type: 'favorable',
    description: 'Harmonia interpessoal, parcerias agradáveis e encontros amorosos.',
    recommendation: 'Ideal para eventos sociais, reconciliação e trabalho em equipe.',
  },
  9: {
    name: 'Parama Mitra Tara',
    namePt: 'Tara do Apoio Maior (Parama Mitra)',
    type: 'favorable',
    description: 'Conexão cósmica máxima, apoio incondicional e bênçãos nas ações.',
    recommendation: 'Aproveite para realizar intenções elevadas e manifestações profundas.',
  },
};

/**
 * Calculate Ayurvedic Doshic Rhythm by current hour of the day
 */
export function getAyurvedicDoshicRhythm(hour: number): DoshicRhythmResult {
  // Kapha: 06:00 - 10:00 & 18:00 - 22:00
  // Pitta: 10:00 - 14:00 & 22:00 - 02:00
  // Vata:  14:00 - 18:00 & 02:00 - 06:00
  if ((hour >= 6 && hour < 10) || (hour >= 18 && hour < 22)) {
    return {
      currentDosha: 'Kapha',
      element: 'Terra & Água',
      emoji: '🌊',
      quality: 'Estabilidade, Calma & Peso Vital',
      bestActivity: 'Exercícios físicos matinais, caminhadas e organização estruturada.',
      foodTip: 'Refeições leves, chás termogênicos (gengibre, canela) e evitar gorduras pesadas.',
      hoursRange: hour >= 18 ? '18:00 - 22:00 (Fase Noturna)' : '06:00 - 10:00 (Fase Matinal)',
    };
  } else if ((hour >= 10 && hour < 14) || (hour >= 22 || hour < 2)) {
    return {
      currentDosha: 'Pitta',
      element: 'Fogo & Água',
      emoji: '🔥',
      quality: 'Fogo Digestivo, Foco Mental & Transformação',
      bestActivity: 'Tomar decisões difíceis, trabalho intelectual intenso e almoço principal.',
      foodTip: 'Refeição principal do dia, alimentos frescos, folhas verdes e boa hidratação.',
      hoursRange: hour >= 22 || hour < 2 ? '22:00 - 02:00 (Digestão Celular/Sono)' : '10:00 - 14:00 (Fogo do Meio-Dia)',
    };
  } else {
    return {
      currentDosha: 'Vata',
      element: 'Ar & Éter',
      emoji: '💨',
      quality: 'Criatividade, Movimento & Clareza Intuitiva',
      bestActivity: 'Criação artística, tempestade de ideias, leitura e meditação da tarde/madrugada.',
      foodTip: 'Sopas mornas, alimentos cozidos e infusões de ervas calmantes (camomila, erva-doce).',
      hoursRange: hour >= 14 && hour < 18 ? '14:00 - 18:00 (Criatividade da Tarde)' : '02:00 - 06:00 (Hora Brahma Muhurta)',
    };
  }
}

/**
 * Calculate Classic Biorhythm Sine Wave Scores from birth date to target date
 */
export function calculateSineBiorhythms(birthDate: Date, targetDate: Date = new Date()): SineBiorhythmResult {
  const diffMs = targetDate.getTime() - birthDate.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  const physical = Math.sin((2 * Math.PI * days) / 23) * 100;
  const emotional = Math.sin((2 * Math.PI * days) / 28) * 100;
  const intellectual = Math.sin((2 * Math.PI * days) / 33) * 100;

  const rawOverall = (physical + emotional + intellectual) / 3;
  const overallScore = Math.round(((rawOverall + 100) / 200) * 100);

  let dominantTrend = 'Equilíbrio Estável';
  if (physical > 50 && emotional > 50) dominantTrend = 'Alta Vitalidade & Entusiasmo';
  else if (intellectual > 60) dominantTrend = 'Clareza Intelectual Máxima';
  else if (physical < -50) dominantTrend = 'Fase de Recuperação Física';
  else if (emotional < -50) dominantTrend = 'Fase de Introspecção Emocional';

  return {
    physical: Math.round(physical),
    emotional: Math.round(emotional),
    intellectual: Math.round(intellectual),
    overallScore,
    dominantTrend,
  };
}

/**
 * Calculate Tara Bala (Vedic Nakshatra Biorhythm)
 */
export function calculateTaraBala(
  birthNakshatraIndex: number, // 0 to 26
  todayNakshatraIndex: number   // 0 to 26
): TaraBalaResult {
  let count = (todayNakshatraIndex - birthNakshatraIndex + 1);
  if (count <= 0) count += 27;

  let rem = count % 9;
  if (rem === 0) rem = 9;

  const def = TARA_BALA_DEFINITIONS[rem] || TARA_BALA_DEFINITIONS[1];

  let percentage = 50;
  if (def.type === 'favorable') percentage = 85 + (rem % 3) * 5;
  else if (def.type === 'challenging') percentage = 25 + (rem % 2) * 10;
  else percentage = 60;

  return {
    taraNumber: rem,
    percentage,
    ...def,
  };
}

/**
 * Full Vedic Biorhythm calculation wrapper
 */
export function calcFullVedicBiorhythm(
  birthDate: Date,
  targetDate: Date = new Date(),
  todayMoonSiderealLng: number = 100
): FullVedicBiorhythm {
  const targetJd = targetDate.getTime() / 86400000 + 2440587.5;
  const T = (targetJd - 2451545.0) / 36525;
  const ayanamsha = getLahiriAyanamsha(T);

  const todayNak = getNakshatraInfo(todayMoonSiderealLng);

  // Estimate birth sidereal longitude from birth date
  const birthSiderealLng = toSiderealLongitude(
    (birthDate.getMonth() * 30 + birthDate.getDate()) % 360,
    ayanamsha
  );
  const birthNak = getNakshatraInfo(birthSiderealLng);

  const todayNakIdx = todayNak.index;
  const birthNakIdx = birthNak.index;

  const taraBala = calculateTaraBala(birthNakIdx, todayNakIdx);
  const doshaRhythm = getAyurvedicDoshicRhythm(targetDate.getHours());
  const biorhythmScores = calculateSineBiorhythms(birthDate, targetDate);

  // Tithi Prana vs Ojas
  const dayOfMonth = targetDate.getDate();
  const isWaxing = dayOfMonth <= 15;
  const pranaLevel = isWaxing ? 75 + (dayOfMonth % 5) * 4 : 45 + (dayOfMonth % 5) * 3;
  const ojasLevel = !isWaxing ? 80 + (dayOfMonth % 4) * 4 : 50 + (dayOfMonth % 4) * 3;

  return {
    taraBala,
    doshaRhythm,
    biorhythmScores,
    pranaLevel,
    ojasLevel,
    tithiPhaseName: isWaxing ? 'Shukla Paksha (Prana Vital Crescente)' : 'Krishna Paksha (Ojas & Purificação)',
    birthNakshatra: birthNak.name,
    todayNakshatra: todayNak.name,
  };
}
