// POST /api/ai/<action>: the Builder's AI writing assistant. Pro only, 30 actions a day,
// counted only when an answer comes back. Token use is logged per user in Workers Logs.

import { PRO_LIMITS } from '../../shared/plans';
import { getSessionUser } from '../auth';
import { isPro } from '../cvs';
import { isAllowedOrigin, json, type Env } from '../paymently';
import { buildRequest, isAiAction, parseOutput } from './actions';
import { aiProvider, type AiEnv } from './provider';

const DAY_TTL = 2 * 86_400;

/** Bangladesh calendar day, so the daily allowance resets at midnight in Dhaka. */
export const dhakaDay = (now: number) => new Date(now + 6 * 3_600_000).toISOString().slice(0, 10).replace(/-/g, '');

export async function handleAi(request: Request, env: Env & AiEnv, pathname: string, now = Date.now()): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const action = pathname.slice('/api/ai/'.length);
  if (!isAiAction(action)) return json({ ok: false, error: 'not_found' }, 404);

  const provider = aiProvider(env);
  if (!provider || !env.KV || !env.DB) return json({ ok: false, error: 'config' }, 503);

  const user = await getSessionUser(env, request, now);
  if (!user) return json({ ok: false, error: 'login' }, 401);
  if (!isPro(user, now)) return json({ ok: false, error: 'pro' }, 403);

  const quotaKey = `q:ai:${user.id}:${dhakaDay(now)}`;
  const used = Number((await env.KV.get(quotaKey)) ?? 0) || 0;
  if (used >= PRO_LIMITS.aiActionsPerDay) return json({ ok: false, error: 'quota', left: 0 }, 429);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const lang = body.lang === 'en' ? 'en' : 'bn';
  const built = buildRequest(action, body, lang);
  if (!built) return json({ ok: false, error: 'bad' }, 400);

  let result;
  try {
    const r = await provider.run(built.req);
    console.log('ai_use', { user: user.id, action, provider: provider.name, in: r.inputTokens, out: r.outputTokens });
    result = parseOutput(action, r.text);
  } catch (err) {
    console.error('ai failed', action, err);
    return json({ ok: false, error: 'ai' }, 502);
  }
  // Nothing usable: not counted.
  if (!result) return json({ ok: false, error: 'ai' }, 502);

  await env.KV.put(quotaKey, String(used + 1), { expirationTtl: DAY_TTL });
  return json({ ok: true, result, left: PRO_LIMITS.aiActionsPerDay - used - 1 });
}
