import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Headphones, PenLine, Lock } from "lucide-react";
import { useSettingsStore } from "@/lib/vocably/settings-store";
import { useVisibleDueWords, useVisibleWords, useIsGuest, DEMO_WORD_LIMIT } from "@/lib/vocably/access";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MODES = [
  {
    to: "/study/flashcard" as const,
    icon: BookOpen,
    label: "Flashcard 3D",
    tag: "FSRS",
    desc: "Lật thẻ, phát âm, đánh giá bốn mức để xếp lịch ôn.",
    features: ["Lật 3D", "Phát âm", "Phím 1–4"],
  },
  {
    to: "/study/quiz" as const,
    icon: Brain,
    label: "Quiz trắc nghiệm",
    tag: "Recall",
    desc: "Bốn lựa chọn, đảo chiều Anh → Việt và ngược lại.",
    features: ["Hai chiều", "A–D", "Phản hồi tức thì"],
  },
  {
    to: "/study/fill" as const,
    icon: PenLine,
    label: "Điền từ vào câu",
    tag: "Context",
    desc: "Lắp từ vào câu TOEIC, gợi ý ký tự đầu khi cần.",
    features: ["Ngữ cảnh", "Gợi ý", "Enter kiểm tra"],
  },
  {
    to: "/study/spelling" as const,
    icon: Headphones,
    label: "Nghe viết chính tả",
    tag: "Listening",
    desc: "Nghe phát âm bản ngữ và gõ lại từng ký tự.",
    features: ["TTS", "Nghe lại", "Phản xạ gõ"],
  },
];

export function StudyHubPage() {
  const navigate = useNavigate();
  const dueWords = useVisibleDueWords();
  const words = useVisibleWords();
  const isGuest = useIsGuest();
  const sessionSize = useSettingsStore((s) => s.sessionSize);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div className="rise-in">
      {isGuest && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-hard/30 bg-hard/10 px-4 py-3 text-sm">
          <p className="text-hard">
            <Lock className="mr-1.5 inline size-4" />
            Chế độ demo: {DEMO_WORD_LIMIT} từ. Đăng nhập để mở khóa toàn bộ kho từ và nhập CSV.
          </p>
          <Button size="sm" variant="secondary" asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Phòng luyện tập</h1>
          <p className="mt-1 text-muted">
            {dueWords.length > 0 ? (
              <>
                <strong className="text-again">{dueWords.length}</strong> từ đến hạn hôm nay
              </>
            ) : (
              "Chọn chế độ phù hợp nhịp học của bạn"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Số từ / phiên</span>
          <div className="flex rounded-[var(--radius-md)] bg-surface p-1 shadow-border">
            {[10, 20, 30, 50].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSetting("sessionSize", sz)}
                className={cn(
                  "h-8 min-w-10 rounded-[8px] px-2 text-sm font-medium",
                  sessionSize === sz ? "bg-primary text-primary-fg" : "text-muted",
                )}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.to}
              type="button"
              onClick={() => navigate({ to: mode.to })}
              className="paper-card flex flex-col p-6 text-left transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full bg-bg px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {mode.tag}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-medium">{mode.label}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{mode.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {mode.features.map((f) => (
                  <span key={f} className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
                    {f}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted">
                  {dueWords.length > 0
                    ? `${dueWords.length} từ cần ôn`
                    : `${words.length} từ trong kho`}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  Bắt đầu <ArrowRight className="size-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
