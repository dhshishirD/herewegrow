import { describe, expect, it } from 'vitest';
import { dropOff } from './funnel';

describe('dropOff', () => {
  it('is the rounded percent lost', () => {
    expect(dropOff(10, 4)).toBe(60);
    expect(dropOff(3, 3)).toBe(0);
    expect(dropOff(3, 0)).toBe(100);
  });
  it('never clamps a larger step to 0: it reports exceeds', () => {
    expect(dropOff(2, 5)).toBe('exceeds');
    expect(dropOff(0, 1)).toBe('exceeds');
  });
  it('is null when both are zero', () => {
    expect(dropOff(0, 0)).toBeNull();
  });
});
