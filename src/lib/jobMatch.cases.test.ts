import { describe, expect, it } from 'vitest';
import { matchCv } from './jobMatch';
import { CASES } from './fixtures/jobAds';

const NOW = new Date('2026-11-08');
const NOISE = ['educational', 'additional', 'least', 'equivalent', 'develop', 'achieve', 'assistant', 'manager', 'bachelor', 'degree', 'master', 'graduate', 'interview', 'salary', 'ms', 'office', 'requirements'];
const run = (name: string) => {
  const c = CASES.find((x) => x.name.startsWith(name))!;
  return { good: matchCv(c.good, c.ad, 24, NOW), weak: matchCv(c.weak, c.ad, 24, NOW) };
};
const terms = (r: ReturnType<typeof matchCv>) => r.keywords.map((k) => k.term);

describe('real-style job ads', () => {
  it.each(CASES.map((c) => [c.name]))('%s: a fitting CV scores high, a poor one low', (name) => {
    const { good, weak } = run(name);
    expect(good.score).toBeGreaterThanOrEqual(70);
    expect(weak.score).toBeLessThanOrEqual(15);
  });

  it.each(CASES.map((c) => [c.name]))('%s: no filler words in the keyword list', (name) => {
    const { good } = run(name);
    const lower = terms(good).map((t) => t.toLowerCase());
    for (const n of NOISE) expect(lower).not.toContain(n);
  });

  it('keeps skills apart: React, TypeScript and Docker are separate asks', () => {
    const { good } = run('software');
    expect(terms(good)).toEqual(expect.arrayContaining(['React / Next.js', 'Node.js', 'TypeScript', 'Docker / DevOps', 'Git']));
    expect(good.missing.map((k) => k.term)).toEqual(['CI/CD']);
  });

  it('reads "Tally ERP" as one product and "MS Excel" as Excel', () => {
    const { good } = run('accounts');
    expect(terms(good)).toContain('Tally');
    expect(terms(good)).not.toContain('ERP');
    expect(terms(good).map((t) => t.toLowerCase())).not.toContain('ms');
  });

  it('counts "Canva or Photoshop" as met when one of them is on the CV', () => {
    const { good } = run('digital');
    expect(terms(good)).toContain('Canva');
    expect(terms(good)).not.toContain('Photoshop');
  });

  it('marks what the ad lists under requirements as must-have and preferences as not', () => {
    const { weak } = run('English teacher');
    const k = (t: string) => weak.keywords.find((x) => x.term.startsWith(t))!;
    expect(k('Computer').must).toBe(true);
    expect(k('B.Ed').must).toBe(false);
  });

  it('understands the same skill in Bangla and English', () => {
    const { good } = run('English teacher');
    expect(good.found.map((k) => k.term)).toEqual(expect.arrayContaining(['Teaching', 'Classroom management', 'Computer skills', 'English']));
    const mixed = matchCv('Taught English for 3 years. Classroom management, computer skills.', CASES[1].ad, 24, NOW);
    expect(mixed.found.map((k) => k.term)).toEqual(expect.arrayContaining(['Teaching', 'Classroom management']));
  });

  it('checks years, degree and age against the CV', () => {
    const { good, weak } = run('sales');
    expect(good.requirements).toEqual([
      expect.objectContaining({ kind: 'years', required: 4, preferred: false, status: 'meets' }),
      expect.objectContaining({ kind: 'degree', required: 4, have: 4, status: 'meets' }),
      expect.objectContaining({ kind: 'age', min: 28, max: 35 }),
    ]);
    expect(weak.requirements.find((r) => r.kind === 'degree')).toMatchObject({ status: 'short' });
    expect(weak.requirements.find((r) => r.kind === 'years')).toMatchObject({ status: 'unknown' });
  });

  it('marks "preferred" experience as preferred', () => {
    const { good } = run('data entry');
    expect(good.requirements.find((r) => r.kind === 'years')).toMatchObject({ required: 1, preferred: true, status: 'meets' });
  });

  it('is fast enough for a phone', () => {
    const t = performance.now();
    for (const c of CASES) matchCv(c.good, c.ad, 24, NOW);
    expect((performance.now() - t) / CASES.length).toBeLessThan(60);
  });
});
