import { describe, expect, it } from 'vitest';
import { DAY_MS } from '../shared/plans';
import { userForPhone } from './auth';
import { CV_LIMIT, MAX_CV_BYTES, createCv, deleteCv, getCv, listCvs, updateCv } from './cvs';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 3, 6);
const body = (name = 'Nusrat', title = 'Bank CV') => ({ title, state: { data: { name }, design: 'classic', accent: '#0e3b2e' } });

const setup = async () => {
  const db = fakeD1();
  const free = await userForPhone(db, '01712345678', 'bn', NOW);
  const other = await userForPhone(db, '01812345678', 'bn', NOW);
  const pro = { ...free, proUntil: NOW + 7 * DAY_MS };
  return { db, free, other, pro };
};

describe('saved CVs', () => {
  it('a free account keeps one CV; a second one hits the limit', async () => {
    const { db, free } = await setup();
    const a = await createCv(db, free, body(), NOW);
    expect(a).toHaveProperty('id');
    expect(await createCv(db, free, body('Second'), NOW)).toBe('limit');
    expect(await listCvs(db, free.id)).toHaveLength(1);
  });

  it('Pro keeps up to 20, and nothing is lost when Pro ends', async () => {
    const { db, free, pro } = await setup();
    for (let i = 0; i < CV_LIMIT.pro; i++) expect(await createCv(db, pro, body(`CV ${i}`), NOW + i)).toHaveProperty('id');
    expect(await createCv(db, pro, body('21st'), NOW)).toBe('limit');
    // Pro over: all 20 stay and can still be edited, but no new ones.
    const list = await listCvs(db, free.id);
    expect(list).toHaveLength(20);
    expect(list[0].title).toBe('Bank CV');
    expect(await updateCv(db, free.id, list[0].id, body('Edited'), NOW + 99)).toEqual({ id: list[0].id });
    expect(await createCv(db, free, body(), NOW)).toBe('limit');
  });

  it('stores and returns the builder state', async () => {
    const { db, free } = await setup();
    const { id } = (await createCv(db, free, body('Nusrat', 'Main'), NOW)) as { id: string };
    await updateCv(db, free.id, id, body('Nusrat Jahan', 'Main v2'), NOW + 5);
    const cv = await getCv(db, free.id, id);
    expect(cv).toMatchObject({ id, title: 'Main v2', design: 'classic', updatedAt: NOW + 5, state: { data: { name: 'Nusrat Jahan' } } });
  });

  it('another user cannot read, change or delete it', async () => {
    const { db, free, other } = await setup();
    const { id } = (await createCv(db, free, body(), NOW)) as { id: string };
    expect(await getCv(db, other.id, id)).toBeNull();
    expect(await updateCv(db, other.id, id, body('Hacked'), NOW)).toBe('not_found');
    expect(await deleteCv(db, other.id, id)).toBe(false);
    expect(await deleteCv(db, free.id, id)).toBe(true);
    expect(await listCvs(db, free.id)).toHaveLength(0);
  });

  it('rejects bad or oversized input', async () => {
    const { db, free } = await setup();
    expect(await createCv(db, free, { state: 'x' }, NOW)).toBe('bad');
    expect(await createCv(db, free, { state: { design: 'classic' } }, NOW)).toBe('bad');
    expect(await createCv(db, free, { state: { data: { photo: 'x'.repeat(MAX_CV_BYTES) } } }, NOW)).toBe('size');
    expect(await listCvs(db, free.id)).toHaveLength(0);
  });
});
