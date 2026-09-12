import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SessionComplete({
  title,
  subtitle,
  percent,
  percentLabel,
  breakdown,
  onRestart,
  onBack,
}: {
  title: string;
  subtitle: string;
  percent: number;
  percentLabel: string;
  breakdown?: { label: string; value: number; tone: string }[];
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="p-8 text-center md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Phiên hoàn tất</p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mx-auto mt-8 max-w-xs rounded-[var(--radius-lg)] bg-bg px-6 py-5">
          <div className="text-xs font-medium uppercase tracking-wider text-subtle">{percentLabel}</div>
          <div className="mt-1 font-display text-5xl font-medium tabular-nums tracking-tight text-primary">
            {percent}%
          </div>
        </div>
        {breakdown && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {breakdown.map((b) => (
              <div key={b.label} className="rounded-[var(--radius-md)] bg-bg px-3 py-3">
                <div className="text-xl font-semibold tabular-nums" style={{ color: `var(--color-${b.tone})` }}>
                  {b.value}
                </div>
                <div className="text-xs text-muted">{b.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button onClick={onRestart}>
            <RotateCcw className="size-4" />
            Luyện thêm
          </Button>
          <Button variant="secondary" onClick={onBack}>
            Về phòng học
          </Button>
        </div>
      </Card>
    </div>
  );
}
