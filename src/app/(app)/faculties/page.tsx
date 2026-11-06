import Link from "next/link";
import { FACULTIES, FACULTY_KEYS, KINDS, UNI_KEYS, type FacultyKey, type Kind } from "@/lib/constants";
import { insights, items, latestRun } from "@/lib/queries";
import { Card, Empty, ItemRow, PageHeader, SectionTitle, UniBadge } from "@/components/ui";
import InsightCard from "@/components/insight-card";

export default async function Faculties({ searchParams }: PageProps<"/faculties">) {
  const sp = await searchParams;
  const f = (FACULTY_KEYS.includes(sp.f as FacultyKey) ? sp.f : "digital_media") as FacultyKey;
  const [run, rows, ins] = await Promise.all([latestRun(), items({ faculty: f }), insights()]);
  const kinds = Object.keys(KINDS) as Kind[];
  const related = ins.filter((i) => i.faculty === f && i.status !== "dismissed");
  return (
    <>
      <PageHeader title="มุมมองรายคณะ" sub="เทียบ 4 คู่แข่งกับ SPU ในคณะเดียวกัน" />
      <div className="flex flex-wrap gap-1.5 mb-6">
        {FACULTY_KEYS.map((k) => (
          <Link key={k} href={`/faculties?f=${k}`}
            className={`rounded-full px-3 py-1.5 text-sm border ${k === f ? "bg-ink text-white border-ink" : "border-line bg-surface text-muted hover:text-ink"}`}>
            {FACULTIES[k]}
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-4">{FACULTIES[f]}</h2>
      <Card className="p-4 overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-xs text-muted"><th className="text-left font-medium pb-2">มหาวิทยาลัย</th>{kinds.map((k) => <th key={k} className="font-medium pb-2">{KINDS[k]}</th>)}</tr></thead>
          <tbody>
            {UNI_KEYS.map((u) => (
              <tr key={u} className="border-t border-line text-center num">
                <td className="py-2 text-left"><UniBadge uni={u} link /></td>
                {kinds.map((k) => { const n = rows.filter((r) => r.uni === u && r.kind === k).length; return <td key={k} className={n ? "" : "text-faint"}>{n || "–"}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {related.length > 0 && (
        <section className="mb-8">
          <SectionTitle title="Insight สำหรับคณะนี้" />
          <div className="space-y-3">{related.map((i) => <InsightCard key={i.id} ins={i} />)}</div>
        </section>
      )}
      <div className="grid lg:grid-cols-2 gap-6">
        {kinds.map((k) => {
          const list = rows.filter((r) => r.kind === k);
          return (
            <section key={k}>
              <SectionTitle title={KINDS[k]} sub={`${list.length} รายการ`} />
              <Card className="px-4">
                {list.length === 0 ? <div className="py-4"><Empty>ยังไม่พบข้อมูลของคณะนี้</Empty></div> :
                  <ul className="divide-y divide-line">{list.map((it) => <ItemRow key={it.id} it={it} latest={run?.week_of} />)}</ul>}
              </Card>
            </section>
          );
        })}
      </div>
    </>
  );
}
