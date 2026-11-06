import Link from "next/link";
import { FACULTIES, FACULTY_KEYS, TCAS_ROUNDS, UNI_KEYS, label, type FacultyKey } from "@/lib/constants";
import { daysUntil, fmtRange, todayISO } from "@/lib/format";
import { items, latestRun } from "@/lib/queries";
import { Card, FacultyTag, PageHeader, SourceLink, Tag, UniBadge, uniColor } from "@/components/ui";

export default async function Scholarships({ searchParams }: PageProps<"/scholarships">) {
  const sp = await searchParams;
  const f = FACULTY_KEYS.includes(sp.f as FacultyKey) ? (sp.f as string) : undefined;
  const [run, rows] = await Promise.all([latestRun(), items({ kind: "scholarship", faculty: f })]);
  const today = todayISO();
  const full = (u: string) => rows.filter((r) => r.uni === u && (r.value_pct ?? 0) >= 100).length;
  return (
    <>
      <PageHeader title="ทุนการศึกษา" sub="ทุนและส่วนลดที่ใช้ดึงนักศึกษาใหม่ เทียบกับทุนของ SPU" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {UNI_KEYS.map((u) => (
          <Card key={u} className="p-4">
            <UniBadge uni={u} link />
            <div className="mt-2 text-2xl font-semibold num">{rows.filter((r) => r.uni === u).length}</div>
            <div className="text-xs text-muted">ทุนทั้งหมด · ทุน 100% <span className="text-ink num">{full(u)}</span></div>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Link href="/scholarships" className={`rounded-full px-3 py-1 text-sm border ${!f ? "bg-ink text-white border-ink" : "border-line bg-surface text-muted"}`}>ทุกคณะ</Link>
        {FACULTY_KEYS.map((k) => (
          <Link key={k} href={`/scholarships?f=${k}`} className={`rounded-full px-3 py-1 text-sm border ${k === f ? "bg-ink text-white border-ink" : "border-line bg-surface text-muted hover:text-ink"}`}>{FACULTIES[k]}</Link>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[880px]">
          <thead className="bg-sunken text-xs text-muted">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">มหาวิทยาลัย</th>
              <th className="text-left font-medium px-2 py-2.5">ทุน</th>
              <th className="text-left font-medium px-2 py-2.5">มูลค่า</th>
              <th className="text-left font-medium px-2 py-2.5">คณะ / รอบ</th>
              <th className="text-left font-medium px-2 py-2.5">ช่วงรับสมัคร</th>
              <th className="text-left font-medium px-4 py-2.5">แหล่งที่มา</th>
            </tr>
          </thead>
          <tbody>
            {rows.sort((a, b) => UNI_KEYS.indexOf(a.uni as never) - UNI_KEYS.indexOf(b.uni as never) || (b.value_pct ?? 0) - (a.value_pct ?? 0)).map((r) => {
              const open = r.end_date && r.end_date >= today;
              const closed = r.end_date && r.end_date < today;
              return (
                <tr key={r.id} className="border-t border-line align-top" style={r.uni === "spu" ? { background: "color-mix(in oklab, var(--accent-soft) 45%, white)" } : undefined}>
                  <td className="px-4 py-3"><span className="inline-block w-1 h-4 rounded mr-2 align-middle" style={{ background: uniColor(r.uni) }} /><UniBadge uni={r.uni} /></td>
                  <td className="px-2 py-3 max-w-[260px]">
                    <div className="font-medium">{r.title}</div>
                    {r.summary && <div className="text-xs text-muted mt-0.5 line-clamp-3">{r.summary}</div>}
                    {run && r.first_seen === run.week_of && r.uni !== "spu" && <span className="mt-1 inline-block"><Tag tone="accent">ใหม่</Tag></span>}
                  </td>
                  <td className="px-2 py-3 max-w-[200px]">
                    {r.value_pct != null && <div className="text-lg font-semibold num">{r.value_pct}%</div>}
                    <div className="text-xs text-muted">{r.value_text}</div>
                  </td>
                  <td className="px-2 py-3 space-y-1"><FacultyTag faculty={r.faculty} /><div className="text-xs text-muted">{label(TCAS_ROUNDS, r.tcas_round)}</div></td>
                  <td className="px-2 py-3 text-xs">
                    <div>{fmtRange(r.start_date, r.end_date)}</div>
                    {open && <div className="mt-1"><Tag tone={daysUntil(r.end_date!, today) <= 14 ? "high" : "good"}>เปิดอยู่ · อีก {daysUntil(r.end_date!, today)} วัน</Tag></div>}
                    {closed && <div className="mt-1"><Tag>ปิดแล้ว</Tag></div>}
                  </td>
                  <td className="px-4 py-3"><SourceLink url={r.source_url} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
