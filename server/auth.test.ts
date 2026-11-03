import { describe, expect, it } from 'vitest';
import {
  createSession, getSessionUser, normalizePhone, requestOtp, SESSION_COOKIE, userForGoogle, userForPhone, verifyOtp,
  type AuthEnv,
} from './auth';
import { safeNext } from './google';
import { fakeD1, fakeKV } from './testkit';

const setup = () => {
  const kv = fakeKV();
  const env: AuthEnv = { KV: kv, DB: fakeD1(), SESSION_SECRET: 'test-secret' };
  const sent: string[] = [];
  const sms = { send: async (_to: string, msg: string) => (sent.push(msg), true) };
  const lastCode = () => sent.at(-1)!.match(/\d{6}/)![0];
  return { env, kv, sms, sent, lastCode };
};

describe('normalizePhone', () => {
  it('accepts local, +88 and spaced forms', () => {
    expect(normalizePhone('01712345678')).toBe('01712345678');
    expect(normalizePhone('+880 1712-345678')).toBe('01712345678');
  });
  it('rejects bad numbers', () => {
    expect(normalizePhone('01212345678')).toBeNull();
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
  });
});

describe('OTP', () => {
  it('verifies the right code once and not again', async () => {
    const { env, sms, lastCode } = setup();
    expect((await requestOtp(env, '01712345678', '1.1.1.1', sms)).ok).toBe(true);
    const code = lastCode();
    expect(await verifyOtp(env, '01712345678', code)).toBe('01712345678');
    expect(await verifyOtp(env, '01712345678', code)).toBeNull();
  });
  it('stores only a hash, never the code', async () => {
    const { env, kv, sms, lastCode } = setup();
    await requestOtp(env, '01712345678', '1.1.1.1', sms);
    expect(kv.store.get('otp:01712345678')).not.toContain(lastCode());
  });
  it('burns the code after 5 wrong tries', async () => {
    const { env, sms, lastCode } = setup();
    await requestOtp(env, '01712345678', '1.1.1.1', sms);
    const good = lastCode();
    const bad = good === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) expect(await verifyOtp(env, '01712345678', bad)).toBeNull();
    expect(await verifyOtp(env, '01712345678', good)).toBeNull();
  });
  it('limits 3 requests per phone per window', async () => {
    const { env, sms } = setup();
    for (let i = 0; i < 3; i++) expect((await requestOtp(env, '01712345678', '1.1.1.1', sms)).ok).toBe(true);
    expect(await requestOtp(env, '01712345678', '1.1.1.1', sms)).toEqual({ ok: false, error: 'rate' });
  });
  it('limits 10 requests per IP per hour', async () => {
    const { env, sms } = setup();
    for (let i = 0; i < 10; i++) expect((await requestOtp(env, `0171234567${i}`, '2.2.2.2', sms)).ok).toBe(true);
    expect(await requestOtp(env, '01799999999', '2.2.2.2', sms)).toEqual({ ok: false, error: 'rate' });
  });
  it('drops the code and reports an error when SMS fails', async () => {
    const { env, kv } = setup();
    const r = await requestOtp(env, '01712345678', '1.1.1.1', { send: async () => false });
    expect(r).toEqual({ ok: false, error: 'sms' });
    expect(kv.store.has('otp:01712345678')).toBe(false);
  });
  it('rejects an invalid phone before sending', async () => {
    const { env, sent, sms } = setup();
    expect(await requestOtp(env, 'abc', '1.1.1.1', sms)).toEqual({ ok: false, error: 'phone' });
    expect(sent).toHaveLength(0);
  });
});

describe('users and sessions', () => {
  it('creates a phone user once and reuses it', async () => {
    const { env } = setup();
    const a = await userForPhone(env.DB!, '01712345678');
    const b = await userForPhone(env.DB!, '01712345678');
    expect(b.id).toBe(a.id);
    expect(a.proUntil).toBeNull();
  });
  it('links Google to an existing account by email, then by sub', async () => {
    const { env } = setup();
    const g = { sub: 'sub-1', email: 'a@b.com', name: 'A' };
    const first = await userForGoogle(env.DB!, g);
    const again = await userForGoogle(env.DB!, g);
    expect(again.id).toBe(first.id);
    await env.DB!.prepare('UPDATE users SET google_sub = NULL WHERE id = ?').bind(first.id).run();
    const relinked = await userForGoogle(env.DB!, g);
    expect(relinked.id).toBe(first.id);
  });
  it('reads a session from its cookie, rejects unknown cookies', async () => {
    const { env } = setup();
    const user = await userForPhone(env.DB!, '01712345678');
    const sid = await createSession(env, user.id);
    const ok = new Request('https://x.test/', { headers: { Cookie: `${SESSION_COOKIE}=${sid}` } });
    expect((await getSessionUser(env, ok))?.id).toBe(user.id);
    const bad = new Request('https://x.test/', { headers: { Cookie: `${SESSION_COOKIE}=nope` } });
    expect(await getSessionUser(env, bad)).toBeNull();
  });
  it('slides the session expiry only after a day', async () => {
    const { env, kv } = setup();
    const user = await userForPhone(env.DB!, '01712345678');
    const t0 = 1_000_000;
    const sid = await createSession(env, user.id, t0);
    const key = [...kv.store.keys()].find((k) => k.startsWith('sess:'))!;
    const req = new Request('https://x.test/', { headers: { Cookie: `${SESSION_COOKIE}=${sid}` } });
    await getSessionUser(env, req, t0 + 3_600_000);
    expect(JSON.parse(kv.store.get(key)!).at).toBe(t0);
    await getSessionUser(env, req, t0 + 2 * 86_400_000);
    expect(JSON.parse(kv.store.get(key)!).at).toBe(t0 + 2 * 86_400_000);
  });
});

describe('safeNext', () => {
  it('keeps same-site paths only', () => {
    expect(safeNext('/pro')).toBe('/pro');
    expect(safeNext('//evil.com')).toBe('/account');
    expect(safeNext('https://evil.com')).toBe('/account');
    expect(safeNext(null)).toBe('/account');
  });
});
