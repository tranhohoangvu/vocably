import { useMemo } from "react";
import { useAuthStore } from "./auth-store";
import { useWordStore } from "./word-store";
import { useSettingsStore } from "./settings-store";
import { canEditWordContent as canEditWordContentFn } from "./database";
import type { AuthUser, VocabWord, WordStatus } from "./types";

/** Số từ mở cho tài khoản khách (demo). */
export const DEMO_WORD_LIMIT = 50;

export function useIsGuest(): boolean {
  return useAuthStore((s) => s.user?.isGuest ?? true);
}

export function useIsFullUser(): boolean {
  return useAuthStore((s) => Boolean(s.user && !s.user.isGuest));
}

export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === "admin");
}

export function useAuthUser(): AuthUser | null {
  return useAuthStore((s) => s.user);
}

export function canEditWordContent(
  word: VocabWord,
  user: Pick<AuthUser, "isGuest" | "role"> | null | undefined,
): boolean {
  return canEditWordContentFn(word, user);
}

/** Từ hiển thị / học được theo quyền (guest = 50 từ đầu). */
export function useVisibleWords(): VocabWord[] {
  const words = useWordStore((s) => s.words);
  const isGuest = useIsGuest();
  return useMemo(
    () => (isGuest ? words.slice(0, DEMO_WORD_LIMIT) : words),
    [words, isGuest],
  );
}

export function useVisibleStats() {
  const words = useVisibleWords();
  return useMemo(() => {
    const byStatus = { new: 0, learning: 0, review: 0, known: 0 };
    const now = new Date();
    let dueToday = 0;
    for (const w of words) {
      if (w.status in byStatus) byStatus[w.status as WordStatus]++;
      if (w.status !== "known" && (!w.nextReview || new Date(w.nextReview) <= now)) {
        dueToday++;
      }
    }
    return { total: words.length, ...byStatus, dueToday };
  }, [words]);
}

export function useVisibleDueWords(): VocabWord[] {
  const words = useVisibleWords();
  return useMemo(() => {
    const now = new Date();
    return words.filter(
      (w) => w.status !== "known" && (!w.nextReview || new Date(w.nextReview) <= now),
    );
  }, [words]);
}

export function useVisibleFilteredWords(): VocabWord[] {
  const words = useVisibleWords();
  const filter = useWordStore((s) => s.filter);
  return useMemo(() => {
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
  }, [words, filter]);
}

export function useStudyPool(): VocabWord[] {
  const words = useVisibleWords();
  const studyTopic = useSettingsStore((s) => s.studyTopic);
  const studySource = useSettingsStore((s) => s.studySource);

  return useMemo(() => {
    let pool = words;
    if (studyTopic && studyTopic !== "all") {
      pool = pool.filter((w) => w.topic === studyTopic);
    }
    if (studySource === "due") {
      const now = new Date();
      const due = pool.filter(
        (w) => w.status !== "known" && (!w.nextReview || new Date(w.nextReview) <= now),
      );
      if (due.length > 0) return due;
    } else if (studySource === "new") {
      const news = pool.filter((w) => w.status === "new");
      if (news.length > 0) return news;
    } else if (studySource === "learning") {
      const learning = pool.filter((w) => w.status === "learning" || w.status === "review");
      if (learning.length > 0) return learning;
    }
    return pool.length > 0 ? pool : words;
  }, [words, studyTopic, studySource]);
}
