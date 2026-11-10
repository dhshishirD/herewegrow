import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE, type AuthEnv } from './auth';
import { handleAdmin } from './admin';
import { handleTemplateOverrides } from './templatePublic';
import { bulkHide, listOverrides, publicOverrides, setOverride, templateStats } from './templateAdmin';
import { fakeD1, fakeKV } from './testkit';
import { applyOverrides, cleanPatch } from '../shared/templateOverrides';
import { TEMPLATES, hubOf } from '../shared/templates';

const NOW = Date.UTC(2026, 10, 12, 6);
const A = TEMPLATES[0].id;
const B = TEMPLATES[1].id;
const C = TEMPLATES[2].id;

describe('cleanPatch', () => {
  it('accepts good fields and trims text', () => {
    const { patch, errors } = cleanPatch({ hidden: true, featured: false, sort: 3, hub: 'modern', titleEn: '  Blue   CV ', note: '' });
    expect(errors).toEqual([]);
    expect(patch).toMatchObject({ hidden: true, featured: false, sort: 3, hub: 'modern', titleEn: 'Blue CV', note: null });
  });
  it('rejects bad types, unknown category, fractional sort', () => {
    expect(cleanPatch({ hidden: 'yes', hub: 'nope', sort: 1.5 }).errors.sort()).toEqual(['hidden', 'hub', 'sort']);
  });
});

describe('applyOverrides', () => {
  it('hides, features first, orders, and fixes titles; no override = as shipped', () => {
    expect(applyOverrides(TEMPLATES, {}).map((t) => t.id)).toEqual(TEMPLATES.map((t) => t.id));
    const out = applyOverrides(TEMPLATES, { [A]: { hidden: true }, [C]: { featured: true }, [B]: { sort: -1, titleEn: 'Fixed', hub: 'simple' } });
    expect(out.map((t) => t.id)).not.toContain(A);
    expect(out[0].id).toBe(C);
    expect(out[1].id).toBe(B);
    expect(out[1].title.en).toBe('Fixed');
    expect(hubOf(out[1])).toBe('simple');
    expect(applyOverrides(TEMPLATES, { [A]: { hidden: true } }, { keepHidden: true }).map((t) => t.id)).toContain(A);
  });
});

describe('overrides storage', () => {
  it('sets fields independently, drops all-default rows, and rejects unknown ids', async () => {
    const db = fakeD1();
    expect(await setOverride(db, 'nope', { hidden: true })).toEqual({ ok: false, error: 'not_found' });
    expect((await setOverride(db, A, { hidden: 'x' })).ok).toBe(false);
    await setOverride(db, A, { hidden: true }, NOW);
    await setOverride(db, A, { titleEn: 'Better title' }, NOW);
    expect((await listOverrides(db))[A]).toMatchObject({ hidden: true, titleEn: 'Better title' });
    await setOverride(db, A, { hidden: false, titleEn: null }, NOW);
    expect(await listOverrides(db)).toEqual({});
  });
  it('keeps a private note out of the public list', async () => {
    const db = fakeD1();
    await setOverride(db, A, { note: 'duplicate of another', featured: true }, NOW);
    await setOverride(db, B, { note: 'only a note' }, NOW);
    const pub = await publicOverrides(db);
    expect(pub[A]).toBeDefined();
    expect(JSON.stringify(pub)).not.toContain('duplicate');
    expect(pub[B]).toBeUndefined();
  });
  it('bulk hide skips unknown ids', async () => {
    const db = fakeD1();
    expect(await bulkHide(db, [A, B, 'nope', A], true, NOW)).toBe(2);
    expect(Object.keys(await publicOverrides(db)).sort()).toEqual([A, B].sort());
    await bulkHide(db, [A], false, NOW);
    expect(Object.keys(await publicOverrides(db))).toEqual([B]);
  });
});

