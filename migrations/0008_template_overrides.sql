-- Admin controls for the template library: hide, feature, reorder, and fix a title or category without a deploy.
-- Apply once after 0007: Cloudflare → D1 → herewegrow → Console, one statement at a time.
-- Do NOT use `wrangler d1 migrations apply` for this database (earlier migrations were applied by hand).
-- A template with no row here behaves exactly as shipped in code. Hiding never deletes anything:
-- buyers keep their downloads, and a hidden template can be shown again at any time.
-- Times are Unix milliseconds.

CREATE TABLE IF NOT EXISTS template_overrides (
  id TEXT PRIMARY KEY,
  hidden INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER,
  hub TEXT,
  prof TEXT,
  title_en TEXT,
  title_bn TEXT,
  note TEXT,
  updated_at INTEGER NOT NULL
);
