import Link from "next/link";
import { COMPETITORS, FACULTIES, FOCUS_FACULTIES, THEMES, UNIS, UNI_KEYS, label } from "@/lib/constants";
import { addDays, daysUntil, fmtDate, fmtLong, fmtRange, todayISO } from "@/lib/format";
import { countsByUniFaculty, countsByUniKind, insights, latestRun, openScholarships, themeMix, upcoming } from "@/lib/queries";
import { Card, Empty, FacultyTag, PageHeader, SectionTitle, Stat, UniBadge, uniColor } from "@/components/ui";
import InsightCard from "@/components/insight-card";

export default async function Executive() {
  const run = await latestRun();
  if (!run) return <Empty>ยังไม่มีข้อมูล ให้รัน <code>pnpm ingest</code> ก่อน</Empty>;
  const today = todayISO();
  const [ins, kinds, facs, schol, events, themes] = await Promise.all([
    insights(run.week_of), countsByUniKind(), countsByUniFaculty(), openScholarships(today),
    upcoming(today, addDays(today, 90)), themeMix(),
  ]);
  const freshCompetitor = kinds.filter((k) => k.uni !== "spu").reduce((a, k) => a + k.fresh, 0);
  const openHigh = ins.filter((i) => i.priority === "high" && i.status !== "done" && i.status !== "dismissed").length;
  const compSchol = schol.filter((s) => s.uni !== "spu");
  const facMax = Math.max(1, ...facs.filter((f) => f.faculty !== "all").map((f) => f.n));
  const facN = (u: string, f: string) => facs.find((x) => x.uni === u && x.faculty === f)?.n ?? 0;

  const themeKeys = Object.keys(THEMES);
  const themeRows = UNI_KEYS.map((u) => {
    const rows = themes.filter((t) => t.uni === u);
    const total = rows.reduce((a, r) => a + r.n, 0);
    return { u, total, parts: themeKeys.map((k) => ({ k, n: rows.find((r) => r.theme === k)?.n ?? 0 })) };
  });
  const themeColors: Record<string, string> = {
    career: "#1f3fb8", tech_ai: "#0e7490", international: "#7a2fc4", price: "#c4500f",
    lifestyle: "#c0266d", industry_partner: "#0b7a57", creative: "#a16207", other: "#9aa1a9",
  };

  return (
    <>
      <PageHeader
        title="สรุปผู้บริหาร"
        sub={<>ข้อมูลรอบสัปดาห์ของ {fmtLong(run.week_of)} · มอนิเตอร์ {COMPETITORS.length} คู่แข่งเทียบกับศรีปทุม</>}
      />

      <div className="rounded-xl p-6 bg-ink text-white">
        <div className="text-xs uppercase tracking-wider text-white/50">ประเด็นหลักสัปดาห์นี้</div>
        <p className="mt-2 text-xl font-semibold leading-snug max-w-4xl">{run.headline}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/75 max-w-4xl">{run.summary}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="ความเคลื่อนไหวคู่แข่งที่พบใหม่" value={freshCompetitor} note="รายการที่เพิ่งเจอในรอบนี้" />
        <Stat label="ทุนคู่แข่งที่ยังเปิดรับ" value={compSchol.length} note={compSchol[0]?.end_date ? `ปิดเร็วสุด ${fmtDate(compSchol[0].end_date)}` : "เฉพาะที่ระบุวันปิด"} />
        <Stat label="กิจกรรม/บูธใน 90 วันข้างหน้า" value={events.length} note="ทุกมหาวิทยาลัย" />
        <Stat label="Action ด่วนที่ยังค้าง" value={<span className={openHigh ? "text-high" : ""}>{openHigh}</span>} note={<Link href="/actions" className="text-accent hover:underline">ดู Action Tracker</Link>} />
      </div>

      <section className="mt-10">
        <SectionTitle title="Insight และสิ่งที่ SPU ควรทำ" sub="เรียงตามความเร่งด่วน · เปลี่ยนสถานะได้จากมุมขวาของการ์ด" />
        <div className="space-y-3">{ins.map((i) => <InsightCard key={i.id} ins={i} />)}</div>
      </section>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <section>
          <SectionTitle title="ทุนที่กำลังเปิดรับ" sub="เรียงตามวันปิดรับ (เฉพาะทุนที่ระบุวัน)" right={<Link href="/scholarships" className="text-xs text-accent hover:underline">ดูทั้งหมด</Link>} />
          <Card className="divide-y divide-line">
            {schol.length === 0 && <div className="p-4"><Empty>ไม่มีทุนที่ระบุวันปิด</Empty></div>}
            {schol.map((s) => {
              const d = daysUntil(s.end_date!, today);
              return (
                <div key={s.id} className="p-3 flex items-start gap-3">
                  <div className="w-14 shrink-0 text-center">
                    <div className={`text-lg font-semibold num ${d <= 14 ? "text-high" : ""}`}>{d}</div>
                    <div className="text-[10px] text-faint -mt-1">วัน</div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 items-center"><UniBadge uni={s.uni} /><FacultyTag faculty={s.faculty} /></div>
                    <div className="text-sm font-medium mt-0.5">{s.title}</div>
                    <div className="text-xs text-muted">{s.value_text} · ปิด {fmtDate(s.end_date)}</div>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        <section>
          <SectionTitle title="กิจกรรมและบูธที่กำลังจะมาถึง" sub="90 วันข้างหน้า" right={<Link href="/events" className="text-xs text-accent hover:underline">ปฏิทินเต็ม</Link>} />
          <Card className="divide-y divide-line">
            {events.length === 0 && <div className="p-4"><Empty>ยังไม่พบกิจกรรมที่ระบุวันในช่วงนี้ ทีมภาคสนามช่วยเพิ่มได้ที่หน้า “กิจกรรม & บูธ”</Empty></div>}
            {events.map((e) => (
              <div key={e.id} className="p-3 flex items-start gap-3">
                <div className="w-14 shrink-0 text-xs text-muted pt-0.5">{fmtDate(e.start_date)}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 items-center"><UniBadge uni={e.uni} /><FacultyTag faculty={e.faculty} /></div>
                  <div className="text-sm font-medium mt-0.5">{e.title}</div>
                  <div className="text-xs text-muted">{fmtRange(e.start_date, e.end_date)}{e.location ? ` · ${e.location}` : ""}</div>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <section className="mt-10">
        <SectionTitle title="คู่แข่งลงแรงกับคณะไหน" sub="จำนวนทุน กิจกรรม ข้อความ PR และบูธที่พบ แยกตามคณะเป้าหมายของ SPU (สีเข้ม = มาก)" right={<Link href="/faculties" className="text-xs text-accent hover:underline">ดูรายคณะ</Link>} />
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-xs text-muted">
                <th className="text-left font-medium pb-2 pr-3">คณะ</th>
                {UNI_KEYS.map((u) => <th key={u} className="font-medium pb-2 px-1"><UniBadge uni={u} /></th>)}
              </tr>
            </thead>
            <tbody>
              {[...FOCUS_FACULTIES, "all" as const].map((f) => (
                <tr key={f} className="border-t border-line">
                  <td className="py-1.5 pr-3"><Link href={`/faculties?f=${f}`} className="hover:underline">{FACULTIES[f]}</Link></td>
                  {UNI_KEYS.map((u) => {
                    const n = facN(u, f);
                    const a = f === "all" ? 0.08 : Math.min(1, n / facMax);
                    return (
                      <td key={u} className="px-1 py-1">
                        <div className="h-8 rounded-md grid place-items-center text-xs font-medium num"
                          style={{ background: n ? `color-mix(in oklab, ${uniColor(u)} ${Math.round(12 + a * 70)}%, white)` : "var(--sunken)", color: a > 0.55 ? "white" : "var(--ink)" }}>
                          {n || "–"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <section>
          <SectionTitle title="ธีมข้อความ PR ของแต่ละมหาวิทยาลัย" sub="สัดส่วนจากข้อความ PR ที่พบ" right={<Link href="/messaging" className="text-xs text-accent hover:underline">Keyword</Link>} />
          <Card className="p-4 space-y-3">
            {themeRows.map((r) => (
              <div key={r.u} className="grid grid-cols-[110px_1fr_28px] items-center gap-3">
                <UniBadge uni={r.u} />
                <div className="flex h-4 rounded overflow-hidden bg-sunken gap-px">
                  {r.parts.filter((p) => p.n).map((p) => (
                    <div key={p.k} title={`${label(THEMES, p.k)}: ${p.n}`} style={{ width: `${(p.n / r.total) * 100}%`, background: themeColors[p.k] }} />
                  ))}
                </div>
                <span className="text-xs text-muted num text-right">{r.total}</span>
              </div>
            ))}
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-[11px] text-muted">
              {themeKeys.map((k) => (
                <span key={k} className="inline-flex items-center gap-1"><span className="size-2 rounded-sm" style={{ background: themeColors[k] }} />{THEMES[k]}</span>
              ))}
            </div>
          </Card>
        </section>
        <section>
          <SectionTitle title="ภาพรวมข้อมูลที่เก็บได้" sub="จำนวนรายการต่อประเภท" />
          <Card className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted"><th className="text-left font-medium pb-2">มหาวิทยาลัย</th><th className="font-medium pb-2">ทุน</th><th className="font-medium pb-2">กิจกรรม</th><th className="font-medium pb-2">PR</th><th className="font-medium pb-2">บูธ</th></tr></thead>
              <tbody>
                {UNI_KEYS.map((u) => {
                  const n = (k: string) => kinds.find((x) => x.uni === u && x.kind === k)?.n ?? 0;
                  return (
                    <tr key={u} className="border-t border-line text-center num">
                      <td className="py-2 text-left"><UniBadge uni={u} link /></td>
                      <td>{n("scholarship")}</td><td>{n("activity")}</td><td>{n("pr")}</td>
                      <td className={n("offline") === 0 ? "text-faint" : ""}>{n("offline")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">ข้อมูลบูธ offline ยังน้อย: ทีมที่ออกงานช่วยกรอก <Link href="/events#field" className="text-accent hover:underline">Field Intel</Link> ได้</p>
          </Card>
        </section>
      </div>
      <p className="mt-10 text-xs text-faint">ทุกตัวเลขมาจากข้อมูลสาธารณะที่ระบบค้นพบ ไม่ใช่ข้อมูลทั้งหมดของแต่ละมหาวิทยาลัย · {UNIS.spu.name}</p>
    </>
  );
}
