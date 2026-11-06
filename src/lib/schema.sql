CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  uni text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('activity','scholarship','pr','offline')),
  subtype text,
  title text NOT NULL,
  summary text,
  faculty text NOT NULL DEFAULT 'all',
  start_date date,
  end_date date,
  location text,
  province text,
  target text,
  value_text text,
  value_pct int,
  tcas_round text,
  theme text,
  channel text,
  keywords text[] NOT NULL DEFAULT '{}',
  source_url text,
  source text NOT NULL DEFAULT 'research',
  created_by text,
  first_seen date NOT NULL,
  last_seen date NOT NULL
);
CREATE INDEX IF NOT EXISTS items_uni_kind ON items (uni, kind);
CREATE INDEX IF NOT EXISTS items_first_seen ON items (first_seen);

CREATE TABLE IF NOT EXISTS faculty_map (
  uni text NOT NULL,
  competitor_faculty text NOT NULL,
  spu_faculty text NOT NULL,
  PRIMARY KEY (uni, competitor_faculty)
);

CREATE TABLE IF NOT EXISTS runs (
  week_of date PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  headline text,
  summary text,
  stats jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS insights (
  id serial PRIMARY KEY,
  week_of date NOT NULL,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  title text NOT NULL,
  what text NOT NULL,
  so_what text NOT NULL,
  now_what text NOT NULL,
  faculty text NOT NULL DEFAULT 'all',
  uni text,
  owner text,
  evidence text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS insights_week ON insights (week_of);

CREATE TABLE IF NOT EXISTS uni_notes (
  uni text NOT NULL,
  week_of date NOT NULL,
  notes text,
  PRIMARY KEY (uni, week_of)
);

CREATE TABLE IF NOT EXISTS social_posts (
  id serial PRIMARY KEY,
  url text UNIQUE NOT NULL,
  uni text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('facebook','instagram','tiktok')),
  account text NOT NULL,
  posted_on date,
  text text,
  hashtags text[] NOT NULL DEFAULT '{}',
  likes int NOT NULL DEFAULT 0,
  comments int NOT NULL DEFAULT 0,
  shares int NOT NULL DEFAULT 0,
  views int NOT NULL DEFAULT 0,
  saves int NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  first_seen date NOT NULL,
  last_seen date NOT NULL
);
CREATE INDEX IF NOT EXISTS social_uni_platform ON social_posts (uni, platform);

CREATE TABLE IF NOT EXISTS social_accounts (
  uni text NOT NULL,
  platform text NOT NULL,
  account text NOT NULL,
  followers int,
  week_of date NOT NULL,
  PRIMARY KEY (uni, platform)
);
