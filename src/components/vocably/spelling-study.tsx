import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2, XCircle } from "lucide-react";
import { useSettingsStore, useStreakStore } from "@/lib/vocably/settings-store";
import { useVisibleWords } from "@/lib/vocably/access";
import { speak } from "@/lib/vocably/tts";
import type { VocabWord } from "@/lib/vocably/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SessionComplete } from "./session-complete";
import { cn } from "@/lib/utils";

export function SpellingStudy() {
  const navigate = useNavigate();
  const words = useVisibleWords();
  const ttsRate = useSettingsStore((s) => s.ttsRate);
  const recordStudy = useStreakStore((s) => s.recordStudy);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const started = useRef(false);

  const start = () => {
    setQueue([...words].sort(() => Math.random() - 0.5).slice(0, 15));
    setIdx(0);
    setInput("");
    setStatus(null);
    setScore(0);
    setDone(false);
  };

  useEffect(() => {
    if (started.current) return;
    if (words.length === 0) return;
    started.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  const current = queue[idx];
  const handleSpeak = useCallback(() => {
    if (!current) return;
    setSpeaking(true);
    speak(current.word, "en-US", ttsRate);
    setTimeout(() => setSpeaking(false), 900);
  }, [current, ttsRate]);

  useEffect(() => {
    if (current) setTimeout(handleSpeak, 250);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const check = () => {
    if (!input.trim() || !current) return;
    const ok = input.trim().toLowerCase() === current.word.toLowerCase();
    setStatus(ok ? "correct" : "wrong");
    if (ok) {
      setScore((s) => s + 1);
      recordStudy();
    }
  };

  const next = () => {
    if (idx + 1 >= queue.length) setDone(true);
    else {
      setIdx((i) => i + 1);
      setInput("");
      setStatus(null);
    }
  };

  if (done || queue.length === 0) {
    const pct = queue.length ? Math.round((score / queue.length) * 100) : 0;
    return (
      <SessionComplete
        title="Hoàn thành chính tả"
        subtitle={`${score} / ${queue.length} từ gõ đúng.`}
        percent={pct}
        percentLabel="Chính xác"
        onRestart={start}
        onBack={() => navigate({ to: "/study" })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/study" })}>
          <ArrowLeft className="size-4" /> Thoát
        </Button>
        <span className="text-sm tabular-nums text-muted">
          {idx + 1}/{queue.length} · {score}
        </span>
        <span className="w-9" />
      </div>
      <Progress value={((idx + 1) / queue.length) * 100} className="mb-6" />
      <Card className="p-8 text-center">
        <div className="mb-6 flex justify-between">
          <Badge tone="muted">{current.topic}</Badge>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{current.partOfSpeech}</span>
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "mx-auto flex size-20 items-center justify-center rounded-full text-primary shadow-border transition-[transform,background-color] duration-150",
            speaking ? "scale-105 bg-primary text-primary-fg" : "bg-bg",
          )}
          aria-label="Nghe lại"
        >
          <Volume2 className="size-8" />
        </button>
        <p className="mt-3 text-sm text-muted">Bấm loa để nghe lại</p>
        <p className="mt-4 rounded-[var(--radius-md)] bg-bg px-4 py-2 text-sm">Gợi ý: {current.meaning}</p>
        <Input
          ref={inputRef}
          className={cn(
            "mx-auto mt-6 h-14 max-w-sm text-center text-xl font-semibold tracking-wide",
            status === "correct" && "text-known",
            status === "wrong" && "text-again",
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={status === "correct"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") status ? next() : check();
          }}
          placeholder={`${current.word.length} chữ cái`}
        />
        {status === "correct" && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-known">
            <CheckCircle2 className="size-4" /> {current.word} {current.ipa}
          </p>
        )}
        {status === "wrong" && (
          <p className="mt-4 text-sm font-medium text-again">
            <XCircle className="mr-1 inline size-4" /> Đáp án: {current.word} · {current.ipa}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          {!status ? (
            <Button onClick={check} disabled={!input.trim()}>
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={next}>
              {idx + 1 >= queue.length ? "Kết quả" : "Từ tiếp"} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
