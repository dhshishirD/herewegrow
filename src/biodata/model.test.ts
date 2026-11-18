import { describe, expect, it } from 'vitest';
import { emptyBiodata, buildSections, paginate, type Section } from './model';

describe('buildSections', () => {
  it('hides empty rows and empty sections', () => {
    const d = emptyBiodata();
    d.name = 'Ayesha Rahman';
    d.religion = 'Islam';
    const s = buildSections(d);
    expect(s.map((x) => x.id)).toEqual(['personal']);
    expect(s[0].rows).toEqual([['Religion', 'Islam']]);
  });

  it('keeps education entries with a degree and skips blank ones', () => {
    const d = emptyBiodata();
    d.education = [
      { id: 'a', degree: 'BBA', institution: 'DU', year: '2020' },
      { id: 'b', degree: '', institution: '', year: '' },
    ];
    const s = buildSections(d).find((x) => x.id === 'education')!;
    expect(s.rows).toEqual([['BBA', 'DU, 2020']]);
  });

  it('turns text fields into text sections', () => {
    const d = emptyBiodata();
    d.about = 'Calm and family-oriented.';
    const s = buildSections(d).find((x) => x.id === 'about')!;
    expect(s.text).toBe('Calm and family-oriented.');
  });
});

describe('paginate', () => {
  const sec = (id: string, rows: number): Section => ({ id, title: id, rows: Array.from({ length: rows }, (_, i) => [`l${i}`, 'v'] as [string, string]) });

  it('keeps everything on one page when it fits', () => {
    const r = paginate([sec('a', 5), sec('b', 5)], 3);
    expect(r.pages).toHaveLength(1);
    expect(r.overflow).toBe(false);
  });

  it('moves a whole section to the next page instead of splitting it', () => {
    const r = paginate([sec('a', 12), sec('b', 12), sec('c', 12)], 3);
    expect(r.pages.length).toBeGreaterThan(1);
    expect(r.pages.flat().map((s) => s.id)).toEqual(['a', 'b', 'c']);
    for (const p of r.pages) for (const s of p) expect(s.rows).toHaveLength(12);
  });

  it('flags overflow when sections do not fit in the page limit', () => {
    const many = Array.from({ length: 12 }, (_, i) => sec(`s${i}`, 12));
    const r = paginate(many, 2);
    expect(r.pages).toHaveLength(2);
    expect(r.overflow).toBe(true);
  });
});

describe('paginate options', () => {
  const sec = (id: string, rows: number): Section => ({ id, title: id, rows: Array.from({ length: rows }, (_, i) => [`l${i}`, 'v'] as [string, string]) });
  it('fits more on page 1 when the header is smaller', () => {
    const list = [sec('a', 12), sec('b', 12), sec('c', 12)];
    const big = paginate(list, 3, { headerH: 400 });
    const none = paginate(list, 3, { headerH: 0 });
    expect(none.pages[0].length).toBeGreaterThan(big.pages[0].length);
  });
  it('wraps long text sooner in a narrow column', () => {
    const t: Section = { id: 't', title: 't', rows: [], text: 'x'.repeat(2000) };
    const wide = paginate([sec('a', 10), t], 3, { charsPerLine: 90 });
    const narrow = paginate([sec('a', 10), t], 3, { charsPerLine: 40 });
    expect(narrow.pages.length).toBeGreaterThanOrEqual(wide.pages.length);
  });
});
