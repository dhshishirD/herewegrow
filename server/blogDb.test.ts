import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parsePost } from '../shared/blogParse';
import { BLOG_SCHEMA, blogTablesExist, dhakaAt, getLive, listAll, listLive, seedPosts, setupBlogTables } from './blogDb';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 23, 5);
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const post = (id: string, date: string, body = 'বডি '.repeat(700)) =>
  parsePost(`---\nid: ${id}\ntitle: "শিরোনাম ${id}"\nslug: post-${id.toLowerCase()}\npublishDate: ${date}\nauthor: লেখক\nprimaryKeyword: কী\nsecondaryKeywords: [এক, দুই]\nmetaTitle: "মেটা"\nmetaDescription: "বর্ণনা"\ncta: Builder\n---\n${body}`, `${id}.md`);

describe('schema', () => {
  it('BLOG_SCHEMA is exactly migrations/0007_blog.sql', () => {
    const file = readFileSync(new URL('../migrations/0007_blog.sql', import.meta.url), 'utf8');
    expect(file.split(';').map(norm).filter(Boolean)).toEqual(BLOG_SCHEMA.map(norm));
  });

  it('setup is safe to repeat and tables are detected', async () => {
    const db = fakeD1();
    await setupBlogTables(db);
    await setupBlogTables(db);
    expect(await blogTablesExist(db)).toBe(true);
  });
});

describe('dhakaAt', () => {
  it('9:00 Bangladesh is 03:00 UTC', () => {
    expect(new Date(dhakaAt('2026-11-22')).toISOString()).toBe('2026-11-22T03:00:00.000Z');
    expect(new Date(dhakaAt('2026-11-22', 20)).toISOString()).toBe('2026-11-22T14:00:00.000Z');
  });
});

describe('seed and live', () => {
  it('imports approved posts as scheduled at 9:00, drafts for unfinished ones, and skips existing ones', async () => {
    const db = fakeD1();
    const res = await seedPosts(db, [post('P001', '2026-11-22'), post('P002', '2026-11-24', 'ছোট ⚠ যাচাই')], NOW, 'admin');
    expect(res).toEqual({ added: ['P001', 'P002'], skipped: [] });
    const all = await listAll(db);
    expect(all.map((p) => [p.id, p.status])).toEqual([['P001', 'scheduled'], ['P002', 'draft']]);
    expect(all[0].publishAt).toBe(dhakaAt('2026-11-22'));
    expect(all[0].secondaryKeywords).toEqual(['এক', 'দুই']);
    // a second run changes nothing, even if the file text changed
    const again = await seedPosts(db, [post('P001', '2026-12-31', 'নতুন লেখা')], NOW, 'admin');
    expect(again).toEqual({ added: [], skipped: ['P001'] });
    expect((await listAll(db))[0].body).toContain('বডি');
    const log = await db.prepare('SELECT action FROM blog_audit ORDER BY id').all<{ action: string }>();
    expect(log.results?.map((r) => r.action)).toEqual(['seed', 'seed']);
  });

  it('only scheduled posts whose time has come are live', async () => {
    const db = fakeD1();
    await seedPosts(db, [post('P001', '2026-11-22'), post('P002', '2026-11-24')], NOW, null);
    await db.prepare("INSERT INTO blog_posts (id, slug, title, meta_title, meta_description, body_md, status, publish_at, created_at, updated_at) VALUES ('P003','post-p003','t','m','d','b','unpublished',?,0,0)").bind(dhakaAt('2026-11-01')).run();
    await db.prepare("INSERT INTO blog_posts (id, slug, title, meta_title, meta_description, body_md, status, publish_at, created_at, updated_at) VALUES ('P004','post-p004','t','m','d','b','draft',NULL,0,0)").run();
    expect((await listLive(db, NOW)).map((p) => p.id)).toEqual(['P001']);
    expect(await getLive(db, 'post-p001', NOW)).not.toBeNull();
    expect(await getLive(db, 'post-p002', NOW)).toBeNull();
    expect(await getLive(db, 'post-p003', NOW)).toBeNull();
    expect(await getLive(db, 'post-p004', NOW)).toBeNull();
    // the moment of publish: live exactly at publish_at, not a millisecond before
    expect(await getLive(db, 'post-p002', dhakaAt('2026-11-24') - 1)).toBeNull();
    expect(await getLive(db, 'post-p002', dhakaAt('2026-11-24'))).not.toBeNull();
  });
});
