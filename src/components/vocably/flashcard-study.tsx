import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useWordStore } from "@/lib/vocably/word-store";
import { useSettingsStore, useStreakStore } from "@/lib/vocably/settings-store";
import { useVisibleDueWords, useVisibleWords } from "@/lib/vocably/access";
import { scheduleCard, RATING_META } from "@/lib/vocably/fsrs";
import { speak } from "@/lib/vocably/tts";
import type { VocabWord } from "@/lib/vocably/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlashCard } from "./flash-card";
import { SessionComplete } from "./session-complete";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function FlashcardStudy() {
  const navigate = useNavigate();
  const words = useVisibleWords();
  const dueWords = useVisibleDueWords();
  const updateWord = useWordStore((s) => s.updateWord);
  const sessionSize = useSettingsStore((s) => s.sessionSize);
  const autoSpeak = useSettingsStore((s) => s.autoSpeak);
  const ttsRate = useSettingsStore((s) => s.ttsRate);
  const showIpa = useSettingsStore((s) => s.showIpa);
  const recordStudy = useStreakStore((s) => s.recordStudy);

  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const started = useRef(false);

  const buildQueue = useCallback(() => {
    const size = sessionSize || 20;
    const pool = dueWords.length ? dueWords : words;
    const next = shuffle(pool).slice(0, size);
    setQueue(next);
    setIdx(0);
    setFlipped(false);
    setDone(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [dueWords, words, sessionSize]);

  // Chỉ dựng hàng đợi một lần khi đã có từ (tránh vòng lặp setState)
  useEffect(() => {
    if (started.current) return;
    if (words.length === 0) return;
    started.current = true;
    buildQueue();
  }, [words.length, buildQueue]);

  const restart = useCallback(() => {
    buildQueue();
  }, [buildQueue]);

  const current = queue[idx];

  const handleSpeak = useCallback(
    (text?: string) => {
      if (text) speak(text, "en-US", ttsRate);
    },
    [ttsRate],
  );

  useEffect(() => {
    if (current && autoSpeak && !flipped) handleSpeak(current.word);
    // chỉ phụ thuộc idx / flipped — không rebuild queue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, flipped, autoSpeak]);

  const handleRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (!current?.id) return;
      await updateWord(current.id, scheduleCard(current, rating));
      const key = ["", "again", "hard", "good", "easy"][rating] as keyof typeof stats;
      setStats((s) => ({ ...s, [key]: s[key] + 1 }));
      recordStudy();
      if (idx + 1 >= queue.length) setDone(true);
      else {
        setIdx((i) => i + 1);
        setFlipped(false);
      }
    },
    [current, idx, queue.length, updateWord, recordStudy],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && current) {
        if (e.code === "Digit1" || e.code === "Numpad1") void handleRate(1);
        if (e.code === "Digit2" || e.code === "Numpad2") void handleRate(2);
        if (e.code === "Digit3" || e.code === "Numpad3") void handleRate(3);
        if (e.code === "Digit4" || e.code === "Numpad4") void handleRate(4);
      }
      if (e.code === "KeyR" && current) handleSpeak(current.word);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRate, flipped, done, current, handleSpeak]);

  if (done || (started.current && queue.length === 0)) {
    const total = stats.again + stats.hard + stats.good + stats.easy;
    const remembered = stats.good + stats.easy;
    const pct = total > 0 ? Math.round((remembered / total) * 100) : 0;
    return (
      <SessionComplete
        title="Phiên flashcard hoàn tất"
        subtitle={`Đã ôn ${queue.length} từ theo FSRS.`}
        percent={pct}
        percentLabel="Tỷ lệ nhớ"
        breakdown={[
          { label: "Again", value: stats.again, tone: "again" },
          { label: "Hard", value: stats.hard, tone: "hard" },
          { label: "Good", value: stats.good, tone: "good" },
          { label: "Easy", value: stats.easy, tone: "easy" },
        ]}
        onRestart={restart}
        onBack={() => navigate({ to: "/study" })}
      />
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Đang chuẩn bị thẻ…
      </div>
    );
  }

  const progress = ((idx + 1) / queue.length) * 100;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/study" })}>
          <ArrowLeft className="size-4" /> Thoát
        </Button>
        <span className="text-sm tabular-nums text-muted">
          {idx + 1} / {queue.length}
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => handleSpeak(current.word)}>
          <Volume2 className="size-4" />
        </Button>
      </div>
      <Progress value={progress} className="mb-6" />
      <button type="button" className="block w-full" onClick={() => setFlipped((f) => !f)}>
        <FlashCard
          word={current.word}
          ipa={showIpa ? current.ipa : ""}
          meaning={current.meaning}
          partOfSpeech={current.partOfSpeech}
          topic={current.topic}
          example={current.example}
          flipped={flipped}
        />
      </button>
      {flipped ? (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([1, 2, 3, 4] as const).map((r) => {
            const meta = RATING_META[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRate(r)}
                className={cn(
                  "flex min-h-14 flex-col items-start rounded-[var(--radius-md)] px-3 py-2 text-left",
                  r === 1 && "bg-again/10 text-again",
                  r === 2 && "bg-hard/10 text-hard",
                  r === 3 && "bg-good/10 text-good",
                  r === 4 && "bg-easy/10 text-easy",
                )}
              >
                <span className="flex w-full items-center justify-between text-sm font-semibold">
                  {meta.label} <span className="kbd">{r}</span>
                </span>
                <span className="text-xs opacity-80">{meta.hint}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 text-center text-sm text-subtle">
          Nhấn <span className="kbd">Space</span> để lật thẻ
        </p>
      )}
    </div>
  );
}
