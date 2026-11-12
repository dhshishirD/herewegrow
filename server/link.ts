// Connect a phone number to an account that has none (for example one made with Google), so a person opens the same
// account whichever way they log in. If that phone number already has an account, the two are merged into it.

import type { User } from './auth';
import type { D1Like } from './cf';
import { DAY_MS } from '../shared/plans';

export type LinkResult =
  | { ok: true; userId: string; merged: boolean }
  | { ok: false; error: 'already' | 'conflict' | 'taken' };

// Tables whose rows follow the person. OR IGNORE: a clash on a unique key keeps the survivor's row.
const MOVE = [
  'orders', 'pass_grants', 'cvs', 'template_claims', 'skill_results', 'promo_redemptions', 'events', 'manual_grants',
  'partner_clients', 'partner_deliveries', 'partner_bonus_grants', 'partner_flags', 'partner_events', 'partner_devices',
];

/** `current` is logged in and has no phone; `phone` is verified by SMS. Returns the account the person now uses. */
export async function linkPhone(db: D1Like, current: User, phone: string, now = Date.now()): Promise<LinkResult> {
  if (current.phone) return { ok: false, error: 'already' };
  const owner = await db.prepare('SELECT id, email, name FROM users WHERE phone = ?').bind(phone).first<{ id: string; email: string | null; name: string | null }>();

  if (!owner) {
    const r = await db.prepare('UPDATE users SET phone = ? WHERE id = ? AND phone IS NULL').bind(phone, current.id).run();
    return r.meta?.changes ? { ok: true, userId: current.id, merged: false } : { ok: false, error: 'taken' };
  }
  if (owner.id === current.id) return { ok: false, error: 'already' };

  // Two partner profiles cannot be joined safely: ask a person to look at it.
  const both = await db
    .prepare('SELECT COUNT(*) AS n FROM partner_profiles WHERE user_id IN (?, ?)')
    .bind(owner.id, current.id)
    .first<{ n: number }>();
  if ((both?.n ?? 0) > 1) return { ok: false, error: 'conflict' };

  const donor = await db.prepare('SELECT google_sub, email, name, is_admin FROM users WHERE id = ?').bind(current.id).first<{ google_sub: string | null; email: string | null; name: string | null; is_admin: number }>();
  const ents = await db.prepare('SELECT user_id, pro_until FROM entitlements WHERE user_id IN (?, ?)').bind(owner.id, current.id).all<{ user_id: string; pro_until: number | null }>();
  const until = (id: string) => ents.results?.find((e) => e.user_id === id)?.pro_until ?? 0;
  // Days still left on either account add up.
  const proUntil = Math.max(until(owner.id), now) + Math.max(0, until(current.id) - now);
  const hasPro = until(owner.id) > now || until(current.id) > now;

  await db.batch([
    // Free the unique google_sub / email, then give them to the surviving (phone) account.
    db.prepare('UPDATE users SET google_sub = NULL, email = NULL WHERE id = ?').bind(current.id),
    db.prepare('UPDATE users SET google_sub = COALESCE(google_sub, ?), email = COALESCE(email, ?), name = COALESCE(name, ?), is_admin = MAX(is_admin, ?) WHERE id = ?').bind(donor?.google_sub ?? null, donor?.email ?? null, donor?.name ?? null, donor?.is_admin ?? 0, owner.id),
    ...(hasPro ? [db.prepare('UPDATE entitlements SET pro_until = ?, updated_at = ? WHERE user_id = ?').bind(proUntil, now, owner.id)] : []),
    db.prepare('UPDATE OR IGNORE partner_profiles SET user_id = ? WHERE user_id = ? AND NOT EXISTS (SELECT 1 FROM partner_profiles WHERE user_id = ?)').bind(owner.id, current.id, owner.id),
    ...MOVE.map((t) => db.prepare(`UPDATE OR IGNORE ${t} SET user_id = ? WHERE user_id = ?`).bind(owner.id, current.id)),
    db.prepare('DELETE FROM users WHERE id = ?').bind(current.id),
  ]);
  return { ok: true, userId: owner.id, merged: true };
}
