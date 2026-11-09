import { describe, expect, it } from 'vitest';
import { dhakaToday, parsePost, publishedPosts, renderMarkdown } from './blogParse';

const FM = `---
id: P900
title: "পরীক্ষার পোস্ট"
slug: test-post
publishDate: 2026-11-22
author: লেখক
primaryKeyword: পরীক্ষা
secondaryKeywords: [a b, সি]
metaTitle: "মেটা টাইটেল"
metaDescription: "বর্ণনা"
cta: Builder
---
`;
const live = new Set(['live-post']);

describe('parsePost', () => {
  it('reads the front matter and body', () => {
    const p = parsePost(`${FM}\n## শিরোনাম\n\nলেখা <!-- গোপন -->`);
    expect(p).toMatchObject({ id: 'P900', slug: 'test-post', publishDate: '2026-11-22', title: 'পরীক্ষার পোস্ট', secondaryKeywords: ['a b', 'সি'] });
    expect(p.body).not.toContain('গোপন');
    expect(p.minutes).toBe(1);
  });
  it('rejects a missing field, a bad slug and a bad date', () => {
    expect(() => parsePost('no front matter')).toThrow(/front matter/);
    expect(() => parsePost(FM.replace('metaDescription: "বর্ণনা"\n', ''))).toThrow(/metaDescription/);
    expect(() => parsePost(FM.replace('slug: test-post', 'slug: Bad Slug'))).toThrow(/slug/);
    expect(() => parsePost(FM.replace('2026-11-22', '22-11-2026'))).toThrow(/publishDate/);
  });
});

describe('publishedPosts', () => {
  const posts = [{ publishDate: '2026-11-24' }, { publishDate: '2026-11-22' }, { publishDate: '2026-11-28' }];
  it('keeps posts whose date has come, newest first', () => {
    expect(publishedPosts(posts, '2026-11-24').map((p) => p.publishDate)).toEqual(['2026-11-24', '2026-11-22']);
    expect(publishedPosts(posts, '2026-11-21')).toEqual([]);
  });
  it('uses Bangladesh time for today', () => {
    expect(dhakaToday(Date.parse('2026-11-21T19:00:00Z'))).toBe('2026-11-22');
    expect(dhakaToday(Date.parse('2026-11-21T17:59:00Z'))).toBe('2026-11-21');
  });
});

describe('renderMarkdown', () => {
  const r = (md: string) => renderMarkdown(md, { liveSlugs: live });
  it('renders headings, lists, checklists and tables', () => {
    const html = r('## হেডিং\n\n- এক\n- দুই\n\n1. ক\n2. খ\n\n- [ ] কাজ\n- [ ] আরেক\n\n| ক | খ |\n|---|---|\n| ১ | ২ |');
    expect(html).toContain('<h2>হেডিং</h2>');
    expect(html).toContain('<ul><li>এক</li><li>দুই</li></ul>');
    expect(html).toContain('<ol><li>ক</li><li>খ</li></ol>');
    expect(html).toContain('class="checklist"');
    expect(html).toContain('<th>ক</th>');
    expect(html).toContain('<td>২</td>');
  });
  it('skips the h1 because the title comes from the front matter', () => {
    expect(r('# শিরোনাম\n\nলেখা')).toBe('<p>লেখা</p>');
  });
  it('escapes HTML so nothing can be injected', () => {
    const html = r('<script>alert(1)</script> **x**');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('links only to live blog posts, same-site paths and https', () => {
    expect(r('[ক](/blog/live-post)')).toContain('<a href="/blog/live-post">ক</a>');
    expect(r('[খ](/blog/not-yet)')).toBe('<p>খ</p>');
    expect(r('[গ](/tools/cv-checker)')).toContain('href="/tools/cv-checker"');
    expect(r('[ঘ](https://example.com)')).toContain('rel="noopener noreferrer"');
    expect(r('[ঙ](javascript:alert)')).toBe('<p>ঙ</p>');
    expect(r('[চ](//evil.com)')).toBe('<p>চ</p>');
  });
  it('puts a bold-only line in its own paragraph (FAQ question)', () => {
    expect(r('**প্রশ্ন?**\nউত্তর।')).toBe('<p class="q"><strong>প্রশ্ন?</strong></p>\n<p>উত্তর।</p>');
  });
  it('keeps inline code and drops comments', () => {
    expect(r('ফাইল `Name_Role.pdf` <!-- নোট -->')).toBe('<p>ফাইল <code>Name_Role.pdf</code></p>');
  });
});
