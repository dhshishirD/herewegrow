// Admin "Customers": find one account by phone, email or name, see what it holds, and open its saved CVs.
// Every search that shows an account and every CV opened or exported writes a row to admin_lookups first;
// if that row cannot be written nothing is shown (fail closed), so there is never an unlogged view.

import { findPlan } from '../shared/plans';
import { findProduct } from '../shared/catalog';
import { normalizePhone } from './auth';
import type { D1Like } from './cf';
import { getCv, listCvs, type CvSummary } from './cvs';

export const MIN_QUERY = 3;
export const MAX_QUERY = 80;
const MAX_RESULTS = 10;
export const CV_ACTIONS = ['view', 'pdf', 'word'] as const;
export type CvAction = (typeof CV_ACTIONS)[number];

export interface CustomerOrder { id: string; productId: string; productName: string; amount: number; status: string; invoiceId: string | null; createdAt: number; paidAt: number | null }
export interface CustomerGrant { invoiceId: string; kind: 'paid' | 'free'; productName: string; amount: number; note: string; createdAt: number }
export interface CustomerPass { orderId: string; planId: string; days: number; grantedAt: number }
export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  hasGoogle: boolean;
  isAdmin: boolean;
  createdAt: number;
  proUntil: number | null;
  proActive: boolean;
  orders: CustomerOrder[];
  grants: CustomerGrant[];
  passes: CustomerPass[];
  cvs: CvSummary[];
  partner: { code: string; name: string; suspended: boolean } | null;
}

const nameOf = (productId: string) => findPlan(productId)?.name.en ?? findProduct(productId)?.name.en ?? productId;
/** Escapes % and _ so a typed query is matched literally. */
const like = (s: string) => `%${s.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/** The cleaned search text, or null when it is too short or too long to search with. */
export function cleanQuery(raw: unknown): string | null {
  const q = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  return q.length >= MIN_QUERY && q.length <= MAX_QUERY ? q : null;
}

export async function logLookup(db: D1Like, adminId: string, query: string, userId: string | null, action: string, now = Date.now()): Promise<void> {
  await db
    .prepare('INSERT INTO admin_lookups (id, at, admin_id, query, user_id, action) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), now, adminId, query.slice(0, MAX_QUERY), userId, action)
    .run();
}

type UserRow = { id: string; name: string | null; phone: string | null; email: string | null; google_sub: string | null; is_admin: number; created_at: number; pro_until: number | null };

async function userIdsFor(db: D1Like, q: string): Promise<UserRow[]> {
  const phone = normalizePhone(q);
  const digits = q.replace(/[\s+-]/g, '');
  const onlyDigits = /^\d+$/.test(digits);
  const conds: string[] = [];
  const args: unknown[] = [];
  if (phone) { conds.push('u.phone = ?'); args.push(phone); }
  else if (onlyDigits) { conds.push("u.phone LIKE ? ESCAPE '\\'"); args.push(like(digits.replace(/^88/, ''))); }
  if (!onlyDigits) {
    conds.push("LOWER(u.email) LIKE ? ESCAPE '\\'", "LOWER(u.name) LIKE ? ESCAPE '\\'");
    args.push(like(q.toLowerCase()), like(q.toLowerCase()));
  }
  const r = await db
    .prepare(
      `SELECT u.id, u.name, u.phone, u.email, u.google_sub, u.is_admin, u.created_at, e.pro_until
       FROM users u LEFT JOIN entitlements e ON e.user_id = u.id
       WHERE ${conds.join(' OR ')} ORDER BY u.created_at DESC LIMIT ?`,
    )
    .bind(...args, MAX_RESULTS)
    .all<UserRow>();
  return r.results ?? [];
}

async function detail(db: D1Like, u: UserRow, now: number): Promise<Customer> {
  const orders = await db
    .prepare('SELECT id, product_id, amount_bdt, status, gateway_ref, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .bind(u.id)
    .all<{ id: string; product_id: string; amount_bdt: number; status: string; gateway_ref: string | null; created_at: number; paid_at: number | null }>();
  const grants = await db
    .prepare('SELECT invoice_id, kind, product_id, amount, note, created_at FROM manual_grants WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .bind(u.id)
    .all<{ invoice_id: string; kind: 'paid' | 'free'; product_id: string; amount: number; note: string; created_at: number }>();
  const passes = await db
    .prepare('SELECT order_id, plan_id, days, granted_at FROM pass_grants WHERE user_id = ? ORDER BY granted_at DESC LIMIT 20')
    .bind(u.id)
    .all<{ order_id: string; plan_id: string; days: number; granted_at: number }>();
  const partner = await db
    .prepare('SELECT code, name, suspended FROM partner_profiles WHERE user_id = ?')
    .bind(u.id)
    .first<{ code: string; name: string; suspended: number }>();
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    hasGoogle: !!u.google_sub,
    isAdmin: u.is_admin === 1,
    createdAt: u.created_at,
    proUntil: u.pro_until,
    proActive: !!u.pro_until && u.pro_until > now,
    orders: (orders.results ?? []).map((o) => ({ id: o.id, productId: o.product_id, productName: nameOf(o.product_id), amount: o.amount_bdt, status: o.status, invoiceId: o.gateway_ref, createdAt: o.created_at, paidAt: o.paid_at })),
    grants: (grants.results ?? []).map((g) => ({ invoiceId: g.invoice_id, kind: g.kind, productName: nameOf(g.product_id), amount: g.amount, note: g.note, createdAt: g.created_at })),
    passes: (passes.results ?? []).map((p) => ({ orderId: p.order_id, planId: p.plan_id, days: p.days, grantedAt: p.granted_at })),
    cvs: await listCvs(db, u.id),
    partner: partner ? { code: partner.code, name: partner.name, suspended: partner.suspended === 1 } : null,
  };
}

/** Searches, logs one row per account shown (or one row for an empty result), then returns the accounts. */
export async function searchCustomers(db: D1Like, adminId: string, q: string, now = Date.now()): Promise<Customer[]> {
  const users = await userIdsFor(db, q);
  if (users.length === 0) await logLookup(db, adminId, q, null, 'search', now);
  for (const u of users) await logLookup(db, adminId, q, u.id, 'search', now);
  return Promise.all(users.map((u) => detail(db, u, now)));
}

/** One saved CV of one account, for the admin to preview or export. Logged before it is returned. */
export async function openCustomerCv(db: D1Like, adminId: string, userId: string, cvId: string, action: CvAction, query: string, now = Date.now()) {
  const cv = await getCv(db, userId, cvId);
  if (!cv) return null;
  await logLookup(db, adminId, query, userId, `cv_${action}`, now);
  return cv;
}

export interface LookupRow { at: number; adminId: string; query: string; userId: string | null; action: string }

/** Most recent lookups, newest first, for the admin's own review. */
export async function recentLookups(db: D1Like, limit = 50): Promise<LookupRow[]> {
  const r = await db.prepare('SELECT at, admin_id, query, user_id, action FROM admin_lookups ORDER BY at DESC LIMIT ?').bind(limit).all<{ at: number; admin_id: string; query: string; user_id: string | null; action: string }>();
  return (r.results ?? []).map((x) => ({ at: x.at, adminId: x.admin_id, query: x.query, userId: x.user_id, action: x.action }));
}
