// Blog post performance, computed from the first-party `events` table (and daily_rollup for days already rolled up).
// A post is identified by its slug: page views have path /blog/<slug>; blog_exit and blog_cta_click events carry the slug
// in meta (meta.s), because the route may already have changed when the exit is sent.
//   views   = unique visitors with a page view of the post
//   reads   = visitors with a blog_exit that reached 50 % and stayed 30 s
//   CTA     = blog_cta_click events (meta: s, cta, pos)
//   tools   = builder_start / checker_score by a visitor whose latest blog page view was this post, within 30 minutes
//   orders  = purchase events whose meta.post names the post (written at purchase time, see trackPurchase)
// Admin only; results are cached for 5 minutes per isolate so the page does not rescan events on every load.

import { dhakaDay, PURCHASE_KEY_SQL } from './analytics';
import { listAll, toEntry } from './blogDb';
import type { D1Like } from './cf';
import { summarize, type PostRow } from '../shared/blogAdmin';
import {
  emptyCounts, hints, postTraits, rates, RULES, SCROLL_MARKS, topPosts, traitsComparison, verdict, weeklyNote,
  type CtaKind, type CtaPos, type PostCounts, type Rates, type ScrollMark, type TopCandidate, type TraitPost, type TraitRow, type Verdict, type WeeklyNote,
} from '../shared/blogPerformance';

const DAY_MS = 86_400_000;
const CACHE_MS = 5 * 60_000;
export const TOOL_EVENTS = ['builder_start', 'checker_score'] as const;
const TOOL_WINDOW_MS = 30 * 60_000;

// A rolled-up day is counted from daily_rollup only (same rule as stats.ts).
const NOT_ROLLED = "day NOT IN (SELECT day FROM daily_rollup WHERE metric = 'pageviews' AND key = '*')";

// meta is client text: json_extract throws on malformed JSON, so every read goes through json_valid first.
const JX = (k: string) => `CASE WHEN json_valid(meta) THEN json_extract(meta, '$.${k}') END`;
const SLUG_PV = "rtrim(substr(path, 7), '/')";
const IS_POST_PV = "type = 'pageview' AND path LIKE '/blog/%'";

const dayFilter = (guard: boolean) => `day BETWEEN ?1 AND ?2${guard ? ` AND ${NOT_ROLLED}` : ''}`;

/** The blog slug whose page this visitor viewed last, up to 30 minutes before event `e`. */
const ATTRIBUTED_SLUG = `(SELECT rtrim(substr(p.path, 7), '/') FROM events p WHERE p.vid = e.vid AND p.type = 'pageview' AND p.path LIKE '/blog/%' AND p.ts <= e.ts AND p.ts >= e.ts - ${TOOL_WINDOW_MS} ORDER BY p.ts DESC LIMIT 1)`;
const toolEventsSql = (guard: boolean) =>
  `FROM events e WHERE e.type = 'event' AND e.name IN (${TOOL_EVENTS.map((n) => `'${n}'`).join(', ')}) AND e.vid IS NOT NULL AND ${dayFilter(guard)}`;

/** The per-metric selects. Each returns (slug, n) for the Dhaka days ?1..?2. Shared by the dashboard and the daily rollup. */
export function postMetricSql(guard: boolean) {
  const d = dayFilter(guard);
  return {
    post_view: `SELECT ${SLUG_PV} AS slug, COUNT(DISTINCT vid) AS n FROM events WHERE ${IS_POST_PV} AND vid IS NOT NULL AND ${d} GROUP BY slug`,
    post_read: `SELECT ${JX('s')} AS slug, COUNT(DISTINCT vid) AS n FROM events WHERE type = 'event' AND name = 'blog_exit' AND vid IS NOT NULL AND ${JX('sc')} >= ${RULES.readScroll} AND ${JX('t')} >= ${RULES.readSeconds} AND ${d} GROUP BY slug`,
    post_cta: `SELECT ${JX('s')} AS slug, COUNT(*) AS n FROM events WHERE type = 'event' AND name = 'blog_cta_click' AND ${d} GROUP BY slug`,
    post_tool: `SELECT ${ATTRIBUTED_SLUG} AS slug, COUNT(DISTINCT e.vid) AS n ${toolEventsSql(guard)} GROUP BY slug`,
    post_act: `SELECT slug, COUNT(DISTINCT vid) AS n FROM (
        SELECT ${JX('s')} AS slug, vid FROM events WHERE type = 'event' AND name = 'blog_cta_click' AND ${d}
        UNION
        SELECT ${ATTRIBUTED_SLUG} AS slug, e.vid AS vid ${toolEventsSql(guard)}
      ) WHERE slug IS NOT NULL AND vid IS NOT NULL GROUP BY slug`,
    post_order: `SELECT ${JX('post')} AS slug, COUNT(*) AS n FROM events WHERE name = 'purchase' AND ${PURCHASE_KEY_SQL} AND ${d} GROUP BY slug`,
    post_rev: `SELECT ${JX('post')} AS slug, SUM(CAST(${JX('amount')} AS INTEGER)) AS n FROM events WHERE name = 'purchase' AND ${PURCHASE_KEY_SQL} AND ${d} GROUP BY slug`,
  } as const;
}
export type PostMetric = keyof ReturnType<typeof postMetricSql>;

