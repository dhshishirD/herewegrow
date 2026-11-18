import { describe, expect, it } from 'vitest';
import { COLOURS, STYLES, needsPro } from './styles';

describe('free vs paid choices', () => {
  it('has 10 styles and 10 colours', () => {
    expect(STYLES).toHaveLength(10);
    expect(COLOURS).toHaveLength(10);
  });
  it('allows only the 2 free styles and 3 free colours', () => {
    expect(needsPro('classic-serif', 'navy')).toBe(false);
    expect(needsPro('minimal-clean', 'charcoal')).toBe(false);
    expect(needsPro('timeline', 'navy')).toBe(true);
    expect(needsPro('classic-serif', 'plum')).toBe(true);
  });
});
