import { describe, expect, it } from 'vitest';
import { DESIGN_IDS } from './designList';
import { TEMPLATE_PRESETS, presetFor } from './templatePresets';
import { findTemplate } from './templates';

describe('template presets', () => {
  it('every preset points at a real template and a real design', () => {
    for (const [id, p] of Object.entries(TEMPLATE_PRESETS)) {
      expect(findTemplate(id), id).toBeTruthy();
      expect(DESIGN_IDS).toContain(p.design);
      expect(p.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it('opens four of the new designed CVs in the builder', () => {
    for (const k of ['fresher', 'nurse', 'banker', 'it-software']) expect(presetFor(`hwg-cv-designed-${k}-cv`), k).not.toBeNull();
  });
  it('returns null for unknown or empty ids', () => {
    expect(presetFor('nope')).toBeNull();
    expect(presetFor(null)).toBeNull();
    expect(presetFor('ats-banking-standard-bd')?.design).toBe('bars');
  });
});
