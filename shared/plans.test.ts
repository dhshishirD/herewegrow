import { describe, expect, it } from 'vitest';
import { DAY_MS, PLANS, extendPro, findPlan, isProActive, templatePrice } from './plans';

const NOW = Date.UTC(2026, 10, 2);

describe('plans', () => {
  it('has the agreed prices and lengths', () => {
    expect(PLANS.map((p) => [p.id, p.price, p.days])).toEqual([
      ['pro-7', 49, 7],
      ['pro-30', 149, 30],
      ['pro-365', 499, 365],
    ]);
  });

  it('finds plans by id only', () => {
    expect(findPlan('pro-30')?.price).toBe(149);
    expect(findPlan('pro-999')).toBeUndefined();
    expect(findPlan('')).toBeUndefined();
  });
});

describe('extendPro', () => {
  it('starts from now when there is no pass', () => {
    expect(extendPro(null, 7, NOW)).toBe(NOW + 7 * DAY_MS);
  });
  it('starts from now when the pass has expired', () => {
    expect(extendPro(NOW - 5 * DAY_MS, 30, NOW)).toBe(NOW + 30 * DAY_MS);
  });
  it('stacks on top of remaining time', () => {
    expect(extendPro(NOW + 3 * DAY_MS, 7, NOW)).toBe(NOW + 10 * DAY_MS);
  });
});

describe('isProActive', () => {
  it('is false for no pass or an expired one', () => {
    expect(isProActive(null, NOW)).toBe(false);
    expect(isProActive(NOW, NOW)).toBe(false);
  });
  it('is true while time remains', () => {
    expect(isProActive(NOW + 1, NOW)).toBe(true);
  });
});

describe('templatePrice', () => {
  it('is full price without Pro', () => {
    expect(templatePrice(39, null)).toBe(39);
  });
  it('is half price (rounded up) on 7 and 30 day passes', () => {
    expect(templatePrice(39, 'pro-7')).toBe(20);
    expect(templatePrice(39, 'pro-30')).toBe(20);
  });
  it('is free on the yearly pass', () => {
    expect(templatePrice(39, 'pro-365')).toBe(0);
  });
});

describe('partner plans', () => {
  it('has the agreed prices, lengths and caps', async () => {
    const { PARTNER_PLANS } = await import('./plans');
    expect(PARTNER_PLANS.map((p) => [p.id, p.price, p.days, p.partner?.clientCap, p.partner?.brandingRemovable])).toEqual([
      ['partner-30', 299, 30, 30, false],
      ['partner-90', 699, 90, 100, true],
      ['partner-365', 1999, 365, 500, true],
    ]);
  });
  it('are found by id and never listed with Pro plans', async () => {
    const { PLANS } = await import('./plans');
    expect(findPlan('partner-30')?.price).toBe(299);
    expect(PLANS.some((p) => p.id.startsWith('partner'))).toBe(false);
  });
});
