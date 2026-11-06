import { STATUS } from "@/lib/constants";
import { fmtLong } from "@/lib/format";
import { insights } from "@/lib/queries";
import { Empty, PageHeader, SectionTitle } from "@/components/ui";
import InsightCard from "@/components/insight-card";

export default async function Actions() {
  const all = await insights();
  const groups = Object.keys(STATUS).map((s) => ({ s, rows: all.filter((i) => i.status === s) }));
  return (
    <>
      <PageHeader title="Action Tracker" sub="ติดตามว่า next action จาก insight แต่ละสัปดาห์ทำไปถึงไหนแล้ว" />
      <div className="flex flex-wrap gap-2 mb-6">
        {groups.map((g) => (
          <a key={g.s} href={`#${g.s}`} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            {STATUS[g.s]} <span className="ml-1 font-semibold num">{g.rows.length}</span>
          </a>
        ))}
      </div>
      {groups.map((g) => (
        <section key={g.s} id={g.s} className="mb-10">
          <SectionTitle title={STATUS[g.s]} sub={`${g.rows.length} รายการ`} />
          {g.rows.length === 0 ? <Empty>ไม่มีรายการ</Empty> : (
            <div className="space-y-3">
              {g.rows.map((i) => (
                <div key={i.id}>
                  <div className="text-xs text-faint mb-1">สัปดาห์ของ {fmtLong(i.week_of)}</div>
                  <InsightCard ins={i} />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
