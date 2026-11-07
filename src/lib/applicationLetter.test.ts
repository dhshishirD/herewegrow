import { describe, expect, it } from 'vitest';
import { buildLetter, emptyLetter, missingFields } from './applicationLetter';

const base = { ...emptyLetter('bn'), name: 'রহিম উদ্দিন', phone: '01700000000', post: 'সহকারী শিক্ষক', org: 'ঢাকা স্কুল', education: 'বিএ (সম্মান), ইংরেজি' };

describe('buildLetter', () => {
  it('writes a Bangla government letter with the formal closing', () => {
    const t = buildLetter({ ...base, kind: 'govt' });
    expect(t).toContain('বিষয়: "সহকারী শিক্ষক" পদে আবেদন।');
    expect(t).toContain('বিনীত নিবেদক,');
    expect(t).toContain('বিএ (সম্মান), ইংরেজি');
    expect(t).toContain('মোবাইল: 01700000000');
  });
  it('writes an English private letter and skips empty parts', () => {
    const t = buildLetter({ ...base, lang: 'en', kind: 'private', post: 'Officer', org: 'ABC Ltd', source: 'BDJobs' });
    expect(t).toContain('Subject: Application for the post of Officer');
    expect(t).toContain('advertised in BDJobs');
    expect(t).not.toContain('What I bring');
    expect(t).not.toContain('undefined');
  });
  it('lists missing required fields', () => {
    expect(missingFields(emptyLetter('en'))).toEqual(['name', 'post', 'org']);
    expect(missingFields(base)).toEqual([]);
  });
});
