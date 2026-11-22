import { describe, expect, it } from 'vitest';
import { CV_FORMAT_BLOCKS, CV_FORMAT_FAQ, CV_FORMAT_LINKS, CV_FORMAT_PATH, CV_FORMAT_SEO, CV_FORMAT_UPDATED } from './cvFormatPage';
import { cvFormatPage } from './cvFormatHtml';
import { routeSeo } from './seo';
import { seoPagePaths, sitemapXml } from '../scripts/seo';
import { TEMPLATES } from './templates';
import { GUIDES } from './guides';

const page = cvFormatPage();
const text = page.body.replace(/<[^>]+>/g, ' ');
const words = text.split(/\s+/).filter(Boolean).length;

describe('/cv-format-bd pillar page', () => {
  it('has a title of at most 60 and a description of 70-155 characters with the search phrases', () => {
    expect(CV_FORMAT_SEO.title.length).toBeLessThanOrEqual(60);
    expect(CV_FORMAT_SEO.description.length).toBeLessThanOrEqual(155);
    expect(CV_FORMAT_SEO.description.length).toBeGreaterThanOrEqual(70);
    expect(CV_FORMAT_SEO.title).toContain('CV Format');
    expect(CV_FORMAT_SEO.h1).toContain('CV Format');
    expect(page.body).toContain('Curriculum vitae format');
    expect(text).toMatch(/ATS/);
    expect(text).toMatch(/Word/);
    expect(text).toMatch(/PDF/);
  });
  it('has enough real content, one h1 and several h2', () => {
    expect(words).toBeGreaterThanOrEqual(1000);
    expect((page.body.match(/<h1>/g) ?? []).length).toBe(1);
    expect((page.body.match(/<h2>/g) ?? []).length).toBeGreaterThanOrEqual(12);
    expect(page.body).not.toMatch(/undefined|NaN|\[object/);
    expect(CV_FORMAT_FAQ.length).toBeGreaterThanOrEqual(5);
    expect(new Set(CV_FORMAT_BLOCKS.map((b) => b.id)).size).toBe(CV_FORMAT_BLOCKS.length);
  });
  it('uses WebPage and BreadcrumbList JSON-LD only', () => {
    expect(page.jsonLd.map((x) => (x as { '@type': string })['@type'])).toEqual(['WebPage', 'BreadcrumbList']);
    expect(JSON.stringify(page.jsonLd)).not.toMatch(/FAQPage|aggregateRating/);
  });
  it('links only to pages that exist', () => {
    const known = new Set([...seoPagePaths(), ...TEMPLATES.map((t) => `/templates/${t.id}`), ...GUIDES.map((g) => `/guides/${g.slug}`)]);
    for (const l of CV_FORMAT_LINKS) expect(known.has(l.href), l.href).toBe(true);
    for (const m of page.body.matchAll(/href="(\/[^"#?]*)"/g)) expect(known.has(m[1]), m[1]).toBe(true);
  });
  it('is in the sitemap once with the content date, and the hub does not compete for "CV format"', () => {
    const xml = sitemapXml();
    const hits = xml.match(new RegExp(`<loc>https://herewegrow.pro${CV_FORMAT_PATH}</loc><lastmod>${CV_FORMAT_UPDATED}</lastmod>`, 'g')) ?? [];
    expect(hits.length).toBe(1);
    expect(routeSeo('/templates')!.title).not.toMatch(/cv format|সিভি ফরম্যাট/i);
  });
  it('is linked from every indexable template page and from the hub', async () => {
    const { templateGuide } = await import('./templateCopy');
    const t = TEMPLATES.find((x) => x.id === 'hwg-cv-designed-fresher-cv')!;
    expect(templateGuide(t).more.some((l) => l.href === CV_FORMAT_PATH)).toBe(true);
  });
});
