// POST /api/contact (public) and the admin inbox queries. Visitor text is stored verbatim; it is only ever rendered as text.

import type { D1Like } from './cf';
import { utm } from './analytics';
import { allow, normalizePhone, type AuthEnv } from './auth';
import { clientIp, turnstileOk } from './authHandlers';
import { isAllowedOrigin, json } from './paymently';

export type ContactStatus = 'new' | 'replied' | 'closed';
export const CONTACT_STATUSES: readonly ContactStatus[] = ['new', 'replied', 'closed'];
export const MAX_NOTE = 500;
const MAX_MESSAGE = 2000;
const LIST_LIMIT = 200;

export interface ContactRow {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  page: string | null;
  vid: string | null;
  utmSource: string | null;
  status: ContactStatus;
  note: string | null;
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function handleContact(request: Request, env: AuthEnv): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  if (!env.DB || !env.KV) return json({ ok: false, error: 'config' }, 503);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  // A bot filled the hidden field: look successful, store nothing.
  if (typeof body.website === 'string' && body.website !== '') return json({ ok: true }, 201);

  const ip = clientIp(request);
  if (!(await turnstileOk(env, body.turnstile, ip))) return json({ ok: false, error: 'captcha' }, 400);

  const name = text(body.name);
  const phone = normalizePhone(body.phone);
  const email = text(body.email);
  const message = text(body.message).slice(0, MAX_MESSAGE);
  const errors: string[] = [];
  if (!name || name.length > 80) errors.push('name');
  if (!phone) errors.push('phone');
  if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.push('email');
  if (!message) errors.push('message');
  if (errors.length) return json({ ok: false, error: 'invalid', errors }, 400);

  if (!(await allow(env.KV, `rl:contact:${ip}`, 3, 600))) return json({ ok: false, error: 'rate' }, 429);

  const page = typeof body.page === 'string' && body.page.startsWith('/') && body.page.length <= 200 ? body.page : null;
  const vid = typeof body.vid === 'string' && body.vid && body.vid.length <= 64 ? body.vid : null;
  await env.DB
    .prepare('INSERT INTO contact_messages (id, created_at, name, phone, email, message, page, vid, utm_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), Date.now(), name, phone, email || null, message, page, vid, utm(body.utmSource))
    .run();
  return json({ ok: true }, 201);
}

interface DbRow {
  id: string; created_at: number; name: string; phone: string; email: string | null; message: string;
  page: string | null; vid: string | null; utm_source: string | null; status: ContactStatus; note: string | null;
}

/** Newest first, at most 200. */
export async function listContacts(db: D1Like, status?: ContactStatus): Promise<ContactRow[]> {
  const where = status ? 'WHERE status = ?' : '';
  const stmt = db.prepare(`SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`);
  const r = await (status ? stmt.bind(status) : stmt).all<DbRow>();
  return (r.results ?? []).map((m) => ({
    id: m.id, createdAt: m.created_at, name: m.name, phone: m.phone, email: m.email, message: m.message,
    page: m.page, vid: m.vid, utmSource: m.utm_source, status: m.status, note: m.note,
  }));
}

/** Set the status (and the note when given). False when the id does not exist. */
export async function setContactStatus(db: D1Like, id: string, status: ContactStatus, note?: string): Promise<boolean> {
  const r =
    note === undefined
      ? await db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').bind(status, id).run()
      : await db.prepare('UPDATE contact_messages SET status = ?, note = ? WHERE id = ?').bind(status, note || null, id).run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function countNewContacts(db: D1Like): Promise<number> {
  const r = await db.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'").first<{ n: number }>();
  return r?.n ?? 0;
}
