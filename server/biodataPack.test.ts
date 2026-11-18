import { afterEach, describe, expect, it, vi } from 'vitest';
import { BIODATA_PACK } from '../shared/biodataPack';
import { createSession, SESSION_COOKIE, userForPhone } from './auth';
import { handleAuth } from './authHandlers';
import { grantBiodataPack, hasBiodataPack } from './biodataPack';
import { handleCheckout, handleVerify } from './handlers';
import type { D1Like } from './cf';
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
  new Request(`${SITE}${path}`, { method: 'POST', headers: { Origin: SITE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
const gateway = (reply: (sent: Record<string, unknown>) => Record<string, unknown>) => {
  const sent: Record<string, unknown>[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    if (url.endsWith('/verify-payment')) return Response.json(reply(sent.at(-1)!));
    sent.push(body);
    return Response.json({ status: true, payment_url: 'https://pay.example/abc' });
  });
  return sent;
};
const paid = (amount: string) => (s: Record<string, unknown>) => ({ status: 'COMPLETED', amount, metadata: s.metadata, transaction_id: 'TRXB1' });
afterEach(() => vi.unstubAllGlobals());

describe('Clean pack checkout', () => {
  it('costs 49 taka', () => expect(BIODATA_PACK.price).toBe(49));

  it('asks to log in first', async () => {
    const { env } = await setup();
    gateway(() => ({}));
    const res = await handleCheckout(post('/api/checkout', { productId: BIODATA_PACK.id }), env);
    expect(res.status).toBe(401);
  });

  it('charges 49 and tags the account, ignoring any price or promo sent', async () => {
    const { env, user, cookie } = await setup();
    const sent = gateway(() => ({}));
    const res = await handleCheckout(post('/api/checkout', { productId: BIODATA_PACK.id, amount: 1, promo: 'ANY' }, cookie), env);
    expect(await res.json()).toEqual({ ok: true, paymentUrl: 'https://pay.example/abc' });
    expect(sent[0]).toMatchObject({ amount: '49', metadata: { product_id: BIODATA_PACK.id, user_id: user.id } });
  });
});

describe('Clean pack verify', () => {
  it('unlocks the account once, even when the success page is reloaded', async () => {
    const { env, user, cookie } = await setup();
    gateway(paid('49.00'));
    await handleCheckout(post('/api/checkout', { productId: BIODATA_PACK.id }, cookie), env);
    expect(await hasBiodataPack(env.DB!, user.id)).toBe(false);
    const a = (await (await handleVerify(post('/api/verify', { invoiceId: 'INVB1' }), env)).json()) as { status: string; productId: string };
    const b = (await (await handleVerify(post('/api/verify', { invoiceId: 'INVB1' }), env)).json()) as { status: string };
    expect(a).toMatchObject({ status: 'paid', productId: BIODATA_PACK.id });
    expect(b.status).toBe('paid');
    expect(await hasBiodataPack(env.DB!, user.id)).toBe(true);
    const rows = await env.DB!.prepare("SELECT COUNT(*) AS n FROM orders WHERE product_id = ?").bind(BIODATA_PACK.id).first<{ n: number }>();
    expect(rows?.n).toBe(1);
  });

  it('does not unlock when less than 49 was paid', async () => {
    const { env, user, cookie } = await setup();
    gateway(paid('20'));
    await handleCheckout(post('/api/checkout', { productId: BIODATA_PACK.id }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'INVB2' }), env)).json()) as { status: string };
    expect(r.status).toBe('unpaid');
    expect(await hasBiodataPack(env.DB!, user.id)).toBe(false);
  });

  it('does not unlock a pending payment', async () => {
    const { env, user, cookie } = await setup();
    gateway((s) => ({ status: 'PENDING', amount: '49', metadata: s.metadata }));
    await handleCheckout(post('/api/checkout', { productId: BIODATA_PACK.id }, cookie), env);
    const r = (await (await handleVerify(post('/api/verify', { invoiceId: 'INVB3' }), env)).json()) as { status: string };
    expect(r.status).toBe('pending');
    expect(await hasBiodataPack(env.DB!, user.id)).toBe(false);
  });
});

describe('hasBiodataPack and the account answer', () => {
  it('is false, not an error, when the table has not been created yet', async () => {
    const broken: D1Like = { prepare: () => { throw new Error('no such table: biodata_grants'); }, batch: async () => [] };
    expect(await hasBiodataPack(broken, 'u1')).toBe(false);
  });

  it('grants once per invoice', async () => {
    const { env, user } = await setup();
    expect(await grantBiodataPack(env.DB!, { invoiceId: 'I1', productId: BIODATA_PACK.id, amount: 49, userId: user.id, phone: null })).toBe(true);
    expect(await grantBiodataPack(env.DB!, { invoiceId: 'I1', productId: BIODATA_PACK.id, amount: 49, userId: user.id, phone: null })).toBe(false);
  });

  it('tells the browser in /api/auth/me', async () => {
    const { env, user, cookie } = await setup();
    const me = () => handleAuth(new Request(`${SITE}/api/auth/me`, { headers: { Cookie: cookie } }), env, '/api/auth/me').then((r) => r.json()) as Promise<{ user: { biodataPack: boolean } }>;
    expect((await me()).user.biodataPack).toBe(false);
    await grantBiodataPack(env.DB!, { invoiceId: 'I2', productId: BIODATA_PACK.id, amount: 49, userId: user.id, phone: null });
    expect((await me()).user.biodataPack).toBe(true);
  });
});
