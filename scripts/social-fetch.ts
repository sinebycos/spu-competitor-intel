// Scrapes the accounts in research/social/ACCOUNTS.json through the Apify API, saves raw output,
// then normalizes it. Needs APIFY_TOKEN in .env.local (Apify console → Settings → API & Integrations).
// Usage: pnpm social:fetch [YYYY-MM-DD]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { loadAccounts } from "./lib/social";

const token = process.env.APIFY_TOKEN;
if (!token) {
  console.error("APIFY_TOKEN is not set in .env.local. Either add it, or fetch with the Apify connector and save the items to research/social/<week>/raw/<platform>.json, then run `pnpm social:normalize <week>`.");
  process.exit(1);
}
const week = process.argv[2] ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const rawDir = join(process.cwd(), "research/social", week, "raw");
mkdirSync(rawDir, { recursive: true });

const a = loadAccounts();
const n = a.posts_per_account ?? 15;
const vals = (o: Record<string, string | null>) => Object.values(o).filter((v): v is string => !!v);
const jobs = [
  { platform: "facebook", actor: "apify~facebook-posts-scraper", cap: 1.0, input: { startUrls: vals(a.facebook).map((url) => ({ url })), resultsLimit: n } },
  { platform: "instagram", actor: "apify~instagram-post-scraper", cap: 0.6, input: { username: vals(a.instagram), resultsLimit: n } },
  { platform: "tiktok", actor: "clockworks~tiktok-scraper", cap: 0.6, input: { profiles: vals(a.tiktok), resultsPerPage: n, profileScrapeSections: ["videos"], profileSorting: "latest" } },
];

async function run() {
  await Promise.all(jobs.map(async (j) => {
    const url = `https://api.apify.com/v2/acts/${j.actor}/run-sync-get-dataset-items?maxTotalChargeUsd=${j.cap}&timeout=280`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(j.input) });
    if (!res.ok) { console.error(`${j.platform}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`); return; }
    const items = await res.json();
    writeFileSync(join(rawDir, `${j.platform}.json`), JSON.stringify(items));
    console.log(`${j.platform}: ${items.length} raw items`);
  }));
  execFileSync("npx", ["tsx", "scripts/social-normalize.ts", week], { stdio: "inherit" });
}
run().catch((e) => { console.error(e); process.exit(1); });
