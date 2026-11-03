-- HereWeGrow Phase 1 schema (accounts, Pro passes, orders, saved CVs).
-- Apply once: Cloudflare → D1 → herewegrow → Console, paste and run,
-- or: npx wrangler d1 migrations apply herewegrow --remote
-- Times are Unix milliseconds.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  google_sub TEXT UNIQUE,
  name TEXT,
  lang TEXT NOT NULL DEFAULT 'bn',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pro_until INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  amount_bdt INTEGER NOT NULL,
  status TEXT NOT NULL,
  gateway_ref TEXT UNIQUE,
  phone TEXT,
  created_at INTEGER NOT NULL,
  paid_at INTEGER
);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_phone ON orders(phone);

CREATE TABLE IF NOT EXISTS pass_grants (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  days INTEGER NOT NULL,
  granted_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cvs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data_json TEXT NOT NULL,
  design TEXT,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cvs_user ON cvs(user_id);

CREATE TABLE IF NOT EXISTS template_claims (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  month TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, month)
);
