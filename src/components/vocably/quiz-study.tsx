import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2, XCircle } from "lucide-react";
import { useStreakStore } from "@/lib/vocably/settings-store";
import { useVisibleWords } from "@/lib/vocably/access";
import { speak } from "@/lib/vocably/tts";
import type { VocabWord } from "@/lib/vocably/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SessionComplete } from "./session-complete";
import { cn } from "@/lib/utils";

const KEYS = ["A", "B", "C", "D"];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getOptions(correct: VocabWord, all: VocabWord[], field: "meaning" | "word") {
  const others = all
    .filter((w) => w.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w[field]);
  return shuffle([correct[field], ...others]);
}

export function QuizStudy() {
  const navigate = useNavigate();
  const words = useVisibleWords();
  const recordStudy = useStreakStore((s) => s.recordStudy);
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState<"en-vi" | "vi-en">("en-vi");
  const started = useRef(false);

  const start = useCallback(() => {
    const q = shuffle(words).slice(0, 20);
    setQueue(q);
    setIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    if (q[0]) {
      const dir = Math.random() > 0.5 ? "en-vi" : "vi-en";
      setDirection(dir);
      setOptions(getOptions(q[0], words, dir === "en-vi" ? "meaning" : "word"));
    }
  }, [words]);

  useEffect(() => {
    if (started.current) return;
    if (words.length === 0) return;
    started.current = true;
    start();
  }, [words.length, start]);

  const current = queue[idx];

  useEffect(() => {
    if (current && direction === "en-vi") speak(current.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, direction]);

  const handleSelect = useCallback(
    (opt: string) => {
      if (selected !== null || !current) return;
      const correctAnswer = direction === "en-vi" ? current.meaning : current.word;
      setSelected(opt);
      if (opt === correctAnswer) {
        setScore((s) => s + 1);
        recordStudy();
      }
    },
    [selected, current, direction, recordStudy],
  );

  const handleNext = useCallback(() => {
    if (idx + 1 >= queue.length) {
      setDone(true);
      return;
    }
    const nextIdx = idx + 1;
    const nextWord = queue[nextIdx];
    const dir = Math.random() > 0.5 ? "en-vi" : "vi-en";
    setDirection(dir);
    setOptions(getOptions(nextWord, words, dir === "en-vi" ? "meaning" : "word"));
    setIdx(nextIdx);
    setSelected(null);
  }, [idx, queue, words]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (!selected) {
        if (["Digit1", "KeyA"].includes(e.code) && options[0]) handleSelect(options[0]);
        if (["Digit2", "KeyB"].includes(e.code) && options[1]) handleSelect(options[1]);
        if (["Digit3", "KeyC"].includes(e.code) && options[2]) handleSelect(options[2]);
        if (["Digit4", "KeyD"].includes(e.code) && options[3]) handleSelect(options[3]);
      } else if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, options, handleSelect, handleNext, done]);

  if (!started.current && queue.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Đang chuẩn bị câu hỏi…
      </div>
    );
  }

  if (done || (started.current && queue.length === 0)) {
    const pct = queue.length ? Math.round((score / queue.length) * 100) : 0;
    return (
      <SessionComplete
        title="Hoàn thành bài quiz"
        subtitle={`${score} / ${queue.length} câu chính xác.`}
        percent={pct}
        percentLabel="Điểm"
        onRestart={start}
        onBack={() => navigate({ to: "/study" })}
      />
    );
  }

  const correctAnswer = direction === "en-vi" ? current.meaning : current.word;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/study" })}>
          <ArrowLeft className="size-4" /> Thoát
        </Button>
        <span className="text-sm tabular-nums text-muted">
          {idx + 1}/{queue.length} · {score} điểm
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => speak(current.word)}>
          <Volume2 className="size-4" />
        </Button>
      </div>
      <Progress value={((idx + 1) / queue.length) * 100} className="mb-6" />
      <div className="mb-3 text-center">
        <Badge tone="primary">{direction === "en-vi" ? "Anh → Việt" : "Việt → Anh"}</Badge>
      </div>
      <Card className="mb-5 p-8 text-center">
        <Badge tone="muted">{current.topic}</Badge>
        {direction === "en-vi" ? (
          <>
            <div className="mt-4 font-display text-4xl font-medium tracking-tight">{current.word}</div>
            {current.ipa && <div className="mt-2 font-mono text-sm text-muted">{current.ipa}</div>}
          </>
        ) : (
          <>
            <p className="mt-4 text-xs uppercase tracking-wider text-subtle">Nghĩa tiếng Việt</p>
            <div className="mt-1 font-display text-3xl font-medium">{current.meaning}</div>
          </>
        )}
      </Card>
      <div className="grid gap-2">
        {options.map((opt, i) => {
          const chosen = selected === opt;
          const isCorrect = opt === correctAnswer;
          return (
            <button
              key={`${opt}-${i}`}
              type="button"
              disabled={!!selected}
              onClick={() => handleSelect(opt)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-left text-sm font-medium shadow-border",
                !selected && "hover:bg-bg-subtle",
                selected && isCorrect && "bg-known/10 text-known",
                selected && chosen && !isCorrect && "bg-again/10 text-again",
              )}
            >
              <span className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-bg text-xs font-semibold">
                {KEYS[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {selected && isCorrect && <CheckCircle2 className="size-4" />}
              {selected && chosen && !isCorrect && <XCircle className="size-4" />}
            </button>
          );
        })}
      </div>
      {selected && (
        <Card className="mt-5 p-4">
          <p className={cn("flex items-center gap-2 text-sm font-medium", selected === correctAnswer ? "text-known" : "text-again")}>
            {selected === correctAnswer ? (
              <>
                <CheckCircle2 className="size-4" /> Chính xác
              </>
            ) : (
              <>
                <XCircle className="size-4" /> Đáp án: {correctAnswer}
              </>
            )}
          </p>
          {current.example && <p className="mt-2 text-sm italic text-muted">“{current.example}”</p>}
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleNext}>
              {idx + 1 >= queue.length ? "Kết quả" : "Câu tiếp"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
