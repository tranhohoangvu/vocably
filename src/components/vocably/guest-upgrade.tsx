import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { DEMO_WORD_LIMIT, useIsGuest } from "@/lib/vocably/access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GuestUpgradeBanner({ className }: { className?: string }) {
  const isGuest = useIsGuest();
  if (!isGuest) return null;
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-hard/30 bg-hard/10 px-4 py-3 text-sm text-hard",
        className,
      )}
    >
      <span className="inline-flex items-start gap-2">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Demo: {DEMO_WORD_LIMIT} từ. Tạo tài khoản để mở khóa kho TOEIC đầy đủ — không sửa được từ hệ thống.
      </span>
      <Link to="/settings" className="font-medium underline underline-offset-2">
        Tạo tài khoản
      </Link>
    </div>
  );
}

export function GuestUpgradeForm() {
  const isGuest = useIsGuest();
  const convertGuest = useAuthStore((s) => s.convertGuest);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetScore, setTargetScore] = useState(850);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  if (!isGuest) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await convertGuest(name, email, password, targetScore);
      if (!res.success) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setMessage({ type: "success", text: "Đã tạo tài khoản. Đang mở khóa kho từ…" });
      setTimeout(() => navigate({ to: "/dashboard", replace: true }), 400);
    } catch {
      setMessage({ type: "error", text: "Không tạo được tài khoản. Thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-medium">Tạo tài khoản từ bản demo</h2>
        <p className="mt-1 text-sm text-muted">
          Giữ nguyên tiến độ học trên thiết bị này. Từ hệ thống (seed) vẫn chỉ admin mới sửa/xóa được.
        </p>
      </div>
      {message && (
        <p className={cn("text-sm", message.type === "error" ? "text-again" : "text-known")}>
          {message.text}
        </p>
      )}
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="upgrade-name">Tên hiển thị</Label>
          <Input
            id="upgrade-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upgrade-score">Mục tiêu TOEIC</Label>
          <Input
            id="upgrade-score"
            type="number"
            min={10}
            max={990}
            step={5}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value) || 850)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upgrade-email">Email</Label>
          <Input
            id="upgrade-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@email.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upgrade-password">Mật khẩu</Label>
          <Input
            id="upgrade-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo…" : "Tạo tài khoản"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
