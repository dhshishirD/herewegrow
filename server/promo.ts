// Promo codes: look up and check a code, record its use, redeem a free trial, and the admin helpers.
// Prices are always worked out here on the server; the browser only displays them.

import { findPlan } from '../shared/plans';
import { discountedPrice, type PromoScope, type PromoType } from '../shared/promo';
import type { D1Like } from './cf';
import { grantPass } from './entitlements';

export interface Promo {
  code: string;
  type: PromoType;
  value: number;
  scope: PromoScope;
  maxUses: number | null;
  perUser: number;
  startsAt: number | null;
  expiresAt: number | null;
  active: boolean;
  note: string | null;
  createdAt: number;
}

export type PromoError = 'invalid' | 'expired' | 'scope' | 'used_up' | 'already_used' | 'type' | 'trial_used';

const CODE = /^[A-Z0-9][A-Z0-9-]{2,23}$/;
const TYPES: PromoType[] = ['percent', 'fixed', 'trial_days'];
const SCOPES: PromoScope[] = ['all', 'pro', 'template', 'service'];
export const MAX_BULK = 500;

export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return CODE.test(code) ? code : null;
}

const toPromo = (r: Record<string, unknown>): Promo => ({
  code: r.code as string,
  type: r.type as PromoType,
  value: r.value as number,
  scope: r.scope as PromoScope,
  maxUses: (r.max_uses as number) ?? null,
  perUser: r.per_user as number,
  startsAt: (r.starts_at as number) ?? null,
  expiresAt: (r.expires_at as number) ?? null,
  active: r.active === 1,
  note: (r.note as string) ?? null,
  createdAt: r.created_at as number,
});

/** The code's definition as stored, with no date, scope or usage checks. */
export async function lookupPromo(db: D1Like, raw: unknown): Promise<Promo | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  const row = await db.prepare('SELECT * FROM promo_codes WHERE code = ?').bind(code).first();
  return row ? toPromo(row) : null;
}

