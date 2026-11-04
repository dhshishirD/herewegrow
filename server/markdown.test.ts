import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings, paragraphs, bold and lists', () => {
    const html = renderMarkdown('## Overview\n\nBank **officers** handle accounts.\n\n- one\n- two\n\n1. first\n2. second');
    expect(html).toContain('<h2>Overview</h2>');
    expect(html).toContain('<p>Bank <strong>officers</strong> handle accounts.</p>');
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>');
    expect(html).toContain('<ol><li>first</li><li>second</li></ol>');
  });

  it('turns raw HTML into visible text, never into tags', () => {
    const html = renderMarkdown('hi <img src=x onerror=alert(1)> and <b>bold</b>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;img');
  });

  it('makes http(s) links, with rel set', () => {
    const html = renderMarkdown('[BDJobs](https://bdjobs.com/x?a=1&b=2)');
    expect(html).toContain('<a href="https://bdjobs.com/x?a=1&amp;b=2" rel="noopener nofollow">BDJobs</a>');
  });

  it('does not link javascript:, data: or relative-scheme targets', () => {
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', '//evil.example']) {
      const html = renderMarkdown(`[x](${bad})`);
      expect(html).not.toContain('<a ');
      expect(html).not.toContain('href');
    }
  });

  it('cannot break out of an href with quotes', () => {
    const html = renderMarkdown('[x](https://a.example/" onmouseover="alert(1))');
    expect(html).not.toMatch(/<a [^>]*onmouseover/);
  });
});
