// First-party analytics: payload validation, bot/device detection, and event writes.
import type { D1Like } from './cf';

export interface TrackInput {
  vid: string;
  sid: string;
  type: 'pageview' | 'event';
  name: string | null;
  path: string;
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  meta: string | null;
}

const DHAKA_OFFSET_MS = 6 * 3_600_000;

/** The Asia/Dhaka calendar day (YYYY-MM-DD) of a Unix-ms timestamp. Dhaka is UTC+6 with no DST. */
export const dhakaDay = (ts: number): string => new Date(ts + DHAKA_OFFSET_MS).toISOString().slice(0, 10);

/** Unix ms of 00:00 Asia/Dhaka on the Dhaka day containing `ts`. */
export const dhakaDayStart = (ts: number): number => Date.parse(`${dhakaDay(ts)}T00:00:00Z`) - DHAKA_OFFSET_MS;

const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v ? v.slice(0, max) : null);

/** Lowercase, keep [a-z0-9_.-], collapse the rest to "-", max 40 chars. */
export function utm(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return s || null;
}

function metaString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  let s: string | undefined;
  try {
    s = typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    return null;
  }
  return s ? s.slice(0, 300) : null;
}

/** Validate and trim a beacon body. Null when it is not a usable event. */
export function parseTrack(body: unknown): TrackInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const vid = str(b.vid, 64);
  const path = str(b.path, 200);
  if (!vid || !path || !path.startsWith('/')) return null;
  if (b.type !== 'pageview' && b.type !== 'event') return null;
  return {
    vid,
    sid: str(b.sid, 64) ?? '',
    type: b.type,
    name: str(b.name, 60),
    path,
    ref: str(b.ref, 300),
    utmSource: utm(b.utmSource),
    utmMedium: utm(b.utmMedium),
    utmCampaign: utm(b.utmCampaign),
    meta: metaString(b.meta),
  };
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|curl|wget|python|node-fetch/i;

/** Crawlers, tools and requests with no User-Agent are not visitors. */
export const isBot = (ua: string | null): boolean => !ua || BOT.test(ua);

export function deviceOf(ua: string | null): 'mobile' | 'tablet' | 'desktop' {
  const u = ua ?? '';
  if (/ipad|tablet/i.test(u) || (/android/i.test(u) && !/mobile/i.test(u))) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(u)) return 'mobile';
  return 'desktop';
}

const hostOf = (ref: string | null): string | null => {
  if (!ref) return null;
  try {
    return new URL(ref).hostname || null;
  } catch {
    return null;
  }
};

const INSERT = `INSERT INTO events (ts, day, vid, sid, type, name, path, ref_host, utm_source, utm_medium, utm_campaign, device, country, user_id, meta, dedupe_key)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export async function recordEvent(
  db: D1Like,
  input: TrackInput,
  ctx: { ts: number; country: string | null; device: string; userId: string | null },
): Promise<void> {
  await db
    .prepare(INSERT)
    .bind(
      ctx.ts, dhakaDay(ctx.ts), input.vid, input.sid, input.type, input.name, input.path, hostOf(input.ref),
      input.utmSource, input.utmMedium, input.utmCampaign, ctx.device, ctx.country, ctx.userId, input.meta, null,
    )
    .run();
}

/** A server-side event (e.g. purchase). One row per dedupeKey; true if this call inserted it. */
export async function recordServerEvent(
  db: D1Like,
  e: { name: string; vid: string | null; userId: string | null; meta?: Record<string, unknown>; dedupeKey: string; ts?: number },
): Promise<boolean> {
  const ts = e.ts ?? Date.now();
  // Never cut JSON mid-string: a truncated document is invalid and breaks json_extract. Too long means no meta.
  const json = e.meta ? JSON.stringify(e.meta) : null;
  const meta = json && json.length <= 300 ? json : null;
  const r = await db
    .prepare(`${INSERT} ON CONFLICT(dedupe_key) DO NOTHING`)
    .bind(ts, dhakaDay(ts), e.vid, '', 'event', e.name, '', null, null, null, null, null, null, e.userId, meta, e.dedupeKey)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

/**
 * The purchase event for a paid invoice, attributed to the buyer's first touch: the earliest event of that visitor
 * with a utm_source, else the earliest event's referrer host, else 'direct'. One row per invoice; true if this call wrote it.
 */
export async function trackPurchase(
  db: D1Like,
  p: { invoiceId: string; productId: string; amount: number; vid: string; userId: string | null },
): Promise<boolean> {
  const cap = (v: string) => v.slice(0, 40);
  let source = 'direct';
  let medium = '';
  let campaign = '';
  if (p.vid) {
    const utmRow = await db
      .prepare('SELECT utm_source, utm_medium, utm_campaign FROM events WHERE vid = ? AND utm_source IS NOT NULL ORDER BY ts LIMIT 1')
      .bind(p.vid)
      .first<{ utm_source: string; utm_medium: string | null; utm_campaign: string | null }>();
    if (utmRow) {
      source = cap(utmRow.utm_source);
      medium = cap(utmRow.utm_medium ?? '');
      campaign = cap(utmRow.utm_campaign ?? '');
    } else {
      const first = await db.prepare('SELECT ref_host FROM events WHERE vid = ? ORDER BY ts LIMIT 1').bind(p.vid).first<{ ref_host: string | null }>();
      if (first?.ref_host) source = cap(first.ref_host);
    }
  }
  return recordServerEvent(db, {
    name: 'purchase',
    vid: p.vid || null,
    userId: p.userId,
    meta: { amount: p.amount, product: p.productId, source, medium, campaign },
    dedupeKey: `purchase:${p.invoiceId}`,
  });
}
