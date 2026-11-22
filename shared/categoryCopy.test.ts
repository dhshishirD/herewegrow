import { describe, expect, it } from 'vitest';
import { CATEGORY_PAGES, categoryCards, categoryPath, liveCategoryFor } from './categoryCopy';
import { categoryPages } from './categoryHtml';
import { TEMPLATES, hubOf } from './templates';
import { CATEGORY_PAGES_LIVE, RETIRED, isRetired, isVariant, shouldIndex } from './templateTiers';
import { sitemapXml } from '../scripts/seo';

const words = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

describe('category pages data', () => {
  it('keeps titles within 60 and descriptions within 155 characters', () => {
    for (const c of CATEGORY_PAGES) {
      expect(c.title.length, c.slug).toBeLessThanOrEqual(60);
      expect(c.description.length, c.slug).toBeLessThanOrEqual(155);
      expect(c.description.length, c.slug).toBeGreaterThanOrEqual(70);
    }
  });
  it('lists only existing, indexable, non-variant templates of the right hub, once each', () => {
    for (const c of CATEGORY_PAGES) {
      expect(new Set(c.templateIds).size, c.slug).toBe(c.templateIds.length);
      expect(categoryCards(c).length, c.slug).toBe(c.templateIds.length);
      for (const id of c.templateIds) {
        const t = TEMPLATES.find((x) => x.id === id);
        expect(t, `${c.slug} -> ${id} exists`).toBeTruthy();
        expect(!isRetired(id) && shouldIndex(t!) && !isVariant(id), `${c.slug} -> ${id} indexable`).toBe(true);
        expect(hubOf(t!), `${c.slug} -> ${id} hub`).toBe(c.hub);
      }
    }
  });
  it('covers every indexable template of its hub', () => {
    for (const c of CATEGORY_PAGES) {
      const all = TEMPLATES.filter((t) => !isRetired(t.id) && shouldIndex(t) && !isVariant(t.id) && hubOf(t) === c.hub).map((t) => t.id);
      expect([...c.templateIds].sort(), c.slug).toEqual([...all].sort());
    }
  });
});

describe('category pages HTML', () => {
  const built = categoryPages();
  it('builds one page per category with real content', () => {
    expect(built.length).toBe(CATEGORY_PAGES.length);
    for (const p of built) {
      expect(words(p.body), p.path).toBeGreaterThanOrEqual(300);
      expect((p.body.match(/<h1>/g) ?? []).length, p.path).toBe(1);
      expect((p.body.match(/<h2>/g) ?? []).length, p.path).toBeGreaterThanOrEqual(2);
      expect(p.body, p.path).not.toMatch(/undefined|NaN|\[object/);
      expect(p.body, p.path).toContain('৳২৯');
    }
  });
  it('has CollectionPage and BreadcrumbList JSON-LD only', () => {
    for (const p of built) {
      expect(p.jsonLd.map((x) => (x as { '@type': string })['@type']), p.path).toEqual(['CollectionPage', 'BreadcrumbList']);
      expect(JSON.stringify(p.jsonLd)).not.toMatch(/FAQPage|aggregateRating/);
    }
  });
  it('stays noindex and out of the sitemap until CATEGORY_PAGES_LIVE is true', () => {
    const xml = sitemapXml();
    for (const p of built) {
      expect(p.noindex, p.path).toBe(!CATEGORY_PAGES_LIVE);
      expect(xml.includes(`<loc>https://herewegrow.pro${p.path}</loc>`), p.path).toBe(CATEGORY_PAGES_LIVE);
    }
  });
  it('links back from template pages only when live', () => {
    for (const c of CATEGORY_PAGES) expect(Boolean(liveCategoryFor(c.hub))).toBe(CATEGORY_PAGES_LIVE);
  });
});

describe('before CATEGORY_PAGES_LIVE is flipped', () => {
  it('every category a retired template redirects to has a page', () => {
    if (!CATEGORY_PAGES_LIVE) return;
    const have = new Set(CATEGORY_PAGES.map((c) => c.slug));
    for (const [id, cat] of Object.entries(RETIRED)) expect(have.has(cat), `${id} -> ${categoryPath(cat)}`).toBe(true);
  });
});
