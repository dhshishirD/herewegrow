import { describe, expect, it } from 'vitest';
import { createReadTracker, ctaKindOf, ctaPosOf, markOf } from './blogTrack';

describe('ctaKindOf', () => {
  it('names tool, template and WhatsApp links', () => {
    expect(ctaKindOf('/builder')).toBe('builder');
    expect(ctaKindOf('/builder?template=x')).toBe('builder');
    expect(ctaKindOf('/tools/cv-checker')).toBe('cv_checker');
    expect(ctaKindOf('/templates/cv-1')).toBe('templates');
    expect(ctaKindOf('https://wa.me/8801700000000?text=Hi')).toBe('whatsapp');
    expect(ctaKindOf('https://herewegrow.pro/builder')).toBe('builder');
    expect(ctaKindOf('/services')).toBe('other');
  });
  it('ignores other posts and outside sites', () => {
    expect(ctaKindOf('/blog/another-post')).toBeNull();
    expect(ctaKindOf('https://example.com/builder')).toBeNull();
    expect(ctaKindOf('')).toBe('other');
  });
});

describe('ctaPosOf and markOf', () => {
  it('splits the article in thirds', () => {
    expect([ctaPosOf(0.1), ctaPosOf(0.5), ctaPosOf(0.9)]).toEqual(['top', 'middle', 'end']);
  });
  it('rounds scroll down to the mark reached; 98 % is the end', () => {
    expect([markOf(0), markOf(24), markOf(25), markOf(60), markOf(80), markOf(97), markOf(98)]).toEqual([0, 0, 25, 50, 75, 75, 100]);
  });
});

describe('createReadTracker', () => {
  const make = () => {
    let t = 0;
    const sent: unknown[] = [];
    const rt = createReadTracker({ slug: 'p', now: () => t, send: (m) => sent.push(m) });
    return { rt, sent, at: (ms: number) => void (t = ms) };
  };
  it('sends one exit with the furthest mark and visible seconds', () => {
    const { rt, sent, at } = make();
    rt.show();
    rt.scroll(30);
    at(20_000);
    rt.scroll(65);
    rt.scroll(40); // going back up does not lower it
    at(45_000);
    rt.finish();
    rt.finish();
    expect(sent).toEqual([{ s: 'p', sc: 50, t: 45 }]);
  });
  it('does not count time while the tab is hidden', () => {
    const { rt, sent, at } = make();
    rt.show();
    at(10_000);
    rt.hide();
    at(500_000);
    rt.show();
    at(505_000);
    rt.finish();
    expect(sent).toEqual([{ s: 'p', sc: 0, t: 15 }]);
  });
  it('caps seconds at 600', () => {
    const { rt, sent, at } = make();
    rt.show();
    at(5_000_000);
    rt.finish();
    expect(sent).toEqual([{ s: 'p', sc: 0, t: 600 }]);
  });
});
