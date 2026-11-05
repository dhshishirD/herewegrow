import { describe, expect, it } from 'vitest';
import { recordEvent, recordServerEvent, type TrackInput } from './analytics';
import { actions, audience, entryPages, funnel, liveNow, overview, parseRange, revenue, sources, topPages } from './stats';
import { fakeD1 } from './testkit';

// 2026-11-04 12:00 Dhaka = 06:00 UTC.
const D1 = Date.UTC(2026, 10, 4, 6);
const D2 = D1 + 24 * 3_600_000;
const MIN = 60_000;

const input = (o: Partial<TrackInput>): TrackInput => ({
  vid: 'v1', sid: 's1', type: 'pageview', name: null, path: '/', ref: null,
  utmSource: null, utmMedium: null, utmCampaign: null, meta: null, ...o,
});
const ctx = (ts: number, o: { country?: string; device?: string } = {}) => ({ ts, country: o.country ?? 'BD', device: o.device ?? 'mobile', userId: null });

describe('parseRange', () => {
  const now = Date.UTC(2026, 10, 5, 6);
  it('accepts explicit days and presets', () => {
    expect(parseRange(new URLSearchParams('from=2026-11-01&to=2026-11-04'), now)).toEqual({ from: '2026-11-01', to: '2026-11-04' });
    expect(parseRange(new URLSearchParams('preset=today'), now)).toEqual({ from: '2026-11-05', to: '2026-11-05' });
    expect(parseRange(new URLSearchParams('preset=yesterday'), now)).toEqual({ from: '2026-11-04', to: '2026-11-04' });
    expect(parseRange(new URLSearchParams('preset=7d'), now)).toEqual({ from: '2026-10-30', to: '2026-11-05' });
    expect(parseRange(new URLSearchParams('preset=30d'), now)).toEqual({ from: '2026-10-07', to: '2026-11-05' });
  });
  it('rejects bad strings, reversed ranges and spans over 366 days', () => {
    expect(parseRange(new URLSearchParams('from=nope&to=2026-11-04'), now)).toBeNull();
    expect(parseRange(new URLSearchParams('from=2026-02-30&to=2026-03-01'), now)).toBeNull();
    expect(parseRange(new URLSearchParams('from=2026-11-04&to=2026-11-01'), now)).toBeNull();
    expect(parseRange(new URLSearchParams('from=2025-09-01&to=2026-11-04'), now)).toBeNull();
    expect(parseRange(new URLSearchParams('preset=forever'), now)).toBeNull();
    expect(parseRange(new URLSearchParams(''), now)).toBeNull();
  });
});

describe('overview', () => {
  it('counts visitors, sessions, pageviews and bounces across two Dhaka days', async () => {
    const db = fakeD1();
    // v1: session s1 on day 1 with 2 pageviews; v2: session s2 on day 1 (bounce) and s3 on day 2 with 1 pageview (bounce).
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/pro' }), ctx(D1 + MIN));
    await recordEvent(db, input({ vid: 'v2', sid: 's2', path: '/' }), ctx(D1 + 2 * MIN));
    await recordEvent(db, input({ vid: 'v2', sid: 's3', path: '/' }), ctx(D2));
    // a server event and a custom event must not count as pageviews/sessions
    await recordServerEvent(db, { name: 'purchase', vid: 'v1', userId: null, dedupeKey: 'p1', ts: D1 });
    await recordEvent(db, input({ vid: 'v3', sid: 's9', type: 'event', name: 'click', path: '/x' }), ctx(D1));
    const o = await overview(db, { from: '2026-11-04', to: '2026-11-05' });
    expect(o.visitors).toBe(2);
    expect(o.sessions).toBe(3);
    expect(o.pageviews).toBe(4);
    expect(o.bounceRate).toBeCloseTo(2 / 3);
    expect(o.pagesPerSession).toBeCloseTo(4 / 3);
    expect(o.daily).toEqual([
      { day: '2026-11-04', visitors: 2, pageviews: 3 },
      { day: '2026-11-05', visitors: 1, pageviews: 1 },
    ]);
  });

  it('is all zeros for an empty range', async () => {
    const o = await overview(fakeD1(), { from: '2026-11-04', to: '2026-11-04' });
    expect(o).toEqual({ visitors: 0, sessions: 0, pageviews: 0, bounceRate: 0, pagesPerSession: 0, approximate: false, daily: [] });
  });
});

