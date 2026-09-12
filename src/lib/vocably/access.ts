import { useMemo } from "react";
import { useAuthStore } from "./auth-store";
import { useWordStore } from "./word-store";
import type { VocabWord, WordStatus } from "./types";

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
