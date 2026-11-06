// Loads one weekly research run into the database.
// Reads research/data/<uni>.json and research/insights/<week>.json.
// Usage: pnpm ingest [YYYY-MM-DD]   (defaults to the newest insights file, or today)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { sql } from "../src/lib/db";

const ROOT = process.cwd();
const DATA = join(ROOT, "research/data");
const INSIGHTS = join(ROOT, "research/insights");
const UNIS = ["spu", "utcc", "dpu", "bu", "rsu"];
const FACS = ["digital_media", "it", "tourism", "architecture", "engineering", "liberal_arts", "business", "all"];

const d = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const s = (v: unknown) => (typeof v === "string" && v.trim() && v.trim().toLowerCase() !== "null" ? v.trim() : null);
const fac = (v: unknown) => (typeof v === "string" && FACS.includes(v) ? v : "all");
const norm = (t: string) => t.toLowerCase().replace(/[\s\-–—_.,:;!?'"“”()\[\]]+/g, "");

type Row = {
  uni: string; kind: string; subtype: string | null; title: string; summary: string | null; faculty: string;
  start_date: string | null; end_date: string | null; location: string | null; province: string | null;
  target: string | null; value_text: string | null; value_pct: number | null; tcas_round: string | null;
  theme: string | null; channel: string | null; keywords: string[]; source_url: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- research JSON is validated field by field below
function rowsFor(uni: string, j: any): Row[] {
  const base = { uni, subtype: null, summary: null, start_date: null, end_date: null, location: null, province: null,
    target: null, value_text: null, value_pct: null, tcas_round: null, theme: null, channel: null, keywords: [] as string[] };
  const out: Row[] = [];
  for (const a of j.activities ?? []) if (s(a.title)) out.push({ ...base, kind: "activity", subtype: s(a.type), title: s(a.title)!,
    summary: s(a.summary), faculty: fac(a.faculty), start_date: d(a.start_date), end_date: d(a.end_date),
    location: s(a.location), target: s(a.target), source_url: s(a.source_url) });
  for (const x of j.scholarships ?? []) if (s(x.name)) out.push({ ...base, kind: "scholarship", title: s(x.name)!,
    summary: s(x.conditions), faculty: fac(x.faculty), start_date: d(x.valid_from), end_date: d(x.valid_to),
    value_text: s(x.value_text), value_pct: typeof x.value_pct === "number" ? Math.round(x.value_pct) : null,
    tcas_round: s(x.tcas_round) ?? "unknown", source_url: s(x.source_url) });
  for (const p of j.pr_messages ?? []) if (s(p.headline)) out.push({ ...base, kind: "pr", title: s(p.headline)!,
    faculty: fac(p.faculty), start_date: d(p.date), theme: s(p.theme) ?? "other", channel: s(p.channel),
    keywords: Array.isArray(p.keywords) ? p.keywords.filter((k: unknown) => typeof k === "string" && k.trim()).map((k: string) => k.trim()) : [],
    source_url: s(p.source_url) });
  for (const o of j.offline_events ?? []) if (s(o.event_name)) out.push({ ...base, kind: "offline", subtype: s(o.event_type),
    title: s(o.event_name)!, summary: s(o.summary), faculty: fac(o.faculty), start_date: d(o.date),
    location: s(o.venue), province: s(o.province), source_url: s(o.source_url) });
  return out;
}

async function main() {
  const files = existsSync(INSIGHTS) ? readdirSync(INSIGHTS).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
  const week = process.argv[2] ?? files.at(-1)?.replace(".json", "") ?? new Date().toISOString().slice(0, 10);
  console.log(`Ingesting run for week of ${week}`);

  const stats: Record<string, { total: number; new: number }> = {};
  for (const uni of UNIS) {
    const f = join(DATA, `${uni}.json`);
    if (!existsSync(f)) { console.warn(`  skip ${uni}: no file`); continue; }
    const j = JSON.parse(readFileSync(f, "utf8"));
    const rows = rowsFor(uni, j);
    let fresh = 0;
    for (const r of rows) {
      const key = `${uni}|${r.kind}|${norm(r.title)}`;
      const res = await sql`
        INSERT INTO items (key, uni, kind, subtype, title, summary, faculty, start_date, end_date, location, province,
          target, value_text, value_pct, tcas_round, theme, channel, keywords, source_url, first_seen, last_seen)
        VALUES (${key}, ${uni}, ${r.kind}, ${r.subtype}, ${r.title}, ${r.summary}, ${r.faculty}, ${r.start_date},
          ${r.end_date}, ${r.location}, ${r.province}, ${r.target}, ${r.value_text}, ${r.value_pct}, ${r.tcas_round},
          ${r.theme}, ${r.channel}, ${r.keywords}, ${r.source_url}, ${week}, ${week})
        ON CONFLICT (key) DO UPDATE SET
          subtype = EXCLUDED.subtype, summary = EXCLUDED.summary, faculty = EXCLUDED.faculty,
          start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, location = EXCLUDED.location,
          province = EXCLUDED.province, target = EXCLUDED.target, value_text = EXCLUDED.value_text,
          value_pct = EXCLUDED.value_pct, tcas_round = EXCLUDED.tcas_round, theme = EXCLUDED.theme,
          channel = EXCLUDED.channel, keywords = EXCLUDED.keywords, source_url = EXCLUDED.source_url,
          last_seen = GREATEST(items.last_seen, EXCLUDED.last_seen)
        RETURNING (xmax = 0) AS inserted`;
      if (res[0]?.inserted) fresh++;
    }
    for (const m of j.faculty_map ?? []) {
      if (!s(m.competitor_faculty)) continue;
      await sql`INSERT INTO faculty_map (uni, competitor_faculty, spu_faculty)
        VALUES (${uni}, ${s(m.competitor_faculty)}, ${fac(m.spu_faculty)})
        ON CONFLICT (uni, competitor_faculty) DO UPDATE SET spu_faculty = EXCLUDED.spu_faculty`;
    }
    await sql`INSERT INTO uni_notes (uni, week_of, notes) VALUES (${uni}, ${week}, ${s(j.notes)})
      ON CONFLICT (uni, week_of) DO UPDATE SET notes = EXCLUDED.notes`;
    // Count by first_seen so re-running the same week keeps the "new" numbers.
    const [{ n: freshThisWeek }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM items WHERE uni = ${uni} AND first_seen = ${week} AND source = 'research'`;
    fresh = freshThisWeek;
    stats[uni] = { total: rows.length, new: fresh };
    console.log(`  ${uni}: ${rows.length} items (${fresh} new)`);
  }

  // Social media posts (research/social/<week>/social_posts.json), if collected this week.
  const socialFile = join(ROOT, "research/social", week, "social_posts.json");
  if (existsSync(socialFile)) {
    const soc = JSON.parse(readFileSync(socialFile, "utf8"));
    let n = 0;
    for (const p of soc.posts ?? []) {
      if (!p.url || !UNIS.includes(p.uni) || !["facebook", "instagram", "tiktok"].includes(p.platform)) continue;
      const int = (v: unknown) => (typeof v === "number" && v > 0 ? Math.round(v) : 0);
      await sql`INSERT INTO social_posts (url, uni, platform, account, posted_on, text, hashtags, likes, comments, shares, views, saves, pinned, first_seen, last_seen)
        VALUES (${p.url}, ${p.uni}, ${p.platform}, ${p.account ?? ""}, ${d(p.date)}, ${s(p.text)},
          ${Array.isArray(p.hashtags) ? p.hashtags.map(String) : []}, ${int(p.likes)}, ${int(p.comments)}, ${int(p.shares)},
          ${int(p.views)}, ${int(p.saves)}, ${!!p.pinned}, ${week}, ${week})
        ON CONFLICT (url) DO UPDATE SET likes = EXCLUDED.likes, comments = EXCLUDED.comments, shares = EXCLUDED.shares,
          views = EXCLUDED.views, saves = EXCLUDED.saves, pinned = EXCLUDED.pinned, text = EXCLUDED.text,
          hashtags = EXCLUDED.hashtags, last_seen = GREATEST(social_posts.last_seen, EXCLUDED.last_seen)`;
      n++;
    }
    for (const [platform, byUni] of Object.entries((soc.followers ?? {}) as Record<string, Record<string, number>>))
      for (const [uni, f] of Object.entries(byUni))
        await sql`INSERT INTO social_accounts (uni, platform, account, followers, week_of) VALUES (${uni}, ${platform}, '', ${f}, ${week})
          ON CONFLICT (uni, platform) DO UPDATE SET followers = EXCLUDED.followers, week_of = EXCLUDED.week_of`;
    console.log(`  social: ${n} posts`);
  }

  const insFile = join(INSIGHTS, `${week}.json`);
  let headline: string | null = null, summary: string | null = null;
  if (existsSync(insFile)) {
    const ins = JSON.parse(readFileSync(insFile, "utf8"));
    headline = s(ins.headline); summary = s(ins.summary);
    // Keep status of insights re-imported with the same title in the same week.
    const prev = await sql`SELECT title, status FROM insights WHERE week_of = ${week}`;
    const prevStatus = new Map(prev.map((p) => [p.title as string, p.status as string]));
    await sql`DELETE FROM insights WHERE week_of = ${week}`;
    for (const i of ins.insights ?? []) {
      await sql`INSERT INTO insights (week_of, category, priority, title, what, so_what, now_what, faculty, uni, owner, evidence, status)
        VALUES (${week}, ${i.category ?? "strategy"}, ${["high", "medium", "low"].includes(i.priority) ? i.priority : "medium"},
          ${i.title}, ${i.what}, ${i.so_what}, ${i.now_what}, ${fac(i.faculty)}, ${s(i.uni)}, ${s(i.owner)},
          ${Array.isArray(i.evidence) ? i.evidence : []}, ${prevStatus.get(i.title) ?? "open"})`;
    }
    console.log(`  insights: ${(ins.insights ?? []).length}`);
  } else console.warn(`  no insights file for ${week}`);

  await sql`INSERT INTO runs (week_of, headline, summary, stats) VALUES (${week}, ${headline}, ${summary}, ${sql.json(stats)})
    ON CONFLICT (week_of) DO UPDATE SET headline = EXCLUDED.headline, summary = EXCLUDED.summary, stats = EXCLUDED.stats, created_at = now()`;
  console.log("Done.");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
