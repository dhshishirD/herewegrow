import { describe, expect, it, vi } from 'vitest';
import { goToPayment } from './paymentStart';

describe('goToPayment', () => {
  it('fires payment_start once with the product, then redirects', () => {
    const order: string[] = [];
    const track = vi.fn(() => void order.push('track'));
    const assign = vi.fn(() => void order.push('assign'));
    goToPayment('https://pay.example/inv/1', 'pro-7', { track, assign });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('payment_start', { product: 'pro-7' });
    expect(assign).toHaveBeenCalledWith('https://pay.example/inv/1');
    expect(order).toEqual(['track', 'assign']);
  });
});
