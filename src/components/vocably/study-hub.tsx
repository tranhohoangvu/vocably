import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Filter, Headphones, PenLine } from "lucide-react";
import { useSettingsStore } from "@/lib/vocably/settings-store";
import { useVisibleDueWords, useVisibleWords } from "@/lib/vocably/access";
import { useWordStore } from "@/lib/vocably/word-store";
import { TOPICS } from "@/lib/vocably/types";
import { cn } from "@/lib/utils";
import { GuestUpgradeBanner } from "./guest-upgrade";

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
  const getTopics = useWordStore((s) => s.getTopics);
  const sessionSize = useSettingsStore((s) => s.sessionSize);
  const studyTopic = useSettingsStore((s) => s.studyTopic);
  const studySource = useSettingsStore((s) => s.studySource);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const allTopics = ["all", ...new Set([...TOPICS, ...getTopics()])];
  const matchingPool = words.filter((w) => {
    const topicMatch = studyTopic === "all" || w.topic === studyTopic;
    if (!topicMatch) return false;
    if (studySource === "due") {
      const now = new Date();
      return w.status !== "known" && (!w.nextReview || new Date(w.nextReview) <= now);
    }
    if (studySource === "new") return w.status === "new";
    if (studySource === "learning") return w.status === "learning" || w.status === "review";
    return true;
  });

  return (
    <div className="rise-in">
      <GuestUpgradeBanner className="mb-6" />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Phòng luyện tập</h1>
          <p className="mt-1 text-muted">
            {dueWords.length > 0 ? (
              <>
                <strong className="text-again">{dueWords.length}</strong> từ đến hạn hôm nay · Chọn chế độ để bắt đầu
              </>
            ) : (
              "Chọn cấu hình và chế độ phù hợp nhịp học của bạn"
            )}
          </p>
        </div>
      </div>

      {/* Bộ lọc cá nhân hoá phiên học */}
      <div className="paper-card mb-6 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="size-4 text-primary" /> Tuỳ chỉnh phiên học
          </div>
          <span className="text-xs text-muted">
            Khả dụng: <strong className="text-primary">{matchingPool.length}</strong> từ
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Chủ đề (Topic)</label>
            <select
              value={studyTopic}
              onChange={(e) => setSetting("studyTopic", e.target.value)}
              className="h-9 w-full rounded-[var(--radius-md)] border border-border bg-bg px-2.5 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="all">Tất cả chủ đề</option>
              {allTopics
                .filter((t) => t !== "all")
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Nguồn từ vựng</label>
            <select
              value={studySource}
              onChange={(e) => setSetting("studySource", e.target.value as "due" | "all" | "new" | "learning")}
              className="h-9 w-full rounded-[var(--radius-md)] border border-border bg-bg px-2.5 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="all">Tất cả từ ({words.length})</option>
              <option value="due">Cần ôn FSRS hôm nay ({dueWords.length})</option>
              <option value="new">Từ mới chưa học ({words.filter((w) => w.status === "new").length})</option>
              <option value="learning">Đang học / Luyện tập ({words.filter((w) => w.status === "learning" || w.status === "review").length})</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Số từ / phiên</label>
            <div className="flex rounded-[var(--radius-md)] bg-bg p-0.5 shadow-border">
              {[10, 20, 30, 50].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSetting("sessionSize", sz)}
                  className={cn(
                    "h-8 flex-1 rounded-[6px] text-xs font-medium transition-colors",
                    sessionSize === sz ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
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
