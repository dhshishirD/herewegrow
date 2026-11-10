// What the admin Blog page shows. The build writes one small index of every post file (including
// posts that are not live yet) to a private file; the Worker reads it only for a signed-in admin.
// This file has no Node or browser imports so the build, the Worker and the tests share it.

import type { Post } from './blogParse';

/** Posts to keep scheduled ahead of today (the plan asks for a buffer of 8). */
export const BUFFER_TARGET = 8;

/** One post, without its body. */
export interface BlogIndexEntry {
  id: string;
  title: string;
  slug: string;
  publishDate: string;
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

export function toIndexEntry(p: Post): BlogIndexEntry {
  const linksTo = [...new Set([...p.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]))];
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    publishDate: p.publishDate,
    author: p.author,
    primaryKeyword: p.primaryKeyword,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    cta: p.cta,
    words: p.body.split(/\s+/).filter(Boolean).length,
    linksTo,
    draftMarkers: MARKERS.filter(([re]) => re.test(p.body)).map(([, label]) => label),
  };
}

export type PostStatus = 'live' | 'scheduled';

export interface PostRow extends BlogIndexEntry {
  status: PostStatus;
  /** Days until it goes live (0 = today). Negative for live posts. */
  daysUntil: number;
  /** Must fix before the post goes live. */
  problems: string[];
  /** Worth a look, does not block. */
  notes: string[];
  /** Linked slugs that have no file yet. */
  unwrittenLinks: string[];
}

export interface BlogSummary {
  today: string;
  live: number;
  scheduled: number;
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
const days = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / DAY);

export function summarize(entries: BlogIndexEntry[], today: string): BlogSummary {
  const slugs = new Set(entries.map((e) => e.slug));
  const rows: PostRow[] = entries
    .map((e) => {
      const problems: string[] = [];
      const notes: string[] = [];
      if (e.draftMarkers.length) problems.push(`খসড়ার চিহ্ন বাকি: ${e.draftMarkers.join(', ')}`);
      if (!e.author) problems.push('লেখকের নাম নেই');
      if (!e.primaryKeyword) problems.push('প্রাইমারি কীওয়ার্ড নেই');
      if (e.metaTitle.length > 70) notes.push(`মেটা টাইটেল বড় (${e.metaTitle.length} অক্ষর)`);
      if (e.metaDescription.length < 70 || e.metaDescription.length > 170) notes.push(`মেটা ডেসক্রিপশন ${e.metaDescription.length} অক্ষর (লক্ষ্য ~১৫৫)`);
      if (e.words < 600) notes.push(`লেখা ছোট (${e.words} শব্দ)`);
      const unwrittenLinks = e.linksTo.filter((s) => !slugs.has(s));
      return {
        ...e,
        status: (e.publishDate <= today ? 'live' : 'scheduled') as PostStatus,
        daysUntil: days(e.publishDate, today),
        problems,
        notes,
        unwrittenLinks,
      };
    })
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate) || a.id.localeCompare(b.id));
  const scheduled = rows.filter((r) => r.status === 'scheduled');
  return {
    today,
    live: rows.length - scheduled.length,
    scheduled: scheduled.length,
    bufferTarget: BUFFER_TARGET,
    bufferShort: Math.max(0, BUFFER_TARGET - scheduled.length),
    lastScheduled: scheduled.length ? scheduled[scheduled.length - 1].publishDate : null,
    scheduledWithProblems: scheduled.filter((r) => r.problems.length).length,
    rows,
  };
}
