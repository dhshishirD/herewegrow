import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuthEnv } from './auth';
import { countNewContacts, handleContact, listContacts, setContactStatus } from './contact';
import { fakeD1, fakeKV } from './testkit';

const setup = (extra: Partial<AuthEnv> = {}) => {
  const db = fakeD1();
  const env: AuthEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 's', ...extra };
  const send = (body: unknown, init: { ip?: string; origin?: string | null } = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'CF-Connecting-IP': init.ip ?? '1.2.3.4' };
    if (init.origin !== null) headers.Origin = init.origin ?? 'https://herewegrow.pro';
    return handleContact(new Request('https://herewegrow.pro/api/contact', { method: 'POST', headers, body: JSON.stringify(body) }), env);
  };
  return { db, env, send };
};
const valid = { name: 'Rahim', phone: '01712345678', message: 'I need a CV', page: '/services', vid: 'v-1', utmSource: 'FB Ads' };
const rows = (db: ReturnType<typeof fakeD1>) => db.prepare('SELECT * FROM contact_messages').all<Record<string, unknown>>().then((r) => r.results ?? []);

afterEach(() => vi.unstubAllGlobals());

describe('handleContact', () => {
  it('stores a valid message as new with page, vid and sanitised utm_source', async () => {
    const { send, db } = setup();
    const res = await send({ ...valid, phone: '+880 1712-345678', email: 'a@b.co' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    const [r] = await rows(db);
    expect(r).toMatchObject({ name: 'Rahim', phone: '01712345678', email: 'a@b.co', message: 'I need a CV', page: '/services', vid: 'v-1', utm_source: 'fb-ads', status: 'new', note: null });
    expect(typeof r.id).toBe('string');
    expect(Math.abs((r.created_at as number) - Date.now())).toBeLessThan(5000);
  });

  it('rejects a bad phone with 400 and the field name', async () => {
    const { send, db } = setup();
    const res = await send({ ...valid, phone: '12345' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', errors: ['phone'] });
    expect(await rows(db)).toHaveLength(0);
  });

  it('reports every invalid field', async () => {
    const { send } = setup();
    const res = await send({ name: ' ', phone: 'x', message: '   ', email: 'nope' });
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', errors: ['name', 'phone', 'email', 'message'] });
  });

  it('cuts a message longer than 2000 chars to 2000', async () => {
    const { send, db } = setup();
    expect((await send({ ...valid, message: 'x'.repeat(2500) })).status).toBe(201);
    expect(((await rows(db))[0].message as string).length).toBe(2000);
  });

  it('stores <script> verbatim', async () => {
    const { send, db } = setup();
    await send({ ...valid, message: '<script>alert(1)</script>' });
    expect((await rows(db))[0].message).toBe('<script>alert(1)</script>');
  });

  it('nulls a page that does not start with / and an over-long one', async () => {
    const { send, db } = setup();
    await send({ ...valid, page: 'https://evil.example' }, { ip: '9.9.9.1' });
    await send({ ...valid, page: '/' + 'a'.repeat(250) }, { ip: '9.9.9.2' });
    expect((await rows(db)).map((r) => r.page)).toEqual([null, null]);
  });

  it('honeypot returns 201 and stores nothing', async () => {
    const { send, db } = setup();
    const res = await send({ ...valid, website: 'http://spam' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(await rows(db)).toHaveLength(0);
  });

  it('the 4th submit from one IP within 10 minutes is 429; another IP is fine', async () => {
    const { send, db } = setup();
    for (let i = 0; i < 3; i++) expect((await send(valid)).status).toBe(201);
    const res = await send(valid);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate' });
    expect((await send(valid, { ip: '5.5.5.5' })).status).toBe(201);
    expect(await rows(db)).toHaveLength(4);
  });

  it('403 for a foreign origin', async () => {
    const { send, db } = setup();
    expect((await send(valid, { origin: 'https://evil.example' })).status).toBe(403);
    expect(await rows(db)).toHaveLength(0);
  });

  it('enforces Turnstile when TURNSTILE_SECRET is set', async () => {
    const fetchMock = vi.fn(async (_u: unknown, init?: { body?: URLSearchParams }) =>
      new Response(JSON.stringify({ success: init?.body?.get('response') === 'good' })));
    vi.stubGlobal('fetch', fetchMock);
    const { send, db } = setup({ TURNSTILE_SECRET: 'sec' });
    const missing = await send(valid);
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ ok: false, error: 'captcha' });
    expect((await send({ ...valid, turnstile: 'bad' })).status).toBe(400);
    expect((await send({ ...valid, turnstile: 'good' })).status).toBe(201);
    expect(await rows(db)).toHaveLength(1);
  });

  it('413 for a body over 8 KB and stores nothing', async () => {
    const { send, db } = setup();
    const res = await send({ ...valid, message: 'x'.repeat(9000) });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ ok: false, error: 'size' });
    expect(await rows(db)).toHaveLength(0);
  });

  it('accepts and stores a 2000-char Bangla message in full (about 6 KB)', async () => {
    const { send, db } = setup();
    const msg = 'ক'.repeat(2000);
    expect((await send({ ...valid, message: msg })).status).toBe(201);
    expect((await rows(db))[0].message).toBe(msg);
  });

  it('400 for invalid JSON', async () => {
    const { env } = setup();
    const res = await handleContact(new Request('https://herewegrow.pro/api/contact', { method: 'POST', headers: { Origin: 'https://herewegrow.pro' }, body: '{nope' }), env);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', errors: ['json'] });
  });

  it('503 when the database is not configured', async () => {
    const { send, env } = setup();
    env.DB = undefined;
    expect((await send(valid)).status).toBe(503);
  });
});

describe('inbox queries', () => {
  const seed = async (db: ReturnType<typeof fakeD1>) => {
    const ins = (id: string, at: number, status: string) =>
      db.prepare('INSERT INTO contact_messages (id, created_at, name, phone, message, status) VALUES (?, ?, ?, ?, ?, ?)').bind(id, at, id, '01712345678', 'hi', status).run();
    await ins('a', 1, 'new');
    await ins('b', 2, 'replied');
    await ins('c', 3, 'new');
    await ins('d', 4, 'closed');
  };

  it('listContacts is newest first and filters by status', async () => {
    const { db } = setup();
    await seed(db);
    expect((await listContacts(db)).map((m) => m.id)).toEqual(['d', 'c', 'b', 'a']);
    expect((await listContacts(db, 'new')).map((m) => m.id)).toEqual(['c', 'a']);
    expect((await listContacts(db, 'closed'))[0]).toMatchObject({ id: 'd', status: 'closed', note: null, createdAt: 4, phone: '01712345678', utmSource: null });
  });

  it('countNewContacts counts only new', async () => {
    const { db } = setup();
    await seed(db);
    expect(await countNewContacts(db)).toBe(2);
  });

  it('setContactStatus updates status and note; false for an unknown id', async () => {
    const { db } = setup();
    await seed(db);
    expect(await setContactStatus(db, 'a', 'replied', 'called back')).toBe(true);
    expect((await listContacts(db, 'replied')).find((m) => m.id === 'a')).toMatchObject({ status: 'replied', note: 'called back' });
    expect(await setContactStatus(db, 'a', 'new')).toBe(true);
    expect((await listContacts(db, 'new')).find((m) => m.id === 'a')?.note).toBe('called back'); // note kept when omitted
    expect(await setContactStatus(db, 'zzz', 'closed')).toBe(false);
    expect(await countNewContacts(db)).toBe(2);
  });
});
