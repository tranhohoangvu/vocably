import { create } from "zustand";
import { getDb, canMutateWord } from "./database";
import { useAuthStore } from "./auth-store";
import type { VocabWord, WordDraft, WordStatus } from "./types";

type Filter = { topic: string; status: WordStatus | "all"; search: string };

type Stats = {
  total: number;
  new: number;
  learning: number;
  review: number;
  known: number;
  dueToday: number;
};

type WordState = {
  words: VocabWord[];
  loading: boolean;
  hydrated: boolean;
  filter: Filter;
  fetchWords: () => Promise<void>;
  addWord: (wordData: WordDraft) => Promise<number>;
  updateWord: (id: number, changes: Partial<VocabWord>) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  importWords: (newWords: WordDraft[]) => Promise<{ added: number; skipped: number }>;
  setFilter: (filter: Partial<Filter>) => void;
  getFilteredWords: () => VocabWord[];
  getDueWords: () => VocabWord[];
  getTopics: () => string[];
  getStats: () => Stats;
};

const emptyFsrs = (now: string): Pick<
  VocabWord,
  | "status"
  | "nextReview"
  | "createdAt"
  | "stability"
  | "difficulty"
  | "elapsedDays"
  | "scheduledDays"
  | "reps"
  | "lapses"
  | "fsrsState"
  | "lastReview"
> => ({
  status: "new",
  nextReview: now,
  createdAt: now,
  stability: 0,
  difficulty: 5,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  fsrsState: 0,
  lastReview: null,
});

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  loading: false,
  hydrated: false,
  filter: { topic: "all", status: "all", search: "" },

  fetchWords: async () => {
    set({ loading: true });
    const words = await getDb().words.toArray();
    set({ words, loading: false, hydrated: true });
  },

  addWord: async (wordData) => {
    const now = new Date().toISOString();
    // Từ do user thêm luôn có isSeed = false
    const id = await getDb().words.add({ ...wordData, ...emptyFsrs(now), isSeed: false });
    await get().fetchWords();
    return id;
  },

  updateWord: async (id, changes) => {
    const db = getDb();
    const word = await db.words.get(id);
    const user = useAuthStore.getState().user;
    const isAdmin = user?.role === "admin";

    // Phân quyền: Chặn sửa từ vựng hệ thống nếu không phải là admin
    if (word && !canMutateWord(word, isAdmin)) {
      throw new Error("Chỉ Admin mới có quyền sửa từ vựng hệ thống.");
    }

    await db.words.update(id, changes);
    await get().fetchWords();
  },

  deleteWord: async (id) => {
    const db = getDb();
    const word = await db.words.get(id);
    const user = useAuthStore.getState().user;
    const isAdmin = user?.role === "admin";

    // Phân quyền: Chặn xóa từ vựng hệ thống nếu không phải là admin
    if (word && !canMutateWord(word, isAdmin)) {
      throw new Error("Chỉ Admin mới có quyền xóa từ vựng hệ thống.");
    }

    await db.words.delete(id);
    await get().fetchWords();
  },

  importWords: async (newWords) => {
    if (!newWords || newWords.length === 0) return { added: 0, skipped: 0 };
    const existing = await getDb().words.toArray();
    const existingMap = new Set(existing.map((w) => w.word.toLowerCase().trim()));
    const now = new Date().toISOString();
    const toInsert: VocabWord[] = [];
    let skipped = 0;

    for (const w of newWords) {
      const cleanWord = w.word.toLowerCase().trim();
      if (existingMap.has(cleanWord)) {
        skipped++;
        continue;
      }
      existingMap.add(cleanWord);
      toInsert.push({ ...w, ...emptyFsrs(now), isSeed: false });
    }

    if (toInsert.length > 0) {
      await getDb().words.bulkAdd(toInsert);
      await get().fetchWords();
    }
    return { added: toInsert.length, skipped };
  },

  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),

  getFilteredWords: () => {
    const { words, filter } = get();
    return words.filter((w) => {
      const topicMatch = filter.topic === "all" || w.topic === filter.topic;
      const statusMatch = filter.status === "all" || w.status === filter.status;
      const q = filter.search.toLowerCase();
      const searchMatch =
        !filter.search ||
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q);
      return topicMatch && statusMatch && searchMatch;
    });
  },

  getDueWords: () => {
    const { words } = get();
    const now = new Date();
    return words.filter(
      (w) => w.status !== "known" && (!w.nextReview || new Date(w.nextReview) <= now),
    );
  },

  getTopics: () => [...new Set(get().words.map((w) => w.topic))].sort(),

  getStats: () => {
    const { words } = get();
    const byStatus = { new: 0, learning: 0, review: 0, known: 0 };
    words.forEach((w) => {
      if (w.status in byStatus) byStatus[w.status as keyof typeof byStatus]++;
    });
    const dueToday = words.filter((w) => {
      if (w.status === "known") return false;
      return !w.nextReview || new Date(w.nextReview) <= new Date();
    }).length;
    return { total: words.length, ...byStatus, dueToday };
  },
}));