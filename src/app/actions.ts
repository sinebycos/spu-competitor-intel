"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession, destroySession, requireAdmin, requireUser } from "@/lib/auth";
import { FACULTY_KEYS, UNI_KEYS } from "@/lib/constants";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const isoOrNull = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function login(_: unknown, form: FormData) {
  const username = str(form, "username").toLowerCase();
  const password = str(form, "password");
  if (!username || !password) return { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
  const rows = await sql<{ id: number; username: string; display_name: string; role: "admin" | "viewer"; password_hash: string }[]>`
    SELECT id, username, display_name, role, password_hash FROM users WHERE username = ${username}`;
  const u = rows[0];
  const ok = u ? await bcrypt.compare(password, u.password_hash) : await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!u || !ok) return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  await createSession({ uid: u.id, username: u.username, name: u.display_name, role: u.role });
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function setInsightStatus(form: FormData) {
  await requireUser();
  const id = Number(form.get("id"));
  const status = str(form, "status");
  if (!["open", "in_progress", "done", "dismissed"].includes(status)) return;
  await sql`UPDATE insights SET status = ${status} WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/actions");
}

export async function addFieldReport(_: unknown, form: FormData) {
  const s = await requireUser();
  const uni = str(form, "uni");
  const title = str(form, "title");
  const faculty = str(form, "faculty") || "all";
  if (!UNI_KEYS.includes(uni as never) || !title) return { error: "กรุณาเลือกมหาวิทยาลัยและใส่ชื่องาน", ok: false };
  if (!FACULTY_KEYS.includes(faculty as never)) return { error: "คณะไม่ถูกต้อง", ok: false };
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  await sql`INSERT INTO items (key, uni, kind, subtype, title, summary, faculty, start_date, location, province,
      source, created_by, first_seen, last_seen)
    VALUES (${`field|${uni}|${Date.now()}`}, ${uni}, 'offline', ${str(form, "event_type") || "other"}, ${title},
      ${str(form, "summary") || null}, ${faculty}, ${isoOrNull(str(form, "date"))}, ${str(form, "venue") || null},
      ${str(form, "province") || null}, 'field', ${s.name}, ${today}, ${today})`;
  revalidatePath("/events");
  revalidatePath("/feed");
  return { error: null, ok: true };
}

export async function createUser(_: unknown, form: FormData) {
  await requireAdmin();
  const username = str(form, "username").toLowerCase();
  const name = str(form, "display_name");
  const password = str(form, "password");
  const role = str(form, "role") === "admin" ? "admin" : "viewer";
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) return { error: "ชื่อผู้ใช้ต้องเป็น a-z, 0-9, . _ - ยาว 3–32 ตัว", ok: false };
  if (password.length < 8) return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร", ok: false };
  const hash = await bcrypt.hash(password, 10);
  const r = await sql`INSERT INTO users (username, password_hash, display_name, role)
    VALUES (${username}, ${hash}, ${name || username}, ${role}) ON CONFLICT (username) DO NOTHING RETURNING id`;
  if (!r.length) return { error: "มีชื่อผู้ใช้นี้แล้ว", ok: false };
  revalidatePath("/admin");
  return { error: null, ok: true };
}

export async function deleteUser(form: FormData) {
  const s = await requireAdmin();
  const id = Number(form.get("id"));
  if (id === s.uid) return;
  await sql`DELETE FROM users WHERE id = ${id}`;
  revalidatePath("/admin");
}

export async function resetPassword(_: unknown, form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const password = str(form, "password");
  if (password.length < 8) return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร", ok: false };
  await sql`UPDATE users SET password_hash = ${await bcrypt.hash(password, 10)} WHERE id = ${id}`;
  return { error: null, ok: true };
}

export async function changeOwnPassword(_: unknown, form: FormData) {
  const s = await requireUser();
  const current = str(form, "current");
  const next = str(form, "next");
  if (next.length < 8) return { error: "รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร", ok: false };
  const r = await sql<{ password_hash: string }[]>`SELECT password_hash FROM users WHERE id = ${s.uid}`;
  if (!r[0] || !(await bcrypt.compare(current, r[0].password_hash))) return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง", ok: false };
  await sql`UPDATE users SET password_hash = ${await bcrypt.hash(next, 10)} WHERE id = ${s.uid}`;
  return { error: null, ok: true };
}
