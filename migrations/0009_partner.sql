-- CV Partner Workspace (Phase 1): partner profiles, client folders, delivered counts, bonuses, devices, flags, events.
-- Apply once after 0008: Cloudflare → D1 → herewegrow → Console, one statement at a time (not `wrangler d1 migrations apply`).
-- Times are Unix milliseconds. Every client row belongs to exactly one partner (user_id); every query filters on it.

CREATE TABLE IF NOT EXISTS partner_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,               -- the public intake link: /p/<code>
  name TEXT NOT NULL,
  fb_link TEXT,
  sells_where TEXT,
  terms_at INTEGER NOT NULL,               -- when the Partner Terms were accepted
  remove_branding INTEGER NOT NULL DEFAULT 0,
  suspended INTEGER NOT NULL DEFAULT 0,
  -- Extension points for Phase 2-3 (certificate, directory). Not used yet.
  certified INTEGER NOT NULL DEFAULT 0,
  listed INTEGER NOT NULL DEFAULT 0,
  listing_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  profession TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'progress', 'delivered')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'intake')),
  cv_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  delivered_at INTEGER,
  -- A deleted folder keeps only this skeleton (no name, phone, note or CV) so the cap cannot be dodged by deleting.
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS partner_clients_user ON partner_clients (user_id, created_at);

-- One row per client folder per month: the delivered count.
CREATE TABLE IF NOT EXISTS partner_deliveries (
  client_id TEXT NOT NULL,
  month TEXT NOT NULL,                     -- yyyy-mm, Asia/Dhaka
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,                       -- yyyy-mm-dd, Asia/Dhaka
  at INTEGER NOT NULL,
  PRIMARY KEY (client_id, month)
);
CREATE INDEX IF NOT EXISTS partner_deliveries_user ON partner_deliveries (user_id, month);

-- Level bonuses. The id is user:month:level, so a level pays once per month. token makes the day-grant atomic.
CREATE TABLE IF NOT EXISTS partner_bonus_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('bronze', 'silver', 'gold')),
  days INTEGER NOT NULL,
  cap_extra INTEGER NOT NULL DEFAULT 0,
  cap_until INTEGER,
  granted_at INTEGER NOT NULL,
  token TEXT,
  revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS partner_bonus_user ON partner_bonus_grants (user_id);

CREATE TABLE IF NOT EXISTS partner_devices (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  PRIMARY KEY (user_id, device_id)
);

CREATE TABLE IF NOT EXISTS partner_flags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT,
  day TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS partner_flags_once ON partner_flags (user_id, kind, day);

CREATE TABLE IF NOT EXISTS partner_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Server-side event log for the admin tiles. Names: PartnerCheckoutStart, PartnerPaid, ClientCreated, IntakeSubmitted,
-- CvDelivered, LevelReached, CapReached. Counts only, never client details.
CREATE TABLE IF NOT EXISTS partner_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  ts INTEGER NOT NULL,
  meta TEXT
);
CREATE INDEX IF NOT EXISTS partner_events_name ON partner_events (name, ts);
