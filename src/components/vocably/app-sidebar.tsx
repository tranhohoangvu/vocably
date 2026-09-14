import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Settings,
  Flame,
  Brain,
  PenLine,
  Headphones,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreakStore } from "@/lib/vocably/settings-store";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { useVisibleWords, useVisibleDueWords, useIsGuest, useIsAdmin } from "@/lib/vocably/access";
import { Wordmark } from "./logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, section: "Tổng quan" },
  { to: "/words", label: "Kho từ vựng", icon: BookOpen, section: "Tổng quan" },
  { to: "/words/add", label: "Thêm từ mới", icon: PlusCircle, section: "Tổng quan" },
  { to: "/study", label: "Chế độ học", icon: GraduationCap, section: "Luyện tập" },
  { to: "/settings", label: "Cài đặt", icon: Settings, section: "Hệ thống" },
  { to: "/admin", label: "Quản trị", icon: Shield, section: "Hệ thống", adminOnly: true },
];

const STUDY_SUB = [
  { to: "/study/flashcard", label: "Flashcard", icon: BookOpen },
  { to: "/study/quiz", label: "Quiz", icon: Brain },
  { to: "/study/fill", label: "Điền từ", icon: PenLine },
  { to: "/study/spelling", label: "Chính tả", icon: Headphones },
];

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
  nested,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname === to || (to === "/study" && pathname.startsWith("/study"));
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-[background-color,color] duration-150",
        nested && "h-9 pl-3 text-[13px]",
        active ? "bg-primary/10 text-primary" : "text-muted hover:bg-bg-subtle hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            to === "/study" ? "bg-again/12 text-again" : "bg-bg-subtle text-muted",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { streak } = useStreakStore();
  const { user, logout } = useAuthStore();
  const words = useVisibleWords();
  const dueCount = useVisibleDueWords().length;
  const isGuest = useIsGuest();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inStudy = pathname.startsWith("/study");

  return (
    <aside className="flex h-full flex-col bg-surface">
      <div className="border-b border-border px-4 py-5">
        {/* Đổi link từ "/" thành "/dashboard" để giữ user ở lại trong App */}
        <Link to="/dashboard" onClick={onNavigate}>
          <Wordmark />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {["Tổng quan", "Luyện tập", "Hệ thống"].map((section) => (
          <div key={section} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">
              {section}
            </p>
            {NAV.filter((n) => n.section === section)
              .filter((n) => !(isGuest && n.to === "/words/add"))
              .filter((n) => !(n.adminOnly && !isAdmin))
              .map((n) => (
                <NavItem
                  key={n.to}
                  to={n.to}
                  label={n.label}
                  icon={n.icon}
                  badge={n.to === "/words" ? words.length : n.to === "/study" ? dueCount : undefined}
                  onNavigate={onNavigate}
                />
              ))}
            {section === "Luyện tập" && inStudy && (
              <div className="mt-1 ml-2 border-l border-border pl-2">
                {STUDY_SUB.map((s) => (
                  <NavItem key={s.to} {...s} nested onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-hard/10 px-3 py-2.5 text-sm font-medium text-hard">
          <Flame className="size-4" />
          <span className="tabular-nums">{streak} ngày liên tục</span>
        </div>
        {user && (
          <div className="space-y-2 rounded-[var(--radius-md)] bg-bg px-2.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">
                {user.avatar || user.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  Xin chào, {user.name}
                </div>
                <div className="truncate text-[11px] text-subtle">
                  {isGuest
                    ? "Tài khoản khách · demo 50 từ"
                    : user.role === "admin"
                      ? "Admin"
                      : user.email}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                logout();
                onNavigate?.();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="size-3.5" /> Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}