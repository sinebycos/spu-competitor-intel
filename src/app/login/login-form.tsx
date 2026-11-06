"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">ชื่อผู้ใช้</span>
        <input name="username" autoComplete="username" required autoFocus
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">รหัสผ่าน</span>
        <input name="password" type="password" autoComplete="current-password" required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft" />
      </label>
      {state?.error && <p role="alert" className="text-sm text-high">{state.error}</p>}
      <button disabled={pending}
        className="w-full rounded-lg bg-accent text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
