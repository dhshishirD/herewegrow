import { describe, expect, it } from 'vitest';
import { renderRolePage } from './careerPage';
import { careersSitemap, publishRole, serveCareerPage, unpublishRole } from './careers';
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

describe('renderRolePage', () => {
  const html = renderRolePage(pack(), NOW);

  it('has title, description, canonical and Open Graph tags', () => {
    expect(html).toContain('<title>Bank Officer in Bangladesh: salary, skills, growth</title>');
    expect(html).toContain('<meta name="description" content="Salary, hiring banks, skills and a 3-year plan for bank officers." />');
    expect(html).toContain('<link rel="canonical" href="https://herewegrow.pro/careers/bank-officer" />');
    expect(html).toContain('<meta property="og:url" content="https://herewegrow.pro/careers/bank-officer" />');
    expect(html).toContain('<html lang="en">');
  });

  it('shows the free content', () => {
    expect(html).toContain('Bank Officer');
    expect(html).toContain('ব্যাংক অফিসার');
    expect(html).toContain('25,000-35,000');
    expect(html).toContain('Sonali Bank');
    expect(html).toContain('Festival bonus');
    expect(html).toContain('Circulars cluster in Jan-Mar');
    expect(html).toContain('<h2>Overview</h2>');
    expect(html).toContain('href="https://10minuteschool.com/x"');
    expect(html).toContain('Last checked 2026-11-04');
  });

  it('keeps every Pro item out of the public page', () => {
    for (const secret of ['Learn core banking', 'Credit analysis', 'Team lead track', 'Finish Excel course', 'Dear Sir', 'Why banking?', 'Lead with numbers.']) {
      expect(html).not.toContain(secret);
    }
    expect(html).toContain('href="/pro"');
  });

  it('carries valid Article, FAQPage and BreadcrumbList JSON-LD', () => {
    const types = jsonLd(html).map((d) => d['@type']);
    expect(types).toEqual(expect.arrayContaining(['Article', 'FAQPage', 'BreadcrumbList']));
    const faq = jsonLd(html).find((d) => d['@type'] === 'FAQPage') as { mainEntity: { name: string }[] };
    expect(faq.mainEntity[0].name).toBe('Is a banking degree needed?');
  });

  it('omits FAQPage when there are no questions', () => {
    const types = jsonLd(renderRolePage(pack({ faq: [] }), NOW)).map((d) => d['@type']);
    expect(types).not.toContain('FAQPage');
  });

  it('escapes text fields and cannot be broken out of via JSON-LD', () => {
    const evil = renderRolePage(pack({ title_en: 'A</title><script>alert(1)</script>', summary: 'x</script><script>alert(2)</script>' }), NOW);
    expect(evil).not.toContain('<script>alert');
    expect(evil.match(/<script/g)!.length).toBe(jsonLd(evil).length);
  });

  it('falls back to a generated title and description without SEO fields', () => {
    const plain = renderRolePage(pack({ seo_title: undefined, seo_desc: undefined }), NOW);
    expect(plain).toContain('<title>Bank Officer in Bangladesh | HereWeGrow</title>');
    expect(plain).toMatch(/<meta name="description" content="[^"]+" \/>/);
  });
});

describe('publish and unpublish', () => {
  const setup = async () => {
    const db = fakeD1();
    const kv = fakeKV();
    const { id } = await saveRolePack(db, pack(), NOW);
    return { env: { DB: db, KV: kv }, db, kv, id };
  };

  it('publish marks the role published and stores the snapshot', async () => {
    const { env, db, kv, id } = await setup();
    expect(await publishRole(env, id, NOW + 1)).toEqual({ ok: true, slug: 'bank-officer' });
    expect(await db.prepare('SELECT status, published_at FROM roles WHERE id = ?').bind(id).first()).toEqual({ status: 'published', published_at: NOW + 1 });
    expect(kv.store.get('career:bank-officer')).toContain('Bank Officer');
  });

  it('publishing again keeps the first published_at but refreshes the snapshot', async () => {
    const { env, db, kv, id } = await setup();
    await publishRole(env, id, NOW + 1);
    await db.prepare("UPDATE roles SET pack_json = ? WHERE id = ?").bind(JSON.stringify(pack({ summary: 'Updated summary' })), id).run();
    await publishRole(env, id, NOW + 9);
    expect((await db.prepare('SELECT published_at FROM roles WHERE id = ?').bind(id).first<{ published_at: number }>())!.published_at).toBe(NOW + 1);
    expect(kv.store.get('career:bank-officer')).toContain('Updated summary');
  });

  it('unpublish returns the role to draft and removes the snapshot', async () => {
    const { env, db, kv, id } = await setup();
    await publishRole(env, id, NOW);
    expect(await unpublishRole(env, id)).toEqual({ ok: true, slug: 'bank-officer' });
    expect((await db.prepare('SELECT status FROM roles WHERE id = ?').bind(id).first<{ status: string }>())!.status).toBe('draft');
    expect(kv.store.has('career:bank-officer')).toBe(false);
  });

  it('unknown role ids are not found', async () => {
    const { env } = await setup();
    expect(await publishRole(env, 'nope', NOW)).toEqual({ ok: false, error: 'not_found' });
    expect(await unpublishRole(env, 'nope')).toEqual({ ok: false, error: 'not_found' });
  });
});

describe('serveCareerPage', () => {
  it('serves the snapshot of a published role as cacheable HTML', async () => {
    const db = fakeD1();
    const kv = fakeKV();
    const { id } = await saveRolePack(db, pack(), NOW);
    await publishRole({ DB: db, KV: kv }, id, NOW);
    const res = (await serveCareerPage({ KV: kv }, '/careers/bank-officer'))!;
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(res.headers.get('Cache-Control')).toMatch(/public/);
    expect(await res.text()).toContain('<title>Bank Officer');
    expect(await serveCareerPage({ KV: kv }, '/careers/bank-officer/')).not.toBeNull();
  });

  it('returns null for drafts, unknown slugs and paths that are not a role page', async () => {
    const kv = fakeKV();
    expect(await serveCareerPage({ KV: kv }, '/careers/bank-officer')).toBeNull();
    expect(await serveCareerPage({ KV: kv }, '/careers')).toBeNull();
    expect(await serveCareerPage({ KV: kv }, '/careers/bank-officer/test')).toBeNull();
    expect(await serveCareerPage({ KV: kv }, '/careers/Bad Slug')).toBeNull();
    expect(await serveCareerPage({}, '/careers/bank-officer')).toBeNull();
  });
});

describe('careersSitemap', () => {
  it('lists only published roles with a lastmod date', async () => {
    const db = fakeD1();
    const kv = fakeKV();
    const a = await saveRolePack(db, pack(), NOW);
    await saveRolePack(db, pack({ slug: 'teacher', title_en: 'Teacher' }), NOW);
    await publishRole({ DB: db, KV: kv }, a.id, NOW);
    const res = await careersSitemap({ DB: db });
    expect(res.headers.get('Content-Type')).toContain('xml');
    const xml = await res.text();
    expect(xml).toContain('<loc>https://herewegrow.pro/careers/bank-officer</loc>');
    expect(xml).toContain('<lastmod>2026-11-04</lastmod>');
    expect(xml).not.toContain('teacher');
  });

  it('is a valid empty urlset with no published roles', async () => {
    const xml = await (await careersSitemap({ DB: fakeD1() })).text();
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });
});
