// What the admin Blog page shows: every post row with its status and pre-publish checks.
// No Node or browser imports, so the Worker and the tests share it.

import { dhakaToday, type Post } from './blogParse';

/** Posts to keep scheduled ahead of today (the plan asks for a buffer of 8). */
export const BUFFER_TARGET = 8;

/** Stored status. "Live" is not stored: it is a scheduled post whose time has come. */
export type BlogStatus = 'draft' | 'ready' | 'scheduled' | 'unpublished';
export type RowStatus = BlogStatus | 'live';

/** One post without its text, as the dashboard needs it. */
export interface BlogIndexEntry {
  id: string;
  title: string;
  slug: string;
  status: BlogStatus;
  /** When it goes (or went) live, in ms; null for drafts. */
  publishAt: number | null;
  author: string;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  cta: string;
  words: number;
  /** Slugs this post links to (/blog/<slug>). */
  linksTo: string[];
  /** Text left in the body that says the draft is not finished. */
  draftMarkers: string[];
}

const MARKERS: Array<[RegExp, string]> = [
  [/⚠/, '⚠ চিহ্ন'],
  [/\[আপনার ইনপুট/, '[আপনার ইনপুট…]'],
  [/\[সূত্র যোগ করুন/, '[সূত্র যোগ করুন…]'],
  [/\bTODO\b/i, 'TODO'],
];

export function draftMarkers(body: string): string[] {
  return MARKERS.filter(([re]) => re.test(body)).map(([, label]) => label);
}

export function toIndexEntry(p: Pick<Post, 'id' | 'title' | 'slug' | 'author' | 'primaryKeyword' | 'metaTitle' | 'metaDescription' | 'cta' | 'body'>, status: BlogStatus, publishAt: number | null): BlogIndexEntry {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    status,
    publishAt,
    author: p.author,
    primaryKeyword: p.primaryKeyword,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    cta: p.cta,
    words: p.body.split(/\s+/).filter(Boolean).length,
    linksTo: [...new Set([...p.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]))],
    draftMarkers: draftMarkers(p.body),
  };
}

export interface PostRow extends Omit<BlogIndexEntry, 'status'> {
  status: RowStatus;
  /** Bangladesh date and time it goes live, '' for drafts. */
  publishDate: string;
  publishTime: string;
  /** Days until it goes live (0 = today); negative once live; null for drafts. */
  daysUntil: number | null;
  /** Must fix before the post goes live. */
  problems: string[];
  /** Worth a look, does not block. */
  notes: string[];
  /** Linked slugs that have no post yet. */
  unwrittenLinks: string[];
}

export interface BlogSummary {
  today: string;
  live: number;
  scheduled: number;
  drafts: number;
  unpublished: number;
  bufferTarget: number;
  /** Scheduled posts still needed to reach the buffer target. */
  bufferShort: number;
  /** Date of the last scheduled post, or null. */
  lastScheduled: string | null;
  /** Scheduled posts that have problems. */
  scheduledWithProblems: number;
  rows: PostRow[];
}

const DAY = 86_400_000;
const dayDiff = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / DAY);
const dhakaTime = (ms: number) => new Date(ms + 6 * 3600 * 1000).toISOString().slice(11, 16);

export function summarize(entries: BlogIndexEntry[], now: number): BlogSummary {
  const today = dhakaToday(now);
  const slugs = new Set(entries.map((e) => e.slug));
  const rows: PostRow[] = entries.map((e) => {
    const problems: string[] = [];
    const notes: string[] = [];
    if (e.draftMarkers.length) problems.push(`খসড়ার চিহ্ন বাকি: ${e.draftMarkers.join(', ')}`);
    if (!e.author) problems.push('লেখকের নাম নেই');
    if (!e.primaryKeyword) problems.push('প্রাইমারি কীওয়ার্ড নেই');
    if (e.metaTitle.length > 70) notes.push(`মেটা টাইটেল বড় (${e.metaTitle.length} অক্ষর)`);
    if (e.metaDescription.length < 70 || e.metaDescription.length > 170) notes.push(`মেটা ডেসক্রিপশন ${e.metaDescription.length} অক্ষর (লক্ষ্য ~১৫৫)`);
    if (e.words < 600) notes.push(`লেখা ছোট (${e.words} শব্দ)`);
    const date = e.publishAt === null ? '' : dhakaToday(e.publishAt);
    return {
      ...e,
      status: (e.status === 'scheduled' && e.publishAt !== null && e.publishAt <= now ? 'live' : e.status) as RowStatus,
      publishDate: date,
      publishTime: e.publishAt === null ? '' : dhakaTime(e.publishAt),
      daysUntil: date ? dayDiff(date, today) : null,
      problems,
      notes,
      unwrittenLinks: e.linksTo.filter((s) => !slugs.has(s)),
    };
  });
  rows.sort((a, b) => (a.publishAt ?? Infinity) - (b.publishAt ?? Infinity) || a.id.localeCompare(b.id));
  const scheduled = rows.filter((r) => r.status === 'scheduled');
  return {
    today,
    live: rows.filter((r) => r.status === 'live').length,
    scheduled: scheduled.length,
    drafts: rows.filter((r) => r.status === 'draft' || r.status === 'ready').length,
    unpublished: rows.filter((r) => r.status === 'unpublished').length,
    bufferTarget: BUFFER_TARGET,
    bufferShort: Math.max(0, BUFFER_TARGET - scheduled.length),
    lastScheduled: scheduled.length ? scheduled[scheduled.length - 1].publishDate : null,
    scheduledWithProblems: scheduled.filter((r) => r.problems.length).length,
    rows,
  };
}
