import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "./logo";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, loginGuest } = useAuthStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [targetScore, setTargetScore] = useState(850);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const res = await signup(name, email, password, targetScore);
        if (!res.success) {
          setMessage({ type: "error", text: res.error });
          setLoading(false);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setMessage({ type: "error", text: res.error });
          setLoading(false);
          return;
        }
      }
      setMessage({ type: "success", text: "Thành công. Đang chuyển…" });
      setTimeout(() => navigate({ to: "/dashboard" }), 300);
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra, thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-5">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ChevronLeft className="size-4" /> Trang chủ
        </Link>
        <div className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-display font-semibold">Vocably</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16">
        <div className="paper-card p-6 md:p-8">
          <h1 className="font-display text-2xl font-medium tracking-tight">
            {mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "login"
              ? "Cần đăng ký trước nếu chưa có tài khoản."
              : "Tạo hồ sơ để mở khóa toàn bộ kho từ TOEIC."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-[var(--radius-md)] bg-bg p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={cn(
                  "h-9 rounded-[8px] text-sm font-medium transition-[background-color,color] duration-150",
                  mode === m ? "bg-surface text-fg shadow-border" : "text-muted",
                )}
                onClick={() => {
                  setMode(m);
                  setMessage(null);
                }}
              >
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          {message && (
            <p className={cn("mt-4 text-sm", message.type === "error" ? "text-again" : "text-known")}>
              {message.text}
            </p>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                    <Input
                      id="name"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="score">Mục tiêu TOEIC</Label>
                  <Input
                    id="score"
                    type="number"
                    min={10}
                    max={990}
                    step={5}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value) || 850)}
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Tối thiểu 6 ký tự" : "••••••••"}
                  required
                  minLength={mode === "signup" ? 6 : 1}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-fg"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-subtle">
            <span className="h-px flex-1 bg-border" />
            hoặc
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              loginGuest();
              navigate({ to: "/dashboard" });
            }}
          >
            Thử demo · 50 từ (khách)
          </Button>
          <p className="mt-4 text-center text-xs text-subtle">
            Tài khoản và dữ liệu lưu trên trình duyệt này.
          </p>
        </div>
      </main>
    </div>
  );
}
