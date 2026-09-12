import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech?: string;
  topic?: string;
  example?: string;
  flipped: boolean;
  compact?: boolean;
  className?: string;
};

export function FlashCard({
  word,
  ipa,
  meaning,
  partOfSpeech,
  topic,
  example,
  flipped,
  compact,
  className,
}: Props) {
  return (
    <div className={cn("flash-scene w-full", compact ? "h-72" : "aspect-[16/10] min-h-64", className)}>
      <div className={cn("flash-inner", flipped && "is-flipped")}>
        <div className="flash-face paper-card flex flex-col p-6 md:p-8">
          <div className="flex items-center justify-between">
            <Badge tone="muted">{topic || "TOEIC"}</Badge>
            {partOfSpeech && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {partOfSpeech}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="font-display text-4xl font-medium tracking-tight md:text-5xl">{word}</div>
            {ipa && <div className="mt-2 font-mono text-sm text-muted">{ipa}</div>}
          </div>
          <p className="text-center text-xs text-subtle">
            Chạm thẻ hoặc nhấn <span className="kbd">Space</span> để lật
          </p>
        </div>
        <div className="flash-face flash-back paper-card flex flex-col p-6 md:p-8">
          <div className="flex items-center justify-between">
            <Badge tone="primary">{topic || "TOEIC"}</Badge>
            {partOfSpeech && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {partOfSpeech}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">Nghĩa tiếng Việt</p>
            <div className="mt-2 font-display text-2xl font-medium tracking-tight md:text-3xl">{meaning}</div>
            {example && (
              <p className="mt-4 max-w-md rounded-[var(--radius-md)] bg-bg px-4 py-3 text-sm italic text-muted">
                “{example}”
              </p>
            )}
          </div>
          <p className="text-center text-xs text-subtle">
            Đánh giá bằng <span className="kbd">1</span>
            <span className="kbd ml-1">2</span>
            <span className="kbd ml-1">3</span>
            <span className="kbd ml-1">4</span>
          </p>
        </div>
      </div>
    </div>
  );
}
