// Admin side of the CV Partner Workspace (/api/admin/partners/*). The caller (admin.ts) has already checked is_admin.
// Only counts and pass facts are shown here, never a client's name, phone, note or CV.

import type { D1Like } from './cf';
import { json } from './paymently';
import { DAY_MS } from '../shared/plans';
import { daysLeft, dhakaMonth, levelFor } from '../shared/partner';
import { DEFAULT_DAILY_ALERT, bonusCap, clientsUsed, getPartner, revokeBonus, setting } from './partner';

interface Row {
  user_id: string;
  name: string;
  phone: string | null;
  code: string;
  suspended: number;
  created_at: number;
}

export async function listPartners(db: D1Like, now = Date.now()) {
  const rows = await db
    .prepare('SELECT p.user_id, p.name, u.phone, p.code, p.suspended, p.created_at FROM partner_profiles p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 500')
    .all<Row>();
  const month = dhakaMonth(now);
  const out = [];
  for (const r of rows.results ?? []) {
    const st = await getPartner(db, r.user_id, now);
    const used = st?.rules ? await clientsUsed(db, r.user_id, st.rules.periodDays, now) : 0;
    const delivered = (await db.prepare('SELECT COUNT(*) AS n FROM partner_deliveries WHERE user_id = ? AND month = ?').bind(r.user_id, month).first<{ n: number }>())?.n ?? 0;
    const intake = (await db.prepare("SELECT COUNT(*) AS n FROM partner_clients WHERE user_id = ? AND source = 'intake'").bind(r.user_id).first<{ n: number }>())?.n ?? 0;
    const flags = await db
      .prepare('SELECT id, kind, detail, day FROM partner_flags WHERE user_id = ? AND resolved_at IS NULL ORDER BY created_at DESC LIMIT 5')
      .bind(r.user_id)
      .all<{ id: string; kind: string; detail: string | null; day: string }>();
    const devices = (await db.prepare('SELECT COUNT(*) AS n FROM partner_devices WHERE user_id = ?').bind(r.user_id).first<{ n: number }>())?.n ?? 0;
    const bonuses = await db
      .prepare('SELECT id, month, level, days FROM partner_bonus_grants WHERE user_id = ? AND revoked_at IS NULL ORDER BY granted_at DESC LIMIT 6')
      .bind(r.user_id)
      .all<{ id: string; month: string; level: string; days: number }>();
    out.push({
      userId: r.user_id,
      name: r.name,
      phone: r.phone,
      suspended: !!r.suspended,
      joinedAt: r.created_at,
      plan: st?.plan?.id ?? null,
      active: !!st?.active,
      daysLeft: daysLeft(st?.proUntil ?? null, now),
      used,
      cap: (st?.rules?.clientCap ?? 0) + (await bonusCap(db, r.user_id, now)),
      delivered,
      level: levelFor(delivered),
      intake,
      devices,
      flags: flags.results ?? [],
      bonuses: bonuses.results ?? [],
    });
  }
  return out;
}

const count = async (db: D1Like, sql: string, ...args: unknown[]) => (await db.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0;

/** The four tiles: landing → paid, paid → first client CV within 24h, CVs per partner, 30-day renewal. */
export async function partnerStats(db: D1Like, now = Date.now()) {
  const since = now - 30 * DAY_MS;
  const landing = await count(db, "SELECT COUNT(DISTINCT vid) AS n FROM events WHERE name = 'partner_landing_view' AND ts > ?", since);
  const paid = await count(db, "SELECT COUNT(DISTINCT user_id) AS n FROM partner_events WHERE name = 'PartnerPaid' AND ts > ?", since);
  const paidAll = await count(db, "SELECT COUNT(DISTINCT user_id) AS n FROM partner_events WHERE name = 'PartnerPaid'");
  // Activated = made a first client folder within 24 hours of the first payment.
  const activated = await count(
    db,
    `SELECT COUNT(*) AS n FROM (
       SELECT e.user_id, MIN(e.ts) AS paid_at FROM partner_events e WHERE e.name = 'PartnerPaid' GROUP BY e.user_id
     ) f WHERE EXISTS (SELECT 1 FROM partner_clients c WHERE c.user_id = f.user_id AND c.source = 'manual' AND c.created_at BETWEEN f.paid_at AND f.paid_at + ?)`,
    DAY_MS,
  );
  const delivered30 = await count(db, 'SELECT COUNT(*) AS n FROM partner_deliveries WHERE at > ?', since);
  const activePartners = await count(db, 'SELECT COUNT(DISTINCT user_id) AS n FROM partner_deliveries WHERE at > ?', since);
  // Renewal: partners whose first payment is 30+ days old and who paid again after it.
  const old = await count(db, "SELECT COUNT(*) AS n FROM (SELECT user_id FROM partner_events WHERE name = 'PartnerPaid' GROUP BY user_id HAVING MIN(ts) < ?)", now - 30 * DAY_MS);
  const renewed = await count(db, "SELECT COUNT(*) AS n FROM (SELECT user_id FROM partner_events WHERE name = 'PartnerPaid' GROUP BY user_id HAVING MIN(ts) < ? AND COUNT(*) >= 2)", now - 30 * DAY_MS);
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);
  return {
    landingViews: landing,
    paid,
    landingToPaidPct: pct(paid, landing),
    paidAll,
    activated,
    activationPct: pct(activated, paidAll),
    delivered30,
    cvsPerPartner: activePartners ? Math.round((delivered30 / activePartners) * 10) / 10 : null,
    renewalEligible: old,
    renewed,
    renewalPct: pct(renewed, old),
    dailyAlert: Number((await setting(db, 'daily_export_alert')) ?? DEFAULT_DAILY_ALERT) || DEFAULT_DAILY_ALERT,
  };
}