describe('liveNow', () => {
  it('counts a vid seen 4 minutes ago and not one seen 6 minutes ago, with the latest page', async () => {
    const db = fakeD1();
    const now = D1 + 10 * MIN;
    await recordEvent(db, input({ vid: 'a', path: '/old' }), ctx(now - 4.5 * MIN));
    await recordEvent(db, input({ vid: 'a', path: '/new' }), ctx(now - 4 * MIN));
    await recordEvent(db, input({ vid: 'b', path: '/gone' }), ctx(now - 6 * MIN));
    const live = await liveNow(db, now);
    expect(live.count).toBe(1);
    expect(live.visitors).toEqual([{ page: '/new', agoSec: 240 }]);
  });

  it('keeps the 5-minute window across Dhaka midnight', async () => {
    const db = fakeD1();
    const midnight = Date.UTC(2026, 10, 4, 18); // 00:00 Dhaka on 2026-11-05
    const now = midnight + 2 * MIN;
    await recordEvent(db, input({ vid: 'late', path: '/before' }), ctx(midnight - MIN)); // 23:59 on the 4th
    await recordEvent(db, input({ vid: 'early', path: '/after' }), ctx(midnight + MIN));
    await recordEvent(db, input({ vid: 'old', path: '/old' }), ctx(midnight - 10 * MIN));
    const live = await liveNow(db, now);
    expect(live.count).toBe(2);
    expect(live.visitors).toEqual([{ page: '/after', agoSec: 60 }, { page: '/before', agoSec: 180 }]);
  });

  it('reads only today and yesterday (Dhaka), not a stray row with a future ts on an old day', async () => {
    const db = fakeD1();
    const now = D1 + 10 * MIN;
    await db.prepare("INSERT INTO events (ts, day, vid, type, path) VALUES (?, '2026-10-01', 'x', 'pageview', '/x')").bind(now - MIN).run();
    expect((await liveNow(db, now)).count).toBe(0);
  });
});

describe('topPages and entryPages', () => {
  it('ranks pages by views and entry pages by sessions', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/pro' }), ctx(D1 + MIN));
    await recordEvent(db, input({ vid: 'v2', sid: 's2', path: '/pro' }), ctx(D1 + 2 * MIN));
    await recordEvent(db, input({ vid: 'v2', sid: 's2', path: '/pro' }), ctx(D1 + 3 * MIN));
    const r = { from: '2026-11-04', to: '2026-11-04' };
    expect(await topPages(db, r)).toEqual([
      { path: '/pro', views: 3, visitors: 2 },
      { path: '/', views: 1, visitors: 1 },
    ]);
    expect(await entryPages(db, r)).toEqual([
      { path: '/', sessions: 1 },
      { path: '/pro', sessions: 1 },
    ]);
  });
});

describe('sources', () => {
  it('groups utm_source=facebook separately from direct and falls back to the referrer host', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', sid: 's1', utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'eid' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v2', sid: 's2' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v3', sid: 's3', ref: 'https://www.google.com/search?q=cv' }), ctx(D1));
    const s = await sources(db, { from: '2026-11-04', to: '2026-11-04' });
    expect(s).toContainEqual({ source: 'facebook', medium: 'cpc', campaign: 'eid', visitors: 1, paid: 0 });
    expect(s).toContainEqual({ source: 'direct', medium: '', campaign: '', visitors: 1, paid: 0 });
    expect(s).toContainEqual({ source: 'www.google.com', medium: '', campaign: '', visitors: 1, paid: 0 });
  });

  it('attributes a whole session to its first pageview, so later hits without utm are not counted as direct', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/', utmSource: 'facebook' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v1', sid: 's1', path: '/pro' }), ctx(D1 + MIN));
    const s = await sources(db, { from: '2026-11-04', to: '2026-11-04' });
    expect(s).toEqual([{ source: 'facebook', medium: '', campaign: '', visitors: 1, paid: 0 }]);
  });
});

describe('audience', () => {
  it('splits devices and countries and treats a vid first seen before the range as returning', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'old', sid: 'o1' }), ctx(D1, { device: 'desktop', country: 'US' }));
    await recordEvent(db, input({ vid: 'old', sid: 'o2' }), ctx(D2, { device: 'desktop', country: 'US' }));
    await recordEvent(db, input({ vid: 'fresh', sid: 'f1' }), ctx(D2, { device: 'mobile', country: 'BD' }));
    const a = await audience(db, { from: '2026-11-05', to: '2026-11-05' });
    expect(a.newVsReturning).toEqual({ new: 1, returning: 1 });
    expect(a.devices).toEqual(expect.arrayContaining([{ device: 'desktop', visitors: 1 }, { device: 'mobile', visitors: 1 }]));
    expect(a.countries).toEqual(expect.arrayContaining([{ country: 'US', visitors: 1 }, { country: 'BD', visitors: 1 }]));
  });
});

