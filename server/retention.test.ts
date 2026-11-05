import { describe, expect, it, vi } from 'vitest';
import { recordEvent, recordServerEvent, type TrackInput } from './analytics';
import { rollupOld } from './retention';
import { actions, overview, sources, topPages } from './stats';
import { fakeD1 } from './testkit';

const DAY = 86_400_000;
// 2026-11-05 12:00 Dhaka.
const NOW = Date.UTC(2026, 10, 5, 6);
const ago = (days: number, min = 0) => NOW - days * DAY + min * 60_000;
const dayOf = (days: number) => new Date(ago(days) + 6 * 3_600_000).toISOString().slice(0, 10);

const input = (o: Partial<TrackInput>): TrackInput => ({
  vid: 'v1', sid: 's1', type: 'pageview', name: null, path: '/', ref: null,
  utmSource: null, utmMedium: null, utmCampaign: null, meta: null, ...o,
});
const ctx = (ts: number) => ({ ts, country: 'BD', device: 'mobile', userId: null });
const count = async (db: ReturnType<typeof fakeD1>, sql: string, ...b: unknown[]) => (await db.prepare(sql).bind(...b).first<{ n: number }>())!.n;
const rollup = async (db: ReturnType<typeof fakeD1>, day: string) =>
  (await db.prepare('SELECT metric, key, n FROM daily_rollup WHERE day = ? ORDER BY metric, key').bind(day).all<{ metric: string; key: string; n: number }>()).results!;

async function seedOld(db: ReturnType<typeof fakeD1>, days: number) {
  await recordEvent(db, input({ vid: 'a', sid: 's1', path: '/', utmSource: 'facebook', utmMedium: 'paid', utmCampaign: 'eid' }), ctx(ago(days)));
  await recordEvent(db, input({ vid: 'a', sid: 's1', path: '/pro' }), ctx(ago(days, 1)));
  await recordEvent(db, input({ vid: 'b', sid: 's2', path: '/' }), ctx(ago(days, 2)));
  await recordEvent(db, input({ vid: 'b', sid: 's2', type: 'event', name: 'cta_click', path: '/' }), ctx(ago(days, 3)));
  await recordEvent(db, input({ vid: 'b', sid: 's2', type: 'event', name: 'cta_click', path: '/' }), ctx(ago(days, 4)));
  await recordServerEvent(db, { name: 'purchase', vid: 'a', userId: null, dedupeKey: `purchase:p-${days}`, ts: ago(days, 5) });
}

describe('rollupOld', () => {
  it('summarises and deletes events older than the horizon, leaves newer ones', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await recordEvent(db, input({ vid: 'n', sid: 'n1' }), ctx(ago(89)));
    expect(await rollupOld(db, NOW)).toEqual({ days: 1, deleted: 6 });
    expect(await rollup(db, dayOf(91))).toEqual([
      { metric: 'event', key: 'cta_click', n: 2 },
      { metric: 'page', key: '/', n: 2 },
      { metric: 'page', key: '/pro', n: 1 },
      { metric: 'pageviews', key: '*', n: 3 },
      { metric: 'purchase', key: '*', n: 1 },
      { metric: 'sessions', key: '*', n: 2 },
      { metric: 'source', key: 'direct||', n: 1 },
      { metric: 'source', key: 'facebook|paid|eid', n: 1 },
      { metric: 'visitors', key: '*', n: 2 },
    ]);
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events WHERE day = ?', dayOf(91))).toBe(0);
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events WHERE day = ?', dayOf(89))).toBe(1);
    expect(await rollup(db, dayOf(89))).toEqual([]);
  });

  it('keeps events exactly keepDays old and rolls up the day before', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'k', sid: 'k1' }), ctx(ago(90)));
    await recordEvent(db, input({ vid: 'r', sid: 'r1' }), ctx(ago(91)));
    expect(await rollupOld(db, NOW)).toEqual({ days: 1, deleted: 1 });
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events WHERE day = ?', dayOf(90))).toBe(1);
    expect(await rollup(db, dayOf(90))).toEqual([]);
    expect((await rollup(db, dayOf(91))).length).toBeGreaterThan(0);
  });

  it('is idempotent: a second run does not change totals', async () => {
    const db = fakeD1();
    await seedOld(db, 95);
    await rollupOld(db, NOW);
    const first = await rollup(db, dayOf(95));
    expect(await rollupOld(db, NOW)).toEqual({ days: 0, deleted: 0 });
    expect(await rollup(db, dayOf(95))).toEqual(first);
  });

  it('after a failed delete, the retry keeps the original totals and finishes deleting', async () => {
    const db = fakeD1();
    await seedOld(db, 95);
    const real = db.prepare.bind(db);
    let fail = true;
    const flaky = { ...db, prepare: (sql: string) => {
      if (fail && sql.startsWith('DELETE FROM events')) { fail = false; throw new Error('boom'); }
      return real(sql);
    } };
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await rollupOld(flaky, NOW)).toEqual({ days: 0, deleted: 0 });
    expect(err).toHaveBeenCalled();
    err.mockRestore();
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events')).toBe(6);
    expect(await rollupOld(flaky, NOW)).toEqual({ days: 1, deleted: 6 });
    expect((await rollup(db, dayOf(95))).find((r) => r.metric === 'pageviews')).toEqual({ metric: 'pageviews', key: '*', n: 3 });
  });

  it('deletes in batches', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    expect(await rollupOld(db, NOW, 90, 2)).toEqual({ days: 1, deleted: 6 });
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events')).toBe(0);
  });

  it('a failure on one day does not stop later days, and does not delete that day', async () => {
    const db = fakeD1();
    await seedOld(db, 100);
    await seedOld(db, 91);
    const real = db.prepare.bind(db);
    const flaky = { ...db, prepare: (sql: string) => {
      if (sql.includes('INSERT INTO daily_rollup')) throw new Error('boom');
      return real(sql);
    } };
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await rollupOld(flaky, NOW)).toEqual({ days: 0, deleted: 0 });
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events')).toBe(12);
    // second run, healthy: both days processed
    expect(await rollupOld(db, NOW)).toEqual({ days: 2, deleted: 12 });
  });

  it('one bad day does not stop the next', async () => {
    const db = fakeD1();
    await seedOld(db, 100);
    await seedOld(db, 91);
    const real = db.prepare.bind(db);
    const bad = dayOf(100);
    const flaky = { ...db, prepare: (sql: string) => {
      const s = real(sql);
      if (!sql.includes('INSERT INTO daily_rollup')) return s;
      return { ...s, bind: (...v: unknown[]) => { if (v.includes(bad)) throw new Error('boom'); return s.bind(...v); } };
    } };
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await rollupOld(flaky, NOW)).toEqual({ days: 1, deleted: 6 });
    err.mockRestore();
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events WHERE day = ?', bad)).toBe(6);
    expect(await count(db, 'SELECT COUNT(*) AS n FROM events WHERE day = ?', dayOf(91))).toBe(0);
  });
});

