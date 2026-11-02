import { describe, expect, it } from 'vitest';
import { quoteCart, tierTotal } from './cart';
import { TEMPLATES } from './templates';

const ids = TEMPLATES.map((t) => t.id);

describe('quoteCart', () => {
  it('ignores unknown and repeated ids', () => {
    const q = quoteCart([ids[0], ids[0], 'nope']);
    expect(q.ids).toEqual([ids[0]]);
    expect(q.count).toBe(1);
  });

  it('is empty for nothing valid', () => {
    expect(quoteCart(['nope']).count).toBe(0);
  });

  it('never goes down when a template is added', () => {
    let prev = 0;
    for (let n = 1; n <= Math.min(ids.length, 45); n++) {
      const total = quoteCart(ids.slice(0, n)).total;
      expect(total).toBeGreaterThanOrEqual(prev);
      prev = total;
    }
  });

  it('never charges more than the list price', () => {
    const q = quoteCart(ids.slice(0, 6));
    expect(q.total).toBeLessThanOrEqual(q.listTotal);
  });
});

describe('tierTotal', () => {
  it('is 0 for an empty cart', () => {
    expect(tierTotal(0)).toBe(0);
  });
});
