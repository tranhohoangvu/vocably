import { create } from "zustand";
import {
  getDb,
  canEditWordContent,
  isContentChange,
  pickStudyFields,
  GUEST_MUTATION_ERROR,
  SEED_MUTATION_ERROR,
  LOGIN_REQUIRED_ERROR,
} from "./database";
import { useAuthStore } from "./auth-store";
import { getSupabase, isSupabaseConfigured } from "./supabase";
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
  updateProgress: (id: number, changes: Partial<VocabWord>) => Promise<void>;
  deleteWord: (id: number) => Promise<void>;
  importWords: (newWords: WordDraft[]) => Promise<{ added: number; skipped: number }>;
  setFilter: (filter: Partial<Filter>) => void;
  getFilteredWords: () => VocabWord[];
  getDueWords: () => VocabWord[];
  getTopics: () => string[];
  getStats: () => Stats;
};

const emptyFsrs = (
  now: string,
): Pick<
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

function actor() {
  return useAuthStore.getState().user;
}

function assertCanMutateBank() {
  const user = actor();
  if (!user) throw new Error(LOGIN_REQUIRED_ERROR);
  if (user.isGuest) throw new Error(GUEST_MUTATION_ERROR);
  return user;
}

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
    assertCanMutateBank();
    const now = new Date().toISOString();
    const id = await getDb().words.add({ ...wordData, ...emptyFsrs(now), isSeed: false });
    await get().fetchWords();

    if (isSupabaseConfigured()) {
      const user = actor();
      if (user?.id && !user.isGuest) {
        const supabase = getSupabase();
        if (supabase) {
          void supabase.from("words").insert({
            word: wordData.word,
            ipa: wordData.ipa,
            meaning: wordData.meaning,
            part_of_speech: wordData.partOfSpeech,
            topic: wordData.topic,
            example: wordData.example,
            tags: wordData.tags,
            is_seed: false,
            user_id: user.id,
          });
        }
      }
    }

    return id;
  },

  updateWord: async (id, changes) => {
    const db = getDb();
    const word = await db.words.get(id);
    if (!word) throw new Error("Không tìm thấy từ.");

    if (isContentChange(changes)) {
      const user = actor();
      if (!canEditWordContent(word, user)) {
        if (!user || user.isGuest) throw new Error(GUEST_MUTATION_ERROR);
        throw new Error(SEED_MUTATION_ERROR);
      }
      const next: Partial<VocabWord> = { ...changes };
      delete next.isSeed;
      await db.words.update(id, next);
    } else {
      await db.words.update(id, pickStudyFields(changes));
    }
    await get().fetchWords();
  },

  updateProgress: async (id, changes) => {
    const db = getDb();
    const word = await db.words.get(id);
    if (!word) return;
    const studyFields = pickStudyFields(changes);
    await db.words.update(id, studyFields);
    await get().fetchWords();

    if (isSupabaseConfigured()) {
      const user = actor();
      if (user?.id && !user.isGuest) {
        const supabase = getSupabase();
        if (supabase) {
          void supabase.from("user_word_progress").upsert(
            {
              user_id: user.id,
              word_id: id,
              status: changes.status || word.status,
              next_review: changes.nextReview || word.nextReview,
              stability: changes.stability ?? word.stability,
              difficulty: changes.difficulty ?? word.difficulty,
              elapsed_days: changes.elapsedDays ?? word.elapsedDays,
              scheduled_days: changes.scheduledDays ?? word.scheduledDays,
              reps: changes.reps ?? word.reps,
              lapses: changes.lapses ?? word.lapses,
              fsrs_state: changes.fsrsState ?? word.fsrsState,
              last_review: changes.lastReview ?? word.lastReview,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,word_id" },
          );
        }
      }
    }
  },

  deleteWord: async (id) => {
    const db = getDb();
    const word = await db.words.get(id);
    const user = actor();
    if (!word) return;
    if (!canEditWordContent(word, user)) {
      if (!user || user.isGuest) throw new Error(GUEST_MUTATION_ERROR);
      throw new Error(SEED_MUTATION_ERROR);
    }
    await db.words.delete(id);
    await get().fetchWords();

    if (isSupabaseConfigured() && user?.id) {
      const supabase = getSupabase();
      if (supabase) {
        void supabase.from("words").delete().match({ id, user_id: user.id });
      }
    }
  },

  importWords: async (newWords) => {
    assertCanMutateBank();
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
