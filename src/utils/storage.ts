import type { CycleLog, IntentionGoal, JournalEntry, UserSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'moon_app_settings',
  JOURNAL: 'moon_app_journal',
  INTENTIONS: 'moon_app_intentions',
  CYCLE: 'moon_app_cycle',
  SUBSCRIBERS: 'moon_app_subscribers',
};

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'pt-BR',
  theme: 'cosmic-dark',
  location: {
    name: 'São Paulo, Brasil',
    lat: -23.5505,
    lng: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  notifications: {
    fullMoon: true,
    newMoon: true,
    dailyHoroscope: true,
    cycleReminders: true,
  },
  natalChart: {
    birthDate: '1995-05-15',
    birthTime: '08:30',
    birthCity: 'São Paulo',
    sunSign: 'Taurus',
    sunSymbol: '♉',
    moonSign: 'Scorpio',
    moonSymbol: '♏',
    risingSign: 'Cancer',
    risingSymbol: '♋',
    elements: { fire: 20, earth: 40, air: 10, water: 30 },
    houses: [],
    lunarReturnDate: 'May 15',
  },
};

const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'j-1',
    date: new Date().toISOString().split('T')[0],
    title: 'Reflexões sob a Lua Nova',
    content: 'Hoje senti uma clareza renovada para traçar minhas metas pessoais deste mês. Escrevi minhas intenções e reservei tempo para meditar.',
    moonPhase: 'New Moon',
    moonSign: 'Taurus',
    tags: ['Intenção', 'Paz', 'Metas'],
    isFavorite: true,
  },
  {
    id: 'j-2',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    title: 'Ritual de Liberação',
    content: 'Pratiquei o banho de ervas de liberação. Senti os ombros relaxarem e uma sensação vibrante de leveza tomar conta de mim.',
    moonPhase: 'Waxing Crescent',
    moonSign: 'Gemini',
    tags: ['Ritual', 'Banho', 'Limpeza'],
    isFavorite: false,
  },
];

const INITIAL_INTENTIONS: IntentionGoal[] = [
  {
    id: 'int-1',
    title: 'Cultivar Abundância e Foco no Trabalho',
    description: 'Aproveitar a energia impulsionadora da Lua Crescente para concluir o projeto principal e estabelecer novas parcerias.',
    targetPhase: 'Waxing Crescent',
    createdAt: new Date().toISOString(),
    progress: 66,
    checklist: [
      { id: 'c1', text: 'Definir prioridades da semana', done: true },
      { id: 'c2', text: 'Organizar ritual de foco', done: true },
      { id: 'c3', text: 'Finalizar propostas pendentes', done: false },
    ],
    isArchived: false,
  },
  {
    id: 'int-2',
    title: 'Harmonizar a Saúde e Rituais do Sono',
    description: 'Manter a constância no sono e beber chá de infusão lunar antes de dormir.',
    targetPhase: 'Full Moon',
    createdAt: new Date().toISOString(),
    progress: 50,
    checklist: [
      { id: 'c10', text: 'Desconectar das telas às 22h', done: true },
      { id: 'c11', text: 'Meditação de 10 minutos', done: false },
    ],
    isArchived: false,
  },
];

const INITIAL_CYCLE_LOGS: CycleLog[] = [
  {
    id: 'cyc-1',
    startDate: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    symptoms: ['Leve cólica', 'Sensibilidade', 'Criatividade em alta'],
    flowIntensity: 'Medium',
    mood: 'Introspectiva & Reflexiva',
    notes: 'Ciclo sincronizado perfeitamente com a transição para a Lua Nova.',
  },
];

const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // fallback
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // fallback
    }
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch {
      // fallback
    }
    memoryStore.delete(key);
  },
  clear: (): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        return;
      }
    } catch {
      // fallback
    }
    memoryStore.clear();
  },
};

