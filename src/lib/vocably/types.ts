export type WordStatus = "new" | "learning" | "review" | "known";

export type VocabWord = {
  id?: number;
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: string;
  topic: string;
  example: string;
  tags: string[];
  status: WordStatus;
  nextReview: string;
  createdAt: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  fsrsState: number;
  lastReview: string | null;
  /** true = từ seed hệ thống, user thường không xóa/sửa */
  isSeed?: boolean;
};

export type WordDraft = {
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: string;
  topic: string;
  example: string;
  tags: string[];
};

export type SettingEntry = { key: string; value: unknown };

export type StudySession = {
  id?: number;
  date: string;
  mode: string;
  wordsStudied: number;
  correct: number;
};

export type UserRole = "user" | "admin";

export type AuthUser = {
  name: string;
  email: string;
  targetScore: number;
  avatar: string;
  isGuest: boolean;
  role: UserRole;
  joinedDate: string;
};

/** Bản ghi tài khoản đã đăng ký (có mật khẩu hash). */
export type StoredAccount = AuthUser & {
  passwordHash: string;
};

export const TOPICS = [
  "Business",
  "Finance",
  "HR",
  "Travel",
  "Health",
  "Technology",
  "Logistics",
  "Marketing",
  "Sales",
  "Customer Service",
  "Real Estate",
  "Legal",
  "Management",
  "Events",
] as const;

export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "idiom",
] as const;

export const STATUS_LABELS: Record<WordStatus | "all", string> = {
  all: "Tất cả",
  new: "Mới",
  learning: "Đang học",
  review: "Cần ôn",
  known: "Đã thuộc",
};

export const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;
export const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;