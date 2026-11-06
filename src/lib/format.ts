const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" });
const longFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
const monthFmt = new Intl.DateTimeFormat("th-TH", { month: "short", timeZone: "Asia/Bangkok" });

const parse = (iso: string) => new Date(`${iso}T00:00:00+07:00`);
export const fmtDate = (iso: string | null | undefined) => (iso ? dateFmt.format(parse(iso)) : "ไม่ระบุวัน");
export const fmtLong = (iso: string) => longFmt.format(parse(iso));
export const fmtMonth = (ym: string) => monthFmt.format(parse(`${ym}-01`));
export function fmtRange(a: string | null, b: string | null) {
  if (!a && !b) return "ไม่ระบุวัน";
  if (a && b && a !== b) return `${fmtDate(a)} – ${fmtDate(b)}`;
  if (!a && b) return `ถึง ${fmtDate(b)}`;
  return fmtDate(a ?? b);
}
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}
export function addDays(iso: string, n: number) {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d);
}
export function daysUntil(iso: string, from: string) {
  return Math.round((parse(iso).getTime() - parse(from).getTime()) / 86400000);
}
export function hostOf(url: string | null) {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}
