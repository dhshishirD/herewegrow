// Pro passes: granting time after a confirmed payment, recording orders, and renewal reminders.
// See the Phase 1 spec, sections 4 and 5. Times are Unix milliseconds.

import { DAY_MS, type Plan } from '../shared/plans';
import type { D1Like } from './cf';
import type { SmsProvider } from './sms';

export interface PaidOrder {
  /** Gateway invoice id. One grant per invoice, however often it is verified. */
  invoiceId: string;
  productId: string;
  amount: number;
  userId: string | null;
  phone: string | null;
}

const orderInsert = (db: D1Like, o: PaidOrder, now: number) =>
  db
    .prepare(
      `INSERT INTO orders (id, user_id, product_id, amount_bdt, status, gateway_ref, phone, created_at, paid_at)
       VALUES (?, ?, ?, ?, 'paid', ?, ?, ?, ?)
       ON CONFLICT(gateway_ref) DO NOTHING`,
    )
    .bind(crypto.randomUUID(), o.userId, o.productId, Math.round(o.amount), o.invoiceId, o.phone, now, now);

/** Keep a record of a paid template or service order. Safe to call more than once. */
export async function recordOrder(db: D1Like, o: PaidOrder, now = Date.now()): Promise<void> {
  await orderInsert(db, o, now).run();
}

/**
 * Add a pass's days to the user's Pro time, once per invoice.
 * Runs as one D1 batch (a transaction): the order, the grant and the new "Pro until" land together or not at all.
 * Returns whether this call added the time, and the user's Pro end date afterwards.
 */
export async function grantPass(
  db: D1Like,
  order: PaidOrder & { userId: string },
  plan: Plan,
  now = Date.now(),
): Promise<{ granted: boolean; proUntil: number | null }> {
  const token = crypto.randomUUID();
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO entitlements (user_id, updated_at) VALUES (?, ?)').bind(order.userId, now),
    db
      .prepare('INSERT OR IGNORE INTO pass_grants (order_id, user_id, plan_id, days, granted_at, token) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(order.invoiceId, order.userId, plan.id, plan.days, now, token),
    // Only the request whose token is stored adds time: max(now, current end) + days.
    db
      .prepare(
        `UPDATE entitlements SET pro_until = MAX(?, COALESCE(pro_until, 0)) + ?, updated_at = ?
         WHERE user_id = ? AND EXISTS (SELECT 1 FROM pass_grants WHERE order_id = ? AND token = ?)`,
      )
      .bind(now, plan.days * DAY_MS, now, order.userId, order.invoiceId, token),
    orderInsert(db, order, now),
  ]);
  const grant = await db.prepare('SELECT token FROM pass_grants WHERE order_id = ?').bind(order.invoiceId).first<{ token: string }>();
  const ent = await db.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(order.userId).first<{ pro_until: number | null }>();
  return { granted: grant?.token === token, proUntil: ent?.pro_until ?? null };
}

// ---- renewal reminders (daily Cron Trigger) ----

const REMIND_BEFORE_MS = 3 * DAY_MS;
/** Passes that ended longer ago than this get no "ended" SMS (avoids messaging old accounts). */
const ENDED_WINDOW_MS = 2 * DAY_MS;
const BATCH = 200;

const dhakaDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short' });

export const reminderText = {
  soon: (until: number) => `HereWeGrow: your Pro ends on ${dhakaDate(until)}. Add more time from 49 Tk: herewegrow.pro/pro`,
  ended: () => 'HereWeGrow: your Pro has ended. Your CVs are safe. Renew from 49 Tk: herewegrow.pro/pro',
};

interface Due {
  user_id: string;
  phone: string;
  pro_until: number;
}

/** Send each "ending in 3 days" and "has ended" SMS once per pass end date. */
export async function sendReminders(db: D1Like, sms: SmsProvider, now = Date.now()): Promise<{ soon: number; ended: number; failed: number }> {
  const out = { soon: 0, ended: 0, failed: 0 };

  const soon = await db
    .prepare(
      `SELECT e.user_id, u.phone, e.pro_until FROM entitlements e JOIN users u ON u.id = e.user_id
       WHERE u.phone IS NOT NULL AND e.pro_until > ? AND e.pro_until <= ?
         AND (e.reminded_soon IS NULL OR e.reminded_soon <> e.pro_until)
       LIMIT ${BATCH}`,
    )
    .bind(now, now + REMIND_BEFORE_MS)
    .all<Due>();
  for (const r of soon.results ?? []) {
    if (await sms.send(r.phone, reminderText.soon(r.pro_until))) {
      await db.prepare('UPDATE entitlements SET reminded_soon = ? WHERE user_id = ? AND pro_until = ?').bind(r.pro_until, r.user_id, r.pro_until).run();
      out.soon++;
    } else out.failed++;
  }

  const ended = await db
    .prepare(
      `SELECT e.user_id, u.phone, e.pro_until FROM entitlements e JOIN users u ON u.id = e.user_id
       WHERE u.phone IS NOT NULL AND e.pro_until <= ? AND e.pro_until > ?
         AND (e.reminded_end IS NULL OR e.reminded_end <> e.pro_until)
       LIMIT ${BATCH}`,
    )
    .bind(now, now - ENDED_WINDOW_MS)
    .all<Due>();
  for (const r of ended.results ?? []) {
    if (await sms.send(r.phone, reminderText.ended())) {
      await db.prepare('UPDATE entitlements SET reminded_end = ? WHERE user_id = ? AND pro_until = ?').bind(r.pro_until, r.user_id, r.pro_until).run();
      out.ended++;
    } else out.failed++;
  }
  return out;
}
