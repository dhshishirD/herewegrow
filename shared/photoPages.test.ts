import { describe, expect, it } from 'vitest';
import { PHOTO_SECTIONS } from './photoResizerContent';
import { PASSPORT_PATH, PASSPORT_FAQ } from './passportPhotoContent';
import { routeSeo } from './seo';
import { seoPageBodies, sitemapXml } from '../scripts/seo';

const body = (path: string) => seoPageBodies().find((p) => p.path === path)!.body;
const HUB = '/tools/photo-signature-resizer';

describe('photo resizer hub and passport page', () => {
  it('prerenders the anchored size sections, FAQ, sources and byline into the static HTML', () => {
    const b = body(HUB);
    for (const id of ['teletalk-300x300', 'signature-300x80', 'passport-size', 'stamp-size', 'compress-kb']) expect(b).toContain(`id="${id}"`);
    expect(PHOTO_SECTIONS.map((s) => s.id)).toEqual(['teletalk-300x300', 'signature-300x80', 'passport-size', 'stamp-size', 'compress-kb']);
    expect(b).toContain('https://admissioncuet.ac.bd/faq');
    expect(b).toContain('hague.mofa.gov.bd');
    expect(b).toContain('২৯ নভেম্বর ২০২৬');
    expect(b).toContain('মূল সার্কুলার PDF খুলে দেখিনি');
    expect(b).not.toMatch(/teamzlab|দ্বিতীয় সূত্র/i);
    expect(b).not.toMatch(/official Bangladesh passport size|বাংলাদেশের সরকারি পাসপোর্ট মাপ/i);
    expect(b).toContain('Daloyar Hassan Shishir');
    expect(b).toContain('সর্বশেষ হালনাগাদ');
    expect(b).toContain(`href="${PASSPORT_PATH}"`);
    expect(b).toContain('href="/builder"');
    expect(b).toContain('href="/tools/cv-checker"');
  });
  it('prerenders the passport page with computed pixels, FAQ and links both ways', () => {
    const b = body(PASSPORT_PATH);
    expect(b).toContain('৪১৩×৫৩১');
    expect(b).toContain('hague.mofa.gov.bd');
    expect(b).toContain('৪৫×৫৫ মিমি');
    expect(b).toContain('নির্দেশনাই মানুন');
    expect(b).not.toMatch(/teamzlab/i);
    expect(b).toContain('২৩৬×২৯৫');
    expect(b).toContain(`href="${HUB}"`);
    expect(b).toContain('Daloyar Hassan Shishir');
    expect(PASSPORT_FAQ.length).toBeGreaterThanOrEqual(4);
  });
  it('lists the passport page in the sitemap and has SEO text within limits', () => {
    expect(sitemapXml()).toContain(`https://herewegrow.pro${PASSPORT_PATH}</loc>`);
    for (const path of [HUB, PASSPORT_PATH]) {
      const s = routeSeo(path)!;
      expect(s.title.length).toBeLessThanOrEqual(70);
      expect(s.description.length).toBeLessThanOrEqual(160);
    }
  });
  it('never states search volumes', () => {
    for (const path of [HUB, PASSPORT_PATH]) expect(body(path)).not.toMatch(/search volume|সার্চ ভলিউম|monthly searches/i);
  });
});
