/**
 * Activity Timing Engine
 * Calculates the best days and times for specific activities based on:
 * - Moon phase
 * - Moon sign (zodiac)
 * - Planetary day rulers
 * - Planetary hour rulers
 */

export type ActivityCategory =
  | 'creativity'
  | 'beauty'
  | 'career'
  | 'love'
  | 'health'
  | 'finances'
  | 'spiritual'
  | 'communication'
  | 'travel'
  | 'rest';

export interface ActivityScore {
  category: ActivityCategory;
  label: string;
  labelPt: string;
  emoji: string;
  score: number; // 0–100
  rating: 'excellent' | 'good' | 'neutral' | 'challenging';
  tip: string;
  bestTime?: string;
}

export interface DayActivityGuide {
  date: Date;
  moonPhase: string;
  moonSign: string;
  moonSignSymbol: string;
  planetaryDayRuler: string;
  activities: ActivityScore[];
  overallEnergy: number;
  overallLabel: string;
  moonVoidOfCourse: boolean;
}

/** Planetary day rulers (Sunday=0) */
const DAY_RULERS = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
const DAY_RULERS_SYMBOL = ['☉', '☽', '♂', '☿', '♃', '♀', '♄'];

/** Moon sign energy affinities per activity */
const MOON_SIGN_AFFINITIES: Record<string, Partial<Record<ActivityCategory, number>>> = {
  Aries:       { creativity: 85, career: 80, health: 90, love: 50, beauty: 60, finances: 50, spiritual: 40, communication: 70, travel: 85, rest: 30 },
  Taurus:      { beauty: 95, finances: 90, love: 85, rest: 90, creativity: 70, career: 60, health: 70, spiritual: 75, communication: 50, travel: 40 },
  Gemini:      { communication: 95, creativity: 85, travel: 80, love: 65, beauty: 60, career: 70, health: 50, finances: 55, spiritual: 40, rest: 40 },
  Cancer:      { spiritual: 90, rest: 85, love: 90, health: 80, creativity: 75, beauty: 70, finances: 60, career: 50, communication: 65, travel: 40 },
  Leo:         { creativity: 95, love: 90, beauty: 90, career: 85, communication: 80, health: 75, finances: 65, spiritual: 70, travel: 80, rest: 45 },
  Virgo:       { health: 95, career: 85, finances: 80, communication: 75, creativity: 65, beauty: 70, rest: 80, spiritual: 60, love: 55, travel: 55 },
  Libra:       { love: 95, beauty: 95, communication: 85, creativity: 80, career: 75, finances: 70, health: 60, spiritual: 75, travel: 75, rest: 65 },
  Scorpio:     { spiritual: 95, finances: 85, love: 80, creativity: 85, health: 70, career: 75, beauty: 65, communication: 60, travel: 50, rest: 70 },
  Sagittarius: { travel: 95, spiritual: 90, creativity: 85, career: 80, communication: 85, love: 70, beauty: 65, health: 75, finances: 60, rest: 50 },
  Capricorn:   { career: 95, finances: 95, health: 80, creativity: 65, beauty: 60, spiritual: 70, love: 55, communication: 70, travel: 60, rest: 75 },
  Aquarius:    { creativity: 90, communication: 90, spiritual: 85, career: 75, love: 65, travel: 80, health: 65, finances: 60, beauty: 70, rest: 55 },
  Pisces:      { spiritual: 95, creativity: 95, love: 85, rest: 90, beauty: 80, health: 75, career: 50, finances: 45, communication: 65, travel: 55 },
};

/** Moon phase bonus/penalty per activity */
const PHASE_MODIFIERS: Record<string, Partial<Record<ActivityCategory, number>>> = {
  'New Moon':        { spiritual: +20, career: +15, creativity: +15, love: +10, finances: +10, beauty: +5, rest: +5 },
  'Waxing Crescent': { career: +20, creativity: +20, love: +15, finances: +15, health: +10, communication: +10 },
  'First Quarter':   { career: +25, creativity: +15, health: +20, communication: +15, travel: +10, finances: +10 },
  'Waxing Gibbous':  { career: +20, finances: +20, love: +15, creativity: +20, beauty: +15, communication: +10 },
  'Full Moon':       { love: +30, beauty: +25, creativity: +30, spiritual: +25, career: +10, health: -5, rest: -10 },
  'Waning Gibbous':  { spiritual: +20, rest: +20, health: +15, beauty: +10, creativity: +15, love: +10 },
  'Last Quarter':    { rest: +25, spiritual: +20, health: +20, finances: +10, career: -10, love: -5 },
  'Waning Crescent': { rest: +30, spiritual: +30, health: +25, creativity: +10, love: -5, career: -15 },
};

