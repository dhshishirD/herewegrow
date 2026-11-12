// CV Partner Workspace API (/api/partner/*). Phase 1.
// Rules: every client query filters on the signed-in partner's user id (partner A can never see partner B's data);
// the cap, the delivered count and the bonuses are decided here, never by the browser.

import { clientIp, turnstileOk } from './authHandlers';
import { allow, getSessionUser, normalizePhone, type User } from './auth';
import type { D1Like } from './cf';
import { isAllowedOrigin, json, type Env } from './paymently';
import { DAY_MS, findPlan, type Plan, type PartnerRules } from '../shared/plans';
import {
  GOLD_CAP_DAYS,
  LEVELS,
  daysLeft,
  deliveryCheck,
  dhakaDayKey,
  dhakaMonth,
  isProfession,
  levelFor,
  nextLevel,
  type ClientStatus,
  type LevelId,
} from '../shared/partner';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const MAX_CLIENT_CV_BYTES = 300_000;
export const MAX_DEVICES = 2;
const DEVICE_ACTIVE_MS = 30 * DAY_MS;
export const DEFAULT_DAILY_ALERT = 25;

// ---- small helpers ----

export async function logPartnerEvent(db: D1Like, userId: string | null, name: string, meta?: Record<string, string | number>, now = Date.now()): Promise<void> {
  try {
    await db
      .prepare('INSERT INTO partner_events (id, user_id, name, ts, meta) VALUES (?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, name, now, meta ? JSON.stringify(meta) : null)
      .run();
  } catch (e) {
    console.error('partner event failed', name, e); // counting must never break the work
  }
}

const newCode = () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
};

// ---- partner state ----

export interface ProfileRow {
  user_id: string;
  code: string;
  name: string;
  fb_link: string | null;
  sells_where: string | null;
  remove_branding: number;
  suspended: number;
  certified: number;
  created_at: number;
}

export interface PartnerState {
  profile: ProfileRow;
  plan: Plan | null;
  rules: PartnerRules | null;
  proUntil: number | null;
  active: boolean;
}

export async function getProfile(db: D1Like, userId: string): Promise<ProfileRow | null> {
  return db
    .prepare('SELECT user_id, code, name, fb_link, sells_where, remove_branding, suspended, certified, created_at FROM partner_profiles WHERE user_id = ?')
    .bind(userId)
    .first<ProfileRow>();
}

/** The partner's profile, the Partner pass that applies now, and whether the workspace is open (pass running, not suspended). */
export async function getPartner(db: D1Like, userId: string, now = Date.now()): Promise<PartnerState | null> {
  const profile = await getProfile(db, userId);
  if (!profile) return null;
  const ent = await db.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(userId).first<{ pro_until: number | null }>();
  const proUntil = ent?.pro_until ?? null;
  const rows = await db
    .prepare("SELECT plan_id, granted_at FROM pass_grants WHERE user_id = ? AND plan_id LIKE 'partner-%' ORDER BY granted_at DESC")
    .bind(userId)
    .all<{ plan_id: string; granted_at: number }>();
  const grants = (rows.results ?? []).flatMap((r) => {
    const plan = findPlan(r.plan_id);
    return plan?.partner ? [{ plan, at: r.granted_at }] : [];
  });
  // Best pass among those still inside their own window (a short top-up must not hide a yearly pass).
  const open = grants.filter((g) => g.at + g.plan.days * DAY_MS > now).map((g) => g.plan);
  const pool = open.length ? open : grants.slice(0, 1).map((g) => g.plan);
  const plan = pool.sort((a, b) => b.partner!.clientCap - a.partner!.clientCap)[0] ?? null;
  const active = !!plan && !!proUntil && proUntil > now && !profile.suspended;
  return { profile, plan, rules: plan?.partner ?? null, proUntil, active };
}

