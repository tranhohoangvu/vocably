import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { readClientSession } from "@/lib/vocably/session";
import { LogoMark } from "./logo";

/** Client-side belt for landing/login: never show public pages to a signed-in session. */
export function AuthedBounce({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const session = mounted ? readClientSession() : null;
  const authed = mounted && (isAuthenticated || Boolean(session));

  useEffect(() => {
    if (authed) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [authed, navigate]);

  if (authed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg text-fg">
        <LogoMark className="size-10" />
        <p className="text-sm text-muted">Đang vào Vocably…</p>
      </div>
    );
  }

  return <>{children}</>;
}