/** Day ruler bonuses */
const DAY_RULER_BONUSES: Record<string, Partial<Record<ActivityCategory, number>>> = {
  'Sol':      { career: +20, creativity: +15, health: +15, travel: +10 },
  'Lua':      { love: +20, spiritual: +20, beauty: +10, rest: +15 },
  'Marte':    { career: +15, health: +20, travel: +15, creativity: +10 },
  'Mercúrio': { communication: +25, creativity: +15, finances: +10, travel: +10 },
  'Júpiter':  { finances: +25, travel: +20, spiritual: +20, career: +15 },
  'Vênus':    { love: +25, beauty: +30, creativity: +20, spiritual: +10 },
  'Saturno':  { career: +20, finances: +20, rest: +15, spiritual: +15, health: +10 },
};

const ACTIVITY_META: Record<ActivityCategory, { label: string; labelPt: string; emoji: string }> = {
  creativity:    { label: 'Creativity', labelPt: 'Criatividade', emoji: '🎨' },
  beauty:        { label: 'Beauty', labelPt: 'Beleza', emoji: '✨' },
  career:        { label: 'Career', labelPt: 'Carreira', emoji: '💼' },
  love:          { label: 'Love', labelPt: 'Amor', emoji: '❤️' },
  health:        { label: 'Health', labelPt: 'Saúde', emoji: '🌿' },
  finances:      { label: 'Finances', labelPt: 'Finanças', emoji: '💰' },
  spiritual:     { label: 'Spiritual', labelPt: 'Espiritualidade', emoji: '🔮' },
  communication: { label: 'Communication', labelPt: 'Comunicação', emoji: '💬' },
  travel:        { label: 'Travel', labelPt: 'Viagem', emoji: '✈️' },
  rest:          { label: 'Rest & Renewal', labelPt: 'Descanso', emoji: '🌙' },
};

const TIPS: Record<ActivityCategory, Record<string, string>> = {
  creativity: {
    excellent: 'Momento ideal para criar, inspirar e inovar. Abra espaço para a expressão artística.',
    good: 'Boa energia criativa. Explore novos projetos com entusiasmo.',
    neutral: 'Criatividade presente, mas requer foco. Escolha um projeto e mergulhe.',
    challenging: 'Dia mais desafiador para criação. Prefira revisar e refinar trabalhos existentes.',
  },
  beauty: {
    excellent: 'Excelente para cuidados com a pele, cabelo e auto-cuidado. A lua favorece a beleza.',
    good: 'Bom momento para tratamentos de beleza e rotina skincare.',
    neutral: 'Resultados medianos em tratamentos. Mantenha a rotina básica.',
    challenging: 'Evite procedimentos invasivos ou cortes de cabelo hoje.',
  },
  career: {
    excellent: 'Energia profissional no pico! Assine contratos, faça propostas e lidere projetos.',
    good: 'Boa produtividade e foco. Avance nas suas metas profissionais.',
    neutral: 'Ritmo de trabalho normal. Concentre-se em tarefas de rotina.',
    challenging: 'Evite decisões importantes na carreira. Revise e planeje.',
  },
  love: {
    excellent: 'Momento mágico para o amor! Expresse seus sentimentos e crie memórias afetivas.',
    good: 'Energia favorável para conexões amorosas e romantismo.',
    neutral: 'Relacionamentos estáveis. Cultive a comunicação com seu par.',
    challenging: 'Dia sensível nas relações. Evite conflitos e pratique a escuta.',
  },
  health: {
    excellent: 'Ótimo para iniciar rotinas de saúde, exercícios e cuidados com o corpo.',
    good: 'Energia física positiva. Aproveite para se movimentar e se hidratar.',
    neutral: 'Saúde estável. Mantenha suas rotinas.',
    challenging: 'Poupe energia. Priorize descanso e recuperação.',
  },
  finances: {
    excellent: 'Excelente para investimentos, planejamento financeiro e negociações.',
    good: 'Boa energia para finanças. Avance no seu planejamento.',
    neutral: 'Finanças estáveis. Evite gastos impulsivos.',
    challenging: 'Dia desfavorável para grandes decisões financeiras.',
  },
  spiritual: {
    excellent: 'Energia espiritual elevada. Medite, ore e conecte-se com sua essência.',
    good: 'Bom momento para práticas espirituais e introspecção.',
    neutral: 'Conexão espiritual presente. Dedique ao menos alguns minutos de meditação.',
    challenging: 'Dias de integração. Foque no seu mundo interior.',
  },
  communication: {
    excellent: 'Comunicação fluída e poderosa. Faça apresentações, reuniões e conversas importantes.',
    good: 'Boa energia para diálogos. Expresse-se com clareza.',
    neutral: 'Comunicação normal. Revise mensagens importantes antes de enviar.',
    challenging: 'Mal-entendidos possíveis. Pense antes de falar.',
  },
  travel: {
    excellent: 'Excelente momento para viagens! Energia favorece deslocamentos e novas descobertas.',
    good: 'Bom para viagens curtas e explorar lugares próximos.',
    neutral: 'Viagens tranquilas. Planeje bem o roteiro.',
    challenging: 'Evite viagens longas hoje se possível.',
  },
  rest: {
    excellent: 'Momento perfeito para recarregar. Descanse, relaxe e nutra sua alma.',
    good: 'Boa energia para relaxamento e lazer.',
    neutral: 'Descanso moderado. Equilibre atividade e repouso.',
    challenging: 'A lua pede movimento e ação hoje. Ative-se.',
  },
};

