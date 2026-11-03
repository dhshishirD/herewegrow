import { describe, expect, it } from 'vitest';
import { DESIGN_IDS, DESIGN_LIST, FREE_DESIGN_COUNT, PRO_DESIGN_COUNT } from './designList';

describe('design list', () => {
  it('has unique ids and bilingual names', () => {
    expect(new Set(DESIGN_IDS).size).toBe(DESIGN_LIST.length);
    for (const d of DESIGN_LIST) {
      expect(d.name.en && d.name.bn && d.note.en && d.note.bn).toBeTruthy();
    }
  });
  it('keeps the ATS-safe Classic design free and offers 3+ more Pro designs', () => {
    expect(DESIGN_LIST.find((d) => d.id === 'classic')?.pro).toBeFalsy();
    expect(FREE_DESIGN_COUNT).toBe(3);
    expect(PRO_DESIGN_COUNT).toBeGreaterThanOrEqual(4);
  });
});
