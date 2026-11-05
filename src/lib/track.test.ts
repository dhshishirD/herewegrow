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
  const tracker = createTracker(deps);
  if (!over.noTrack) tracker.ready();
  return { tracker, sent, deps, advance: (ms: number) => void (t += ms) };
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

  it('event before pageview still sends ref/utm exactly once, on the first hit', () => {
    const { tracker, sent } = setup();
    tracker.event('view_service');
    tracker.pageview('/services');
    tracker.event('again');
    expect(sent[0]).toMatchObject({ type: 'event', ref: 'https://google.com/search', utmSource: 'fb' });
    expect(sent[1].ref).toBeUndefined();
    expect(sent[2].utmSource).toBeUndefined();
  });

  it('holds hits until ready, then sends the pageview first', () => {
    const { tracker, sent } = setup({ noTrack: false });
    const t2 = createTracker({ storage: mem(), session: mem(), send: (b) => void sent.push(b as Record<string, unknown>), now: () => 1, referrer: 'r', search: '' });
    t2.event('view_pro');
    t2.pageview('/pro');
    expect(sent).toHaveLength(0);
    t2.ready();
    expect(sent.map((s) => s.type)).toEqual(['pageview', 'event']);
    expect(sent[0].ref).toBe('r');
    void tracker;
  });

  it('drops queued hits when disabled before ready', () => {
    const sent: object[] = [];
    const t = createTracker({ storage: mem(), session: mem(), send: (b) => void sent.push(b), now: () => 1, referrer: '', search: '' });
    t.event('view_pro');
    t.pageview('/pro');
    t.disable();
    t.ready();
    t.event('later');
    expect(sent).toHaveLength(0);
  });

  it('caps the queue at 50', () => {
    const sent: object[] = [];
    const t = createTracker({ storage: mem(), session: mem(), send: (b) => void sent.push(b), now: () => 1, referrer: '', search: '' });
    for (let i = 0; i < 80; i++) t.event('e');
    t.ready();
    expect(sent).toHaveLength(50);
  });

  it('noTrack starts disabled', () => {
    const { tracker, sent } = setup({ noTrack: true });
    tracker.ready();
    tracker.pageview('/a');
    tracker.event('e');
    expect(sent).toHaveLength(0);
  });

  it('persists vid and sid across tracker instances', () => {
    const storage = mem();
    const session = mem();
    const a = setup({ storage, session });
    a.tracker.pageview('/a');
    const b = setup({ storage, session });
    b.tracker.pageview('/b');
    expect(b.sent[0].vid).toBe(a.sent[0].vid);
    expect(storage.getItem('hwg_vid')).toBe(a.sent[0].vid);
    expect(b.sent[0].sid).toBe(a.sent[0].sid);
    expect(b.sent[0].ref).toBeUndefined();
  });
});

describe('tracker.source', () => {
  it('prefers utm_source, else referrer host, else null', () => {
    expect(setup().tracker.source()).toBe('fb');
    expect(setup({ search: '' }).tracker.source()).toBe('google.com');
    expect(setup({ search: '', referrer: '' }).tracker.source()).toBeNull();
    expect(setup({ search: '', referrer: 'not a url' }).tracker.source()).toBeNull();
  });

  it('keeps the first-touch source after the first hit and never throws', () => {
    const { tracker } = setup();
    tracker.pageview('/a');
    tracker.pageview('/b');
    expect(tracker.source()).toBe('fb');
    const deps = { ...setup().deps };
    Object.defineProperty(deps, 'search', { get: () => { throw new Error('boom'); } });
    const broken = createTracker(deps);
    expect(() => broken.source()).not.toThrow();
    expect(broken.source()).toBeNull();
  });
});
