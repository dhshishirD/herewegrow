import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSession, SESSION_COOKIE, userForPhone } from './auth';
import { dhakaDay, deviceOf, isBot, parseTrack, recordEvent, recordServerEvent } from './analytics';
import { handleTrack, ipLimiter } from './analyticsHandlers';
import type { AuthEnv } from './auth';
import { fakeD1, fakeKV } from './testkit';

const SITE = 'https://herewegrow.pro';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

const valid = { vid: 'v1', sid: 's1', type: 'pageview', path: '/services', ref: 'https://www.google.com/search?q=cv', utmSource: 'fb', meta: { a: 1 } };

describe('dhakaDay', () => {
  it('rolls over at 18:00 UTC', () => {
    expect(dhakaDay(Date.UTC(2026, 10, 5, 17, 59, 59))).toBe('2026-11-05');
    expect(dhakaDay(Date.UTC(2026, 10, 5, 18, 0, 0))).toBe('2026-11-06');
  });
});

describe('parseTrack', () => {
  it('rejects invalid bodies', () => {
    expect(parseTrack(null)).toBeNull();
    expect(parseTrack('x')).toBeNull();
    expect(parseTrack([])).toBeNull();
    expect(parseTrack({ ...valid, vid: undefined })).toBeNull();
    expect(parseTrack({ ...valid, path: undefined })).toBeNull();
    expect(parseTrack({ ...valid, type: 'click' })).toBeNull();
    expect(parseTrack({ ...valid, path: 'services' })).toBeNull();
  });
  it('accepts a valid body and stringifies object meta', () => {
    const t = parseTrack(valid)!;
    expect(t.type).toBe('pageview');
    expect(t.meta).toBe('{"a":1}');
    expect(t.utmSource).toBe('fb');
    expect(t.name).toBeNull();
  });
  it('accepts string meta', () => {
    expect(parseTrack({ ...valid, meta: 'hi' })!.meta).toBe('hi');
  });
  it('trims path to 200 and meta to 300', () => {
    const t = parseTrack({ ...valid, path: '/' + 'a'.repeat(500), meta: 'm'.repeat(500) })!;
    expect(t.path.length).toBe(200);
    expect(t.meta!.length).toBe(300);
  });
  it('sanitises utm values', () => {
    const t = parseTrack({ ...valid, utmSource: 'Face Book!!', utmMedium: 'X'.repeat(100) })!;
    expect(t.utmSource).toBe('face-book');
    expect(t.utmMedium).toMatch(/^[a-z0-9_.-]+$/);
    expect(t.utmMedium!.length).toBeLessThanOrEqual(40);
  });
});

describe('isBot / deviceOf', () => {
  it('detects bots and treats empty UA as bot', () => {
    expect(isBot('Googlebot/2.1')).toBe(true);
    expect(isBot(IPHONE)).toBe(false);
    expect(isBot('')).toBe(true);
    expect(isBot(null)).toBe(true);
  });
  it('classifies devices', () => {
    expect(deviceOf(IPHONE)).toBe('mobile');
    expect(deviceOf(IPAD)).toBe('tablet');
    expect(deviceOf(WIN)).toBe('desktop');
    expect(deviceOf(null)).toBe('desktop');
  });
});

const setup = () => ({ DB: fakeD1(), KV: fakeKV(), SESSION_SECRET: 's' }) as AuthEnv & { DB: ReturnType<typeof fakeD1> };

const req = (body: unknown, opts: { origin?: string | null; ua?: string; cookie?: string; raw?: string; country?: string; ip?: string } = {}) => {
  const r = new Request(`${SITE}/api/t`, {
    method: 'POST',
    headers: {
      ...(opts.origin === null ? {} : { Origin: opts.origin ?? SITE }),
      'User-Agent': opts.ua ?? WIN,
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
      ...(opts.ip ? { 'CF-Connecting-IP': opts.ip } : {}),
    },
    body: opts.raw ?? JSON.stringify(body),
  });
  if (opts.country) Object.defineProperty(r, 'cf', { value: { country: opts.country } });
  return r;
};

