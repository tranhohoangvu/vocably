import Dexie, { type Table } from "dexie";
import type { AuthUser, SettingEntry, StudySession, VocabWord } from "./types";
import { CONTENT_KEYS, STUDY_KEYS } from "./types";

class VocablyDB extends Dexie {
  words!: Table<VocabWord, number>;
  studySessions!: Table<StudySession, number>;
  settings!: Table<SettingEntry, string>;

  constructor() {
    super("VocablyDB");
    this.version(1).stores({
      words: "++id, word, topic, status, nextReview, createdAt",
      studySessions: "++id, date, mode, wordsStudied, correct",
      settings: "key",
    });
  }
}

let instance: VocablyDB | null = null;

export function getDb(): VocablyDB {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available");
  }
  if (!instance) instance = new VocablyDB();
  return instance;
}

type SeedWord = {
  id?: string | number;
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech?: string;
  topic?: string;
  example?: string;
  tags?: string[];
};

let seedWordKeys: Set<string> | null = null;

export function getSeedWordKeys(): Set<string> {
  return seedWordKeys ?? new Set();
}

export async function seedInitialData() {
  const db = getDb();
  try {
    const res = await fetch("/data/toeic-words.json");
    if (!res.ok) return;
    const incoming = (await res.json()) as SeedWord[];
    seedWordKeys = new Set(incoming.map((w) => w.word.toLowerCase().trim()));

    const existing = await db.words.toArray();
    const existingSet = new Set(existing.map((w) => w.word.toLowerCase().trim()));

    for (const w of existing) {
      if (w.id == null) continue;
      const key = w.word.toLowerCase().trim();
      const shouldSeed = seedWordKeys.has(key);
      if (w.isSeed === true && shouldSeed) continue;
      if (w.isSeed === false && !shouldSeed) continue;
      if (shouldSeed && w.isSeed !== true) {
        await db.words.update(w.id, { isSeed: true });
      } else if (!shouldSeed && w.isSeed === undefined) {
        await db.words.update(w.id, { isSeed: false });
      }
    }

    const missing = incoming.filter((w) => !existingSet.has(w.word.toLowerCase().trim()));
    if (missing.length === 0) return;

    const now = new Date().toISOString();
    const toInsert: VocabWord[] = missing.map((w) => ({
      word: w.word,
      ipa: w.ipa ?? "",
      meaning: w.meaning,
      partOfSpeech: w.partOfSpeech ?? "noun",
      topic: w.topic ?? "General",
      example: w.example ?? "",
      tags: w.tags ?? [],
      status: "new" as const,
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
      isSeed: true,
    }));
    await db.words.bulkAdd(toInsert);
  } catch (err) {
    console.error("Seed error:", err);
  }
}

export function isSystemWord(word: VocabWord): boolean {
  if (word.isSeed === true) return true;
  const keys = getSeedWordKeys();
  if (keys.size === 0) return false;
  return keys.has(word.word.toLowerCase().trim());
}

/** UI + store: can this actor edit/delete the dictionary entry? Progress updates are separate. */
export function canEditWordContent(
  word: VocabWord,
  user: Pick<AuthUser, "isGuest" | "role"> | null | undefined,
): boolean {
  if (!user || user.isGuest) return false;
  if (isSystemWord(word)) return user.role === "admin";
  return true;
}

/** @deprecated use canEditWordContent — kept so older call sites compile during edits */
export function canMutateWord(word: VocabWord, isAdmin: boolean): boolean {
  if (!isSystemWord(word)) return true;
  return isAdmin;
}

export function isContentChange(changes: Partial<VocabWord>): boolean {
  return (CONTENT_KEYS as readonly string[]).some((k) => k in changes);
}

export function pickStudyFields(changes: Partial<VocabWord>): Partial<VocabWord> {
  const next: Partial<VocabWord> = {};
  for (const key of STUDY_KEYS) {
    if (key in changes) {
      (next as Record<string, unknown>)[key] = changes[key];
    }
  }
  return next;
}

export const GUEST_MUTATION_ERROR = "Tài khoản demo không được thêm, sửa hoặc xóa từ vựng.";
export const SEED_MUTATION_ERROR = "Chỉ Admin mới có quyền sửa hoặc xóa từ vựng hệ thống.";
export const LOGIN_REQUIRED_ERROR = "Cần đăng nhập tài khoản để thay đổi kho từ.";
