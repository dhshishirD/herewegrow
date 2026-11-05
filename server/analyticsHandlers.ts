// POST /api/t: the analytics beacon. Always answers 204 so tracking never affects the page.
// No KV writes here: Cloudflare Free allows 1,000 KV writes a day for the whole account, and login and checkout need them.
import { deviceOf, dhakaDayStart, isBot, parseTrack, recordEvent } from './analytics';
import { getSessionUser, type AuthEnv } from './auth';
import type { D1Like } from './cf';
import { isAllowedOrigin } from './paymently';

const MAX_BODY_BYTES = 1024;
const MAX_EVENTS_PER_VID_DAY = 300;
const IP_LIMIT_PER_MINUTE = 120;
const IP_WINDOW_MS = 60_000;
const noContent = () => new Response(null, { status: 204 });

/**
 * Best-effort per-IP limiter: at most 120 events per IP per one-minute window. The map lives in this Worker isolate only,
 * so the limit is per isolate (Cloudflare runs many) and resets when the isolate is recycled. It only blunts a single
 * client hammering one isolate; the real guard is a Cloudflare WAF rate-limiting rule on /api/t. IPs are never stored in D1.
 * The map is bounded: expired windows are swept once a minute, and past maxKeys the oldest entries are dropped.
 */
function createIpLimiter(limit: number, windowMs: number, maxKeys: number) {
  const hits = new Map<string, { start: number; n: number }>();
  let lastSweep = 0;
  const sweep = (now: number) => {
    lastSweep = now;
    for (const [ip, w] of hits) if (now - w.start >= windowMs) hits.delete(ip);
  };
  return {
    maxKeys,
    allow(ip: string, now: number = Date.now()): boolean {
      if (now - lastSweep >= windowMs || hits.size >= maxKeys) sweep(now);
      // Still full after the sweep: forget the oldest windows (Map keeps insertion order).
      for (const ip0 of hits.keys()) {
        if (hits.size < maxKeys) break;
        hits.delete(ip0);
      }
      const w = hits.get(ip);
      if (!w || now - w.start >= windowMs) {
        hits.delete(ip);
        hits.set(ip, { start: now, n: 1 });
        return true;
      }
      if (w.n >= limit) return false;
      w.n++;
      return true;
    },
    size: () => hits.size,
    reset: () => {
      hits.clear();
      lastSweep = 0;
    },
  };
}

export const ipLimiter = createIpLimiter(IP_LIMIT_PER_MINUTE, IP_WINDOW_MS, 10_000);

/**
 * Events this visitor already has today (Dhaka day), via the events(vid, ts) index. A soft cap: concurrent requests
 * from one visitor can each see a count just under the limit, so a few extra rows can land.
 */
async function eventsToday(db: D1Like, vid: string, ts: number): Promise<number> {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM events WHERE vid = ? AND ts >= ?').bind(vid, dhakaDayStart(ts)).first<{ n: number }>();
  return r?.n ?? 0;
}

export async function handleTrack(request: Request, env: AuthEnv): Promise<Response> {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  try {
    if (!env.DB) return noContent();
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return noContent();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return noContent();
    }
    const input = parseTrack(body);
    if (!input) return noContent();
    const ua = request.headers.get('User-Agent');
    if (isBot(ua)) return noContent();

    const ts = Date.now();
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip && !ipLimiter.allow(ip, ts)) return noContent();

    // Admin filtering: KV reads only (getSessionUser writes at most a once-a-day session refresh, as on any page).
    const user = await getSessionUser(env, request);
    if (user?.isAdmin) return noContent();

    if ((await eventsToday(env.DB, input.vid, ts)) >= MAX_EVENTS_PER_VID_DAY) return noContent();

    const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
    await recordEvent(env.DB, input, { ts, country, device: deviceOf(ua), userId: user?.id ?? null });
  } catch (e) {
    console.error('track failed', e);
  }
  return noContent();
}
