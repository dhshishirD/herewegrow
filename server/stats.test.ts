import { describe, expect, it } from 'vitest';
import { recordEvent, recordServerEvent, type TrackInput } from './analytics';
import { actions, audience, entryPages, liveNow, overview, parseRange, sources, topPages } from './stats';
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
    expect(o).toEqual({ visitors: 0, sessions: 0, pageviews: 0, bounceRate: 0, pagesPerSession: 0, daily: [] });
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
    await recordEvent(db, input({ vid: 'v1', utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'eid' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v2' }), ctx(D1));
    await recordEvent(db, input({ vid: 'v3', ref: 'https://www.google.com/search?q=cv' }), ctx(D1));
    const s = await sources(db, { from: '2026-11-04', to: '2026-11-04' });
    expect(s).toContainEqual({ source: 'facebook', medium: 'cpc', campaign: 'eid', visitors: 1 });
    expect(s).toContainEqual({ source: 'direct', medium: '', campaign: '', visitors: 1 });
    expect(s).toContainEqual({ source: 'www.google.com', medium: '', campaign: '', visitors: 1 });
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
    await recordServerEvent(db, { name: 'purchase', vid: null, userId: 'u1', dedupeKey: 'p1', ts: D1 });
    await recordEvent(db, input({ vid: 'v1' }), ctx(D1));
    expect(await actions(db, { from: '2026-11-04', to: '2026-11-04' })).toEqual([
      { name: 'cta_click', n: 3, visitors: 2 },
      { name: 'purchase', n: 1, visitors: 0 },
    ]);
  });
});