export async function bonusCap(db: D1Like, userId: string, now = Date.now()): Promise<number> {
  const r = await db
    .prepare('SELECT COALESCE(SUM(cap_extra), 0) AS n FROM partner_bonus_grants WHERE user_id = ? AND revoked_at IS NULL AND cap_until > ?')
    .bind(userId, now)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export async function clientsUsed(db: D1Like, userId: string, periodDays: number, now = Date.now()): Promise<number> {
  const r = await db
    .prepare('SELECT COUNT(*) AS n FROM partner_clients WHERE user_id = ? AND created_at > ?')
    .bind(userId, now - periodDays * DAY_MS)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export async function deliveredIn(db: D1Like, userId: string, month: string): Promise<number> {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM partner_deliveries WHERE user_id = ? AND month = ?').bind(userId, month).first<{ n: number }>();
  return r?.n ?? 0;
}

export async function setting(db: D1Like, key: string): Promise<string | null> {
  const r = await db.prepare('SELECT value FROM partner_settings WHERE key = ?').bind(key).first<{ value: string }>();
  return r?.value ?? null;
}

/** Summary shown on the workspace home and used by the admin list. */
export async function summary(db: D1Like, st: PartnerState, now = Date.now()) {
  const uid = st.profile.user_id;
  const month = dhakaMonth(now);
  const rules = st.rules;
  const [used, extra, delivered, bonuses] = await Promise.all([
    rules ? clientsUsed(db, uid, rules.periodDays, now) : Promise.resolve(0),
    bonusCap(db, uid, now),
    deliveredIn(db, uid, month),
    db
      .prepare('SELECT id, month, level, days, cap_extra, granted_at, revoked_at FROM partner_bonus_grants WHERE user_id = ? ORDER BY granted_at DESC LIMIT 30')
      .bind(uid)
      .all<{ id: string; month: string; level: LevelId; days: number; cap_extra: number; granted_at: number; revoked_at: number | null }>(),
  ]);
  const cap = (rules?.clientCap ?? 0) + extra;
  const lvl = levelFor(delivered);
  const nxt = nextLevel(delivered);
  return {
    plan: st.plan ? { id: st.plan.id, name: st.plan.name, brandingRemovable: !!rules?.brandingRemovable, badge: !!rules?.badge, periodDays: rules?.periodDays ?? 0 } : null,
    proUntil: st.proUntil,
    daysLeft: daysLeft(st.proUntil, now),
    used,
    cap,
    month: { key: month, delivered, level: lvl, next: nxt ? { id: nxt.id, at: nxt.at, days: nxt.days, capExtra: nxt.capExtra } : null },
    bonuses: (bonuses.results ?? []).map((b) => ({ id: b.id, month: b.month, level: b.level, days: b.days, capExtra: b.cap_extra, at: b.granted_at, revoked: !!b.revoked_at })),
  };
}

// ---- devices ----

/** Up to MAX_DEVICES devices seen in the last 30 days. A new device beyond that is refused. */
export async function checkDevice(db: D1Like, userId: string, deviceId: string, now = Date.now()): Promise<boolean> {
  if (!/^[\w-]{8,64}$/.test(deviceId)) return false;
  const known = await db.prepare('SELECT 1 AS x FROM partner_devices WHERE user_id = ? AND device_id = ?').bind(userId, deviceId).first();
  if (known) {
    await db.prepare('UPDATE partner_devices SET last_seen = ? WHERE user_id = ? AND device_id = ?').bind(now, userId, deviceId).run();
    return true;
  }
  const n = await db.prepare('SELECT COUNT(*) AS n FROM partner_devices WHERE user_id = ? AND last_seen > ?').bind(userId, now - DEVICE_ACTIVE_MS).first<{ n: number }>();
  if ((n?.n ?? 0) >= MAX_DEVICES) return false;
  await db.prepare('INSERT OR IGNORE INTO partner_devices (user_id, device_id, first_seen, last_seen) VALUES (?, ?, ?, ?)').bind(userId, deviceId, now, now).run();
  return true;
}

// ---- clients ----

export interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  profession: string | null;
  note: string | null;
  status: ClientStatus;
  source: 'manual' | 'intake';
  created_at: number;
  updated_at: number;
  delivered_at: number | null;
}

const LIST_COLS = 'id, name, phone, profession, note, status, source, created_at, updated_at, delivered_at';
const view = (c: ClientRow) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  profession: c.profession,
  note: c.note,
  status: c.status,
  source: c.source,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  deliveredAt: c.delivered_at,
});

