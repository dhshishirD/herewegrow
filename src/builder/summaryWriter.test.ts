import { describe, expect, it } from 'vitest';
import { article, emptySummaryInput, joinList, summaryReady, writeSummaries } from './summaryWriter';

describe('summaryWriter', () => {
  it('writes fresher summaries from the given facts only', () => {
    const out = writeSummaries({ ...emptySummaryInput('fresher'), target: 'Marketing Executive', degree: 'BBA', major: 'Marketing', skills: 'Facebook ads, Excel, copywriting', achievement: 'ran a campaign that reached 5,000 people for a university fest' });
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0]).toContain('BBA graduate in Marketing');
    expect(out[0]).toContain('seeking a Marketing Executive role');
    expect(out[1]).toContain('Holds a BBA in Marketing.');
    expect(out[0]).toContain('Facebook ads, Excel and copywriting');
    expect(out[0]).toContain('Ran a campaign that reached 5,000 people for a university fest.');
    out.forEach((s) => expect(s).not.toMatch(/undefined|\s{2}|\.\./));
  });
  it('writes experienced summaries with years', () => {
    const out = writeSummaries({ ...emptySummaryInput('experienced'), target: 'Accountant', years: '3', skills: 'Tally, VAT returns', achievement: '' });
    expect(out[0]).toBe('Accountant with 3 years of experience in Tally and VAT returns. Seeking an Accountant role.');
  });
  it('writes career-switcher summaries', () => {
    const out = writeSummaries({ ...emptySummaryInput('switcher'), target: 'HR Officer', fromField: 'teaching', years: '4', skills: 'training, communication' });
    expect(out[0]).toContain('Teaching professional with 4 years of experience moving into HR Officer.');
  });
  it('needs a role and at least one skill', () => {
    expect(summaryReady(emptySummaryInput())).toBe(false);
    expect(writeSummaries(emptySummaryInput())).toEqual([]);
    expect(summaryReady({ ...emptySummaryInput(), target: 'Teacher', skills: 'Lesson planning' })).toBe(true);
  });
  it('picks a/an and joins lists', () => {
    expect(article('MBA')).toBe('an');
    expect(article('BBA')).toBe('a');
    expect(article('Officer')).toBe('an');
    expect(article('Teacher')).toBe('a');
    expect(joinList(['a', 'b', 'c'])).toBe('a, b and c');
  });
});
