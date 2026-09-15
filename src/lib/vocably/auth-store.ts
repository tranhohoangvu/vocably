import { create } from "zustand";
import type { AuthUser, StoredAccount, UserRole } from "./types";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "./types";
import { ACCOUNTS_KEY, SESSION_KEY, writeClientSession } from "./session";
import { useStreakStore } from "./settings-store";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const DEFAULT_GUEST: AuthUser = {
  name: "Khách",
  email: "guest@vocably.local",
  targetScore: 850,
  avatar: "K",
  isGuest: true,
  role: "user",
  joinedDate: new Date().toISOString().slice(0, 10),
};

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const u = JSON.parse(saved) as AuthUser;
    if (!u || typeof u !== "object" || typeof u.email !== "string") return null;
    if (!u.role) u.role = u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
    return u;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  writeClientSession(user);
}

function readAccounts(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAccount>) : {};
  } catch {
    return {};
  }
}

function writeAccounts(map: Record<string, StoredAccount>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
}

function toPublicUser(acc: StoredAccount): AuthUser {
  const { passwordHash: _, ...rest } = acc;
  return { ...rest, isGuest: false };
}

async function ensureDefaultAdmin() {
  const map = readAccounts();
  const key = DEFAULT_ADMIN_EMAIL.toLowerCase();
  if (map[key]) return;
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  map[key] = {
    name: "Admin",
    email: DEFAULT_ADMIN_EMAIL,
    targetScore: 990,
    avatar: "A",
    isGuest: false,
    role: "admin",
    joinedDate: new Date().toISOString().slice(0, 10),
    passwordHash,
  };
  writeAccounts(map);
}

