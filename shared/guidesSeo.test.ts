import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides';
import { routeSeo } from './seo';
import { seoPagePaths, sitemapXml } from '../scripts/seo';
import { TEMPLATES } from './templates';

const words = (slug: string) => {
  const g = GUIDES.find((x) => x.slug === slug)!;
  return g.body.map((b) => ('h2' in b ? b.h2 : 'p' in b ? b.p : 'ul' in b ? b.ul.join(' ') : 'ol' in b ? b.ol.join(' ') : b.tip)).join(' ').split(/\s+/).length;
};

describe('bank and fresher guides', () => {
  for (const slug of ['bank-job-cv-format', 'fresher-cv-guide']) {
    it(`${slug}: search title and description fit, content is substantial`, () => {
      const g = GUIDES.find((x) => x.slug === slug)!;
      const s = routeSeo(`/guides/${slug}`)!;
      expect(s.title.length).toBeLessThanOrEqual(60);
      expect(s.description.length).toBeLessThanOrEqual(155);
      expect(s.description.length).toBeGreaterThanOrEqual(70);
      expect(s.title).toMatch(/CV Format/i);
      expect(words(slug)).toBeGreaterThanOrEqual(450);
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.related?.some((r) => r.href === '/cv-format-bd')).toBe(true);
    });
  }
  it('keeps every guide related link pointing at a real page, and uses the updated date in the sitemap', () => {
    const known = new Set([...seoPagePaths(), ...TEMPLATES.map((t) => `/templates/${t.id}`)]);
    for (const g of GUIDES) for (const r of g.related ?? []) expect(known.has(r.href), `${g.slug} -> ${r.href}`).toBe(true);
    const xml = sitemapXml();
    for (const g of GUIDES.filter((x) => x.updated)) expect(xml).toContain(`<loc>https://herewegrow.pro/guides/${g.slug}</loc><lastmod>${g.updated}</lastmod>`);
  });
  it('does not make the two guides compete with the pillar for the same title', () => {
    const pillar = routeSeo('/cv-format-bd');
    for (const slug of ['bank-job-cv-format', 'fresher-cv-guide']) expect(routeSeo(`/guides/${slug}`)!.title).not.toBe(pillar?.title);
  });
});
