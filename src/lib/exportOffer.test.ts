import { describe, expect, it, vi } from 'vitest';
import { offerAfterExport } from './exportOffer';

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