export async function listClients(db: D1Like, userId: string, q = ''): Promise<ReturnType<typeof view>[]> {
  const like = `%${q.replace(/[%_]/g, '')}%`;
  const r = q
    ? await db
        .prepare(`SELECT ${LIST_COLS} FROM partner_clients WHERE user_id = ? AND deleted_at IS NULL AND (name LIKE ? OR phone LIKE ? OR note LIKE ?) ORDER BY updated_at DESC LIMIT 300`)
        .bind(userId, like, like, like)
        .all<ClientRow>()
    : await db
        .prepare(`SELECT ${LIST_COLS} FROM partner_clients WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 300`)
        .bind(userId)
        .all<ClientRow>();
  return (r.results ?? []).map(view);
}

export async function getClient(db: D1Like, userId: string, id: string) {
  const c = await db
    .prepare(`SELECT ${LIST_COLS}, cv_json FROM partner_clients WHERE id = ? AND user_id = ? AND deleted_at IS NULL`)
    .bind(id, userId)
    .first<ClientRow & { cv_json: string | null }>();
  if (!c) return null;
  return { ...view(c), state: c.cv_json ? (JSON.parse(c.cv_json) as unknown) : null };
}

export type CreateResult = { ok: true; id: string } | { ok: false; error: 'cap' | 'inactive' };

/** Creates a folder unless this period's cap is used up. The count and the insert are one statement. */
export async function createClient(
  db: D1Like,
  st: PartnerState,
  input: { name: string; phone?: string | null; profession?: string | null; note?: string | null; source?: 'manual' | 'intake'; cvJson?: string | null },
  now = Date.now(),
): Promise<CreateResult> {
  if (!st.active || !st.rules) return { ok: false, error: 'inactive' };
  const uid = st.profile.user_id;
  const cap = st.rules.clientCap + (await bonusCap(db, uid, now));
  const id = crypto.randomUUID();
  const r = await db
    .prepare(
      `INSERT INTO partner_clients (id, user_id, name, phone, profession, note, status, source, cv_json, created_at, updated_at)
       SELECT ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM partner_clients WHERE user_id = ? AND created_at > ?) < ?`,
    )
    .bind(id, uid, input.name, input.phone ?? null, input.profession ?? null, input.note ?? null, input.source ?? 'manual', input.cvJson ?? null, now, now, uid, now - st.rules.periodDays * DAY_MS, cap)
    .run();
  if (!r.meta?.changes) {
    await logPartnerEvent(db, uid, 'CapReached', { cap }, now);
    return { ok: false, error: 'cap' };
  }
  await logPartnerEvent(db, uid, input.source === 'intake' ? 'IntakeSubmitted' : 'ClientCreated', undefined, now);
  return { ok: true, id };
}

export async function updateClient(db: D1Like, userId: string, id: string, body: Record<string, unknown>, now = Date.now()): Promise<boolean> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (typeof body.name === 'string') {
    sets.push('name = ?');
    vals.push(clip(body.name, 80));
  }
  if (body.phone !== undefined) {
    const raw = clip(body.phone, 20);
    const p = raw ? normalizePhone(raw) : null;
    if (raw && !p) return false;
    sets.push('phone = ?');
    vals.push(p);
  }
  if (typeof body.note === 'string') {
    sets.push('note = ?');
    vals.push(clip(body.note, 1000));
  }
  if (body.profession !== undefined) {
    sets.push('profession = ?');
    vals.push(isProfession(body.profession) ? body.profession : null);
  }
  // "delivered" is only ever set by the delivered count, never typed in.
  if (body.status === 'new' || body.status === 'progress') {
    sets.push("status = CASE WHEN status = 'delivered' THEN status ELSE ? END");
    vals.push(body.status);
  }
  if (!sets.length) return true;
  const r = await db
    .prepare(`UPDATE partner_clients SET ${sets.join(', ')}, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL`)
    .bind(...vals, now, id, userId)
    .run();
  return !!r.meta?.changes;
}