describe('actions', () => {
  it('counts events by name, including server-side ones, and ignores pageviews', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', type: 'event', name: 'cta_click' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v1', type: 'event', name: 'cta_click' }), ctx(D1 + MIN));
    await recordEvent(db, input({ vid: 'v2', type: 'event', name: 'cta_click' }), ctx(D1 + MIN));
    await recordServerEvent(db, { name: 'purchase', vid: null, userId: 'u1', dedupeKey: 'purchase:p1', ts: D1 });
    await recordEvent(db, input({ vid: 'v1' }), ctx(D1));
    expect(await actions(db, { from: '2026-11-04', to: '2026-11-04' })).toEqual([
      { name: 'cta_click', n: 3, visitors: 2 },
      { name: 'purchase', n: 1, visitors: 0 },
    ]);
  });
});

describe('funnel', () => {
  it('counts each visitor once per step; viewed from any view_* event, started from checkout_click only', async () => {
    const db = fakeD1();
    const ev = (vid: string, name: string, t: number) => recordEvent(db, input({ vid, sid: `s-${vid}`, type: 'event', name, path: '/x' }), ctx(D1 + t));
    for (const v of ['a', 'b', 'c']) await recordEvent(db, input({ vid: v, sid: `s-${v}` }), ctx(D1));
    await recordEvent(db, input({ vid: 'a', sid: 's-a2' }), ctx(D1 + MIN));
    await ev('a', 'view_pro', 1); await ev('a', 'view_template', 2); await ev('a', 'view_template', 3);
    await ev('b', 'view_service', 1);
    await ev('a', 'checkout_click', 4); await ev('a', 'checkout_click', 5);
    // the /order re-download lookup is an action, not an order start
    await ev('b', 'redownload_lookup', 4); await ev('c', 'order_start', 4);
    await recordServerEvent(db, { name: 'purchase', vid: 'a', userId: null, dedupeKey: 'purchase:1', ts: D1 + 6 * MIN });
    await recordServerEvent(db, { name: 'purchase', vid: 'a', userId: null, dedupeKey: 'purchase:2', ts: D1 + 7 * MIN });
    // outside the range
    await recordServerEvent(db, { name: 'purchase', vid: 'c', userId: null, dedupeKey: 'purchase:3', ts: D2 });
    expect(await funnel(db, { from: '2026-11-04', to: '2026-11-04' })).toEqual({
      steps: [
        { key: 'visit', visitors: 3 },
        { key: 'viewed', visitors: 2 },
        { key: 'order_started', visitors: 1 },
        { key: 'paid', visitors: 1 },
      ],
    });
  });

  it('is zeros for an empty range', async () => {
    const f = await funnel(fakeD1(), { from: '2026-11-04', to: '2026-11-04' });
    expect(f.steps.map((s) => s.visitors)).toEqual([0, 0, 0, 0]);
  });
});

describe('sources paid', () => {
  it('counts purchases whose meta matches the row, with COALESCE-style normalisation', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', sid: 's1', utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'eid' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v2', sid: 's2' }), ctx(D1));
    const buy = (k: string, meta: Record<string, unknown>, ts = D1) => recordServerEvent(db, { name: 'purchase', vid: 'v1', userId: null, dedupeKey: `purchase:${k}`, meta, ts });
    await buy('1', { amount: 199, product: 'x', source: 'facebook', medium: 'cpc', campaign: 'eid' });
    await buy('2', { amount: 199, product: 'x', source: 'facebook', medium: 'cpc', campaign: 'eid' });
    await buy('3', { amount: 199, product: 'x', source: 'direct', medium: '', campaign: '' });
    await buy('4', { amount: 199, product: 'x', source: 'facebook', medium: 'cpc', campaign: 'eid' }, D2); // out of range
    await buy('5', { amount: 99, product: 'x', source: 'newsletter', medium: '', campaign: '' });
    const s = await sources(db, { from: '2026-11-04', to: '2026-11-04' });
    expect(s).toContainEqual({ source: 'newsletter', medium: '', campaign: '', visitors: 0, paid: 1 });
    expect(s).toContainEqual({ source: 'facebook', medium: 'cpc', campaign: 'eid', visitors: 1, paid: 2 });
    expect(s).toContainEqual({ source: 'direct', medium: '', campaign: '', visitors: 1, paid: 1 });
  });
});

