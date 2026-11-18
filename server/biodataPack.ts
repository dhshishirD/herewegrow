// Clean pack for the marriage biodata maker: who has it, and granting it once per paid invoice.
import { BIODATA_PACK } from '../shared/biodataPack';
import type { D1Like } from './cf';
import { orderInsert, type PaidOrder } from './entitlements';

/** True when the account bought the pack. False (never an error) if the table is not there yet. */
export async function hasBiodataPack(db: D1Like, userId: string): Promise<boolean> {
  try {
    const r = await db.prepare('SELECT 1 AS ok FROM biodata_grants WHERE user_id = ? LIMIT 1').bind(userId).first<{ ok: number }>();
    return !!r;
  } catch {
    return false;
  }
}

/** One grant per invoice, however often it is verified. Returns true only when this call added it. */
export async function grantBiodataPack(db: D1Like, order: PaidOrder & { userId: string }, now = Date.now()): Promise<boolean> {
  const [g] = await db.batch([
    db.prepare('INSERT OR IGNORE INTO biodata_grants (order_id, user_id, granted_at) VALUES (?, ?, ?)').bind(order.invoiceId, order.userId, now),
    orderInsert(db, { ...order, productId: BIODATA_PACK.id }, now),
  ]);
  return (g.meta?.changes ?? 0) > 0;
}