/** Saves the CV of a folder. Moves a new folder to "in progress". */
export async function saveClientCv(db: D1Like, userId: string, id: string, state: unknown, now = Date.now()): Promise<'ok' | 'bad' | 'size' | 'not_found'> {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return 'bad';
  const data = (state as Record<string, unknown>).data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'bad';
  const text = JSON.stringify(state);
  if (new TextEncoder().encode(text).length > MAX_CLIENT_CV_BYTES) return 'size';
  const r = await db
    .prepare("UPDATE partner_clients SET cv_json = ?, status = CASE WHEN status = 'new' THEN 'progress' ELSE status END, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL")
    .bind(text, now, id, userId)
    .run();
  return r.meta?.changes ? 'ok' : 'not_found';
}

/** Removes the client's details and CV. Only an empty skeleton stays, so deleting cannot reset the cap. */
export async function deleteClient(db: D1Like, userId: string, id: string, now = Date.now()): Promise<boolean> {
  const r = await db
    .prepare("UPDATE partner_clients SET name = '', phone = NULL, note = NULL, cv_json = NULL, profession = NULL, deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL")
    .bind(now, now, id, userId)
    .run();
  return !!r.meta?.changes;
}

// ---- delivered count and bonus ----

export type DeliverResult =
  | { ok: true; counted: boolean; delivered: number; level: LevelId | null; newLevels: LevelId[] }
  | { ok: false; error: 'inactive' | 'not_found' | 'name' | 'sections' | 'sample' };

