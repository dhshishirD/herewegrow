import { afterEach, describe, expect, it, vi } from 'vitest';
import { DAY_MS } from '../shared/plans';
import { recordEvent } from './analytics';
import { sources } from './stats';
import { createSession, SESSION_COOKIE, userForPhone } from './auth';
import { handleCheckout, handleVerify } from './handlers';
import type { Env } from './paymently';
import { fakeD1, fakeKV } from './testkit';

const SITE = 'https://herewegrow.pro';

const setup = async () => {
  const env: Env = { DB: fakeD1(), KV: fakeKV(), SESSION_SECRET: 's', PAYMENT_API_KEY: 'k' };
  const user = await userForPhone(env.DB!, '01712345678');
  const sid = await createSession(env, user.id);
  return { env, user, cookie: `${SESSION_COOKIE}=${sid}` };
};

const post = (path: string, body: unknown, cookie?: string) =>
  new Request(`${SITE}${path}`, {
    method: 'POST',
    headers: { Origin: SITE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });

/** Fake gateway: records checkout payloads; verify answers with what the test sets. */
const gateway = (verifyReply: (sent: Record<string, unknown>) => Record<string, unknown>) => {
  const sent: Record<string, unknown>[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    if (url.endsWith('/verify-payment')) return Response.json(verifyReply(sent.at(-1)!));
    sent.push(body);
    return Response.json({ status: true, payment_url: 'https://pay.example/abc' });
  });
  return sent;
};

afterEach(() => vi.unstubAllGlobals());

describe('Pro checkout', () => {
  it('asks to log in first', async () => {
    const { env } = await setup();
    gateway(() => ({}));
    const res = await handleCheckout(post('/api/checkout', { productId: 'pro-30' }), env);
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: 'login' });
  });

  it('charges the plan price and tags the account, ignoring any price sent', async () => {
    const { env, user, cookie } = await setup();
    const sent = gateway(() => ({}));
    const res = await handleCheckout(post('/api/checkout', { productId: 'pro-30', amount: 1, price: 1 }, cookie), env);
    expect(await res.json()).toEqual({ ok: true, paymentUrl: 'https://pay.example/abc' });
    expect(sent[0]).toMatchObject({ amount: '149', metadata: { product_id: 'pro-30', user_id: user.id, phone: '01712345678' } });
  });
});