const countWhere = async (db: D1Like, sql: string, ...args: unknown[]) =>
  (await db.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0;

export interface PromoContext {
  scope: Exclude<PromoScope, 'all'>;
  userId: string | null;
  now: number;
}

/**
 * Can this code be used now, on this kind of product, by this buyer?
 * Unknown, switched-off and not-yet-started codes all answer 'invalid' so codes cannot be probed.
 */
export async function checkPromo(db: D1Like, raw: unknown, ctx: PromoContext): Promise<{ ok: true; promo: Promo } | { ok: false; error: PromoError }> {
  const promo = await lookupPromo(db, raw);
  if (!promo || !promo.active || (promo.startsAt != null && promo.startsAt > ctx.now)) return { ok: false, error: 'invalid' };
  if (promo.expiresAt != null && promo.expiresAt <= ctx.now) return { ok: false, error: 'expired' };
  if (promo.scope !== 'all' && promo.scope !== ctx.scope) return { ok: false, error: 'scope' };
  if (promo.maxUses != null && (await countWhere(db, 'SELECT COUNT(*) AS n FROM promo_redemptions WHERE code = ?', promo.code)) >= promo.maxUses) {
    return { ok: false, error: 'used_up' };
  }
  if (ctx.userId && (await countWhere(db, 'SELECT COUNT(*) AS n FROM promo_redemptions WHERE code = ? AND user_id = ?', promo.code, ctx.userId)) >= promo.perUser) {
    return { ok: false, error: 'already_used' };
  }
  return { ok: true, promo };
}

export interface Redemption {
  code: string;
  userId: string | null;
  invoiceId: string;
  amount: number;
  discount: number;
  kind: 'discount' | 'trial';
}

/** Record a use after the payment is confirmed. Safe to call again for the same invoice. */
export async function recordRedemption(db: D1Like, r: Redemption, now = Date.now()): Promise<void> {
  await db
    .prepare('INSERT OR IGNORE INTO promo_redemptions (id, code, user_id, invoice_id, kind, amount, discount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), r.code, r.userId, r.invoiceId, r.kind, Math.round(r.amount), Math.round(r.discount), now)
    .run();
}

/** Price to charge for `list` with this code, as the number of taka. */
export const priceWith = (list: number, promo: Promo) => discountedPrice(list, promo);

/**
 * Redeem a free-trial code: adds the days to the account (as a Pro 7-day pass worth of perks), once per account.
 * The grant is keyed on the account, so a retry or a second code never adds more time.
 */
export async function redeemTrial(
  db: D1Like,
  user: { id: string; phone: string | null },
  raw: unknown,
  now = Date.now(),
): Promise<{ ok: true; days: number; proUntil: number | null } | { ok: false; error: PromoError }> {
  const promo = await lookupPromo(db, raw);
  if (!promo || !promo.active) return { ok: false, error: 'invalid' };
  if (promo.type !== 'trial_days') return { ok: false, error: 'type' };
  if (await countWhere(db, "SELECT COUNT(*) AS n FROM promo_redemptions WHERE user_id = ? AND kind = 'trial'", user.id)) {
    return { ok: false, error: 'trial_used' };
  }
  const checked = await checkPromo(db, promo.code, { scope: 'pro', userId: null, now });
  if (!checked.ok) return checked;

  const invoiceId = `trial-${user.id}`;
  const base = findPlan('pro-7')!;
  const grant = await grantPass(db, { invoiceId, productId: 'promo-trial', amount: 0, userId: user.id, phone: user.phone }, { ...base, days: promo.value }, now);
  await recordRedemption(db, { code: promo.code, userId: user.id, invoiceId, amount: 0, discount: 0, kind: 'trial' }, now);
  return { ok: true, days: promo.value, proUntil: grant.proUntil };
}

// ---- admin ----

export interface PromoInput {
  code?: unknown;
  type?: unknown;
  value?: unknown;
  scope?: unknown;
  maxUses?: unknown;
  perUser?: unknown;
  startsAt?: unknown;
  expiresAt?: unknown;
  note?: unknown;
}

const isInt = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const optInt = (v: unknown): number | null | undefined => (v === undefined || v === null || v === '' ? null : typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Checks everything except the code itself, and returns the cleaned fields. */
function cleanFields(input: PromoInput): { errors: string[]; f?: Omit<Promo, 'code' | 'createdAt' | 'active'> } {
  const errors: string[] = [];
  const type = input.type as PromoType;
  if (!TYPES.includes(type)) errors.push('type must be percent, fixed or trial_days');
  const limits: Record<PromoType, [number, number]> = { percent: [1, 100], fixed: [1, 10_000], trial_days: [1, 365] };
  if (TYPES.includes(type) && !isInt(input.value, ...limits[type])) errors.push(`value must be a whole number from ${limits[type][0]} to ${limits[type][1]} for ${type}`);
  let scope = (input.scope ?? 'all') as PromoScope;
  if (!SCOPES.includes(scope)) {
    errors.push('scope must be all, pro, template or service');
    scope = 'all';
  }
  if (type === 'trial_days') scope = 'pro';
  const maxUses = optInt(input.maxUses);
  if (maxUses === undefined || (maxUses !== null && !isInt(maxUses, 1, 1_000_000))) errors.push('maxUses must be empty or a whole number of 1 or more');
  const perUser = input.perUser === undefined || input.perUser === null || input.perUser === '' ? 1 : input.perUser;
  if (!isInt(perUser, 1, 1000)) errors.push('perUser must be a whole number of 1 or more');
  const startsAt = optInt(input.startsAt);
  const expiresAt = optInt(input.expiresAt);
  if (startsAt === undefined || expiresAt === undefined) errors.push('startsAt and expiresAt must be empty or a time');
  if (typeof startsAt === 'number' && typeof expiresAt === 'number' && expiresAt <= startsAt) errors.push('expiresAt must be after startsAt');
  const note = typeof input.note === 'string' && input.note.trim() ? input.note.trim().slice(0, 200) : null;
  if (errors.length) return { errors };
  return {
    errors,
    f: { type, value: input.value as number, scope, maxUses: maxUses ?? null, perUser: perUser as number, startsAt: startsAt ?? null, expiresAt: expiresAt ?? null, note },
  };
}

const insertPromo = (db: D1Like, code: string, f: NonNullable<ReturnType<typeof cleanFields>['f']>, now: number) =>
  db
    .prepare('INSERT INTO promo_codes (code, type, value, scope, max_uses, per_user, starts_at, expires_at, active, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)')
    .bind(code, f.type, f.value, f.scope, f.maxUses, f.perUser, f.startsAt, f.expiresAt, f.note, now);

export async function createPromo(db: D1Like, input: PromoInput, now = Date.now()): Promise<{ ok: true; promo: Promo } | { ok: false; errors: string[] }> {
  const { errors, f } = cleanFields(input);
  const code = normalizeCode(input.code);
  if (!code) errors.push('code must be 3 to 24 letters, numbers or hyphens');
  if (errors.length || !f || !code) return { ok: false, errors };
  if (await lookupPromo(db, code)) return { ok: false, errors: ['that code already exists'] };
  await insertPromo(db, code, f, now).run();
  return { ok: true, promo: (await lookupPromo(db, code))! };
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no look-alike characters
const randomPart = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHABET[b % ALPHABET.length]).join('');

/** Many single-use codes at once (for example one per workshop student). Codes look like WS-K7M2QX. */
export async function bulkCreatePromos(
  db: D1Like,
  input: PromoInput & { prefix?: unknown; count?: unknown },
  now = Date.now(),
): Promise<{ ok: true; codes: string[] } | { ok: false; errors: string[] }> {
  const { errors, f } = cleanFields({ ...input, maxUses: input.maxUses ?? 1 });
  const prefix = typeof input.prefix === 'string' ? input.prefix.trim().toUpperCase() : '';
  if (!/^[A-Z0-9]{2,12}$/.test(prefix)) errors.push('prefix must be 2 to 12 letters or numbers');
  if (!isInt(input.count, 1, MAX_BULK)) errors.push(`count must be a whole number from 1 to ${MAX_BULK}`);
  if (errors.length || !f) return { ok: false, errors };

  const codes = new Set<string>();
  while (codes.size < (input.count as number)) codes.add(`${prefix}-${randomPart()}`);
  const list = [...codes];
  await db.batch(list.map((c) => insertPromo(db, c, f, now)));
  return { ok: true, codes: list };
}

export async function setPromoActive(db: D1Like, raw: unknown, active: boolean): Promise<boolean> {
  const code = normalizeCode(raw);
  if (!code) return false;
  const r = await db.prepare('UPDATE promo_codes SET active = ? WHERE code = ?').bind(active ? 1 : 0, code).run();
  return !!r.meta?.changes;
}

export interface PromoRow extends Promo {
  used: number;
  discountTotal: number;
}

export async function listPromos(db: D1Like): Promise<PromoRow[]> {
  const rows = await db
    .prepare(
      `SELECT p.*, COUNT(r.id) AS used, COALESCE(SUM(r.discount), 0) AS discount_total
       FROM promo_codes p LEFT JOIN promo_redemptions r ON r.code = p.code
       GROUP BY p.code ORDER BY p.created_at DESC, p.code DESC`,
    )
    .all();
  return (rows.results ?? []).map((r) => ({ ...toPromo(r), used: r.used as number, discountTotal: r.discount_total as number }));
}
