import "server-only";
import { sql } from "./db";

export type Item = {
  id: number; uni: string; kind: string; subtype: string | null; title: string; summary: string | null;
  faculty: string; start_date: string | null; end_date: string | null; location: string | null;
  province: string | null; target: string | null; value_text: string | null; value_pct: number | null;
  tcas_round: string | null; theme: string | null; channel: string | null; keywords: string[];
  source_url: string | null; source: string; created_by: string | null; first_seen: string; last_seen: string;
};
export type Insight = {
  id: number; week_of: string; category: string; priority: string; title: string; what: string;
  so_what: string; now_what: string; faculty: string; uni: string | null; owner: string | null;
  evidence: string[]; status: string;
};
export type Run = { week_of: string; headline: string | null; summary: string | null; stats: Record<string, { total: number; new: number }> };

export async function latestRun(): Promise<Run | null> {
  const r = await sql<Run[]>`SELECT week_of, headline, summary, stats FROM runs ORDER BY week_of DESC LIMIT 1`;
  return r[0] ?? null;
}
export async function allRuns() {
  return sql<Run[]>`SELECT week_of, headline, summary, stats FROM runs ORDER BY week_of DESC`;
}

export async function insights(week?: string) {
  if (week)
    return sql<Insight[]>`SELECT * FROM insights WHERE week_of = ${week}
      ORDER BY array_position(ARRAY['high','medium','low'], priority), id`;
  return sql<Insight[]>`SELECT * FROM insights
    ORDER BY week_of DESC, array_position(ARRAY['open','in_progress','done','dismissed'], status),
      array_position(ARRAY['high','medium','low'], priority), id`;
}

export type ItemFilter = { uni?: string; kind?: string; faculty?: string; q?: string; source?: string; newSince?: string };
export async function items(f: ItemFilter = {}) {
  const q = f.q ? `%${f.q}%` : null;
  return sql<Item[]>`
    SELECT * FROM items WHERE true
      ${f.uni ? sql`AND uni = ${f.uni}` : sql``}
      ${f.kind ? sql`AND kind = ${f.kind}` : sql``}
      ${f.faculty ? sql`AND faculty = ${f.faculty}` : sql``}
      ${f.source ? sql`AND source = ${f.source}` : sql``}
      ${f.newSince ? sql`AND first_seen >= ${f.newSince}` : sql``}
      ${q ? sql`AND (title ILIKE ${q} OR summary ILIKE ${q} OR array_to_string(keywords, ' ') ILIKE ${q})` : sql``}
    ORDER BY COALESCE(start_date, first_seen) DESC NULLS LAST, id DESC`;
}

export async function countsByUniKind() {
  return sql<{ uni: string; kind: string; n: number; fresh: number }[]>`
    SELECT uni, kind, count(*)::int AS n,
      count(*) FILTER (WHERE first_seen = (SELECT max(week_of) FROM runs))::int AS fresh
    FROM items GROUP BY uni, kind`;
}

export async function countsByUniFaculty() {
  return sql<{ uni: string; faculty: string; n: number }[]>`
    SELECT uni, faculty, count(*)::int AS n FROM items GROUP BY uni, faculty`;
}

export async function themeMix() {
  return sql<{ uni: string; theme: string; n: number }[]>`
    SELECT uni, COALESCE(theme,'other') AS theme, count(*)::int AS n FROM items WHERE kind = 'pr' GROUP BY 1, 2`;
}

export async function topKeywords(uni?: string, limit = 30) {
  return sql<{ keyword: string; n: number; unis: string[] }[]>`
    SELECT lower(k) AS keyword, count(*)::int AS n, array_agg(DISTINCT uni) AS unis
    FROM items, unnest(keywords) AS k
    WHERE kind = 'pr' ${uni ? sql`AND uni = ${uni}` : sql``}
    GROUP BY lower(k) ORDER BY n DESC, keyword LIMIT ${limit}`;
}

export async function openScholarships(today: string) {
  return sql<Item[]>`SELECT * FROM items WHERE kind = 'scholarship' AND end_date >= ${today}
    ORDER BY end_date ASC`;
}

export async function upcoming(today: string, until: string) {
  return sql<Item[]>`SELECT * FROM items WHERE kind IN ('activity','offline')
    AND start_date BETWEEN ${today} AND ${until} ORDER BY start_date ASC`;
}

export async function facultyMap() {
  return sql<{ uni: string; competitor_faculty: string; spu_faculty: string }[]>`
    SELECT * FROM faculty_map ORDER BY uni, spu_faculty, competitor_faculty`;
}

export async function uniNotes(uni: string) {
  const r = await sql<{ notes: string | null; week_of: string }[]>`
    SELECT notes, week_of FROM uni_notes WHERE uni = ${uni} ORDER BY week_of DESC LIMIT 1`;
  return r[0] ?? null;
}

