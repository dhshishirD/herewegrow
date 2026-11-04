// POST /api/promo/check (what would this code do?) and POST /api/promo/redeem (take a free-trial code).

import { getSessionUser } from './auth';
import { quoteFor } from './handlers';
import { isAllowedOrigin, json, type Env } from './paymently';
import { lookupPromo, redeemTrial } from './promo';

const CHECKS_PER_HOUR = 30;

const clientIp = (r: Request) => r.headers.get('CF-Connecting-IP') ?? 'unknown';

/** Count a try against the caller's address. Slows down anyone guessing codes. */
async function allowTry(env: Env, request: Request): Promise<boolean> {
  if (!env.KV) return true;
  const key = `rl:promo:${clientIp(request)}`;
  const n = Number((await env.KV.get(key)) ?? 0);
  if (n >= CHECKS_PER_HOUR) return false;
  await env.KV.put(key, String(n + 1), { expirationTtl: 3600 });
  return true;
}

const STATUS = { invalid: 400, expired: 400, scope: 400, used_up: 400, already_used: 400, type: 400, trial_used: 409 } as const;

export async function handlePromo(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  if (!(await allowTry(env, request))) return json({ ok: false, error: 'rate' }, 429);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const user = await getSessionUser(env, request).catch(() => null);

  try {
    if (pathname === '/api/promo/check') {
      const promo = await lookupPromo(env.DB, body.code);
      // A trial code is answered on its own: it has no price, only days.
      if (promo?.type === 'trial_days' && promo.active && (promo.expiresAt == null || promo.expiresAt > Date.now())) {
        return json({ ok: true, kind: 'trial', code: promo.code, days: promo.value });
      }
      const q = await quoteFor(env, user, { productId: body.productId as string, templateIds: body.templateIds, promo: body.code });
      if ('status' in q) return json({ ok: false, error: q.reason ?? q.error }, q.status);
      if (!q.promo) return json({ ok: false, error: 'not_better' }, 400);
      return json({ ok: true, kind: 'discount', code: q.promo.code, type: q.promo.type, value: q.promo.value, list: q.list, price: q.price, discount: q.list - q.price });
    }

    if (pathname === '/api/promo/redeem') {
      if (!user) return json({ ok: false, error: 'login' }, 401);
      const r = await redeemTrial(env.DB, user, body.code);
      if (!r.ok) return json({ ok: false, error: r.error }, STATUS[r.error]);
      return json({ ok: true, days: r.days, proUntil: r.proUntil });
    }
  } catch (e) {
    console.error('promo request failed', pathname, e);
    return json({ ok: false, error: 'db' }, 500);
  }
  return json({ ok: false, error: 'not_found' }, 404);
}
