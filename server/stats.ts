// Dashboard queries over the first-party `events` table. Days are Asia/Dhaka calendar days (YYYY-MM-DD), ranges inclusive.
// Page and session counts use pageview rows only; server-side events (sid = '', path = '') only show up under actions.
import type { D1Like } from './cf';
import { dhakaDay, PURCHASE_KEY_SQL } from './analytics';

export interface Range {
  from: string;
  to: string;
}

const DAY_MS = 86_400_000;
const MAX_SPAN_DAYS = 366;
const LIVE_WINDOW_MS = 5 * 60_000;
const LIMIT = 20;

const dayMs = (d: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = Date.parse(`${d}T00:00:00Z`);
  return Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== d ? null : t;
};

/** from/to as YYYY-MM-DD, or preset=today|yesterday|7d|30d. Null when invalid, reversed, or longer than 366 days. */
export function parseRange(params: URLSearchParams, now: number = Date.now()): Range | null {
  const preset = params.get('preset');
  if (preset) {
    const today = dhakaDay(now);
    const back = (n: number) => dhakaDay(now - n * DAY_MS);
    if (preset === 'today') return { from: today, to: today };
    if (preset === 'yesterday') return { from: back(1), to: back(1) };
    if (preset === '7d') return { from: back(6), to: today };
    if (preset === '30d') return { from: back(29), to: today };
    return null;
  }
  const from = dayMs(params.get('from') ?? '');
  const to = dayMs(params.get('to') ?? '');
  if (from === null || to === null || from > to || (to - from) / DAY_MS + 1 > MAX_SPAN_DAYS) return null;
  return { from: params.get('from')!, to: params.get('to')! };
}

const rows = async <T>(db: D1Like, sql: string, ...binds: unknown[]): Promise<T[]> =>
  ((await db.prepare(sql).bind(...binds).all<T>()).results ?? []) as T[];

// A day with a pageviews/'*' row in daily_rollup has been rolled up (see retention.ts). Its figures come from the rollup,
// never from leftover events, so a day is counted once and there is no gap between crossing the horizon and the cron running.
const NOT_ROLLED = "day NOT IN (SELECT day FROM daily_rollup WHERE metric = 'pageviews' AND key = '*')";

/**
 * Visitors with a hit in the last 5 minutes, each with the last page they were on. There is no ts-only index (it cost a
 * write per event), so the scan is limited to today and yesterday (Dhaka) through events_day; yesterday covers a window
 * that crosses Dhaka midnight.
 */
export async function liveNow(db: D1Like, now: number = Date.now()): Promise<{ count: number; visitors: { page: string; agoSec: number }[] }> {
  const r = await rows<{ path: string; ts: number }>(
    db,
    "SELECT path, MAX(ts) AS ts FROM events WHERE day IN (?, ?) AND ts >= ? AND vid IS NOT NULL AND path != '' GROUP BY vid ORDER BY ts DESC",
    dhakaDay(now),
    dhakaDay(now - LIVE_WINDOW_MS),
    now - LIVE_WINDOW_MS,
  );
  return { count: r.length, visitors: r.map((v) => ({ page: v.path, agoSec: Math.max(0, Math.round((now - v.ts) / 1000)) })) };
}

/**
 * Totals and daily rows. Days already rolled up come from daily_rollup: their sessions/pageviews are exact, but visitors
 * are summed per day, so a multi-day figure over such days is approximate (`approximate: true`). Bounce is not rolled up,
 * so bounceRate covers only days that still have events and is null when every day in the range is rolled up.
 */