export async function activityByMonth() {
  return sql<{ uni: string; month: string; n: number }[]>`
    SELECT uni, to_char(start_date, 'YYYY-MM') AS month, count(*)::int AS n
    FROM items WHERE kind IN ('activity','offline') AND start_date IS NOT NULL
      AND start_date >= date '2026-01-01' GROUP BY 1, 2`;
}

// ---------- Social media ----------
export type SocialPost = {
  id: number; url: string; uni: string; platform: string; account: string; posted_on: string | null; text: string | null;
  hashtags: string[]; likes: number; comments: number; shares: number; views: number; saves: number; pinned: boolean;
  first_seen: string;
};

export async function socialStats() {
  return sql<{ uni: string; platform: string; n: number; med_views: number; med_likes: number; med_comments: number; med_shares: number; followers: number | null; first: string; last: string }[]>`
    SELECT p.uni, p.platform, count(*)::int AS n,
      (percentile_cont(0.5) WITHIN GROUP (ORDER BY views))::int AS med_views,
      (percentile_cont(0.5) WITHIN GROUP (ORDER BY likes))::int AS med_likes,
      (percentile_cont(0.5) WITHIN GROUP (ORDER BY comments))::int AS med_comments,
      (percentile_cont(0.5) WITHIN GROUP (ORDER BY shares))::int AS med_shares,
      max(a.followers) AS followers, min(posted_on)::text AS first, max(posted_on)::text AS last
    FROM social_posts p LEFT JOIN social_accounts a ON a.uni = p.uni AND a.platform = p.platform
    WHERE NOT p.pinned GROUP BY p.uni, p.platform`;
}

const SCORE = sql`(likes + 2 * comments + 3 * shares + views / 100.0)`;
export async function topSocialPosts(limit = 12, uni?: string, since?: string) {
  return sql<SocialPost[]>`SELECT * FROM social_posts WHERE NOT pinned
    ${uni ? sql`AND uni = ${uni}` : sql``} ${since ? sql`AND posted_on >= ${since}` : sql``}
    ORDER BY ${SCORE} DESC LIMIT ${limit}`;
}

export async function socialHashtags(perUni = 10) {
  return sql<{ uni: string; tag: string; n: number }[]>`
    SELECT uni, tag, n FROM (
      SELECT uni, lower(h) AS tag, count(*)::int AS n,
        row_number() OVER (PARTITION BY uni ORDER BY count(*) DESC, lower(h)) AS rk
      FROM social_posts, unnest(hashtags) AS h GROUP BY uni, lower(h)) t
    WHERE rk <= ${perUni} ORDER BY uni, n DESC`;
}

export const SOCIAL_TOPICS: { key: string; label: string; pattern: string }[] = [
  { key: "dek70", label: "ชวนสมัคร DEK70 / TCAS", pattern: "(dek70|เด็ก70|tcas70|สมัครเรียน|สมัครได้)" },
  { key: "scholarship", label: "ทุน / โปรโมชัน", pattern: "(ทุน|ส่วนลด|ฟรี|โปร)" },
  { key: "ai_tech", label: "AI / เทคโนโลยี", pattern: "(\\bai\\b|ai-first|aiutcc|copilot|ปัญญาประดิษฐ์|เทคโนโลยี)" },
  { key: "student_life", label: "ชีวิตนักศึกษา / กิจกรรม", pattern: "(กิจกรรม|บรรยากาศ|halloween|ฮาโลวีน|ลอยกระทง|คอนเสิร์ต|เฟรชชี่|recap)" },
  { key: "faculty", label: "แนะนำคณะ / สาขา", pattern: "(คณะ|สาขา|หลักสูตร|เรียนอะไร)" },
  { key: "career", label: "อาชีพ / ประสบการณ์จริง", pattern: "(ประสบการณ์จริง|ทำงาน|อาชีพ|ฝึกงาน|สายการบิน|career)" },
];

export async function socialTopics() {
  // Count per topic in JS: a handful of posts per university, and the patterns stay plain RegExps.
  const rows = await sql<{ uni: string; text: string | null }[]>`SELECT uni, text FROM social_posts WHERE NOT pinned`;
  const out: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const o = (out[r.uni] ??= { n: 0 });
    o.n++;
    for (const t of SOCIAL_TOPICS) if (new RegExp(t.pattern, "i").test(r.text ?? "")) o[t.key] = (o[t.key] ?? 0) + 1;
  }
  return Object.entries(out).map(([uni, o]) => ({
    uni, n: o.n,
    pct: Object.fromEntries(SOCIAL_TOPICS.map((t) => [t.key, Math.round((100 * (o[t.key] ?? 0)) / o.n)])),
  }));
}