describe('Pro verify', () => {
  const paid = (amount: string) => (s: Record<string, unknown>) => ({ status: 'COMPLETED', amount, metadata: s.metadata, transaction_id: 'TRX1' });

  it('grants Pro once, even when the success page is reloaded', async () => {
    const { env, cookie } = await setup();
    gateway(paid('149.00'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30' }, cookie), env);
    const before = Date.now();
    const first = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV9' }), env)).json()) as { status: string; proUntil: number };
    const again = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV9' }), env)).json()) as { status: string; proUntil: number };
    expect(first.status).toBe('paid');
    expect(first.proUntil).toBeGreaterThanOrEqual(before + 30 * DAY_MS);
    expect(again.proUntil).toBe(first.proUntil);
  });

  it('gives no Pro when less than the price was paid', async () => {
    const { env, user, cookie } = await setup();
    gateway(paid('49'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-365' }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV10' }), env)).json()) as { status: string };
    expect(r.status).toBe('unpaid');
    const e = await env.DB!.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(user.id).first<{ pro_until: number | null }>();
    expect(e?.pro_until).toBeNull();
  });

  it('reports pending payments without granting', async () => {
    const { env, cookie } = await setup();
    gateway((s) => ({ status: 'PENDING', amount: '49', metadata: s.metadata }));
    await handleCheckout(post('/api/checkout', { productId: 'pro-7' }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV11' }), env)).json()) as { status: string; proUntil?: number };
    expect(r.status).toBe('pending');
    expect(r.proUntil).toBeUndefined();
  });
});

describe('purchase event', () => {
  const paid = (amount: string) => (s: Record<string, unknown>) => ({ status: 'COMPLETED', amount, metadata: s.metadata, transaction_id: 'TRX1' });
  type Ev = { name: string; vid: string | null; user_id: string | null; dedupe_key: string; meta: string };
  const purchases = (env: Env) => env.DB!.prepare("SELECT name, vid, user_id, dedupe_key, meta FROM events WHERE name = 'purchase'").all<Ev>();
  const seed = (env: Env, vid: string, utmSource: string | null, ts: number, refHost: string | null = null) =>
    recordEvent(
      env.DB!,
      { vid, sid: 's', type: 'pageview', name: null, path: '/', ref: refHost ? `https://${refHost}/x` : null, utmSource, utmMedium: utmSource ? 'cpc' : null, utmCampaign: utmSource ? 'eid' : null, meta: null },
      { ts, country: null, device: 'mobile', userId: null },
    );

  it('puts the sanitised vid into the payment metadata for both checkouts', async () => {
    const { env, cookie } = await setup();
    const sent = gateway(() => ({}));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: ` ${'v'.repeat(80)} ` }), env);
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', vid: 'vid-pro' }, cookie), env);
    await handleCheckout(post('/api/checkout', { productId: 'cv-review' }), env);
    expect((sent[0].metadata as Record<string, string>).vid).toBe('v'.repeat(64));
    expect((sent[1].metadata as Record<string, string>).vid).toBe('vid-pro');
    expect((sent[2].metadata as Record<string, string>).vid).toBe('');
  });

  it('records one purchase for a paid template/service order, attributed to the first utm_source, once', async () => {
    const { env } = await setup();
    await seed(env, 'vA', 'facebook', 1000);
    await seed(env, 'vA', 'google', 2000);
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'vA' }), env);
    const first = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV1' }), env)).json()) as { status: string };
    await handleVerify(post('/api/verify', { invoiceId: 'INV1' }), env);
    expect(first.status).toBe('paid');
    const rows = (await purchases(env)).results!;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ vid: 'vA', dedupe_key: 'purchase:INV1' });
    expect(JSON.parse(rows[0].meta)).toEqual({ amount: 199, product: 'cv-review', source: 'facebook', medium: 'cpc', campaign: 'eid' });
  });

  it('falls back to the earliest referrer host, then direct', async () => {
    const { env } = await setup();
    await seed(env, 'vR', null, 1000, 'www.google.com');
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'vR' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'INV2' }), env);
    await handleCheckout(post('/api/checkout', { productId: 'cv-review' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'INV3' }), env);
    const metas = Object.fromEntries((await purchases(env)).results!.map((r) => [r.dedupe_key, JSON.parse(r.meta)]));
    expect(metas['purchase:INV2']).toMatchObject({ source: 'www.google.com', medium: '', campaign: '' });
    expect(metas['purchase:INV3']).toMatchObject({ source: 'direct', medium: '', campaign: '' });
  });

  it('caps a very long referrer host so the purchase meta stays valid JSON and sources() still works', async () => {
    const { env } = await setup();
    await seed(env, 'vL', null, 1000, `${'a'.repeat(250)}.com`);
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'vL' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'INVL' }), env);
    const rows = (await purchases(env)).results!;
    expect(rows).toHaveLength(1);
    const meta = JSON.parse(rows[0].meta) as { source: string; amount: number };
    expect(meta.source).toBe('a'.repeat(40));
    expect(meta.amount).toBe(199);
    const s = await sources(env.DB!, { from: '1970-01-01', to: '2100-01-01' });
    expect(s.some((r) => r.source === 'a'.repeat(40) && r.paid === 1)).toBe(true);
  });

  it('records one purchase for a Pro pass, with the user id, once', async () => {
    const { env, user, cookie } = await setup();
    await seed(env, 'vP', 'newsletter', 1000);
    gateway(paid('149.00'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', vid: 'vP' }, cookie), env);
    await handleVerify(post('/api/verify', { invoiceId: 'INV4' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'INV4' }), env);
    const rows = (await purchases(env)).results!;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ vid: 'vP', user_id: user.id, dedupe_key: 'purchase:INV4' });
    expect(JSON.parse(rows[0].meta)).toMatchObject({ amount: 149, product: 'pro-30', source: 'newsletter' });
  });

  it('writes no purchase when re-verifying an order that was already recorded (pre-analytics invoice), and answers the same', async () => {
    const fresh = await setup();
    const old = await setup();
    // an invoice paid before this deploy: its order row exists, but it has no purchase event
    await old.env.DB!.prepare("INSERT INTO orders (id, product_id, amount_bdt, status, gateway_ref, created_at, paid_at) VALUES ('o1', 'cv-review', 199, 'paid', 'OLD1', 1, 1)").run();
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'vX' }), fresh.env);
    const a = await (await handleVerify(post('/api/verify', { invoiceId: 'OLD1' }), fresh.env)).json();
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'vX' }), old.env);
    const b = await (await handleVerify(post('/api/verify', { invoiceId: 'OLD1' }), old.env)).json();
    expect(b).toEqual(a);
    expect(b).toMatchObject({ ok: true, status: 'paid' });
    expect((await purchases(old.env)).results).toEqual([]);
    expect((await purchases(fresh.env)).results).toHaveLength(1);
  });

  it('writes no purchase when re-verifying a Pro pass granted before analytics, and still answers paid', async () => {
    const { env, user, cookie } = await setup();
    await env.DB!.prepare("INSERT INTO pass_grants (order_id, user_id, plan_id, days, granted_at) VALUES ('OLDP', ?, 'pro-30', 30, 1)").bind(user.id).run();
    await env.DB!.prepare('INSERT INTO entitlements (user_id, pro_until, updated_at) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET pro_until = excluded.pro_until').bind(user.id, Date.now() + DAY_MS).run();
    gateway(paid('149.00'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', vid: 'vO' }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'OLDP' }), env)).json()) as { status: string; proUntil: number };
    expect(r.status).toBe('paid');
    expect(r.proUntil).toBeGreaterThan(Date.now());
    expect((await purchases(env)).results).toEqual([]);
  });

  it('writes no purchase for unpaid, pending or mismatched payments', async () => {
    const { env, cookie } = await setup();
    gateway((s) => ({ status: 'PENDING', amount: '199', metadata: s.metadata }));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'v1' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'A' }), env);
    gateway((s) => ({ status: 'COMPLETED', amount: '10', metadata: s.metadata }));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'v1' }), env);
    await handleVerify(post('/api/verify', { invoiceId: 'B' }), env);
    gateway(paid('49'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-365', vid: 'v1' }, cookie), env);
    await handleVerify(post('/api/verify', { invoiceId: 'C' }), env);
    expect((await purchases(env)).results).toEqual([]);
  });

  it('still returns the normal paid response when the event insert throws', async () => {
    const { env, cookie } = await setup();
    const real = env.DB!;
    env.DB = { ...real, prepare: (sql: string) => { if (sql.includes('INTO events')) throw new Error('events down'); return real.prepare(sql); } };
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    gateway(paid('199'));
    await handleCheckout(post('/api/checkout', { productId: 'cv-review', vid: 'v1' }), env);
    const t = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV7' }), env)).json()) as { status: string; amount: number };
    expect(t).toMatchObject({ ok: true, status: 'paid', amount: 199, downloads: [] });
    gateway(paid('149.00'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', vid: 'v1' }, cookie), env);
    const p = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV8' }), env)).json()) as { status: string; proUntil: number };
    expect(p.status).toBe('paid');
    expect(p.proUntil).toBeGreaterThan(Date.now());
    // a template whose files are in the bucket: the links survive the tracking failure
    env.FILES = { head: async () => ({ size: 7 }), get: async () => null };
    gateway(paid('249'));
    await handleCheckout(post('/api/checkout', { productId: 'pack-best-40', vid: 'v1' }), env);
    const k = (await (await handleVerify(post('/api/verify', { invoiceId: 'INV9' }), env)).json()) as { status: string; downloads: { file: string }[] };
    expect(k.status).toBe('paid');
    expect(k.downloads.map((d) => d.file)).toEqual(['pack-best-40.zip']);
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});
