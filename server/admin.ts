// /api/admin/*: Career Hub admin routes. Every route needs a signed-in user with users.is_admin = 1.

import { getSessionUser, type AuthEnv, type User } from './auth';
import { publishRole, unpublishRole } from './careers';
import { isAllowedOrigin, json } from './paymently';
import { bulkCreatePromos, createPromo, listPromos, setPromoActive, type PromoInput } from './promo';
import { MAX_PACK_BYTES, saveRolePack, validateRolePack } from './rolePack';
import { actions, audience, entryPages, funnel, liveNow, overview, parseRange, revenue, sources, topPages } from './stats';

/** The signed-in admin, or the 401/403/503 response to send back. Check with `instanceof Response`. */
export async function requireAdmin(env: AuthEnv, request: Request): Promise<User | Response> {
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: 'login' }, 401);
  if (!user.isAdmin) return json({ ok: false, error: 'forbidden' }, 403);
  return user;
}

/** Any database failure becomes a logged 500 { error: 'db' } so the admin page can say so, instead of the Worker crashing. */
export async function handleAdmin(request: Request, env: AuthEnv, pathname: string): Promise<Response> {
  try {
    return await route(request, env, pathname);
  } catch (e) {
    console.error('admin request failed', pathname, e);
    return json({ ok: false, error: 'db' }, 500);
  }
}

async function route(request: Request, env: AuthEnv, pathname: string): Promise<Response> {
  // Origin first: a cross-site POST never reaches the session or the database.
  if (request.method !== 'GET' && !isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const admin = await requireAdmin(env, request);
  if (admin instanceof Response) return admin;
  const db = env.DB!;

  const stats = /^\/api\/admin\/stats\/(live|overview|pages|sources|audience|actions|funnel|revenue)$/.exec(pathname);
  if (stats) {
    if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
    if (stats[1] === 'live') return json({ ok: true, ...(await liveNow(db)) });
    if (stats[1] === 'revenue') return json({ ok: true, ...(await revenue(db)) });
    const r = parseRange(new URL(request.url).searchParams);
    if (!r) return json({ error: 'range' }, 400);
    switch (stats[1]) {
      case 'overview': return json({ ok: true, ...(await overview(db, r)) });
      case 'pages': return json({ ok: true, topPages: await topPages(db, r), entryPages: await entryPages(db, r) });
      case 'sources': return json({ ok: true, sources: await sources(db, r) });
      case 'audience': return json({ ok: true, ...(await audience(db, r)) });
      case 'funnel': return json({ ok: true, ...(await funnel(db, r)) });
      default: return json({ ok: true, actions: await actions(db, r) });
    }
  }

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
    // A role that is already public keeps its page in step with the new content.
    const live = await db.prepare("SELECT 1 AS live FROM roles WHERE id = ? AND status = 'published'").bind(saved.id).first();
    if (live) await publishRole(env, saved.id);
    return json({ ok: true, id: saved.id, created: saved.created, slug: checked.pack.slug });
  }

  if (pathname === '/api/admin/promos') {
    if (request.method === 'GET') return json({ ok: true, promos: await listPromos(db) });
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    const body = (await request.json().catch(() => ({}))) as PromoInput & { prefix?: unknown; count?: unknown };
    // A count means "make that many single-use codes"; otherwise it is one named code.
    if (body.count !== undefined) {
      const r = await bulkCreatePromos(db, body);
      return r.ok ? json({ ok: true, codes: r.codes }) : json({ ok: false, error: 'invalid', errors: r.errors }, 400);
    }
    const r = await createPromo(db, body);
    return r.ok ? json({ ok: true, codes: [r.promo.code] }) : json({ ok: false, error: 'invalid', errors: r.errors }, 400);
  }

  const toggle = /^\/api\/admin\/promos\/([A-Za-z0-9-]{3,24})\/(enable|disable)$/.exec(pathname);
  if (toggle) {
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    const found = await setPromoActive(db, toggle[1], toggle[2] === 'enable');
    return found ? json({ ok: true }) : json({ ok: false, error: 'not_found' }, 404);
  }

  const publish = /^\/api\/admin\/roles\/([\w-]{1,64})\/(publish|unpublish)$/.exec(pathname);
  if (publish) {
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    const r = await (publish[2] === 'publish' ? publishRole(env, publish[1]) : unpublishRole(env, publish[1]));
    if (!r.ok) return json({ ok: false, error: r.error }, r.error === 'not_found' ? 404 : 503);
    return json({ ok: true, slug: r.slug, status: publish[2] === 'publish' ? 'published' : 'draft' });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}
