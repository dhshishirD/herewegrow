// Blog post performance: the rules that turn raw counts into rates, a verdict and plain-language hints.
// No Node or browser imports, so the Worker, the admin page and the tests share it.
// Every threshold lives in RULES so it can be tuned after real data comes in.

export const RULES = {
  /** A post needs this many visitors and days live before it gets a Keep / Fix verdict. */
  minViews: 100,
  minDays: 14,
  /** Keep needs both. */
  keepReadRate: 0.4,
  keepActionRate: 0.04,
  /** Hint thresholds. */
  hintReadRate: 0.35,
  hintCtaRate: 0.03,
  /** Points of readers lost between two scroll marks that count as "a sharp drop". */
  hintScrollDrop: 30,
  /** Scroll histograms need at least this many exits to be trusted. */
  minExits: 30,
  /** Source-mix hint: this share from Facebook and less than hintGoogleShare from Google. */
  hintFacebookShare: 0.7,
  hintGoogleShare: 0.1,
  minLabelledSources: 20,
  /** After this many days live with very few views a day, suggest stop or merge. */
  stopDays: 90,
  stopViewsPerDay: 0.5,
  /** Traits comparison: live posts needed, and views a post needs to count in it. */
  traitMinPosts: 10,
  traitMinViews: 30,
  /** An "engaged read": this long on the page and at least this far down. */
  readSeconds: 30,
  readScroll: 50,
} as const;

export const SCROLL_MARKS = [0, 25, 50, 75, 100] as const;
export type ScrollMark = (typeof SCROLL_MARKS)[number];
export type CtaKind = 'builder' | 'cv_checker' | 'templates' | 'whatsapp' | 'other';
export type CtaPos = 'top' | 'middle' | 'end';

/** Counts for one post over one date range. */
export interface PostCounts {
  /** Unique visitors who loaded the post. */
  views: number;
  /** Visitors who stayed 30 s and reached 50 %. */
  reads: number;
  ctaClicks: number;
  /** Visitors who clicked a CTA or started a tool afterwards, once each. */
  actionVisitors: number;
  toolStarts: number;
  orders: number;
  revenue: number;
  /** Exits by the furthest scroll mark reached. */
  scroll: Record<ScrollMark, number>;
  ctaByPos: Record<CtaPos, number>;
  ctaByKind: Partial<Record<CtaKind, number>>;
  /** Where visitors came from (only visits that carry a referrer or UTM); newest 90 days only. */
  sources: Array<{ source: string; n: number }>;
}

export const emptyCounts = (): PostCounts => ({
  views: 0,
  reads: 0,
  ctaClicks: 0,
  actionVisitors: 0,
  toolStarts: 0,
  orders: 0,
  revenue: 0,
  scroll: { 0: 0, 25: 0, 50: 0, 75: 0, 100: 0 },
  ctaByPos: { top: 0, middle: 0, end: 0 },
  ctaByKind: {},
  sources: [],
});

export interface Rates {
  readRate: number | null;
  ctaRate: number | null;
  actionRate: number | null;
  viewsPerDay: number | null;
}

const ratio = (n: number, d: number): number | null => (d > 0 ? n / d : null);

export function rates(c: PostCounts, daysLive: number): Rates {
  return {
    readRate: ratio(c.reads, c.views),
    ctaRate: ratio(c.ctaClicks, c.views),
    actionRate: ratio(c.actionVisitors, c.views),
    viewsPerDay: daysLive > 0 ? c.views / daysLive : null,
  };
}

