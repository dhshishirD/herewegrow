import { describe, expect, it, vi } from 'vitest';
import { featuredPlan, offerAfterExport } from './exportOffer';

const run = (over: Partial<Parameters<typeof offerAfterExport>[0]> = {}) => {
  const track = vi.fn();
  const open = vi.fn();
  const shown = offerAfterExport({ pro: false, clientId: null, format: 'pdf', alreadyOpen: false, track, open, ...over });
  return { track, open, shown };
};

describe('offerAfterExport', () => {
  it('opens the sheet and fires paywall_view once for a free export', () => {
    const { track, open, shown } = run({ format: 'docx' });
    expect(shown).toBe(true);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('paywall_view', { source: 'export', format: 'docx' });
    expect(open).toHaveBeenCalledTimes(1);
  });
  it('does nothing for a Pro user', () => {
    const { track, open, shown } = run({ pro: true });
    expect([shown, track.mock.calls.length, open.mock.calls.length]).toEqual([false, 0, 0]);
  });
  it('does nothing for a partner client export', () => {
    const { track, open, shown } = run({ clientId: 'c1' });
    expect([shown, track.mock.calls.length, open.mock.calls.length]).toEqual([false, 0, 0]);
  });
  it('does nothing when the sheet is already open (double tap)', () => {
    const { track, open, shown } = run({ alreadyOpen: true });
    expect([shown, track.mock.calls.length, open.mock.calls.length]).toEqual([false, 0, 0]);
  });
});


describe('featuredPlan', () => {
  it('highlights the plan named in the URL, else pro-30', () => {
    expect(featuredPlan('?plan=pro-7&from=export')).toBe('pro-7');
    expect(featuredPlan('?plan=bogus')).toBe('pro-30');
    expect(featuredPlan('')).toBe('pro-30');
  });
});

import { runExport } from './exportOffer';

describe('runExport', () => {
  it('offers only after the print step has finished', async () => {
    const order: string[] = [];
    let release!: () => void;
    const print = () => new Promise<void>((res) => { release = () => { order.push('printed'); res(); }; });
    const p = runExport(print, () => order.push('offer'));
    expect(order).toEqual([]);
    release();
    await p;
    expect(order).toEqual(['printed', 'offer']);
  });
  it('does not offer when the caller opts out (free user who just declined the Pro upsell)', async () => {
    const offer = vi.fn();
    await runExport(async () => {}, null);
    await runExport(async () => {}, undefined);
    expect(offer).not.toHaveBeenCalled();
  });
  it('still offers when printing falls back or throws nothing', async () => {
    const offer = vi.fn();
    await runExport(async () => {}, offer);
    expect(offer).toHaveBeenCalledTimes(1);
  });
});
