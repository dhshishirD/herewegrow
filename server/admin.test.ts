import { describe, expect, it } from 'vitest';
import { createSession, publicUser, userForPhone, SESSION_COOKIE, type AuthEnv } from './auth';
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
      path.split('?')[0],
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

describe('promo admin routes', () => {
  const asAdmin = async () => {
    const s = await setup();
    return { ...s, c: await s.cookie(s.admin.id) };
  };
  const make = (s: Awaited<ReturnType<typeof asAdmin>>, body: unknown) => s.call('/api/admin/promos', { method: 'POST', cookie: s.c, body });

  it('guards every promo route', async () => {
    const s = await setup();
    expect((await s.call('/api/admin/promos')).status).toBe(401);
    const m = await s.cookie(s.member.id);
    expect((await s.call('/api/admin/promos', { cookie: m })).status).toBe(403);
    expect((await s.call('/api/admin/promos', { method: 'POST', cookie: m, body: { code: 'X1X', type: 'fixed', value: 5 } })).status).toBe(403);
  });

  it('creates a code and lists it with usage', async () => {
    const s = await asAdmin();
    const res = await make(s, { code: 'eid30', type: 'percent', value: 30, scope: 'all', note: 'Eid offer' });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, codes: ['EID30'] });
    const list = (await (await s.call('/api/admin/promos', { cookie: s.c })).json()) as { promos: { code: string; used: number; active: boolean }[] };
    expect(list.promos).toEqual([expect.objectContaining({ code: 'EID30', used: 0, active: true, note: 'Eid offer' })]);
  });

  it('returns every validation error and a clear message for a duplicate', async () => {
    const s = await asAdmin();
    const bad = await make(s, { code: '!', type: 'percent', value: 500 });
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as { errors: string[] }).errors.length).toBeGreaterThanOrEqual(2);
    await make(s, { code: 'EID30', type: 'percent', value: 30 });
    expect((await make(s, { code: 'EID30', type: 'percent', value: 30 })).status).toBe(400);
  });

  it('makes a batch of single-use trial codes when a count is given', async () => {
    const s = await asAdmin();
    const res = await make(s, { prefix: 'WS', count: 10, type: 'trial_days', value: 7 });
    const body = (await res.json()) as { ok: boolean; codes: string[] };
    expect(body.ok).toBe(true);
    expect(body.codes).toHaveLength(10);
    const list = (await (await s.call('/api/admin/promos', { cookie: s.c })).json()) as { promos: { maxUses: number }[] };
    expect(list.promos.every((p) => p.maxUses === 1)).toBe(true);
  });

  it('switches a code off and on', async () => {
    const s = await asAdmin();
    await make(s, { code: 'EID30', type: 'percent', value: 30 });
    expect((await s.call('/api/admin/promos/EID30/disable', { method: 'POST', cookie: s.c })).status).toBe(200);
    const off = (await (await s.call('/api/admin/promos', { cookie: s.c })).json()) as { promos: { active: boolean }[] };
    expect(off.promos[0].active).toBe(false);
    expect((await s.call('/api/admin/promos/EID30/enable', { method: 'POST', cookie: s.c })).status).toBe(200);
    expect((await s.call('/api/admin/promos/NOPE1/disable', { method: 'POST', cookie: s.c })).status).toBe(404);
  });

  it('is POST-only and same-origin for changes', async () => {
    const s = await asAdmin();
    expect((await s.call('/api/admin/promos', { method: 'POST', cookie: s.c, body: { code: 'X1X', type: 'fixed', value: 5 }, origin: 'https://evil.example' })).status).toBe(403);
    expect((await s.call('/api/admin/promos/EID30/disable', { cookie: s.c })).status).toBe(405);
  });
});

describe('database failures', () => {
  const broken = async () => {
    const s = await setup();
    const c = await s.cookie(s.admin.id);
    // The session and user lookups still work; only the Career Hub tables are gone, like before migration 0003.
    await s.db.prepare('DROP TABLE roles').run().catch(() => {});
    return { ...s, c };
  };

  it('listing roles answers 500 with a database error, not a crash or an empty list', async () => {
    const { call, c, db } = await broken();
    await db.prepare('DROP TABLE IF EXISTS roles').run();
    const res = await call('/api/admin/roles', { cookie: c });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ ok: false, error: 'db' });
  });

  it('importing answers 500 with a database error', async () => {
    const { call, c, db } = await broken();
    await db.prepare('DROP TABLE IF EXISTS roles').run();
    const res = await call('/api/admin/roles/import', { method: 'POST', cookie: c, body: samplePack() });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ ok: false, error: 'db' });
  });
});

