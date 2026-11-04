import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE, type AuthEnv } from './auth';
import { handleAdmin } from './admin';
import { samplePack } from './rolePack.fixture';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 4, 6);

const setup = async () => {
  const db = fakeD1();
  const env: AuthEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 'test-secret' };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const member = await userForPhone(db, '01812345678', 'bn', NOW);
  const cookie = async (id: string) => `${SESSION_COOKIE}=${await createSession(env, id, NOW)}`;
  const call = (path: string, init: { method?: string; cookie?: string; body?: unknown; origin?: string | null } = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (init.cookie) headers.Cookie = init.cookie;
    if (init.origin !== null) headers.Origin = init.origin ?? 'https://herewegrow.pro';
    return handleAdmin(
      new Request(`https://herewegrow.pro${path}`, { method: init.method ?? 'GET', headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) }),
      env,
      path,
    );
  };
  return { db, env, admin, member, cookie, call };
};

describe('admin guard', () => {
  it('signed-out visitors get 401', async () => {
    const { call } = await setup();
    expect((await call('/api/admin/roles')).status).toBe(401);
  });

  it('a signed-in non-admin gets 403 on every admin route', async () => {
    const { call, cookie, member } = await setup();
    const c = await cookie(member.id);
    expect((await call('/api/admin/roles', { cookie: c })).status).toBe(403);
    expect((await call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack() })).status).toBe(403);
  });

  it('an admin can list roles', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/roles', { cookie: await cookie(admin.id) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, roles: [] });
  });

  it('unknown admin paths are 404 for admins', async () => {
    const { call, cookie, admin } = await setup();
    expect((await call('/api/admin/nope', { cookie: await cookie(admin.id) })).status).toBe(404);
  });
});

describe('POST /api/admin/roles/import', () => {
  it('imports a valid pack as a draft and lists it', async () => {
    const { call, cookie, admin } = await setup();
    const c = await cookie(admin.id);
    const res = await call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack() });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, created: true });
    const list = (await (await call('/api/admin/roles', { cookie: c })).json()) as { roles: { slug: string; status: string }[] };
    expect(list.roles).toEqual([expect.objectContaining({ slug: 'bank-officer', status: 'draft' })]);
  });

  it('returns 400 with every error for an invalid pack and saves nothing', async () => {
    const { call, cookie, admin, db } = await setup();
    const res = await call('/api/admin/roles/import', { method: 'POST', cookie: await cookie(admin.id), body: samplePack({ slug: 'BAD', test: [] }) });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; errors: string[] };
    expect(body.ok).toBe(false);
    expect(body.errors.length).toBeGreaterThanOrEqual(2);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM roles').first<{ n: number }>())!.n).toBe(0);
  });

  it('rejects a cross-site POST even from an admin', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/roles/import', { method: 'POST', cookie: await cookie(admin.id), body: samplePack(), origin: 'https://evil.example' });
    expect(res.status).toBe(403);
  });

  it('rejects a POST with no Origin header', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/roles/import', { method: 'POST', cookie: await cookie(admin.id), body: samplePack(), origin: null });
    expect(res.status).toBe(403);
  });

  it('rejects non-JSON bodies', async () => {
    const { env, cookie, admin } = await setup();
    const req = new Request('https://herewegrow.pro/api/admin/roles/import', {
      method: 'POST',
      headers: { Origin: 'https://herewegrow.pro', Cookie: await cookie(admin.id) },
      body: 'not json',
    });
    expect((await handleAdmin(req, env, '/api/admin/roles/import')).status).toBe(400);
  });

  it('returns 405 for GET on import', async () => {
    const { call, cookie, admin } = await setup();
    expect((await call('/api/admin/roles/import', { cookie: await cookie(admin.id) })).status).toBe(405);
  });
});

describe('publish routes', () => {
  const imported = async () => {
    const s = await setup();
    const c = await s.cookie(s.admin.id);
    const { id } = (await (await s.call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack() })).json()) as { id: string };
    return { ...s, c, id };
  };

  it('admin publishes then unpublishes a role', async () => {
    const { call, c, id, env } = await imported();
    const pub = await call(`/api/admin/roles/${id}/publish`, { method: 'POST', cookie: c });
    expect(pub.status).toBe(200);
    expect(await pub.json()).toMatchObject({ ok: true, slug: 'bank-officer' });
    expect(await env.KV!.get('career:bank-officer')).toContain('Bank Officer');
    expect((await call(`/api/admin/roles/${id}/unpublish`, { method: 'POST', cookie: c })).status).toBe(200);
    expect(await env.KV!.get('career:bank-officer')).toBeNull();
  });

  it('a non-admin cannot publish', async () => {
    const { call, cookie, member, id } = await imported();
    expect((await call(`/api/admin/roles/${id}/publish`, { method: 'POST', cookie: await cookie(member.id) })).status).toBe(403);
  });

  it('publish is POST-only, same-origin only, and 404 for unknown roles', async () => {
    const { call, c, id } = await imported();
    expect((await call(`/api/admin/roles/${id}/publish`, { cookie: c })).status).toBe(405);
    expect((await call(`/api/admin/roles/${id}/publish`, { method: 'POST', cookie: c, origin: 'https://evil.example' })).status).toBe(403);
    expect((await call('/api/admin/roles/missing/publish', { method: 'POST', cookie: c })).status).toBe(404);
  });

  it('re-importing a published role refreshes its public page', async () => {
    const { call, c, id, env } = await imported();
    await call(`/api/admin/roles/${id}/publish`, { method: 'POST', cookie: c });
    await call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack({ summary: 'Brand new summary text' }) });
    expect(await env.KV!.get('career:bank-officer')).toContain('Brand new summary text');
  });

  it('re-importing a draft does not create a public page', async () => {
    const { call, c, env } = await imported();
    await call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack({ summary: 'Still a draft' }) });
    expect(await env.KV!.get('career:bank-officer')).toBeNull();
  });
});

describe('User.isAdmin', () => {
  it('is false by default', async () => {
    const { member } = await setup();
    expect(member.isAdmin).toBe(false);
  });
});
