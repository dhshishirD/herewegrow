import { afterEach, describe, expect, it, vi } from 'vitest';
import { findProduct } from '../shared/catalog';
import { DAY_MS } from '../shared/plans';
import { createSession, SESSION_COOKIE, userForPhone } from './auth';
import { handleCheckout, handleVerify } from './handlers';
import type { Env } from './paymently';
import { createPromo, listPromos, setPromoActive, type PromoInput } from './promo';
import { handlePromo } from './promoHandlers';
import { fakeD1, fakeKV } from './testkit';

const SITE = 'https://herewegrow.pro';
const SERVICE = findProduct('cv-fresher')!;

const setup = async () => {
  const env: Env = { DB: fakeD1(), KV: fakeKV(), SESSION_SECRET: 's', PAYMENT_API_KEY: 'k' };
  const user = await userForPhone(env.DB!, '01712345678');
  const cookie = `${SESSION_COOKIE}=${await createSession(env, user.id)}`;
  const code = (input: PromoInput) => createPromo(env.DB!, input, Date.now());
  return { env, user, cookie, code };
};

const post = (path: string, body: unknown, cookie?: string, origin: string | null = SITE) =>
  new Request(`${SITE}${path}`, {
    method: 'POST',
    headers: { ...(origin ? { Origin: origin } : {}), 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });

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
const paid = (amount: string) => (s: Record<string, unknown>) => ({ status: 'COMPLETED', amount, metadata: s.metadata, transaction_id: 'TRX1' });
const proUntil = async (env: Env, userId: string) =>
  (await env.DB!.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(userId).first<{ pro_until: number | null }>())?.pro_until ?? null;

afterEach(() => vi.unstubAllGlobals());

describe('promo on a Pro pass', () => {
  it('charges the discounted price, tags the code, grants Pro, and records the use once', async () => {
    const { env, user, cookie, code } = await setup();
    await code({ code: 'EID30', type: 'percent', value: 30, scope: 'all' });
    const sent = gateway(paid('105'));
    const res = await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo: ' eid30 ' }, cookie), env);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(sent[0]).toMatchObject({ amount: '105', metadata: { product_id: 'pro-30', promo: 'EID30', user_id: user.id } });

    const first = (await (await handleVerify(post('/api/verify', { invoiceId: 'P1' }), env)).json()) as { status: string };
    await handleVerify(post('/api/verify', { invoiceId: 'P1' }), env);
    expect(first.status).toBe('paid');
    expect(await proUntil(env, user.id)).toBeGreaterThan(Date.now() + 29 * DAY_MS);
    const [row] = await listPromos(env.DB!);
    expect(row).toMatchObject({ code: 'EID30', used: 1, discountTotal: 44 });
  });

  it('never charges less than 10 taka', async () => {
    const { env, cookie, code } = await setup();
    await code({ code: 'FREEISH', type: 'percent', value: 100, scope: 'pro' });
    const sent = gateway(paid('10'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-7', promo: 'FREEISH' }, cookie), env);
    expect(sent[0]).toMatchObject({ amount: '10' });
  });

  it('gives no Pro when less than the discounted price was paid', async () => {
    const { env, user, cookie, code } = await setup();
    await code({ code: 'EID30', type: 'percent', value: 30 });
    gateway(paid('49'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo: 'EID30' }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'P2' }), env)).json()) as { status: string };
    expect(r.status).toBe('unpaid');
    expect(await proUntil(env, user.id)).toBeNull();
    expect(await listPromos(env.DB!)).toMatchObject([{ used: 0 }]);
  });

  it('still honours a payment started before the code was switched off', async () => {
    const { env, user, cookie, code } = await setup();
    await code({ code: 'EID30', type: 'percent', value: 30 });
    gateway(paid('105'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo: 'EID30' }, cookie), env);
    await setPromoActive(env.DB!, 'EID30', false);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'P3' }), env)).json()) as { status: string };
    expect(r.status).toBe('paid');
    expect(await proUntil(env, user.id)).not.toBeNull();
  });

  it('a made-up promo in the payment cannot lower the price', async () => {
    const { env, user, cookie } = await setup();
    gateway((s) => ({ status: 'COMPLETED', amount: '49', transaction_id: 'T', metadata: { ...(s.metadata as object), promo: 'GHOST' } }));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30' }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'P4' }), env)).json()) as { status: string };
    expect(r.status).toBe('unpaid');
    expect(await proUntil(env, user.id)).toBeNull();
  });

  it('refuses bad codes at checkout without starting a payment', async () => {
    const { env, cookie, code } = await setup();
    await code({ code: 'TRIAL7', type: 'trial_days', value: 7 });
    await code({ code: 'SVC', type: 'fixed', value: 20, scope: 'service' });
    await code({ code: 'OLD', type: 'percent', value: 10, expiresAt: Date.now() - 1000 });
    const sent = gateway(() => ({}));
    const ask = async (promo: string) => {
      const res = await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo }, cookie), env);
      return { status: res.status, body: (await res.json()) as { error: string; reason: string } };
    };
    expect(await ask('NOPE')).toMatchObject({ status: 400, body: { error: 'promo', reason: 'invalid' } });
    expect(await ask('TRIAL7')).toMatchObject({ status: 400, body: { error: 'promo', reason: 'type' } });
    expect(await ask('SVC')).toMatchObject({ status: 400, body: { error: 'promo', reason: 'scope' } });
    expect(await ask('OLD')).toMatchObject({ status: 400, body: { error: 'promo', reason: 'expired' } });
    expect(sent).toHaveLength(0);
  });

  it('stops when the code is used up', async () => {
    const { env, cookie, code } = await setup();
    await code({ code: 'ONCE', type: 'fixed', value: 20, maxUses: 1 });
    gateway(paid('129'));
    await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo: 'ONCE' }, cookie), env);
    await handleVerify(post('/api/verify', { invoiceId: 'P5' }), env);
    const res = await handleCheckout(post('/api/checkout', { productId: 'pro-30', promo: 'ONCE' }, cookie), env);
    expect(await res.json()).toMatchObject({ error: 'promo', reason: 'used_up' });
  });
});

