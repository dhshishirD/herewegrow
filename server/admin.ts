// /api/admin/*: Career Hub admin routes. Every route needs a signed-in user with users.is_admin = 1.

import { getSessionUser, type AuthEnv, type User } from './auth';
import { isAllowedOrigin, json } from './paymently';
import { MAX_PACK_BYTES, saveRolePack, validateRolePack } from './rolePack';

/** The signed-in admin, or the 401/403/503 response to send back. Check with `instanceof Response`. */
export async function requireAdmin(env: AuthEnv, request: Request): Promise<User | Response> {
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: 'login' }, 401);
  if (!user.isAdmin) return json({ ok: false, error: 'forbidden' }, 403);
  return user;
}

export async function handleAdmin(request: Request, env: AuthEnv, pathname: string): Promise<Response> {
  // Origin first: a cross-site POST never reaches the session or the database.
  if (request.method !== 'GET' && !isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const admin = await requireAdmin(env, request);
  if (admin instanceof Response) return admin;
  const db = env.DB!;

  if (pathname === '/api/admin/roles') {
    if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
    const rows = await db.prepare('SELECT id, slug, title_en, title_bn, field, status, published_at, updated_at FROM roles ORDER BY updated_at DESC').all();
    return json({ ok: true, roles: rows.results ?? [] });
  }

  if (pathname === '/api/admin/roles/import') {
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    const text = await request.text();
    if (text.length > MAX_PACK_BYTES) return json({ ok: false, error: 'size' }, 413);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ ok: false, error: 'json' }, 400);
    }
    const checked = validateRolePack(body);
    if (!checked.ok) return json({ ok: false, error: 'invalid', errors: checked.errors }, 400);
    const saved = await saveRolePack(db, checked.pack);
    return json({ ok: true, id: saved.id, created: saved.created, slug: checked.pack.slug });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}
