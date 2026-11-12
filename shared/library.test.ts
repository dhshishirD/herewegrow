import { describe, expect, it } from 'vitest';
import { PRODUCTS, findProduct } from './catalog';
import { quoteCart } from './cart';
import { CORE_TEMPLATES, LIBRARY_TEMPLATES, NEW_DESIGNED_TEMPLATES, SINGLE_TEMPLATE_PRICE, TEMPLATES, hubOf } from './templates';

describe('template library', () => {
  it('has the 39 core, 200 library and 20 new designed templates with unique ids', () => {
    expect(CORE_TEMPLATES).toHaveLength(39);
    expect(LIBRARY_TEMPLATES).toHaveLength(200);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(259);
    expect(NEW_DESIGNED_TEMPLATES).toHaveLength(20);
  });
  it('uses ids that are valid R2 file names', () => {
    for (const t of TEMPLATES) expect(`${t.id}.docx`).toMatch(/^[a-z0-9-]+\.docx$/);
  });
  it('starts single templates at 29', () => {
    expect(SINGLE_TEMPLATE_PRICE).toBe(29);
    expect(findProduct(`tpl-${LIBRARY_TEMPLATES[0].id}`)?.price).toBe(29);
  });
  it('keeps Best 40 and sector packs on the core templates only', () => {
    const core = new Set(CORE_TEMPLATES.map((t) => t.id));
    for (const id of ['pack-best-40', 'pack-fresher', 'pack-bank', 'pack-engineering', 'pack-sales']) {
      for (const tid of findProduct(id)!.templates!) expect(core.has(tid)).toBe(true);
    }
    expect(findProduct('pack-best-40')!.price).toBe(199);
  });
  it('never delivers Best 40 for a cart that holds a library template', () => {
    const ids = LIBRARY_TEMPLATES.slice(0, 80).map((t) => t.id);
    const q = quoteCart(ids);
    expect(q.upgrade?.id).not.toBe('pack-best-40');
  });
  it('upgrades a cart filled from one library category to that pack when cheaper', () => {
    const ids = LIBRARY_TEMPLATES.filter((t) => t.hub === 'simple').map((t) => t.id);
    const q = quoteCart(ids);
    expect(q.upgrade?.id).toBe('pack-lib-simple');
    expect(q.total).toBe(79);
  });
  it('gives every library pack a zip and only library templates', () => {
    for (const p of PRODUCTS.filter((x) => x.id.startsWith('pack-lib-'))) {
      expect(p.files).toEqual([`${p.id}.zip`]);
      expect(p.templates!.length).toBeGreaterThan(5);
      for (const tid of p.templates!) expect(LIBRARY_TEMPLATES.some((t) => t.id === tid)).toBe(true);
    }
  });
  it('places every template in a category', () => {
    for (const t of TEMPLATES) expect(hubOf(t)).toBeTruthy();
  });
});
