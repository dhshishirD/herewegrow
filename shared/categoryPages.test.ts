import { describe, expect, it } from 'vitest';
import { CATEGORY_CONTENT } from './categoryContent';
import { CATEGORY_PAGES, categoryLive, templatesOfCategory } from './categoryPages';
import { RETIRED, redirectForPath, redirectsFile } from './templateTiers';
import { routeSeo } from './seo';

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

describe('category pages', () => {
  it('has the 13 agreed categories and every retired template points at one of them', () => {
    expect(CATEGORY_PAGES).toHaveLength(13);
    const slugs = new Set(CATEGORY_PAGES.map((c) => c.slug));
    for (const [id, cat] of Object.entries(RETIRED)) expect(slugs.has(cat), `${id} -> ${cat}`).toBe(true);
  });
  it('gives every category at least one template of its own card, so none would be an empty page', () => {
    for (const c of CATEGORY_PAGES) expect(templatesOfCategory(c.slug).length, c.slug).toBeGreaterThan(0);
  });
  it('lists no variant or retired template', () => {
    for (const c of CATEGORY_PAGES) for (const t of templatesOfCategory(c.slug)) expect(t.id in RETIRED).toBe(false);
  });
  it('writes text of the agreed size: 150 to 250 words, 3 to 5 questions', () => {
    for (const [slug, c] of Object.entries(CATEGORY_CONTENT)) {
      expect(CATEGORY_PAGES.some((p) => p.slug === slug), slug).toBe(true);
      const n = words(c.intro.join(' '));
      expect(n, `${slug} intro words`).toBeGreaterThanOrEqual(150);
      expect(n, `${slug} intro words`).toBeLessThanOrEqual(250);
      expect(c.faq.length, `${slug} faq`).toBeGreaterThanOrEqual(3);
      expect(c.faq.length, `${slug} faq`).toBeLessThanOrEqual(5);
      if (c.metaDescription) expect(c.metaDescription.length).toBeLessThanOrEqual(155);
    }
  });
  it('redirects a retired template to its category page only when that page exists, else to /templates', () => {
    for (const [id, cat] of Object.entries(RETIRED)) {
      const to = redirectForPath(`/templates/${id}`);
      expect(to, id).toBe(categoryLive(cat) ? `/templates/category/${cat}` : '/templates');
      expect(redirectsFile()).toContain(`/templates/${id} ${to} 301`);
    }
  });
  it('has search data only for live pages', () => {
    for (const c of CATEGORY_PAGES) {
      const seo = routeSeo(`/templates/category/${c.slug}`);
      if (categoryLive(c.slug)) {
        expect(seo!.title.length).toBeLessThanOrEqual(60);
        expect(seo!.description.length).toBeLessThanOrEqual(155);
      } else expect(seo).toBeUndefined();
    }
  });
});
