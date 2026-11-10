import { describe, expect, it } from 'vitest';
import { parsePost } from '../shared/blogParse';
import { createSession, userForPhone, SESSION_COOKIE } from './auth';
import { handleAdminBlog, type BlogAdminEnv } from './blogAdmin';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 10, 6);
const seedFile = [1, 2].map((n) =>
  parsePost(`---\nid: P00${n}\ntitle: "শিরোনাম ${n}"\nslug: post-${n}\npublishDate: 2026-11-2${n}\nauthor: লেখক\nprimaryKeyword: কী\nmetaTitle: "মেটা"\nmetaDescription: "বর্ণনা"\ncta: Builder\n---\n${'বডি '.repeat(700)}`, `P00${n}.md`),
);

const setup = async (withTables: boolean) => {
  const db = fakeD1();
  if (!withTables) for (const t of ['blog_audit', 'blog_revisions', 'blog_posts']) await db.prepare(`DROP TABLE ${t}`).run();
  const asked: string[] = [];
  const env: BlogAdminEnv = {
    DB: db, KV: fakeKV(), SESSION_SECRET: 's',
    ASSETS: { fetch: async (r) => { asked.push(new URL(r.url).pathname); return new Response(JSON.stringify(seedFile)); } },
  };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const member = await userForPhone(db, '01812345678', 'bn', NOW);
  const call = async (who: { id: string } | null, path = '/api/admin/blog', method = 'GET', origin: string | null = 'https://herewegrow.pro') => {
    const headers: Record<string, string> = {};
    if (who) headers.Cookie = `${SESSION_COOKIE}=${await createSession(env, who.id, NOW)}`;
    if (origin) headers.Origin = origin;
    return handleAdminBlog(new Request(`https://herewegrow.pro${path}`, { method, headers }), env, path, NOW);
  };
  return { admin, member, call, asked };
};

describe('/api/admin/blog', () => {
  it('signed-out 401, non-admin 403, and nothing is read for them', async () => {
    const { member, call, asked } = await setup(true);
    expect((await call(null)).status).toBe(401);
    expect((await call(member)).status).toBe(403);
    expect((await call(member, '/api/admin/blog/seed', 'POST')).status).toBe(403);
    expect(asked).toEqual([]);
  });

  it('says setup is needed until the tables exist, then setup, import and the dashboard work in order', async () => {
    const { admin, call } = await setup(false);
    expect(await (await call(admin)).json()).toEqual({ ok: true, setupNeeded: true });
    expect((await call(admin, '/api/admin/blog/seed', 'POST')).status).toBe(409);
    expect((await call(admin, '/api/admin/blog/setup', 'POST')).status).toBe(200);
    const before = (await (await call(admin)).json()) as { filesPending: number; rows: unknown[] };
    expect(before.rows).toEqual([]);
    expect(before.filesPending).toBe(2);
    const seeded = (await (await call(admin, '/api/admin/blog/seed', 'POST')).json()) as { added: string[] };
    expect(seeded.added).toEqual(['P001', 'P002']);
    const after = (await (await call(admin)).json()) as { filesPending: number; scheduled: number; rows: Array<{ id: string; status: string; publishTime: string }> };
    expect(after.filesPending).toBe(0);
    expect(after.scheduled).toBe(2);
    expect(after.rows.map((r) => [r.id, r.status, r.publishTime])).toEqual([['P001', 'scheduled', '09:00'], ['P002', 'scheduled', '09:00']]);
  });

  it('a second import adds nothing, and a post from another site origin is refused', async () => {
    const { admin, call } = await setup(true);
    await call(admin, '/api/admin/blog/seed', 'POST');
    expect(((await (await call(admin, '/api/admin/blog/seed', 'POST')).json()) as { added: string[] }).added).toEqual([]);
    expect((await call(admin, '/api/admin/blog/seed', 'POST', 'https://evil.example')).status).toBe(403);
    expect((await call(admin, '/api/admin/blog/setup', 'POST', null)).status).toBe(403);
  });
});
