import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { findProduct } from './catalog';
import { routeSeo } from './seo';
import { CATEGORIES, NEW_DESIGNED_TEMPLATES, SINGLE_TEMPLATE_PRICE, TEMPLATES, hubOf, isNew, previewAlt } from './templates';
import { HOW_TO_GUIDE_FILE, NEW_BADGE_DAYS, NEW_DESIGNED_ADDED } from './templatesNew';
import { isListed, isRetired, isVariant, shouldIndex, tierOf } from './templateTiers';

describe('the 20 new designed templates', () => {
  it('are listed, tier A, indexable and not variants', () => {
    for (const t of NEW_DESIGNED_TEMPLATES) {
      expect(isListed(t.id), t.id).toBe(true);
      expect(tierOf(t.id), t.id).toBe('A');
      expect(isVariant(t.id) || isRetired(t.id), t.id).toBe(false);
      expect(shouldIndex(t), t.id).toBe(true);
    }
  });
  it('come first in the catalogue order', () => {
    expect(TEMPLATES.slice(0, 20).map((t) => t.id)).toEqual(NEW_DESIGNED_TEMPLATES.map((t) => t.id));
  });
  it('sell at 29 with the ATS twin and the guide as bonus files', () => {
    for (const t of NEW_DESIGNED_TEMPLATES) {
      const p = findProduct(`tpl-${t.id}`)!;
      expect(p.price).toBe(SINGLE_TEMPLATE_PRICE);
      expect(p.files).toEqual([`${t.id}.docx`, t.id.replace('-designed-', '-ats-') + '.docx', HOW_TO_GUIDE_FILE]);
      expect(t.title.en.endsWith('Designed Word CV')).toBe(true);
    }
  });
  it('use real categories, meta within limits, and a preview image of both sizes', () => {
    const hubs = new Set(CATEGORIES.map((c) => c.id));
    for (const t of NEW_DESIGNED_TEMPLATES) {
      expect(hubs.has(hubOf(t)), t.id).toBe(true);
      expect(t.meta!.title.length).toBeLessThanOrEqual(60);
      expect(t.meta!.description.length).toBeLessThanOrEqual(155);
      expect(routeSeo(`/templates/${t.id}`)!.title).toBe(t.meta!.title);
      for (const f of ['thumb.webp', 'page-1.webp']) expect(existsSync(`public/templates/${t.id}/${f}`), `${t.id}/${f}`).toBe(true);
    }
  });
  it('show a New badge for 30 days only, with "<title> preview" alt text', () => {
    const t = NEW_DESIGNED_TEMPLATES[0];
    const day0 = Date.parse(`${NEW_DESIGNED_ADDED}T00:00:00Z`);
    expect(isNew(t, day0 + 86400000)).toBe(true);
    expect(isNew(t, day0 + (NEW_BADGE_DAYS - 1) * 86400000)).toBe(true);
    expect(isNew(t, day0 + NEW_BADGE_DAYS * 86400000)).toBe(false);
    expect(isNew(TEMPLATES[30], day0)).toBe(false);
    expect(previewAlt(t, 'x')).toBe(`${t.title.en} preview`);
    expect(previewAlt(TEMPLATES[30], 'x')).toBe('x');
  });
  it('keep every catalog.json promise: the Word files are named by id', () => {
    for (const t of NEW_DESIGNED_TEMPLATES) expect(t.file).toBe(`${t.id}.docx`);
    expect(readFileSync('shared/templatesNew.ts', 'utf8')).toContain(HOW_TO_GUIDE_FILE);
  });
});
