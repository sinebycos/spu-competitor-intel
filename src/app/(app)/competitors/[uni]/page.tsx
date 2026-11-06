import { notFound } from "next/navigation";
import Link from "next/link";
import { FACULTIES, KINDS, UNIS, label, type Kind, type UniKey } from "@/lib/constants";
import { facultyMap, insights, items, latestRun, topKeywords, topSocialPosts, uniNotes } from "@/lib/queries";
import PostCard from "@/components/post-card";
import { Card, Empty, ItemRow, PageHeader, SectionTitle, Tag, uniColor } from "@/components/ui";
import InsightCard from "@/components/insight-card";

export default async function Competitor({ params }: PageProps<"/competitors/[uni]">) {
  const { uni } = await params;
  const u = UNIS[uni as UniKey];
  if (!u) notFound();
  const [run, all, kw, fmap, notes, ins, social] = await Promise.all([
    latestRun(), items({ uni }), topKeywords(uni, 20), facultyMap(), uniNotes(uni), insights(), topSocialPosts(6, uni),
  ]);
  const related = ins.filter((i) => i.uni === uni && i.status !== "dismissed");
  const kinds = Object.keys(KINDS) as Kind[];
  const myMap = fmap.filter((m) => m.uni === uni);
  return (
    <>
      <PageHeader
        title={u.name}
        sub={<span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: uniColor(uni) }} />{u.short}{u.self ? " · ข้อมูลของเราเอง ใช้เป็นฐานเปรียบเทียบ" : " · คู่แข่ง"}</span>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kinds.map((k) => (
          <a key={k} href={`#${k}`}><Card className="p-4 hover:border-faint">
            <div className="text-xs text-muted">{KINDS[k]}</div>
            <div className="text-2xl font-semibold num mt-1">{all.filter((i) => i.kind === k).length}</div>
          </Card></a>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <SectionTitle title="Insight ที่เกี่ยวข้อง" />
          <div className="space-y-3">{related.map((i) => <InsightCard key={i.id} ins={i} />)}</div>
        </section>
      )}

      {social.length > 0 && (
        <section className="mt-8">
          <SectionTitle title="โพสต์ Social ที่ได้ผลดีที่สุด" right={<Link href="/social" className="text-xs text-accent hover:underline">เทียบทุกมหาวิทยาลัย</Link>} />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{social.map((p) => <PostCard key={p.id} p={p} showUni={false} />)}</div>
        </section>
      )}

      <div className="mt-8 grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-8">
          {kinds.map((k) => {
            const rows = all.filter((i) => i.kind === k);
            return (
              <section key={k} id={k}>
                <SectionTitle title={KINDS[k]} sub={`${rows.length} รายการ`} />
                <Card className="px-4">
                  {rows.length === 0 ? <div className="py-4"><Empty>ยังไม่พบข้อมูล</Empty></div> :
                    <ul className="divide-y divide-line">{rows.map((it) => <ItemRow key={it.id} it={it} showUni={false} latest={run?.week_of} />)}</ul>}
                </Card>
              </section>
            );
          })}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-6">
          <Card className="p-4">
            <div className="text-sm font-semibold mb-2">Keyword ที่ใช้บ่อย</div>
            {kw.length === 0 ? <p className="text-xs text-muted">ยังไม่มี</p> : (
              <div className="flex flex-wrap gap-1.5">
                {kw.map((k) => <Link key={k.keyword} href={`/feed?q=${encodeURIComponent(k.keyword)}`}><Tag>{k.keyword} <span className="ml-1 text-faint">{k.n}</span></Tag></Link>)}
              </div>
            )}
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold mb-2">คณะของ {u.short} → คณะของ SPU</div>
            {myMap.length === 0 ? <p className="text-xs text-muted">ยังไม่มี</p> : (
              <ul className="space-y-1.5 text-xs">
                {myMap.map((m) => <li key={m.competitor_faculty} className="flex justify-between gap-2"><span className="text-muted">{m.competitor_faculty}</span><span className="shrink-0">{label(FACULTIES, m.spu_faculty)}</span></li>)}
              </ul>
            )}
          </Card>
          {notes?.notes && (
            <Card className="p-4">
              <div className="text-sm font-semibold mb-2">ข้อจำกัดของข้อมูลรอบล่าสุด</div>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{notes.notes}</p>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
