import { describe, expect, it } from 'vitest';
import { parsePost } from './blogParse';
import { BUFFER_TARGET, summarize, toIndexEntry } from './blogAdmin';

const post = (id: string, date: string, body = 'বডি '.repeat(700), extra = '') =>
  parsePost(
    `---\nid: ${id}\ntitle: "শিরোনাম ${id}"\nslug: post-${id.toLowerCase()}\npublishDate: ${date}\nauthor: লেখক\nprimaryKeyword: কীওয়ার্ড\nmetaTitle: "মেটা ${id}"\nmetaDescription: "${'ড'.repeat(120)}"\ncta: Builder\n${extra}---\n${body}`,
    `${id}.md`,
  );

describe('summarize', () => {
  it('splits live and scheduled by date and counts the buffer', () => {
    const s = summarize([post('P001', '2026-11-22'), post('P002', '2026-11-24'), post('P003', '2026-11-26')].map(toIndexEntry), '2026-11-23');
    expect(s.live).toBe(1);
    expect(s.scheduled).toBe(2);
    expect(s.bufferShort).toBe(BUFFER_TARGET - 2);
    expect(s.lastScheduled).toBe('2026-11-26');
    expect(s.rows.map((r) => [r.id, r.status])).toEqual([['P001', 'live'], ['P002', 'scheduled'], ['P003', 'scheduled']]);
    expect(s.rows[1].daysUntil).toBe(1);
  });

  it('a post goes live on its own date', () => {
    const s = summarize([toIndexEntry(post('P001', '2026-11-22'))], '2026-11-22');
    expect(s.rows[0].status).toBe('live');
    expect(s.rows[0].daysUntil).toBe(0);
  });

  it('flags left-over draft markers as problems, and counts scheduled ones', () => {
    const bad = post('P002', '2026-12-01', `${'বডি '.repeat(700)}\n⚠ যাচাই লাগবে\n[আপনার ইনপুট: উদাহরণ]`);
    const s = summarize([toIndexEntry(bad)], '2026-11-10');
    expect(s.rows[0].problems[0]).toContain('⚠ চিহ্ন');
    expect(s.rows[0].problems[0]).toContain('[আপনার ইনপুট…]');
    expect(s.scheduledWithProblems).toBe(1);
  });

  it('notes a short post and lists links to posts that have no file yet', () => {
    const e = toIndexEntry(post('P001', '2026-11-22', 'ছোট লেখা। [দেখুন](/blog/post-p009) এবং [এটাও](/blog/post-p001)।'));
    const s = summarize([e], '2026-11-10');
    expect(s.rows[0].notes.some((n) => n.includes('ছোট'))).toBe(true);
    expect(s.rows[0].unwrittenLinks).toEqual(['post-p009']);
    expect(s.rows[0].problems).toEqual([]);
  });

  it('body text is not part of the index', () => {
    expect(Object.keys(toIndexEntry(post('P001', '2026-11-22')))).not.toContain('body');
  });
});
