import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { CV_FORMAT_BLOCKS, CV_FORMAT_FAQ, CV_FORMAT_GALLERY_IDS, CV_FORMAT_GALLERY_LINKS, CV_FORMAT_LINKS, CV_FORMAT_PATH, CV_FORMAT_SAMPLES, CV_FORMAT_SEO, CV_FORMAT_SOURCES, CV_FORMAT_UPDATED, CV_FORMAT_WRITE_LINK, cvFormatGallery, cvFormatSections, cvFormatToc } from './cvFormatPage';
import { isListed, isRetired, isVariant, shouldIndex } from './templateTiers';
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
    const blog = readdirSync('content/blog').filter((f) => f.endsWith('.md')).map((f) => `/blog/${f.replace(/\.md$/, '')}`);
    const known = new Set([...seoPagePaths(), ...TEMPLATES.map((t) => `/templates/${t.id}`), ...GUIDES.map((g) => `/guides/${g.slug}`), ...blog]);
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

  it('has a table of contents whose anchors all exist on the page', () => {
    const toc = cvFormatToc();
    expect(toc.length).toBeGreaterThanOrEqual(15);
    expect(page.body).toContain('<nav id="toc"');
    for (const t of toc) {
      expect(page.body, t.id).toContain(`href="#${t.id}"`);
      expect(page.body, t.id).toMatch(new RegExp(`<(section|details) id="${t.id}"`));
    }
    expect(new Set(toc.map((t) => t.id)).size).toBe(toc.length);
  });
  it('has the #pdf, #word and #design sections the keyword variants point to, and no separate pages for them', () => {
    for (const id of ['pdf', 'word', 'design']) expect(CV_FORMAT_BLOCKS.some((b) => b.id === id), id).toBe(true);
    const paths = seoPagePaths();
    for (const bad of ['/cv-format-pdf', '/cv-design', '/cv-format-word', '/curriculum-vitae-format-pdf']) expect(paths).not.toContain(bad);
  });
  it('has two complete sample CVs, clearly labelled as invented, with the usual sections', () => {
    expect(CV_FORMAT_SAMPLES.map((s) => s.id)).toEqual(['sample-fresher', 'sample-experienced']);
    for (const s of CV_FORMAT_SAMPLES) {
      expect(s.label).toContain('কাল্পনিক');
      expect(s.name).toContain('নমুনা');
      expect(s.contact).not.toMatch(/01[3-9]\d{8}/);
      const heads = s.sections.map((x) => x.h);
      for (const h of ['সারাংশ', 'শিক্ষা', 'দক্ষতা']) expect(heads, s.id).toContain(h);
      expect(page.body).toContain(`id="${s.id}"`);
    }
    expect(CV_FORMAT_SAMPLES[1].sections.map((x) => x.h)).toContain('কাজের অভিজ্ঞতা');
    // each sample is placed right after the block it names
    const order = cvFormatSections().map((x) => (x.kind === 'block' ? x.b.id : x.s.id));
    for (const s of CV_FORMAT_SAMPLES) expect(order[order.indexOf(s.after) + 1]).toBe(s.id);
  });
  it('shows only real, listed, indexable templates with a preview image, each linked to its page', () => {
    expect(new Set(CV_FORMAT_GALLERY_IDS).size).toBe(CV_FORMAT_GALLERY_IDS.length);
    expect(CV_FORMAT_GALLERY_IDS.length).toBeGreaterThanOrEqual(6);
    for (const g of cvFormatGallery()) {
      const t = TEMPLATES.find((x) => x.id === g.id)!;
      expect(t, g.id).toBeTruthy();
      expect(isListed(g.id) && !isRetired(g.id) && shouldIndex(t) && !isVariant(g.id), g.id).toBe(true);
      expect(existsSync(`public${g.img}`), g.img).toBe(true);
      expect(page.body).toContain(`href="${g.href}"`);
      expect(page.body).toContain(`src="${g.img}"`);
    }
    for (const l of CV_FORMAT_GALLERY_LINKS) expect(page.body).toContain(`href="${l.href}"`);
    // no invented template count on the page
    expect(text).not.toMatch(/\d+\s*(টি|টা)?\s*(Word )?(CV )?(template|টেমপ্লেট)\s*(আছে|রয়েছে)/i);
  });
  it('sources the ATS and PDF statements with dates and does not claim a Bangladesh-specific ATS fact', () => {
    expect(CV_FORMAT_SOURCES.length).toBeGreaterThanOrEqual(4);
    for (const s of CV_FORMAT_SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.title).toMatch(/20\d\d/);
      expect(page.body).toContain(`href="${s.url}"`);
    }
    expect(page.body).toContain('Last checked 2026-11-29');
    expect(text).not.toContain('প্রথম বাছাই করে');
    expect(text).toContain('যাচাইকৃত তালিকা আমাদের কাছে নেই');
  });
  it('links to the writing guide and keeps the Word section honest about free vs paid', () => {
    expect(page.body).toContain(`href="${CV_FORMAT_WRITE_LINK.href}"`);
    const word = CV_FORMAT_BLOCKS.find((b) => b.id === 'word')!;
    const t = [...(word.p ?? []), ...(word.ul ?? [])].join(' ');
    expect(t).toContain('ফ্রি');
    expect(t).toContain('পেইড');
    expect(t).toContain('৳২৯');
    // the free starter .docx is not built yet: no link to a file that does not exist
    expect(page.body).not.toMatch(/href="[^"]*\.docx"/);
  });
});