type Row = { slug: string | null; n: number | null };
const rows = async <T>(db: D1Like, sql: string, ...binds: unknown[]): Promise<T[]> => ((await db.prepare(sql).bind(...binds).all<T>()).results ?? []) as T[];

const isMark = (v: unknown): v is ScrollMark => SCROLL_MARKS.includes(v as ScrollMark);
const isPos = (v: unknown): v is CtaPos => v === 'top' || v === 'middle' || v === 'end';
const CTA_KINDS: ReadonlySet<string> = new Set<CtaKind>(['builder', 'cv_checker', 'templates', 'whatsapp', 'other']);

/** Counts per slug for the Dhaka days from..to. */
export async function computeCounts(db: D1Like, from: string, to: string): Promise<Map<string, PostCounts>> {
  const out = new Map<string, PostCounts>();
  const get = (slug: string) => {
    let c = out.get(slug);
    if (!c) out.set(slug, (c = emptyCounts()));
    return c;
  };
  const sql = postMetricSql(true);
  const fields: Record<PostMetric, (c: PostCounts, n: number) => void> = {
    post_view: (c, n) => void (c.views += n),
    post_read: (c, n) => void (c.reads += n),
    post_cta: (c, n) => void (c.ctaClicks += n),
    post_tool: (c, n) => void (c.toolStarts += n),
    post_act: (c, n) => void (c.actionVisitors += n),
    post_order: (c, n) => void (c.orders += n),
    post_rev: (c, n) => void (c.revenue += n),
  };
  for (const metric of Object.keys(sql) as PostMetric[]) {
    const raw = await rows<Row>(db, sql[metric], from, to);
    const rolled = await rows<Row>(db, 'SELECT key AS slug, SUM(n) AS n FROM daily_rollup WHERE metric = ? AND day BETWEEN ? AND ? GROUP BY key', metric, from, to);
    for (const r of [...raw, ...rolled]) if (r.slug && r.n) fields[metric](get(String(r.slug)), Number(r.n));
  }

  // Raw-only detail (scroll stops, CTA split, sources): only days not yet rolled up.
  const d = dayFilter(true);
  for (const r of await rows<{ slug: string | null; sc: number | null; n: number }>(db, `SELECT ${JX('s')} AS slug, ${JX('sc')} AS sc, COUNT(*) AS n FROM events WHERE type = 'event' AND name = 'blog_exit' AND ${d} GROUP BY slug, sc`, from, to)) {
    if (r.slug && isMark(Number(r.sc))) get(String(r.slug)).scroll[Number(r.sc) as ScrollMark] += Number(r.n);
  }
  for (const r of await rows<{ slug: string | null; cta: string | null; pos: string | null; n: number }>(db, `SELECT ${JX('s')} AS slug, ${JX('cta')} AS cta, ${JX('pos')} AS pos, COUNT(*) AS n FROM events WHERE type = 'event' AND name = 'blog_cta_click' AND ${d} GROUP BY slug, cta, pos`, from, to)) {
    if (!r.slug) continue;
    const c = get(String(r.slug));
    if (isPos(r.pos)) c.ctaByPos[r.pos] += Number(r.n);
    const kind = CTA_KINDS.has(String(r.cta)) ? (String(r.cta) as CtaKind) : 'other';
    c.ctaByKind[kind] = (c.ctaByKind[kind] ?? 0) + Number(r.n);
  }
  for (const r of await rows<{ slug: string; source: string; n: number }>(db, `SELECT ${SLUG_PV} AS slug, COALESCE(utm_source, ref_host) AS source, COUNT(DISTINCT vid) AS n FROM events WHERE ${IS_POST_PV} AND vid IS NOT NULL AND (utm_source IS NOT NULL OR ref_host IS NOT NULL) AND ${d} GROUP BY slug, source ORDER BY n DESC LIMIT 400`, from, to)) {
    if (r.slug) get(r.slug).sources.push({ source: r.source, n: Number(r.n) });
  }
  return out;
}

