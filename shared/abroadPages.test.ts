import { describe, expect, it } from 'vitest';
import { ABROAD_PAGES } from './abroadPages';
import { ABROAD_PRESETS, abroadPreset } from './abroadPresets';
import { DESIGN_IDS } from './designList';
import { routeSeo } from './seo';

describe('abroad presets', () => {
  it('every preset uses a real design and accent colour', () => {
    for (const [id, p] of Object.entries(ABROAD_PRESETS)) {
      expect(DESIGN_IDS, id).toContain(p.design);
      expect(p.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it('the Gulf preset opens a free photo design with personal details on', () => {
    expect(abroadPreset('gulf')).toMatchObject({ design: 'modern', showPersonal: true });
  });
  it('returns null for unknown, empty or inherited keys', () => {
    expect(abroadPreset('nope')).toBeNull();
    expect(abroadPreset(null)).toBeNull();
    expect(abroadPreset('toString')).toBeNull();
  });
});

describe('abroad pages', () => {
  it('each page has a preset, search metadata, a checked date, safety lines and bilingual FAQ', () => {
    for (const p of Object.values(ABROAD_PAGES)) {
      expect(abroadPreset(p.presetId), p.path).toBeTruthy();
      expect(routeSeo(p.path), p.path).toBeTruthy();
      expect(p.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.safety.length).toBeGreaterThan(0);
      expect(p.faq.length).toBeGreaterThanOrEqual(4);
      for (const f of p.faq) expect(f.q.bn && f.a.bn && f.q.en && f.a.en).toBeTruthy();
    }
  });
  it('never promises a job or a visa', () => {
    const text = JSON.stringify(ABROAD_PAGES).toLowerCase();
    expect(text).not.toMatch(/guarantee|নিশ্চিত চাকরি|100% job/);
  });
});
