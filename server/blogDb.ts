// Blog posts in D1. A post is public when its status is "scheduled" and its publish time has come:
// "publish now" and "schedule" are the same thing with a different time, and no job or rebuild is
// needed for a post to go live. migrations/0007_blog.sql is the schema; BLOG_SCHEMA repeats it so the
// admin can create the tables with one click (a test keeps the two identical).

import { readMinutes, type Post } from '../shared/blogParse';
import { draftMarkers, toIndexEntry, type BlogIndexEntry, type BlogStatus } from '../shared/blogAdmin';
import type { D1Like } from './cf';

export const BLOG_SCHEMA = [
  "CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, meta_title TEXT NOT NULL, meta_description TEXT NOT NULL, primary_keyword TEXT NOT NULL DEFAULT '', secondary_keywords TEXT NOT NULL DEFAULT '[]', author TEXT NOT NULL DEFAULT '', cta TEXT NOT NULL DEFAULT '', body_md TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','scheduled','unpublished')), publish_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
  'CREATE INDEX IF NOT EXISTS idx_blog_posts_live ON blog_posts(status, publish_at)',
  'CREATE TABLE IF NOT EXISTS blog_revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id TEXT NOT NULL, saved_at INTEGER NOT NULL, actor TEXT, note TEXT, snapshot TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS idx_blog_revisions_post ON blog_revisions(post_id, saved_at)',
  'CREATE TABLE IF NOT EXISTS blog_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, actor TEXT, post_id TEXT, action TEXT NOT NULL, detail TEXT)',
];

/** Default publish hour in Bangladesh time. */
export const DEFAULT_HOUR = 9;

/** The moment of `date` (YYYY-MM-DD) at `hour`:00 in Bangladesh (UTC+6), in ms. */
export function dhakaAt(date: string, hour = DEFAULT_HOUR): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d, hour - 6);
}

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string;
  author: string;
  cta: string;
  body_md: string;
  status: BlogStatus;
  publish_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface StoredPost extends Post {
  status: BlogStatus;
  publishAt: number | null;
  createdAt: number;
  updatedAt: number;
}

const COLUMNS = 'id, slug, title, meta_title, meta_description, primary_keyword, secondary_keywords, author, cta, body_md, status, publish_at, created_at, updated_at';
const LIVE = "status = 'scheduled' AND publish_at IS NOT NULL AND publish_at <= ?";

function rowToPost(r: BlogRow): StoredPost {
  let secondary: string[] = [];
  try {
    secondary = JSON.parse(r.secondary_keywords) as string[];
  } catch {
    /* keep empty */
  }
  const words = r.body_md.split(/\s+/).filter(Boolean).length;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    publishDate: r.publish_at === null ? '' : new Date(r.publish_at + 6 * 3600 * 1000).toISOString().slice(0, 10),
    author: r.author,
    primaryKeyword: r.primary_keyword,
    secondaryKeywords: secondary,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    cta: r.cta,
    body: r.body_md,
    minutes: readMinutes(words),
    status: r.status,
    publishAt: r.publish_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function blogTablesExist(db: D1Like): Promise<boolean> {
  try {
    await db.prepare('SELECT 1 FROM blog_posts LIMIT 1').first();
    return true;
  } catch {
    return false;
  }
}

export async function setupBlogTables(db: D1Like): Promise<void> {
  for (const sql of BLOG_SCHEMA) await db.prepare(sql).run();
}

/** Live posts, newest first. Throws if the tables are missing, so callers can tell "no posts" from "no database". */
export async function listLive(db: D1Like, now: number): Promise<StoredPost[]> {
  const { results } = await db.prepare(`SELECT ${COLUMNS} FROM blog_posts WHERE ${LIVE} ORDER BY publish_at DESC, id DESC`).bind(now).all<BlogRow>();
  return (results ?? []).map(rowToPost);
}

export async function getLive(db: D1Like, slug: string, now: number): Promise<StoredPost | null> {
  const row = await db.prepare(`SELECT ${COLUMNS} FROM blog_posts WHERE slug = ? AND ${LIVE}`).bind(slug, now).first<BlogRow>();
  return row ? rowToPost(row) : null;
}

export async function listAll(db: D1Like): Promise<StoredPost[]> {
  const { results } = await db.prepare(`SELECT ${COLUMNS} FROM blog_posts ORDER BY id`).all<BlogRow>();
  return (results ?? []).map(rowToPost);
}

export const toEntry = (p: StoredPost): BlogIndexEntry => toIndexEntry(p, p.status, p.publishAt);

export async function audit(db: D1Like, actor: string | null, postId: string | null, action: string, detail: string | null, now: number): Promise<void> {
  await db.prepare('INSERT INTO blog_audit (at, actor, post_id, action, detail) VALUES (?, ?, ?, ?, ?)').bind(now, actor, postId, action, detail).run();
}

/**
 * Adds posts that are not in the database yet (matched by slug or id); never changes an existing one.
 * A file approved for publishing becomes "scheduled" at 9:00 Bangladesh time on its publishDate;
 * a file that still has draft markers becomes a "draft".
 */
export async function seedPosts(db: D1Like, posts: Post[], now: number, actor: string | null): Promise<{ added: string[]; skipped: string[] }> {
  const added: string[] = [];
  const skipped: string[] = [];
  for (const p of posts) {
    const exists = await db.prepare('SELECT 1 AS x FROM blog_posts WHERE slug = ? OR id = ?').bind(p.slug, p.id).first();
    if (exists) {
      skipped.push(p.id);
      continue;
    }
    const draft = draftMarkers(p.body).length > 0;
    await db
      .prepare(`INSERT INTO blog_posts (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(p.id, p.slug, p.title, p.metaTitle, p.metaDescription, p.primaryKeyword, JSON.stringify(p.secondaryKeywords), p.author, p.cta, p.body, draft ? 'draft' : 'scheduled', dhakaAt(p.publishDate), now, now)
      .run();
    await audit(db, actor, p.id, 'seed', draft ? 'imported as draft (draft markers)' : `imported, scheduled for ${p.publishDate} 09:00`, now);
    added.push(p.id);
  }
  return { added, skipped };
}
