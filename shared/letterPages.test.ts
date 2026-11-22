import { describe, expect, it } from 'vitest';
import { LETTER_PAGES } from './letterPages';
import { letterPages } from './letterHtml';
import { sitemapXml } from '../scripts/seo';

const words = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const built = letterPages();

describe('Bangla letter pages', () => {
  it('has the three planned paths', () => {
    expect(LETTER_PAGES.map((l) => l.path)).toEqual(['/cover-letter', '/application-letter-bangla', '/resignation-letter-bangla']);
  });
  it('keeps titles within 60 and descriptions within 155 characters, all distinct', () => {
    for (const l of LETTER_PAGES) {
      expect(l.title.length, l.path).toBeLessThanOrEqual(60);
      expect(l.description.length, l.path).toBeLessThanOrEqual(155);
      expect(l.description.length, l.path).toBeGreaterThanOrEqual(70);
    }
    expect(new Set(LETTER_PAGES.map((l) => l.title)).size).toBe(3);
    expect(new Set(LETTER_PAGES.map((l) => l.h1)).size).toBe(3);
  });
  it('builds real content with one h1 and several h2', () => {
    expect(built).toHaveLength(3);
    for (const p of built) {
      expect(words(p.body), p.path).toBeGreaterThanOrEqual(600);
      expect((p.body.match(/<h1>/g) ?? []).length, p.path).toBe(1);
      expect((p.body.match(/<h2>/g) ?? []).length, p.path).toBeGreaterThanOrEqual(6);
      expect(p.body, p.path).not.toMatch(/undefined|NaN|\[object/);
    }
  });
  it('has WebPage and BreadcrumbList JSON-LD only, and a real lastmod', () => {
    for (const p of built) {
      expect(p.jsonLd.map((x) => (x as { '@type': string })['@type']), p.path).toEqual(['WebPage', 'BreadcrumbList']);
      expect(JSON.stringify(p.jsonLd)).not.toMatch(/FAQPage/);
      expect(p.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('links to the generator and to the other letter pages, and every link target is a known site path', () => {
    for (const l of LETTER_PAGES) {
      const hrefs = l.links.map((k) => k.href);
      expect(hrefs.length, l.path).toBeGreaterThanOrEqual(5);
      expect(new Set(hrefs).size, l.path).toBe(hrefs.length);
      expect(hrefs, l.path).not.toContain(l.path);
      for (const h of hrefs) expect(h, `${l.path} -> ${h}`).toMatch(/^\//);
    }
    expect(LETTER_PAGES[0].links.map((k) => k.href)).toContain('/tools/application-letter');
    expect(LETTER_PAGES[1].links.map((k) => k.href)).toContain('/tools/application-letter');
  });
  it('is in the sitemap', () => {
    const xml = sitemapXml();
    for (const l of LETTER_PAGES) expect(xml).toContain(`<loc>https://herewegrow.pro${l.path}</loc>`);
  });
  it('does not promise legal figures', () => {
    for (const l of LETTER_PAGES) expect(JSON.stringify(l)).not.toMatch(/৩০ দিন|১৪ দিন|৬০ দিন|শ্রম আইনের ধারা/);
  });
});

describe('links to the letter pages', () => {
  it('lists exactly the three letter pages', async () => {
    const { LETTER_LINKS } = await import('./letterLinks');
    expect(LETTER_LINKS.map((l) => l.href)).toEqual(LETTER_PAGES.map((l) => l.path));
  });
  it('appear in the prerendered tool page and guides list', async () => {
    const { seoPageBodies } = await import('../scripts/seo');
    const pages = seoPageBodies();
    for (const path of ['/tools/application-letter', '/guides']) {
      const body = pages.find((p) => p.path === path)!.body;
      for (const l of LETTER_PAGES) expect(body, `${path} -> ${l.path}`).toContain(`href="${l.path}"`);
    }
  });
});
