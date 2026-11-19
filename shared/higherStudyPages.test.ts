import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACADEMIC_BN, ACADEMIC_BUILDER_HREF, ACADEMIC_PATH, ACADEMIC_PREVIEW, BN_KEYWORD, HS_CONTENT, HS_LINKS, HS_PATHS, HS_PRICES, HS_PRESET_PAGES, HS_SEO, HS_WHATSAPP_HREF, HUB_PATH, HUB_PREVIEWS,
  HUB_PICKS, HUB_TOOLS, SCHOLARSHIP_BN, SCHOLARSHIP_BN_LINE, SCHOLARSHIP_BUILDER_HREF, SCHOLARSHIP_PATH, SCHOLARSHIP_PREVIEW, SCHOLARSHIP_QUIZ, SCHOLARSHIP_QUIZ_RESULTS,
  WORD_SECTION, allHigherStudyText, higherStudyChoices, higherStudySeo, higherStudyTemplates, pageWords, scholarshipQuizResult, wordCount, HUB_BN, HS_EXPERT_PATH, HS_NOTE,
  type HsPath,
} from './higherStudyPages';
import { higherStudyPages } from './higherStudyHtml';
import { routeSeo } from './seo';
import { seoPagePaths, sitemapXml } from '../scripts/seo';
import { PRODUCTS } from './catalog';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES } from './templates';
import { isListed, isRetired, isVariant } from './templateTiers';
import { APP_ONLY_PATHS } from './appPaths';
import { seoTarget } from '../src/lib/seo';

const len = (s: string) => [...s].length;
const pages = Object.fromEntries(higherStudyPages().map((p) => [p.path, p]));
const body = (p: HsPath) => pages[p].body;

