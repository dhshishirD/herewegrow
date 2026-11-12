-- Admin "Customers": an audit log of every customer lookup, and manual access by email.
-- Apply once after 0009: Cloudflare → D1 → herewegrow → Console, one statement at a time (not `wrangler d1 migrations apply`).
-- Times are Unix milliseconds. Run each statement below separately.

-- 1) Every time an admin searches and sees an account, or opens / exports a customer's CV, one row is written here.
--    The Customers page refuses to show anything if it cannot write this row.
CREATE TABLE IF NOT EXISTS admin_lookups (
  id TEXT PRIMARY KEY,
  at INTEGER NOT NULL,
  admin_id TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  action TEXT NOT NULL
);

-- 2) Look-up speed for "what did this admin open lately" and "who looked at this customer".
CREATE INDEX IF NOT EXISTS admin_lookups_at ON admin_lookups (at);

CREATE INDEX IF NOT EXISTS admin_lookups_user ON admin_lookups (user_id);

-- 3) Manual access can now be given to an account found by email. Phone stays as it is ('' when the account has no phone).
ALTER TABLE manual_grants ADD COLUMN email TEXT;
