-- Phase 1 PR 3: Pro checkout and renewal reminders.
-- Apply once after 0001: Cloudflare → D1 → herewegrow → Console, paste and run,
-- or: npx wrangler d1 migrations apply herewegrow --remote

-- A random token written with each grant; time is added only by the request whose token won,
-- so a payment verified twice (or at the same moment) adds its days once.
ALTER TABLE pass_grants ADD COLUMN token TEXT;

-- The pro_until value each reminder SMS was sent for, so each is sent once per pass end date.
ALTER TABLE entitlements ADD COLUMN reminded_soon INTEGER;
ALTER TABLE entitlements ADD COLUMN reminded_end INTEGER;

CREATE INDEX IF NOT EXISTS entitlements_until ON entitlements(pro_until);
