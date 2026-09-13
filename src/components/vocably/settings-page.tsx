import { useState } from "react";
import { BookOpen, Database, Eye, Moon, Sun, Volume2 } from "lucide-react";
import { useSettingsStore, useStreakStore } from "@/lib/vocably/settings-store";
import { useVisibleStats, useIsGuest } from "@/lib/vocably/access";
import { GuestUpgradeForm } from "./guest-upgrade";
import { speak } from "@/lib/vocably/tts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { theme, ttsRate, sessionSize, showIpa, autoSpeak, setSetting } = useSettingsStore();
  const { streak } = useStreakStore();
  const stats = useVisibleStats();
  const isGuest = useIsGuest();
  const [testing, setTesting] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4 rise-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight">Cài đặt</h1>
        <p className="mt-1 text-sm text-muted">Giao diện, âm thanh và phiên học FSRS</p>
      </div>

      {isGuest && <GuestUpgradeForm />}

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          {theme === "dark" ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-primary" />}
          Giao diện
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Nền</div>
            <div className="text-sm text-muted">Sáng sạch là mặc định. Tối vẫn có nếu cần.</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={theme === "light" ? "default" : "secondary"} onClick={() => setSetting("theme", "light")}>
              <Sun className="size-4" /> Sáng
            </Button>
            <Button size="sm" variant={theme === "dark" ? "default" : "secondary"} onClick={() => setSetting("theme", "dark")}>
              <Moon className="size-4" /> Tối
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Volume2 className="size-4 text-primary" /> Phát âm
        </h2>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Tự động đọc thẻ mới</div>
            <div className="text-sm text-muted">Đọc khi sang từ tiếp theo</div>
          </div>
          <Switch checked={autoSpeak} onCheckedChange={(v) => setSetting("autoSpeak", v)} />
        </div>
        <div className="flex items-center justify-between">
          <LabelRate rate={ttsRate} />
          <Button
            variant="secondary"
            size="sm"
            disabled={testing}
            onClick={() => {
              setTesting(true);
              speak("Welcome to Vocably. Practice makes perfect.", "en-US", ttsRate);
              setTimeout(() => setTesting(false), 2000);
            }}
          >
            Nghe thử
          </Button>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={ttsRate}
          onChange={(e) => setSetting("ttsRate", parseFloat(e.target.value))}
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-subtle">
          <span>0.5×</span>
          <span>1.0×</span>
          <span>1.5×</span>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <BookOpen className="size-4 text-primary" /> Phiên học
        </h2>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Số từ mỗi phiên</div>
            <div className="text-sm text-muted">Flashcard và quiz</div>
          </div>
          <Badge tone="learning">{sessionSize} từ</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 30, 50].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSetting("sessionSize", n)}
              className={cn(
                "h-10 rounded-[var(--radius-sm)] text-sm font-medium",
                sessionSize === n ? "bg-primary text-primary-fg" : "bg-bg text-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Eye className="size-4 text-primary" /> Hiển thị
        </h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Phiên âm IPA</div>
            <div className="text-sm text-muted">Hiện dưới từ trên flashcard</div>
          </div>
          <Switch checked={showIpa} onCheckedChange={(v) => setSetting("showIpa", v)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Database className="size-4 text-primary" /> Dữ liệu nội bộ
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [`${stats.total}`, "Tổng từ"],
            [`${stats.known}`, "Đã thuộc"],
            [`${streak}`, "Streak"],
            ["Offline", "Lưu trữ"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-[var(--radius-md)] bg-bg px-3 py-3">
              <div className="text-xs text-subtle">{l}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Toàn bộ từ, lịch FSRS và streak nằm trong IndexedDB trên thiết bị này. Không gửi lên máy chủ.
        </p>
      </Card>
    </div>
  );
}

function LabelRate({ rate }: { rate: number }) {
  return (
    <span className="text-sm">
      Tốc độ đọc <strong className="text-primary">{rate}×</strong>
    </span>
  );
}