describe('stats', () => {
  it('counts recent views and single-template paid sales only', async () => {
    const db = fakeD1();
    const ins = (day: string, id: string) =>
      db.prepare("INSERT INTO events (ts, day, vid, sid, type, name, path, meta) VALUES (?, ?, 'v', 's', 'event', 'view_template', '/', ?)").bind(NOW, day, JSON.stringify({ id })).run();
    await ins('2026-11-12', A);
    await ins('2026-11-12', A);
    await ins('2026-09-01', A); // outside 30 days
    await db.prepare("INSERT INTO orders (id, product_id, amount_bdt, status, gateway_ref, created_at) VALUES ('o1', ?, 29, 'paid', 'g1', 1)").bind(`tpl-${B}`).run();
    await db.prepare("INSERT INTO orders (id, product_id, amount_bdt, status, gateway_ref, created_at) VALUES ('o2', ?, 29, 'pending', 'g2', 1)").bind(`tpl-${B}`).run();
    const s = await templateStats(db, 30, NOW);
    expect(s[A]).toEqual({ views: 2, sales: 0 });
    expect(s[B]).toEqual({ views: 0, sales: 1 });
  });
});

describe('routes', () => {
  const setup = async () => {
    const db = fakeD1();
    const env: AuthEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 'test-secret' };
    const admin = await userForPhone(db, '01712345678', 'bn', NOW);
    await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
    const member = await userForPhone(db, '01812345678', 'bn', NOW);
    const cookie = async (id: string) => `${SESSION_COOKIE}=${await createSession(env, id, NOW)}`;
    const call = (path: string, init: { method?: string; cookie?: string; body?: unknown } = {}) =>
      handleAdmin(
        new Request(`https://herewegrow.pro${path}`, {
          method: init.method ?? 'GET',
          headers: { 'Content-Type': 'application/json', Origin: 'https://herewegrow.pro', ...(init.cookie ? { Cookie: init.cookie } : {}) },
          body: init.body === undefined ? undefined : JSON.stringify(init.body),
        }),
        env,
        path,
      );
    return { db, env, admin, member, cookie, call };
  };

  it('is admin only', async () => {
    const { call, cookie, member } = await setup();
    expect((await call('/api/admin/templates')).status).toBe(401);
    const c = await cookie(member.id);
    expect((await call('/api/admin/templates', { cookie: c })).status).toBe(403);
    expect((await call(`/api/admin/templates/${A}`, { method: 'POST', cookie: c, body: { hidden: true } })).status).toBe(403);
  });

  it('admin hides a template; the public list reflects it; bad input is refused', async () => {
    const { call, cookie, admin, env } = await setup();
    const c = await cookie(admin.id);
    expect((await call(`/api/admin/templates/${A}`, { method: 'POST', cookie: c, body: { hidden: true } })).status).toBe(200);
    expect((await call('/api/admin/templates/nope', { method: 'POST', cookie: c, body: { hidden: true } })).status).toBe(404);
    expect((await call(`/api/admin/templates/${A}`, { method: 'POST', cookie: c, body: { hub: 'zzz' } })).status).toBe(400);
    const admin1 = (await (await call('/api/admin/templates', { cookie: c })).json()) as { overrides: Record<string, unknown>; stats: object };
    expect(Object.keys(admin1.overrides)).toEqual([A]);
    const pub = await handleTemplateOverrides(env);
    expect(pub.headers.get('Cache-Control')).toContain('max-age');
    expect(((await pub.json()) as { overrides: Record<string, unknown> }).overrides[A]).toMatchObject({ hidden: true });
    expect((await call('/api/admin/templates/bulk', { method: 'POST', cookie: c, body: { ids: [B, C], hidden: true } })).status).toBe(200);
    expect((await call('/api/admin/templates/bulk', { method: 'POST', cookie: c, body: { ids: [B] } })).status).toBe(400);
  });

  it('the public endpoint answers an empty list when the database fails', async () => {
    const res = await handleTemplateOverrides({ DB: { prepare: () => { throw new Error('down'); } } } as unknown as AuthEnv);
    expect(((await res.json()) as { overrides: object }).overrides).toEqual({});
  });
});
