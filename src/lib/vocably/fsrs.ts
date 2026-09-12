import type { VocabWord } from "./types";

const MIN_STABILITY = 0.5;

function constrainStability(s: number) {
  return Math.max(MIN_STABILITY, s);
}

function nextInterval(stability: number) {
  return Math.round(stability * 9);
}

export function scheduleCard(card: VocabWord, rating: 1 | 2 | 3 | 4) {
  const now = new Date();
  const stability = card.stability ?? 0;
  const difficulty = card.difficulty ?? 5;
  const reps = card.reps ?? 0;
  const lapses = card.lapses ?? 0;
  const fsrsState = card.fsrsState ?? 0;

  let newStability = stability;
  let newDifficulty = difficulty;
  const newReps = reps + 1;
  let newLapses = lapses;
  let newState = fsrsState;
  let scheduledDays = 1;

  if (fsrsState === 0 || fsrsState === 1) {
    if (rating === 1) {
      newStability = constrainStability(0.4);
      newDifficulty = Math.min(10, difficulty + 1);
      newState = 1;
      scheduledDays = 0;
    } else if (rating === 2) {
      newStability = constrainStability(1);
      newDifficulty = Math.min(10, difficulty + 0.5);
      newState = 1;
      scheduledDays = 1;
    } else if (rating === 3) {
      newStability = constrainStability(2.5);
      newDifficulty = difficulty;
      newState = 2;
      scheduledDays = 1;
    } else {
      newStability = constrainStability(5);
      newDifficulty = Math.max(1, difficulty - 1);
      newState = 2;
      scheduledDays = 4;
    }
  } else if (rating === 1) {
    newLapses = lapses + 1;
    newStability = constrainStability(stability * 0.2);
    newDifficulty = Math.min(10, difficulty + 1);
    newState = 3;
    scheduledDays = 0;
  } else if (rating === 2) {
    newStability = constrainStability(stability * 1.2);
    newDifficulty = Math.min(10, difficulty + 0.15);
    newState = 2;
    scheduledDays = nextInterval(newStability);
  } else if (rating === 3) {
    newStability = constrainStability(stability * 2.0);
    newDifficulty = difficulty;
    newState = 2;
    scheduledDays = nextInterval(newStability);
  } else {
    newStability = constrainStability(stability * 2.5);
    newDifficulty = Math.max(1, difficulty - 0.15);
    newState = 2;
    scheduledDays = nextInterval(newStability);
  }

  const nextReviewDate = new Date(now);
  if (scheduledDays === 0) {
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + scheduledDays);
  }

  let status: VocabWord["status"] = "learning";
  if (newState === 0) status = "new";
  else if (newState === 2 && newStability > 10) status = "known";
  else if (newState === 2) status = "review";

  return {
    stability: newStability,
    difficulty: newDifficulty,
    reps: newReps,
    lapses: newLapses,
    fsrsState: newState,
    scheduledDays,
    elapsedDays: Math.round(
      (now.getTime() - new Date(card.lastReview || now).getTime()) / 86400000,
    ),
    lastReview: now.toISOString(),
    nextReview: nextReviewDate.toISOString(),
    status,
  };
}

export const RATING_META = {
  1: { label: "Again", desc: "Không nhớ", hint: "< 10 phút", tone: "again" },
  2: { label: "Hard", desc: "Khó nhớ", hint: "1–2 ngày", tone: "hard" },
  3: { label: "Good", desc: "Nhớ được", hint: "3–4 ngày", tone: "good" },
  4: { label: "Easy", desc: "Dễ dàng", hint: "7+ ngày", tone: "easy" },
} as const;
