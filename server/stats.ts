// Dashboard queries over the first-party `events` table. Days are Asia/Dhaka calendar days (YYYY-MM-DD), ranges inclusive.
// Page and session counts use pageview rows only; server-side events (sid = '', path = '') only show up under actions.
import type { D1Like } from './cf';
import { dhakaDay } from './analytics';

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

/** Visitors with a hit in the last 5 minutes, each with the last page they were on. */
export async function liveNow(db: D1Like, now: number = Date.now()): Promise<{ count: number; visitors: { page: string; agoSec: number }[] }> {
  const r = await rows<{ path: string; ts: number }>(
    db,
    "SELECT path, MAX(ts) AS ts FROM events WHERE ts >= ? AND vid IS NOT NULL AND path != '' GROUP BY vid ORDER BY ts DESC",
    now - LIVE_WINDOW_MS,
  );
  return { count: r.length, visitors: r.map((v) => ({ page: v.path, agoSec: Math.max(0, Math.round((now - v.ts) / 1000)) })) };
}

export async function overview(db: D1Like, r: Range) {
  const totals = await db
    .prepare(
      `SELECT COUNT(DISTINCT vid) AS visitors, COUNT(DISTINCT CASE WHEN sid != '' THEN sid END) AS sessions, COUNT(*) AS pageviews
       FROM events WHERE type = 'pageview' AND day BETWEEN ? AND ?`,
    )
    .bind(r.from, r.to)
    .first<{ visitors: number; sessions: number; pageviews: number }>();
  const bounce = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM (SELECT sid FROM events WHERE type = 'pageview' AND sid != '' AND day BETWEEN ? AND ? GROUP BY sid HAVING COUNT(*) = 1)`,
    )
    .bind(r.from, r.to)
    .first<{ n: number }>();
  const daily = await rows<{ day: string; visitors: number; pageviews: number }>(
    db,
    `SELECT day, COUNT(DISTINCT vid) AS visitors, COUNT(*) AS pageviews FROM events
     WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY day ORDER BY day`,
    r.from,
    r.to,
  );
  const visitors = totals?.visitors ?? 0;
  const sessions = totals?.sessions ?? 0;
  const pageviews = totals?.pageviews ?? 0;
  return {
    visitors,
    sessions,
    pageviews,
    bounceRate: sessions ? (bounce?.n ?? 0) / sessions : 0,
    pagesPerSession: sessions ? pageviews / sessions : 0,
    daily,
  };
}

export const topPages = (db: D1Like, r: Range) =>
  rows<{ path: string; views: number; visitors: number }>(
    db,
    `SELECT path, COUNT(*) AS views, COUNT(DISTINCT vid) AS visitors FROM events
     WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY path ORDER BY views DESC, path LIMIT ${LIMIT}`,
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

/** Visitors per source: utm_source, else the referrer host, else direct. */
export const sources = (db: D1Like, r: Range) =>
  rows<{ source: string; medium: string; campaign: string; visitors: number }>(
    db,
    `SELECT COALESCE(utm_source, ref_host, 'direct') AS source, COALESCE(utm_medium, '') AS medium, COALESCE(utm_campaign, '') AS campaign,
            COUNT(DISTINCT vid) AS visitors
     FROM events WHERE type = 'pageview' AND day BETWEEN ? AND ?
     GROUP BY source, medium, campaign ORDER BY visitors DESC, source LIMIT 30`,
    r.from,
    r.to,
  );

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

export const actions = (db: D1Like, r: Range) =>
  rows<{ name: string; n: number; visitors: number }>(
    db,
    `SELECT name, COUNT(*) AS n, COUNT(DISTINCT vid) AS visitors FROM events
     WHERE type = 'event' AND name IS NOT NULL AND day BETWEEN ? AND ? GROUP BY name ORDER BY n DESC, name LIMIT 50`,
    r.from,
    r.to,
  );
