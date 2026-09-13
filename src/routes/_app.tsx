import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { WaitHydrated } from "@/components/vocably/boot";
import { AppShell } from "@/components/vocably/app-shell";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { readClientSession, requireSession } from "@/lib/vocably/session";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    requireSession();
  },
  component: AppLayout,
});

function AuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const session = readClientSession();
  const hasSession = isAuthenticated || Boolean(session);

  useEffect(() => {
    if (!hasSession) {
      navigate({ to: "/login", replace: true });
    }
  }, [hasSession, navigate]);

  if (!hasSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">
        Đang kiểm tra phiên…
      </div>
    );
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <WaitHydrated>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </WaitHydrated>
  );
}
