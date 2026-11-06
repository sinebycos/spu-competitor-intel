import Link from "next/link";
import { UNI_KEYS } from "@/lib/constants";
import { fmtLong } from "@/lib/format";
import { allRuns } from "@/lib/queries";
import { Card, Empty, PageHeader, UniBadge } from "@/components/ui";

export default async function Reports() {
  const runs = await allRuns();
  return (
    <>
      <PageHeader title="รายงานรายสัปดาห์" sub="ระบบรีเสิร์ชอัตโนมัติทุกสัปดาห์ แต่ละรอบสรุปไว้ที่นี่" />
      {runs.length === 0 && <Empty>ยังไม่มีรายงาน</Empty>}
      <div className="space-y-3">
        {runs.map((r) => (
          <Card key={r.week_of} className="p-5">
            <div className="text-xs text-muted">สัปดาห์ของ {fmtLong(r.week_of)}</div>
            <div className="mt-1 text-lg font-semibold">{r.headline}</div>
            <p className="mt-2 text-sm text-muted leading-relaxed">{r.summary}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {UNI_KEYS.map((u) => r.stats?.[u] && (
                <div key={u} className="text-sm"><UniBadge uni={u} /> <span className="num ml-1">{r.stats[u].total}</span>
                  <span className="text-xs text-accent ml-1">(+{r.stats[u].new} ใหม่)</span></div>
              ))}
            </div>
            <Link href="/actions" className="mt-3 inline-block text-xs text-accent hover:underline">ดู action ของสัปดาห์นี้</Link>
          </Card>
        ))}
      </div>
    </>
  );
}
