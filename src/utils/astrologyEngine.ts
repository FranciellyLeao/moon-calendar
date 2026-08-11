import type { AstronomyData, NatalChart } from '../types';

/**
 * Powerful Internal Synthesis Engine for 100% Offline Astrological Readings
 */

const ELEMENT_WISDOM: Record<string, string> = {
  Fire: 'Sua energia vital está aquecida pela chama da ação, da intuição rápida e da liderança.',
  Earth: 'Você se ancora na solidez, na busca por resultados tangíveis, disciplina e estabilidade.',
  Air: 'Sua mente voa alto em busca de novas conexões, aprendizados e ideias transformadoras.',
  Water: 'Seu mundo interno é regido pelas marés emocionais, pela sensibilidade e empatia profunda.',
};

const LUNAR_PHASE_ADVICE: Record<string, string> = {
  'New Moon': 'Momento de semear intenções em silêncio. Plante os primeiros impulsos do seu novo ciclo.',
  'Waxing Crescent': 'Fase de cultivar raízes e dar os primeiros passos práticos. Mantenha a constância.',
  'First Quarter': 'Superação de desafios. Ajuste a velas do seu barco e tome decisões firmes.',
  'Waxing Gibbous': 'Lapidação final e refino dos detalhes. Prepare-se para a colheita iminente.',
  'Full Moon': 'Auge da iluminação e celebração. Suas emoções e intuição alcançam a máxima clareza.',
  'Waning Gibbous': 'Fase de compartilhar o aprendizado e expressar gratidão pelas conquistas.',
  'Last Quarter': 'Encerramento de pendências e liberação do que não serve mais ao seu propósito.',
  'Waning Crescent': 'Descanso sagrado e renovação de energias para gestar o próximo recomeço.',
};

/**
 * Generate rich offline horoscope reading
 */
export function generateOfflineHoroscope(
  sign: string,
  natalChart: NatalChart | undefined,
  astroData: AstronomyData
): string {
  const sun = natalChart?.sunSign || sign;
  const moon = natalChart?.moonSign || sign;
  const asc = natalChart?.risingSign || sign;

  const phaseAdvice = LUNAR_PHASE_ADVICE[astroData.phaseName] || LUNAR_PHASE_ADVICE['New Moon'];

  return `🌌 **SÍNTESE CELESTIAL INTERNA (MOTOR OFF-LINE)**

1. **Energia do Dia & Influência Lunar:**
A Lua transita atualmente por **${astroData.zodiacSign}** em fase de **${astroData.phaseName}** (${astroData.illumination}% iluminada). Para quem possui Sol em **${sun}**, esta configuração convida a desacelerar e alinhar suas ações com o ritmo natural do céu. ${phaseAdvice}

2. **Alinhamento do Seu Tríptico Astral (Sol, Lua & Ascendente):**
Com o Sol iluminando **${sun}**, sua expressão pessoal busca firmeza. Sua Alma (Lua em **${moon}**) pede acolhimento nas relações, enquanto seu Ascendente em **${asc}** garante a coragem necessária para projetar sua verdade ao mundo.

3. **Conselho Prático & Afirmação:**
• **Foco do Dia:** Direcione sua energia para o equilíbrio entre vida profissional e bem-estar físico.
• **Afirmação Sagrada:** *"Eu honro as marés do tempo. Cada fase da minha vida carrega uma bênção única."*`;
}

/**
 * Generate rich offline Natal Chart Reading
 */
export function generateOfflineNatalReading(chart: NatalChart): string {
  const firePct = chart.elements.fire;
  const earthPct = chart.elements.earth;
  const airPct = chart.elements.air;
  const waterPct = chart.elements.water;

  const dominantElement =
    firePct >= earthPct && firePct >= airPct && firePct >= waterPct
      ? 'Fogo 🔥'
      : earthPct >= airPct && earthPct >= waterPct
      ? 'Terra ⛰️'
      : airPct >= waterPct
      ? 'Ar 💨'
      : 'Água 💧';

  return `✨ **ANÁLISE SÍNTESE DO MAPA ASTRAL (MOTOR INTERNO)**

1. ☀️ **Missão Solar (Sol em ${chart.sunSign}):**
Seu núcleo de personalidade carrega a essência de **${chart.sunSign}**. Seu propósito principal nesta jornada é aprender a confiar na sua força criativa, construindo uma vida com significado e autenticidade.

2. ☽ **Mundo Emocional & Necessidades da Alma (Lua em ${chart.moonSign}):**
Sua resposta instintiva perante a vida é filtrada pela Lua em **${chart.moonSign}**. Para sentir paz interior, você necessita de segurança emocional, clareza e momentos de introspecção no seu espaço sagrado.

3. 🌅 **Expressão Social & Primeira Impressão (Ascendente em ${chart.risingSign}):**
O horizonte do seu nascimento revela a energia de **${chart.risingSign}**. É assim que você aborda novos projetos e como as pessoas percebem sua presença no mundo.

4. 🧪 **Equilíbrio dos 4 Elementos:**
Seu mapa apresenta uma dominância de **${dominantElement}** (Fogo ${firePct}%, Terra ${earthPct}%, Ar ${airPct}%, Água ${waterPct}%). ${ELEMENT_WISDOM[dominantElement.split(' ')[0]] || ''}`;
}
