import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE } from './auth';
import { handleAdminBlog, type BlogAdminEnv } from './blogAdmin';
import { getAny } from './blogDb';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 10, 6); // Tue 10 Nov 2026, 12:00 Dhaka
const SUN = '2026-11-22';
const clean = 'বডি '.repeat(700);

const setup = async () => {
  const db = fakeD1();
  const env: BlogAdminEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 's' };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const member = await userForPhone(db, '01812345678', 'bn', NOW);
  const add = (id: string, o: { status?: string; at?: number | null; body?: string; slug?: string; author?: string } = {}) =>
    db
      .prepare('INSERT INTO blog_posts (id, slug, title, meta_title, meta_description, primary_keyword, secondary_keywords, author, cta, body_md, status, publish_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, o.slug ?? `post-${id.toLowerCase()}`, `শিরোনাম ${id}`, 'মেটা', 'বর্ণনা', 'কী', '[]', o.author ?? 'লেখক', 'Builder', o.body ?? clean, o.status ?? 'draft', o.at ?? null, 1000, 1000)
      .run();
  const call = async (who: { id: string } | null, path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', now = NOW) => {
    const headers: Record<string, string> = { Origin: 'https://herewegrow.pro' };
    if (who) headers.Cookie = `${SESSION_COOKIE}=${await createSession(env, who.id, NOW)}`;
    const res = await handleAdminBlog(new Request(`https://herewegrow.pro${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), env, path, now);
    return { status: res.status, json: (await res.json()) as Record<string, any> };
  };
  const stamp = async (id: string) => (await getAny(db, id))!.updatedAt;
  const logs = async (id: string) => (await db.prepare('SELECT action, detail FROM blog_audit WHERE post_id = ? ORDER BY id').bind(id).all<{ action: string; detail: string }>()).results!;
  return { db, admin, member, add, call, stamp, logs };
};

const form = (over: Record<string, unknown> = {}) => ({ title: 'নতুন', slug: 'post-p001', metaTitle: 'মেটা', metaDescription: 'বর্ণনা', primaryKeyword: 'কী', secondaryKeywords: [], author: 'লেখক', cta: 'Builder', body: clean, ...over });

describe('post routes: access', () => {
  it('needs an admin and a same-site origin', async () => {
    const { admin, member, add, call, stamp } = await setup();
    await add('P001');
    expect((await call(null, '/api/admin/blog/posts/P001')).status).toBe(401);
    expect((await call(member, '/api/admin/blog/posts/P001')).status).toBe(403);
    expect((await call(member, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: 1000 })).status).toBe(403);
    expect((await call(admin, '/api/admin/blog/posts/P001')).status).toBe(200);
    const res = await handleAdminBlog(new Request('https://herewegrow.pro/api/admin/blog/posts/P001/save', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: '{}' }), {} as BlogAdminEnv, '/api/admin/blog/posts/P001/save', NOW);
    expect(res.status).toBe(403);
    expect(await stamp('P001')).toBe(1000);
  });
  it('404 for an unknown post', async () => {
    const { admin, call } = await setup();
    expect((await call(admin, '/api/admin/blog/posts/P999')).status).toBe(404);
    expect((await call(admin, '/api/admin/blog/posts/P999/save', { updatedAt: 1 })).status).toBe(404);
  });
});

describe('save', () => {
  it('stores the edit, keeps the old version and logs what changed', async () => {
    const { admin, add, call, logs } = await setup();
    await add('P001');
    const r = await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'বদলানো', body: `${clean} নতুন` }), updatedAt: 1000 });
    expect(r.status).toBe(200);
    expect(r.json.post.title).toBe('বদলানো');
    expect(r.json.revisions).toHaveLength(1);
    expect(r.json.revisions[0].note).toBe('edit');
    expect(await logs('P001')).toEqual([{ action: 'edit', detail: 'শিরোনাম, লেখা' }]);
  });
  it('does nothing when nothing changed', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    const first = await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'শিরোনাম P001' }), updatedAt: 1000 });
    expect(first.json.unchanged).toBe(true);
    expect(first.json.revisions).toHaveLength(0);
    expect(await stamp('P001')).toBe(1000);
  });
  it('refuses a stale form (409) and bad input (400)', async () => {
    const { admin, add, call } = await setup();
    await add('P001');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'এক' }), updatedAt: 1000 })).status).toBe(200);
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'দুই' }), updatedAt: 1000 })).json.error).toBe('stale');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ slug: 'Bad Slug' }), updatedAt: 5 })).status).toBe(409);
    const fresh = (await call(admin, '/api/admin/blog/posts/P001')).json.post.updatedAt;
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ slug: 'Bad Slug' }), updatedAt: fresh })).json.error).toBe('bad_slug');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { title: 'x', updatedAt: fresh })).json.error).toBe('bad_input');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form(), updatedAt: 'x' })).json.error).toBe('bad_input');
  });
  it('slug: free change on a draft, taken is refused, locked once scheduled', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    await add('P002');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ slug: 'post-p002' }), updatedAt: 1000 })).json.error).toBe('slug_taken');
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ slug: 'fresh-slug' }), updatedAt: 1000 })).json.post.slug).toBe('fresh-slug');
    const s = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    expect(s.status).toBe(200);
    expect((await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ slug: 'other-slug' }), updatedAt: await stamp('P001') })).json.error).toBe('slug_locked');
  });
  it('editing never changes status or time', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001', { status: 'scheduled', at: Date.UTC(2026, 10, 22, 3) });
    const r = await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'ঠিক করা', slug: 'post-p001' }), updatedAt: await stamp('P001') });
    expect(r.json.post.status).toBe('scheduled');
    expect(r.json.post.publishAt).toBe(Date.UTC(2026, 10, 22, 3));
  });
});

describe('schedule and reschedule', () => {
  it('schedules at 09:00 Dhaka by default and shows the checks', async () => {
    const { admin, add, call, stamp, logs } = await setup();
    await add('P001');
    const r = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    expect(r.status).toBe(200);
    expect(r.json.post).toMatchObject({ status: 'scheduled', publishAt: Date.UTC(2026, 10, 22, 3), publishDate: SUN, publishTime: '09:00' });
    expect(r.json.slotNotes).toEqual([]);
    expect((await logs('P001'))[0]).toEqual({ action: 'schedule', detail: '— → 2026-11-22 09:00' });
  });
  it('reschedule moves it, records both times and warns about an off-plan day and a clash', async () => {
    const { admin, add, call, stamp, logs } = await setup();
    await add('P001', { status: 'scheduled', at: Date.UTC(2026, 10, 22, 3) });
    await add('P002', { status: 'scheduled', at: Date.UTC(2026, 10, 24, 3) });
    const r = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: '2026-11-24', time: '20:30', updatedAt: await stamp('P001') });
    expect(r.json.post).toMatchObject({ publishDate: '2026-11-24', publishTime: '20:30' });
    expect(r.json.slotNotes).toEqual(['ওই দিনে আরও পোস্ট আছে: P002']);
    expect((await logs('P001'))[0]).toEqual({ action: 'reschedule', detail: '2026-11-22 09:00 → 2026-11-24 20:30' });
    const mon = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: '2026-11-23', updatedAt: await stamp('P001') });
    expect(mon.json.slotNotes[0]).toContain('সোমবার');
  });
  it('refuses past or invalid times and a post that is already live', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    await add('P002', { status: 'scheduled', at: NOW - 1000 });
    expect((await call(admin, '/api/admin/blog/posts/P001/schedule', { date: '2026-11-09', updatedAt: await stamp('P001') })).json.error).toBe('past');
    expect((await call(admin, '/api/admin/blog/posts/P001/schedule', { date: '2026-02-30', updatedAt: await stamp('P001') })).json.error).toBe('bad_time');
    expect((await call(admin, '/api/admin/blog/posts/P002/schedule', { date: SUN, updatedAt: await stamp('P002') })).json.error).toBe('live');
  });
  it('blocks a post with problems unless an override reason is given, and logs the override', async () => {
    const { admin, add, call, stamp, logs } = await setup();
    await add('P001', { body: `${clean} ⚠ যাচাই বাকি` });
    const blocked = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    expect(blocked.status).toBe(422);
    expect(blocked.json.problems[0]).toContain('খসড়ার চিহ্ন');
    expect((await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, override: 'ab', updatedAt: await stamp('P001') })).status).toBe(422);
    const ok = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, override: 'মালিক যাচাই করেছেন', updatedAt: await stamp('P001') });
    expect(ok.status).toBe(200);
    expect((await logs('P001'))[0].detail).toContain('ওভাররাইড: মালিক যাচাই করেছেন');
  });
});

describe('publish now, unpublish, mark', () => {
  it('publish now makes it live immediately', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    const r = await call(admin, '/api/admin/blog/posts/P001/publish-now', { updatedAt: await stamp('P001') });
    expect(r.json.post).toMatchObject({ status: 'live', publishAt: NOW });
    expect((await call(admin, '/api/admin/blog/posts/P001/publish-now', { updatedAt: await stamp('P001') })).json.error).toBe('live');
  });
  it('unpublish takes a live post down; unscheduling a future one makes it ready (or draft with problems)', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001', { status: 'scheduled', at: NOW - 1000 });
    await add('P002', { status: 'scheduled', at: Date.UTC(2026, 10, 22, 3) });
    await add('P003', { status: 'scheduled', at: Date.UTC(2026, 10, 24, 3), body: `${clean} TODO` });
    expect((await call(admin, '/api/admin/blog/posts/P001/unpublish', { updatedAt: await stamp('P001') })).json.post.status).toBe('unpublished');
    const two = await call(admin, '/api/admin/blog/posts/P002/unpublish', { updatedAt: await stamp('P002') });
    expect(two.json.post).toMatchObject({ status: 'ready', publishAt: null });
    expect((await call(admin, '/api/admin/blog/posts/P003/unpublish', { updatedAt: await stamp('P003') })).json.post.status).toBe('draft');
    expect((await call(admin, '/api/admin/blog/posts/P002/unpublish', { updatedAt: await stamp('P002') })).json.error).toBe('not_scheduled');
  });
  it('an unpublished post can be scheduled again', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001', { status: 'unpublished', at: NOW - 1000 });
    const r = await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    expect(r.json.post.status).toBe('scheduled');
  });
  it('mark ready needs no problems; a scheduled post cannot be marked', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    await add('P002', { body: `${clean} ⚠` });
    await add('P003', { status: 'scheduled', at: Date.UTC(2026, 10, 22, 3) });
    expect((await call(admin, '/api/admin/blog/posts/P001/mark', { status: 'ready', updatedAt: await stamp('P001') })).json.post.status).toBe('ready');
    expect((await call(admin, '/api/admin/blog/posts/P001/mark', { status: 'draft', updatedAt: await stamp('P001') })).json.post.status).toBe('draft');
    expect((await call(admin, '/api/admin/blog/posts/P002/mark', { status: 'ready', updatedAt: await stamp('P002') })).status).toBe(422);
    expect((await call(admin, '/api/admin/blog/posts/P003/mark', { status: 'draft', updatedAt: await stamp('P003') })).json.error).toBe('scheduled');
    expect((await call(admin, '/api/admin/blog/posts/P001/mark', { status: 'live', updatedAt: await stamp('P001') })).json.error).toBe('bad_input');
  });
});

describe('restore', () => {
  it('puts back the text of an earlier version and can itself be undone', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'এক' }), updatedAt: await stamp('P001') });
    const saved = await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'দুই' }), updatedAt: await stamp('P001') });
    const original = saved.json.revisions.at(-1).id; // the oldest: before the first edit
    const r = await call(admin, '/api/admin/blog/posts/P001/restore', { revisionId: original, updatedAt: await stamp('P001') });
    expect(r.json.post.title).toBe('শিরোনাম P001');
    expect(r.json.revisions[0].note).toBe('restore');
    const back = await call(admin, '/api/admin/blog/posts/P001/restore', { revisionId: r.json.revisions[0].id, updatedAt: await stamp('P001') });
    expect(back.json.post.title).toBe('দুই');
  });
  it('does not touch status or time, and rejects another post\'s revision', async () => {
    const { admin, add, call, stamp } = await setup();
    await add('P001');
    await add('P002', { status: 'scheduled', at: Date.UTC(2026, 10, 22, 3) });
    const e = await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: 'বদল' }), updatedAt: await stamp('P001') });
    const revId = e.json.revisions[0].id;
    expect((await call(admin, '/api/admin/blog/posts/P002/restore', { revisionId: revId, updatedAt: await stamp('P002') })).status).toBe(404);
    await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    const r = await call(admin, '/api/admin/blog/posts/P001/restore', { revisionId: revId, updatedAt: await stamp('P001') });
    expect(r.json.post).toMatchObject({ status: 'scheduled', publishDate: SUN });
  });
  it('keeps only the latest 50 revisions', async () => {
    const { admin, add, call, stamp, db } = await setup();
    await add('P001');
    for (let i = 0; i < 53; i++) await call(admin, '/api/admin/blog/posts/P001/save', { ...form({ title: `শিরোনাম ${i}` }), updatedAt: await stamp('P001') }, 'POST', NOW + i);
    const n = await db.prepare('SELECT COUNT(*) AS n FROM blog_revisions WHERE post_id = ?').bind('P001').first<{ n: number }>();
    expect(n!.n).toBe(50);
  });
});

describe('public effect', () => {
  it('a post scheduled in the past of tomorrow is not public yet, and is once its time comes', async () => {
    const { admin, add, call, stamp, db } = await setup();
    const { listLive } = await import('./blogDb');
    await add('P001');
    await call(admin, '/api/admin/blog/posts/P001/schedule', { date: SUN, updatedAt: await stamp('P001') });
    expect(await listLive(db, NOW)).toHaveLength(0);
    expect(await listLive(db, Date.UTC(2026, 10, 22, 3))).toHaveLength(1);
    await call(admin, '/api/admin/blog/posts/P001/unpublish', { updatedAt: await stamp('P001') });
    expect(await listLive(db, Date.UTC(2026, 10, 23))).toHaveLength(0);
  });
});
