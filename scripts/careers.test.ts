import { describe, expect, it } from 'vitest';
import { checkRole } from '../shared/careerAdmin';
import { loadAllPacks } from './careers';

describe('content/careers role packs', () => {
  it('every pack passes the import validator and the publish checks', () => {
    const packs = loadAllPacks();
    expect(packs.length).toBeGreaterThan(0);
    for (const p of packs) expect({ slug: p.slug, problems: checkRole(p).problems }).toEqual({ slug: p.slug, problems: [] });
  });
});
