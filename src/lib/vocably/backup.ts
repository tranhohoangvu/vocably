import { getDb } from "./database";
import { useWordStore } from "./word-store";
import { useStreakStore, useSettingsStore } from "./settings-store";
import type { VocabWord, StudySession, SettingEntry } from "./types";

export type BackupData = {
  version: string;
  exportedAt: string;
  words: VocabWord[];
  studySessions: StudySession[];
  settings: SettingEntry[];
  streakData?: Record<string, unknown>;
};

export async function exportFullBackup(userEmail?: string): Promise<void> {
  const db = getDb();
  const words = await db.words.toArray();
  const studySessions = await db.studySessions.toArray();
  const settings = await db.settings.toArray();

  const streakKey = userEmail
    ? `vocably_streak_${userEmail.trim().toLowerCase()}`
    : "vocably_streak";
  let streakData: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem(streakKey) || localStorage.getItem("vocably_streak");
    if (raw) streakData = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  const backup: BackupData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    words,
    studySessions,
    settings,
    streakData,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vocably-full-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importFullBackup(
  file: File,
  userEmail?: string,
): Promise<{ success: boolean; wordsCount: number; sessionsCount: number; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as Partial<BackupData>;

    if (!data.words || !Array.isArray(data.words)) {
      return { success: false, wordsCount: 0, sessionsCount: 0, error: "File sao lưu không đúng cấu trúc (thiếu danh sách từ vựng)." };
    }

    const db = getDb();

    // Khôi phục từ vựng: xóa và nạp lại toàn bộ
    await db.words.clear();
    await db.words.bulkAdd(data.words);

    // Khôi phục phiên học
    let sessionsCount = 0;
    if (Array.isArray(data.studySessions) && data.studySessions.length > 0) {
      await db.studySessions.clear();
      await db.studySessions.bulkAdd(data.studySessions);
      sessionsCount = data.studySessions.length;
    }

    // Khôi phục cài đặt
    if (Array.isArray(data.settings) && data.settings.length > 0) {
      await db.settings.clear();
      await db.settings.bulkAdd(data.settings);
    }

    // Khôi phục streak nếu có
    if (data.streakData && typeof data.streakData === "object") {
      const streakKey = userEmail
        ? `vocably_streak_${userEmail.trim().toLowerCase()}`
        : "vocably_streak";
      localStorage.setItem(streakKey, JSON.stringify(data.streakData));
    }

    // Nạp lại state trong ứng dụng
    await useWordStore.getState().fetchWords();
    await useSettingsStore.getState().loadSettings();
    useStreakStore.getState().loadStreak(userEmail);

    return {
      success: true,
      wordsCount: data.words.length,
      sessionsCount,
    };
  } catch (err) {
    return {
      success: false,
      wordsCount: 0,
      sessionsCount: 0,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi đọc file sao lưu.",
    };
  }
}
