import { FACULTIES, KINDS, UNIS, UNI_KEYS } from "@/lib/constants";
import { items, latestRun } from "@/lib/queries";
import { Card, Empty, ItemRow, PageHeader } from "@/components/ui";

const pick = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

export default async function Feed({ searchParams }: PageProps<"/feed">) {
  const sp = await searchParams;
  const f = { uni: pick(sp.uni), kind: pick(sp.kind), faculty: pick(sp.faculty), q: pick(sp.q) };
  const [run, rows] = await Promise.all([latestRun(), items(f)]);
  const sel = "rounded-lg border border-line bg-surface px-3 py-2 text-sm";
  return (
    <>
      <PageHeader title="ข้อมูลทั้งหมด" sub="ทุกรายการที่ระบบเก็บได้ พร้อมลิงก์หลักฐาน" />
      <form className="flex flex-wrap gap-2 mb-4">
        <input name="q" defaultValue={f.q} placeholder="ค้นหาคำ เช่น AI, ทุน 100%" className={`${sel} flex-1 min-w-[200px]`} />
        <select name="uni" defaultValue={f.uni ?? ""} className={sel}><option value="">ทุกมหาวิทยาลัย</option>{UNI_KEYS.map((u) => <option key={u} value={u}>{UNIS[u].label}</option>)}</select>
        <select name="kind" defaultValue={f.kind ?? ""} className={sel}><option value="">ทุกประเภท</option>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="faculty" defaultValue={f.faculty ?? ""} className={sel}><option value="">ทุกคณะ</option>{Object.entries(FACULTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="rounded-lg bg-ink text-white px-4 py-2 text-sm">กรอง</button>
      </form>
      <div className="text-xs text-muted mb-2">{rows.length} รายการ</div>
      <Card className="px-4">
        {rows.length === 0 ? <div className="py-4"><Empty>ไม่พบรายการ</Empty></div> :
          <ul className="divide-y divide-line">{rows.map((it) => <ItemRow key={it.id} it={it} latest={run?.week_of} />)}</ul>}
      </Card>
    </>
  );
}
