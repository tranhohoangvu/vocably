import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Volume2, XCircle } from "lucide-react";
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

export function FillStudy() {
  const navigate = useNavigate();
  const words = useVisibleWords();
  const recordStudy = useStreakStore((s) => s.recordStudy);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);
  const started = useRef(false);

  const start = () => {
    const withEx = words.filter((w) => w.example);
    setQueue([...withEx].sort(() => Math.random() - 0.5).slice(0, 15));
    setIdx(0);
    setInput("");
    setStatus(null);
    setScore(0);
    setDone(false);
    setHint(false);
  };

  useEffect(() => {
    if (started.current) return;
    if (words.length === 0) return;
    started.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  const current = queue[idx];
  useEffect(() => {
    inputRef.current?.focus();
    setHint(false);
  }, [idx, current]);

  const blank = (word?: string, example?: string) => {
    if (!word || !example) return "";
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return example.replace(regex, "___");
  };

  const check = () => {
    if (!current || !input.trim()) return;
    const ok = input.trim().toLowerCase() === current.word.toLowerCase();
    setStatus(ok ? "correct" : "wrong");
    speak(current.word);
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
        title="Hoàn thành điền từ"
        subtitle={`${score} / ${queue.length} câu.`}
        percent={pct}
        percentLabel="Chính xác"
        onRestart={start}
        onBack={() => navigate({ to: "/study" })}
      />
    );
  }

  const sentence = blank(current.word, current.example);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/study" })}>
          <ArrowLeft className="size-4" /> Thoát
        </Button>
        <span className="text-sm tabular-nums text-muted">
          {idx + 1}/{queue.length} · {score} đúng
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => speak(current.word)}>
          <Volume2 className="size-4" />
        </Button>
      </div>
      <Progress value={((idx + 1) / queue.length) * 100} className="mb-6" />
      <Card className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-2">
          <Badge tone="muted">{current.topic}</Badge>
          <span className="text-sm text-muted">Nghĩa: {current.meaning}</span>
        </div>
        <p className="text-lg leading-loose">
          {sentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <input
                  ref={i === 0 ? inputRef : undefined}
                  value={input}
                  disabled={!!status}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") status ? next() : check();
                  }}
                  placeholder={`${current.word.length} ký tự`}
                  className={cn(
                    "mx-1 inline-block rounded-[var(--radius-sm)] bg-bg px-2 py-1 text-center text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                    status === "correct" && "text-known",
                    status === "wrong" && "text-again",
                  )}
                  style={{ width: Math.max(140, current.word.length * 14) }}
                />
              )}
            </span>
          ))}
        </p>
        <div className="mt-6 border-t border-border pt-4">
          {!hint && !status && (
            <button type="button" className="inline-flex items-center gap-1.5 text-sm text-muted" onClick={() => setHint(true)}>
              <Lightbulb className="size-4 text-hard" /> Xem gợi ý
            </button>
          )}
          {hint && !status && (
            <p className="text-sm text-hard">
              {current.word[0]}
              {"_".repeat(Math.max(0, current.word.length - 2))}
              {current.word.slice(-1)} · {current.word.length} ký tự
            </p>
          )}
          {status === "correct" && (
            <p className="flex items-center gap-2 text-sm font-medium text-known">
              <CheckCircle2 className="size-4" /> {current.word} {current.ipa}
            </p>
          )}
          {status === "wrong" && (
            <p className="flex items-center gap-2 text-sm font-medium text-again">
              <XCircle className="size-4" /> Đáp án: {current.word} {current.ipa}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          {!status ? (
            <Button onClick={check} disabled={!input.trim()}>
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={next}>
              {idx + 1 >= queue.length ? "Kết quả" : "Câu tiếp"} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
