import { UNI_KEYS } from "@/lib/constants";
import { addDays, fmtDate, todayISO } from "@/lib/format";
import { SOCIAL_TOPICS, socialHashtags, socialStats, socialTopics, topSocialPosts } from "@/lib/queries";
import { Card, Empty, PageHeader, SectionTitle, Tag, UniBadge, uniColor } from "@/components/ui";
import PostCard, { fmtCount as n } from "@/components/post-card";

type P = "facebook" | "instagram" | "tiktok";

// Each cell: [platform, metric, label]. FB views exist only for reels, so FB is compared on likes/shares.
const METRICS: [P, "med_views" | "med_likes" | "med_shares", string][] = [
  ["tiktok", "med_views", "TikTok วิว"],
  ["tiktok", "med_likes", "TikTok ไลก์"],
  ["instagram", "med_likes", "IG ไลก์"],
  ["instagram", "med_views", "IG วิว (Reel)"],
  ["facebook", "med_likes", "FB ไลก์"],
  ["facebook", "med_shares", "FB แชร์"],
];

export default async function Social() {
  const since = addDays(todayISO(), -30);
  const [stats, top, tags, topics] = await Promise.all([socialStats(), topSocialPosts(12, undefined, since), socialHashtags(8), socialTopics()]);
  if (stats.length === 0) return <><PageHeader title="Social Media" /><Empty>ยังไม่มีข้อมูล Social ให้รัน routine รายสัปดาห์หรือ <code>pnpm ingest</code></Empty></>;

  const cell = (u: string, p: P, m: (typeof METRICS)[number][1]) => stats.find((s) => s.uni === u && s.platform === p)?.[m] ?? null;
  const colMax = (p: P, m: (typeof METRICS)[number][1]) => Math.max(0, ...UNI_KEYS.map((u) => cell(u, p, m) ?? 0));
  const latest = stats.reduce((a, s) => (s.last > a ? s.last : a), "");

  return (
    <>
      <PageHeader title="Social Media" sub={<>โพสต์ล่าสุดจากบัญชีทางการบน Facebook, Instagram และ TikTok · อัปเดตถึง {fmtDate(latest)}</>} />

      <section className="mb-8">
        <SectionTitle title="Engagement ต่อโพสต์ (ค่ากลาง)" sub="ใช้ค่ากลางแทนค่าเฉลี่ยเพื่อไม่ให้โพสต์ไวรัลโพสต์เดียวบิดภาพ · ไม่นับโพสต์ที่ปักหมุด · สีเข้ม = สูงสุดในคอลัมน์" />
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-xs text-muted">
                <th className="text-left font-medium pb-2">มหาวิทยาลัย</th>
                <th className="font-medium pb-2">ผู้ติดตาม TikTok</th>
                {METRICS.map(([, , l]) => <th key={l} className="font-medium pb-2">{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {UNI_KEYS.map((u) => (
                <tr key={u} className="border-t border-line text-center num">
                  <td className="py-2 text-left"><UniBadge uni={u} link /></td>
                  <td>{n(stats.find((s) => s.uni === u && s.platform === "tiktok")?.followers)}</td>
                  {METRICS.map(([p, m, l]) => {
                    const v = cell(u, p, m);
                    const max = colMax(p, m);
                    const best = v != null && v > 0 && v === max;
                    return (
                      <td key={l} className="px-1 py-1">
                        <div className={`rounded-md py-1.5 ${best ? "font-semibold" : ""}`}
                          style={v ? { background: `color-mix(in oklab, ${uniColor(u)} ${Math.round(8 + (v / (max || 1)) * 50)}%, white)` } : { color: "var(--faint)" }}>
                          {v == null ? "ไม่มีบัญชี" : n(v)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">ไม่พบบัญชี TikTok ทางการของ ม.กรุงเทพ และ ม.ธุรกิจบัณฑิตย์ · Facebook ให้ยอดวิวเฉพาะ Reel และไม่ให้จำนวนคอมเมนต์</p>
        </Card>
      </section>

      <section className="mb-8">
        <SectionTitle title="แต่ละมหาวิทยาลัยโพสต์เรื่องอะไร" sub="% ของโพสต์ที่พูดถึงแต่ละหัวข้อ (หนึ่งโพสต์อยู่ได้หลายหัวข้อ)" />
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-xs text-muted">
                <th className="text-left font-medium pb-2">มหาวิทยาลัย</th>
                {SOCIAL_TOPICS.map((t) => <th key={t.key} className="font-medium pb-2 px-1">{t.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {UNI_KEYS.map((u) => {
                const row = topics.find((t) => t.uni === u);
                return (
                  <tr key={u} className="border-t border-line text-center num">
                    <td className="py-2 text-left"><UniBadge uni={u} /> <span className="text-xs text-faint">({row?.n ?? 0})</span></td>
                    {SOCIAL_TOPICS.map((t) => {
                      const v = row?.pct[t.key] ?? 0;
                      return (
                        <td key={t.key} className="px-1 py-1">
                          <div className="rounded-md py-1.5" style={{ background: v ? `color-mix(in oklab, var(--accent) ${Math.round(6 + v * 0.6)}%, white)` : "var(--sunken)", color: v > 60 ? "white" : "var(--ink)" }}>{v}%</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mb-8">
        <SectionTitle title="โพสต์ที่ได้ผลดีที่สุด 30 วันล่าสุด" sub="จัดอันดับจากไลก์ + คอมเมนต์ + แชร์ และยอดวิว" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {top.map((p) => <PostCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <SectionTitle title="Hashtag ที่ใช้บ่อย" />
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
          {UNI_KEYS.map((u) => (
            <Card key={u} className="p-4">
              <UniBadge uni={u} link />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.filter((t) => t.uni === u).map((t) => (
                  <Tag key={t.tag}>#{t.tag} <span className="ml-1 text-faint">{t.n}</span></Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
