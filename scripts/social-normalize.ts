// Builds research/social/<week>/social_posts.json from raw Apify output saved in research/social/<week>/raw/
// (raw/facebook.json, raw/instagram.json, raw/tiktok.json — any extra raw/<platform>-*.json files are merged too).
// Usage: pnpm social:normalize [YYYY-MM-DD]
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadAccounts, normalize, readRaw, type Platform, type SocialPost } from "./lib/social";

const week = process.argv[2] ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const dir = join(process.cwd(), "research/social", week);
const rawDir = join(dir, "raw");
if (!existsSync(rawDir)) { console.error(`No raw folder: ${rawDir}`); process.exit(1); }

const accounts = loadAccounts();
const posts: SocialPost[] = [];
const followers: Record<string, Record<string, number>> = {};
for (const platform of ["facebook", "instagram", "tiktok"] as Platform[]) {
  const files = readdirSync(rawDir).filter((f) => f === `${platform}.json` || (f.startsWith(`${platform}-`) && f.endsWith(".json")));
  for (const f of files) {
    const r = normalize(platform, readRaw(join(rawDir, f)), accounts);
    posts.push(...r.posts);
    for (const x of r.followers) (followers[platform] ??= {})[x.uni] = x.followers;
    console.log(`${f}: ${r.posts.length} posts (${r.skipped} skipped)`);
  }
}
const seen = new Set<string>();
const unique = posts.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
writeFileSync(join(dir, "social_posts.json"), JSON.stringify({ collected_at: week, followers, posts: unique }, null, 1));
console.log(`Wrote ${unique.length} posts to research/social/${week}/social_posts.json`);
