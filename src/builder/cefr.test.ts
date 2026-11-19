import { describe, expect, it } from 'vitest';
import { CEFR_LEVELS, CEFR_LEVEL_INFO, CEFR_NOTE, CEFR_SKILLS, CEFR_SKILL_LABEL, languageLines, levelText, newLanguage, normaliseLanguage, setSameLevel, sharedLevel, usableLanguages } from './cefr';

describe('CEFR helpers', () => {
  it('lists the six levels A1 to C2 with a one-line meaning in English and Bangla', () => {
    expect([...CEFR_LEVELS]).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    for (const lv of CEFR_LEVELS) {
      expect(CEFR_LEVEL_INFO[lv].text.en.length).toBeGreaterThan(10);
      expect(CEFR_LEVEL_INFO[lv].text.en).not.toContain('\n');
      expect(CEFR_LEVEL_INFO[lv].text.bn).toBeTruthy();
    }
    expect(CEFR_LEVEL_INFO.A1.name.en).toBe('Basic user');
    expect(CEFR_LEVEL_INFO.C2.name.en).toBe('Proficient user');
  });

  it('has the five skills of the grid, labelled in both languages', () => {
    expect([...CEFR_SKILLS]).toEqual(['listening', 'reading', 'interaction', 'production', 'writing']);
    expect(CEFR_SKILL_LABEL.interaction.en).toBe('Spoken interaction');
    expect(CEFR_SKILL_LABEL.production.en).toBe('Spoken production');
    for (const s of CEFR_SKILLS) expect(CEFR_SKILL_LABEL[s].bn).toBeTruthy();
  });

  it('carries the "do not overstate" note in both languages', () => {
    expect(CEFR_NOTE.warn.en).toMatch(/Do not overstate your level/);
    expect(CEFR_NOTE.warn.bn).toBeTruthy();
  });

  it('"same level for all" sets all five skills, and reports the shared level', () => {
    const e = setSameLevel(newLanguage({ name: 'English' }), 'B2');
    for (const s of CEFR_SKILLS) expect(e[s]).toBe('B2');
    expect(sharedLevel(e)).toBe('B2');
    expect(sharedLevel({ ...e, writing: 'B1' })).toBe('');
    expect(sharedLevel(newLanguage())).toBe('');
    expect(sharedLevel(setSameLevel(e, ''))).toBe('');
  });

  it('drops unknown levels when cleaning saved data', () => {
    const e = normaliseLanguage({ name: 'French', listening: 'Z9' as never, reading: 'C1', certificate: 5 as never });
    expect(e.listening).toBe('');
    expect(e.reading).toBe('C1');
    expect(e.certificate).toBe('');
    expect(e.id).toBeTruthy();
  });

  it('puts mother tongues first and skips unnamed rows', () => {
    const list = [newLanguage({ name: 'English' }), newLanguage({ name: '  ' }), newLanguage({ name: 'Bangla', mother: true })];
    expect(usableLanguages(list).map((x) => x.name)).toEqual(['Bangla', 'English']);
  });

  it('writes the levels as text, with the certificate', () => {
    const en = { ...setSameLevel(newLanguage({ name: 'English', certificate: 'IELTS 7.0, 2024' }), 'C1'), writing: 'B2' as const };
    expect(levelText(en)).toBe('Listening C1, Reading C1, Spoken interaction C1, Spoken production C1, Writing B2');
    expect(levelText(newLanguage())).toBe('');
    const lines = languageLines([en, newLanguage({ name: 'Bangla', mother: true })]);
    expect(lines[0]).toBe('Mother tongue: Bangla');
    expect(lines[1]).toBe('English: Listening C1, Reading C1, Spoken interaction C1, Spoken production C1, Writing B2 (IELTS 7.0, 2024)');
  });
});
