import { describe, expect, it, vi } from 'vitest';
import { createTracker } from './track';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

function setup(over: Partial<Parameters<typeof createTracker>[0]> = {}) {
  const sent: Record<string, unknown>[] = [];
  let t = 1_000_000;
  const deps = {
    storage: mem(),
    session: mem(),
    send: (b: object) => void sent.push(b as Record<string, unknown>),
    now: () => t,
    referrer: 'https://google.com/search',
    search: '?utm_source=fb&utm_medium=cpc&utm_campaign=spring',
    ...over,
  };
  return { tracker: createTracker(deps), sent, advance: (ms: number) => void (t += ms) };
}

describe('createTracker', () => {
  it('first pageview carries ref and utm', () => {
    const { tracker, sent } = setup();
    tracker.pageview('/services');
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      type: 'pageview', path: '/services', ref: 'https://google.com/search',
      utmSource: 'fb', utmMedium: 'cpc', utmCampaign: 'spring',
    });
    expect(sent[0].vid).toBe(tracker.vid());
    expect(sent[0].sid).toBeTruthy();
  });

  it('second pageview in the same session omits ref and utm', () => {
    const { tracker, sent, advance } = setup();
    tracker.pageview('/a');
    advance(60_000);
    tracker.pageview('/b');
    expect(sent[1].sid).toBe(sent[0].sid);
    expect(sent[1].ref).toBeUndefined();
    expect(sent[1].utmSource).toBeUndefined();
  });

  it('rolls the session after 31 minutes idle', () => {
    const { tracker, sent, advance } = setup();
    tracker.pageview('/a');
    advance(31 * 60_000);
    tracker.pageview('/b');
    expect(sent[1].sid).not.toBe(sent[0].sid);
    expect(sent[1].ref).toBe('https://google.com/search');
  });

  it('event sends meta object and calls gtag', () => {
    const gtag = vi.fn();
    const { tracker, sent } = setup({ gtag });
    tracker.event('cta_whatsapp_click', { where: 'footer' });
    expect(sent[0]).toMatchObject({ type: 'event', name: 'cta_whatsapp_click', meta: { where: 'footer' } });
    expect(gtag).toHaveBeenCalledWith('event', 'cta_whatsapp_click', { where: 'footer' });
  });

  it('sends nothing after disable()', () => {
    const { tracker, sent } = setup();
    tracker.disable();
    tracker.pageview('/a');
    tracker.event('x');
    expect(sent).toHaveLength(0);
  });

  it('works with null storage using in-memory ids', () => {
    const { tracker, sent } = setup({ storage: null, session: null });
    expect(() => tracker.pageview('/a')).not.toThrow();
    tracker.event('e');
    expect(sent).toHaveLength(2);
    expect(sent[0].vid).toBe(sent[1].vid);
    expect(sent[0].sid).toBe(sent[1].sid);
  });

  it('never throws when send throws', () => {
    const { tracker } = setup({ send: () => { throw new Error('boom'); } });
    expect(() => tracker.pageview('/a')).not.toThrow();
    expect(() => tracker.event('e')).not.toThrow();
  });
});
