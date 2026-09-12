import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, GraduationCap, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { LogoMark } from "./logo";
import { useVisibleDueWords } from "@/lib/vocably/access";

const TABS = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/study", label: "Học", icon: GraduationCap },
  { to: "/words", label: "Từ vựng", icon: BookOpen },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const due = useVisibleDueWords().length;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[var(--sidebar-width)] lg:border-r lg:border-border">
        <AppSidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-fg/30"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(280px,86vw)] shadow-lift">
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:hidden">
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <LogoMark className="size-8" />
          <span className="font-display text-base font-semibold">Vocably</span>
        </Link>
        <span className="w-9" />
      </header>

      <main className="min-h-dvh pb-24 lg:ml-[var(--sidebar-width)] lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = pathname === t.to || pathname.startsWith(t.to + "/");
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {t.label}
                {t.to === "/study" && due > 0 && (
                  <span className="absolute right-1/4 top-1.5 size-1.5 rounded-full bg-again" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