/** POST /api/admin/partners/<userId>: one action at a time. Every change is on the partner's own records. */
export async function adminPartnerAction(db: D1Like, userId: string, body: Record<string, unknown>, now = Date.now()): Promise<Response> {
  const exists = await db.prepare('SELECT 1 AS x FROM partner_profiles WHERE user_id = ?').bind(userId).first();
  if (!exists) return json({ ok: false, error: 'not_found' }, 404);
  const n = typeof body.days === 'number' && Number.isInteger(body.days) && body.days > 0 && body.days <= 365 ? body.days : 0;
  switch (body.action) {
    case 'grant_days':
      if (!n) return json({ ok: false, error: 'invalid' }, 400);
      await db.prepare('UPDATE entitlements SET pro_until = MAX(?, COALESCE(pro_until, 0)) + ?, updated_at = ? WHERE user_id = ?').bind(now, n * DAY_MS, now, userId).run();
      return json({ ok: true });
    case 'revoke_days':
      if (!n) return json({ ok: false, error: 'invalid' }, 400);
      await db.prepare('UPDATE entitlements SET pro_until = MAX(?, COALESCE(pro_until, 0) - ?), updated_at = ? WHERE user_id = ?').bind(now, n * DAY_MS, now, userId).run();
      return json({ ok: true });
    case 'add_cap': {
      // A manual cap increase is a bonus row with no days, valid for 90 days.
      const extra = typeof body.cap === 'number' && Number.isInteger(body.cap) && body.cap > 0 && body.cap <= 1000 ? body.cap : 0;
      if (!extra) return json({ ok: false, error: 'invalid' }, 400);
      const id = `${userId}:admin:${crypto.randomUUID()}`;
      await db
        .prepare("INSERT INTO partner_bonus_grants (id, user_id, month, level, days, cap_extra, cap_until, granted_at) VALUES (?, ?, ?, 'bronze', 0, ?, ?, ?)")
        .bind(id, userId, `admin-${dhakaMonth(now)}`, extra, now + 90 * DAY_MS, now)
        .run();
      return json({ ok: true });
    }
    case 'suspend':
    case 'unsuspend':
      await db.prepare('UPDATE partner_profiles SET suspended = ? WHERE user_id = ?').bind(body.action === 'suspend' ? 1 : 0, userId).run();
      return json({ ok: true });
    case 'reset_devices':
      await db.prepare('DELETE FROM partner_devices WHERE user_id = ?').bind(userId).run();
      return json({ ok: true });
    case 'resolve_flags':
      await db.prepare('UPDATE partner_flags SET resolved_at = ? WHERE user_id = ? AND resolved_at IS NULL').bind(now, userId).run();
      return json({ ok: true });
    case 'revoke_bonus': {
      const id = typeof body.bonusId === 'string' ? body.bonusId : '';
      const g = await db.prepare('SELECT user_id FROM partner_bonus_grants WHERE id = ?').bind(id).first<{ user_id: string }>();
      if (!g || g.user_id !== userId) return json({ ok: false, error: 'not_found' }, 404);
      return (await revokeBonus(db, id, now)) ? json({ ok: true }) : json({ ok: false, error: 'not_found' }, 404);
    }
    default:
      return json({ ok: false, error: 'invalid' }, 400);
  }
}

export async function setDailyAlert(db: D1Like, value: unknown): Promise<boolean> {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 1000) return false;
  await db.prepare('INSERT INTO partner_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind('daily_export_alert', String(value)).run();
  return true;
}