const count = async (env: AuthEnv) => (await env.DB!.prepare('SELECT COUNT(*) AS n FROM events').first<{ n: number }>())!.n;

describe('handleTrack', () => {
  beforeEach(() => ipLimiter.reset());
  it('stores a valid pageview', async () => {
    const env = setup();
    const res = await handleTrack(req(valid, { country: 'BD' }), env);
    expect(res.status).toBe(204);
    const row = await env.DB!.prepare('SELECT * FROM events').first<Record<string, unknown>>();
    expect(row).toMatchObject({ vid: 'v1', sid: 's1', type: 'pageview', path: '/services', ref_host: 'www.google.com', country: 'BD', device: 'desktop', utm_source: 'fb' });
    expect(row!.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(row!.user_id).toBeNull();
  });
  it('rejects a bad origin with 403', async () => {
    const env = setup();
    expect((await handleTrack(req(valid, { origin: 'https://evil.example' }), env)).status).toBe(403);
    expect((await handleTrack(req(valid, { origin: null }), env)).status).toBe(403);
    expect(await count(env)).toBe(0);
  });
  it('drops oversized, invalid and bot requests with 204', async () => {
    const env = setup();
    expect((await handleTrack(req({ ...valid, meta: 'x'.repeat(2048) }), env)).status).toBe(204);
    expect((await handleTrack(req(null, { raw: '{nope' }), env)).status).toBe(204);
    expect((await handleTrack(req(valid, { ua: 'Googlebot/2.1' }), env)).status).toBe(204);
    expect(await count(env)).toBe(0);
  });
  it('caps events per vid per Dhaka day at 300, counted in D1', async () => {
    const env = setup();
    for (let i = 0; i < 301; i++) expect((await handleTrack(req(valid), env)).status).toBe(204);
    expect(await count(env)).toBe(300);
    // another visitor is unaffected
    await handleTrack(req({ ...valid, vid: 'v2' }), env);
    expect(await count(env)).toBe(301);
  });
  it('counts only the current Dhaka day toward the cap', async () => {
    const env = setup();
    const now = Date.now();
    const yesterday = now - 86_400_000;
    for (let i = 0; i < 300; i++) await recordEvent(env.DB!, parseTrack(valid)!, { ts: yesterday, country: null, device: 'desktop', userId: null });
    await handleTrack(req(valid), env);
    expect(await count(env)).toBe(301);
  });
  it('writes nothing to KV, so a KV write quota can never break tracking', async () => {
    const kv = fakeKV();
    kv.put = async () => {
      throw new Error('KV put limit exceeded');
    };
    const env = { DB: fakeD1(), KV: kv, SESSION_SECRET: 's' } as AuthEnv;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 3; i++) expect((await handleTrack(req(valid, { ip: '203.0.113.9' }), env)).status).toBe(204);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(await count(env)).toBe(3);
  });
  it('drops a burst beyond the per-IP limit and leaves other IPs alone', async () => {
    const env = setup();
    for (let i = 0; i < 130; i++) await handleTrack(req({ ...valid, vid: `v${i}` }, { ip: '198.51.100.1' }), env);
    expect(await count(env)).toBe(120);
    await handleTrack(req(valid, { ip: '198.51.100.2' }), env);
    expect(await count(env)).toBe(121);
  });
  it('drops events from admins', async () => {
    const env = setup();
    const user = await userForPhone(env.DB!, '01712345678');
    await env.DB!.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(user.id).run();
    const cookie = `${SESSION_COOKIE}=${await createSession(env, user.id)}`;
    expect((await handleTrack(req(valid, { cookie }), env)).status).toBe(204);
    expect(await count(env)).toBe(0);
  });
  it('records the user id for signed-in non-admins', async () => {
    const env = setup();
    const user = await userForPhone(env.DB!, '01712345678');
    const cookie = `${SESSION_COOKIE}=${await createSession(env, user.id)}`;
    await handleTrack(req(valid, { cookie }), env);
    expect((await env.DB!.prepare('SELECT user_id FROM events').first<{ user_id: string }>())!.user_id).toBe(user.id);
  });
  it('answers 204 when bindings are missing', async () => {
    expect((await handleTrack(req(valid), {} as AuthEnv)).status).toBe(204);
  });
  it('answers 204 and logs when the database fails', async () => {
    const env = setup();
    await env.DB!.prepare('DROP TABLE events').run();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await handleTrack(req(valid), env)).status).toBe(204);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('recordEvent / recordServerEvent', () => {
  it('stores ref_host as hostname only, null when unparsable', async () => {
    const db = fakeD1();
    const base = parseTrack(valid)!;
    await recordEvent(db, base, { ts: 1, country: null, device: 'mobile', userId: null });
    await recordEvent(db, { ...base, ref: 'not a url' }, { ts: 2, country: null, device: 'mobile', userId: null });
    const rows = (await db.prepare('SELECT ref_host FROM events ORDER BY ts').all<{ ref_host: string | null }>()).results!;
    expect(rows.map((r) => r.ref_host)).toEqual(['www.google.com', null]);
  });
  it('dedupes server events by key', async () => {
    const db = fakeD1();
    const e = { name: 'purchase', vid: null, userId: null, meta: { amount: 500 }, dedupeKey: 'purchase:inv1', ts: Date.UTC(2026, 10, 5) };
    expect(await recordServerEvent(db, e)).toBe(true);
    expect(await recordServerEvent(db, e)).toBe(false);
    const rows = (await db.prepare('SELECT * FROM events').all<Record<string, unknown>>()).results!;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ type: 'event', name: 'purchase', sid: '', path: '', meta: '{"amount":500}', day: '2026-11-05' });
  });
});

