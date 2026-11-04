-- Promo codes: discounts, free-trial days, and one-time codes.
-- Apply once after 0003: Cloudflare → D1 → herewegrow → Console (one statement at a time),
-- or: npx wrangler d1 migrations apply herewegrow --remote
-- Times are Unix milliseconds. Prices are whole taka.

CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed', 'trial_days')),
  value INTEGER NOT NULL,
  scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'pro', 'template', 'service')),
  max_uses INTEGER,
  per_user INTEGER NOT NULL DEFAULT 1,
  starts_at INTEGER,
  expires_at INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL REFERENCES promo_codes(code),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  -- Gateway invoice id for paid orders; trial-<user id> for free trials. One redemption per invoice.
  invoice_id TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('discount', 'trial')),
  amount INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS promo_redemptions_code ON promo_redemptions(code);
CREATE INDEX IF NOT EXISTS promo_redemptions_user ON promo_redemptions(user_id, code);
-- One free trial per account, enforced by the database itself.
CREATE UNIQUE INDEX IF NOT EXISTS promo_one_trial_per_user ON promo_redemptions(user_id) WHERE kind = 'trial' AND user_id IS NOT NULL;
