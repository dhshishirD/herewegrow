import { describe, expect, it, vi } from 'vitest';
import { INDEX_DESC, INDEX_TITLE, renderCareersIndex, serveCareersIndex } from './careerIndex';
import { careersSitemap, publishRole } from './careers';
import { saveRolePack, validateRolePack, type RolePack } from './rolePack';
import { samplePack } from './rolePack.fixture';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 4, 6);
const pack = (over: Record<string, unknown> = {}): RolePack => {
  const r = validateRolePack(samplePack(over));
  if (!r.ok) throw new Error(r.errors.join('; '));
  return r.pack;
};
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);

const roles = [
  { slug: 'bank-officer', title_en: 'Bank Officer', title_bn: 'ব্যাংক অফিসার', field: 'Banking', summary: 'Entry route into banks.' },
  { slug: 'teacher', title_en: 'Teacher', title_bn: null, field: 'Teaching', summary: null },
  { slug: 'ngo-officer', title_en: 'NGO Program Officer', title_bn: null, field: null, summary: 'Runs projects.' },
];

describe('renderCareersIndex', () => {
  const html = renderCareersIndex(roles);

  it('has a short title and description, canonical and Open Graph tags', () => {
    expect(INDEX_TITLE.length).toBeLessThanOrEqual(60);
    expect(INDEX_DESC.length).toBeLessThanOrEqual(155);
    expect(html).toContain(`<title>${INDEX_TITLE}</title>`);
    expect(html).toContain('<link rel="canonical" href="https://herewegrow.pro/careers" />');
    expect(html).toContain('<meta property="og:url" content="https://herewegrow.pro/careers" />');
    expect(html).not.toContain('noindex');
    expect(html.match(/<h1>/g)).toHaveLength(1);
  });

  it('links to every role with a crawlable href and groups them by field', () => {
    for (const r of roles) expect(html).toContain(`href="/careers/${r.slug}"`);
    expect(html).toContain('<h2>Banking</h2>');
    expect(html).toContain('<h2>Teaching</h2>');
    expect(html).toContain('<h2>Other</h2>');
    expect(html).toContain('ব্যাংক অফিসার');
    expect(html.indexOf('<h2>Other</h2>')).toBeGreaterThan(html.indexOf('<h2>Teaching</h2>'));
  });

  it('has ItemList and BreadcrumbList JSON-LD listing each role', () => {
    const ld = jsonLd(html);
    expect(ld.map((d) => d['@type'])).toEqual(expect.arrayContaining(['BreadcrumbList', 'ItemList']));
    const list = ld.find((d) => d['@type'] === 'ItemList') as { numberOfItems: number; itemListElement: { url: string }[] };
    expect(list.numberOfItems).toBe(3);
    expect(list.itemListElement.map((i) => i.url)).toContain('https://herewegrow.pro/careers/teacher');
  });

  it('offers field filter chips only when there is more than one field', () => {
    expect(html).toContain('class="chips"');
    expect(renderCareersIndex([roles[0]])).not.toContain('class="chips"');
  });

  it('escapes role text and cannot be broken out of via JSON-LD', () => {
    const evil = renderCareersIndex([{ ...roles[0], title_en: 'A</title><script>alert(1)</script>', summary: '<img src=x onerror=alert(2)>' }]);
    expect(evil).not.toContain('<script>alert');
    expect(evil).not.toContain('<img src=x');
    expect(evil.match(/<script/g)!.length).toBe(jsonLd(evil).length);
  });

  it('is noindex, with no ItemList, while there are no published roles', () => {
    const empty = renderCareersIndex([]);
    expect(empty).toContain('<meta name="robots" content="noindex" />');
    expect(jsonLd(empty).map((d) => d['@type'])).toEqual(['BreadcrumbList']);
    expect(empty).toContain('href="/guides"');
  });
});

describe('serveCareersIndex', () => {
  it('lists published roles only, as cacheable HTML', async () => {
    const db = fakeD1();
    const kv = fakeKV();
    const a = await saveRolePack(db, pack(), NOW);
    await saveRolePack(db, pack({ slug: 'teacher', title_en: 'Teacher' }), NOW);
    await publishRole({ DB: db, KV: kv }, a.id, NOW);
    const res = await serveCareersIndex({ DB: db });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(res.headers.get('Cache-Control')).toMatch(/public/);
    const html = await res.text();
    expect(html).toContain('href="/careers/bank-officer"');
    expect(html).not.toContain('/careers/teacher');
  });

  it('answers 503 (not a crash) and logs when the database read fails', async () => {
    const broken = {
      prepare: () => {
        throw new Error('D1_ERROR: no such table: roles');
      },
      batch: async () => [],
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await serveCareersIndex({ DB: broken });
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.text()).toContain('noindex');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('still answers (noindex page) with no database', async () => {
    const res = await serveCareersIndex({});
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('noindex');
  });
});

describe('careers sitemap and the index', () => {
  it('lists /careers once a role is published, with the latest lastmod', async () => {
    const db = fakeD1();
    const a = await saveRolePack(db, pack(), NOW);
    await publishRole({ DB: db, KV: fakeKV() }, a.id, NOW);
    const xml = await (await careersSitemap({ DB: db })).text();
    expect(xml).toContain('<loc>https://herewegrow.pro/careers</loc><lastmod>2026-11-04</lastmod>');
    expect(xml).toContain('<loc>https://herewegrow.pro/careers/bank-officer</loc>');
  });

  it('leaves /careers out while nothing is published', async () => {
    const db = fakeD1();
    await saveRolePack(db, pack(), NOW);
    expect(await (await careersSitemap({ DB: db })).text()).not.toContain('<loc>');
  });
});
