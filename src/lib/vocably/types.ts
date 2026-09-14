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
  /** true = từ seed hệ thống, user/demo không xóa/sửa nội dung */
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
  userEmail?: string;
  date: string;
  timestamp?: string;
  mode: "flashcard" | "quiz" | "fill" | "spelling" | string;
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

const envEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim();
const envPassword = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim();

export const DEFAULT_ADMIN_EMAIL = envEmail || "admin@vocably.app";
export const DEFAULT_ADMIN_PASSWORD = envPassword || "vocably-admin";

/** Fields that change the dictionary entry itself (not FSRS progress). */
export const CONTENT_KEYS = [
  "word",
  "ipa",
  "meaning",
  "partOfSpeech",
  "topic",
  "example",
  "tags",
  "isSeed",
] as const satisfies readonly (keyof VocabWord)[];

export const STUDY_KEYS = [
  "status",
  "nextReview",
  "stability",
  "difficulty",
  "elapsedDays",
  "scheduledDays",
  "reps",
  "lapses",
  "fsrsState",
  "lastReview",
] as const satisfies readonly (keyof VocabWord)[];
