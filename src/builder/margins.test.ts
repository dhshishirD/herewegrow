import { describe, expect, it } from 'vitest';
import { DEFAULT_MARGINS, MARGIN_LIMITS, MARGIN_PRESETS, clampMargin } from './model';

describe('page margins', () => {
  it('keeps any value inside the allowed range', () => {
    expect(clampMargin(0)).toBe(MARGIN_LIMITS.min);
    expect(clampMargin(500)).toBe(MARGIN_LIMITS.max);
    expect(clampMargin(20)).toBe(20);
  });
  it('falls back to the default for a broken saved value', () => {
    expect(clampMargin(NaN)).toBe(DEFAULT_MARGINS.x);
  });
  it('has presets inside the range, including the Word 2.54 cm margin', () => {
    for (const p of MARGIN_PRESETS) {
      expect(p.m.x).toBeGreaterThanOrEqual(MARGIN_LIMITS.min);
      expect(p.m.y).toBeLessThanOrEqual(MARGIN_LIMITS.max);
    }
    expect(MARGIN_PRESETS.find((p) => p.id === 'word')?.m).toEqual({ x: 25.4, y: 25.4 });
  });
});
