// HTTP handlers for /api/auth/*. Business logic is in auth.ts and google.ts.

import { activePlan } from './templatePerks';
import {
  clearCookie, createSession, destroySession, getSessionUser, publicUser, requestOtp, sessionCookie,
  userForGoogle, userForPhone, verifyOtp, type AuthEnv,
} from './auth';
import { googleConfigured, googleFinish, googleStartUrl, safeNext } from './google';
import { isAllowedOrigin, json } from './paymently';

const clientIp = (r: Request) => r.headers.get('CF-Connecting-IP') ?? 'unknown';

async function turnstileOk(env: AuthEnv, token: unknown, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true; // not enabled yet
  if (typeof token !== 'string' || !token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  return ((await res.json().catch(() => ({}))) as { success?: boolean }).success === true;
}

const withCookie = (res: Response, cookie: string) => {
  res.headers.append('Set-Cookie', cookie);
  return res;
};

export async function handleAuth(request: Request, env: AuthEnv, pathname: string): Promise<Response> {
  const url = new URL(request.url);
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);

  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await getSessionUser(env, request);
    const proPlan = user && env.DB ? ((await activePlan(env.DB, user.id).catch(() => null))?.id ?? null) : null;
    return json({ ok: true, user: user ? { ...publicUser(user), proPlan } : null, google: googleConfigured(env) });
  }

  if (pathname === '/api/auth/google/start' && request.method === 'GET') {
    if (!googleConfigured(env)) return json({ ok: false, error: 'google' }, 503);
    const dest = await googleStartUrl(env, url.origin, safeNext(url.searchParams.get('next')));
    return new Response(null, { status: 302, headers: { Location: dest, 'Cache-Control': 'no-store' } });
  }

  if (pathname === '/api/auth/google/callback' && request.method === 'GET') {
    const fail = (why: string) => new Response(null, { status: 302, headers: { Location: `/account?login=${why}` } });
    if (!googleConfigured(env)) return fail('failed');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state) return fail('failed');
    const g = await googleFinish(env, url.origin, code, state);
    if (!g) return fail('failed');
    const user = await userForGoogle(env.DB, g);
    const sid = await createSession(env, user.id);
    return withCookie(new Response(null, { status: 302, headers: { Location: safeNext(g.next) } }), sessionCookie(sid));
  }

  // Everything below changes state: same-origin POST only.
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (pathname === '/api/auth/otp') {
    const ip = clientIp(request);
    if (!(await turnstileOk(env, body.turnstile, ip))) return json({ ok: false, error: 'captcha' }, 400);
    const r = await requestOtp(env, body.phone, ip);
    if (!r.ok) return json({ ok: false, error: r.error }, r.error === 'rate' ? 429 : r.error === 'phone' ? 400 : 502);
    return json({ ok: true });
  }

  if (pathname === '/api/auth/verify') {
    const phone = await verifyOtp(env, body.phone, body.code);
    if (!phone) return json({ ok: false, error: 'code' }, 400);
    const user = await userForPhone(env.DB, phone, body.lang === 'en' ? 'en' : 'bn');
    const sid = await createSession(env, user.id);
    return withCookie(json({ ok: true, user: publicUser(user) }), sessionCookie(sid));
  }

  if (pathname === '/api/auth/logout') {
    await destroySession(env, request);
    return withCookie(json({ ok: true }), clearCookie());
  }

  return json({ ok: false, error: 'not_found' }, 404);
}
