import { useEffect, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Download,
  Headphones,
  PenLine,
  ShieldCheck,
  Volume2,
  RotateCw,
  Flame,
  Cpu,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wordmark } from "./logo";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { useSettingsStore } from "@/lib/vocably/settings-store";
import { AuthedBounce } from "./authed-bounce";
import { cn } from "@/lib/utils";

const DEMO = {
  word: "negotiate",
  ipa: "/nɪˈɡoʊ.ʃi.eɪt/",
  pos: "verb",
  meaning: "đàm phán, thương lượng hợp đồng",
  example: "The procurement team managed to negotiate a 15% discount with the supplier.",
  exampleVi: "Đội ngũ thu mua đã thương lượng thành công mức giảm giá 15% với nhà cung cấp.",
};

const FEEDBACK: Record<string, string> = {
  again: "Học lại sau 10 phút",
  hard: "Ôn tập sau 2 ngày",
  good: "Khoảng cách tối ưu: 5 ngày",
  easy: "Đã thuộc: ôn sau 14 ngày",
};

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loginGuest, logout } = useAuthStore();
  const theme = useSettingsStore((s) => s.theme);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [flipped, setFlipped] = useState(false);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const enterDemo = () => {
    if (!isAuthenticated) loginGuest();
    navigate({ to: "/dashboard", replace: true });
  };

  const goLogin = () => navigate({ to: "/login" });
  const goApp = () => navigate({ to: "/dashboard" });

  const speakDemo = (e: MouseEvent) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(DEMO.word);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Hàm xử lý cuộn trang mượt mà mà không làm thay đổi URL hash
  const scrollToId = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AuthedBounce>
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/70 backdrop-blur-xl transition-all">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <a href="#top" onClick={(e) => scrollToId(e, "top")} className="min-w-0 transition-transform hover:scale-105 active:scale-95">
            <Wordmark compact />
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#features" onClick={(e) => scrollToId(e, "features")} className="transition-colors hover:text-fg">Tính năng</a>
            <a href="#algorithm" onClick={(e) => scrollToId(e, "algorithm")} className="transition-colors hover:text-fg">FSRS</a>
            <a href="#modes" onClick={(e) => scrollToId(e, "modes")} className="transition-colors hover:text-fg">Chế độ học</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Đổi giao diện sáng/tối"
              title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
              onClick={() => setSetting("theme", theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {isAuthenticated && user && !user.isGuest ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted sm:inline">
                  Xin chào, <strong className="text-fg">{user.name}</strong>
                </span>
                <Button size="sm" className="rounded-full px-5" onClick={goApp}>
                  Vào học
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { logout(); navigate({ to: "/" }); }}>
                  Đăng xuất
                </Button>
              </div>
            ) : isAuthenticated && user?.isGuest ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-full" onClick={goApp}>
                  Tiếp tục demo
                </Button>
                <Button size="sm" className="rounded-full px-5" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden rounded-full sm:flex" onClick={enterDemo}>
                  Thử demo
                </Button>
                <Button size="sm" className="rounded-full px-5" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <section id="top" className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 py-20 md:grid-cols-2 md:px-8 md:py-32">
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[min(800px,100vw)] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="rise-in">
          <Badge tone="primary" className="border border-primary/20 bg-primary/10 px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 inline size-3" /> FSRS-4.5 · Offline-first
          </Badge>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.15] tracking-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-br from-fg to-muted bg-clip-text text-transparent">Nhớ từ TOEIC đúng lúc</span> <br className="hidden md:block" />bạn sắp quên.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Vocably lập lịch ôn bằng FSRS — thuật toán lặp lại ngắt quãng thế hệ mới.
            15 phút mỗi ngày, 500 từ cốt lõi, dữ liệu chỉ nằm trên máy bạn.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 text-base shadow-lift transition-transform hover:-translate-y-0.5" onClick={goLogin}>
              Bắt đầu miễn phí
              <ArrowRight className="ml-1 size-4.5" />
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-8 text-base transition-transform hover:-translate-y-0.5" onClick={enterDemo}>
              Thử demo 50 từ
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-primary" /> Mã nguồn mở
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-primary" /> Lưu trên máy bạn
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4.5 text-primary" /> Chuẩn ETS
            </span>
          </div>
        </div>

        <div id="demo" className="rise-in rise-in-2 relative">
          <div className="absolute inset-0 -z-10 scale-95 rounded-[3rem] bg-gradient-to-br from-primary/20 to-transparent opacity-50 blur-2xl" />

          <div className="mb-4 flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wider text-subtle">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Trải nghiệm thẻ 3D
            </span>
            <span>Mô phỏng FSRS</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className="flash-scene block w-full cursor-pointer text-left transition-transform hover:scale-[1.02]"
            style={{ height: 400 }}
          >
            <div className={cn("flash-inner", flipped && "is-flipped")}>
              <div className="flash-face paper-card flex flex-col border border-border/50 p-8 shadow-lift">
                <div className="flex items-center gap-2">
                  <Badge tone="muted">{DEMO.pos}</Badge>
                  <Badge tone="primary">TOEIC 750+</Badge>
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-auto flex size-10 items-center justify-center rounded-full bg-bg text-primary transition-colors hover:bg-primary/10"
                    onClick={speakDemo}
                  >
                    <Volume2 className="size-4.5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="bg-gradient-to-br from-fg to-fg/80 bg-clip-text font-display text-5xl font-semibold tracking-tight text-transparent">{DEMO.word}</div>
                  <div className="mt-3 font-mono text-sm font-medium text-muted/80">{DEMO.ipa}</div>
                  <p className="mt-8 max-w-sm text-sm italic leading-relaxed text-muted">“{DEMO.example}”</p>
                </div>
                <p className="flex items-center justify-center gap-2 text-xs font-medium text-subtle">
                  <RotateCw className="size-3.5" /> Nhấn để xem nghĩa
                </p>
              </div>
              <div className="flash-face flash-back paper-card flex flex-col border border-border/50 p-8 shadow-lift" onClick={(e) => e.stopPropagation()}>
                <Badge tone="primary" className="self-start">Mặt sau</Badge>
                <div className="mt-8 text-center">
                  <div className="font-display text-3xl font-semibold">{DEMO.meaning}</div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{DEMO.exampleVi}</p>
                </div>
                <div className="mt-auto">
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-subtle">Đánh giá độ nhớ</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      [
                        ["again", "1 · Quên"],
                        ["hard", "2 · Khó"],
                        ["good", "3 · Nhớ"],
                        ["easy", "4 · Dễ"],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        className="rounded-xl border border-border/50 bg-surface px-2 py-2.5 text-xs font-semibold text-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-fg"
                        onClick={() => setDemoFeedback(FEEDBACK[k])}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 h-5 text-center text-xs font-semibold text-primary">
                    {demoFeedback && <span className="animate-in fade-in slide-in-from-bottom-1">{demoFeedback}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="metrics" className="relative border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            ["500+", "Từ TOEIC cốt lõi", "Tuyển từ ngân hàng ETS"],
            ["92%", "Ghi nhớ sau 30 ngày", "So với 18% học vẹt"],
            ["4", "Chế độ luyện phản xạ", "Thẻ, quiz, điền từ, chính tả"],
            ["0 ms", "Độ trễ mạng", "IndexedDB trên máy bạn"],
          ].map(([n, l, d]) => (
            <div key={l} className="bg-surface px-8 py-10 transition-colors hover:bg-bg-subtle/30">
              <div className="font-display text-4xl font-semibold tabular-nums tracking-tight text-primary">{n}</div>
              <div className="mt-2 text-sm font-semibold">{l}</div>
              <div className="mt-1 text-xs text-muted">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Tối ưu bộ nhớ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Khoa học nhận thức, giao diện tĩnh lặng.
          </h2>
        </div>

        <div id="algorithm" className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="paper-card group border border-border/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift md:col-span-2">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-fg">
              <Cpu className="size-6" />
            </span>
            <h3 className="mt-6 font-display text-2xl font-semibold">FSRS-4.5 thay vì học vẹt</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Tính độ ổn định và độ khó của từng thẻ, rồi đặt lịch ôn ngay trước lúc quên.
              Again · Hard · Good · Easy — bốn mức, một thuật toán.
            </p>
            <div className="mt-8 space-y-5 rounded-2xl bg-bg p-5 border border-border/50">
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium text-muted">
                  <span>Học truyền thống</span>
                  <span>18%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-bg-subtle">
                  <div className="h-full w-[18%] rounded-full bg-subtle" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span>Vocably FSRS</span>
                  <span className="font-bold text-primary">92%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-bg-subtle">
                  <div className="h-full w-[92%] rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.4)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="paper-card group flex flex-col border border-border/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-fg">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="mt-6 font-display text-xl font-semibold">100% trên máy bạn</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Không tài khoản đám mây, không quảng cáo. Học mượt mà ngay cả khi mất mạng. Dữ liệu thuộc về bạn.
            </p>
          </div>

          <div className="paper-card group flex flex-col border border-border/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-fg">
              <Download className="size-6" />
            </span>
            <h3 className="mt-6 font-display text-xl font-semibold">CSV Anki / Excel</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">Nhập xuất UTF-8 dễ dàng. Tự động giữ nguyên tiến độ FSRS khi phát hiện từ vựng bị trùng lặp.</p>
          </div>

          <div className="paper-card group border border-border/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-hard/10 text-hard transition-transform group-hover:scale-110 group-hover:bg-hard group-hover:text-surface">
                  <Flame className="size-6" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold">Bản đồ streak 365 ngày</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">Nhịp học hiện ra như heatmap — đủ để giữ thói quen, không đủ để gây áp lực ồn ào.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5 md:mt-0 md:justify-end md:w-1/2">
                {Array.from({ length: 42 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-3.5 rounded-[3px] transition-colors duration-500",
                      i % 4 === 0 ? "bg-primary" : i % 3 === 0 ? "bg-primary/60" : i % 5 === 0 ? "bg-primary/30" : "bg-bg-subtle",
                      "group-hover:opacity-90"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modes" className="border-y border-border bg-surface py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Bốn chế độ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Từ thụ động thành phản xạ.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              { icon: BookOpen, n: "01", t: "Flashcard 3D", d: "Lật thẻ, nghe US, chấm 1–4. Phím Space để lật, R để phát âm lại." },
              { icon: Brain, n: "02", t: "Quiz trắc nghiệm", d: "Kiểm tra Anh ↔ Việt hai chiều với phím A–D. Mô phỏng bẫy Part 5–6." },
              { icon: PenLine, n: "03", t: "Điền từ ngữ cảnh", d: "Câu ví dụ TOEIC chuẩn. Có hỗ trợ gợi ý ký tự, Enter để nộp bài." },
              { icon: Headphones, n: "04", t: "Nghe chính tả", d: "Sử dụng Web Speech API, gõ lại từng ký tự — luyện tai Part 1–2." },
            ].map((m) => (
              <div key={m.n} className="group flex gap-5 rounded-3xl bg-bg p-6 border border-border/40 transition-all hover:border-primary/30 hover:shadow-border-hover">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-border transition-transform group-hover:scale-105">
                  <m.icon className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary/50">{m.n}</span>
                    <h3 className="font-display text-xl font-semibold">{m.t}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{m.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">Lộ trình</p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight">Mục tiêu điểm của bạn?</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["550+", "Nền tảng", "Văn phòng, thông báo, email thường gặp."],
            ["750+", "Bứt phá", "Đàm phán, ngân sách, chuỗi cung ứng."],
            ["850+", "Làm chủ", "Báo cáo tài chính, nhân sự cấp cao.", true],
            ["990", "Bản lĩnh", "Phản xạ tức thì trước bẫy Part 7."],
          ].map(([band, title, desc, featured]) => (
            <div
              key={String(band)}
              className={cn(
                "rounded-[2rem] p-8 transition-transform hover:-translate-y-1",
                featured ? "bg-primary text-primary-fg shadow-lift scale-105 z-10" : "paper-card border border-border/50"
              )}
            >
              <div className="font-display text-3xl font-bold">{band}</div>
              <div className="mt-2 text-base font-semibold">{title}</div>
              <p className={cn("mt-3 text-sm leading-relaxed", featured ? "text-primary-fg/80" : "text-muted")}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8">
        <div className="relative overflow-hidden mx-auto max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-primary to-[#134436] px-6 py-20 text-center text-primary-fg shadow-lift md:px-16">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-black/20 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Bắt đầu 15 phút hôm nay.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-primary-fg/80">
              Không thẻ tín dụng. Không quảng cáo. Toàn bộ tính năng hoạt động mượt mà trên trình duyệt của bạn.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-surface px-8 text-base font-semibold text-primary hover:bg-surface/90 hover:scale-105 transition-all"
                onClick={enterDemo}
              >
                Trải nghiệm ngay
                <ArrowRight className="ml-1 size-5" />
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-8 text-base font-medium text-primary-fg hover:bg-white/10" asChild>
                <Link to="/login">Đăng nhập lưu dữ liệu</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:justify-between md:px-8">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Ôn từ TOEIC với FSRS-4.5. Offline, riêng tư, mã nguồn mở. Được thiết kế để tối ưu hóa thời gian học tập của bạn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-fg">Ứng dụng</p>
              <button className="text-left text-muted transition-colors hover:text-primary" onClick={enterDemo}>Dashboard</button>
              <Link to="/study" className="text-muted transition-colors hover:text-primary">Phòng học</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-fg">Khoa học</p>
              <a href="#algorithm" onClick={(e) => scrollToId(e, "algorithm")} className="text-muted transition-colors hover:text-primary">FSRS-4.5</a>
              <a href="#modes" onClick={(e) => scrollToId(e, "modes")} className="text-muted transition-colors hover:text-primary">Chế độ học</a>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-fg">Tài khoản</p>
              <Link to="/login" className="text-muted transition-colors hover:text-primary">Đăng nhập</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border px-4 py-6 text-xs font-medium text-subtle md:flex-row md:justify-between md:px-8">
          <span>© 2026 Vocably. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Local-first · Privacy focused
          </span>
        </div>
      </footer>
    </div>
    </AuthedBounce>
  );
}