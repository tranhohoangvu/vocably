import { create } from "zustand";
import type { AuthUser, StoredAccount, UserRole } from "./types";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "./types";
import { ACCOUNTS_KEY, SESSION_KEY, writeClientSession } from "./session";
import { useStreakStore } from "./settings-store";

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
    if (!u.role) u.role = u.email === DEFAULT_ADMIN_EMAIL ? "admin" : "user";
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

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
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
  setUserRole: (email: string, role: UserRole) => { success: boolean; error?: string };
  deleteAccount: (email: string) => { success: boolean; error?: string };
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

  hydrate: async () => {
    await ensureDefaultAdmin();
    const user = readSession();
    set({ user, isAuthenticated: !!user });
    useStreakStore.getState().loadStreak(user?.email);
  },

  login: async (email, password) => {
    await ensureDefaultAdmin();
    const key = email.trim().toLowerCase();
    if (!key || !password) {
      return { success: false, error: "Vui lòng nhập email và mật khẩu." };
    }
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
    await ensureDefaultAdmin();
    const key = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: "Vui lòng nhập tên hiển thị." };
    if (!key.includes("@")) return { success: false, error: "Email không hợp lệ." };
    if (!password || password.length < 6) {
      return { success: false, error: "Mật khẩu tối thiểu 6 ký tự." };
    }
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
    writeSession(null);
    set({ user: null, isAuthenticated: false });
    useStreakStore.getState().loadStreak(null);
  },

  updateProfile: (data) => {
    set((state) => {
      if (!state.user || state.user.isGuest) return state;
      const updated = { ...state.user, ...data, isGuest: false, role: state.user.role };
      writeSession(updated);
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

  setUserRole: (email, role) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = email.toLowerCase();
    if (key === me.email.toLowerCase() && role !== "admin") {
      return { success: false, error: "Không thể tự hạ quyền admin của chính bạn." };
    }
    const map = readAccounts();
    if (!map[key]) return { success: false, error: "Không tìm thấy tài khoản." };
    map[key] = { ...map[key], role };
    writeAccounts(map);
    return { success: true };
  },

  deleteAccount: (email) => {
    const me = get().user;
    if (!me || me.role !== "admin") return { success: false, error: "Không có quyền." };
    const key = email.toLowerCase();
    if (key === me.email.toLowerCase()) {
      return { success: false, error: "Không thể xóa chính tài khoản đang đăng nhập." };
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
    const map = readAccounts();
    if (!map[key]) return { success: false, error: "Không tìm thấy tài khoản." };
    if (key === me.email.toLowerCase() && data.role && data.role !== "admin") {
      return { success: false, error: "Không thể tự hạ quyền admin của chính bạn." };
    }
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
