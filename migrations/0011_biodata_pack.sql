-- Clean pack for the marriage biodata maker (one-time, tied to an account).
-- Apply once after 0010: Cloudflare → D1 → herewegrow → Console, one statement at a time.
-- Until this is applied the site still works; the pack just cannot be bought or seen.

CREATE TABLE IF NOT EXISTS biodata_grants (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  granted_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS biodata_grants_user ON biodata_grants (user_id);
