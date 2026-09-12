import Dexie, { type Table } from "dexie";
import type { SettingEntry, StudySession, VocabWord } from "./types";

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

    // Migration: đánh dấu từ seed nếu chưa có isSeed
    for (const w of existing) {
      if (w.id == null || w.isSeed !== undefined) continue;
      const key = w.word.toLowerCase().trim();
      if (seedWordKeys.has(key)) {
        await db.words.update(w.id, { isSeed: true });
      } else {
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

export function canMutateWord(word: VocabWord, isAdmin: boolean): boolean {
  if (word.isSeed) {
    return isAdmin;
  }
  return true;
}