export async function overview(db: D1Like, r: Range) {
  const live = await db
    .prepare(
      `SELECT COUNT(DISTINCT vid) AS visitors, COUNT(DISTINCT CASE WHEN sid != '' THEN sid END) AS sessions, COUNT(*) AS pageviews
       FROM events WHERE type = 'pageview' AND day BETWEEN ? AND ? AND ${NOT_ROLLED}`,
    )
    .bind(r.from, r.to)
    .first<{ visitors: number; sessions: number; pageviews: number }>();
  const bounce = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM (SELECT sid FROM events WHERE type = 'pageview' AND sid != '' AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY sid HAVING COUNT(*) = 1)`,
    )
    .bind(r.from, r.to)
    .first<{ n: number }>();
  const rolled = await rows<{ day: string; metric: string; n: number }>(
    db,
    `SELECT day, metric, n FROM daily_rollup WHERE key = '*' AND metric IN ('visitors', 'sessions', 'pageviews') AND day BETWEEN ? AND ?`,
    r.from,
    r.to,
  );
  const liveDaily = await rows<{ day: string; visitors: number; pageviews: number }>(
    db,
    `SELECT day, COUNT(DISTINCT vid) AS visitors, COUNT(*) AS pageviews FROM events
     WHERE type = 'pageview' AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY day`,
    r.from,
    r.to,
  );
  const byDay = new Map<string, { day: string; visitors: number; pageviews: number }>(liveDaily.map((d) => [d.day, d]));
  let rVisitors = 0;
  let rSessions = 0;
  let rPageviews = 0;
  for (const x of rolled) {
    const d = byDay.get(x.day) ?? { day: x.day, visitors: 0, pageviews: 0 };
    byDay.set(x.day, d);
    if (x.metric === 'visitors') { d.visitors = x.n; rVisitors += x.n; }
    else if (x.metric === 'pageviews') { d.pageviews = x.n; rPageviews += x.n; }
    else rSessions += x.n;
  }
  const rolledDays = rolled.filter((x) => x.metric === 'pageviews').length;
  const liveSessions = live?.sessions ?? 0;
  const sessions = liveSessions + rSessions;
  const pageviews = (live?.pageviews ?? 0) + rPageviews;
  return {
    visitors: (live?.visitors ?? 0) + rVisitors,
    sessions,
    pageviews,
    bounceRate: rolledDays > 0 && liveSessions === 0 ? null : liveSessions ? (bounce?.n ?? 0) / liveSessions : 0,
    pagesPerSession: sessions ? pageviews / sessions : 0,
    approximate: rolledDays > 0,
    daily: [...byDay.values()].sort((a, b) => (a.day < b.day ? -1 : 1)),
  };
}

/** Views include rolled-up days; visitors are only known for days that still have events (0 for rolled-up days). */
export const topPages = (db: D1Like, r: Range) =>
  rows<{ path: string; views: number; visitors: number }>(
    db,
    `SELECT path, SUM(views) AS views, SUM(visitors) AS visitors FROM (
       SELECT path, COUNT(*) AS views, COUNT(DISTINCT vid) AS visitors FROM events
       WHERE type = 'pageview' AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY path
       UNION ALL
       SELECT key, SUM(n), 0 FROM daily_rollup WHERE metric = 'page' AND day BETWEEN ? AND ? GROUP BY key)
     GROUP BY path ORDER BY views DESC, path LIMIT ${LIMIT}`,
    r.from,
    r.to,
    r.from,
    r.to,
  );

/** The first pageview of each session. */
export const entryPages = (db: D1Like, r: Range) =>
  rows<{ path: string; sessions: number }>(
    db,
    `SELECT path, COUNT(*) AS sessions FROM
       (SELECT path, MIN(ts) FROM events WHERE type = 'pageview' AND sid != '' AND day BETWEEN ? AND ? GROUP BY sid)
     GROUP BY path ORDER BY sessions DESC, path LIMIT ${LIMIT}`,
    r.from,
    r.to,
  );

/** One row per session: its first pageview in the range. Ref/utm are only sent on a session's first hit, so attribution must come from here. */
export const SESSION_FIRST_SQL = `SELECT sid, vid, utm_source, utm_medium, utm_campaign, ref_host, MIN(ts) AS ts
  FROM events WHERE type = 'pageview' AND sid != '' AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY sid`;

/**
 * Visitors per source, attributed per session: utm_source, else the referrer host, else direct.
 * `paid` counts purchase events in the range whose first-touch source/medium/campaign (stored in meta) match the row.
 * A source with purchases but no visitors in the range still gets a row (visitors 0).
 * Rolled-up days contribute visitors from daily_rollup (summed per day, so approximate); their purchases are not
 * attributable to a source (the rollup keeps only an overall purchase count), so `paid` covers days with events only.
 */
export const sources = (db: D1Like, r: Range) =>
  rows<{ source: string; medium: string; campaign: string; visitors: number; paid: number }>(
    db,
    `WITH session_first AS (${SESSION_FIRST_SQL}),
     rolled AS (
       SELECT key, SUM(n) AS visitors FROM daily_rollup WHERE metric = 'source' AND day BETWEEN ? AND ? GROUP BY key),
     rolled_split AS (
       SELECT substr(key, 1, instr(key, '|') - 1) AS source, substr(key, instr(key, '|') + 1) AS rest, visitors FROM rolled),
     vis AS (
       SELECT source, medium, campaign, SUM(visitors) AS visitors FROM (
         SELECT COALESCE(utm_source, ref_host, 'direct') AS source, COALESCE(utm_medium, '') AS medium, COALESCE(utm_campaign, '') AS campaign,
                COUNT(DISTINCT vid) AS visitors
         FROM session_first GROUP BY source, medium, campaign
         UNION ALL
         SELECT source, substr(rest, 1, instr(rest, '|') - 1), substr(rest, instr(rest, '|') + 1), visitors FROM rolled_split)
       GROUP BY source, medium, campaign),
     buys AS (
       SELECT COALESCE(json_extract(meta, '$.source'), 'direct') AS source, COALESCE(json_extract(meta, '$.medium'), '') AS medium,
              COALESCE(json_extract(meta, '$.campaign'), '') AS campaign, COUNT(*) AS paid
       FROM events WHERE name = 'purchase' AND ${PURCHASE_KEY_SQL} AND json_valid(meta) AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY source, medium, campaign)
     SELECT * FROM (
       SELECT vis.source, vis.medium, vis.campaign, vis.visitors, COALESCE(buys.paid, 0) AS paid
       FROM vis LEFT JOIN buys ON buys.source = vis.source AND buys.medium = vis.medium AND buys.campaign = vis.campaign
       UNION ALL
       SELECT b.source, b.medium, b.campaign, 0, b.paid FROM buys b
       WHERE NOT EXISTS (SELECT 1 FROM vis WHERE vis.source = b.source AND vis.medium = b.medium AND vis.campaign = b.campaign))
     ORDER BY visitors DESC, paid DESC, source LIMIT 30`,
    r.from,
    r.to,
    r.from,
    r.to,
    r.from,
    r.to,
  );

const FUNNEL_VIEWED = ['view_service', 'view_template', 'view_pro'];
// Started = a checkout button press (templates/services in Checkout.tsx, Pro passes in Pro.tsx). The /order
// re-download lookup (redownload_lookup) is not an order start.
const FUNNEL_STARTED = ['checkout_click'];

/**
 * Distinct visitors reaching each step in the range: any pageview, a view_* event, a checkout click, a server-written purchase.
 * Steps are counted independently (not nested), so a step can exceed the one before it (e.g. a purchase without a vid match).
 */
export async function funnel(db: D1Like, r: Range) {
  const count = async (where: string, ...names: string[]) =>
    (
      await db
        .prepare(`SELECT COUNT(DISTINCT vid) AS n FROM events WHERE vid IS NOT NULL AND day BETWEEN ? AND ? AND ${where}`)
        .bind(r.from, r.to, ...names)
        .first<{ n: number }>()
    )?.n ?? 0;
  const marks = (xs: string[]) => xs.map(() => '?').join(', ');
  return {
    steps: [
      { key: 'visit' as const, visitors: await count("type = 'pageview'") },
      { key: 'viewed' as const, visitors: await count(`type = 'event' AND name IN (${marks(FUNNEL_VIEWED)})`, ...FUNNEL_VIEWED) },
      { key: 'order_started' as const, visitors: await count(`type = 'event' AND name IN (${marks(FUNNEL_STARTED)})`, ...FUNNEL_STARTED) },
      { key: 'paid' as const, visitors: await count(`type = 'event' AND name = 'purchase' AND ${PURCHASE_KEY_SQL}`) },
    ],
  };
}

const DHAKA_OFFSET_MS = 6 * 3_600_000;

/** Paid revenue (BDT) for today and the last 7 Dhaka days, plus Pro activations and paid orders in that week. */
export async function revenue(db: D1Like, now: number = Date.now()) {
  const todayStart = Date.parse(`${dhakaDay(now)}T00:00:00Z`) - DHAKA_OFFSET_MS;
  const weekStart = todayStart - 6 * DAY_MS;
  const end = todayStart + DAY_MS;
  const money = await db
    .prepare(
      `SELECT COALESCE(SUM(CASE WHEN paid_at >= ? THEN amount_bdt END), 0) AS today, COALESCE(SUM(amount_bdt), 0) AS week, COUNT(*) AS orders
       FROM orders WHERE status = 'paid' AND paid_at >= ? AND paid_at < ?`,
    )
    .bind(todayStart, weekStart, end)
    .first<{ today: number; week: number; orders: number }>();
  const grants = await db
    .prepare('SELECT COUNT(*) AS n FROM pass_grants WHERE granted_at >= ? AND granted_at < ?')
    .bind(weekStart, end)
    .first<{ n: number }>();
  return { today: money?.today ?? 0, week: money?.week ?? 0, proActivations: grants?.n ?? 0, orders: money?.orders ?? 0 };
}

export async function audience(db: D1Like, r: Range) {
  const devices = await rows<{ device: string; visitors: number }>(
    db,
    `SELECT COALESCE(device, 'unknown') AS device, COUNT(DISTINCT vid) AS visitors FROM events
     WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY device ORDER BY visitors DESC, device`,
    r.from,
    r.to,
  );
  const countries = await rows<{ country: string; visitors: number }>(
    db,
    `SELECT COALESCE(country, 'unknown') AS country, COUNT(DISTINCT vid) AS visitors FROM events
     WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY country ORDER BY visitors DESC, country LIMIT ${LIMIT}`,
    r.from,
    r.to,
  );
  // Returning = first seen on a day before the range.
  const nr = await db
    .prepare(
      `SELECT COUNT(*) AS total, COALESCE(SUM(first < ?), 0) AS back FROM
         (SELECT MIN(day) AS first FROM events WHERE vid IS NOT NULL AND day <= ? GROUP BY vid
          HAVING SUM(type = 'pageview' AND day >= ?) > 0)`,
    )
    .bind(r.from, r.to, r.from)
    .first<{ total: number; back: number }>();
  const total = nr?.total ?? 0;
  const returning = nr?.back ?? 0;
  return { devices, countries, newVsReturning: { new: total - returning, returning } };
}

/** Rolled-up days add their per-name counts (visitors are not rolled up, so 0 for those days). A 'purchase' row counts only if server-written. */
export const actions = (db: D1Like, r: Range) =>
  rows<{ name: string; n: number; visitors: number }>(
    db,
    `SELECT name, SUM(n) AS n, SUM(visitors) AS visitors FROM (
       SELECT name, COUNT(*) AS n, COUNT(DISTINCT vid) AS visitors FROM events
       WHERE type = 'event' AND name IS NOT NULL AND (name != 'purchase' OR ${PURCHASE_KEY_SQL}) AND day BETWEEN ? AND ? AND ${NOT_ROLLED} GROUP BY name
       UNION ALL
       SELECT CASE metric WHEN 'purchase' THEN 'purchase' ELSE key END, SUM(n), 0 FROM daily_rollup
       WHERE metric IN ('event', 'purchase') AND day BETWEEN ? AND ? GROUP BY metric, key)
     GROUP BY name ORDER BY n DESC, name LIMIT 50`,
    r.from,
    r.to,
    r.from,
    r.to,
  );
