import { afterEach, describe, expect, it, vi } from 'vitest';
import { DAY_MS } from '../shared/plans';
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
