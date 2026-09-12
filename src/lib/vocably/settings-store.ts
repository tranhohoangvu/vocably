import { create } from "zustand";
import { getDb } from "./database";

export type ThemeName = "light" | "dark";

type SettingsState = {
  theme: ThemeName;
  ttsRate: number;
  sessionSize: number;
  showIpa: boolean;
  autoSpeak: boolean;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setSetting: (key: keyof Omit<SettingsState, "loaded" | "loadSettings" | "setSetting">, value: unknown) => Promise<void>;
};

const DEFAULTS = {
  theme: "light" as ThemeName,
  ttsRate: 0.9,
  sessionSize: 20,
  showIpa: true,
  autoSpeak: true,
};

function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULTS,
  loaded: false,

  loadSettings: async () => {
    const entries = await getDb().settings.toArray();
    const stored: Record<string, unknown> = {};
    entries.forEach((e) => {
      stored[e.key] = e.value;
    });
    const next = { ...DEFAULTS, ...stored, loaded: true } as SettingsState;
    applyTheme(next.theme);
    set(next);
  },

  setSetting: async (key, value) => {
    set({ [key]: value } as Partial<SettingsState>);
    await getDb().settings.put({ key, value });
    if (key === "theme") applyTheme(value as ThemeName);
  },
}));

type StreakState = {
  streak: number;
  lastStudyDate: string | null;
  studyHistory: string[];
  loadStreak: () => void;
  recordStudy: () => void;
};

export const useStreakStore = create<StreakState>((set) => ({
  streak: 0,
  lastStudyDate: null,
  studyHistory: [],

  loadStreak: () => {
    try {
      const raw = localStorage.getItem("vocably_streak");
      if (raw) set(JSON.parse(raw) as StreakState);
    } catch {
      /* ignore */
    }
  },

  recordStudy: () => {
    const today = new Date().toISOString().slice(0, 10);
    set((s) => {
      const last = s.lastStudyDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      let newStreak = s.streak;
      if (last === today) return s;
      if (last === yStr) newStreak = s.streak + 1;
      else newStreak = 1;

      const history = s.studyHistory.includes(today)
        ? s.studyHistory
        : [...s.studyHistory.slice(-364), today];

      const next = { streak: newStreak, lastStudyDate: today, studyHistory: history };
      localStorage.setItem("vocably_streak", JSON.stringify(next));
      return next;
    });
  },
}));
