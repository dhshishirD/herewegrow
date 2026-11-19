import { describe, expect, it } from 'vitest';
import { routeSeo } from './seo';

describe('search titles for the busiest pages', () => {
  it('home and /templates titles stay within 60 characters', () => {
    for (const p of ['/', '/templates']) expect([...routeSeo(p)!.title].length, p).toBeLessThanOrEqual(60);
  });
});