describe('User.isAdmin', () => {
  it('is false by default', async () => {
    const { member } = await setup();
    expect(member.isAdmin).toBe(false);
  });

  it('is exposed to the app through publicUser so the admin page can show', async () => {
    const { member, db, admin } = await setup();
    expect(publicUser(member).isAdmin).toBe(false);
    const fresh = (await db.prepare('SELECT is_admin FROM users WHERE id = ?').bind(admin.id).first<{ is_admin: number }>())!;
    expect(fresh.is_admin).toBe(1);
    expect(publicUser({ ...member, isAdmin: true }).isAdmin).toBe(true);
  });
});

describe('GET /api/admin/stats/*', () => {
  const paths = ['live', 'overview', 'pages', 'sources', 'audience', 'actions', 'funnel', 'revenue'].map((n) => `/api/admin/stats/${n}?preset=7d`);

  it('is 401 anonymous and 403 for a non-admin', async () => {
    const { call, cookie, member } = await setup();
    for (const p of paths) {
      expect((await call(p)).status).toBe(401);
      expect((await call(p, { cookie: await cookie(member.id) })).status).toBe(403);
    }
  });

  it('is 200 for an admin', async () => {
    const { call, cookie, admin } = await setup();
    const c = await cookie(admin.id);
    for (const p of paths) {
      const res = await call(p, { cookie: c });
      expect(res.status, p).toBe(200);
      expect(((await res.json()) as { ok: boolean }).ok).toBe(true);
    }
  });

  it('returns the documented payload shapes', async () => {
    const { call, cookie, admin } = await setup();
    const c = await cookie(admin.id);
    expect(await (await call('/api/admin/stats/overview?preset=7d', { cookie: c })).json()).toEqual({
      ok: true, visitors: 0, sessions: 0, pageviews: 0, bounceRate: 0, pagesPerSession: 0, approximate: false, daily: [],
    });
    expect(await (await call('/api/admin/stats/sources?preset=7d', { cookie: c })).json()).toEqual({ ok: true, sources: [] });
    expect(await (await call('/api/admin/stats/live', { cookie: c })).json()).toEqual({ ok: true, count: 0, visitors: [], newMessages: 0 });
    expect(await (await call('/api/admin/stats/revenue', { cookie: c })).json()).toEqual({ ok: true, today: 0, week: 0, proActivations: 0, orders: 0 });
    expect(((await (await call('/api/admin/stats/funnel?preset=7d', { cookie: c })).json()) as { steps: unknown[] }).steps).toHaveLength(4);
  });

  it('rejects a bad range with 400 { error: "range" }', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/stats/overview?from=x&to=y', { cookie: await cookie(admin.id) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'range' });
  });
});

