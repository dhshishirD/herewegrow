// Retention: raw `events` are kept for `keepDays` Dhaka days, then summarised into `daily_rollup` and deleted.
// Rollup rows per day: visitors|sessions|pageviews (key '*'), page (key path), source (key 'source|medium|campaign', n = visitors),
// event (key name, n = count), purchase (key '*', n = count). The pageviews/'*' row is the marker that a day is rolled up.
import type { D1Like, D1Statement } from './cf';
import { dhakaDay } from './analytics';

const DAY_MS = 86_400_000;

/** Statements that write one day's rollup rows. The marker (pageviews/'*') goes last so a partial write never looks complete. */
function rollupStatements(db: D1Like, day: string): D1Statement[] {
  const upsert = (select: string) =>
    db.prepare(`INSERT INTO daily_rollup (day, metric, key, n) ${select} ON CONFLICT(day, metric, key) DO UPDATE SET n = excluded.n`).bind(day);
  return [
    upsert(
      `SELECT day, 'page', path, COUNT(*) FROM events WHERE type = 'pageview' AND day = ? GROUP BY path`,
    ),
    upsert(
      `SELECT ?1, 'source', source || '|' || medium || '|' || campaign, COUNT(DISTINCT vid) FROM (
         SELECT vid, COALESCE(utm_source, ref_host, 'direct') AS source, COALESCE(utm_medium, '') AS medium, COALESCE(utm_campaign, '') AS campaign, MIN(ts)
         FROM events WHERE type = 'pageview' AND sid != '' AND day = ?1 GROUP BY sid)
       WHERE 1 GROUP BY source, medium, campaign`,
    ),
    upsert(
      `SELECT ?1, 'event', name, COUNT(*) FROM events WHERE type = 'event' AND name IS NOT NULL AND name != 'purchase' AND day = ?1 GROUP BY name`,
    ),
    upsert(`SELECT ?1, 'purchase', '*', COUNT(*) FROM events WHERE name = 'purchase' AND day = ?1 HAVING COUNT(*) > 0`),
    upsert(
      `SELECT ?1, 'visitors', '*', COUNT(DISTINCT vid) FROM events WHERE type = 'pageview' AND day = ?1
       UNION ALL SELECT ?1, 'sessions', '*', COUNT(DISTINCT CASE WHEN sid != '' THEN sid END) FROM events WHERE type = 'pageview' AND day = ?1
       UNION ALL SELECT ?1, 'pageviews', '*', COUNT(*) FROM events WHERE type = 'pageview' AND day = ?1`,
    ),
  ];
}

/**
 * Summarise every Dhaka day older than `keepDays` into daily_rollup, then delete that day's events in batches.
 * Events are only deleted after the rollup is written. A day that already has its marker row is not recomputed
 * (a retry after a partial delete would otherwise overwrite the totals with smaller ones); it just finishes deleting.
 * One failing day is logged and skipped; later days still run. Returns the days fully processed and events deleted.
 */
export async function rollupOld(db: D1Like, now: number = Date.now(), keepDays = 90, batch = 5000): Promise<{ days: number; deleted: number }> {
  const cutoff = dhakaDay(now - keepDays * DAY_MS);
  const old = (await db.prepare('SELECT DISTINCT day FROM events WHERE day < ? ORDER BY day').bind(cutoff).all<{ day: string }>()).results ?? [];
  let days = 0;
  let deleted = 0;
  for (const { day } of old) {
    try {
      const done = await db
        .prepare("SELECT 1 AS ok FROM daily_rollup WHERE day = ? AND metric = 'pageviews' AND key = '*'")
        .bind(day)
        .first();
      if (!done) await db.batch(rollupStatements(db, day));
      let dayDeleted = 0;
      for (;;) {
        const r = await db
          .prepare('DELETE FROM events WHERE id IN (SELECT id FROM events WHERE day = ? LIMIT ?)')
          .bind(day, batch)
          .run();
        const n = r.meta?.changes ?? 0;
        dayDeleted += n;
        if (n < batch) break;
      }
      days++;
      deleted += dayDeleted;
    } catch (e) {
      console.error('rollup failed for', day, e);
    }
  }
  return { days, deleted };
}