describe('promo on services and templates', () => {
  it('a guest can use a discount code on a service', async () => {
    const { env, code } = await setup();
    await code({ code: 'HALF', type: 'percent', value: 50 });
    const sent = gateway(paid(String(Math.ceil(SERVICE.price / 2))));
    await handleCheckout(post('/api/checkout', { productId: SERVICE.id, promo: 'half' }), env);
    expect(sent[0]).toMatchObject({ amount: String(Math.ceil(SERVICE.price / 2)), metadata: { promo: 'HALF' } });
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'S1' }), env)).json()) as { status: string };
    expect(r.status).toBe('paid');
    expect(await listPromos(env.DB!)).toMatchObject([{ code: 'HALF', used: 1 }]);
  });

  it('a service paid below the discounted price is not delivered', async () => {
    const { env, code } = await setup();
    await code({ code: 'HALF', type: 'percent', value: 50 });
    gateway(paid(String(Math.ceil(SERVICE.price / 2) - 1)));
    await handleCheckout(post('/api/checkout', { productId: SERVICE.id, promo: 'HALF' }), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'S2' }), env)).json()) as { status: string };
    expect(r.status).toBe('unpaid');
  });

  it('an ordinary service order without a code still costs the full price', async () => {
    const { env } = await setup();
    const sent = gateway(paid(String(SERVICE.price)));
    await handleCheckout(post('/api/checkout', { productId: SERVICE.id }), env);
    expect(sent[0]).toMatchObject({ amount: String(SERVICE.price), metadata: { promo: '' } });
  });

  it('a Pro member gets the better of the Pro discount and the code, never both', async () => {
    const { env, user, cookie, code } = await setup();
    const tpl = findProduct('pack-best-40')!;
    await env.DB!.batch([
      env.DB!.prepare('UPDATE entitlements SET pro_until = ? WHERE user_id = ?').bind(Date.now() + 5 * DAY_MS, user.id),
      env.DB!.prepare("INSERT INTO pass_grants (order_id, user_id, plan_id, days, granted_at) VALUES ('G1', ?, 'pro-7', 7, ?)").bind(user.id, Date.now()),
    ]);
    await code({ code: 'SMALL', type: 'percent', value: 10 });
    await code({ code: 'BIG', type: 'percent', value: 80 });
    const sent = gateway(() => ({}));
    await handleCheckout(post('/api/checkout', { productId: tpl.id, promo: 'SMALL' }, cookie), env);
    expect(sent[0]).toMatchObject({ amount: String(Math.ceil(tpl.price / 2)), metadata: { promo: '', pro_plan: 'pro-7' } });
    await handleCheckout(post('/api/checkout', { productId: tpl.id, promo: 'BIG' }, cookie), env);
    expect(sent[1]).toMatchObject({ amount: String(Math.max(10, Math.ceil(tpl.price * 0.2))), metadata: { promo: 'BIG' } });
  });
});

