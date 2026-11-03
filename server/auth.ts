// Accounts: phone + SMS code login, Google login, and cookie sessions.
// Sessions live in KV (sess:<hash>), users in D1. See the Phase 1 spec, sections 4 and 5.

import type { D1Like, KVLike } from './cf';
import { randomCode, randomToken, safeEqual, sha256B64url, sha256Hex } from './crypto';
import { bulkSmsBd, type SmsProvider, type SmsEnv } from './sms';

export interface AuthEnv extends SmsEnv {
  DB?: D1Like;
  KV?: KVLike;
  SESSION_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  /** Optional: when set, OTP requests must carry a valid Turnstile token. */
  TURNSTILE_SECRET?: string;
}

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  lang: string;
  proUntil: number | null;
}

export const SESSION_COOKIE = 'hwg_session';
export const SESSION_TTL = 30 * 86_400; // seconds
const SESSION_REFRESH_AFTER_MS = 86_400_000;
const OTP_TTL = 300;
const OTP_MAX_ATTEMPTS = 5;

/** Normalise a Bangladeshi mobile number to 01XXXXXXXXX, or null if it is not one. */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const p = raw.trim().replace(/[\s-]/g, '').replace(/^\+?88/, '');
  return /^01[3-9]\d{8}$/.test(p) ? p : null;
}

/** Count an attempt against a limit. Returns false once the limit is passed. */
async function allow(kv: KVLike, key: string, limit: number, windowSec: number): Promise<boolean> {
  const n = Number((await kv.get(key)) ?? 0);
  if (n >= limit) return false;
  await kv.put(key, String(n + 1), { expirationTtl: windowSec });
  return true;
}

const otpHash = (env: AuthEnv, phone: string, code: string) => sha256Hex(`${env.SESSION_SECRET}:${phone}:${code}`);

export type OtpRequestResult = { ok: true } | { ok: false; error: 'phone' | 'rate' | 'sms' | 'config' };

export async function requestOtp(
  env: AuthEnv,
  phoneRaw: unknown,
  ip: string,
  sms: SmsProvider = bulkSmsBd(env),
): Promise<OtpRequestResult> {
  if (!env.KV || !env.SESSION_SECRET) return { ok: false, error: 'config' };
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { ok: false, error: 'phone' };
  if (!(await allow(env.KV, `rl:otp:p:${phone}`, 3, 600))) return { ok: false, error: 'rate' };
  if (!(await allow(env.KV, `rl:otp:ip:${ip}`, 10, 3600))) return { ok: false, error: 'rate' };

  const code = randomCode();
  await env.KV.put(`otp:${phone}`, JSON.stringify({ hash: await otpHash(env, phone, code), attempts: 0 }), {
    expirationTtl: OTP_TTL,
  });
  const sent = await sms.send(phone, `HereWeGrow: your login code is ${code}. It works for 5 minutes. Do not share it.`);
  if (!sent) {
    await env.KV.delete(`otp:${phone}`);
    return { ok: false, error: 'sms' };
  }
  return { ok: true };
}

/** Check the code. Wrong codes count; after 5 the code is burned. */
export async function verifyOtp(env: AuthEnv, phoneRaw: unknown, codeRaw: unknown): Promise<string | null> {
  if (!env.KV || !env.SESSION_SECRET) return null;
  const phone = normalizePhone(phoneRaw);
  const code = typeof codeRaw === 'string' ? codeRaw.trim() : '';
  if (!phone || !/^\d{6}$/.test(code)) return null;

  const raw = await env.KV.get(`otp:${phone}`);
  if (!raw) return null;
  const rec = JSON.parse(raw) as { hash: string; attempts: number };
  if (rec.attempts >= OTP_MAX_ATTEMPTS) {
    await env.KV.delete(`otp:${phone}`);
    return null;
  }
  if (!safeEqual(rec.hash, await otpHash(env, phone, code))) {
    await env.KV.put(`otp:${phone}`, JSON.stringify({ ...rec, attempts: rec.attempts + 1 }), { expirationTtl: OTP_TTL });
    return null;
  }
  await env.KV.delete(`otp:${phone}`); // one use only
  return phone;
}

const userFromRow = (r: Record<string, unknown>): User => ({
  id: r.id as string,
  phone: (r.phone as string) ?? null,
  email: (r.email as string) ?? null,
  name: (r.name as string) ?? null,
  lang: (r.lang as string) ?? 'bn',
  proUntil: (r.pro_until as number) ?? null,
});

