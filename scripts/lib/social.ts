// Turns raw Apify dataset items into one normalized post list.
// Accepts both nested items (Apify API) and dot-flattened items (Apify MCP `fields=`).
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Platform = "facebook" | "instagram" | "tiktok";
export type SocialPost = {
  uni: string; platform: Platform; account: string; date: string | null; text: string;
  likes: number; comments: number; shares: number; views: number; saves: number;
  pinned: boolean; url: string; hashtags: string[];
};
export type Accounts = Record<Platform, Record<string, string | null>> & { posts_per_account?: number };

export function loadAccounts(root = process.cwd()): Accounts {
  return JSON.parse(readFileSync(join(root, "research/social/ACCOUNTS.json"), "utf8"));
}

type Raw = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw scraper output
const get = (o: any, path: string): any => (path in o ? o[path] : path.split(".").reduce((a, k) => (a == null ? a : a[k]), o));
const num = (v: unknown) => (typeof v === "number" && v > 0 ? Math.round(v) : 0);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
const tagsIn = (t: string) => [...t.matchAll(/#([^\s#]+)/g)].map((m) => m[1]);
const handle = (s: string) => s.toLowerCase().replace(/^https?:\/\/(www\.)?[^/]+\//, "").replace(/[/@?].*$/, "").replace(/^@/, "");

function uniFor(accts: Record<string, string | null>, ...candidates: string[]) {
  for (const c of candidates.filter(Boolean)) {
    const h = handle(c);
    for (const [uni, a] of Object.entries(accts)) if (a && handle(a) === h) return { uni, account: handle(a) };
  }
  return null;
}

export function normalize(platform: Platform, raw: Raw[], accounts: Accounts) {
  const accts = accounts[platform];
  const posts: SocialPost[] = [];
  const followers: { uni: string; account: string; followers: number }[] = [];
  let skipped = 0;
  for (const it of raw) {
    if (get(it, "error")) { skipped++; continue; }
    if (platform === "facebook") {
      const m = uniFor(accts, str(get(it, "inputUrl")), str(get(it, "facebookUrl")), str(get(it, "pageName")));
      const url = str(get(it, "url"));
      if (!m || !url) { skipped++; continue; }
      const text = str(get(it, "text"));
      posts.push({ ...m, platform, url, text: text.slice(0, 1500), date: day(get(it, "time")),
        likes: num(get(it, "likes")), comments: num(get(it, "comments")), shares: num(get(it, "shares")),
        views: num(get(it, "viewsCount")) || num(get(it, "videoPostViewCount")), saves: 0, pinned: false, hashtags: tagsIn(text) });
    } else if (platform === "instagram") {
      // Collab posts from sub-accounts (e.g. a faculty) count for the profile they were scraped from.
      const m = uniFor(accts, str(get(it, "inputUrl")), str(get(it, "ownerUsername")));
      const url = str(get(it, "url"));
      if (!m || !url) { skipped++; continue; }
      const text = str(get(it, "caption"));
      const tags = get(it, "hashtags");
      posts.push({ ...m, account: str(get(it, "ownerUsername")) || m.account, platform, url, text: text.slice(0, 1500),
        date: day(get(it, "timestamp")), likes: num(get(it, "likesCount")), comments: num(get(it, "commentsCount")), shares: 0,
        views: num(get(it, "videoPlayCount")) || num(get(it, "videoViewCount")), saves: 0, pinned: !!get(it, "isPinned"),
        hashtags: Array.isArray(tags) ? tags.map(String) : tagsIn(text) });
    } else {
      const m = uniFor(accts, str(get(it, "input")), str(get(it, "authorMeta.name")));
      const url = str(get(it, "webVideoUrl"));
      if (!m || !url) { skipped++; continue; }
      const text = str(get(it, "text"));
      const fans = num(get(it, "authorMeta.fans"));
      if (fans && !followers.some((f) => f.uni === m.uni)) followers.push({ ...m, followers: fans });
      posts.push({ ...m, platform, url, text: text.slice(0, 1500), date: day(get(it, "createTimeISO")),
        likes: num(get(it, "diggCount")), comments: num(get(it, "commentCount")), shares: num(get(it, "shareCount")),
        views: num(get(it, "playCount")), saves: num(get(it, "collectCount")), pinned: !!get(it, "isPinned"), hashtags: tagsIn(text) });
    }
  }
  return { posts, followers, skipped };
}

export function readRaw(file: string): Raw[] {
  const j = JSON.parse(readFileSync(file, "utf8"));
  return Array.isArray(j) ? j : Array.isArray(j.items) ? j.items : [];
}
