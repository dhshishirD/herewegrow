// GET /api/account/summary: everything the account dashboard shows in one call. Every query is scoped to the logged-in user.

import { findProduct } from '../shared/catalog';
import { findPlan } from '../shared/plans';
import { getSessionUser, type User } from './auth';
import type { D1Like } from './cf';
import { cvLimit, listCvs } from './cvs';
import { getPartner } from './partner';
import { json, type Env } from './paymently';

type B = { en: string; bn: string };
export interface Activity {
  id: string;
  kind: 'pass' | 'service' | 'pack' | 'template' | 'other';
  name: B;
  amount: number;
  at: number;
}

const nameOf = (productId: string): { kind: Activity['kind']; name: B } => {
  const plan = findPlan(productId);
  if (plan) return { kind: 'pass', name: plan.name };
  const p = findProduct(productId);
  if (p) return { kind: p.kind, name: p.name };
  return { kind: 'other', name: { en: 'Your order', bn: 'আপনার অর্ডার' } };
};

export async function accountSummary(db: D1Like, user: User, now = Date.now()) {
  const cvs = await listCvs(db, user.id);
  // Paid orders by account, or by the verified phone number (guest purchases made before logging in).
  const orders = await db
    .prepare("SELECT COALESCE(gateway_ref, id) AS id, product_id, amount_bdt, paid_at, created_at FROM orders WHERE status = 'paid' AND (user_id = ? OR (? IS NOT NULL AND phone = ?)) ORDER BY COALESCE(paid_at, created_at) DESC LIMIT 20")
    .bind(user.id, user.phone, user.phone)
    .all<{ id: string; product_id: string; amount_bdt: number; paid_at: number | null; created_at: number }>();
  const passes = await db
    .prepare('SELECT order_id, plan_id, granted_at FROM pass_grants WHERE user_id = ? ORDER BY granted_at DESC LIMIT 10')
    .bind(user.id)
    .all<{ order_id: string | null; plan_id: string; granted_at: number }>()
    .catch(() => ({ results: [] as { order_id: string | null; plan_id: string; granted_at: number }[] }));
  const activity: Activity[] = [
    ...(orders.results ?? []).map((o) => ({ id: o.id, ...nameOf(o.product_id), amount: o.amount_bdt, at: o.paid_at ?? o.created_at })),
    ...(passes.results ?? []).filter((g) => !(orders.results ?? []).some((o) => o.id === g.order_id)).map((g) => ({ id: g.order_id ?? `${g.plan_id}-${g.granted_at}`, ...nameOf(g.plan_id), amount: findPlan(g.plan_id)?.price ?? 0, at: g.granted_at })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);
  const partner = await getPartner(db, user.id, now).catch(() => null);
  return {
    cvs: cvs.slice(0, 20),
    cvLimit: cvLimit(user, now),
    activity,
    partner: { applied: !!partner, active: !!partner?.active },
  };
}

export async function handleAccount(request: Request, env: Env, pathname: string): Promise<Response> {
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  if (pathname !== '/api/account/summary' || request.method !== 'GET') return json({ ok: false, error: 'not_found' }, 404);
  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: 'login' }, 401);
  try {
    return json({ ok: true, ...(await accountSummary(env.DB, user)) });
  } catch (e) {
    console.error('account summary failed', e);
    return json({ ok: false, error: 'db' }, 500);
  }
}
