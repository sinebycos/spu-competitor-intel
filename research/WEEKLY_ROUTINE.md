# Weekly competitor research routine

Run every week (Sunday night). Goal: refresh the data on the dashboard and write
this week's executive insights for Sripatum University (SPU).

Project root = the folder that contains this file's parent `research/`.
Week id = today's date in Asia/Bangkok, format YYYY-MM-DD (call it WEEK).

## Steps

1. **Archive last week's raw data**
   `mkdir -p research/archive/<previous collected_at>` and copy `research/data/*.json` into it.

2. **Re-research each university** (spu, utcc, dpu, bu, rsu). Use one subagent per
   university in parallel if available. Each one:
   - Reads `research/SCHEMA.md` for the exact JSON format and faculty keys.
   - Starts from the existing `research/data/<slug>.json`: keeps items that are still
     valid, updates changed values/dates, and adds anything new from the last ~3 months
     and anything upcoming. Sources: official site, admission & scholarship pages, news,
     Dek-D, mytcas, search results for the university's Facebook/IG/TikTok/YouTube.
   - Only real items with a source_url. Never invent. Unknown = null.
   - Sets `collected_at` to WEEK and writes `notes` about gaps.
   - Validates with `python3 -m json.tool`.

2b. **Collect social media posts** (accounts in `research/social/ACCOUNTS.json`, ~15 latest posts each).
   - If `APIFY_TOKEN` is set in `.env.local`: run `pnpm social:fetch WEEK` (scrapes, saves raw output, normalizes).
   - Otherwise use the Apify connector tools: run `apify/facebook-posts-scraper` (startUrls, resultsLimit 15),
     `apify/instagram-post-scraper` (username list, resultsLimit 15) and `clockworks/tiktok-scraper`
     (profiles, resultsPerPage 15, profileScrapeSections ["videos"], profileSorting "latest"), each with
     maxTotalChargeUsd ≤ 1. Save each run's dataset items as JSON to `research/social/WEEK/raw/<platform>.json`
     (a large result is written to a tool-results file — copy that file), then run `pnpm social:normalize WEEK`.
   - Only official university accounts. Do not store commenters' names or any personal data.
   - Read `research/social/WEEK/social_posts.json`: new scholarships, events or slogans found in posts should
     also be added to `research/data/<slug>.json` with the post as source_url.
   - Budget: about $1 of Apify credit per week (free plan ≈ $5/month).

3. **Find what changed.** Compare the new files with the archived ones: new
   scholarships, changed values/deadlines, new activities/booths, new slogans.
   Also check the database for Field Intel submitted by staff this week:
   `psql "$DATABASE_URL" -c "select uni,title,start_date,location,summary from items where source='field' and first_seen >= current_date - 7"`
   (DATABASE_URL is in `.env.local`).
   Compare social engagement with last week (table `social_posts`): which university's posts performed
   best, which content formats/themes worked, and any campaign that appeared only on social.

4. **Write insights** to `research/insights/WEEK.json`:
   ```json
   { "week_of": "WEEK", "headline": "one Thai sentence", "summary": "3-5 Thai sentences",
     "insights": [ { "category": "scholarship|activity|messaging|offline|data_gap|strategy",
       "priority": "high|medium|low", "faculty": "<faculty key or all>", "uni": "<slug or null>",
       "owner": "who at SPU should act", "title": "...", "what": "what happened (facts, dates, numbers)",
       "so_what": "why it matters to SPU", "now_what": "concrete next actions for SPU, numbered 1) 2) 3)",
       "evidence": ["source urls"] } ] }
   ```
   6–10 insights, written in Thai, focused on what CHANGED this week and on SPU's 7
   focus faculties. Every insight compares against SPU's own data. Every claim must be
   traceable to an item in research/data or Field Intel.

5. **Load into the dashboard:** `pnpm ingest WEEK`
   (to load into the hosted database instead, run with that DATABASE_URL).

6. Report: counts per university, number of new items and social posts, Apify cost, the headline.
