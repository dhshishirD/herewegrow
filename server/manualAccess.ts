// Manual access: an admin approves a payment they verified outside the gateway, or grants free access.
// Everything is recorded in manual_grants (never edited or deleted here), a payment reference can be approved only once,
// and the grant itself reuses the same idempotent code a gateway payment goes through.

import { findProduct } from '../shared/catalog';
import { CART_PRODUCT_ID } from '../shared/cart';
import { findPlan } from '../shared/plans';
import { trackPurchase } from './analytics';
import { normalizePhone, userForPhone } from './auth';
import type { D1Like } from './cf';
import { grantPass, recordOrder } from './entitlements';

export const MANUAL_PREFIXES = ['manual-', 'free-'] as const;
export const isManualInvoice = (id: string) => MANUAL_PREFIXES.some((p) => id.startsWith(p));

const MAX_AMOUNT = 100_000;

export interface ManualInput {
  kind?: unknown;
  phone?: unknown;
  productId?: unknown;
  amount?: unknown;
  reference?: unknown;
  note?: unknown;
}

export interface ManualGrant {
  id: string;
  createdAt: number;
  adminId: string | null;
  kind: 'paid' | 'free';
  phone: string;
  productId: string;
  productName: string;
  amount: number;
  reference: string | null;
  invoiceId: string;
  note: string;
}

type Row = {
  id: string;
  created_at: number;
  admin_id: string | null;
  kind: 'paid' | 'free';
  phone: string;
  user_id: string | null;
  product_id: string;
  amount: number;
  reference: string | null;
  invoice_id: string;
  note: string;
};

const nameOf = (productId: string) => findPlan(productId)?.name.en ?? findProduct(productId)?.name.en ?? productId;
const toGrant = (r: Row): ManualGrant => ({
  id: r.id,
  createdAt: r.created_at,
  adminId: r.admin_id,
  kind: r.kind,
  phone: r.phone,
  productId: r.product_id,
  productName: nameOf(r.product_id),
  amount: r.amount,
  reference: r.reference,
  invoiceId: r.invoice_id,
  note: r.note,
});

/** 12 random characters with no look-alikes. Anyone holding the invoice number can download, so it is not guessable. */
function newInvoiceId(kind: 'paid' | 'free'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `${kind === 'paid' ? 'manual' : 'free'}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

export type ManualResult =
  | { ok: true; grant: ManualGrant; proUntil: number | null; belowPrice: boolean }
  | { ok: false; error: 'invalid'; errors: string[] }
  | { ok: false; error: 'duplicate'; grant: ManualGrant };

/**
 * The row is written first (its unique reference is the guard against a double approval), then the grant is applied.
 * Applying is idempotent per invoice, so a retry after a half-finished attempt repairs it instead of adding time twice.
 */
export async function createManualGrant(db: D1Like, adminId: string, input: ManualInput, now = Date.now()): Promise<ManualResult> {
  const errors: string[] = [];
  const kind = input.kind === 'paid' || input.kind === 'free' ? input.kind : null;
  if (!kind) errors.push('Choose paid or free.');
  const phone = normalizePhone(input.phone);
  if (!phone) errors.push('Enter a Bangladeshi mobile number like 01XXXXXXXXX.');
  const productId = typeof input.productId === 'string' ? input.productId.trim() : '';
  const plan = findPlan(productId);
  const product = plan || productId === CART_PRODUCT_ID ? undefined : findProduct(productId);
  if (!plan && !product) errors.push('Choose a product or Pro plan from the list.');
  const note = typeof input.note === 'string' ? input.note.trim() : '';
  if (note.length < 3 || note.length > 200) errors.push('Write a short note (3 to 200 characters): who asked, and why.');

  let amount = 0;
  let reference: string | null = null;
  if (kind === 'paid') {
    amount = typeof input.amount === 'number' ? input.amount : Number(input.amount);
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) errors.push('Enter the amount you received, in whole taka.');
    reference = typeof input.reference === 'string' ? input.reference.trim().toUpperCase() : '';
    if (!/^[A-Z0-9]{6,40}$/.test(reference)) errors.push('Enter the payment transaction id (6 to 40 letters or digits).');
  }
  if (errors.length || !kind || !phone || (!plan && !product)) return { ok: false, error: 'invalid', errors };

  const id = crypto.randomUUID();
  const invoiceId = newInvoiceId(kind);
  const user = await userForPhone(db, phone, 'bn', now);
  const insert = await db
    .prepare(
      `INSERT INTO manual_grants (id, created_at, admin_id, kind, phone, user_id, product_id, amount, reference, invoice_id, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    )
    .bind(id, now, adminId, kind, phone, user.id, productId, amount, reference, invoiceId, note)
    .run();

  if ((insert.meta?.changes ?? 0) === 0) {
    // Same transaction id as an earlier approval: report it, and finish that approval if it was left half done.
    const existing = reference ? await db.prepare('SELECT * FROM manual_grants WHERE reference = ?').bind(reference).first<Row>() : null;
    if (!existing) return { ok: false, error: 'invalid', errors: ['Could not save. Try again.'] };
    await applyGrant(db, existing, now);
    return { ok: false, error: 'duplicate', grant: toGrant(existing) };
  }

  const row = (await db.prepare('SELECT * FROM manual_grants WHERE id = ?').bind(id).first<Row>())!;
  const proUntil = await applyGrant(db, row, now);
  const listPrice = plan?.price ?? product?.price ?? 0;
  return { ok: true, grant: toGrant(row), proUntil, belowPrice: kind === 'paid' && amount < listPrice };
}

/** Give what the row says: Pro days or an order record. Safe to run again for the same row. */
async function applyGrant(db: D1Like, row: Row, now: number): Promise<number | null> {
  const plan = findPlan(row.product_id);
  const order = { invoiceId: row.invoice_id, productId: row.product_id, amount: row.amount, userId: row.user_id, phone: row.phone };
  let proUntil: number | null = null;
  if (plan && row.user_id) {
    const r = await grantPass(db, { ...order, userId: row.user_id }, plan, now);
    proUntil = r.proUntil;
  } else {
    await recordOrder(db, order, now);
  }
  // A real payment shows up in analytics once (the event has a per-invoice dedupe key); a free grant never does.
  if (row.kind === 'paid') {
    await trackPurchase(db, { invoiceId: row.invoice_id, productId: row.product_id, amount: row.amount, vid: '', userId: row.user_id }).catch((e) =>
      console.error('track manual purchase failed', e),
    );
  }
  return proUntil;
}

export async function listManualGrants(db: D1Like, limit = 100): Promise<ManualGrant[]> {
  const r = await db.prepare('SELECT * FROM manual_grants ORDER BY created_at DESC LIMIT ?').bind(limit).all<Row>();
  return (r.results ?? []).map(toGrant);
}

/** For /api/verify: the grant behind a manual-/free- invoice number, or null. */
export async function findManualGrant(db: D1Like, invoiceId: string): Promise<ManualGrant | null> {
  const r = await db.prepare('SELECT * FROM manual_grants WHERE invoice_id = ?').bind(invoiceId).first<Row>();
  return r ? toGrant(r) : null;
}