describe('sources with a malformed purchase meta', () => {
  it('ignores the bad row instead of throwing', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'v1', sid: 's1' }), ctx(D1));
    await db.prepare("INSERT INTO events (ts, day, type, name, dedupe_key, meta) VALUES (?, '2026-11-04', 'event', 'purchase', 'purchase:bad', '{\"source\":\"abc')").bind(D1).run();
    expect(await sources(db, { from: '2026-11-04', to: '2026-11-04' })).toEqual([{ source: 'direct', medium: '', campaign: '', visitors: 1, paid: 0 }]);
  });
});

describe('revenue', () => {
  it('sums only paid orders for the current Dhaka day and the 7-day window, and counts pro grants', async () => {
    const db = fakeD1();
    const now = Date.UTC(2026, 10, 5, 6); // 2026-11-05 12:00 Dhaka
    const order = (id: string, amount: number, status: string, paidAt: number | null) =>
      db.prepare('INSERT INTO orders (id, product_id, amount_bdt, status, gateway_ref, created_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, 'p', amount, status, id, paidAt ?? 0, paidAt).run();
    await order('today1', 100, 'paid', now - MIN);
    await order('today2', 50, 'paid', Date.UTC(2026, 10, 4, 18, 30)); // 00:30 Dhaka on the 5th (UTC is still the 4th)
    await order('yday', 200, 'paid', Date.UTC(2026, 10, 4, 17, 30)); // 23:30 Dhaka on the 4th
    await order('d6', 20, 'paid', Date.UTC(2026, 10, 5, 6) - 6 * 86_400_000);
    await order('d7', 1000, 'paid', Date.UTC(2026, 10, 5, 6) - 7 * 86_400_000); // outside the week
    await order('pending', 999, 'pending', now - MIN);
    await db.prepare("INSERT INTO users (id, created_at) VALUES ('u1', 0)").run();
    await db.prepare("INSERT INTO pass_grants (order_id, user_id, plan_id, days, granted_at) VALUES ('g1','u1','pro-30',30,?)").bind(now - MIN).run();
    await db.prepare("INSERT INTO pass_grants (order_id, user_id, plan_id, days, granted_at) VALUES ('g2','u1','pro-30',30,?)").bind(now - 9 * 86_400_000).run();
    expect(await revenue(db, now)).toEqual({ today: 150, week: 370, proActivations: 1, orders: 4 });
  });
});

describe('forged purchase rows (no purchase: dedupe key)', () => {
  it('are not counted by funnel, sources.paid or actions', async () => {
    const db = fakeD1();
    await recordEvent(db, input({ vid: 'f', sid: 'sf', utmSource: 'facebook' }), ctx(D1));
    // what a forged beacon would have produced before parseTrack rejected the name
    await db
      .prepare("INSERT INTO events (ts, day, vid, sid, type, name, path, meta) VALUES (?, '2026-11-04', 'f', 'sf', 'event', 'purchase', '/x', ?)")
      .bind(D1 + MIN, JSON.stringify({ amount: 999, product: 'x', source: 'facebook', medium: '', campaign: '' }))
      .run();
    const r = { from: '2026-11-04', to: '2026-11-04' };
    expect((await funnel(db, r)).steps.find((x) => x.key === 'paid')!.visitors).toBe(0);
    expect(await sources(db, r)).toEqual([{ source: 'facebook', medium: '', campaign: '', visitors: 1, paid: 0 }]);
    expect((await actions(db, r)).some((a) => a.name === 'purchase')).toBe(false);
    // a real one is counted
    await recordServerEvent(db, { name: 'purchase', vid: 'f', userId: null, dedupeKey: 'purchase:real', ts: D1 + 2 * MIN, meta: { amount: 1, product: 'x', source: 'facebook', medium: '', campaign: '' } });
    expect((await funnel(db, r)).steps.find((x) => x.key === 'paid')!.visitors).toBe(1);
    expect(await sources(db, r)).toEqual([{ source: 'facebook', medium: '', campaign: '', visitors: 1, paid: 1 }]);
    expect(await actions(db, r)).toContainEqual({ name: 'purchase', n: 1, visitors: 1 });
  });
});
