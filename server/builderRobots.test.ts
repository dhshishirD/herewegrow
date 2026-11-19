import { describe, expect, it } from 'vitest';
import { withBuilderRobots } from './builderRobots';

const run = (u: string) => withBuilderRobots(new Request(u), new Response('<html></html>'));

describe('builder tool views are noindex', () => {
  it('preset europass: noindex and canonical to the guide', () => {
    const r = run('https://herewegrow.pro/builder?preset=europass');
    expect(r.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(r.headers.get('Link')).toBe('<https://herewegrow.pro/europass-cv>; rel="canonical"');
  });
  it('template and client views are noindex without a canonical link', () => {
    for (const q of ['?template=abc', '?client=1']) {
      const r = run(`https://herewegrow.pro/builder${q}`);
      expect(r.headers.get('X-Robots-Tag')).toBe('noindex, follow');
      expect(r.headers.get('Link')).toBeNull();
    }
  });
  it('plain /builder and other pages are untouched', () => {
    expect(run('https://herewegrow.pro/builder').headers.get('X-Robots-Tag')).toBeNull();
    expect(run('https://herewegrow.pro/europass-cv?preset=europass').headers.get('X-Robots-Tag')).toBeNull();
  });
});