export type VerdictKind = 'early' | 'keep' | 'fix' | 'stop';
export interface Verdict {
  kind: VerdictKind;
  /** Why, in Bangla. */
  reasons: string[];
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function verdict(c: PostCounts, daysLive: number): Verdict {
  const r = rates(c, daysLive);
  if (c.views < RULES.minViews || daysLive < RULES.minDays) {
    return { kind: 'early', reasons: [`ডেটা জমা হচ্ছে (${RULES.minViews}+ ভিজিটর ও ${RULES.minDays}+ দিন লাগে)`] };
  }
  if (daysLive >= RULES.stopDays && r.viewsPerDay !== null && r.viewsPerDay < RULES.stopViewsPerDay) {
    return { kind: 'stop', reasons: ['৯০ দিনেও ভিজিটর খুব কম: বন্ধ বা অন্য পোস্টের সাথে মেলানোর কথা ভাবুন'] };
  }
  const reasons: string[] = [];
  if ((r.readRate ?? 0) < RULES.keepReadRate) reasons.push(`পড়ার হার ${pct(r.readRate ?? 0)} (লক্ষ্য ${pct(RULES.keepReadRate)})`);
  if ((r.actionRate ?? 0) < RULES.keepActionRate) reasons.push(`অ্যাকশন হার ${pct(r.actionRate ?? 0)} (লক্ষ্য ${pct(RULES.keepActionRate)})`);
  return reasons.length ? { kind: 'fix', reasons } : { kind: 'keep', reasons: [] };
}

/** Share of exits that reached at least each mark, 0..1. Null when there are too few exits. */
export function reach(scroll: Record<ScrollMark, number>): Record<ScrollMark, number> | null {
  const total = SCROLL_MARKS.reduce<number>((s, m) => s + scroll[m], 0);
  if (total < RULES.minExits) return null;
  const out = {} as Record<ScrollMark, number>;
  for (const m of SCROLL_MARKS) out[m] = SCROLL_MARKS.filter((k) => k >= m).reduce<number>((s, k) => s + scroll[k], 0) / total;
  return out;
}

const isFacebook = (s: string) => /facebook|^fb$|^m\.fb|instagram/i.test(s);
const isGoogle = (s: string) => /google/i.test(s);

/** Plain Bangla "what to improve" hints for one post. Empty when nothing stands out or data is too thin. */
export function hints(c: PostCounts, daysLive: number, gsc?: { impressions: number; clicks: number }): string[] {
  const out: string[] = [];
  const r = rates(c, daysLive);
  if (gsc && gsc.impressions >= 200 && gsc.clicks / gsc.impressions < 0.02) {
    out.push('টাইটেল/মেটা বর্ণনা দুর্বল: কীওয়ার্ড আগে আনুন, সংখ্যা বা বছর যোগ করুন।');
  }
  if (c.views >= RULES.minViews) {
    if (r.readRate !== null && r.readRate < RULES.hintReadRate) {
      out.push('শুরুর অংশ দুর্বল: প্রথম ৩ লাইনে সমস্যা ও সমাধানের প্রতিশ্রুতি দিন।');
    }
    if (r.readRate !== null && r.readRate >= RULES.keepReadRate && r.ctaRate !== null && r.ctaRate < RULES.hintCtaRate) {
      out.push('CTA বোতাম উপরে বা মাঝখানে আনুন, লেখা পরিষ্কার করুন।');
    }
    if (c.ctaClicks >= 10 && c.toolStarts / c.ctaClicks < 0.3) {
      out.push('টুল পেজে ঘর্ষণ আছে: ল্যান্ডিং পেজ সহজ করুন।');
    }
    if (c.toolStarts >= 10 && c.orders / c.toolStarts < 0.02) {
      out.push('সমস্যা ব্লগে নয়, অফার বা দামে।');
    }
    const labelled = c.sources.reduce((s, x) => s + x.n, 0);
    if (labelled >= RULES.minLabelledSources) {
      const fb = c.sources.filter((x) => isFacebook(x.source)).reduce((s, x) => s + x.n, 0) / labelled;
      const g = c.sources.filter((x) => isGoogle(x.source)).reduce((s, x) => s + x.n, 0) / labelled;
      if (fb >= RULES.hintFacebookShare && g < RULES.hintGoogleShare) out.push('SEO কাজ করছে না: কীওয়ার্ড ও ইন্টারনাল লিংক দেখুন।');
    }
  }
  const rc = reach(c.scroll);
  if (rc) {
    for (let i = 0; i < SCROLL_MARKS.length - 1; i++) {
      const a = SCROLL_MARKS[i];
      const b = SCROLL_MARKS[i + 1];
      const drop = (rc[a] - rc[b]) * 100;
      if (a >= 25 && drop >= RULES.hintScrollDrop) {
        out.push(`${a}% থেকে ${b}%-এর মাঝে পাঠক অনেক চলে যায়: ওই অংশের হেডিং ছোট করুন, উদাহরণ বা টেবিল দিন।`);
        break;
      }
    }
  }
  return out;
}

/** What a post is made of, read from its text: used to compare traits of strong and weak posts. */
export interface PostTraits {
  wordBand: '<800' | '800-1500' | '1500+';
  hasTable: boolean;
  hasChart: boolean;
  hasHadith: boolean;
  hasQuote: boolean;
  hasExample: boolean;
  ctaType: string;
  titleBand: 'short' | 'medium' | 'long';
  weekday: number;
}

export function postTraits(p: { body: string; title: string; cta: string; words: number; publishDate: string }): PostTraits {
  const b = p.body;
  return {
    wordBand: p.words < 800 ? '<800' : p.words < 1500 ? '800-1500' : '1500+',
    hasTable: /^\s*\|.*\|\s*$\n^\s*\|?[\s:|-]+\|/m.test(b),
    hasChart: /^:::(bar|stats)\s*$/m.test(b),
    hasHadith: /হাদিস|হাদীস|hadith/i.test(b),
    hasQuote: /^>\s?\S/m.test(b),
    hasExample: /উদাহরণ|নমুনা|example/i.test(b),
    ctaType: p.cta.trim().toLowerCase() || 'none',
    titleBand: p.title.length < 45 ? 'short' : p.title.length <= 70 ? 'medium' : 'long',
    weekday: p.publishDate ? new Date(`${p.publishDate}T00:00:00Z`).getUTCDay() : -1,
  };
}

export interface TraitPost {
  id: string;
  views: number;
  readRate: number | null;
  actionRate: number | null;
  traits: PostTraits;
}

export interface TraitRow {
  trait: string;
  value: string;
  posts: number;
  readRate: number | null;
  actionRate: number | null;
}

const avg = (xs: Array<number | null>): number | null => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};