const USER_SELECT =
  'SELECT u.id, u.phone, u.email, u.name, u.lang, e.pro_until FROM users u LEFT JOIN entitlements e ON e.user_id = u.id';

export async function getUserById(db: D1Like, id: string): Promise<User | null> {
  const row = await db.prepare(`${USER_SELECT} WHERE u.id = ?`).bind(id).first();
  return row ? userFromRow(row) : null;
}

/** Find the user for a verified phone number, creating the account on first login. */
export async function userForPhone(db: D1Like, phone: string, lang = 'bn', now = Date.now()): Promise<User> {
  const found = await db.prepare(`${USER_SELECT} WHERE u.phone = ?`).bind(phone).first();
  if (found) return userFromRow(found);
  const id = crypto.randomUUID();
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO users (id, phone, lang, created_at) VALUES (?, ?, ?, ?)').bind(id, phone, lang === 'en' ? 'en' : 'bn', now),
    db.prepare('INSERT OR IGNORE INTO entitlements (user_id, updated_at) SELECT id, ? FROM users WHERE phone = ?').bind(now, phone),
  ]);
  const row = await db.prepare(`${USER_SELECT} WHERE u.phone = ?`).bind(phone).first();
  return userFromRow(row!);
}

/** Find or create the user for a verified Google identity. Links by google_sub first, then verified email. */
export async function userForGoogle(
  db: D1Like,
  g: { sub: string; email: string; name: string },
  now = Date.now(),
): Promise<User> {
  const bySub = await db.prepare(`${USER_SELECT} WHERE u.google_sub = ?`).bind(g.sub).first();
  if (bySub) return userFromRow(bySub);
  const byEmail = await db.prepare(`${USER_SELECT} WHERE u.email = ?`).bind(g.email).first();
  if (byEmail) {
    await db.prepare('UPDATE users SET google_sub = ? WHERE id = ?').bind(g.sub, byEmail.id).run();
    return userFromRow(byEmail);
  }
  const id = crypto.randomUUID();
  await db.batch([
    db.prepare('INSERT INTO users (id, email, google_sub, name, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, g.email, g.sub, g.name || null, now),
    db.prepare('INSERT INTO entitlements (user_id, updated_at) VALUES (?, ?)').bind(id, now),
  ]);
  return (await getUserById(db, id))!;
}

// ---- sessions ----

interface SessionRecord {
  uid: string;
  at: number;
}

export async function createSession(env: AuthEnv, userId: string, now = Date.now()): Promise<string> {
  const id = randomToken(32);
  const rec: SessionRecord = { uid: userId, at: now };
  await env.KV!.put(`sess:${await sha256B64url(id)}`, JSON.stringify(rec), { expirationTtl: SESSION_TTL });
  return id;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=') || null;
  }
  return null;
}

/** The signed-in user for this request, or null. Slides the 30-day expiry forward once a day. */
export async function getSessionUser(env: AuthEnv, request: Request, now = Date.now()): Promise<User | null> {
  if (!env.KV || !env.DB) return null;
  const id = readCookie(request, SESSION_COOKIE);
  if (!id) return null;
  const key = `sess:${await sha256B64url(id)}`;
  const raw = await env.KV.get(key);
  if (!raw) return null;
  const rec = JSON.parse(raw) as SessionRecord;
  const user = await getUserById(env.DB, rec.uid);
  if (!user) return null;
  if (now - rec.at > SESSION_REFRESH_AFTER_MS) {
    await env.KV.put(key, JSON.stringify({ ...rec, at: now }), { expirationTtl: SESSION_TTL });
  }
  return user;
}

export async function destroySession(env: AuthEnv, request: Request): Promise<void> {
  const id = readCookie(request, SESSION_COOKIE);
  if (id && env.KV) await env.KV.delete(`sess:${await sha256B64url(id)}`);
}

export const sessionCookie = (id: string) =>
  `${SESSION_COOKIE}=${id}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; Secure; SameSite=Lax`;
export const clearCookie = () => `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export const publicUser = (u: User) => ({
  id: u.id,
  phone: u.phone,
  email: u.email,
  name: u.name,
  lang: u.lang,
  proUntil: u.proUntil,
  pro: !!u.proUntil && u.proUntil > Date.now(),
});
