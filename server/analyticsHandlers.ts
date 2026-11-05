// POST /api/t: the analytics beacon. Always answers 204 so tracking never affects the page.
import { deviceOf, dhakaDay, isBot, parseTrack, recordEvent } from './analytics';
import { getSessionUser, type AuthEnv } from './auth';
import { isAllowedOrigin } from './paymently';

const MAX_BODY_BYTES = 1024;
const MAX_EVENTS_PER_VID_DAY = 300;
const noContent = () => new Response(null, { status: 204 });

export async function handleTrack(request: Request, env: AuthEnv): Promise<Response> {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  try {
    if (!env.DB || !env.KV) return noContent();
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

    const user = await getSessionUser(env, request);
    if (user?.isAdmin) return noContent();

    const ts = Date.now();
    const capKey = `evcap:${input.vid}:${dhakaDay(ts)}`;
    const n = Number((await env.KV.get(capKey)) ?? 0);
    if (n >= MAX_EVENTS_PER_VID_DAY) return noContent();
    await env.KV.put(capKey, String(n + 1), { expirationTtl: 86_400 });

    const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
    await recordEvent(env.DB, input, { ts, country, device: deviceOf(ua), userId: user?.id ?? null });
  } catch (e) {
    console.error('track failed', e);
  }
  return noContent();
}
