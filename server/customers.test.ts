import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE, type AuthEnv } from './auth';
import { handleAdmin } from './admin';
import { createManualGrant } from './manualAccess';
import { PLANS } from '../shared/plans';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 13, 6);
const plan = PLANS[0];

const setup = async () => {
  const db = fakeD1();
  const env: AuthEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 'test-secret' };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const member = await userForPhone(db, '01812345678', 'bn', NOW);
  // A Google-only customer: no phone.
  await db.prepare("INSERT INTO users (id, email, google_sub, name, created_at) VALUES ('g1', 'rajoni@example.com', 'sub1', 'Rajoni Hassan', ?)").bind(NOW).run();
  await db.prepare("INSERT INTO entitlements (user_id, updated_at) VALUES ('g1', ?)").bind(NOW).run();
  await db.prepare("INSERT INTO cvs (id, user_id, title, data_json, design, updated_at) VALUES ('cv1', 'g1', 'Rajoni CV', ?, 'classic', ?)").bind(JSON.stringify({ data: { name: 'Rajoni Hassan' }, design: 'classic' }), NOW).run();
  const cookie = async (id: string) => `${SESSION_COOKIE}=${await createSession(env, id, NOW)}`;
  const call = (path: string, init: { cookie?: string } = {}) =>
    handleAdmin(new Request(`https://herewegrow.pro${path}`, { headers: init.cookie ? { Cookie: init.cookie } : {} }), env, path.split('?')[0]);
  const logs = async () => (await db.prepare('SELECT * FROM admin_lookups ORDER BY at').all<Record<string, unknown>>()).results ?? [];
  return { db, admin, member, cookie, call, logs };
};

describe('admin customers: guard', () => {
  it('rejects signed-out (401) and non-admin (403) on every customers route, and logs nothing', async () => {
    const { call, cookie, member, logs } = await setup();
    const paths = ['/api/admin/customers?q=rajoni', '/api/admin/customers/log', '/api/admin/customers/g1/cvs/cv1'];
    for (const p of paths) {
      expect((await call(p)).status).toBe(401);
      expect((await call(p, { cookie: await cookie(member.id) })).status).toBe(403);
    }
    expect(await logs()).toEqual([]);
  });
});

describe('admin customers: search', () => {
  it('finds a Google-only customer by email and by name, and a phone customer by number', async () => {
    const { call, cookie, admin } = await setup();
    const c = await cookie(admin.id);
    for (const q of ['rajoni@example.com', 'rajoni h', 'EXAMPLE.com']) {
      const d = (await (await call(`/api/admin/customers?q=${encodeURIComponent(q)}`, { cookie: c })).json()) as { customers: { id: string; phone: string | null; cvs: { id: string; design: string }[] }[] };
      expect(d.customers.map((x) => x.id)).toEqual(['g1']);
      expect(d.customers[0].phone).toBeNull();
      expect(d.customers[0].cvs[0]).toMatchObject({ id: 'cv1', design: 'classic' });
    }
    const byPhone = (await (await call('/api/admin/customers?q=%2B8801812345678', { cookie: c })).json()) as { customers: { phone: string }[] };
    expect(byPhone.customers.map((x) => x.phone)).toEqual(['01812345678']);
  });

  it('treats % and _ literally and rejects very short or missing queries', async () => {
    const { call, cookie, admin, logs } = await setup();
    const c = await cookie(admin.id);
    const d = (await (await call('/api/admin/customers?q=%25%25%25', { cookie: c })).json()) as { customers: unknown[] };
    expect(d.customers).toEqual([]);
    expect((await call('/api/admin/customers?q=ab', { cookie: c })).status).toBe(400);
    expect((await call('/api/admin/customers', { cookie: c })).status).toBe(400);
    expect(await logs()).toHaveLength(1); // only the empty-result search; rejected queries touch nothing
  });

  it('logs one row per account shown, and one row for an empty search', async () => {
    const { call, cookie, admin, logs } = await setup();
    const c = await cookie(admin.id);
    await call('/api/admin/customers?q=rajoni', { cookie: c });
    await call('/api/admin/customers?q=nobody-here', { cookie: c });
    expect(await logs()).toMatchObject([
      { admin_id: admin.id, query: 'rajoni', user_id: 'g1', action: 'search' },
      { admin_id: admin.id, query: 'nobody-here', user_id: null, action: 'search' },
    ]);
  });

  it('shows Pro status, grants and orders for the account', async () => {
    const { db, call, cookie, admin } = await setup();
    const r = await createManualGrant(db, admin.id, { kind: 'free', contact: 'rajoni@example.com', productId: plan.id, note: 'Support fix' }, NOW);
    expect(r.ok).toBe(true);
    const d = (await (await call('/api/admin/customers?q=rajoni@example.com', { cookie: await cookie(admin.id) })).json()) as { customers: { proActive: boolean; grants: { kind: string }[]; passes: unknown[] }[] };
    expect(d.customers[0].grants).toMatchObject([{ kind: 'free' }]);
    expect(d.customers[0].passes).toHaveLength(1);
    expect(d.customers[0].proActive).toBe(true);
  });
});

