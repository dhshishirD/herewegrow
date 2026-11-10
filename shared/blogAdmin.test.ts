import { describe, expect, it } from 'vitest';
import { parsePost } from './blogParse';
import { BUFFER_TARGET, summarize, toIndexEntry, type BlogStatus } from './blogAdmin';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 23, 5); // 23 Nov 2026, 11:00 Bangladesh
const at = (date: string, hourDhaka = 9) => Date.parse(`${date}T00:00:00Z`) + (hourDhaka - 6) * 3600_000;

const entry = (id: string, status: BlogStatus, publishAt: number | null, body = 'বডি '.repeat(700)) =>
  toIndexEntry(
    parsePost(`---\nid: ${id}\ntitle: "শিরোনাম ${id}"\nslug: post-${id.toLowerCase()}\npublishDate: 2026-11-22\nauthor: লেখক\nprimaryKeyword: কীওয়ার্ড\nmetaTitle: "মেটা ${id}"\nmetaDescription: "${'ড'.repeat(120)}"\ncta: Builder\n---\n${body}`, `${id}.md`),
    status,
    publishAt,
  );

describe('summarize', () => {
  it('a scheduled post is live once its time has come, scheduled before', () => {
    const s = summarize([entry('P001', 'scheduled', at('2026-11-22')), entry('P002', 'scheduled', at('2026-11-24')), entry('P003', 'scheduled', NOW)], NOW);
    expect(s.rows.map((r) => [r.id, r.status])).toEqual([['P001', 'live'], ['P003', 'live'], ['P002', 'scheduled']]);
    expect(s.live).toBe(2);
    expect(s.scheduled).toBe(1);
    expect(s.bufferShort).toBe(BUFFER_TARGET - 1);
    expect(s.rows[2].daysUntil).toBe(1);
    expect(s.rows[2].publishTime).toBe('09:00');
  });

  it('drafts and unpublished posts are never live, whatever their time', () => {
    const s = summarize([entry('P001', 'draft', null), entry('P002', 'ready', at('2026-11-01')), entry('P003', 'unpublished', at('2026-11-01'))], NOW);
    expect(s.rows.map((r) => r.status).sort()).toEqual(['draft', 'ready', 'unpublished']);
    expect(s.live).toBe(0);
    expect(s.drafts).toBe(2);
    expect(s.unpublished).toBe(1);
    expect(s.rows.find((r) => r.id === 'P001')!.daysUntil).toBeNull();
  });

  it('flags left-over draft markers and counts scheduled ones with problems', () => {
    const s = summarize([entry('P002', 'scheduled', NOW + 8 * DAY, `${'বডি '.repeat(700)}\n⚠ যাচাই লাগবে\n[আপনার ইনপুট: উদাহরণ]`)], NOW);
    expect(s.rows[0].problems[0]).toContain('⚠ চিহ্ন');
    expect(s.rows[0].problems[0]).toContain('[আপনার ইনপুট…]');
    expect(s.scheduledWithProblems).toBe(1);
  });

  it('notes a short post and lists links to posts that do not exist yet', () => {
    const s = summarize([entry('P001', 'scheduled', NOW + DAY, 'ছোট লেখা। [দেখুন](/blog/post-p009) এবং [এটাও](/blog/post-p001)।')], NOW);
    expect(s.rows[0].notes.some((n) => n.includes('ছোট'))).toBe(true);
    expect(s.rows[0].unwrittenLinks).toEqual(['post-p009']);
    expect(s.rows[0].problems).toEqual([]);
  });

  it('the dashboard entry has no body text', () => {
    expect(Object.keys(entry('P001', 'draft', null))).not.toContain('body');
  });
});
