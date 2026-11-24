import React, { useState } from 'react';
import type { AstronomyData, UserSettings, JournalEntry } from '../types';
import { getStoredJournal, saveStoredJournal } from '../utils/storage';
import {
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LunarOracleProps {
  settings: UserSettings;
  astroData: AstronomyData;
  onNavigateToJournal?: () => void;
}

interface OracleCard {
  id: string;
  numeral: string;
  name: string;
  title: string;
  element: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  symbol: string;
  keywords: string[];
  essence: string;
  guidance: string;
  shadow: string;
  lunarSynergy: string;
}

const ORACLE_DECK: OracleCard[] = [
  {
    id: 'c-0',
    numeral: '0',
    name: 'O Louco Cósmico',
    title: 'O Salto Sagrado no Desconhecido',
    element: 'Ar',
    symbol: '🪶',
    keywords: ['Início Espontâneo', 'Inocência', 'Coragem Pura', 'Potencial Infinito'],
    essence: 'Abertura total ao fluxo da vida. Deixe para trás o excesso de planejamento e confie nos sinais do universo.',
    guidance: 'Dê o primeiro passo mesmo sem ver a escada inteira. Sua intuição é seu mapa mais seguro hoje.',
    shadow: 'Cuidado com a imprudência cega e a negligência dos detalhes essenciais.',
    lunarSynergy: 'A fase lunar atual convida a iniciar algo inédito sem medo do julgamento alheio.',
  },
  {
    id: 'c-1',
    numeral: 'I',
    name: 'O Mago da Manifestação',
    title: 'O Alquimista dos Quatro Elementos',
    element: 'Éter',
    symbol: '🪄',
    keywords: ['Manifestação', 'Foco Consciente', 'Habilidade', 'Poder Pessoal'],
    essence: 'Você possui todos os recursos e saberes necessários para converter intenções em realidade concreta.',
    guidance: 'Canalize sua força de vontade com intenção clara. O que você focar com determinação agora se expandirá.',
    shadow: 'Manipulação sutil ou dispersão de energia em múltiplos projetos sem conclusão.',
    lunarSynergy: 'A Lua no céu amplifica o magnetismo da sua mente; use palavras de poder e clareza.',
  },
  {
    id: 'c-2',
    numeral: 'II',
    name: 'A Alta Sacerdotisa',
    title: 'A Guardiã dos Mistérios Ocultos',
    element: 'Água',
    symbol: '🌙',
    keywords: ['Intuição Profunda', 'Silêncio Sagrado', 'Sabedoria Oculta', 'Voz Interior'],
    essence: 'O conhecimento que você procura não está no ruído externo, mas no silêncio da sua alma.',
    guidance: 'Preste atenção aos seus sonhos e pressentimentos. Honre seu ritmo e não se precipite em responder ao mundo.',
    shadow: 'Isolamento excessivo, passividade paralisante ou recusa em encarar a realidade.',
    lunarSynergy: 'Profunda sintonia com o elemento lunar: acenda uma vela, respire e escute a sabedoria das águas.',
  },
  {
    id: 'c-3',
    numeral: 'III',
    name: 'A Imperatriz da Fertilidade',
    title: 'A Abundância da Grande Mãe Terra',
    element: 'Terra',
    symbol: '🌸',
    keywords: ['Fertilidade Criativa', 'Nutrição Vital', 'Amor Próprio', 'Sensorialidade'],
    essence: 'Ciclo fértil para gestar projetos, cuidar do corpo físico e celebrar a beleza que o cerca.',
    guidance: 'Nutra o que você ama com paciência e ternura. Permita-se desfrutar do prazer e da abundância do agora.',
    shadow: 'Autoindulgência, apego sufocante ou carência afetiva.',
    lunarSynergy: 'Excelente momento para banhos aromáticos, conexão com a terra e culinária consciente.',
  },
  {
    id: 'c-4',
    numeral: 'IV',
    name: 'O Imperador da Estrutura',
    title: 'A Soberania da Ordem & Limites',
    element: 'Fogo',
    symbol: '🏛️',
    keywords: ['Firmeza Serena', 'Limites Saudáveis', 'Liderança', 'Estabilidade'],
    essence: 'Momento de estabelecer bases sólidas, organizar prioridades e honrar sua autoridade interna.',
    guidance: 'Diga não ao que desvia sua energia. Crie sistemas simples e consistentes que sustentem seu crescimento.',
    shadow: 'Rigidez inflexível, autoritarismo ou medo de perder o controle.',
    lunarSynergy: 'A energia cósmica pede aterramento prático e compromisso com suas metas de longo prazo.',
  },
  {
    id: 'c-5',
    numeral: 'V',
    name: 'O Hierofante Estelar',
    title: 'A Sabedoria dos Rituais Ancestrais',
    element: 'Terra',
    symbol: '📜',
    keywords: ['Tradição Viva', 'Mentoria', 'Alinhamento Ético', 'Rituais Sagrados'],
    essence: 'Busque a sabedoria que transcende o tempo. Práticas consagradas e mentores de confiança trazem clareza.',
    guidance: 'Resgate um ritual que no passado lhe trazia paz. Una-se a pessoas que compartilham dos seus valores mais nobres.',
    shadow: 'Dogmatismo estreito e subserviência cega a convenções vazias.',
    lunarSynergy: 'Estude astrologia, filosofia ou saberes antigos sob a luz da Lua de hoje.',
  },
  {
    id: 'c-6',
    numeral: 'VI',
    name: 'Os Amantes Celestiais',
    title: 'A União de Almas & Escolhas Alinhadas',
    element: 'Ar',
    symbol: '💞',
    keywords: ['Amor Verdadeiro', 'Escolha do Coração', 'Harmonia', 'Integração'],
    essence: 'Alinhamento profundo entre mente, emoção e espírito. Escolhas que definem sua integridade íntima.',
    guidance: 'Escolha com o coração, não pelo medo da solidão ou aprovação social. Celebre a beleza das conexões sinceras.',
    shadow: 'Indecisão paralisante, dependência emocional ou divisão interna de lealdades.',
    lunarSynergy: 'A vibração lunar favorece conversas de coração aberto e reconciliações afetivas.',
  },
  {
    id: 'c-7',
    numeral: 'VII',
    name: 'A Carruagem Triunfante',
    title: 'A Conquista da Determinação Focada',
    element: 'Água',
    symbol: '🛡️',
    keywords: ['Vitória Serena', 'Autodomínio', 'Direção Firme', 'Superação'],
    essence: 'As rédeas do seu destino estão em suas mãos. Conduza suas forças contraditórias em direção a um único objetivo.',
    guidance: 'Mantenha o foco absoluto. Não permita que distrações temporárias tirem você da sua rota dourada.',
    shadow: 'Agressividade desmedida ou passar por cima das próprias necessidades emocionais.',
    lunarSynergy: 'Avance com determinação: a maré cósmica está impulsionando sua trajetória.',
  },
  {
    id: 'c-8',
    numeral: 'VIII',
    name: 'A Força Compassiva',
    title: 'O Triunfo da Suavidade Sobre o Bruto',
    element: 'Fogo',
    symbol: '🦁',
    keywords: ['Coragem Serena', 'Paciência', 'Amor Incondicional', 'Resiliência'],
    essence: 'A verdadeira força não ruge; ela acolhe, acalma e transforma com doçura inabalável.',
    guidance: 'Domine sua ansiedade e reatividade através da compaixão por si mesmo. Responda ao mundo com graça e firmeza.',
    shadow: 'Dúvida das próprias capacidades ou explosões emocionais desmedidas.',
    lunarSynergy: 'A Lua convida a acalmar os impulsos do ego e governar com o coração.',
  },
  {
    id: 'c-9',
    numeral: 'IX',
    name: 'O Eremita Cósmico',
    title: 'A Lanterna da Busca Interior',
    element: 'Terra',
    symbol: '🏮',
    keywords: ['Introspecção Fértil', 'Luz Interior', 'Discernimento', 'Pausa Sagrada'],
    essence: 'Afaste-se do barulho social para encontrar sua própria luz guia. Momentos de solidão fértil curam a alma.',
    guidance: 'Reserve um tempo a sós hoje. Desligue as notificações e permita que suas ideias decantem em paz.',
    shadow: 'Isolamento defensivo, amargura ou fuga do convívio humano.',
    lunarSynergy: 'Fase perfeita para contemplação noturna, escrita em diário e leitura profunda.',
  },
  {
    id: 'c-10',
    numeral: 'X',
    name: 'A Roda dos Ciclos',
    title: 'A Dança Imutável das Fases e Destinos',
    element: 'Fogo',
    symbol: '☸️',
    keywords: ['Ciclos de Mudança', 'Sincronia Cósmica', 'Virada do Destino', 'Evolução'],
    essence: 'Tudo passa e tudo se renova. Uma fase encerra para que uma nova maré de oportunidades chegue.',
    guidance: 'Abrace a mudança sem resistência. Adapte-se com serenidade às marés da vida e confie no timing divino.',
    shadow: 'Fatalismo passivo ou tentativa desesperada de congelar momentos passageiros.',
    lunarSynergy: 'A alternância das fases lunares reflete a verdade desta carta: acolha o fluxo.',
  },
  {
    id: 'c-11',
    numeral: 'XI',
    name: 'A Justiça Cósmica',
    title: 'A Balança da Verdade & Causa e Efeito',
    element: 'Ar',
    symbol: '⚖️',
    keywords: ['Equilíbrio da Alma', 'Verdade', 'Discernimento Claro', 'Karma'],
    essence: 'Ação consciente e responsabilidade moral. A verdade liberta e restabelece a ordem justa do universo.',
    guidance: 'Seja honesto consigo mesmo e com os outros. Pondere todas as perspectivas antes de tomar qualquer posicionamento.',
    shadow: 'Autocrítica impiedosa, julgamento precipitado ou desonestidade com a própria intuição.',
    lunarSynergy: 'A clareza mental está aguçada para avaliar situações com imparcialidade.',
  },
  {
    id: 'c-12',
    numeral: 'XII',
    name: 'O Pendurado Iluminado',
    title: 'A Entrega Consciente & Nova Perspectiva',
    element: 'Água',
    symbol: '🌀',
    keywords: ['Pausa Voluntária', 'Mudança de Visão', 'Rendição Sábia', 'Iluminação'],
    essence: 'Quando a ação direta não surte efeito, a entrega confiante abre portais invisíveis.',
    guidance: 'Solte a necessidade de forçar resultados imediatos. Olhe para a situação de cabeça para baixo e veja o novo ângulo.',
    shadow: 'Vitimização, estagnação resignada ou mártir desnecessário.',
    lunarSynergy: 'Permita que o universo trabalhe nos bastidores enquanto você descansa e confia.',
  },
  {
    id: 'c-13',
    numeral: 'XIII',
    name: 'A Transformação Sagrada',
    title: 'A Morte das Ilusões & Renascimento Lunar',
    element: 'Água',
    symbol: '🐍',
    keywords: ['Metamorfose Profunda', 'Desapego', 'Renovação', 'Fim de Ciclos'],
    essence: 'A lagarta precisa se desmanchar para que a borboleta emerja. O fim é apenas a semente do recomeço.',
    guidance: 'Liberte o que já morreu energeticamente na sua rotina ou relacionamentos. Abra espaço para o novo nascer.',
    shadow: 'Resistência dolorosa ao inevitável e apego a velhos ressentimentos.',
    lunarSynergy: 'Momento de purificação: elimine toxinas emocionais e abrace sua regeneração.',
  },
  {
    id: 'c-14',
    numeral: 'XIV',
    name: 'A Alquimia da Temperança',
    title: 'A Mistura Perfeita das Águas da Vida',
    element: 'Fogo',
    symbol: '🏺',
    keywords: ['Equilíbrio Fluido', 'Cura Emocional', 'Moderação', 'Alquimia Espiritual'],
    essence: 'Harmonização de opostos. A cura acontece no meio-termo, na integração gentil das polaridades.',
    guidance: 'Pratique a paciência ativa. Combine prudência com ousadia, razão com afeto, repouso com produtividade.',
    shadow: 'Extremos nocivos, impaciência ou acomodação sem brilho.',
    lunarSynergy: 'A Lua inspira a fusão de suas forças interiores em perfeita serenidade.',
  },
  {
    id: 'c-15',
    numeral: 'XV',
    name: 'O Resgate das Sombras',
    title: 'A Dissolução dos Apegos Inconscientes',
    element: 'Terra',
    symbol: '🔥',
    keywords: ['Consciência das Sombras', 'Libertação', 'Poder Próprio', 'Desilusão'],
    essence: 'Reconheça as correntes invisíveis do medo ou dos apegos e recupere a soberania da sua própria vontade.',
    guidance: 'Encare com honestidade o que aprisiona seus pensamentos. Sua força para se libertar é maior que qualquer ilusão.',
    shadow: 'Obsessão, compulsão ou terceirizar sua responsabilidade por suas escolhas.',
    lunarSynergy: 'Traga a luz da consciência às áreas onde você tem se sentido preso ou limitado.',
  },
  {
    id: 'c-16',
    numeral: 'XVI',
    name: 'A Torre da Iluminação',
    title: 'A Queda das Falsas Estruturas',
    element: 'Fogo',
    symbol: '⚡',
    keywords: ['Despertar Súbito', 'Ruptura Libertadora', 'Verdade Nua', 'Reconstrução'],
    essence: 'O que não tem fundação autêntica desmorona para dar lugar àquilo que é indestrutível em você.',
    guidance: 'Se algo quebrou ou mudou de repente, agradeça pelo desfecho. Você está mais livre hoje do que ontem.',
    shadow: 'Pânico diante da impermanência ou apego a ilusões confortáveis.',
    lunarSynergy: 'A eletricidade cósmica limpa o ar pesado e descortina o horizonte límpido.',
  },
  {
    id: 'c-17',
    numeral: 'XVII',
    name: 'A Estrela da Esperança',
    title: 'A Luz Serena da Inspiração Cósmica',
    element: 'Ar',
    symbol: '⭐',
    keywords: ['Esperança Luminosa', 'Inspiração Pura', 'Cura Cósmica', 'Fé Renovada'],
    essence: 'Bênçãos sutis e alinhamento com seu propósito sagrado. O céu derrama serenidade sobre sua caminhada.',
    guidance: 'Mantenha a fé no futuro. Seja um farol de calma e generosidade para todos que cruzarem seu caminho.',
    shadow: 'Desconexão da realidade prática ou desânimo passageiro.',
    lunarSynergy: 'Sob a abóbada celeste, suas preces e aspirações encontram ressonância pura.',
  },
  {
    id: 'c-18',
    numeral: 'XVIII',
    name: 'A Lua dos Mistérios',
    title: 'As Águas Profundas do Subconsciente',
    element: 'Água',
    symbol: '🔮',
    keywords: ['Subconsciente', 'Sonhos Reveladores', 'Sensibilidade Psíquica', 'Mistério'],
    essence: 'Navegue com cautela e reverência pelas águas profundas do seu mar interior. O invisível está ativo.',
    guidance: 'Não tome decisões definitivas sob névoa de dúvidas. Anote seus sonhos e deixe a poeira assentar antes de agir.',
    shadow: 'Paranoia, enganos perceptivos ou se perder em fantasias medrosas.',
    lunarSynergy: 'Ressonância direta com o astro rei da noite: honre sua sensibilidade psíquica.',
  },
  {
    id: 'c-19',
    numeral: 'XIX',
    name: 'O Sol Radiante',
    title: 'A Suprema Vitalidade & Alegria de Ser',
    element: 'Fogo',
    symbol: '☀️',
    keywords: ['Vitalidade Plena', 'Clareza Solar', 'Alegria Genuína', 'Sucesso'],
    essence: 'Luz direta e calor renovador. O triunfo da consciência sobre qualquer dúvida ou obscuridade.',
    guidance: 'Compartilhe seu brilho sem timidez! Comemore suas pequenas vitórias e contagie seu entorno com otimismo.',
    shadow: 'Arrogância, egocentrismo ou esgotamento por excesso de exposição.',
    lunarSynergy: 'Harmonia entre o Sol e a Lua: equilíbrio entre agir no mundo e cuidar do templo interior.',
  },
  {
    id: 'c-20',
    numeral: 'XX',
    name: 'O Julgamento da Alma',
    title: 'O Despertar Cósmico para a Nova Vida',
    element: 'Fogo',
    symbol: '📯',
    keywords: ['Chamado Superior', 'Renovação Kármica', 'Perdão Libertador', 'Transcendência'],
    essence: 'Um chamado irrecusável para viver de acordo com sua missão mais autêntica. Deixe o passado no passado.',
    guidance: 'Perdoe seus erros antigos e perdoe quem o machucou. Seu espírito está pronto para subir um degrau na evolução.',
    shadow: 'Remorso paralisante ou recusa em atender o chamado da sua própria alma.',
    lunarSynergy: 'A Lua coroa a conclusão de um grande aprendizado kármico em sua vida.',
  },
  {
    id: 'c-21',
    numeral: 'XXI',
    name: 'O Cosmos em Totalidade',
    title: 'A Dança Completa do Universo em Harmonia',
    element: 'Éter',
    symbol: '🌌',
    keywords: ['Totalidade Concluída', 'Integração Suprema', 'Celebração', 'Unidade'],
    essence: 'A dança da vida em completa plenitude. Você chegou ao ponto de colheita e integração de quem você é.',
    guidance: 'Celebre tudo o que você construiu e aprendeu. Sinta-se em casa no universo e dê boas-vindas ao novo ciclo.',
    shadow: 'Sensação de incompletude ilusória ou medo de recomeçar do zero.',
    lunarSynergy: 'A grande maré cósmica te abraça com paz absoluta e coroamento.',
  },
];

type SpreadMode = 'single' | 'triple';

export const LunarOracle: React.FC<LunarOracleProps> = ({
  astroData,
  onNavigateToJournal,
}) => {
  const [spreadMode, setSpreadMode] = useState<SpreadMode>('single');
  const [drawnCards, setDrawnCards] = useState<OracleCard[]>(() => {
    // Deterministic or random initial card
    const idx = (new Date().getDate() + new Date().getMonth() * 3) % ORACLE_DECK.length;
    return [ORACLE_DECK[idx]];
  });
  const [flippedIndices, setFlippedIndices] = useState<Record<number, boolean>>({ 0: true });
  const [isSaved, setIsSaved] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Draw new cards
  const handleDraw = (mode: SpreadMode = spreadMode) => {
    setIsShuffling(true);
    setFlippedIndices({});

    setTimeout(() => {
      // Pick random unique cards
      const shuffled = [...ORACLE_DECK].sort(() => Math.random() - 0.5);
      const count = mode === 'single' ? 1 : 3;
      const selected = shuffled.slice(0, count);

      setDrawnCards(selected);
      setIsShuffling(false);

      // Auto flip first card after a tiny breath
      setTimeout(() => {
        setFlippedIndices({ 0: true });
      }, 250);
    }, 400);
  };

  const toggleFlip = (index: number) => {
    setFlippedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSaveToJournal = () => {
    const currentJournal = getStoredJournal();
    const modeLabel = spreadMode === 'single' ? 'Carta do Dia' : 'Tríade Lunar (Passado/Presente/Futuro)';

    const cardsSummary = drawnCards
      .map((c, i) => {
        const slot = spreadMode === 'triple'
          ? (i === 0 ? 'Passado / Raiz' : i === 1 ? 'Presente / Foco' : 'Futuro / Conselho')
          : 'Conselho';
        return `[${slot}] ${c.numeral}. ${c.name} (${c.element}):\n"${c.essence}"\nOrientação: ${c.guidance}\nSinergia Lunar: ${c.lunarSynergy}\n`;
      })
      .join('\n');

    const title = spreadMode === 'triple'
      ? `Oráculo Lunar (Tríade): ${drawnCards.map((c) => c.name).join(' • ')}`
      : `Oráculo Lunar: ${drawnCards[0].name}`;

    const tags = ['Oráculo Lunar', 'Tarô', ...drawnCards.map((c) => c.name)];

    const newEntry: JournalEntry = {
      id: 'oracle-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title,
      content: `Tiragem do Oráculo Lunar — ${modeLabel}\n\n${cardsSummary}\nLua em ${astroData.zodiacSign} (${astroData.phaseName}).`,
      moonPhase: astroData.phaseName,
      moonSign: astroData.zodiacSign,
      tags,
      isFavorite: true,
    };

    saveStoredJournal([newEntry, ...currentJournal]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const TRIPLE_LABELS = ['Passado • Raiz & Aprendizado', 'Presente • Foco & Desafio', 'Futuro • Conselho & Potencial'];

  return (
    <div className="relative space-y-6 pt-2 pb-6">
      {/* Subtle background ambient light */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-amber-400/[0.04] blur-3xl pointer-events-none" />

      {/* Header with Spread Selector & Reshuffle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Oráculo & Tarô Lunar Diário</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white mt-1 tracking-tight">
            Conselho Cósmico das Cartas
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sintonizado com a Lua em <strong className="text-amber-200 font-medium">{astroData.zodiacSign}</strong> e sua frequência atual.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.04] text-xs font-medium gap-1">
            <button
              onClick={() => {
                setSpreadMode('single');
                handleDraw('single');
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                spreadMode === 'single'
                  ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Carta Única
            </button>
            <button
              onClick={() => {
                setSpreadMode('triple');
                handleDraw('triple');
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                spreadMode === 'triple'
                  ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tríade (3 Cartas)
            </button>
          </div>

          {/* Shuffle button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleDraw()}
            disabled={isShuffling}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 font-medium text-xs transition-all shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Tirar Novamente</span>
          </motion.button>
        </div>
      </div>

      {/* Cards Area */}
      <div
        className={`grid gap-6 ${
          spreadMode === 'single'
            ? 'grid-cols-1 max-w-md mx-auto'
            : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        <AnimatePresence mode="wait">
          {drawnCards.map((card, idx) => {
            const isFlipped = !!flippedIndices[idx];
            const slotTitle = spreadMode === 'triple' ? TRIPLE_LABELS[idx] : 'Conselho do Dia';

            return (
              <div key={`${card.id}-${idx}`} className="space-y-2">
                {spreadMode === 'triple' && (
                  <div className="text-[11px] font-bold text-amber-300/90 text-center uppercase tracking-wider">
                    {slotTitle}
                  </div>
                )}

                {/* 3D Flip Card Container */}
                <div
                  className="w-full h-[400px] perspective-1000 cursor-pointer select-none"
                  onClick={() => toggleFlip(idx)}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative preserve-3d"
                  >
                    {/* BACK FACE (Card Deck Back Pattern) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-5 bg-gradient-to-b from-[#111119] via-[#0b0b10] to-[#07070a] border border-amber-400/25 shadow-2xl flex flex-col items-center justify-between text-center overflow-hidden">
                      <div className="w-full flex items-center justify-between text-amber-300/60 text-xs">
                        <span>✦</span>
                        <span className="font-mono text-[10px] tracking-widest uppercase">Moon Oracle</span>
                        <span>✦</span>
                      </div>

                      <div className="w-28 h-28 rounded-full border border-amber-400/30 flex items-center justify-center relative">
                        <div className="w-20 h-20 rounded-full border border-dashed border-amber-300/40 animate-spin-slow" />
                        <Moon className="w-10 h-10 text-amber-300 absolute" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-amber-200 font-semibold tracking-wide">
                          Toque para revelar
                        </p>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          {slotTitle}
                        </span>
                      </div>
                    </div>

                    {/* FRONT FACE (Revealed Oracle Card) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-b from-[#161622] via-[#0f0f16] to-[#0a0a0f] border border-amber-400/40 shadow-2xl flex flex-col justify-between text-left overflow-y-auto no-scrollbar">
                      {/* Card Header */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-amber-300/80 font-mono mb-1">
                          <span>ARCANO {card.numeral}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                            Elemento {card.element}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl">{card.symbol}</span>
                          <div>
                            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                              {card.name}
                            </h3>
                            <p className="text-[11px] text-amber-200/90 font-medium italic">
                              "{card.title}"
                            </p>
                          </div>
                        </div>

                        {/* Keyword tags */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {card.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-neutral-300 font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="space-y-2.5 my-3 text-xs leading-relaxed">
                        <p className="text-neutral-200 font-normal">
                          {card.essence}
                        </p>

                        <div className="pl-3 border-l-2 border-amber-400/40 space-y-0.5 text-[11px]">
                          <span className="text-amber-300 font-semibold uppercase tracking-wider text-[10px] block">
                            Orientação Prática
                          </span>
                          <span className="text-neutral-300 block leading-relaxed">
                            {card.guidance}
                          </span>
                        </div>

                        <div className="text-[10px] text-neutral-400 border-l-2 border-amber-400/30 pl-2">
                          <strong className="text-amber-200/80">Sinergia Lunar:</strong> {card.lunarSynergy}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Toque para desvirar</span>
                        <span className="text-amber-300 font-medium">✦ Presença Plena</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Footer: Save reading to journal */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 text-xs">
        <span className="text-neutral-400 text-center sm:text-left">
          💡 Reflexão profunda: registre suas impressões enquanto a energia desta tiragem estiver fresca.
        </span>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveToJournal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-bold text-xs transition-all shadow-sm"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salvo no Diário!</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Salvar Leitura no Diário</span>
              </>
            )}
          </motion.button>

          {onNavigateToJournal && (
            <button
              onClick={onNavigateToJournal}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-all"
            >
              <span>Ver Diário</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
