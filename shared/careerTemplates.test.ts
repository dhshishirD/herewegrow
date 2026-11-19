import { describe, expect, it } from 'vitest';
import { EUROPASS_EXCLUDED_IDS } from './europassPages';
import { relatedTemplates, sectorsForRole } from './careerTemplates';
import { TEMPLATES } from './templates';
import { isRetired, isVariant } from './templateTiers';

const SAMPLES: [string, string | null][] = [
  ['Bank Officer', 'Banking'], ['Staff Nurse', 'Healthcare & Nursing'], ['Primary Teacher', 'Teaching'], ['Sales Executive', 'Sales'],
  ['Civil Engineer', 'Engineering'], ['Software Developer', 'IT'], ['Zookeeper', 'Wildlife'], ['', null], ['Accountant', null],
];

describe('relatedTemplates', () => {
  it('is deterministic', () => {
    for (const [t, f] of SAMPLES) expect(relatedTemplates(t, f).map((x) => x.id)).toEqual(relatedTemplates(t, f).map((x) => x.id));
  });
  it('returns at most 3, all real, on sale, listed and not europass-003', () => {
    const ids = new Set(TEMPLATES.map((t) => t.id));
    for (const [t, f] of SAMPLES) {
      const r = relatedTemplates(t, f);
      expect(r.length).toBeGreaterThan(0);
      expect(r.length).toBeLessThanOrEqual(3);
      expect(new Set(r.map((x) => x.id)).size).toBe(r.length);
      for (const x of r) {
        expect(ids.has(x.id)).toBe(true);
        expect(isRetired(x.id)).toBe(false);
        expect(isVariant(x.id)).toBe(false);
        expect(EUROPASS_EXCLUDED_IDS).not.toContain(x.id);
      }
    }
    expect(relatedTemplates('Bank Officer', 'Banking', 10).length).toBe(3);
  });
  it('matches the sector of the role', () => {
    expect(relatedTemplates('Bank Officer', 'Banking').every((x) => x.sector === 'banking')).toBe(true);
    expect(relatedTemplates('Staff Nurse', 'Healthcare & Nursing').every((x) => x.sector === 'medical')).toBe(true);
    expect(relatedTemplates('Teacher', 'Education').every((x) => x.sector === 'teaching')).toBe(true);
  });
  it('falls back to fresher/corporate for unknown fields', () => {
    expect(sectorsForRole('Zookeeper', 'Wildlife')).toEqual(['fresher', 'corporate']);
    expect(relatedTemplates('Zookeeper', 'Wildlife').every((x) => x.sector === 'fresher')).toBe(true);
  });
});