/** Width and height of a WebP file (VP8, VP8L or VP8X header). */
function webpSize(file: string): { w: number; h: number } {
  const b = readFileSync(file);
  expect(b.subarray(0, 4).toString()).toBe('RIFF');
  expect(b.subarray(8, 12).toString()).toBe('WEBP');
  const kind = b.subarray(12, 16).toString();
  if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (kind === 'VP8L') { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}
/** Width and height of a JPEG file (first SOF marker). */
function jpegSize(file: string): { w: number; h: number } {
  const b = readFileSync(file);
  expect(b.readUInt16BE(0)).toBe(0xffd8);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('no SOF marker');
}

describe('higher study pages: search copy', () => {
  for (const path of HS_PATHS) {
    it(`${path}: title <= 60 and description <= 155 characters, Bangla keyword in the page`, () => {
      const s = HS_SEO[path];
      expect(len(s.title)).toBeLessThanOrEqual(60);
      expect(len(s.description)).toBeLessThanOrEqual(155);
      expect(routeSeo(path)).toEqual({ title: s.title, description: s.description });
      expect(higherStudySeo(path)).toBe(s);
      const c = HS_CONTENT[path];
      expect(c.answer.split(/\s+/).slice(0, 100).join(' ')).toContain(BN_KEYWORD[path]);
    });
  }
  it('academic: primary keyword in title, H1 and answer; Bangla keyword in the H1; 40-60 word answer; 1,500-1,800 words', () => {
    const c = HS_CONTENT[ACADEMIC_PATH];
    expect(c.seo.title.toLowerCase()).toContain('academic cv');
    expect(c.seo.h1.toLowerCase()).toContain('academic cv');
    expect(c.seo.h1).toContain(ACADEMIC_BN);
    expect(wordCount(c.answer)).toBeGreaterThanOrEqual(40);
    expect(wordCount(c.answer)).toBeLessThanOrEqual(60);
    expect(pageWords(ACADEMIC_PATH)).toBeGreaterThanOrEqual(1500);
    expect(pageWords(ACADEMIC_PATH)).toBeLessThanOrEqual(1800);
    for (const kw of ['academic cv format', 'academic curriculum vitae']) expect(allHigherStudyText(ACADEMIC_PATH).toLowerCase()).toContain(kw);
  });
  it('scholarship: approved title, description and H1; Bangla line visible; keywords present', () => {
    const s = HS_SEO[SCHOLARSHIP_PATH];
    expect(s.title).toBe('Scholarship CV: Format for Chevening, DAAD | HereWeGrow');
    expect(s.description).toBe('Scholarship CV guide for Bangladeshi students: sections, GPA wording, referees and academic layout. Build free with the HWG builder.');
    expect(s.h1).toBe('Scholarship CV Format for Bangladeshi Students');
    expect(SCHOLARSHIP_BN_LINE).toBe('স্কলারশিপের সিভি: কীভাবে সাজাবেন');
    expect(body(SCHOLARSHIP_PATH)).toContain(SCHOLARSHIP_BN_LINE);
    expect(wordCount(HS_CONTENT[SCHOLARSHIP_PATH].answer)).toBeGreaterThanOrEqual(40);
    expect(wordCount(HS_CONTENT[SCHOLARSHIP_PATH].answer)).toBeLessThanOrEqual(60);
    expect(pageWords(SCHOLARSHIP_PATH)).toBeGreaterThanOrEqual(1200);
    const t = allHigherStudyText(SCHOLARSHIP_PATH).toLowerCase();
    for (const kw of ['scholarship cv', 'cv for scholarship', 'scholarship cv format', 'cv for masters application', 'cv for phd application', 'study abroad cv']) expect(t, kw).toContain(kw);
  });
  it('hub: 600-800 words, primary keywords and Bangla keyword in the H1', () => {
    expect(pageWords(HUB_PATH)).toBeGreaterThanOrEqual(600);
    expect(pageWords(HUB_PATH)).toBeLessThanOrEqual(800);
    expect(HS_SEO[HUB_PATH].h1).toContain(HUB_BN);
    expect(HS_SEO[HUB_PATH].title.toLowerCase()).toContain('higher study cv');
    expect(HS_CONTENT[HUB_PATH].answer.toLowerCase()).toContain('cv for higher studies');
  });
  it('has no banned claims', () => {
    const text = allHigherStudyText();
    expect(text).not.toMatch(/guarantee/i);
    expect(text).not.toMatch(/\b75\s?%/);
    expect(text).not.toMatch(/ATS (will )?reject/i);
    expect(text).not.toMatch(/(get|win|secure|land) (you |me )?(a |an |the )?(job|visa|admission|scholarship|offer)/i);
    expect(text).not.toMatch(/(job|visa|admission|scholarship)s? (is |are )?(assured|certain|sure)/i);
    expect(text).not.toMatch(/aggregateRating|reviewCount/i);
    expect(text).toContain('We do not promise admission');
    expect(text).toContain(HS_NOTE);
  });
  it('states prices from the real constants', () => {
    const text = allHigherStudyText();
    expect(text).toContain(`৳${SINGLE_TEMPLATE_PRICE}`);
    expect(text).toContain(HS_PRICES.academic);
    expect(text).toContain(HS_PRICES.sop);
    expect(HS_PRICES.academic).toBe(`৳${PRODUCTS.find((p) => p.id === 'academic-cv')!.price}`);
    expect(HS_PRICES.sop).toBe(`৳${PRODUCTS.find((p) => p.id === 'sop')!.price}`);
  });
});

describe('higher study pages: keyword separation', () => {
  const EUROPASS = /europass|\beu cv\b|european cv/i;
  it('academic page and every choice card never use the Europass keywords or the Gulf page', () => {
    expect(allHigherStudyText(ACADEMIC_PATH)).not.toMatch(EUROPASS);
    expect(body(ACADEMIC_PATH)).not.toMatch(EUROPASS);
    for (const p of HS_PATHS) expect(body(p)).not.toContain('/cv-for-gulf-jobs');
    expect(allHigherStudyText()).not.toMatch(/gulf/i);
  });
  it('scholarship page: exactly one link to /europass-cv, inside the helper; no other Europass wording outside it', () => {
    const b = body(SCHOLARSHIP_PATH);
    expect(b.match(/href="\/europass-cv"/g)).toHaveLength(1);
    const quizAt = b.indexOf('id="which-format"');
    expect(b.indexOf('/europass-cv')).toBeGreaterThan(quizAt);
    const withoutQuiz = b.replace(/<section id="which-format">.*?<\/section>/s, '');
    expect(withoutQuiz).not.toMatch(EUROPASS);
    expect(allHigherStudyText(SCHOLARSHIP_PATH).match(/europass/gi)!.length).toBeLessThanOrEqual(2);
  });
  it('hub: one neutral line for the Europass guide and no other mention', () => {
    const b = body(HUB_PATH);
    expect(b.match(/href="\/europass-cv"/g)).toHaveLength(1);
    expect(b.match(/europass/gi)!.length).toBeLessThanOrEqual(3);
    expect(HUB_PICKS.filter((p) => p.href === '/europass-cv')).toHaveLength(1);
  });
  it('does not link to pages that do not exist yet', () => {
    for (const p of HS_PATHS) for (const dead of ['/sop-guide', '/lor-sample', '/motivation-letter-sample']) expect(body(p)).not.toContain(dead);
  });
});

describe('higher study: Word templates', () => {
  const list = higherStudyTemplates();
  it('lists three real, on-sale lead templates and none from the Europass collection', () => {
    expect(list).toHaveLength(3);
    for (const t of list) {
      const real = TEMPLATES.find((x) => x.id === t.id)!;
      expect(real, t.id).toBeTruthy();
      expect(isRetired(t.id)).toBe(false);
      expect(isVariant(t.id)).toBe(false);
      expect(isListed(t.id)).toBe(true);
      expect(real.hub).not.toBe('europass');
      expect(real.cat).not.toBe('europass');
      expect(existsSync(`public${t.thumb}`), t.thumb).toBe(true);
    }
    expect(list.map((t) => t.id)).toEqual(expect.arrayContaining(['ats-academic-teaching-2page', 'creative-academic-teacher-2page']));
  });
  it('thumbnail sizes in the data match the real files', () => {
    for (const t of list) expect(webpSize(`public${t.thumb}`), t.id).toEqual({ w: t.w, h: t.h });
  });
});

describe('higher study prerender', () => {
  it('writes all three pages with a real body, JSON-LD and no rating markup', () => {
    expect(Object.keys(pages).sort()).toEqual([...HS_PATHS].sort());
    for (const path of HS_PATHS) {
      const p = pages[path];
      expect(p.body.length).toBeGreaterThan(2000);
      expect(p.body).toContain('<h1>');
      expect(p.body).toContain('https://www.dhshishir.com');
      expect(p.body).toContain('Last updated 2026-11-19. Last checked 2026-11-19.');
      expect(p.body).toContain('id="sources"');
      expect(p.body).toContain('id="faq"');
      expect(p.body).toContain(HS_NOTE);
      expect(p.lastmod).toBe('2026-11-19');
      JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': p.jsonLd }));
      const types = p.jsonLd.map((x) => (x as { '@type': string })['@type']);
      expect(types).toContain('BreadcrumbList');
      expect(JSON.stringify(p.jsonLd)).not.toMatch(/AggregateRating|"Review"/);
      expect(JSON.stringify(p.jsonLd)).toContain('"Person"');
      expect(p.body).not.toMatch(/noindex/);
      expect(HS_CONTENT[path].faq).toHaveLength(6);
    }
    const t = (path: HsPath) => pages[path].jsonLd.map((x) => (x as { '@type': string })['@type']);
    expect(t(ACADEMIC_PATH)).toEqual(expect.arrayContaining(['WebPage', 'WebApplication', 'FAQPage']));
    expect(t(SCHOLARSHIP_PATH)).toEqual(expect.arrayContaining(['WebPage', 'WebApplication', 'FAQPage']));
    expect(t(HUB_PATH)).toEqual(expect.arrayContaining(['CollectionPage', 'BreadcrumbList', 'ImageObject']));
    const hub = pages[HUB_PATH].jsonLd.find((x) => (x as { '@type': string })['@type'] === 'CollectionPage') as { mainEntity: { '@type': string } };
    expect(hub.mainEntity['@type']).toBe('ItemList');
  });
  it('images: first is high priority, the rest lazy, all with width, height and the Bangla keyword in the alt', () => {
    for (const path of HS_PATHS) {
      const imgs = [...pages[path].body.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
      expect(imgs.length).toBeGreaterThan(2);
      imgs.forEach((tag, i) => {
        expect(tag).toMatch(/width="\d+"/);
        expect(tag).toMatch(/height="\d+"/);
        expect(tag).toContain(BN_KEYWORD[path]);
        if (i === 0) expect(tag).toContain('fetchpriority="high"');
        else { expect(tag).toContain('loading="lazy"'); expect(tag).not.toContain('fetchpriority'); }
      });
    }
  });
  it('is in the sitemap with the content date, self-canonical, and no builder preset', () => {
    const xml = sitemapXml();
    for (const path of HS_PATHS) {
      expect(xml).toContain(`<loc>https://herewegrow.pro${path}</loc><lastmod>2026-11-19</lastmod>`);
      expect(seoPagePaths()).toContain(path);
      expect(seoTarget(path, '')).toEqual({ canonical: path, noindex: false });
    }
    expect(xml).not.toContain('preset=');
  });
  it('builder presets point at their pages', () => {
    expect(seoTarget('/builder', '?preset=scholarship')).toEqual({ canonical: SCHOLARSHIP_PATH, noindex: true });
    expect(seoTarget('/builder', '?preset=academic')).toEqual({ canonical: ACADEMIC_PATH, noindex: true });
    expect(HS_PRESET_PAGES).toEqual({ scholarship: SCHOLARSHIP_PATH, academic: ACADEMIC_PATH });
    expect(SCHOLARSHIP_BUILDER_HREF).toBe('/builder?preset=scholarship');
    expect(ACADEMIC_BUILDER_HREF).toBe('/builder?preset=academic');
  });
});

describe('higher study internal links', () => {
  const known = new Set<string>([...seoPagePaths(), ...APP_ONLY_PATHS, '/blog', '/builder']);
  it('only link to pages that exist', () => {
    for (const group of Object.values(HS_LINKS)) for (const href of group) expect(known.has(href.split('?')[0]), href).toBe(true);
    for (const t of HUB_TOOLS) expect(known.has(t.href), t.href).toBe(true);
    expect(known.has(HS_EXPERT_PATH)).toBe(true);
  });
  it('every href in the prerendered bodies resolves to a built page', () => {
    for (const path of HS_PATHS) for (const m of body(path).matchAll(/href="(\/[^"#]*)"/g)) expect(known.has(m[1].split('?')[0]), `${path} -> ${m[1]}`).toBe(true);
  });
  it('the pages link to each other and the hub reaches the real tools', () => {
    expect(body(ACADEMIC_PATH)).toContain(`href="${HUB_PATH}"`);
    expect(body(ACADEMIC_PATH)).toContain(`href="${SCHOLARSHIP_PATH}"`);
    expect(body(SCHOLARSHIP_PATH)).toContain(`href="${HUB_PATH}"`);
    expect(body(SCHOLARSHIP_PATH)).toContain(`href="${ACADEMIC_PATH}"`);
    for (const href of [SCHOLARSHIP_PATH, ACADEMIC_PATH, '/tools/application-letter', '/tools/cv-checker', '/services', '/templates', SCHOLARSHIP_BUILDER_HREF, ACADEMIC_BUILDER_HREF]) expect(body(HUB_PATH)).toContain(`href="${href}"`);
    expect(body(HUB_PATH)).toContain(HS_PRICES.sop);
  });
  it('each page links to its own builder preset', () => {
    expect(body(ACADEMIC_PATH)).toContain(`href="${ACADEMIC_BUILDER_HREF}"`);
    expect(body(SCHOLARSHIP_PATH)).toContain(`href="${SCHOLARSHIP_BUILDER_HREF}"`);
  });
});

describe('higher study pages: first-visit layout', () => {
  it('the guides lead with the H1, the direct answer, the three choices, the preview, then the steps (and the helper on the scholarship page)', () => {
    for (const path of [ACADEMIC_PATH, SCHOLARSHIP_PATH] as const) {
      const b = body(path);
      const marks = ['<h1>', HS_CONTENT[path].answer.slice(0, 30), 'What do you want to do?', 'Build it free now', 'Get an editable Word template', 'Want an expert to write it for you?', '<figure>', 'id="how"', ...(path === SCHOLARSHIP_PATH ? ['Which format does my programme want?'] : []), 'id="word-templates"'];
      const at = marks.map((x) => b.indexOf(x));
      expect(at.every((i) => i >= 0), `${path} ${JSON.stringify(at)}`).toBe(true);
      expect([...at]).toEqual([...at].sort((x, y) => x - y));
    }
  });
  it('choices point at real routes; the expert card uses the catalog prices; WhatsApp uses the shared number', () => {
    for (const path of HS_PATHS) {
      const [build, word, expert] = higherStudyChoices(path);
      expect(build.href).toBe(path === ACADEMIC_PATH ? ACADEMIC_BUILDER_HREF : SCHOLARSHIP_BUILDER_HREF);
      expect(word.href).toBe(`#${WORD_SECTION.id}`);
      expect(body(path)).toContain(`id="${WORD_SECTION.id}"`);
      expect(expert.href).toBe(HS_EXPERT_PATH);
      expect(expert.micro).toContain(HS_PRICES.academic);
      expect(expert.micro).toContain(HS_PRICES.sop);
    }
    expect(HS_WHATSAPP_HREF).toContain('https://wa.me/');
    expect(higherStudyChoices(HUB_PATH)[0].alt?.href).toBe(ACADEMIC_BUILDER_HREF);
  });
  it('long reference sections are accordions that keep their text in the HTML; the FAQ is open', () => {
    for (const path of HS_PATHS) {
      for (const id of HS_CONTENT[path].folded) expect(body(path), `${path} ${id}`).toMatch(new RegExp(`<details id="${id}">`));
      expect(body(path)).toContain('<details id="faq" open>');
    }
    expect(body(SCHOLARSHIP_PATH)).toContain('Source: <a href="https://www.chevening.org/resource-hub/guidance/prepare-your-application/"');
  });
  it('every stated fact has its source and the check date', () => {
    const b = body(SCHOLARSHIP_PATH);
    for (const url of ['chevening.org/resource-hub/guidance/prepare-your-application', 'mygermanuniversity.com/articles/CV-for-DAAD-Scholarship-Application', 'tbsgraduates.net/?p=31580', 'dundee.ac.uk/guides/cv-writing-guidance-international-students', 'careers.usc.edu/resources/resume-format-guidelines', 'dhakatribune.com/business/390989']) expect(b).toContain(url);
    expect(b).toContain('3 October 2026');
    expect(b).toContain('52,799');
    expect(b.match(/Last checked 2026-11-19/g)!.length).toBeGreaterThanOrEqual(5);
    expect(b).toMatch(/check the official programme page/);
  });
});

describe('scholarship helper', () => {
  const ids = (k: string) => SCHOLARSHIP_QUIZ.find((q) => q.id === k)!.options.map((o) => o.id);
  it('every answer path ends in a result; the programme form comes first', () => {
    const seen = new Set<string>();
    for (const level of ids('level')) for (const form of ids('form')) {
      const r = scholarshipQuizResult({ level, form });
      expect(r).not.toBeNull();
      seen.add(r!.id);
    }
    expect([...seen].sort()).toEqual(['academic', 'named', 'scholarship', 'theirs']);
    expect(scholarshipQuizResult({ level: 'research', form: 'own' })!.id).toBe('theirs');
    expect(scholarshipQuizResult({ level: 'research', form: 'named' })!.id).toBe('named');
    expect(scholarshipQuizResult({ level: 'research', form: 'plain' })!.id).toBe('academic');
    expect(scholarshipQuizResult({ level: 'unsure', form: 'plain' })!.id).toBe('scholarship');
    expect(scholarshipQuizResult({ level: 'masters' })).toBeNull();
  });
  it('results link to real routes and promise nothing', () => {
    expect(SCHOLARSHIP_QUIZ_RESULTS.academic.actions[0].href).toBe(ACADEMIC_BUILDER_HREF);
    expect(SCHOLARSHIP_QUIZ_RESULTS.scholarship.actions[0].href).toBe(SCHOLARSHIP_BUILDER_HREF);
    expect(SCHOLARSHIP_QUIZ_RESULTS.named.actions.filter((a) => a.href === '/europass-cv')).toHaveLength(1);
    expect(JSON.stringify(SCHOLARSHIP_QUIZ_RESULTS)).not.toMatch(/gulf/i);
  });
});

describe('higher study images', () => {
  const previews = [ACADEMIC_PREVIEW, SCHOLARSHIP_PREVIEW];
  it('preview images exist, are WebP with real A4 proportions, and the data matches the files', () => {
    for (const p of previews) {
      expect(existsSync(`public${p.src}`), p.src).toBe(true);
      expect(existsSync(`public${p.thumb}`), p.thumb).toBe(true);
      expect(webpSize(`public${p.src}`), p.src).toEqual({ w: p.w, h: p.h });
      expect(webpSize(`public${p.thumb}`), p.thumb).toEqual({ w: p.tw, h: p.th });
      expect(Math.abs(p.h / p.w - 1.4142)).toBeLessThan(0.01);
      expect(p.alt).toMatch(/[ঀ-৿]/);
    }
    expect(HUB_PREVIEWS.map((p) => p.src)).toEqual([SCHOLARSHIP_PREVIEW.src, ACADEMIC_PREVIEW.src]);
    expect(ACADEMIC_PREVIEW.alt).toContain(ACADEMIC_BN);
    expect(SCHOLARSHIP_PREVIEW.alt).toContain(SCHOLARSHIP_BN);
  });
  it('share images are 1200 x 630 JPEG files and are the og:image of their pages', () => {
    for (const [p, path] of [[ACADEMIC_PREVIEW, ACADEMIC_PATH], [SCHOLARSHIP_PREVIEW, SCHOLARSHIP_PATH], [SCHOLARSHIP_PREVIEW, HUB_PATH]] as const) {
      expect(existsSync(`public${p.og}`), p.og).toBe(true);
      expect(jpegSize(`public${p.og}`), p.og).toEqual({ w: 1200, h: 630 });
      expect(pages[path].image).toBe(`https://herewegrow.pro${p.og}`);
    }
  });
});
