-- First-party analytics (events, daily rollups) and the contact inbox.
-- Apply once after 0004: Cloudflare → D1 → herewegrow → Console, one statement at a time.
-- Do NOT use `wrangler d1 migrations apply` for this database: earlier migrations were applied by hand, so
-- d1_migrations is empty and wrangler would try to re-run 0001–0004.
-- Write cost per event is kept low on purpose: no AUTOINCREMENT (no sqlite_sequence write), no ts-only index, and the
-- dedupe_key uniqueness is a partial index, so the many rows without a key (every beacon hit) add no entry to it.
-- Times are Unix milliseconds. `day` is YYYY-MM-DD in Asia/Dhaka (UTC+6).

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  vid TEXT,
  sid TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('pageview', 'event')),
  name TEXT,
  path TEXT NOT NULL DEFAULT '',
  ref_host TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device TEXT,
  country TEXT,
  user_id TEXT,
  meta TEXT,
  dedupe_key TEXT
);

CREATE INDEX IF NOT EXISTS events_day ON events (day, type);

CREATE INDEX IF NOT EXISTS events_vid_ts ON events (vid, ts);

CREATE UNIQUE INDEX IF NOT EXISTS events_dedupe ON events (dedupe_key) WHERE dedupe_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS daily_rollup (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  key TEXT NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (day, metric, key)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  page TEXT,
  vid TEXT,
  utm_source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  note TEXT
);