const WEEKDAY = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

/**
 * Average read and action rate by trait. Only posts with enough views count, and the whole panel stays empty
 * (null) until traitMinPosts live posts exist, so early numbers do not mislead.
 */
export function traitsComparison(posts: TraitPost[], livePosts: number): TraitRow[] | null {
  if (livePosts < RULES.traitMinPosts) return null;
  const eligible = posts.filter((p) => p.views >= RULES.traitMinViews);
  if (!eligible.length) return [];
  const rows: TraitRow[] = [];
  const add = (trait: string, value: string, pick: (t: PostTraits) => boolean) => {
    const g = eligible.filter((p) => pick(p.traits));
    if (g.length) rows.push({ trait, value, posts: g.length, readRate: avg(g.map((p) => p.readRate)), actionRate: avg(g.map((p) => p.actionRate)) });
  };
  for (const [trait, key] of [['টেবিল', 'hasTable'], ['চার্ট/গ্রাফ', 'hasChart'], ['হাদিস', 'hasHadith'], ['উদ্ধৃতি', 'hasQuote'], ['উদাহরণ/নমুনা', 'hasExample']] as const) {
    add(trait, 'আছে', (t) => t[key]);
    add(trait, 'নেই', (t) => !t[key]);
  }
  for (const w of ['<800', '800-1500', '1500+'] as const) add('শব্দ সংখ্যা', w, (t) => t.wordBand === w);
  for (const [k, label] of [['short', 'ছোট (<৪৫ অক্ষর)'], ['medium', 'মাঝারি'], ['long', 'বড় (>৭০)']] as const) add('টাইটেল', label, (t) => t.titleBand === k);
  for (const c of [...new Set(eligible.map((p) => p.traits.ctaType))].sort()) add('CTA', c, (t) => t.ctaType === c);
  for (let d = 0; d < 7; d++) add('প্রকাশের বার', WEEKDAY[d], (t) => t.weekday === d);
  return rows;
}

export interface WeeklyPostLine {
  id: string;
  title: string;
  views: number;
  actionRate: number | null;
  readRate: number | null;
  hint: string | null;
}

export interface WeeklyNote {
  best: WeeklyPostLine | null;
  weakest: WeeklyPostLine | null;
}

/** Best and weakest post of the last 7 days among posts with at least 20 visitors that week. */
export function weeklyNote(lines: WeeklyPostLine[]): WeeklyNote {
  const eligible = lines.filter((l) => l.views >= 20);
  if (eligible.length < 2) return { best: eligible[0] ?? null, weakest: null };
  const score = (l: WeeklyPostLine) => (l.actionRate ?? 0) * 2 + (l.readRate ?? 0);
  const sorted = [...eligible].sort((a, b) => score(b) - score(a) || b.views - a.views);
  return { best: sorted[0], weakest: sorted[sorted.length - 1] };
}

/** The four "top posts" cards. A post needs at least 20 visitors to be listed. */
export type TopKey = 'views' | 'read' | 'action' | 'revenue';
export interface TopCandidate {
  id: string;
  title: string;
  views: number;
  readRate: number | null;
  actionRate: number | null;
  orders: number;
  revenue: number;
}

export function topPosts(posts: TopCandidate[]): Record<TopKey, TopCandidate | null> {
  const pick = (list: TopCandidate[], key: (p: TopCandidate) => number | null, min = 0) => {
    const ok = list.filter((p) => (key(p) ?? -1) > min);
    return ok.length ? ok.reduce((a, b) => ((key(b) ?? -1) > (key(a) ?? -1) ? b : a)) : null;
  };
  const rated = posts.filter((p) => p.views >= 20);
  return {
    views: pick(posts, (p) => p.views),
    read: pick(rated, (p) => p.readRate),
    action: pick(rated, (p) => p.actionRate),
    revenue: pick(posts, (p) => p.revenue),
  };
}
