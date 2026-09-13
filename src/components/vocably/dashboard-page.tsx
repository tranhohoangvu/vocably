import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Brain, CheckCircle2, FileEdit, Flame, Headphones, ArrowRight, TrendingUp } from "lucide-react";
import { useStreakStore } from "@/lib/vocably/settings-store";
import { useVisibleWords, useVisibleStats, useVisibleDueWords } from "@/lib/vocably/access";
import { GuestUpgradeBanner } from "./guest-upgrade";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeatmapCalendar, StreakWeekTrack } from "./heatmap";

const MODES = [
  { to: "/study/flashcard" as const, icon: BookOpen, t: "Flashcard", d: "Lật thẻ, nghe, chấm FSRS" },
  { to: "/study/quiz" as const, icon: Brain, t: "Quiz", d: "Trắc nghiệm Anh ↔ Việt" },
  { to: "/study/fill" as const, icon: FileEdit, t: "Điền từ", d: "Ngữ cảnh câu TOEIC" },
  { to: "/study/spelling" as const, icon: Headphones, t: "Chính tả", d: "Nghe và gõ lại" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const words = useVisibleWords();
  const stats = useVisibleStats();
  const dueWords = useVisibleDueWords();
  const { streak, studyHistory } = useStreakStore();
  const mastery = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;

  const topicBreakdown: Record<string, { total: number; known: number }> = {};
  words.forEach((w) => {
    if (!topicBreakdown[w.topic]) topicBreakdown[w.topic] = { total: 0, known: 0 };
    topicBreakdown[w.topic].total++;
    if (w.status === "known") topicBreakdown[w.topic].known++;
  });

  return (
    <div className="rise-in space-y-6">
      <GuestUpgradeBanner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">Chào buổi học.</h1>
          <p className="mt-1 text-muted">
            Hôm nay có{" "}
            <strong className={stats.dueToday > 0 ? "text-again" : "text-fg"}>{stats.dueToday}</strong> từ đến hạn FSRS
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/words" })}>
          <BookOpen className="size-4" /> Kho từ ({stats.total})
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-8 md:p-8">
          <Badge tone={dueWords.length ? "again" : "known"}>
            {dueWords.length ? "Cần ôn hôm nay" : "Đã xong hôm nay"}
          </Badge>
          {dueWords.length > 0 ? (
            <>
              <h2 className="mt-4 font-display text-2xl font-medium tracking-tight md:text-3xl">
                {dueWords.length} từ đang ở thời điểm vàng
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                FSRS cho rằng đây là lúc ôn để chuyển từ trí nhớ ngắn hạn sang dài hạn.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => navigate({ to: "/study/flashcard" })}>
                  <BookOpen className="size-4" /> Flashcard ({dueWords.length})
                </Button>
                <Button variant="secondary" onClick={() => navigate({ to: "/study/quiz" })}>
                  <Brain className="size-4" /> Quiz
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-4 flex items-center gap-2 font-display text-2xl font-medium">
                <CheckCircle2 className="size-6 text-known" /> Không còn thẻ tồn đọng
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">Bạn có thể luyện tự do hoặc thêm từ mới.</p>
              <Button className="mt-6" onClick={() => navigate({ to: "/study" })}>
                Luyện tập tự do
              </Button>
            </>
          )}
        </Card>

        <Card className="flex flex-col justify-between p-6 lg:col-span-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-hard">
              <Flame className="size-4" /> Chuỗi học
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-6xl font-medium tabular-nums tracking-tight text-hard">{streak}</span>
              <span className="text-sm text-muted">ngày</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted">
              <span>Tuần này</span>
              <span className="tabular-nums">{studyHistory.length} buổi</span>
            </div>
            <StreakWeekTrack studyHistory={studyHistory} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [stats.total, "Tổng kho từ"],
          [stats.dueToday, "Cần ôn hôm nay"],
          [stats.learning, "Đang học"],
          [`${stats.known}`, `Đã thuộc · ${mastery}%`],
        ].map(([v, l]) => (
          <Card key={String(l)} className="p-5">
            <div className="font-display text-3xl font-medium tabular-nums tracking-tight">{v}</div>
            <div className="mt-1 text-sm text-muted">{l}</div>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Chế độ học</h2>
          <Link to="/study" className="inline-flex items-center gap-1 text-sm text-primary">
            Tất cả <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m) => (
            <button
              key={m.to}
              type="button"
              onClick={() => navigate({ to: m.to })}
              className="paper-card p-5 text-left transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98]"
            >
              <m.icon className="size-5 text-primary" />
              <div className="mt-3 font-medium">{m.t}</div>
              <div className="mt-1 text-sm text-muted">{m.d}</div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium">
            <Flame className="size-4 text-primary" /> 365 ngày
          </h2>
          <span className="text-sm text-muted tabular-nums">{studyHistory.length} ngày hoạt động</span>
        </div>
        <HeatmapCalendar history={studyHistory} />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium">
            <TrendingUp className="size-4 text-primary" /> Thành thạo theo chủ đề
          </h2>
          <span className="text-sm text-muted">{Object.keys(topicBreakdown).length} chủ đề</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(topicBreakdown)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([topic, data]) => {
              const pct = data.total > 0 ? Math.round((data.known / data.total) * 100) : 0;
              return (
                <div key={topic} className="rounded-[var(--radius-md)] bg-bg px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{topic}</span>
                    <span className="tabular-nums text-muted">
                      {data.known}/{data.total}
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
