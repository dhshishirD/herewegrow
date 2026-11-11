import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emptyCounts } from '../../shared/blogPerformance';
import { PerformanceDrawer, PerformanceSection, type Performance, type PostPerformance } from './AdminBlogPerformance';

const post = (over: Partial<PostPerformance> = {}): PostPerformance => ({
  id: 'P001', slug: 'p1', title: 'সিভি লেখার নিয়ম', publishDate: '2026-11-10', daysLive: 30,
  counts: { ...emptyCounts(), views: 200, reads: 90, ctaClicks: 12, actionVisitors: 14, toolStarts: 6, orders: 1, revenue: 499, scroll: { 0: 10, 25: 20, 50: 40, 75: 20, 100: 10 }, ctaByPos: { top: 2, middle: 6, end: 4 }, ctaByKind: { builder: 12 }, sources: [{ source: 'facebook', n: 30 }] },
  rates: { readRate: 0.45, ctaRate: 0.06, actionRate: 0.07, viewsPerDay: 6.7 },
  verdict: { kind: 'keep', reasons: [] }, hints: ['CTA বোতাম উপরে বা মাঝখানে আনুন'], allViews: 200, ...over,
});

const perf = (over: Partial<Performance> = {}): Performance => ({
  range: '30d', from: '2026-10-13', to: '2026-11-11', today: '2026-11-11', livePosts: 1, posts: [post()],
  top: { views: { id: 'P001', title: 'সিভি লেখার নিয়ম', views: 200, readRate: 0.45, actionRate: 0.07, orders: 1, revenue: 499 }, read: null, action: null, revenue: null },
  weekly: { best: null, weakest: null }, traits: null, ...over,
});

describe('admin performance UI', () => {
  it('shows the top cards, friendly empty states, and the hidden-traits notice', () => {
    const html = renderToString(<PerformanceSection perf={perf()} range="30d" setRange={() => {}} error={null} onOpen={() => {}} />);
    expect(html).toContain('পোস্ট পারফরম্যান্স');
    expect(html).toContain('200 জন');
    expect(html).toContain('ডেটা জমা হচ্ছে');
    expect(html).toContain('পোস্ট লাইভ হলে চালু হবে');
  });
  it('shows a friendly message, not zeros, when nothing is live', () => {
    const html = renderToString(<PerformanceSection perf={perf({ livePosts: 0, posts: [] })} range="7d" setRange={() => {}} error={null} onOpen={() => {}} />);
    expect(html).toContain('লাইভ পোস্ট হলে');
  });
  it('the drawer lists hints, scroll stops, CTA positions and sources', () => {
    const html = renderToString(<PerformanceDrawer p={post()} onClose={() => {}} />);
    for (const s of ['কী ঠিক করবেন', 'CTA বোতাম উপরে', 'পাঠক কতদূর পড়ে', 'মাঝখানে', 'facebook', '৳499']) expect(html).toContain(s);
  });
  it('the drawer for a new post says data is still gathering', () => {
    const html = renderToString(<PerformanceDrawer p={post({ counts: emptyCounts(), hints: [], verdict: { kind: 'early', reasons: ['ডেটা জমা হচ্ছে'] }, rates: { readRate: null, ctaRate: null, actionRate: null, viewsPerDay: 0 } })} onClose={() => {}} />);
    expect(html).toContain('আরও ভিজিটর এলে পরামর্শ');
    expect(html).toContain('এখনও কোনো ক্লিক নেই');
  });
});
