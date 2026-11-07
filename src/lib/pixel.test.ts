import { describe, expect, it } from 'vitest';
import { pixelName } from './pixel';
import { applyOptOutParam } from './track';

describe('pixelName', () => {
  it('maps our events to Meta standard events', () => {
    expect(pixelName('checkout_click')).toEqual({ standard: true, name: 'InitiateCheckout' });
    expect(pixelName('view_template')).toEqual({ standard: true, name: 'ViewContent' });
  });
  it('sends other events as PascalCase custom events', () => {
    expect(pixelName('builder_start')).toEqual({ standard: false, name: 'BuilderStart' });
    expect(pixelName('paywall_view')).toEqual({ standard: false, name: 'PaywallView' });
  });
});

describe('applyOptOutParam', () => {
  const store = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  };
  it('?notrack=1 turns counting off and it sticks', () => {
    const s = store();
    expect(applyOptOutParam('?notrack=1', s)).toBe(true);
    expect(applyOptOutParam('', s)).toBe(true);
  });
  it('?notrack=0 turns it back on', () => {
    const s = store();
    applyOptOutParam('?notrack=1', s);
    expect(applyOptOutParam('?notrack=0', s)).toBe(false);
    expect(applyOptOutParam('', s)).toBe(false);
  });
  it('does nothing without the parameter or storage', () => {
    expect(applyOptOutParam('?utm_source=fb', store())).toBe(false);
    expect(applyOptOutParam('?notrack=1', null)).toBe(false);
  });
});
