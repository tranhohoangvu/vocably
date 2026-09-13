import { redirect } from "@tanstack/react-router";
import type { AuthUser } from "./types";
import { DEFAULT_ADMIN_EMAIL } from "./types";

export const SESSION_KEY = "vocably_auth_user";
export const ACCOUNTS_KEY = "vocably_accounts";

export function readClientSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const u = JSON.parse(saved) as AuthUser;
    if (!u || typeof u !== "object" || typeof u.email !== "string" || !u.email) {
      return null;
    }
    if (!u.role) {
      u.role = u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
    }
    return u;
  } catch {
    return null;
  }
}

export function writeClientSession(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

/** Landing + login: already signed in (user, admin, or demo) → app. No-op during SSR. */
export function bounceAuthedToApp(): void {
  if (typeof window === "undefined") return;
  if (readClientSession()) {
    throw redirect({ to: "/dashboard", replace: true });
  }
}

/** App shell: must have a session. Skip on SSR; AuthGate catches the client. */
export function requireSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const user = readClientSession();
  if (!user) throw redirect({ to: "/login", replace: true });
  return user;
}

/** Add / import: demo guests cannot mutate the word bank. */
export function requireRegisteredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const user = requireSession();
  if (!user) return null;
  if (user.isGuest) throw redirect({ to: "/words", replace: true });
  return user;
}

/** Admin console only. */
export function requireAdmin(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const user = requireSession();
  if (!user) return null;
  if (user.role !== "admin") throw redirect({ to: "/dashboard", replace: true });
  return user;
}
