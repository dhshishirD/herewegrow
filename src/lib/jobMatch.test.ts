import { describe, expect, it } from 'vitest';
import { matchCv, stem } from './jobMatch';

const AD = `Requirements:\nProficiency in Excel and SQL.\nExperience with Power BI dashboards.\nSkills: communication, reporting.\nApply before deadline.`;

describe('matchCv', () => {
  it('finds keywords present in the CV and lists the rest as missing', () => {
    const r = matchCv('Analyst. Built reporting dashboards in Excel and SQL.', AD);
    expect(r.found.map((k) => stem(k.term))).toEqual(expect.arrayContaining(['excel', 'sql', 'report']));
    expect(r.missing.map((k) => k.term.toLowerCase())).toEqual(expect.arrayContaining(['power bi']));
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
  });
  it('ignores filler words from the ad', () => {
    const r = matchCv('x', AD);
    expect(r.keywords.map((k) => k.term.toLowerCase())).not.toContain('apply');
    expect(r.keywords.map((k) => k.term.toLowerCase())).not.toContain('deadline');
  });
  it('matches Bangla words despite common suffixes', () => {
    const r = matchCv('আমি হিসাবরক্ষণ কাজে দক্ষ। কম্পিউটারে অভিজ্ঞ।', 'যোগ্যতা: হিসাবরক্ষণের জ্ঞান ও কম্পিউটার');
    expect(r.found.length).toBe(2);
    expect(r.missing.map((k) => k.term)).toEqual(['জ্ঞান']);
  });
  it('returns 0 for an empty ad', () => {
    expect(matchCv('anything', '').score).toBe(0);
  });
});

describe('matchCv keywords', () => {
  it('treats Power BI as one skill and drops dates and filler', () => {
    const r = matchCv('x', 'Requirements: Power BI and Excel. Apply before 30 November. Proficiency in SQL.');
    const terms = r.keywords.map((k) => k.term);
    expect(terms).toEqual(expect.arrayContaining(['Power BI', 'Excel', 'SQL']));
    expect(terms).not.toContain('November');
    expect(terms).not.toContain('before');
  });
});

describe('matchCv label words', () => {
  it('does not treat the word "skills" as a keyword', () => {
    const r = matchCv('x', 'Requirements: Excel. Skills: Tally, budgeting. Must have communication.');
    expect(r.keywords.map((k) => k.term.toLowerCase())).not.toContain('skills');
  });
});
