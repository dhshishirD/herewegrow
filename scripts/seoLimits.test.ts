import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DESC_MAX, TITLE_MAX, routeSeo } from '../shared/seo';
import { pages } from './seo';

// Google cuts longer titles and descriptions off in search results.
// To list the length of every page in a file: SEO_REPORT=/tmp/lengths.tsv npx vitest run scripts/seoLimits.test.ts
const all = pages();

describe('search titles and descriptions', () => {
  if (process.env.SEO_REPORT) {
    it('writes every length to the report file', () => {
      const rows = ['path\ttitle\tdescription', ...all.map((p) => `${p.path}\t${p.title.length}\t${p.description.length}`), `/blog\t${routeSeo('/blog')!.title.length}\t${routeSeo('/blog')!.description.length}`];
      writeFileSync(process.env.SEO_REPORT!, `${rows.join('\n')}\n`);
    });
  }
  it(`keeps every title within ${TITLE_MAX} characters`, () => {
    const bad = all.filter((p) => p.title.length > TITLE_MAX).map((p) => `${p.path} (${p.title.length})`);
    expect(bad).toEqual([]);
  });
  it(`keeps every description within ${DESC_MAX} characters`, () => {
    const bad = all.filter((p) => p.description.length > DESC_MAX).map((p) => `${p.path} (${p.description.length})`);
    expect(bad).toEqual([]);
  });
  it('covers /blog too (its page is built by the Worker)', () => {
    const b = routeSeo('/blog')!;
    expect(b.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(b.description.length).toBeLessThanOrEqual(DESC_MAX);
  });
  it('gives no two indexable pages the same title', () => {
    const seen = new Map<string, string>();
    for (const p of all.filter((x) => !x.noindex && (!x.canonical || x.canonical === x.path))) {
      expect(seen.get(p.title), `${p.path} shares a title with ${seen.get(p.title)}`).toBeUndefined();
      seen.set(p.title, p.path);
    }
  });
});
