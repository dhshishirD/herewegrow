import { describe, expect, it } from 'vitest';
import { hashPage, readLastmod, resolveLastmod } from './lastmod';
import { pages } from './seo';

const page = (over: object = {}) => ({ path: '/x', title: 'T', description: 'D', body: '<p>a</p>', ...over });

describe('sitemap lastmod', () => {
  it('uses the first-published day the first time a page is seen, else today', () => {
    const r = resolveLastmod({}, [page({ firstDate: '2026-11-02' }), page({ path: '/y' })], '2026-11-12');
    expect(r.dates).toEqual({ '/x': '2026-11-02', '/y': '2026-11-12' });
  });
  it('keeps the old date while the content is the same', () => {
    const prev = { '/x': { h: hashPage(page()), d: '2026-11-02' } };
    expect(resolveLastmod(prev, [page()], '2026-12-01').dates['/x']).toBe('2026-11-02');
  });
  it('moves the date to today when the title, description, text or data change', () => {
    const prev = { '/x': { h: hashPage(page()), d: '2026-11-02' } };
    for (const change of [{ title: 'T2' }, { description: 'D2' }, { body: '<p>b</p>' }, { jsonLd: [{ a: 1 }] }, { noindex: true }]) {
      expect(resolveLastmod(prev, [page(change)], '2026-12-01').dates['/x'], JSON.stringify(change)).toBe('2026-12-01');
    }
  });
  it('drops pages that no longer exist', () => {
    const prev = { '/gone': { h: 'x', d: '2026-11-02' } };
    expect(Object.keys(resolveLastmod(prev, [page()], '2026-12-01').file)).toEqual(['/x']);
  });
  // Fails when a page changed but shared/lastmod.json was not refreshed and committed.
  it('has an up-to-date shared/lastmod.json (run `npm run build` and commit it)', () => {
    const saved = readLastmod();
    const current = pages();
    const stale = current.filter((p) => saved[p.path]?.h !== hashPage(p)).map((p) => p.path);
    expect(stale).toEqual([]);
    expect(Object.keys(saved).sort()).toEqual(current.map((p) => p.path).sort());
  });
});
