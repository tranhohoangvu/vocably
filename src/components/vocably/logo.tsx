import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-primary-fg",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 7.5C5 5.5 7 4 12 4s7 1.5 7 3.5v9c0 2-2 3.5-7 3.5s-7-1.5-7-3.5v-9Z" />
        <path d="M5 12c0 2 2 3.5 7 3.5s7-1.5 7-3.5" />
        <path d="M5 7.5C5 9.5 7 11 12 11s7-1.5 7-3.5" />
      </svg>
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">Vocably</span>
        {!compact && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            TOEIC FSRS
          </span>
        )}
      </div>
    </div>
  );
}
