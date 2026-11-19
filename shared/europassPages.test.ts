import { describe, expect, it } from 'vitest';
import {
  EUROPASS_BN_KEYWORD, EUROPASS_BUILDER_HREF, EUROPASS_EXCLUDED_IDS, EUROPASS_HUB_PATH, EUROPASS_LINKS, EUROPASS_PATHS, EUROPASS_PILLAR_PATH,
  EUROPASS_SEO, EUROPASS_UNOFFICIAL, EUROPASS_WORD_PATH, PILLAR_ANSWER, WORD_ANSWER, allEuropassText, europassHubTemplates, europassSeo, pillarWords, wordCount, wordPageWords,
} from './europassPages';
import { europassPages } from './europassHtml';
import { routeSeo } from './seo';
import { seoPagePaths, sitemapXml } from '../scripts/seo';
import { TEMPLATES, SINGLE_TEMPLATE_PRICE } from './templates';
import { isListed, isRetired, isVariant } from './templateTiers';
import { APP_ONLY_PATHS } from './appPaths';

const len = (s: string) => [...s].length;

describe('Europass pages: search copy', () => {
  for (const path of EUROPASS_PATHS) {
    it(`${path}: title <= 60 and description <= 155 characters, Bangla keyword present`, () => {
      const s = EUROPASS_SEO[path];
      expect(len(s.title)).toBeLessThanOrEqual(60);
      expect(len(s.description)).toBeLessThanOrEqual(155);
      if (path !== '/templates/category/europass-cv') expect(s.h1).toContain(EUROPASS_BN_KEYWORD); // the hub H1 is fixed by the plan; its Bangla keyword sits in the intro and image alts
      expect(routeSeo(path)).toEqual({ title: s.title, description: s.description });
      expect(europassSeo(path)).toBe(s);
    });
  }
  it('pillar: 40-60 word direct answer, Bangla keyword in the first 100 words, 1,500-1,800 words', () => {
    expect(wordCount(PILLAR_ANSWER)).toBeGreaterThanOrEqual(40);
    expect(wordCount(PILLAR_ANSWER)).toBeLessThanOrEqual(60);
    expect(PILLAR_ANSWER.split(/\s+/).slice(0, 100).join(' ')).toContain(EUROPASS_BN_KEYWORD);
    expect(pillarWords()).toBeGreaterThanOrEqual(1500);
    expect(pillarWords()).toBeLessThanOrEqual(1800);
  });
  it('word page: 900-1,100 words, Bangla keyword in the first 100 words', () => {
    expect(wordPageWords()).toBeGreaterThanOrEqual(900);
    expect(wordPageWords()).toBeLessThanOrEqual(1100);
    expect(WORD_ANSWER.split(/\s+/).slice(0, 100).join(' ')).toContain(EUROPASS_BN_KEYWORD);
  });
  it('has no banned claims', () => {
    const text = allEuropassText();
    expect(text.replace(/\b(un|not )official\b|not an official|the official Europass/gi, '')).not.toMatch(/\bofficial\b/i);
    expect(text).not.toMatch(/guarantee/i);
    expect(text).not.toMatch(/\b75\s?%/);
    expect(text).not.toMatch(/ATS (will )?reject/i);
    expect(text).not.toMatch(/(get|win|secure|land) (you )?(a |the )?(job|visa|admission|scholarship)/i);
    expect(text).not.toMatch(/(job|visa|admission|scholarship)s? (is |are )?(assured|certain|sure)/i);
    expect(text).not.toMatch(/aggregateRating|reviewCount/i);
  });
  it('states the 29 taka price from the constant', () => {
    expect(allEuropassText()).toContain(`৳${SINGLE_TEMPLATE_PRICE}`);
  });
});

describe('Europass hub list', () => {
  const list = europassHubTemplates();
  it('lists only on-sale lead Europass templates and leaves out europass-003', () => {
    expect(list.length).toBeGreaterThan(0);
    expect(EUROPASS_EXCLUDED_IDS).toContain('hwg-cv-europass-europass-003');
    for (const t of list) {
      expect(t.id).not.toBe('hwg-cv-europass-europass-003');
      expect(isRetired(t.id)).toBe(false);
      expect(isVariant(t.id)).toBe(false);
      expect(isListed(t.id)).toBe(true);
      expect(TEMPLATES.find((x) => x.id === t.id)?.hub).toBe('europass');
    }
    const html = europassPages().find((p) => p.path === EUROPASS_HUB_PATH)!;
    expect(html.body).not.toContain('europass-003');
    expect(JSON.stringify(html.jsonLd)).not.toContain('europass-003');
  });
});