export function getStoredSettings(): UserSettings {
  const data = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      location: {
        ...DEFAULT_SETTINGS.location,
        ...(parsed && typeof parsed.location === 'object' ? parsed.location : {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed && typeof parsed.notifications === 'object' ? parsed.notifications : {}),
      },
      natalChart: parsed && typeof parsed.natalChart === 'object' && parsed.natalChart !== null
        ? { ...DEFAULT_SETTINGS.natalChart, ...parsed.natalChart }
        : DEFAULT_SETTINGS.natalChart,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moon_settings_updated', { detail: settings }));
  }
}

export function getStoredJournal(): JournalEntry[] {
  const data = safeStorage.getItem(STORAGE_KEYS.JOURNAL);
  if (!data) return INITIAL_JOURNAL;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_JOURNAL;
  } catch {
    return INITIAL_JOURNAL;
  }
}

export function saveStoredJournal(entries: JournalEntry[]): void {
  safeStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function getStoredIntentions(): IntentionGoal[] {
  const data = safeStorage.getItem(STORAGE_KEYS.INTENTIONS);
  if (!data) return INITIAL_INTENTIONS;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_INTENTIONS;
  } catch {
    return INITIAL_INTENTIONS;
  }
}

export function saveStoredIntentions(intentions: IntentionGoal[]): void {
  safeStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(intentions));
}

export function getStoredCycleLogs(): CycleLog[] {
  const data = safeStorage.getItem(STORAGE_KEYS.CYCLE);
  if (!data) return INITIAL_CYCLE_LOGS;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_CYCLE_LOGS;
  } catch {
    return INITIAL_CYCLE_LOGS;
  }
}

export function saveStoredCycleLogs(logs: CycleLog[]): void {
  safeStorage.setItem(STORAGE_KEYS.CYCLE, JSON.stringify(logs));
}

export interface SubscriberEntry {
  email: string;
  subscribedAt: string;
  source?: string;
  status: 'active' | 'unsubscribed';
}

const INITIAL_SUBSCRIBERS: SubscriberEntry[] = [
  {
    email: 'contato@diariolunar.app',
    subscribedAt: '2026-01-15T10:00:00.000Z',
    source: 'dashboard',
    status: 'active',
  },
];

export function getStoredSubscribers(): SubscriberEntry[] {
  const data = safeStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
  if (!data) return INITIAL_SUBSCRIBERS;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_SUBSCRIBERS;
  } catch {
    return INITIAL_SUBSCRIBERS;
  }
}

export function saveSubscriber(
  rawEmail: string,
  source: string = 'dashboard'
): { success: boolean; isDuplicate?: boolean; message: string; count: number } {
  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: 'Por favor, insira um e-mail válido.',
      count: getStoredSubscribers().length,
    };
  }

  const existing = getStoredSubscribers();
  const alreadyExists = existing.some((s) => s.email.toLowerCase() === email);

  if (alreadyExists) {
    return {
      success: false,
      isDuplicate: true,
      message: 'Este e-mail já está inscrito no Diário Lunar! ✨',
      count: existing.length,
    };
  }

  const newEntry: SubscriberEntry = {
    email,
    subscribedAt: new Date().toISOString(),
    source,
    status: 'active',
  };

  const updated = [newEntry, ...existing];
  safeStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(updated));

  return {
    success: true,
    message: 'Inscrição confirmada com sucesso! Bem-vindo(a) ao Diário Lunar. 🌙',
    count: updated.length,
  };
}

export function saveStoredSubscribers(subscribers: SubscriberEntry[]): void {
  safeStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
}

export function exportSubscribersCSV(): string {
  const list = getStoredSubscribers();
  let csv = 'Email,Data_Inscricao,Origem,Status\n';
  list.forEach((sub) => {
    const cleanEmail = (sub.email || '').replace(/"/g, '""');
    const cleanDate = (sub.subscribedAt || '').replace(/"/g, '""');
    const cleanSource = (sub.source || 'web').replace(/"/g, '""');
    const cleanStatus = (sub.status || 'active').replace(/"/g, '""');
    csv += `"${cleanEmail}","${cleanDate}","${cleanSource}","${cleanStatus}"\n`;
  });
  return csv;
}