async function fetchSupabaseProfile(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCloudMode: boolean;
  hydrate: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: true; user: AuthUser } | { success: false; error: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    targetScore?: number,
  ) => Promise<{ success: true; user: AuthUser } | { success: false; error: string }>;
  convertGuest: (
    name: string,
    email: string,
    password: string,
    targetScore?: number,
  ) => Promise<{ success: true; user: AuthUser } | { success: false; error: string }>;
  loginGuest: () => AuthUser;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  listAccounts: () => StoredAccount[];
  fetchAccountsAsync: () => Promise<StoredAccount[]>;
  setUserRole: (email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (email: string) => Promise<{ success: boolean; error?: string }>;
  createAccount: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    targetScore?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  updateAccount: (
    email: string,
    data: {
      name?: string;
      role?: UserRole;
      targetScore?: number;
      password?: string;
    },
  ) => Promise<{ success: boolean; error?: string }>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCloudMode: isSupabaseConfigured(),

  hydrate: async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const u = data.session.user;
            const profile = await fetchSupabaseProfile(u.id);
            const isDefaultAdmin = u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
            const role: UserRole = (profile?.role || (isDefaultAdmin ? "admin" : "user")) as UserRole;
            const authUser: AuthUser = {
              id: u.id,
              name: profile?.name || u.user_metadata?.name || u.email?.split("@")[0] || "User",
              email: u.email || "",
              targetScore: profile?.target_score || u.user_metadata?.targetScore || 850,
              avatar: (profile?.name?.[0] || u.user_metadata?.name?.[0] || "U").toUpperCase(),
              isGuest: false,
              role,
              joinedDate: profile?.created_at?.slice(0, 10) || u.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            };
            writeSession(authUser);
            set({ user: authUser, isAuthenticated: true, isCloudMode: true });
            useStreakStore.getState().loadStreak(authUser.email);
            return;
          }
        } catch (err) {
          console.error("Supabase hydration error, falling back to local session:", err);
        }
      }
    }

    // Fallback: Local offline mode (hoặc tài khoản demo khách)
    await ensureDefaultAdmin();
    const user = readSession();
    set({ user, isAuthenticated: !!user, isCloudMode: isSupabaseConfigured() });
    useStreakStore.getState().loadStreak(user?.email);
  },

  login: async (email, password) => {
    const key = email.trim().toLowerCase();
    if (!key || !password) {
      return { success: false, error: "Vui lòng nhập email và mật khẩu." };
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: key,
            password,
          });
          if (error) {
            return { success: false, error: error.message };
          }
          if (data.user) {
            const u = data.user;
            const profile = await fetchSupabaseProfile(u.id);
            const isDefaultAdmin = u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
            const role: UserRole = (profile?.role || (isDefaultAdmin ? "admin" : "user")) as UserRole;
            const authUser: AuthUser = {
              id: u.id,
              name: profile?.name || u.user_metadata?.name || u.email?.split("@")[0] || "User",
              email: u.email || key,
              targetScore: profile?.target_score || u.user_metadata?.targetScore || 850,
              avatar: (profile?.name?.[0] || u.user_metadata?.name?.[0] || "U").toUpperCase(),
              isGuest: false,
              role,
              joinedDate: profile?.created_at?.slice(0, 10) || u.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            };
            writeSession(authUser);
            set({ user: authUser, isAuthenticated: true, isCloudMode: true });
            useStreakStore.getState().loadStreak(authUser.email);
            return { success: true, user: authUser };
          }
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Đăng nhập Supabase thất bại." };
        }
      }
    }

    // Fallback: Local offline mode
    await ensureDefaultAdmin();
    const map = readAccounts();
    const acc = map[key];
    if (!acc) {
      return {
        success: false,
        error: "Tài khoản chưa tồn tại. Hãy đăng ký trước.",
      };
    }
    const hash = await hashPassword(password);
    if (hash !== acc.passwordHash) {
      return { success: false, error: "Mật khẩu không đúng." };
    }
    const user = toPublicUser(acc);
    writeSession(user);
    set({ user, isAuthenticated: true });
    useStreakStore.getState().loadStreak(user.email);
    return { success: true, user };
  },

  signup: async (name, email, password, targetScore = 850) => {
    const key = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: "Vui lòng nhập tên hiển thị." };
    if (!key.includes("@")) return { success: false, error: "Email không hợp lệ." };
    if (!password || password.length < 6) {
      return { success: false, error: "Mật khẩu tối thiểu 6 ký tự." };
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const isInitialAdmin = key === DEFAULT_ADMIN_EMAIL.toLowerCase();
          const role: UserRole = isInitialAdmin ? "admin" : "user";
          const { data, error } = await supabase.auth.signUp({
            email: key,
            password,
            options: {
              data: {
                name: name.trim(),
                targetScore: Number(targetScore) || 850,
                role,
              },
            },
          });
          if (error) {
            return { success: false, error: error.message };
          }
          if (data.user) {
            const u = data.user;
            const authUser: AuthUser = {
              id: u.id,
              name: name.trim(),
              email: key,
              targetScore: Number(targetScore) || 850,
              avatar: (name.trim()[0] || "V").toUpperCase(),
              isGuest: false,
              role,
              joinedDate: new Date().toISOString().slice(0, 10),
            };
            writeSession(authUser);
            set({ user: authUser, isAuthenticated: true, isCloudMode: true });
            useStreakStore.getState().loadStreak(authUser.email);
            return { success: true, user: authUser };
          }
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Đăng ký Supabase thất bại." };
        }
      }
    }

    // Fallback: Local offline mode
    await ensureDefaultAdmin();
    const map = readAccounts();
    if (map[key]) {
      return { success: false, error: "Email đã được đăng ký. Hãy đăng nhập." };
    }
    const passwordHash = await hashPassword(password);
    const acc: StoredAccount = {
      name: name.trim(),
      email: email.trim(),
      targetScore: Number(targetScore) || 850,
      avatar: (name.trim()[0] || "V").toUpperCase(),
      isGuest: false,
      role: "user",
      joinedDate: new Date().toISOString().slice(0, 10),
      passwordHash,
    };
    map[key] = acc;
    writeAccounts(map);
    const user = toPublicUser(acc);
    writeSession(user);
    set({ user, isAuthenticated: true });
    useStreakStore.getState().loadStreak(user.email);
    return { success: true, user };
  },

  convertGuest: async (name, email, password, targetScore = 850) => {
    const me = get().user;
    if (!me?.isGuest) {
      return { success: false, error: "Chỉ tài khoản demo mới dùng được tính năng này." };
    }
    return get().signup(name, email, password, targetScore);
  },

  loginGuest: () => {
    const user = { ...DEFAULT_GUEST, joinedDate: new Date().toISOString().slice(0, 10) };
    writeSession(user);
    set({ user, isAuthenticated: true });
    useStreakStore.getState().loadStreak(user.email);
    return user;
  },

  logout: () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        void supabase.auth.signOut();
      }
    }
    writeSession(null);
    set({ user: null, isAuthenticated: false });
    useStreakStore.getState().loadStreak(null);
  },

  updateProfile: (data) => {
    set((state) => {
      if (!state.user || state.user.isGuest) return state;
      const updated = { ...state.user, ...data, isGuest: false, role: state.user.role };
      writeSession(updated);

      if (isSupabaseConfigured() && updated.id) {
        const supabase = getSupabase();
        if (supabase) {
          void supabase.from("profiles").update({
            name: updated.name,
            target_score: updated.targetScore,
            avatar: updated.avatar,
            updated_at: new Date().toISOString(),
          }).eq("id", updated.id);
        }
      }

      const map = readAccounts();
      const key = updated.email.toLowerCase();
      if (map[key]) {
        map[key] = { ...map[key], ...updated };
        writeAccounts(map);
      }
      return { user: updated };
    });
  },

  listAccounts: () => {
    const map = readAccounts();
    return Object.values(map).sort((a, b) => a.joinedDate.localeCompare(b.joinedDate));
  },

  fetchAccountsAsync: async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data } = await supabase.from("profiles").select("*");
          if (data && data.length > 0) {
            return data.map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              targetScore: p.target_score ?? 850,
              avatar: p.avatar ?? (p.name?.[0] || "U").toUpperCase(),
              isGuest: false,
              role: (p.role as UserRole) || "user",
              joinedDate: p.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              passwordHash: "",
            }));
          }
        } catch {
          /* ignore */
        }
      }
    }
    return get().listAccounts();
  },

  setUserRole: async (email, role) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = email.toLowerCase();
    if (key === me.email.toLowerCase() && role !== "admin") {
      return { success: false, error: "Không thể tự hạ quyền admin của chính bạn." };
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from("profiles").update({ role }).eq("email", key);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    }

    const map = readAccounts();
    if (!map[key]) return { success: false, error: "Không tìm thấy tài khoản." };
    map[key] = { ...map[key], role };
    writeAccounts(map);
    return { success: true };
  },

  deleteAccount: async (email) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = email.toLowerCase();
    if (key === me.email.toLowerCase()) {
      return { success: false, error: "Không thể xóa chính tài khoản đang đăng nhập." };
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from("profiles").delete().eq("email", key);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    }

    const map = readAccounts();
    if (!map[key]) return { success: false, error: "Không tìm thấy tài khoản." };
    delete map[key];
    writeAccounts(map);
    return { success: true };
  },

  createAccount: async (data) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = data.email.trim().toLowerCase();
    if (!data.name.trim()) return { success: false, error: "Thiếu tên." };
    if (!key.includes("@")) return { success: false, error: "Email không hợp lệ." };
    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Mật khẩu tối thiểu 6 ký tự." };
    }

    const map = readAccounts();
    if (map[key]) return { success: false, error: "Email đã tồn tại." };
    const passwordHash = await hashPassword(data.password);
    map[key] = {
      name: data.name.trim(),
      email: data.email.trim(),
      targetScore: data.targetScore ?? 850,
      avatar: (data.name.trim()[0] || "U").toUpperCase(),
      isGuest: false,
      role: data.role ?? "user",
      joinedDate: new Date().toISOString().slice(0, 10),
      passwordHash,
    };
    writeAccounts(map);
    return { success: true };
  },

  updateAccount: async (email, data) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = email.toLowerCase();
    if (key === me.email.toLowerCase() && data.role && data.role !== "admin") {
      return { success: false, error: "Không thể tự hạ quyền admin của chính bạn." };
    }
    const map = readAccounts();
    if (!map[key]) return { success: false, error: "Không tìm thấy tài khoản." };
    const next = { ...map[key] };
    if (data.name?.trim()) {
      next.name = data.name.trim();
      next.avatar = (data.name.trim()[0] || next.avatar).toUpperCase();
    }
    if (data.role) next.role = data.role;
    if (data.targetScore != null) next.targetScore = data.targetScore;
    if (data.password) {
      if (data.password.length < 6) return { success: false, error: "Mật khẩu tối thiểu 6 ký tự." };
      next.passwordHash = await hashPassword(data.password);
    }
    map[key] = next;
    writeAccounts(map);
    if (key === me.email.toLowerCase()) {
      const user = toPublicUser(next);
      writeSession(user);
      set({ user, isAuthenticated: true });
    }
    return { success: true };
  },
}));