describe('POST /api/promo/check', () => {
  it('shows the price a code would give', async () => {
    const { env, code } = await setup();
    await code({ code: 'EID30', type: 'percent', value: 30 });
    const res = await handlePromo(post('/api/promo/check', { code: 'eid30', productId: 'pro-30' }), env, '/api/promo/check');
    expect(await res.json()).toEqual({ ok: true, kind: 'discount', code: 'EID30', type: 'percent', value: 30, list: 149, price: 105, discount: 44 });
  });

  it('recognises a trial code', async () => {
    const { env, code } = await setup();
    await code({ code: 'TRIAL7', type: 'trial_days', value: 7 });
    const res = await handlePromo(post('/api/promo/check', { code: 'TRIAL7', productId: 'pro-7' }), env, '/api/promo/check');
    expect(await res.json()).toEqual({ ok: true, kind: 'trial', code: 'TRIAL7', days: 7 });
  });

  it('answers a bad code with a 400 and a reason', async () => {
    const { env } = await setup();
    const res = await handlePromo(post('/api/promo/check', { code: 'NOPE', productId: 'pro-7' }), env, '/api/promo/check');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid' });
  });

  it('rejects cross-site calls and slows down guessing', async () => {
    const { env } = await setup();
    expect((await handlePromo(post('/api/promo/check', { code: 'X1X', productId: 'pro-7' }, undefined, 'https://evil.example'), env, '/api/promo/check')).status).toBe(403);
    let last = 0;
    for (let i = 0; i < 40; i++) last = (await handlePromo(post('/api/promo/check', { code: `NOPE${i}`, productId: 'pro-7' }), env, '/api/promo/check')).status;
    expect(last).toBe(429);
  });
});

describe('POST /api/promo/redeem', () => {
  it('needs a login', async () => {
    const { env, code } = await setup();
    await code({ code: 'TRIAL7', type: 'trial_days', value: 7 });
    expect((await handlePromo(post('/api/promo/redeem', { code: 'TRIAL7' }), env, '/api/promo/redeem')).status).toBe(401);
  });

  it('gives 7 free Pro days once per account', async () => {
    const { env, user, cookie, code } = await setup();
    await code({ code: 'TRIAL7', type: 'trial_days', value: 7 });
    const ok = await handlePromo(post('/api/promo/redeem', { code: 'trial7' }, cookie), env, '/api/promo/redeem');
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ ok: true, days: 7 });
    expect(await proUntil(env, user.id)).toBeGreaterThan(Date.now() + 6 * DAY_MS);
    const again = await handlePromo(post('/api/promo/redeem', { code: 'TRIAL7' }, cookie), env, '/api/promo/redeem');
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({ ok: false, error: 'trial_used' });
  });

  it('does not accept a discount code', async () => {
    const { env, cookie, code } = await setup();
    await code({ code: 'EID30', type: 'percent', value: 30 });
    const res = await handlePromo(post('/api/promo/redeem', { code: 'EID30' }, cookie), env, '/api/promo/redeem');
    expect(res.status).toBe(400);
  });

  it('rejects cross-site calls', async () => {
    const { env, cookie } = await setup();
    expect((await handlePromo(post('/api/promo/redeem', { code: 'TRIAL7' }, cookie, 'https://evil.example'), env, '/api/promo/redeem')).status).toBe(403);
  });
});