function clamp(n: number): number {
  return Math.max(5, Math.min(100, n));
}

function scoreToRating(score: number): ActivityScore['rating'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'neutral';
  return 'challenging';
}

function getBestTime(category: ActivityCategory): string {
  const timeMap: Record<ActivityCategory, string[]> = {
    creativity:    ['10h–12h', '15h–17h', '20h–22h'],
    beauty:        ['9h–11h', '14h–16h'],
    career:        ['8h–11h', '14h–16h'],
    love:          ['18h–21h', '20h–23h'],
    health:        ['6h–8h', '17h–19h'],
    finances:      ['9h–11h', '14h–15h'],
    spiritual:     ['5h–7h', '21h–23h'],
    communication: ['10h–12h', '15h–17h'],
    travel:        ['7h–9h', '13h–15h'],
    rest:          ['13h–15h', '21h–23h'],
  };

  const dayIdx = new Date().getDay();
  const times = timeMap[category];
  return times[dayIdx % times.length];
}

/**
 * Calculate activity scores for a given date
 */
export function getDayActivityGuide(
  date: Date,
  moonPhaseName: string,
  moonSign: string,
  moonSignSymbol: string,
  isVoidOfCourse: boolean = false
): DayActivityGuide {
  const dayIdx = date.getDay(); // 0=Sun
  const dayRuler = DAY_RULERS[dayIdx];
  const dayRulerSymbol = DAY_RULERS_SYMBOL[dayIdx];

  const categories: ActivityCategory[] = [
    'creativity', 'beauty', 'career', 'love',
    'health', 'finances', 'spiritual', 'communication', 'travel', 'rest'
  ];

  const activities: ActivityScore[] = categories.map((cat) => {
    // Base score from moon sign affinity
    const baseScore = MOON_SIGN_AFFINITIES[moonSign]?.[cat] ?? 55;

    // Phase modifier
    const phaseBonus = PHASE_MODIFIERS[moonPhaseName]?.[cat] ?? 0;

    // Day ruler bonus
    const dayBonus = DAY_RULER_BONUSES[dayRuler]?.[cat] ?? 0;

    // Void of course penalty
    const vocPenalty = isVoidOfCourse ? -20 : 0;

    const total = clamp(baseScore + phaseBonus + dayBonus + vocPenalty);
    const rating = scoreToRating(total);

    return {
      category: cat,
      label: ACTIVITY_META[cat].label,
      labelPt: ACTIVITY_META[cat].labelPt,
      emoji: ACTIVITY_META[cat].emoji,
      score: total,
      rating,
      tip: TIPS[cat][rating],
      bestTime: rating !== 'challenging' ? getBestTime(cat) : undefined,
    };
  });

  // Sort by score descending
  activities.sort((a, b) => b.score - a.score);

  const overallEnergy = Math.round(activities.reduce((s, a) => s + a.score, 0) / activities.length);

  let overallLabel = 'Energia Moderada';
  if (overallEnergy >= 80) overallLabel = 'Energia Excepcional ✨';
  else if (overallEnergy >= 65) overallLabel = 'Energia Elevada 🌟';
  else if (overallEnergy >= 50) overallLabel = 'Energia Moderada 🌀';
  else overallLabel = 'Energia Introspectiva 🌙';

  return {
    date,
    moonPhase: moonPhaseName,
    moonSign,
    moonSignSymbol,
    planetaryDayRuler: `${dayRulerSymbol} ${dayRuler}`,
    activities,
    overallEnergy,
    overallLabel,
    moonVoidOfCourse: isVoidOfCourse,
  };
}

/**
 * Get the best days in a month for a specific activity
 */
export function getBestDaysForActivity(
  year: number,
  month: number,
  category: ActivityCategory,
  getMoonData: (date: Date) => { phaseName: string; sign: string; signSymbol: string; isVoidOfCourse: boolean }
): { day: number; score: number; rating: ActivityScore['rating'] }[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const results: { day: number; score: number; rating: ActivityScore['rating'] }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const moonData = getMoonData(date);
    const guide = getDayActivityGuide(date, moonData.phaseName, moonData.sign, moonData.signSymbol, moonData.isVoidOfCourse);
    const activityScore = guide.activities.find(a => a.category === category);
    if (activityScore) {
      results.push({ day: d, score: activityScore.score, rating: activityScore.rating });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
