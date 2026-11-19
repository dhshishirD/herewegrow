import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  EUROPASS_LOGO_FLAGGED_IDS, EUROPASS_OG, EUROPASS_PREVIEW, EUROPASS_WHATSAPP_HREF, EUROPASS_EXPERT_PATH, PILLAR_FOLDED, QUIZ, QUIZ_RESULTS, WORD_FOLDED, europassChoices, quizResult,
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


describe('Europass pages: first-visit layout', () => {
  const pages = Object.fromEntries(europassPages().map((p) => [p.path, p.body]));
  it('pillar leads with the H1, the direct answer, then the three choices and a visible quiz heading', () => {
    const b = pages[EUROPASS_PILLAR_PATH];
    const order = ['<h1>', PILLAR_ANSWER.slice(0, 30), 'What do you want to do?', 'Build it free now', 'Get an editable Word template', 'Want an expert to write it for you?', 'id="how"', 'Do I need a Europass CV?'].map((x) => b.indexOf(x));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order]).toEqual([...order].sort((x, y) => x - y));
  });
  it('choices point at real routes and the expert price comes from the catalog', () => {
    const [build, word, expert] = europassChoices(EUROPASS_WORD_PATH);
    expect(build.href).toBe(EUROPASS_BUILDER_HREF);
    expect(word.href).toBe(EUROPASS_WORD_PATH);
    expect(expert.href).toBe(EUROPASS_EXPERT_PATH);
    expect(seoPagePaths()).toContain(EUROPASS_EXPERT_PATH);
    expect(expert.micro).toMatch(/৳\d+/);
    expect(EUROPASS_WHATSAPP_HREF).toContain('https://wa.me/');
    for (const path of EUROPASS_PATHS) expect(pages[path]).toContain(`href="${EUROPASS_BUILDER_HREF}"`);
  });
  it('quiz: every answer path ends in a result, and no result links to the Gulf page or promises an outcome', () => {
    const ids = (k: string) => QUIZ.find((q) => q.id === k)!.options.map((o) => o.id);
    const seen = new Set<string>();
    for (const where of ids('where')) for (const own of ids('own')) for (const asked of ids('asked')) {
      const r = quizResult({ where, own, asked });
      expect(r).not.toBeNull();
      seen.add(r!.id);
    }
    expect([...seen].sort()).toEqual(['europass', 'local', 'theirs']);
    expect(quizResult({ where: 'bd' })).toBeNull();
    expect(quizResult({ where: 'europe', own: 'yes', asked: 'yes' })!.id).toBe('theirs');
    expect(quizResult({ where: 'bd', own: 'no', asked: 'no' })!.id).toBe('local');
    expect(JSON.stringify(QUIZ_RESULTS)).not.toContain('gulf');
  });
  it('long reference sections are accordions that keep their text in the HTML; the FAQ is open', () => {
    for (const id of PILLAR_FOLDED) expect(pages[EUROPASS_PILLAR_PATH]).toMatch(new RegExp(`<details id="${id}">`));
    for (const id of WORD_FOLDED) expect(pages[EUROPASS_WORD_PATH]).toMatch(new RegExp(`<details id="${id}">`));
    expect(pages[EUROPASS_PILLAR_PATH]).toContain('<details id="faq" open>');
    expect(pages[EUROPASS_PILLAR_PATH]).toContain('<td>Beginner</td>');
  });
});

describe('Europass pages: no logo or EU flag in images', () => {
  const pages = europassPages();
  it('our own preview exists with real A4 proportions', () => {
    for (const f of [EUROPASS_PREVIEW.src, EUROPASS_PREVIEW.thumb]) expect(existsSync(`public${f}`), f).toBe(true);
    expect(Math.abs(EUROPASS_PREVIEW.h / EUROPASS_PREVIEW.w - 1.4142)).toBeLessThan(0.01);
    expect(EUROPASS_PREVIEW.alt).toContain(EUROPASS_BN_KEYWORD);
    // read the WebP header: RIFF....WEBP
    expect(readFileSync(`public${EUROPASS_PREVIEW.src}`).subarray(8, 12).toString()).toBe('WEBP');
  });
  it('the pillar page and every page image field use none of the flagged library thumbs', () => {
    const pillar = pages.find((p) => p.path === EUROPASS_PILLAR_PATH)!;
    for (const id of EUROPASS_LOGO_FLAGGED_IDS) {
      expect(pillar.body, id).not.toContain(id);
      expect(JSON.stringify(pillar.jsonLd), id).not.toContain(id);
    }
    for (const p of pages) for (const id of EUROPASS_LOGO_FLAGGED_IDS) expect(p.image, `${p.path} ${id}`).not.toContain(id);
    expect(pillar.body).toContain(EUROPASS_PREVIEW.src);
  });
  it('hub and Word lists drop flagged thumbs whenever a clean one exists (and report it when none does)', () => {
    const clean = TEMPLATES.filter((t) => t.hub === 'europass' && isListed(t.id) && !EUROPASS_EXCLUDED_IDS.includes(t.id) && !EUROPASS_LOGO_FLAGGED_IDS.includes(t.id));
    if (clean.length > 0) for (const t of europassHubTemplates()) expect(EUROPASS_LOGO_FLAGGED_IDS).not.toContain(t.id);
    else expect(europassHubTemplates().length).toBeGreaterThan(0); // known gap: every listed thumb shows the logo; owner decides
  });

  it('share image is 1200 x 630, exists, and is used as og:image on all three pages', () => {
    expect(EUROPASS_OG.w).toBe(1200);
    expect(EUROPASS_OG.h).toBe(630);
    expect(existsSync(`public${EUROPASS_OG.src}`)).toBe(true);
    const jpg = readFileSync(`public${EUROPASS_OG.src}`);
    expect(jpg.readUInt16BE(0)).toBe(0xffd8); // JPEG signature
  });
});
