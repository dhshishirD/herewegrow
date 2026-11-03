// Saved CVs (Phase 1 spec, section 6): free accounts keep 1 CV online, Pro keeps up to 20.
// A CV is the builder's whole state (data, design, colour, heading language) stored as JSON.
// Every query is scoped to the logged-in user; another user's CV id answers "not found".

import { getSessionUser, type User } from './auth';
import type { D1Like } from './cf';
import { isAllowedOrigin, json, type Env } from './paymently';

export const CV_LIMIT = { free: 1, pro: 20 } as const;
/** A CV with a photo is ~40 KB; this leaves plenty of room and stops abuse. */
export const MAX_CV_BYTES = 300_000;

export const isPro = (u: Pick<User, 'proUntil'>, now = Date.now()) => !!u.proUntil && u.proUntil > now;
export const cvLimit = (u: Pick<User, 'proUntil'>, now = Date.now()) => (isPro(u, now) ? CV_LIMIT.pro : CV_LIMIT.free);

export interface CvSummary {
  id: string;
  title: string;
  design: string | null;
  updatedAt: number;
}

export type SaveError = 'limit' | 'size' | 'bad' | 'not_found';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Checks the posted CV and turns it into what is stored. */
export function parseCvInput(body: Record<string, unknown>): { title: string; json: string; design: string | null } | SaveError {
  const state = body.state;
  if (!state || typeof state !== 'object' || Array.isArray(state)) return 'bad';
  const data = (state as Record<string, unknown>).data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'bad';
  const text = JSON.stringify(state);
  if (new TextEncoder().encode(text).length > MAX_CV_BYTES) return 'size';
  const design = clip((state as Record<string, unknown>).design, 20) || null;
  return { title: clip(body.title, 80) || 'My CV', json: text, design };
}

export async function listCvs(db: D1Like, userId: string): Promise<CvSummary[]> {
  const r = await db
    .prepare('SELECT id, title, design, updated_at FROM cvs WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(userId)
    .all<{ id: string; title: string; design: string | null; updated_at: number }>();
  return (r.results ?? []).map((x) => ({ id: x.id, title: x.title, design: x.design, updatedAt: x.updated_at }));
}

export async function getCv(db: D1Like, userId: string, id: string): Promise<(CvSummary & { state: unknown }) | null> {
  const x = await db
    .prepare('SELECT id, title, design, data_json, updated_at FROM cvs WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<{ id: string; title: string; design: string | null; data_json: string; updated_at: number }>();
  if (!x) return null;
  return { id: x.id, title: x.title, design: x.design, updatedAt: x.updated_at, state: JSON.parse(x.data_json) };
}

/** Saves a new CV, unless the account already holds as many as its plan allows. */
export async function createCv(db: D1Like, user: User, body: Record<string, unknown>, now = Date.now()): Promise<{ id: string } | SaveError> {
  const input = parseCvInput(body);
  if (typeof input === 'string') return input;
  const id = crypto.randomUUID();
  // The count check and the insert are one statement, so two quick saves cannot pass the limit together.
  const r = await db
    .prepare(
      `INSERT INTO cvs (id, user_id, title, data_json, design, updated_at)
       SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM cvs WHERE user_id = ?) < ?`,
    )
    .bind(id, user.id, input.title, input.json, input.design, now, user.id, cvLimit(user, now))
    .run();
  return r.meta?.changes ? { id } : 'limit';
}

/** Updates a CV the user owns. Allowed even above the limit (for example after Pro ends): nothing is lost. */
export async function updateCv(db: D1Like, userId: string, id: string, body: Record<string, unknown>, now = Date.now()): Promise<{ id: string } | SaveError> {
  const input = parseCvInput(body);
  if (typeof input === 'string') return input;
  const r = await db
    .prepare('UPDATE cvs SET title = ?, data_json = ?, design = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .bind(input.title, input.json, input.design, now, id, userId)
    .run();
  return r.meta?.changes ? { id } : 'not_found';
}

export async function deleteCv(db: D1Like, userId: string, id: string): Promise<boolean> {
  const r = await db.prepare('DELETE FROM cvs WHERE id = ? AND user_id = ?').bind(id, userId).run();
  return !!r.meta?.changes;
}

const STATUS: Record<SaveError, number> = { limit: 403, size: 413, bad: 400, not_found: 404 };

/** /api/cvs (GET list, POST create) and /api/cvs/<id> (GET, PUT, DELETE). Login required. */
export async function handleCvs(request: Request, env: Env, pathname: string): Promise<Response> {
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  if (request.method !== 'GET' && !isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: 'login' }, 401);

  const id = pathname.slice('/api/cvs'.length).replace(/^\//, '');
  if (id && !/^[\w-]{1,64}$/.test(id)) return json({ ok: false, error: 'not_found' }, 404);
  const body = async () => (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const answer = (r: { id: string } | SaveError) => (typeof r === 'string' ? json({ ok: false, error: r }, STATUS[r]) : json({ ok: true, id: r.id }));

  if (!id) {
    if (request.method === 'GET') return json({ ok: true, cvs: await listCvs(env.DB, user.id), limit: cvLimit(user) });
    if (request.method === 'POST') return answer(await createCv(env.DB, user, await body()));
  } else {
    if (request.method === 'GET') {
      const cv = await getCv(env.DB, user.id, id);
      return cv ? json({ ok: true, cv }) : json({ ok: false, error: 'not_found' }, 404);
    }
    if (request.method === 'PUT') return answer(await updateCv(env.DB, user.id, id, await body()));
    if (request.method === 'DELETE') return (await deleteCv(env.DB, user.id, id)) ? json({ ok: true }) : json({ ok: false, error: 'not_found' }, 404);
  }
  return json({ ok: false, error: 'method' }, 405);
}
