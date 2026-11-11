import { describe, expect, it } from 'vitest';
import { emptyCounts, hints, postTraits, rates, reach, RULES, topPosts, traitsComparison, verdict, weeklyNote, type PostCounts } from './blogPerformance';

const counts = (o: Partial<PostCounts>): PostCounts => ({ ...emptyCounts(), ...o });

describe('rates', () => {
  it('divides by visitors and returns null when there are none', () => {
    expect(rates(counts({ views: 200, reads: 80, ctaClicks: 10, actionVisitors: 12 }), 20)).toEqual({ readRate: 0.4, ctaRate: 0.05, actionRate: 0.06, viewsPerDay: 10 });
    expect(rates(counts({}), 5)).toEqual({ readRate: null, ctaRate: null, actionRate: null, viewsPerDay: 0 });
  });
});

describe('verdict', () => {
  it('is early below 100 visitors or 14 days', () => {
    expect(verdict(counts({ views: 99, reads: 90, actionVisitors: 50 }), 30).kind).toBe('early');
    expect(verdict(counts({ views: 500, reads: 400, actionVisitors: 100 }), 13).kind).toBe('early');
  });
  it('keeps a post that meets both targets', () => {
    expect(verdict(counts({ views: 200, reads: 80, actionVisitors: 8 }), 20).kind).toBe('keep');
  });
  it('fixes a post and says which target it missed', () => {
    const v = verdict(counts({ views: 200, reads: 40, actionVisitors: 8 }), 20);
    expect(v.kind).toBe('fix');
    expect(v.reasons).toHaveLength(1);
    expect(v.reasons[0]).toContain('পড়ার হার');
    const both = verdict(counts({ views: 200, reads: 40, actionVisitors: 2 }), 20);
    expect(both.reasons).toHaveLength(2);
  });
  it('suggests stop or merge only after 90 days with very few visitors a day', () => {
    expect(verdict(counts({ views: 120, reads: 80, actionVisitors: 8 }), 250).kind).toBe('stop'); // 0.48 a day
    expect(verdict(counts({ views: 120, reads: 80, actionVisitors: 8 }), 95).kind).toBe('keep'); // 1.3 a day
    expect(verdict(counts({ views: 120, reads: 80, actionVisitors: 8 }), 60).kind).toBe('keep');
  });
});

describe('hints', () => {
  const base = { views: 200, reads: 100, ctaClicks: 20, actionVisitors: 12, toolStarts: 8, orders: 1 };
  it('nothing stands out for a healthy post', () => {
    expect(hints(counts(base), 30)).toEqual([]);
  });
  it('weak intro: low read rate', () => {
    expect(hints(counts({ ...base, reads: 40 }), 30).some((h) => h.includes('শুরুর অংশ'))).toBe(true);
  });
  it('CTA not working: good reads, few clicks', () => {
    expect(hints(counts({ ...base, ctaClicks: 2 }), 30).some((h) => h.includes('CTA'))).toBe(true);
  });
  it('tool page friction: many CTA clicks, few tool starts', () => {
    expect(hints(counts({ ...base, ctaClicks: 20, toolStarts: 2 }), 30).some((h) => h.includes('ল্যান্ডিং'))).toBe(true);
  });
  it('offer problem: many tool starts, almost no orders', () => {
    expect(hints(counts({ ...base, toolStarts: 50, orders: 0 }), 30).some((h) => h.includes('অফার'))).toBe(true);
  });
  it('SEO not working: mostly Facebook, little Google', () => {
    const fb = counts({ ...base, sources: [{ source: 'facebook', n: 30 }, { source: 'www.google.com', n: 1 }] });
    expect(hints(fb, 30).some((h) => h.includes('SEO'))).toBe(true);
    const healthy = counts({ ...base, sources: [{ source: 'facebook', n: 15 }, { source: 'www.google.com', n: 15 }] });
    expect(hints(healthy, 30).some((h) => h.includes('SEO'))).toBe(false);
  });
  it('sharp scroll drop names the section', () => {
    const c = counts({ ...base, scroll: { 0: 5, 25: 5, 50: 30, 75: 5, 100: 5 } });
    expect(hints(c, 30).some((h) => h.includes('50%') && h.includes('75%'))).toBe(true);
  });
  it('scroll hints need enough exits', () => {
    expect(hints(counts({ ...base, scroll: { 0: 1, 25: 1, 50: 5, 75: 0, 100: 0 } }), 30)).toEqual([]);
  });
  it('low click-through from Search Console', () => {
    expect(hints(counts({ ...base }), 30, { impressions: 1000, clicks: 5 }).some((h) => h.includes('টাইটেল'))).toBe(true);
  });
  it('no hints below the minimum views', () => {
    expect(hints(counts({ views: RULES.minViews - 1, reads: 0 }), 30)).toEqual([]);
  });
});

