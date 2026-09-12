import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { WaitHydrated } from "@/components/vocably/boot";
import { AppShell } from "@/components/vocably/app-shell";
import { useAuthStore } from "@/lib/vocably/auth-store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // After VocablyBoot hydrate; if still not logged in, go to login
    if (!isAuthenticated) {
      const t = window.setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) {
          navigate({ to: "/login", replace: true });
        }
      }, 80);
      return () => window.clearTimeout(t);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
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
