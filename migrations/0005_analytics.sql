-- First-party analytics (events, daily rollups) and the contact inbox.
-- Apply once after 0004: Cloudflare → D1 → herewegrow → Console (one statement at a time),
-- or: npx wrangler d1 migrations apply herewegrow --remote
-- Times are Unix milliseconds. `day` is YYYY-MM-DD in Asia/Dhaka (UTC+6).

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  dedupe_key TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS events_day ON events (day, type);

CREATE INDEX IF NOT EXISTS events_ts ON events (ts);

CREATE INDEX IF NOT EXISTS events_vid_ts ON events (vid, ts);

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