describe('reach', () => {
  it('turns exit counts into the share who got at least that far', () => {
    const r = reach({ 0: 10, 25: 10, 50: 10, 75: 10, 100: 10 })!;
    expect(r[0]).toBe(1);
    expect(r[50]).toBeCloseTo(0.6);
    expect(r[100]).toBeCloseTo(0.2);
  });
});

describe('postTraits', () => {
  it('reads traits from the text', () => {
    const t = postTraits({
      body: 'হাদিস আছে\n\n> উক্তি\n\n| ক | খ |\n|---|---|\n| ১ | ২ |\n\n:::bar\na | 1\n:::\n\nউদাহরণ',
      title: 'ছোট', cta: 'Builder', words: 900, publishDate: '2026-11-22',
    });
    expect(t).toMatchObject({ hasHadith: true, hasQuote: true, hasTable: true, hasChart: true, hasExample: true, wordBand: '800-1500', titleBand: 'short', ctaType: 'builder', weekday: 0 });
  });
  it('a plain post has none of them', () => {
    const t = postTraits({ body: 'শুধু লেখা', title: 'x'.repeat(80), cta: '', words: 300, publishDate: '' });
    expect(t).toMatchObject({ hasHadith: false, hasQuote: false, hasTable: false, hasChart: false, hasExample: false, wordBand: '<800', titleBand: 'long', ctaType: 'none', weekday: -1 });
  });
});

describe('traitsComparison', () => {
  const tp = (id: string, views: number, hasTable: boolean, readRate: number) => ({
    id, views, readRate, actionRate: 0.05,
    traits: postTraits({ body: hasTable ? '| a |\n|---|\n| b |' : 'text', title: 'শিরোনাম', cta: 'Builder', words: 1000, publishDate: '2026-11-22' }),
  });
  it('stays hidden under 10 live posts', () => {
    expect(traitsComparison([tp('a', 100, true, 0.5)], 9)).toBeNull();
  });
  it('compares groups and ignores posts with too few views', () => {
    const rows = traitsComparison([tp('a', 100, true, 0.6), tp('b', 100, false, 0.3), tp('c', 5, false, 0.9)], 12)!;
    const withTable = rows.find((r) => r.trait === 'টেবিল' && r.value === 'আছে')!;
    const without = rows.find((r) => r.trait === 'টেবিল' && r.value === 'নেই')!;
    expect(withTable.readRate).toBeCloseTo(0.6);
    expect(without).toMatchObject({ posts: 1 });
    expect(without.readRate).toBeCloseTo(0.3);
  });
});

describe('weeklyNote and topPosts', () => {
  const line = (id: string, views: number, readRate: number, actionRate: number) => ({ id, title: id, views, readRate, actionRate, hint: null });
  it('picks best and weakest among posts with 20+ visitors', () => {
    const n = weeklyNote([line('A', 100, 0.5, 0.08), line('B', 100, 0.2, 0.01), line('C', 5, 0.9, 0.9)]);
    expect(n.best?.id).toBe('A');
    expect(n.weakest?.id).toBe('B');
  });
  it('a single eligible post is only "best"', () => {
    const n = weeklyNote([line('A', 100, 0.5, 0.08)]);
    expect(n.best?.id).toBe('A');
    expect(n.weakest).toBeNull();
  });
  it('top cards ignore posts under 20 visitors for rates, and empty values give null', () => {
    const top = topPosts([
      { id: 'A', title: 'A', views: 100, readRate: 0.4, actionRate: 0.05, orders: 1, revenue: 500 },
      { id: 'B', title: 'B', views: 10, readRate: 0.9, actionRate: 0.5, orders: 0, revenue: 0 },
    ]);
    expect(top.views?.id).toBe('A');
    expect(top.read?.id).toBe('A');
    expect(top.revenue?.id).toBe('A');
    expect(topPosts([]).views).toBeNull();
  });
});
