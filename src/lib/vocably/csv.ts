import type { WordDraft } from "./types";

export function parseCSV(text: string): { validWords: WordDraft[]; errors: string[] } {
  if (!text || !text.trim()) {
    return { validWords: [], errors: ["Tệp CSV trống hoặc không có nội dung."] };
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  const cleanText = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }

  if (rows.length < 2) {
    return {
      validWords: [],
      errors: ["Tệp CSV cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu."],
    };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim());
  const getIndex = (aliases: string[]) =>
    rawHeaders.findIndex((h) => aliases.some((a) => h.includes(a)));

  const wordIdx = getIndex(["word", "tu", "từ", "term"]);
  const meaningIdx = getIndex(["meaning", "nghia", "nghĩa", "definition"]);
  const ipaIdx = getIndex(["ipa", "phien am", "phiên âm", "pronounce"]);
  const posIdx = getIndex(["partofspeech", "pos", "loai tu", "loại từ", "type"]);
  const topicIdx = getIndex(["topic", "chu de", "chủ đề", "category"]);
  const exampleIdx = getIndex(["example", "vi du", "ví dụ", "sentence"]);
  const tagsIdx = getIndex(["tags", "the", "thẻ", "labels"]);

  if (wordIdx === -1 || meaningIdx === -1) {
    return {
      validWords: [],
      errors: ['Không tìm thấy cột bắt buộc: "word" (hoặc "từ") và "meaning" (hoặc "nghĩa").'],
    };
  }

  const validWords: WordDraft[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const word = row[wordIdx]?.trim();
    const meaning = row[meaningIdx]?.trim();
    if (!word || !meaning) {
      errors.push(`Dòng ${r + 1}: Bỏ qua vì thiếu từ vựng hoặc nghĩa.`);
      continue;
    }
    const topic = topicIdx !== -1 && row[topicIdx] ? row[topicIdx].trim() : "General";
    const rawTags = tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].trim() : "";
    const tags = rawTags
      ? rawTags.split(/[,;|]/).map((t) => t.trim()).filter(Boolean)
      : [topic];

    validWords.push({
      word,
      ipa: ipaIdx !== -1 && row[ipaIdx] ? row[ipaIdx].trim() : "",
      meaning,
      partOfSpeech: posIdx !== -1 && row[posIdx] ? row[posIdx].trim() : "n",
      topic,
      example: exampleIdx !== -1 && row[exampleIdx] ? row[exampleIdx].trim() : "",
      tags,
    });
  }

  return { validWords, errors };
}

export function exportToCSV(words: Array<WordDraft & { status?: string }>, filename = "vocably-words.csv") {
  if (!words || words.length === 0) return;

  const headers = ["word", "ipa", "meaning", "partOfSpeech", "topic", "example", "tags", "status"];
  const escapeCell = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const rows = words.map((w) => [
    escapeCell(w.word),
    escapeCell(w.ipa || ""),
    escapeCell(w.meaning || ""),
    escapeCell(w.partOfSpeech || ""),
    escapeCell(w.topic || ""),
    escapeCell(w.example || ""),
    escapeCell(Array.isArray(w.tags) ? w.tags.join("; ") : w.tags || ""),
    escapeCell(w.status || "new"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTemplate() {
  exportToCSV(
    [
      {
        word: "negotiate",
        ipa: "/nɪˈɡoʊ.ʃi.eɪt/",
        meaning: "đàm phán, thương lượng",
        partOfSpeech: "v",
        topic: "Business",
        example: "We need to negotiate a new contract with the supplier.",
        tags: ["toeic", "contracts"],
        status: "new",
      },
      {
        word: "warranty",
        ipa: "/ˈwɔːr.ən.ti/",
        meaning: "bảo hành, giấy cam kết",
        partOfSpeech: "n",
        topic: "Customer Service",
        example: "The computer comes with a two-year warranty covering all parts.",
        tags: ["toeic", "shopping"],
        status: "new",
      },
      {
        word: "reimburse",
        ipa: "/ˌriː.ɪmˈbɜːrs/",
        meaning: "hoàn tiền, bồi hoàn chi phí",
        partOfSpeech: "v",
        topic: "Finance",
        example: "The company will reimburse travel expenses within 30 days.",
        tags: ["toeic", "finance"],
        status: "new",
      },
    ],
    "vocably-template.csv",
  );
}