/** Called after the final PDF is exported. Counts once per client folder per month; grants level bonuses once. */
export async function markDelivered(db: D1Like, st: PartnerState, clientId: string, now = Date.now()): Promise<DeliverResult> {
  if (!st.active) return { ok: false, error: 'inactive' };
  const uid = st.profile.user_id;
  const row = await db
    .prepare('SELECT name, cv_json FROM partner_clients WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .bind(clientId, uid)
    .first<{ name: string; cv_json: string | null }>();
  if (!row) return { ok: false, error: 'not_found' };
  const check = deliveryCheck(row.name, row.cv_json ? JSON.parse(row.cv_json) : null);
  if (!check.ok) return { ok: false, error: check.reason };

  const month = dhakaMonth(now);
  const day = dhakaDayKey(now);
  const ins = await db
    .prepare('INSERT OR IGNORE INTO partner_deliveries (client_id, month, user_id, day, at) VALUES (?, ?, ?, ?, ?)')
    .bind(clientId, month, uid, day, now)
    .run();
  const counted = !!ins.meta?.changes;
  await db
    .prepare("UPDATE partner_clients SET status = 'delivered', delivered_at = COALESCE(delivered_at, ?), updated_at = ? WHERE id = ? AND user_id = ?")
    .bind(now, now, clientId, uid)
    .run();

  const delivered = await deliveredIn(db, uid, month);
  const newLevels: LevelId[] = [];
  if (counted) {
    await logPartnerEvent(db, uid, 'CvDelivered', { month }, now);
    for (const lv of LEVELS) {
      if (delivered < lv.at) continue;
      if (await grantBonus(db, uid, month, lv, now)) newLevels.push(lv.id);
    }
    await flagIfBusy(db, uid, day, now);
  }
  return { ok: true, counted, delivered, level: levelFor(delivered), newLevels };
}

/** Pays one level once per month. Days are added by the statement whose token won, so it is safe to call twice. */
async function grantBonus(db: D1Like, uid: string, month: string, lv: (typeof LEVELS)[number], now: number): Promise<boolean> {
  const id = `${uid}:${month}:${lv.id}`;
  const token = crypto.randomUUID();
  await db.batch([
    db
      .prepare(
        'INSERT OR IGNORE INTO partner_bonus_grants (id, user_id, month, level, days, cap_extra, cap_until, granted_at, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, uid, month, lv.id, lv.days, lv.capExtra, lv.capExtra ? now + GOLD_CAP_DAYS * DAY_MS : null, now, token),
    db
      .prepare(
        `UPDATE entitlements SET pro_until = MAX(?, COALESCE(pro_until, 0)) + ?, updated_at = ?
         WHERE user_id = ? AND EXISTS (SELECT 1 FROM partner_bonus_grants WHERE id = ? AND token = ?)`,
      )
      .bind(now, lv.days * DAY_MS, now, uid, id, token),
  ]);
  const won = await db.prepare('SELECT token FROM partner_bonus_grants WHERE id = ?').bind(id).first<{ token: string }>();
  if (won?.token !== token) return false;
  await logPartnerEvent(db, uid, 'LevelReached', { level: lv.id, month }, now);
  return true;
}

/** Admin alert when one partner delivers unusually many CVs in a day (threshold in partner_settings, default 25). */
async function flagIfBusy(db: D1Like, uid: string, day: string, now: number): Promise<void> {
  const limit = Number((await setting(db, 'daily_export_alert')) ?? DEFAULT_DAILY_ALERT) || DEFAULT_DAILY_ALERT;
  const n = await db.prepare('SELECT COUNT(*) AS n FROM partner_deliveries WHERE user_id = ? AND day = ?').bind(uid, day).first<{ n: number }>();
  if ((n?.n ?? 0) < limit) return;
  await db
    .prepare('INSERT OR IGNORE INTO partner_flags (id, user_id, kind, detail, day, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), uid, 'many_exports', `${n?.n} CVs delivered on ${day} (alert at ${limit})`, day, now)
    .run();
}

/** Takes a bonus back: the days come off the pass (never below now) and its cap bonus ends. */
export async function revokeBonus(db: D1Like, id: string, now = Date.now()): Promise<boolean> {
  const g = await db.prepare('SELECT user_id, days FROM partner_bonus_grants WHERE id = ? AND revoked_at IS NULL').bind(id).first<{ user_id: string; days: number }>();
  if (!g) return false;
  await db.batch([
    db.prepare('UPDATE partner_bonus_grants SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').bind(now, id),
    db.prepare('UPDATE entitlements SET pro_until = MAX(?, COALESCE(pro_until, 0) - ?), updated_at = ? WHERE user_id = ?').bind(now, g.days * DAY_MS, now, g.user_id),
  ]);
  return true;
}

// ---- apply ----

export async function applyPartner(db: D1Like, user: User, body: Record<string, unknown>, now = Date.now()): Promise<{ ok: true; code: string } | { ok: false; error: 'name' | 'terms' | 'link' }> {
  const name = clip(body.name, 80);
  if (name.length < 2) return { ok: false, error: 'name' };
  if (body.terms !== true) return { ok: false, error: 'terms' };
  const fb = clip(body.fbLink, 200);
  if (fb && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(fb)) return { ok: false, error: 'link' };
  const where = clip(body.sellsWhere, 200);
  const existing = await getProfile(db, user.id);
  if (existing) {
    await db.prepare('UPDATE partner_profiles SET name = ?, fb_link = ?, sells_where = ? WHERE user_id = ?').bind(name, fb || null, where || null, user.id).run();
    return { ok: true, code: existing.code };
  }
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    const r = await db
      .prepare('INSERT OR IGNORE INTO partner_profiles (user_id, code, name, fb_link, sells_where, terms_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(user.id, code, name, fb || null, where || null, now, now)
      .run();
    if (r.meta?.changes) {
      if (!user.name) await db.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, user.id).run();
      return { ok: true, code };
    }
  }
  return { ok: false, error: 'name' };
}

// ---- intake (public link) ----

const photoOk = (v: unknown): string => (typeof v === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= 140_000 ? v : '');
const sid = () => Math.random().toString(36).slice(2, 9);

/** The CV a client's own answers make. Missing builder fields are filled in by the builder when it opens the folder. */
export function intakeCv(b: Record<string, unknown>): { cv: string; name: string; phone: string; note: string } | null {
  const name = clip(b.name, 80);
  const phone = normalizePhone(b.phone);
  if (name.length < 2 || !phone) return null;
  // Several jobs / education entries (jobs, edus), or the older single-entry fields.
  const rows = (v: unknown, max: number): Record<string, unknown>[] => (Array.isArray(v) ? v.slice(0, max).filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : []);
  const eduIn = rows(b.edus, 8);
  const jobIn = rows(b.jobs, 10);
  if (!eduIn.length) eduIn.push({ degree: b.degree, institution: b.institution, result: b.result, year: b.year });
  if (!jobIn.length) jobIn.push({ role: b.role, org: b.org, period: b.period, duties: b.duties });
  const edu = eduIn
    .filter((e) => clip(e.degree, 120) || clip(e.institution, 120))
    .map((e) => ({ id: sid(), degree: clip(e.degree, 120), major: '', institution: clip(e.institution, 120), result: clip(e.result, 40), year: clip(e.year, 20), details: '' }));
  const exp = jobIn
    .filter((j) => clip(j.role, 120) || clip(j.org, 120))
    .map((j) => ({ id: sid(), role: clip(j.role, 120), org: clip(j.org, 120), location: '', start: clip(j.period, 40), end: '', current: false, bullets: clip(j.duties, 1200) }));
  const target = clip(b.target, 120);
  const data = { name, headline: target, phone, email: clip(b.email, 120), skills: clip(b.skills, 600), photo: photoOk(b.photo), education: edu, experience: exp, summary: clip(b.summary, 800) };
  const state = { data, design: 'classic', accent: '#1e3a5f' };
  return { cv: JSON.stringify(state), name, phone, note: clip(b.message, 600) };
}

// ---- HTTP ----

const ERR_STATUS: Record<string, number> = { cap: 403, inactive: 403, name: 422, sections: 422, sample: 422, not_found: 404, bad: 400, size: 413 };

async function body(request: Request): Promise<Record<string, unknown>> {
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

/** /api/partner/*: partner screens (login + device check) and the public intake link. */
export async function handlePartner(request: Request, env: Env, pathname: string): Promise<Response> {
  try {
    return await route(request, env, pathname);
  } catch (e) {
    console.error('partner request failed', pathname, e);
    return json({ ok: false, error: 'db' }, 500);
  }
}

async function route(request: Request, env: Env, pathname: string): Promise<Response> {
  if (!env.DB || !env.KV || !env.SESSION_SECRET) return json({ ok: false, error: 'config' }, 503);
  const db = env.DB;
  const method = request.method;
  if (method !== 'GET' && !isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);

  const intake = /^\/api\/partner\/intake\/([a-z0-9]{6,16})$/.exec(pathname);
  if (intake) return handleIntake(request, env, intake[1]);

  const user = await getSessionUser(env, request);
  if (!user) return json({ ok: false, error: 'login' }, 401);

  // Applying works before a pass is bought; it only saves the profile and the accepted terms.
  if (pathname === '/api/partner/apply' && method === 'POST') {
    const r = await applyPartner(db, user, await body(request));
    return r.ok ? json({ ok: true, code: r.code }) : json({ ok: false, error: r.error }, 422);
  }

  const st = await getPartner(db, user.id);
  if (pathname === '/api/partner/me' && method === 'GET') {
    if (!st) {
      // A pass given by hand (admin) or bought before applying: the person only has to finish the short setup form.
      const pass = await db.prepare("SELECT 1 AS n FROM pass_grants WHERE user_id = ? AND plan_id LIKE 'partner-%' LIMIT 1").bind(user.id).first();
      return json({ ok: true, applied: false, hasPass: !!pass, name: user.name });
    }
    const s = await summary(db, st);
    const origin = new URL(request.url).origin;
    const rules = st.rules;
    return json({
      ok: true,
      applied: true,
      active: st.active,
      suspended: !!st.profile.suspended,
      name: st.profile.name,
      code: st.profile.code,
      intakeUrl: `${origin}/p/${st.profile.code}`,
      brandingOn: !(rules?.brandingRemovable && st.profile.remove_branding),
      removeBranding: !!st.profile.remove_branding,
      ...s,
    });
  }
  if (!st) return json({ ok: false, error: 'apply' }, 403);

  // From here the workspace must be open: pass running, not suspended, at most 2 devices.
  if (!st.active) return json({ ok: false, error: st.profile.suspended ? 'suspended' : 'inactive' }, 403);
  if (!(await checkDevice(db, user.id, request.headers.get('X-HWG-Device') ?? '').catch(() => false))) return json({ ok: false, error: 'devices' }, 403);

  if (pathname === '/api/partner/settings' && method === 'POST') {
    const b = await body(request);
    if (typeof b.removeBranding !== 'boolean') return json({ ok: false, error: 'bad' }, 400);
    if (b.removeBranding && !st.rules?.brandingRemovable) return json({ ok: false, error: 'plan' }, 403);
    await db.prepare('UPDATE partner_profiles SET remove_branding = ? WHERE user_id = ?').bind(b.removeBranding ? 1 : 0, user.id).run();
    return json({ ok: true });
  }

  if (pathname === '/api/partner/clients') {
    if (method === 'GET') return json({ ok: true, clients: await listClients(db, user.id, clip(new URL(request.url).searchParams.get('q'), 60)) });
    if (method === 'POST') {
      const b = await body(request);
      const phoneRaw = clip(b.phone, 20);
      const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
      if (phoneRaw && !phone) return json({ ok: false, error: 'phone' }, 422);
      const r = await createClient(db, st, {
        name: clip(b.name, 80),
        phone,
        profession: isProfession(b.profession) ? b.profession : null,
        note: clip(b.note, 1000) || null,
      });
      return r.ok ? json({ ok: true, id: r.id }) : json({ ok: false, error: r.error }, ERR_STATUS[r.error]);
    }
    return json({ ok: false, error: 'method' }, 405);
  }

  const one = /^\/api\/partner\/clients\/([\w-]{1,64})(?:\/(cv|delivered|export))?$/.exec(pathname);
  if (one) {
    const [, id, sub] = one;
    if (!sub) {
      if (method === 'GET') {
        const c = await getClient(db, user.id, id);
        return c ? json({ ok: true, client: c }) : json({ ok: false, error: 'not_found' }, 404);
      }
      if (method === 'PATCH') return (await updateClient(db, user.id, id, await body(request))) ? json({ ok: true }) : json({ ok: false, error: 'not_found' }, 404);
      if (method === 'DELETE') return (await deleteClient(db, user.id, id)) ? json({ ok: true }) : json({ ok: false, error: 'not_found' }, 404);
    }
    if (sub === 'cv' && method === 'PUT') {
      const r = await saveClientCv(db, user.id, id, (await body(request)).state);
      return r === 'ok' ? json({ ok: true }) : json({ ok: false, error: r }, ERR_STATUS[r]);
    }
    if (sub === 'delivered' && method === 'POST') {
      const r = await markDelivered(db, st, id);
      return r.ok ? json(r) : json({ ok: false, error: r.error }, ERR_STATUS[r.error] ?? 400);
    }
    if (sub === 'export' && method === 'GET') {
      const c = await getClient(db, user.id, id);
      return c ? json({ ok: true, exportedAt: Date.now(), client: c }) : json({ ok: false, error: 'not_found' }, 404);
    }
    return json({ ok: false, error: 'method' }, 405);
  }

  return json({ ok: false, error: 'not_found' }, 404);
}

/** The public intake link: GET shows the partner's name; POST saves the answers as a new folder. */
async function handleIntake(request: Request, env: Env, code: string): Promise<Response> {
  const db = env.DB!;
  const profile = await db.prepare('SELECT user_id, name FROM partner_profiles WHERE code = ?').bind(code).first<{ user_id: string; name: string }>();
  if (!profile) return json({ ok: false, error: 'not_found' }, 404);
  const siteKey = (env as { TURNSTILE_SITE_KEY?: string }).TURNSTILE_SITE_KEY ?? null;
  if (request.method === 'GET') return json({ ok: true, partner: profile.name, siteKey });
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

  const ip = clientIp(request);
  if (!(await allow(env.KV!, `rl:intake:ip:${ip}`, 6, 3600))) return json({ ok: false, error: 'rate' }, 429);
  if (!(await allow(env.KV!, `rl:intake:code:${code}`, 80, 86_400))) return json({ ok: false, error: 'rate' }, 429);
  const b = await body(request);
  if (!(await turnstileOk(env, b.turnstile, ip))) return json({ ok: false, error: 'captcha' }, 400);
  const made = intakeCv(b);
  if (!made) return json({ ok: false, error: 'invalid' }, 422);

  const st = await getPartner(db, profile.user_id);
  if (!st?.active) return json({ ok: false, error: 'closed' }, 403);
  const r = await createClient(db, st, { name: made.name, phone: made.phone, note: made.note || null, source: 'intake', cvJson: made.cv });
  return r.ok ? json({ ok: true }) : json({ ok: false, error: 'closed' }, 403);
}
