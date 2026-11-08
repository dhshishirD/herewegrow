import { describe, expect, it } from 'vitest';
import { adAge, adDegree, adYears, cvDegree, cvYears, levelsIn } from './jobRequirements';

const NOW = new Date('2026-11-08');

describe('adYears', () => {
  it('reads the common ways of asking', () => {
    expect(adYears('At least 4 years of experience in sales')?.years).toBe(4);
    expect(adYears('Minimum 3-5 years experience')?.years).toBe(3);
    expect(adYears('2+ years of experience with React')?.years).toBe(2);
    expect(adYears('ন্যূনতম ৫ বছরের কাজের অভিজ্ঞতা')?.years).toBe(5);
    expect(adYears('Freshers can apply')).toBeNull();
  });
  it('does not mistake an age range for experience', () => {
    expect(adYears('Age 28 to 35 years. Strong negotiation skills.')).toBeNull();
    expect(adYears('Age: 25-30 years. Experience in sales preferred.')).toBeNull();
  });
  it('flags preferred experience', () => {
    expect(adYears('1 year of experience will be preferred')?.preferred).toBe(true);
    expect(adYears('3 years of experience required')?.preferred).toBe(false);
  });
});

describe('degrees', () => {
  it('maps degrees to levels in English and Bangla', () => {
    expect(levelsIn('MBA')).toEqual([4]);
    expect(levelsIn('BSc in CSE')).toEqual([3]);
    expect(levelsIn('এইচএসসি পাস')).toEqual([2]);
    expect(levelsIn('স্নাতকোত্তর')).toEqual([4]);
    expect(levelsIn('স্নাতক পাস')).toEqual([3]);
  });
  it('asks for the lowest level when several are listed', () => {
    expect(adDegree('Education: Bachelor/Master in HRM')).toBe(3);
    expect(adDegree('Educational Requirements: MBA in Marketing or equivalent.')).toBe(4);
    expect(adDegree('No degree needed. Just attitude.')).toBeNull();
  });
  it('takes the highest degree on the CV', () => {
    expect(cvDegree('BBA, 2020\nMBA, 2022')).toBe(4);
    expect(cvDegree('Skills: Excel')).toBeNull();
  });
});

describe('cvYears', () => {
  it('adds up date ranges and skips the education section', () => {
    const cv = 'Work Experience\nAnalyst, ABC\nJan 2020 – Dec 2022\nSenior Analyst, XYZ\n2023 – Present\nEducation\nBBA, DU\n2015 – 2019';
    const r = cvYears(cv, NOW);
    expect(r.estimated).toBe(true);
    expect(r.years).toBeGreaterThan(6);
    expect(r.years).toBeLessThan(7.5);
  });
  it('does not double count overlapping jobs', () => {
    expect(cvYears('Experience\nA\n2020 – 2022\nB\n2021 – 2023', NOW).years).toBeLessThan(5);
  });
  it('prefers a stated number when it is larger', () => {
    expect(cvYears('Sales officer with 8 years of experience.\nExperience\n2022 – 2023', NOW)).toEqual({ years: 8, estimated: false });
  });
  it('reads Bangla digits and wording', () => {
    expect(cvYears('আমি ২ বছর কাজ করেছি', NOW).years).toBe(2);
  });
  it('returns 0 when it cannot tell', () => {
    expect(cvYears('Fresh graduate. Skills: Excel', NOW).years).toBe(0);
  });
});

describe('adAge', () => {
  it('reads an age range or a maximum', () => {
    expect(adAge('Age 28 to 35 years')).toEqual({ min: 28, max: 35 });
    expect(adAge('Maximum age 30 years.')).toEqual({ min: null, max: 30 });
    expect(adAge('বয়স ২২ থেকে ৩০ বছর')).toEqual({ min: 22, max: 30 });
    expect(adAge('No age limit')).toBeNull();
  });
});