const cache = new Map<string, { at: number; value: Map<string, PostCounts> }>();
export const clearPerformanceCache = () => cache.clear();

async function counts(db: D1Like, from: string, to: string, now: number): Promise<Map<string, PostCounts>> {
  const key = `${from}|${to}`;
  const hit = cache.get(key);
  if (hit && now - hit.at < CACHE_MS) return hit.value;
  const value = await computeCounts(db, from, to);
  cache.set(key, { at: now, value });
  if (cache.size > 20) cache.delete(cache.keys().next().value as string);
  return value;
}

export type PerfRange = '7d' | '30d' | 'all';

export interface PostPerformance {
  id: string;
  slug: string;
  title: string;
  publishDate: string;
  /** Days since it went live (all-time), at least 1. */
  daysLive: number;
  /** Counts and rates for the selected range. */
  counts: PostCounts;
  rates: Rates;
  /** Verdict and hints always use all-time counts, so the range toggle never changes a verdict. */
  verdict: Verdict;
  hints: string[];
  allViews: number;
}

export interface Performance {
  range: PerfRange;
  from: string;
  to: string;
  today: string;
  livePosts: number;
  posts: PostPerformance[];
  top: ReturnType<typeof topPosts>;
  weekly: WeeklyNote;
  /** Null until enough posts are live (RULES.traitMinPosts). */
  traits: TraitRow[] | null;
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

export async function blogPerformance(db: D1Like, range: PerfRange, now: number = Date.now()): Promise<Performance> {
  const today = dhakaDay(now);
  const stored = await listAll(db);
  const live: PostRow[] = summarize(stored.map(toEntry), now).rows.filter((r) => r.status === 'live');
  const bodyOf = new Map(stored.map((p) => [p.id, p.body]));
  const earliest = live.reduce((m, r) => (r.publishDate && r.publishDate < m ? r.publishDate : m), today);
  const from = range === 'all' ? earliest : dhakaDay(now - (range === '7d' ? 6 : 29) * DAY_MS);

  const all = await counts(db, earliest, today, now);
  const selected = range === 'all' ? all : await counts(db, from, today, now);
  const week = range === '7d' ? selected : await counts(db, dhakaDay(now - 6 * DAY_MS), today, now);

  const posts: PostPerformance[] = live.map((r) => {
    const daysLive = Math.max(1, daysBetween(r.publishDate, today) + 1);
    const a = all.get(r.slug) ?? emptyCounts();
    const c = selected.get(r.slug) ?? emptyCounts();
    const windowDays = Math.max(1, Math.min(daysLive, daysBetween(from, today) + 1));
    return {
      id: r.id, slug: r.slug, title: r.title, publishDate: r.publishDate, daysLive,
      counts: c, rates: rates(c, windowDays),
      verdict: verdict(a, daysLive), hints: hints(a, daysLive), allViews: a.views,
    };
  });

  const cand: TopCandidate[] = posts.map((p) => ({ id: p.id, title: p.title, views: p.counts.views, readRate: p.rates.readRate, actionRate: p.rates.actionRate, orders: p.counts.orders, revenue: p.counts.revenue }));
  const weekly = weeklyNote(
    live.map((r) => {
      const c = week.get(r.slug) ?? emptyCounts();
      const rt = rates(c, 7);
      return { id: r.id, title: r.title, views: c.views, readRate: rt.readRate, actionRate: rt.actionRate, hint: hints(c, 7)[0] ?? null };
    }),
  );
  const traitPosts: TraitPost[] = posts.map((p) => {
    const r = live.find((x) => x.id === p.id)!;
    const a = all.get(p.slug) ?? emptyCounts();
    const ar = rates(a, p.daysLive);
    return { id: p.id, views: a.views, readRate: ar.readRate, actionRate: ar.actionRate, traits: postTraits({ body: bodyOf.get(p.id) ?? '', title: r.title, cta: r.cta, words: r.words, publishDate: r.publishDate }) };
  });

  return { range, from, to: today, today, livePosts: live.length, posts, top: topPosts(cand), weekly, traits: traitsComparison(traitPosts, live.length) };
}
