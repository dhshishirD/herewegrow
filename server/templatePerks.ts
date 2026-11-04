// Template perks for Pro members (Phase 1 spec, sections 2 and 6):
// discounted checkout, one free template a month on the 30-day pass, all templates on the yearly pass,
// and a fair-use limit on claimed downloads per day. All checks run on the server.

import { DAY_MS, PLANS, PRO_LIMITS, findPlan, type Plan } from '../shared/plans';
import type { Product } from '../shared/catalog';
import type { D1Like, KVLike } from './cf';

/** The plan whose perks apply to a user now, or null when Pro is not active. */
export async function activePlan(db: D1Like, userId: string, now = Date.now()): Promise<Plan | null> {
  const ent = await db.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(userId).first<{ pro_until: number | null }>();
  if (!ent?.pro_until || ent.pro_until <= now) return null;
  const rows = await db
    .prepare('SELECT plan_id, granted_at FROM pass_grants WHERE user_id = ? ORDER BY granted_at DESC')
    .bind(userId)
    .all<{ plan_id: string; granted_at: number }>();
  const grants = (rows.results ?? []).flatMap((r) => {
    const plan = findPlan(r.plan_id);
    return plan ? [{ plan, at: r.granted_at }] : [];
  });
  // Best perk among passes still inside their own window (a short top-up must not hide a yearly pass).
  const open = grants.filter((g) => g.at + g.plan.days * DAY_MS > now).map((g) => g.plan);
  const pool = open.length ? open : grants.slice(0, 1).map((g) => g.plan);
  return pool.sort((a, b) => b.templateOff - a.templateOff || b.freeTemplatesPerMonth - a.freeTemplatesPerMonth)[0] ?? PLANS[0];
}

/** Dhaka calendar day (yyyymmdd) and month (yyyy-mm) for quota keys. */
const dhaka = (now: number) => new Date(now + 6 * 3600_000).toISOString();
export const dayKey = (now = Date.now()) => dhaka(now).slice(0, 10).replace(/-/g, '');
export const monthKey = (now = Date.now()) => dhaka(now).slice(0, 7);

export type ClaimError = 'plan' | 'single' | 'used' | 'limit' | 'product';

/**
 * Decide whether a Pro user may take `product` without paying, and record it.
 * - Yearly pass: any template product, up to the daily limit.
 * - 30-day pass: one single template per month.
 * - 7-day pass: no free templates (discount only).
 * Files count one each (a pack is one zip).
 */
export async function claimTemplate(
  db: D1Like,
  kv: KVLike,
  userId: string,
  plan: Plan,
  product: Product,
  now = Date.now(),
): Promise<{ ok: true } | { ok: false; error: ClaimError }> {
  if (product.kind === 'service' || !product.files?.length) return { ok: false, error: 'product' };
  const n = product.files.length;
  const key = `q:dl:${userId}:${dayKey(now)}`;
  const used = Number((await kv.get(key)) ?? 0);

  if (plan.templateOff >= 100) {
    if (used + n > PRO_LIMITS.templateDownloadsPerDay) return { ok: false, error: 'limit' };
  } else if (plan.freeTemplatesPerMonth > 0) {
    const single = product.templates?.length === 1 ? product.templates[0] : null;
    if (!single || product.kind === 'pack') return { ok: false, error: 'single' };
    const r = await db
      .prepare('INSERT OR IGNORE INTO template_claims (user_id, template_id, month, created_at) VALUES (?, ?, ?, ?)')
      .bind(userId, single, monthKey(now), now)
      .run();
    if (!r.meta.changes) return { ok: false, error: 'used' };
  } else {
    return { ok: false, error: 'plan' };
  }
  await kv.put(key, String(used + n), { expirationTtl: 2 * 86400 });
  return { ok: true };
}