describe('stats over rolled-up days', () => {
  it('overview over a fully rolled-up range reads daily_rollup and flags it approximate', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await seedOld(db, 92);
    await rollupOld(db, NOW);
    const o = await overview(db, { from: dayOf(92), to: dayOf(91) });
    expect(o).toEqual({
      visitors: 4, sessions: 4, pageviews: 6, bounceRate: null, pagesPerSession: 1.5, approximate: true,
      daily: [{ day: dayOf(92), visitors: 2, pageviews: 3 }, { day: dayOf(91), visitors: 2, pageviews: 3 }],
    });
  });

  it('a partial range mixing rolled-up and live days counts each day once', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await rollupOld(db, NOW);
    await seedOld(db, 5);
    const o = await overview(db, { from: dayOf(91), to: dayOf(5) });
    expect(o.pageviews).toBe(6);
    expect(o.visitors).toBe(4);
    expect(o.sessions).toBe(4);
    expect(o.approximate).toBe(true);
    expect(o.bounceRate).toBeCloseTo(0.5); // only the live day: s1 has 2 views, s2 has 1 -> 1 of 2
    expect(o.daily.map((d) => d.day)).toEqual([dayOf(91), dayOf(5)]);
  });

  it('a day with rollup rows and leftover events is counted once, from the rollup', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await rollupOld(db, NOW);
    await seedOld(db, 91); // events reappear for an already rolled-up day
    const r = { from: dayOf(91), to: dayOf(91) };
    expect((await overview(db, r)).pageviews).toBe(3);
    expect(await topPages(db, r)).toEqual([{ path: '/', views: 2, visitors: 0 }, { path: '/pro', views: 1, visitors: 0 }]);
    expect(await actions(db, r)).toEqual([{ name: 'cta_click', n: 2, visitors: 0 }, { name: 'purchase', n: 1, visitors: 0 }]);
  });

  it('is not approximate when no day in range is rolled up', async () => {
    const db = fakeD1();
    await seedOld(db, 5);
    const o = await overview(db, { from: dayOf(5), to: dayOf(5) });
    expect(o.approximate).toBe(false);
    expect(o.bounceRate).toBeCloseTo(0.5);
  });

  it('topPages, sources and actions merge rollup with live days', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await rollupOld(db, NOW);
    await seedOld(db, 5);
    const r = { from: dayOf(91), to: dayOf(5) };
    expect(await topPages(db, r)).toEqual([
      { path: '/', views: 4, visitors: 2 },
      { path: '/pro', views: 2, visitors: 1 },
    ]);
    const s = await sources(db, r);
    expect(s).toContainEqual({ source: 'facebook', medium: 'paid', campaign: 'eid', visitors: 2, paid: 0 });
    expect(s).toContainEqual({ source: 'direct', medium: '', campaign: '', visitors: 2, paid: 0 });
    expect(await actions(db, r)).toEqual([
      { name: 'cta_click', n: 4, visitors: 1 },
      { name: 'purchase', n: 2, visitors: 1 }, // rolled-up day adds count only
    ]);
  });
});

describe('rollup ignores forged purchase rows', () => {
  it('counts only purchases with a purchase: dedupe key', async () => {
    const db = fakeD1();
    await seedOld(db, 91);
    await db.prepare("INSERT INTO events (ts, day, vid, sid, type, name, path) VALUES (?, ?, 'x', 'sx', 'event', 'purchase', '/x')").bind(ago(91, 6), dayOf(91)).run();
    await rollupOld(db, NOW);
    const rows = await rollup(db, dayOf(91));
    expect(rows).toContainEqual({ metric: 'purchase', key: '*', n: 1 });
    expect(rows.some((r) => r.metric === 'event' && r.key === 'purchase')).toBe(false);
  });
});