describe('ipLimiter', () => {
  beforeEach(() => ipLimiter.reset());
  it('allows 120 per IP per minute, then a new minute starts fresh', () => {
    const t = 1_000_000;
    for (let i = 0; i < 120; i++) expect(ipLimiter.allow('a', t + i)).toBe(true);
    expect(ipLimiter.allow('a', t + 200)).toBe(false);
    expect(ipLimiter.allow('b', t + 200)).toBe(true);
    expect(ipLimiter.allow('a', t + 60_001)).toBe(true);
  });
  it('stays bounded however many IPs it sees', () => {
    const t = 2_000_000;
    for (let i = 0; i < 25_000; i++) ipLimiter.allow(`ip${i}`, t + i);
    expect(ipLimiter.size()).toBeLessThanOrEqual(ipLimiter.maxKeys);
    // expired windows are swept
    ipLimiter.allow('late', t + 10 * 60_000);
    expect(ipLimiter.size()).toBeLessThanOrEqual(2);
  });
});

describe('events schema (write cost)', () => {
  const sql = async (db: ReturnType<typeof fakeD1>, q: string) => (await db.prepare(q).all<{ name: string; sql: string | null }>()).results!;
  it('has no AUTOINCREMENT, no ts-only index, and a partial unique index on dedupe_key', async () => {
    const db = fakeD1();
    const table = (await sql(db, "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = 'events'"))[0];
    expect(table.sql).not.toMatch(/AUTOINCREMENT/i);
    expect(table.sql).not.toMatch(/UNIQUE/i);
    const idx = await sql(db, "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'events'");
    expect(idx.map((i) => i.name).sort()).toEqual(['events_day', 'events_dedupe', 'events_vid_ts']);
    expect(idx.find((i) => i.name === 'events_dedupe')!.sql).toMatch(/UNIQUE INDEX[\s\S]*WHERE dedupe_key IS NOT NULL/i);
  });
  it('allows many rows without a dedupe key', async () => {
    const db = fakeD1();
    const base = parseTrack(valid)!;
    await recordEvent(db, base, { ts: 1, country: null, device: 'mobile', userId: null });
    await recordEvent(db, base, { ts: 2, country: null, device: 'mobile', userId: null });
    expect((await db.prepare('SELECT COUNT(*) AS n FROM events WHERE dedupe_key IS NULL').first<{ n: number }>())!.n).toBe(2);
  });
});
