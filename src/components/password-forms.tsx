"use client";
import { useActionState } from "react";
import { changeOwnPassword, createUser, resetPassword } from "@/app/actions";

const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";
const Msg = ({ s, ok }: { s: { error: string | null; ok: boolean } | null; ok: string }) =>
  s?.ok ? <span className="text-sm text-good">{ok}</span> : s?.error ? <span className="text-sm text-high">{s.error}</span> : null;

export function CreateUserForm() {
  const [s, action, pending] = useActionState(createUser, null);
  return (
    <form action={action} className="grid sm:grid-cols-2 gap-3">
      <label className="text-xs text-muted">ชื่อผู้ใช้ (ใช้ login)<input name="username" required className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted">ชื่อที่แสดง<input name="display_name" className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted">รหัสผ่านเริ่มต้น (8 ตัวขึ้นไป)<input name="password" type="text" required minLength={8} autoComplete="new-password" className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted">สิทธิ์
        <select name="role" className={`${input} mt-1`}><option value="viewer">ผู้ดู</option><option value="admin">ผู้ดูแล</option></select>
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-60">สร้างผู้ใช้</button>
        <Msg s={s} ok="สร้างแล้ว" />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const [s, action, pending] = useActionState(resetPassword, null);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input name="password" placeholder="รหัสผ่านใหม่" minLength={8} required autoComplete="new-password" className="rounded-md border border-line px-2 py-1 text-xs w-32" />
      <button disabled={pending} className="text-xs text-accent hover:underline">ตั้งใหม่</button>
      <Msg s={s} ok="✓" />
    </form>
  );
}

export function ChangePasswordForm() {
  const [s, action, pending] = useActionState(changeOwnPassword, null);
  return (
    <form action={action} className="space-y-3 max-w-sm">
      <label className="block text-xs text-muted">รหัสผ่านปัจจุบัน<input name="current" type="password" required autoComplete="current-password" className={`${input} mt-1`} /></label>
      <label className="block text-xs text-muted">รหัสผ่านใหม่ (8 ตัวขึ้นไป)<input name="next" type="password" required minLength={8} autoComplete="new-password" className={`${input} mt-1`} /></label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-60">เปลี่ยนรหัสผ่าน</button>
        <Msg s={s} ok="เปลี่ยนแล้ว" />
      </div>
    </form>
  );
}
