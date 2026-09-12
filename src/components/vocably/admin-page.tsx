import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Shield, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/lib/vocably/auth-store";
import { useIsAdmin } from "@/lib/vocably/access";
import type { StoredAccount, UserRole } from "@/lib/vocably/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormMode = "create" | "edit" | null;

export function AdminPage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const listAccounts = useAuthStore((s) => s.listAccounts);
  const createAccount = useAuthStore((s) => s.createAccount);
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const me = useAuthStore((s) => s.user);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [mode, setMode] = useState<FormMode>(null);
  const [editEmail, setEditEmail] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
    targetScore: 850,
  });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => {
    setAccounts(listAccounts());
  }, [listAccounts]);

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    refresh();
  }, [isAdmin, navigate, refresh]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Không có quyền truy cập…
      </div>
    );
  }

  const openCreate = () => {
    setMode("create");
    setEditEmail(null);
    setForm({ name: "", email: "", password: "", role: "user", targetScore: 850 });
    setMsg(null);
  };

  const openEdit = (a: StoredAccount) => {
    setMode("edit");
    setEditEmail(a.email);
    setForm({
      name: a.name,
      email: a.email,
      password: "",
      role: a.role,
      targetScore: a.targetScore,
    });
    setMsg(null);
  };

  const closeForm = () => {
    setMode(null);
    setEditEmail(null);
  };

  const submit = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (mode === "create") {
        const res = await createAccount({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          targetScore: form.targetScore,
        });
        if (!res.success) {
          setMsg({ type: "err", text: res.error || "Lỗi" });
        } else {
          setMsg({ type: "ok", text: `Đã tạo ${form.email}` });
          closeForm();
          refresh();
        }
      } else if (mode === "edit" && editEmail) {
        const res = await updateAccount(editEmail, {
          name: form.name,
          role: form.role,
          targetScore: form.targetScore,
          password: form.password || undefined,
        });
        if (!res.success) {
          setMsg({ type: "err", text: res.error || "Lỗi" });
        } else {
          setMsg({ type: "ok", text: `Đã cập nhật ${editEmail}` });
          closeForm();
          refresh();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (email: string) => {
    if (!confirm(`Xóa tài khoản ${email}?`)) return;
    const res = deleteAccount(email);
    setMsg(res.success ? { type: "ok", text: `Đã xóa ${email}` } : { type: "err", text: res.error || "Lỗi" });
    refresh();
  };

  return (
    <div className="rise-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Quản trị</h1>
          <p className="mt-1 text-sm text-muted">
            Quản lý tài khoản · {accounts.length} user
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Thêm user
        </Button>
      </div>

      {msg && (
        <p
          className={cn(
            "rounded-[var(--radius-md)] px-4 py-2 text-sm",
            msg.type === "ok" ? "bg-known/10 text-known" : "bg-again/10 text-again",
          )}
        >
          {msg.text}
        </p>
      )}

      {mode && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{mode === "create" ? "Thêm tài khoản" : `Sửa · ${editEmail}`}</h2>
            <Button variant="ghost" size="icon-sm" onClick={closeForm} aria-label="Đóng">
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tên hiển thị</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                disabled={mode === "edit"}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{mode === "create" ? "Mật khẩu" : "Mật khẩu mới (để trống nếu giữ nguyên)"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mục tiêu TOEIC</Label>
              <Input
                type="number"
                min={10}
                max={990}
                value={form.targetScore}
                onChange={(e) => setForm((f) => ({ ...f, targetScore: Number(e.target.value) || 850 }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vai trò</Label>
              <div className="flex gap-2">
                {(["user", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={cn(
                      "h-9 rounded-[var(--radius-sm)] px-4 text-sm font-medium",
                      form.role === r ? "bg-primary text-primary-fg" : "bg-bg text-muted",
                    )}
                  >
                    {r === "admin" ? "Admin" : "User"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeForm}>
              Hủy
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              {mode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-bg text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Người dùng</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Mục tiêu</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const isMe = me?.email.toLowerCase() === a.email.toLowerCase();
                return (
                  <tr key={a.email} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {a.avatar || a.name[0]}
                        </span>
                        <span className="font-medium">
                          {a.name}
                          {isMe && <span className="ml-1 text-xs text-subtle">(bạn)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{a.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={a.role === "admin" ? "primary" : "muted"}>
                        {a.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">{a.targetScore}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{a.joinedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>
                          <Pencil className="size-3.5" /> Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isMe}
                          className="text-again"
                          onClick={() => onDelete(a.email)}
                        >
                          <Trash2 className="size-3.5" /> Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Chưa có tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-subtle">
        <Shield className="mr-1 inline size-3.5" />
        Dữ liệu user lưu localStorage trên trình duyệt này.
      </p>
    </div>
  );
}
