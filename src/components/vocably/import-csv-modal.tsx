import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseCSV, downloadTemplate } from "@/lib/vocably/csv";
import { useWordStore } from "@/lib/vocably/word-store";
import { useIsGuest } from "@/lib/vocably/access";
import type { WordDraft } from "@/lib/vocably/types";
import { cn } from "@/lib/utils";

const COLUMNS = ["word", "ipa", "meaning", "partOfSpeech", "topic", "example", "tags"];

export function ImportCsvModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importWords = useWordStore((s) => s.importWords);
  const isGuest = useIsGuest();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ validWords: WordDraft[]; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const reset = () => {
    setFile(null);
    setParsed(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (fileObj?: File) => {
    if (!fileObj) return;
    if (!fileObj.name.toLowerCase().endsWith(".csv") && fileObj.type !== "text/csv") return;
    setFile(fileObj);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setParsed(parseCSV(String(e.target?.result ?? "")));
    reader.readAsText(fileObj, "utf-8");
  };

  const confirm = async () => {
    if (isGuest) return;
    if (!parsed?.validWords.length) return;
    setImporting(true);
    try {
      setResult(await importWords(parsed.validWords));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent title="Nhập danh sách từ vựng CSV">
        <div className="space-y-4 p-5">
          <div className="rounded-[var(--radius-lg)] bg-bg p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Cột được hỗ trợ
              </span>
              <Button variant="secondary" size="sm" type="button" onClick={downloadTemplate}>
                <Download className="size-3.5" /> Tải mẫu
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {COLUMNS.map((col) => (
                <Badge key={col} tone={col === "word" || col === "meaning" ? "primary" : "muted"} className="font-mono">
                  {col}
                  {(col === "word" || col === "meaning") && " *"}
                </Badge>
              ))}
            </div>
          </div>

          {result ? (
            <div className="rounded-[var(--radius-lg)] bg-known/8 px-5 py-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-known" />
              <h3 className="mt-3 font-display text-xl font-medium">Nhập thành công</h3>
              <p className="mt-2 text-sm text-muted">
                Đã thêm <strong className="text-known">{result.added}</strong> từ mới.
                {result.skipped > 0 && <> Bỏ qua {result.skipped} từ trùng.</>}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button variant="secondary" onClick={reset}>
                  Nhập tệp khác
                </Button>
                <Button onClick={() => onOpenChange(false)}>Xem kho từ</Button>
              </div>
            </div>
          ) : !file ? (
            <div
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-[var(--radius-xl)] border border-dashed border-border px-5 py-10 text-center",
                dragActive && "border-primary bg-primary/5",
              )}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <span className="flex size-12 items-center justify-center rounded-full bg-bg-subtle text-primary">
                <Upload className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">Kéo thả file CSV hoặc bấm để chọn</p>
              <p className="mt-1 text-xs text-subtle">Excel, Google Sheets, Anki · UTF-8</p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span className="truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-subtle">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Đổi file
                </Button>
              </div>
              {parsed && parsed.errors.length > 0 && (
                <div className="mb-3 flex gap-2 rounded-[var(--radius-md)] bg-hard/10 p-3 text-sm text-hard">
                  <AlertTriangle className="size-4 shrink-0" />
                  <ul className="space-y-0.5">
                    {parsed.errors.slice(0, 3).map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed && parsed.validWords.length > 0 && (
                <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bg text-xs uppercase tracking-wider text-subtle">
                      <tr>
                        <th className="px-3 py-2">Từ</th>
                        <th className="px-3 py-2">Nghĩa</th>
                        <th className="px-3 py-2">Chủ đề</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.validWords.slice(0, 5).map((w) => (
                        <tr key={w.word} className="border-t border-border">
                          <td className="px-3 py-2 font-medium">{w.word}</td>
                          <td className="px-3 py-2 text-muted">{w.meaning}</td>
                          <td className="px-3 py-2">{w.topic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        {!result && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={confirm} disabled={!parsed?.validWords.length || importing}>
              {importing ? "Đang nạp…" : `Nhập ${parsed?.validWords.length ?? 0} từ`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
