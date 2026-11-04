-- Phase 2 PR 1: Career Hub tables and the admin flag.
-- Apply once after 0002: Cloudflare → D1 → herewegrow → Console (one statement at a time),
-- or: npx wrangler d1 migrations apply herewegrow --remote
-- Times are Unix milliseconds.
--
-- After applying, make yourself the admin (replace the phone number with yours):
--   UPDATE users SET is_admin = 1 WHERE phone = '01XXXXXXXXX';

ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_bn TEXT,
  field TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  summary TEXT,
  seo_title TEXT,
  seo_desc TEXT,
  -- The whole validated role pack, so nothing from the import is lost (toolkit text, cover letter, interview questions).
  pack_json TEXT NOT NULL,
  published_at INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS roles_status ON roles(status, field);

CREATE TABLE IF NOT EXISTS role_assets (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('poster', 'video', 'pdf_toolkit', 'growth_pdf', 'goal_sheet')),
  r2_key TEXT,
  url TEXT,
  is_pro INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS role_assets_role ON role_assets(role_id);

CREATE TABLE IF NOT EXISTS role_courses (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT,
  url TEXT NOT NULL,
  is_affiliate INTEGER NOT NULL DEFAULT 0,
  skill_tag TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS role_courses_role ON role_courses(role_id, sort);

CREATE TABLE IF NOT EXISTS skill_questions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  skill_tag TEXT,
  q TEXT NOT NULL,
  options_json TEXT NOT NULL,
  answer_idx INTEGER NOT NULL,
  explain TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS skill_questions_role ON skill_questions(role_id, sort);

CREATE TABLE IF NOT EXISTS skill_results (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  gaps_json TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS skill_results_user ON skill_results(user_id);

CREATE TABLE IF NOT EXISTS course_clicks (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES role_courses(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (course_id, day)
);
