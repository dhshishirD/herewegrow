import { describe, expect, it } from 'vitest';
import { BIODATA_HUB, BIODATA_MAKER, BIODATA_STYLES, biodataStyleBySlug, biodataSeo } from './biodataStyles';

describe('biodata SEO copy', () => {
  const all = [BIODATA_HUB, BIODATA_MAKER, ...BIODATA_STYLES.map((s) => s.seo)];
  it('has 10 styles with unique slugs', () => {
    expect(BIODATA_STYLES).toHaveLength(10);
    expect(new Set(BIODATA_STYLES.map((s) => s.slug)).size).toBe(10);
  });
  it('keeps titles within 60 and descriptions within 155 characters', () => {
    for (const s of all) {
      expect(s.title.length).toBeLessThanOrEqual(60);
      expect(s.description.length).toBeLessThanOrEqual(155);
      expect(s.description.length).toBeGreaterThan(80);
    }
  });
  it('uses a different title and H1 on every page', () => {
    expect(new Set(all.map((s) => s.title)).size).toBe(all.length);
    expect(new Set(all.map((s) => s.h1)).size).toBe(all.length);
  });
  it('keeps the maker off the hub keyword and the hub off the maker keyword', () => {
    expect(BIODATA_HUB.title.toLowerCase()).not.toContain('maker');
    expect(BIODATA_MAKER.title.toLowerCase()).not.toContain('format');
  });
  it('resolves routes', () => {
    expect(biodataSeo('/biodata')).toBe(BIODATA_MAKER);
    expect(biodataSeo('/templates/category/marriage-biodata')).toBe(BIODATA_HUB);
    expect(biodataSeo('/templates/biodata-timeline')?.title).toContain('Timeline');
    expect(biodataSeo('/templates/biodata-nope')).toBeUndefined();
    expect(biodataStyleBySlug('sidebar')?.id).toBe('sidebar');
  });
});