describe('contact inbox admin routes', () => {
  const addMsg = (db: ReturnType<typeof fakeD1>, id: string, at: number, status = 'new') =>
    db.prepare('INSERT INTO contact_messages (id, created_at, name, phone, message, status) VALUES (?, ?, ?, ?, ?, ?)').bind(id, at, 'N', '01712345678', '<script>alert(1)</script>', status).run();

  it('list is 401 anonymous, 403 non-admin, 200 admin newest first with filter', async () => {
    const { call, cookie, member, admin, db } = await setup();
    await addMsg(db, 'a', 1);
    await addMsg(db, 'b', 2, 'closed');
    expect((await call('/api/admin/contacts')).status).toBe(401);
    expect((await call('/api/admin/contacts', { cookie: await cookie(member.id) })).status).toBe(403);
    const c = await cookie(admin.id);
    const all = (await (await call('/api/admin/contacts', { cookie: c })).json()) as { ok: boolean; messages: { id: string; message: string }[] };
    expect(all.ok).toBe(true);
    expect(all.messages.map((m) => m.id)).toEqual(['b', 'a']);
    expect(all.messages[0].message).toBe('<script>alert(1)</script>');
    const closed = (await (await call('/api/admin/contacts?status=closed', { cookie: c })).json()) as { messages: { id: string }[] };
    expect(closed.messages.map((m) => m.id)).toEqual(['b']);
    expect((await call('/api/admin/contacts?status=bogus', { cookie: c })).status).toBe(400);
  });

  it('POST updates status and note; 404 unknown id; 400 bad status or long note; 403 member', async () => {
    const { call, cookie, member, admin, db } = await setup();
    await addMsg(db, 'a', 1);
    const c = await cookie(admin.id);
    expect((await call('/api/admin/contacts/a', { method: 'POST', cookie: await cookie(member.id), body: { status: 'closed' } })).status).toBe(403);
    expect((await call('/api/admin/contacts/a', { method: 'POST', cookie: c, body: { status: 'replied', note: 'sent quote' } })).status).toBe(200);
    const row = (await db.prepare('SELECT status, note FROM contact_messages WHERE id = ?').bind('a').first())!;
    expect(row).toEqual({ status: 'replied', note: 'sent quote' });
    expect((await call('/api/admin/contacts/nope', { method: 'POST', cookie: c, body: { status: 'closed' } })).status).toBe(404);
    expect((await call('/api/admin/contacts/a', { method: 'POST', cookie: c, body: { status: 'weird' } })).status).toBe(400);
    expect((await call('/api/admin/contacts/a', { method: 'POST', cookie: c, body: { status: 'closed', note: 'x'.repeat(501) } })).status).toBe(400);
    expect((await call('/api/admin/contacts/a', { method: 'POST', cookie: c, body: { status: 'closed' }, origin: 'https://evil.example' })).status).toBe(403);
  });

  it('live includes newMessages counting only new', async () => {
    const { call, cookie, admin, db } = await setup();
    await addMsg(db, 'a', 1);
    await addMsg(db, 'b', 2);
    await addMsg(db, 'c', 3, 'replied');
    const live = (await (await call('/api/admin/stats/live', { cookie: await cookie(admin.id) })).json()) as { newMessages: number; count: number };
    expect(live).toMatchObject({ count: 0, newMessages: 2 });
  });
});

describe('/api/admin/manual', () => {
  const body = { kind: 'paid', phone: '01912345678', productId: 'pro-7', amount: 49, reference: 'TRX12345AB', note: 'bKash SMS seen' };

  it('is closed to signed-out visitors and to non-admin members, for reading and writing', async () => {
    const { call, cookie, member, db } = await setup();
    expect((await call('/api/admin/manual')).status).toBe(401);
    expect((await call('/api/admin/manual', { method: 'POST', body })).status).toBe(401);
    const c = await cookie(member.id);
    expect((await call('/api/admin/manual', { cookie: c })).status).toBe(403);
    expect((await call('/api/admin/manual', { method: 'POST', cookie: c, body })).status).toBe(403);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM manual_grants').first<{ n: number }>())?.n).toBe(0);
  });

  it('refuses a cross-site POST', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/manual', { method: 'POST', cookie: await cookie(admin.id), body, origin: 'https://evil.example' });
    expect(res.status).toBe(403);
  });

  it('lets an admin approve, lists it with their id, and answers 409 for the same transaction id', async () => {
    const { call, cookie, admin, db } = await setup();
    const c = await cookie(admin.id);
    const ok = await call('/api/admin/manual', { method: 'POST', cookie: c, body });
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { proUntil: number }).proUntil).toBeGreaterThan(0);
    expect((await call('/api/admin/manual', { method: 'POST', cookie: c, body })).status).toBe(409);
    const list = (await (await call('/api/admin/manual', { cookie: c })).json()) as { grants: { adminId: string }[] };
    expect(list.grants).toHaveLength(1);
    expect(list.grants[0].adminId).toBe(admin.id);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM pass_grants').first<{ n: number }>())?.n).toBe(1);
  });

  it('answers 400 with messages for bad input', async () => {
    const { call, cookie, admin } = await setup();
    const res = await call('/api/admin/manual', { method: 'POST', cookie: await cookie(admin.id), body: { ...body, phone: 'x', note: '' } });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { errors: string[] }).errors.length).toBeGreaterThan(0);
  });
});
