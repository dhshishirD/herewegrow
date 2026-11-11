import { describe, expect, it } from 'vitest';
import { routeSeo } from './seo';
import { TEMPLATES, findTemplate } from './templates';
import { ON_SALE_COUNT, RETIRED, TIER_A, VARIANT_OF, canonicalPathFor, isListed, isRetired, leadOf, redirectForPath, shouldIndex, variantsOf } from './templateTiers';

describe('template tiers, variants and retirements', () => {
  it('has the agreed counts', () => {
    expect(TIER_A.size).toBe(40);
    expect(Object.keys(RETIRED)).toHaveLength(39);
    expect(Object.keys(VARIANT_OF)).toHaveLength(76);
    expect(ON_SALE_COUNT).toBe(239 - 39);
  });
  it('only names templates that exist', () => {
    for (const id of [...TIER_A, ...Object.keys(RETIRED), ...Object.keys(VARIANT_OF), ...Object.values(VARIANT_OF)]) expect(findTemplate(id), id).toBeDefined();
  });
  it('keeps the three sets apart', () => {
    for (const id of Object.keys(RETIRED)) {
      expect(TIER_A.has(id), id).toBe(false);
      expect(id in VARIANT_OF, id).toBe(false);
    }
    for (const id of Object.keys(VARIANT_OF)) expect(TIER_A.has(id), id).toBe(false);
  });
  it('points every variant at a live lead that is not itself a variant', () => {
    for (const [id, lead] of Object.entries(VARIANT_OF)) {
      expect(isRetired(lead), `${id} -> ${lead}`).toBe(false);
      expect(leadOf(lead), `${id} -> ${lead}`).toBeUndefined();
      expect(lead).not.toBe(id);
    }
  });
  it('lists 124 cards and 76 variants', () => {
    expect(TEMPLATES.filter((t) => isListed(t.id))).toHaveLength(124);
    const all = Object.values(VARIANT_OF);
    expect(all).toHaveLength(76);
    expect(variantsOf('creative-sales-standard-1page').sort()).toEqual(
      Object.entries(VARIANT_OF).filter(([, l]) => l === 'creative-sales-standard-1page').map(([i]) => i).sort(),
    );
  });
  it('keeps every already indexed core template indexable, and indexes only A of the library', () => {
    for (const t of TEMPLATES.filter((x) => !x.lib)) expect(shouldIndex(t), t.id).toBe(true);
    const lib = TEMPLATES.filter((x) => x.lib && shouldIndex(x));
    expect(lib).toHaveLength(25);
    for (const t of lib) expect(TIER_A.has(t.id)).toBe(true);
  });
  it('sends a variant canonical to its lead', () => {
    expect(canonicalPathFor('hwg-cv-simple-classic-012')).toBe('/templates/hwg-cv-simple-classic-009');
    expect(canonicalPathFor('hwg-cv-simple-classic-009')).toBe('/templates/hwg-cv-simple-classic-009');
  });
  it('redirects retired template pages with a 301 target and leaves other paths alone', () => {
    expect(redirectForPath('/templates/hwg-cv-europass-europass-017')).toBe('/templates');
    expect(redirectForPath('/templates/hwg-cv-europass-europass-017/')).toBe('/templates');
    expect(redirectForPath('/templates/hwg-cv-europass-europass-016')).toBeNull();
    expect(redirectForPath('/templates/hwg-cv-europass-europass-017/thumb.webp')).toBeNull();
    expect(redirectForPath('/templates')).toBeNull();
  });
  it('gives every indexable template page its own title', () => {
    const seen = new Map<string, string>();
    for (const t of TEMPLATES.filter((x) => shouldIndex(x) && !(x.id in VARIANT_OF))) {
      const title = routeSeo(`/templates/${t.id}`)!.title;
      expect(seen.get(title), `${t.id} shares a title with ${seen.get(title)}`).toBeUndefined();
      seen.set(title, t.id);
    }
  });
});
