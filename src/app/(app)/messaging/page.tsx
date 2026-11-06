import Link from "next/link";
import { CHANNELS, THEMES, UNI_KEYS, label } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import { items, topKeywords } from "@/lib/queries";
import { Card, FacultyTag, PageHeader, SectionTitle, SourceLink, Tag, UniBadge, uniColor } from "@/components/ui";

export default async function Messaging() {
  const [kw, prs] = await Promise.all([topKeywords(undefined, 40), items({ kind: "pr" })]);
  const max = Math.max(1, ...kw.map((k) => k.n));
  return (
    <>
      <PageHeader title="Keyword & ข้อความ PR" sub="คำ ธีม และสโลแกนที่แต่ละมหาวิทยาลัยใช้สื่อสารกับนักเรียน" />
      <section className="mb-8">
        <SectionTitle title="Keyword ที่ถูกใช้มากที่สุด" sub="แถบสีแสดงว่ามหาวิทยาลัยไหนใช้คำนั้น · คลิกเพื่อดูข้อความที่เกี่ยวข้อง" />
        <Card className="p-4 grid md:grid-cols-2 gap-x-8 gap-y-2">
          {kw.map((k) => (
            <Link key={k.keyword} href={`/feed?q=${encodeURIComponent(k.keyword)}`} className="grid grid-cols-[1fr_120px_24px] items-center gap-3 text-sm hover:bg-sunken rounded px-1 -mx-1">
              <span className="truncate">{k.keyword}</span>
              <span className="flex h-2.5 rounded overflow-hidden bg-sunken" style={{ width: `${(k.n / max) * 100}%` }}>
                {k.unis.map((u) => <span key={u} className="flex-1" style={{ background: uniColor(u) }} />)}
              </span>
              <span className="text-xs text-muted num text-right">{k.n}</span>
            </Link>
          ))}
        </Card>
        <div className="mt-2 flex flex-wrap gap-3">{UNI_KEYS.map((u) => <UniBadge key={u} uni={u} />)}</div>
      </section>
      <section>
        <SectionTitle title="ข้อความ PR ทั้งหมด แยกตามมหาวิทยาลัย" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {UNI_KEYS.map((u) => (
            <Card key={u} className="p-4">
              <div className="mb-3"><UniBadge uni={u} link /></div>
              <ul className="space-y-3">
                {prs.filter((p) => p.uni === u).map((p) => (
                  <li key={p.id} className="border-l-2 pl-3" style={{ borderColor: uniColor(u) }}>
                    <div className="text-sm font-medium leading-snug">“{p.title}”</div>
                    <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                      <Tag>{label(THEMES, p.theme)}</Tag>
                      {p.channel && <Tag>{label(CHANNELS, p.channel)}</Tag>}
                      {p.faculty !== "all" && <FacultyTag faculty={p.faculty} />}
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-faint"><span>{p.start_date ? fmtDate(p.start_date) : ""}</span><SourceLink url={p.source_url} /></div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