describe('admin customers: opening a CV', () => {
  it('returns the CV and logs the view and the exports', async () => {
    const { call, cookie, admin, logs } = await setup();
    const c = await cookie(admin.id);
    for (const f of ['view', 'pdf', 'word']) {
      const res = await call(`/api/admin/customers/g1/cvs/cv1?for=${f}&q=rajoni`, { cookie: c });
      expect(res.status).toBe(200);
      expect(((await res.json()) as { cv: { state: { data: { name: string } } } }).cv.state.data.name).toBe('Rajoni Hassan');
    }
    expect((await logs()).map((l) => l.action)).toEqual(['cv_view', 'cv_pdf', 'cv_word']);
  });

  it('answers 404 for another account\'s CV or an unknown action, and logs nothing for them', async () => {
    const { call, cookie, admin, member, logs } = await setup();
    const c = await cookie(admin.id);
    expect((await call(`/api/admin/customers/${member.id}/cvs/cv1`, { cookie: c })).status).toBe(404);
    expect((await call('/api/admin/customers/g1/cvs/cv1?for=zip', { cookie: c })).status).toBe(400);
    expect(await logs()).toEqual([]);
  });

  it('shows nothing when the log cannot be written', async () => {
    const { db, call, cookie, admin } = await setup();
    await db.prepare('DROP TABLE admin_lookups').run();
    expect((await call('/api/admin/customers?q=rajoni', { cookie: await cookie(admin.id) })).status).toBe(500);
    expect((await call('/api/admin/customers/g1/cvs/cv1', { cookie: await cookie(admin.id) })).status).toBe(500);
  });
});

describe('manual access by email', () => {
  it('grants Pro to an existing email account without creating anything, and keeps the invoice flow', async () => {
    const { db, admin } = await setup();
    const r = await createManualGrant(db, admin.id, { kind: 'paid', contact: ' Rajoni@Example.com ', productId: plan.id, amount: plan.price, reference: 'EMAIL1234XY', note: 'bKash seen' }, NOW);
    if (!r.ok) throw new Error(JSON.stringify(r));
    expect(r.accountCreated).toBe(false);
    expect(r.grant).toMatchObject({ phone: '', email: 'rajoni@example.com' });
    expect(r.proUntil).toBeGreaterThan(NOW);
    const order = await db.prepare('SELECT user_id, phone FROM orders WHERE gateway_ref = ?').bind(r.grant.invoiceId).first<{ user_id: string; phone: string | null }>();
    expect(order).toEqual({ user_id: 'g1', phone: null });
    expect((await db.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>())!.n).toBe(3);
  });

  it('refuses an email with no account, and a malformed one, and writes nothing', async () => {
    const { db, admin } = await setup();
    for (const contact of ['nobody@example.com', 'not an@email']) {
      const r = await createManualGrant(db, admin.id, { kind: 'free', contact, productId: plan.id, note: 'test' }, NOW);
      expect(r.ok).toBe(false);
    }
    expect((await db.prepare('SELECT COUNT(*) AS n FROM manual_grants').first<{ n: number }>())!.n).toBe(0);
  });

  it('still accepts the old phone field', async () => {
    const { db, admin } = await setup();
    const r = await createManualGrant(db, admin.id, { kind: 'free', phone: '01912345678', productId: plan.id, note: 'old form' }, NOW);
    expect(r.ok && r.grant.phone).toBe('01912345678');
  });
});
