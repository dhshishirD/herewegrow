import { beforeEach, describe, expect, it } from 'vitest';
import { parsePost } from '../shared/blogParse';
import { recordEvent, trackPurchase, type TrackInput } from './analytics';
import { createSession, SESSION_COOKIE, userForPhone } from './auth';
import { handleAdminBlog, type BlogAdminEnv } from './blogAdmin';
import { seedPosts } from './blogDb';
import { blogPerformance, clearPerformanceCache, computeCounts } from './blogPerformance';
import { rollupOld } from './retention';
import { fakeD1, fakeKV } from './testkit';

const DAY = 86_400_000;
// 2026-11-10 12:00 Dhaka. P001 went live 2026-11-01, P002 on 2026-11-08.
const NOW = Date.UTC(2026, 10, 10, 6);
const ago = (days: number, min = 0) => NOW - days * DAY + min * 60_000;
const SLUG1 = 'post-p001';
const SLUG2 = 'post-p002';

const input = (o: Partial<TrackInput>): TrackInput => ({
  vid: 'v1', sid: 's1', type: 'pageview', name: null, path: '/', ref: null,
  utmSource: null, utmMedium: null, utmCampaign: null, meta: null, ...o,
});
const ctx = (ts: number) => ({ ts, country: 'BD', device: 'mobile', userId: null });
const post = (n: number, date: string) =>
  parsePost(`---\nid: P00${n}\ntitle: "শিরোনাম ${n}"\nslug: post-p00${n}\npublishDate: ${date}\nauthor: লেখক\nprimaryKeyword: কী\nmetaTitle: "মেটা"\nmetaDescription: "বর্ণনা"\ncta: Builder\n---\n${'বডি '.repeat(700)}\n\n| ক | খ |\n|---|---|\n| ১ | ২ |\n`, `P00${n}.md`);

async function setup() {
  const db = fakeD1();
  await seedPosts(db, [post(1, '2026-11-01'), post(2, '2026-11-08')], NOW - 20 * DAY, 'admin');
  return db;
}
const view = (db: ReturnType<typeof fakeD1>, vid: string, slug: string, ts: number, o: Partial<TrackInput> = {}) =>
  recordEvent(db, input({ vid, sid: `s-${vid}`, path: `/blog/${slug}`, ...o }), ctx(ts));
const ev = (db: ReturnType<typeof fakeD1>, vid: string, name: string, ts: number, meta?: object | string, path = '/') =>
  recordEvent(db, input({ vid, sid: `s-${vid}`, type: 'event', name, path, meta: meta === undefined ? null : typeof meta === 'string' ? meta : JSON.stringify(meta) }), ctx(ts));

/** Three readers of P001 and one of P002, one of them acting. */
async function seedReaders(db: ReturnType<typeof fakeD1>, daysAgo = 2) {
  await view(db, 'v1', SLUG1, ago(daysAgo), { ref: 'https://www.google.com/' });
  await view(db, 'v2', SLUG1, ago(daysAgo, 1), { utmSource: 'facebook' });
  await view(db, 'v3', SLUG1, ago(daysAgo, 2));
  await view(db, 'v1', SLUG1, ago(daysAgo, 3)); // same visitor again: still one visitor
  await view(db, 'v4', SLUG2, ago(daysAgo, 4));
  await ev(db, 'v1', 'blog_exit', ago(daysAgo, 5), { s: SLUG1, sc: 75, t: 45 });
  await ev(db, 'v2', 'blog_exit', ago(daysAgo, 6), { s: SLUG1, sc: 25, t: 10 });
  await ev(db, 'v1', 'blog_cta_click', ago(daysAgo, 4), { s: SLUG1, cta: 'builder', pos: 'middle' });
  await ev(db, 'v1', 'builder_start', ago(daysAgo, 6), undefined, '/builder'); // 6 min after the view: this post
  await ev(db, 'v3', 'checker_score', ago(daysAgo, 60), { score: 50 }, '/tools/cv-checker'); // 58 min after: not attributed
  await ev(db, 'v4', 'blog_exit', ago(daysAgo, 5), 'garbage{'); // malformed meta must not break anything
}

beforeEach(() => clearPerformanceCache());

