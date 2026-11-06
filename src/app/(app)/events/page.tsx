import { UNI_KEYS } from "@/lib/constants";
import { fmtMonth } from "@/lib/format";
import { activityByMonth, items, latestRun } from "@/lib/queries";
import { Card, Empty, ItemRow, PageHeader, SectionTitle, UniBadge, uniColor } from "@/components/ui";
import FieldForm from "@/components/field-form";

const MONTHS = Array.from({ length: 15 }, (_, i) => {
  const d = new Date(2026, i, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
});

export default async function Events() {
  const [run, act, off, byMonth] = await Promise.all([latestRun(), items({ kind: "activity" }), items({ kind: "offline" }), activityByMonth()]);
  const max = Math.max(1, ...byMonth.map((m) => m.n));
  const dated = [...act, ...off].filter((e) => e.start_date && e.start_date >= "2026-01-01").sort((a, b) => a.start_date!.localeCompare(b.start_date!));
  const undated = [...act, ...off].filter((e) => !e.start_date);
  return (
    <>
      <PageHeader title="กิจกรรม & บูธ" sub="Open House, ค่าย, การแข่งขัน, roadshow และบูธ offline ของทุกมหาวิทยาลัย" />
      <section className="mb-8">
        <SectionTitle title="ปฏิทินความเคลื่อนไหว ม.ค. 2569 – มี.ค. 2570" sub="จำนวนกิจกรรมและบูธที่ระบุวัน ต่อเดือน (ใช้ดูว่าคู่แข่งเร่งช่วงไหน)" />
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-xs min-w-[760px]">
            <thead><tr className="text-muted"><th className="text-left font-medium pb-2 w-28"></th>{MONTHS.map((m) => <th key={m} className="font-medium pb-2">{fmtMonth(m)}</th>)}</tr></thead>
            <tbody>
              {UNI_KEYS.map((u) => (
                <tr key={u}>
                  <td className="py-1 pr-2"><UniBadge uni={u} link /></td>
                  {MONTHS.map((m) => {
                    const n = byMonth.find((x) => x.uni === u && x.month === m)?.n ?? 0;
                    return <td key={m} className="p-0.5"><div className="h-7 rounded grid place-items-center num"
                      style={{ background: n ? `color-mix(in oklab, ${uniColor(u)} ${Math.round(20 + (n / max) * 70)}%, white)` : "var(--sunken)", color: n / max > 0.5 ? "white" : "var(--ink)" }}>{n || ""}</div></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-8">
          <section>
            <SectionTitle title="ไทม์ไลน์ (ปี 2569 ขึ้นไป)" sub={`${dated.length} รายการ`} />
            <Card className="px-4">{dated.length === 0 ? <div className="py-4"><Empty>ยังไม่มี</Empty></div> : <ul className="divide-y divide-line">{dated.map((it) => <ItemRow key={it.id} it={it} latest={run?.week_of} />)}</ul>}</Card>
          </section>
          <section>
            <SectionTitle title="ไม่ระบุวัน / ต่อเนื่อง" sub={`${undated.length} รายการ`} />
            <Card className="px-4">{undated.length === 0 ? <div className="py-4"><Empty>ไม่มี</Empty></div> : <ul className="divide-y divide-line">{undated.map((it) => <ItemRow key={it.id} it={it} latest={run?.week_of} />)}</ul>}</Card>
          </section>
        </div>
        <section id="field" className="lg:sticky lg:top-6">
          <Card className="p-5">
            <div className="text-base font-semibold">Field Intel</div>
            <p className="text-xs text-muted mt-1 mb-4">ไปออกงานแล้วเจอคู่แข่ง? บันทึกไว้ที่นี่ ข้อมูลจะเข้า dashboard ทันทีและใช้ในการวิเคราะห์รอบถัดไป</p>
            <FieldForm />
          </Card>
        </section>
      </div>
    </>
  );
}
