import { describe, expect, it } from 'vitest';
import { addSkill, copyTitle, guessJobTitle } from './tailor';

describe('addSkill', () => {
  it('appends with a comma and skips duplicates in any case', () => {
    expect(addSkill('Excel, SQL', 'Power BI')).toBe('Excel, SQL, Power BI');
    expect(addSkill('Excel, SQL', 'excel')).toBe('Excel, SQL');
  });
  it('starts the list when empty and keeps one-per-line style', () => {
    expect(addSkill('', 'Excel')).toBe('Excel');
    expect(addSkill('Excel\nSQL', 'Tally')).toBe('Excel\nSQL\nTally');
  });
  it('does not double a trailing comma and ignores blanks', () => {
    expect(addSkill('Excel,', 'SQL')).toBe('Excel, SQL');
    expect(addSkill('Excel', '  ')).toBe('Excel');
  });
});

describe('guessJobTitle and copyTitle', () => {
  it('takes the first real line of the ad, trimmed and capped', () => {
    expect(guessJobTitle('\n  - Senior Accounts Officer\nRequirements: Excel')).toBe('Senior Accounts Officer');
    expect(guessJobTitle('')).toBe('');
    expect(guessJobTitle('x'.repeat(200)).length).toBe(50);
  });
  it('names the copy with the job and the person', () => {
    expect(copyTitle('Accounts Officer', 'Rakib Hossain')).toBe('For: Accounts Officer · Rakib Hossain');
    expect(copyTitle('', 'Rakib')).toBe('Job copy · Rakib');
    expect(copyTitle('a'.repeat(200), 'b').length).toBeLessThanOrEqual(80);
  });
});
