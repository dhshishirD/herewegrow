import { describe, expect, it } from 'vitest';
import { routeSeo } from './seo';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES, TEMPLATES_LASTMOD } from './templates';
import { canonicalPathFor, isRetired, isVariant, shouldIndex } from './templateTiers';
import { seoPagePaths, sitemapXml } from '../scripts/seo';

const xml = sitemapXml();
const entries = [...xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));
const SITE = 'https://herewegrow.pro';

describe('/templates hub metadata', () => {
  const { title, description } = routeSeo('/templates')!;
  it('keeps the title within 60 characters and leads with the search phrase', () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('CV Template');
    expect(title).toContain('Word');
    // "CV format" belongs to the /cv-format-bd pillar, so the hub must not compete for it.
    expect(title).not.toMatch(/cv format|সিভি ফরম্যাট/i);
    expect(title).not.toMatch(/free|ফ্রি/i);
  });
  it('has a description of at most 155 characters with Word, ATS, price and bKash/Nagad', () => {
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description).toContain('Word');
    expect(description).toContain('ATS-ফ্রেন্ডলি');
    expect(description).toContain(`৳${String(SINGLE_TEMPLATE_PRICE).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])}`);
    expect(description).toMatch(/bKash/);
    expect(description).toMatch(/Nagad/);
  });
});

describe('sitemap.xml', () => {
  it('lists every URL once, on https://herewegrow.pro', () => {
    expect(entries.length).toBeGreaterThan(80);
    const locs = entries.map((e) => e.loc);
    expect(new Set(locs).size).toBe(locs.length);
    for (const l of locs) expect(l.startsWith(`${SITE}/`)).toBe(true);
  });
  it('leaves blog and careers to their own sitemaps', () => {
    for (const e of entries) expect(e.loc, e.loc).not.toMatch(/^https:\/\/herewegrow\.pro\/(blog|careers)(\/|$)/);
  });
  it('has no noindex template, variant, retired page or page that points its canonical elsewhere', () => {
    const locs = new Set(entries.map((e) => e.loc));
    for (const t of TEMPLATES) {
      const loc = `${SITE}/templates/${t.id}`;
      const allowed = !isRetired(t.id) && shouldIndex(t) && !(isVariant(t.id) && canonicalPathFor(t.id) !== `/templates/${t.id}`) && !(isVariant(t.id) && t.lib);
      if (!allowed) expect(locs.has(loc), loc).toBe(false);
    }
  });
  it('never uses the build date as lastmod', () => {
    const today = new Date().toISOString().slice(0, 10);
    const dated = entries.filter((e) => e.lastmod);
    expect(dated.length).toBeGreaterThan(80);
    // A date that equals the build day is allowed only when it is the hand-set constant.
    if (today !== TEMPLATES_LASTMOD) {
      for (const e of entries) expect(e.lastmod, e.loc).not.toBe(today);
    }
    for (const e of dated) expect(e.lastmod, e.loc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('gives the hub and every template page a lastmod of at least TEMPLATES_LASTMOD', () => {
    const hub = entries.find((e) => e.loc === `${SITE}/templates`)!;
    expect(hub.lastmod).toBe(TEMPLATES_LASTMOD);
    for (const e of entries.filter((x) => x.loc.startsWith(`${SITE}/templates/`) && !x.loc.includes('/category/'))) {
      if (TEMPLATES.some((t) => `${SITE}/templates/${t.id}` === e.loc)) expect(e.lastmod! >= TEMPLATES_LASTMOD, e.loc).toBe(true);
    }
  });
  it('matches the pages the build prerenders', () => {
    expect(seoPagePaths().length).toBeGreaterThan(entries.length);
  });
});
