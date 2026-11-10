import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE } from './auth';
import { handleAdminBlog, type BlogAdminEnv } from './blogAdmin';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 10, 6);
const entry = (id: string, publishDate: string) => ({
  id, title: id, slug: id.toLowerCase(), publishDate, author: 'লেখক', primaryKeyword: 'কী', metaTitle: 'মেটা', metaDescription: 'ড'.repeat(120), cta: 'Builder', words: 900, linksTo: [], draftMarkers: [],
});

const setup = async (index: unknown = [entry('P001', '2026-11-22'), entry('P000', '2026-11-01')]) => {
  const db = fakeD1();
  const asked: string[] = [];
  const env: BlogAdminEnv = {
    DB: db, KV: fakeKV(), SESSION_SECRET: 's',
    ASSETS: { fetch: async (r) => { asked.push(new URL(r.url).pathname); return new Response(JSON.stringify(index), { status: index === null ? 404 : 200 }); } },
  };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const member = await userForPhone(db, '01812345678', 'bn', NOW);
  const call = async (who: { id: string } | null, method = 'GET') => {
    const headers: Record<string, string> = {};
    if (who) headers.Cookie = `${SESSION_COOKIE}=${await createSession(env, who.id, NOW)}`;
    return handleAdminBlog(new Request('https://herewegrow.pro/api/admin/blog', { method, headers }), env, NOW);
  };
  return { admin, member, call, asked };
};

describe('GET /api/admin/blog', () => {
  it('signed-out 401, non-admin 403, and the index is never read for them', async () => {
    const { member, call, asked } = await setup();
    expect((await call(null)).status).toBe(401);
    expect((await call(member)).status).toBe(403);
    expect(asked).toEqual([]);
  });

  it('gives an admin the posts with live and scheduled status', async () => {
    const { admin, call, asked } = await setup();
    const res = await call(admin);
    const d = (await res.json()) as { ok: boolean; live: number; scheduled: number; rows: Array<{ id: string; status: string }> };
    expect(res.status).toBe(200);
    expect(d.live).toBe(1);
    expect(d.scheduled).toBe(1);
    expect(d.rows.map((r) => [r.id, r.status])).toEqual([['P000', 'live'], ['P001', 'scheduled']]);
    expect(asked).toEqual(['/admin-blog-index.json']);
  });

  it('only GET is allowed, and a missing index is a 502', async () => {
    const a = await setup();
    expect((await a.call(a.admin, 'POST')).status).toBe(405);
    const b = await setup(null);
    expect((await b.call(b.admin)).status).toBe(502);
  });
});
