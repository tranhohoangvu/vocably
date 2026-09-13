import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Download, Pencil, Plus, Search, Trash2, Upload, Volume2, X } from "lucide-react";
import { useWordStore } from "@/lib/vocably/word-store";
import { speak } from "@/lib/vocably/tts";
import { exportToCSV } from "@/lib/vocably/csv";
import { STATUS_LABELS, TOPICS, type WordStatus } from "@/lib/vocably/types";
import { useVisibleFilteredWords, useVisibleStats, useIsGuest, useIsAdmin, useAuthUser } from "@/lib/vocably/access";
import { canEditWordContent } from "@/lib/vocably/database";
import { GuestUpgradeBanner } from "./guest-upgrade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { ImportCsvModal } from "./import-csv-modal";
import { cn } from "@/lib/utils";

const PER_PAGE = 25;

export function WordListPage() {
  const navigate = useNavigate();
  const { deleteWord, filter, setFilter, getTopics } = useWordStore();
  const words = useVisibleFilteredWords();
  const stats = useVisibleStats();
  const isGuest = useIsGuest();
  const isAdmin = useIsAdmin();
  const user = useAuthUser();
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(words.length / PER_PAGE));
  const pageWords = words.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allTopics = ["all", ...new Set([...TOPICS, ...getTopics()])];

  return (
    <div className="rise-in">
      <GuestUpgradeBanner />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Kho từ vựng</h1>
          <p className="mt-1 text-sm text-muted">
            {words.length} / {stats.total} từ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={() => exportToCSV(words, `vocably-${new Date().toISOString().slice(0, 10)}.csv`)}>
              <Download className="size-4" /> Xuất CSV
            </Button>
          )}
          {!isGuest && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
                <Upload className="size-4" /> Nhập CSV
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/words/add" })}>
                <Plus className="size-4" /> Thêm từ
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "new", "learning", "review", "known"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter({ status: key });
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium",
                filter.status === key ? "bg-primary text-primary-fg" : "bg-bg text-muted",
              )}
            >
              {STATUS_LABELS[key]}{" "}
              <span className="opacity-70">
                ({key === "all" ? stats.total : stats[key as WordStatus]})
              </span>
            </button>
          ))}
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              className="pl-9"
              placeholder="Tìm từ, nghĩa…"
              value={filter.search}
              onChange={(e) => {
                setFilter({ search: e.target.value });
                setPage(1);
              }}
            />
            {filter.search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-subtle"
                onClick={() => setFilter({ search: "" })}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <select
            className="h-11 rounded-[var(--radius-md)] bg-bg px-3 text-sm shadow-border outline-none"
            value={filter.topic}
            onChange={(e) => {
              setFilter({ topic: e.target.value });
              setPage(1);
            }}
          >
            {allTopics.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "Tất cả chủ đề" : t}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {pageWords.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-xl">Không có từ nào</p>
            <p className="mt-1 text-sm text-muted">Đổi bộ lọc hoặc thêm từ mới.</p>
            {!isGuest && (
            <Button className="mt-4" onClick={() => navigate({ to: "/words/add" })}>
              <Plus className="size-4" /> Thêm từ
            </Button>
            )}
          </div>
        ) : (
          <ul>
            {pageWords.map((w) => {
              const open = expanded === w.id;
              return (
                <li key={w.id} className="border-b border-border last:border-0">
                  <div
                    className="flex cursor-pointer flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-4"
                    onClick={() => setExpanded(open ? null : (w.id ?? null))}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(w.word);
                        }}
                      >
                        <Volume2 className="size-4 text-primary" />
                      </Button>
                      <div className="min-w-0">
                        <div className="font-medium">{w.word}</div>
                        {w.ipa && <div className="font-mono text-xs text-muted">{w.ipa}</div>}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      {w.meaning}
                      {w.partOfSpeech && (
                        <span className="ml-2 text-xs uppercase tracking-wider text-primary">{w.partOfSpeech}</span>
                      )}
                      {open && w.example && <p className="mt-2 italic text-muted">“{w.example}”</p>}
                    </div>
                    <div className="flex items-center gap-2 md:w-48">
                      <span className="truncate text-xs text-muted">{w.topic}</span>
                      <StatusBadge status={w.status} />
                    </div>
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {canEditWordContent(w, user) ? (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => navigate({ to: "/words/edit/$id", params: { id: String(w.id) } })}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-again"
                            onClick={() => {
                              if (!w.id) return;
                              if (!confirm(`Xóa từ “${w.word}”?`)) return;
                              void deleteWord(w.id).catch((err: unknown) => {
                                const msg = err instanceof Error ? err.message : "Không xóa được từ này.";
                                window.alert(msg);
                              });
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-subtle" title="Từ hệ thống — chỉ admin sửa/xóa">
                          {isGuest ? "Demo" : "Hệ thống"}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span className="tabular-nums">
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Tiếp
            </Button>
          </div>
        </div>
      )}

      <ImportCsvModal open={showImport} onOpenChange={setShowImport} />
    </div>
  );
}
