import { useEffect, type ReactNode } from "react";
import { seedInitialData } from "@/lib/vocably/database";
import { useWordStore } from "@/lib/vocably/word-store";
import { useSettingsStore, useStreakStore } from "@/lib/vocably/settings-store";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { LogoMark } from "./logo";

function Splash({ error }: { error?: string | null }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg text-fg">
      <LogoMark className="size-12" />
      <p className="font-display text-xl font-medium tracking-tight">Vocably</p>
      <p className="text-sm text-muted">{error ?? "Đang chuẩn bị kho từ vựng…"}</p>
    </div>
  );
}

export function VocablyBoot({ children }: { children: ReactNode }) {
  const fetchWords = useWordStore((s) => s.fetchWords);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadStreak = useStreakStore((s) => s.loadStreak);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    let cancelled = false;
    (async () => {
      try {
        await loadSettings();
        await seedInitialData();
        await fetchWords();
        loadStreak();
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          useWordStore.setState({ hydrated: true, loading: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchWords, loadSettings, loadStreak, hydrateAuth]);

  return <>{children}</>;
}

export function WaitHydrated({ children }: { children: ReactNode }) {
  const hydrated = useWordStore((s) => s.hydrated);
  if (!hydrated) return <Splash />;
  return <>{children}</>;
}