describe('computeCounts', () => {
  it('counts visitors, reads, CTA clicks, tool starts and actions per post', async () => {
    const db = await setup();
    await seedReaders(db);
    const c = await computeCounts(db, '2026-11-01', '2026-11-10');
    const a = c.get(SLUG1)!;
    expect(a.views).toBe(3);
    expect(a.reads).toBe(1);
    expect(a.ctaClicks).toBe(1);
    expect(a.toolStarts).toBe(1);
    expect(a.actionVisitors).toBe(1); // v1 clicked and started the builder: one visitor
    expect(a.scroll).toEqual({ 0: 0, 25: 1, 50: 0, 75: 1, 100: 0 });
    expect(a.ctaByPos).toEqual({ top: 0, middle: 1, end: 0 });
    expect(a.ctaByKind).toEqual({ builder: 1 });
    expect(a.sources.map((s) => s.source).sort()).toEqual(['facebook', 'www.google.com']);
    expect(c.get(SLUG2)!.views).toBe(1);
    expect(c.get(SLUG2)!.reads).toBe(0);
  });

  it('only counts the requested Dhaka days', async () => {
    const db = await setup();
    await seedReaders(db, 2);
    expect((await computeCounts(db, '2026-11-09', '2026-11-10')).size).toBe(0);
  });

  it('attributes a purchase to the last blog post the buyer read, and sums revenue', async () => {
    const db = await setup();
    await view(db, 'buyer', SLUG1, Date.now() - 2 * DAY);
    expect(await trackPurchase(db, { invoiceId: 'inv-1', productId: 'pro', amount: 499, vid: 'buyer', userId: null })).toBe(true);
    await trackPurchase(db, { invoiceId: 'inv-2', productId: 'pro', amount: 100, vid: 'nobody', userId: null });
    const today = new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10);
    const c = await computeCounts(db, '2026-01-01', today);
    expect(c.get(SLUG1)!.orders).toBe(1);
    expect(c.get(SLUG1)!.revenue).toBe(499);
  });
});

describe('blogPerformance', () => {
  it('returns per-post rates, an early verdict for thin data, and no traits panel under 10 live posts', async () => {
    const db = await setup();
    await seedReaders(db);
    const p = await blogPerformance(db, '30d', NOW);
    expect(p.livePosts).toBe(2);
    const one = p.posts.find((x) => x.id === 'P001')!;
    expect(one.counts.views).toBe(3);
    expect(one.rates.readRate).toBeCloseTo(1 / 3);
    expect(one.rates.actionRate).toBeCloseTo(1 / 3);
    expect(one.verdict.kind).toBe('early');
    expect(one.daysLive).toBe(10);
    expect(p.traits).toBeNull();
    expect(p.top.views?.id).toBe('P001');
    expect(p.top.revenue).toBeNull();
  });

  it('the range toggle changes the numbers but not the verdict inputs', async () => {
    const db = await setup();
    await seedReaders(db, 8); // after P001 went live, before the 7-day window
    const week = await blogPerformance(db, '7d', NOW);
    expect(week.posts.find((x) => x.id === 'P001')!.counts.views).toBe(0);
    expect(week.posts.find((x) => x.id === 'P001')!.allViews).toBe(3);
  });

  it('is cached for five minutes', async () => {
    const db = await setup();
    await seedReaders(db);
    const a = await blogPerformance(db, 'all', NOW);
    await view(db, 'late', SLUG1, ago(1));
    const b = await blogPerformance(db, 'all', NOW + 60_000);
    expect(b.posts[0].counts.views).toBe(a.posts[0].counts.views);
    const c = await blogPerformance(db, 'all', NOW + 6 * 60_000);
    expect(c.posts[0].counts.views).toBe(a.posts[0].counts.views + 1);
  });
});

describe('rollup', () => {
  it('keeps post figures after the raw events are deleted', async () => {
    const db = await setup();
    await seedReaders(db, 95);
    const before = (await computeCounts(db, '2026-01-01', '2026-11-10')).get(SLUG1)!;
    expect(before.views).toBe(3);
    const r = await rollupOld(db, NOW);
    expect(r.days).toBe(1);
    const after = (await computeCounts(db, '2026-01-01', '2026-11-10')).get(SLUG1)!;
    for (const k of ['views', 'reads', 'ctaClicks', 'toolStarts', 'actionVisitors'] as const) expect(after[k]).toBe(before[k]);
  });
});

describe('GET /api/admin/blog/performance', () => {
  const run = async (range: string | null, who: 'admin' | 'member' | 'none', method = 'GET') => {
    const db = await setup();
    await seedReaders(db);
    const env: BlogAdminEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 's' };
    const admin = await userForPhone(db, '01712345678', 'bn', NOW);
    await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
    const member = await userForPhone(db, '01812345678', 'bn', NOW);
    const headers: Record<string, string> = { Origin: 'https://herewegrow.pro' };
    if (who !== 'none') headers.Cookie = `${SESSION_COOKIE}=${await createSession(env, (who === 'admin' ? admin : member).id, NOW)}`;
    const url = `https://herewegrow.pro/api/admin/blog/performance${range ? `?range=${range}` : ''}`;
    return handleAdminBlog(new Request(url, { method, headers }), env, '/api/admin/blog/performance', NOW);
  };

  it('is admin only', async () => {
    expect((await run('7d', 'none')).status).toBe(401);
    expect((await run('7d', 'member')).status).toBe(403);
  });
  it('rejects a bad range and a wrong method', async () => {
    expect((await run('year', 'admin')).status).toBe(400);
    expect((await run('7d', 'admin', 'POST')).status).toBe(405);
  });
  it('answers with the performance data, 30d by default', async () => {
    const res = await run(null, 'admin');
    expect(res.status).toBe(200);
    const d = (await res.json()) as { ok: boolean; range: string; posts: Array<{ id: string }> };
    expect(d.ok).toBe(true);
    expect(d.range).toBe('30d');
    expect(d.posts.map((p) => p.id)).toEqual(['P001', 'P002']);
  });
});