describe('Europass prerender', () => {
  const pages = europassPages();
  it('writes all three pages with a real body, JSON-LD and no rating markup', () => {
    expect(pages.map((p) => p.path).sort()).toEqual([...EUROPASS_PATHS].sort());
    for (const p of pages) {
      expect(p.body.length).toBeGreaterThan(2000);
      expect(p.body).toContain('<h1>');
      expect(p.body).toContain(EUROPASS_UNOFFICIAL);
      expect(p.body).toContain('https://www.dhshishir.com');
      expect(p.lastmod).toBe('2026-11-19');
      JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': p.jsonLd }));
      const types = p.jsonLd.map((x) => (x as { '@type': string })['@type']);
      expect(types).toContain('BreadcrumbList');
      expect(JSON.stringify(p.jsonLd)).not.toMatch(/AggregateRating|"Review"/);
      expect(JSON.stringify(p.jsonLd)).toContain('"Person"');
    }
    expect(pages.find((p) => p.path === EUROPASS_PILLAR_PATH)!.jsonLd.map((x) => (x as { '@type': string })['@type'])).toContain('WebApplication');
    expect(pages.find((p) => p.path === EUROPASS_HUB_PATH)!.jsonLd.map((x) => (x as { '@type': string })['@type'])).toEqual(expect.arrayContaining(['CollectionPage', 'BreadcrumbList']));
    expect(pages.find((p) => p.path === EUROPASS_WORD_PATH)!.jsonLd.map((x) => (x as { '@type': string })['@type'])).toContain('ImageObject');
  });
  it('hub images: first is high priority, the rest lazy, all with width and height; an alt carries the Bangla keyword', () => {
    for (const p of pages) {
      const imgs = [...p.body.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((tag, i) => {
        expect(tag).toMatch(/width="\d+"/);
        expect(tag).toMatch(/height="\d+"/);
        expect(tag).toContain(EUROPASS_BN_KEYWORD);
        if (i === 0) expect(tag).toContain('fetchpriority="high"');
        else expect(tag).toContain('loading="lazy"');
      });
    }
  });
  it('is in the sitemap with the content date, and the builder preset is not', () => {
    const xml = sitemapXml();
    for (const path of EUROPASS_PATHS) {
      expect(xml).toContain(`<loc>https://herewegrow.pro${path}</loc><lastmod>2026-11-19</lastmod>`);
      expect(seoPagePaths()).toContain(path);
    }
    expect(xml).not.toContain('preset=');
    expect(xml).not.toContain('europass-003</loc>');
  });
  it('keeps the Gulf page out of the Europass pages (keyword separation)', () => {
    for (const p of pages) expect(p.body).not.toContain('/cv-for-gulf-jobs');
  });
});

describe('Europass internal links', () => {
  const known = new Set<string>([...seoPagePaths(), ...APP_ONLY_PATHS, '/blog', '/builder']);
  it('only link to pages that exist', () => {
    for (const group of Object.values(EUROPASS_LINKS)) {
      for (const href of group) expect(known.has(href.split('?')[0]), href).toBe(true);
    }
    expect(EUROPASS_BUILDER_HREF).toBe('/builder?preset=europass');
  });
  it('every href in the prerendered bodies resolves to a built page', () => {
    for (const p of europassPages()) {
      for (const m of p.body.matchAll(/href="(\/[^"#]*)"/g)) expect(known.has(m[1].split('?')[0]), `${p.path} -> ${m[1]}`).toBe(true);
    }
  });
  it('the three pages link to each other', () => {
    const by = Object.fromEntries(europassPages().map((p) => [p.path, p.body]));
    expect(by[EUROPASS_PILLAR_PATH]).toContain(`href="${EUROPASS_WORD_PATH}"`);
    expect(by[EUROPASS_PILLAR_PATH]).toContain(`href="${EUROPASS_HUB_PATH}"`);
    expect(by[EUROPASS_WORD_PATH]).toContain(`href="${EUROPASS_PILLAR_PATH}"`);
    expect(by[EUROPASS_WORD_PATH]).toContain(`href="${EUROPASS_HUB_PATH}"`);
    expect(by[EUROPASS_HUB_PATH]).toContain(`href="${EUROPASS_PILLAR_PATH}"`);
    expect(by[EUROPASS_HUB_PATH]).toContain(`href="${EUROPASS_WORD_PATH}"`);
  });
});
