import { fmtDate } from "@/lib/format";
import type { SocialPost } from "@/lib/queries";
import { Tag, UniBadge, uniColor } from "./ui";

const PLATFORMS: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok" };
export const fmtCount = (v: number | null | undefined) =>
  v == null ? "–" : v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : String(v);
const n = fmtCount;

export default function PostCard({ p, showUni = true }: { p: SocialPost; showUni?: boolean }) {
  return (
    <a href={p.url} target="_blank" rel="noopener noreferrer"
      className="block rounded-xl border border-line bg-surface p-4 hover:border-faint border-t-4" style={{ borderTopColor: uniColor(p.uni) }}>
      <div className="flex items-center gap-2 flex-wrap">
        {showUni && <UniBadge uni={p.uni} />}
        <Tag>{PLATFORMS[p.platform] ?? p.platform}</Tag>
        <span className="text-xs text-faint">{fmtDate(p.posted_on)}</span>
        {p.account && <span className="text-xs text-faint truncate">@{p.account}</span>}
      </div>
      <p className="mt-2 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">{p.text}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted num">
        {p.views > 0 && <span>👁 {n(p.views)}</span>}
        <span>♥ {n(p.likes)}</span>
        {p.comments > 0 && <span>💬 {n(p.comments)}</span>}
        {p.shares > 0 && <span>↗ {n(p.shares)}</span>}
        <span className="ml-auto text-accent">เปิดโพสต์ ↗</span>
      </div>
    </a>
  );
}
