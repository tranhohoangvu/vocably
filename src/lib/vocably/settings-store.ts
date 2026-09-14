import { create } from "zustand";
import { getDb } from "./database";

export type ThemeName = "light" | "dark";

type SettingsState = {
  theme: ThemeName;
  ttsRate: number;
  sessionSize: number;
  showIpa: boolean;
  autoSpeak: boolean;
  studyTopic: string;
  studySource: "due" | "all" | "new" | "learning";
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
  studyTopic: "all",
  studySource: "all" as const,
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
  studyCounts: Record<string, number>;
  currentUserEmail: string | null;
  loadStreak: (userEmail?: string | null) => void;
  recordStudy: (wordsCount?: number, userEmail?: string | null) => void;
};

function getStreakKey(email?: string | null): string {
  if (!email) return "vocably_streak_guest";
  return `vocably_streak_${email.trim().toLowerCase()}`;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: 0,
  lastStudyDate: null,
  studyHistory: [],
  studyCounts: {},
  currentUserEmail: null,

  loadStreak: (userEmail) => {
    const key = getStreakKey(userEmail);
    try {
      const raw = localStorage.getItem(key) || (userEmail ? null : localStorage.getItem("vocably_streak"));
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          streak: parsed.streak || 0,
          lastStudyDate: parsed.lastStudyDate || null,
          studyHistory: parsed.studyHistory || [],
          studyCounts: parsed.studyCounts || {},
          currentUserEmail: userEmail ?? null,
        });
        return;
      }
    } catch {
      /* ignore */
    }
    set({
      streak: 0,
      lastStudyDate: null,
      studyHistory: [],
      studyCounts: {},
      currentUserEmail: userEmail ?? null,
    });
  },

  recordStudy: (wordsCount = 1, userEmail) => {
    const today = new Date().toISOString().slice(0, 10);
    const email = userEmail !== undefined ? userEmail : get().currentUserEmail;
    const key = getStreakKey(email);

    set((s) => {
      const last = s.lastStudyDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      let newStreak = s.streak;
      if (last === today) {
        // Same day: streak stays same, increment count
      } else if (last === yStr) {
        newStreak = s.streak + 1;
      } else {
        newStreak = 1;
      }

      const history = s.studyHistory.includes(today)
        ? s.studyHistory
        : [...s.studyHistory.slice(-364), today];

      const currentCount = s.studyCounts[today] || 0;
      const counts = { ...s.studyCounts, [today]: currentCount + wordsCount };

      const next = {
        streak: newStreak,
        lastStudyDate: today,
        studyHistory: history,
        studyCounts: counts,
        currentUserEmail: email ?? null,
      };

      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  },
}));
