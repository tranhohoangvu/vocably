import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Volume2 } from "lucide-react";
import { useIsGuest, useAuthUser, canEditWordContent } from "@/lib/vocably/access";
import { useWordStore } from "@/lib/vocably/word-store";
import { speak } from "@/lib/vocably/tts";
import { getDb } from "@/lib/vocably/database";
import { PARTS_OF_SPEECH, TOPICS } from "@/lib/vocably/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FlashCard } from "./flash-card";

const EMPTY = {
  word: "",
  ipa: "",
  meaning: "",
  partOfSpeech: "noun",
  topic: "Business",
  example: "",
  tags: "",
};

export function WordEditor({ wordId }: { wordId?: number }) {
  const navigate = useNavigate();
  const isGuest = useIsGuest();
  const user = useAuthUser();
  const addWord = useWordStore((s) => s.addWord);
  const updateWord = useWordStore((s) => s.updateWord);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [locked, setLocked] = useState(false);
  const isEdit = !!wordId;

  useEffect(() => {
    if (isGuest) navigate({ to: "/words", replace: true });
  }, [isGuest, navigate]);

  useEffect(() => {
    if (!wordId || isGuest) return;
    void getDb()
      .words.get(wordId)
      .then((w) => {
        if (!w) return;
        if (!canEditWordContent(w, user)) {
          setLocked(true);
          return;
        }
        setForm({ ...w, tags: (w.tags || []).join(", ") });
      });
  }, [wordId, isGuest, user]);

  if (isGuest) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Đang chuyển về kho từ…
      </div>
    );
  }

  if (locked) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-muted">Từ hệ thống chỉ Admin mới được chỉnh sửa hoặc xóa.</p>
        <Button variant="secondary" onClick={() => navigate({ to: "/words" })}>
          <ArrowLeft className="size-4" /> Về kho từ
        </Button>
      </div>
    );
  }

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.word.trim() || !form.meaning.trim()) {
      setError("Nhập từ tiếng Anh và nghĩa tiếng Việt.");
      return;
    }
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (isEdit && wordId) await updateWord(wordId, { ...form, tags });
      else await addWord({ ...form, tags });
      navigate({ to: "/words" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/words" })}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            {isEdit ? "Sửa từ" : "Thêm từ mới"}
          </h1>
          <p className="text-sm text-muted">Lưu offline trong IndexedDB</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="text-sm text-again">{error}</p>}
            <div className="space-y-1.5">
              <Label>Từ tiếng Anh *</Label>
              <div className="flex gap-2">
                <Input value={form.word} onChange={set("word")} placeholder="negotiate" autoFocus />
                <Button type="button" variant="secondary" size="icon" onClick={() => speak(form.word || "negotiate")}>
                  <Volume2 className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>IPA</Label>
                <Input value={form.ipa} onChange={set("ipa")} placeholder="/nɪˈɡoʊʃieɪt/" />
              </div>
              <div className="space-y-1.5">
                <Label>Loại từ</Label>
                <select
                  className="h-11 w-full rounded-[var(--radius-md)] bg-bg px-3 text-sm shadow-border"
                  value={form.partOfSpeech}
                  onChange={set("partOfSpeech")}
                >
                  {PARTS_OF_SPEECH.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nghĩa tiếng Việt *</Label>
              <Input value={form.meaning} onChange={set("meaning")} placeholder="thương lượng, đàm phán" />
            </div>
            <div className="space-y-1.5">
              <Label>Chủ đề</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-md)] bg-bg px-3 text-sm shadow-border"
                value={form.topic}
                onChange={set("topic")}
              >
                {TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Câu ví dụ</Label>
              <Textarea value={form.example} onChange={set("example")} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Thẻ (phẩy)</Label>
              <Input value={form.tags} onChange={set("tags")} placeholder="contract, deal" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="size-4" /> {saving ? "Đang lưu…" : isEdit ? "Cập nhật" : "Thêm vào kho"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate({ to: "/words" })}>
                Hủy
              </Button>
            </div>
          </form>
        </Card>
        <div>
          <p className="mb-3 text-sm font-medium text-muted">Xem trước · chạm để lật</p>
          <button type="button" className="block w-full" onClick={() => setFlipped((f) => !f)}>
            <FlashCard
              word={form.word || "word"}
              ipa={form.ipa || "/wɜːrd/"}
              meaning={form.meaning || "Nghĩa tiếng Việt"}
              partOfSpeech={form.partOfSpeech}
              topic={form.topic}
              example={form.example}
              flipped={flipped}
              compact
            />
          </button>
        </div>
      </div>
    </div>
  );
}
