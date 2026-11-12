import { describe, expect, it } from 'vitest';
import { BUILDER_FAQ, BUILDER_STEPS, DESIGN_GROUPS, templateForDesign } from './builderContent';
import { DESIGN_IDS } from './designList';
import { routeSeo } from './seo';
import { TEMPLATES } from './templates';

describe('builder content', () => {
  it('every design group lists real designs, once each', () => {
    for (const g of DESIGN_GROUPS) {
      expect(g.designs.length).toBeGreaterThan(0);
      expect(new Set(g.designs).size).toBe(g.designs.length);
      for (const id of g.designs) expect(DESIGN_IDS).toContain(id);
    }
  });
  it('every design suits at least one job group', () => {
    const covered = new Set(DESIGN_GROUPS.flatMap((g) => g.designs));
    for (const id of DESIGN_IDS) expect(covered.has(id)).toBe(true);
  });
  it('designs that copy a Word template link to a template that exists', () => {
    for (const id of DESIGN_IDS) {
      const tpl = templateForDesign(id);
      if (tpl) expect(TEMPLATES.some((t) => t.id === tpl)).toBe(true);
    }
    expect(templateForDesign('ascent')).toBe('hwg-cv-designed-banker-cv');
  });
  it('steps and FAQ are written in both languages', () => {
    for (const s of BUILDER_STEPS) for (const v of [s.title, s.body]) expect(v.en && v.bn).toBeTruthy();
    expect(BUILDER_FAQ.length).toBeGreaterThanOrEqual(6);
    for (const f of BUILDER_FAQ) for (const v of [f.q, f.a]) expect(v.en && v.bn).toBeTruthy();
  });
  it('the builder page title stays short enough for search results and names the tool in English', () => {
    const s = routeSeo('/builder')!;
    expect(s.title.length).toBeLessThanOrEqual(70);
    expect(s.title).toContain('Free CV Maker');
  });
});
