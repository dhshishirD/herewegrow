import { describe, expect, it } from 'vitest';
import { routeSeo } from './seo';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES } from './templates';
import { isRetired, isVariant, shouldIndex } from './templateTiers';

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

// The same list scripts/seo.ts indexes: not retired, indexable, and not a library variant.
const INDEXABLE = TEMPLATES.filter((t) => !isRetired(t.id) && shouldIndex(t) && !(isVariant(t.id) && t.lib));
const seoOf = (id: string) => routeSeo(`/templates/${id}`)!;

describe('template page titles and descriptions', () => {
  it('cover a real set of pages, with and without manual meta', () => {
    expect(INDEXABLE.length).toBeGreaterThan(60);
    expect(INDEXABLE.some((t) => t.meta)).toBe(true);
    expect(INDEXABLE.some((t) => !t.meta)).toBe(true);
  });
  it('keep titles within 60 characters and descriptions within 70-155', () => {
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(title.length, `${t.id} title`).toBeLessThanOrEqual(60);
      expect(description.length, `${t.id} description`).toBeLessThanOrEqual(155);
      expect(description.length, `${t.id} description`).toBeGreaterThanOrEqual(70);
    }
  });
  it('drop the old English tail', () => {
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(title, t.id).not.toContain('Word template');
      expect(description, t.id).not.toContain('editable Word CV format');
    }
  });
  it('never share a title or a description', () => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(titles.get(title), `${t.id} repeats the title of ${titles.get(title)}`).toBeUndefined();
      expect(descriptions.get(description), `${t.id} repeats the description of ${descriptions.get(description)}`).toBeUndefined();
      titles.set(title, t.id);
      descriptions.set(description, t.id);
    }
  });
  it('use the manual meta unchanged when a template has one', () => {
    const withMeta = INDEXABLE.filter((t) => t.meta);
    expect(withMeta.length).toBeGreaterThan(0);
    for (const t of withMeta) {
      expect(seoOf(t.id).title, t.id).toBe(t.meta!.title);
      expect(seoOf(t.id).description, t.id).toBe(t.meta!.description);
    }
  });
  it('show the price from SINGLE_TEMPLATE_PRICE in every generated description', () => {
    for (const t of INDEXABLE.filter((x) => !x.meta)) {
      expect(seoOf(t.id).description, t.id).toContain(`৳${bn(SINGLE_TEMPLATE_PRICE)}`);
    }
  });
});
