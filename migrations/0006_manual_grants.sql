-- Manual access: an admin approves a payment seen outside the gateway, or grants free access. Every action is kept here.
-- Apply once after 0005: Cloudflare → D1 → herewegrow → Console, one statement at a time (not `wrangler d1 migrations apply`).
-- Times are Unix milliseconds. `reference` is the customer's payment transaction id; it can be approved only once.

CREATE TABLE IF NOT EXISTS manual_grants (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  admin_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('paid', 'free')),
  phone TEXT NOT NULL,
  user_id TEXT,
  product_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  reference TEXT,
  invoice_id TEXT NOT NULL UNIQUE,
  note TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS manual_grants_reference ON manual_grants (reference) WHERE reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS manual_grants_created ON manual_grants (created_at);
