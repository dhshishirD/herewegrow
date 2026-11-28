import { describe, expect, it } from 'vitest';
import { CVPHOTO_FAQ, CVPHOTO_PATH, CVPHOTO_RELATED } from './cvPhotoContent';
import { PHOTO_RELATED } from './photoResizerContent';
import { PASSPORT_RELATED } from './passportPhotoContent';
import { CV_FORMAT_LINKS } from './cvFormatPage';
import { routeSeo } from './seo';
import { seoPageBodies, seoPagePaths, sitemapXml } from '../scripts/seo';
import { readFileSync } from 'node:fs';

const page = () => seoPageBodies().find((p) => p.path === CVPHOTO_PATH)!;

describe('professional CV photo page', () => {
  it('prerenders the full text, FAQ, privacy, byline, update date and links', () => {
    const b = page().body;
    expect((b.match(/<h1>/g) ?? []).length).toBe(1);
    for (const s of ['সংক্ষিপ্ত উত্তর', 'কখন এই টুল ব্যবহার করবেন না', 'আমার ছবি কি নিরাপদ?', 'Daloyar Hassan Shishir', '২৮ নভেম্বর ২০২৬', 'huggingface.co/Xenova/modnet', 'Apache-2.0']) expect(b).toContain(s);
    for (const href of ['/tools/photo-signature-resizer', '/tools/passport-size-photo-maker', '/builder', '/cv-format-bd']) expect(b).toContain(`href="${href}"`);
    expect(CVPHOTO_FAQ.length).toBeGreaterThanOrEqual(5);
    expect(CVPHOTO_FAQ.length).toBeLessThanOrEqual(6);
    expect(b).not.toMatch(/undefined|NaN|\[object/);
  });
  it('shows every FAQ question in the static text (FAQ schema is only built from the same list)', () => {
    for (const f of CVPHOTO_FAQ) expect(page().body).toContain(f.q.bn.slice(0, 20));
  });
  it('is in the sitemap, with SEO text within limits', () => {
    expect(sitemapXml()).toContain(`https://herewegrow.pro${CVPHOTO_PATH}</loc>`);
    const s = routeSeo(CVPHOTO_PATH)!;
    expect(s.title.length).toBeLessThanOrEqual(70);
    expect(s.description.length).toBeLessThanOrEqual(170);
  });
  it('links both ways with the resizer hub, passport page, CV format guide and the blog post', () => {
    expect(PHOTO_RELATED.some((l) => l.href === CVPHOTO_PATH)).toBe(true);
    expect(PASSPORT_RELATED.some((l) => l.href === CVPHOTO_PATH)).toBe(true);
    expect(CV_FORMAT_LINKS.some((l) => l.href === CVPHOTO_PATH)).toBe(true);
    expect(readFileSync('content/blog/cv-te-chobi-dewa-uchit-ki.md', 'utf8')).toContain(`](${CVPHOTO_PATH})`);
    const known = new Set(seoPagePaths());
    for (const l of CVPHOTO_RELATED) expect(known.has(l.href), l.href).toBe(true);
  });
  it('makes no outfit, beauty or volume claims', () => {
    const b = page().body;
    expect(b).not.toMatch(/search volume|সার্চ ভলিউম|monthly searches/i);
    expect(b).not.toMatch(/outfit|পোশাক বদলে দেয়|beautify|skin smoothing is/i);
  });
});
