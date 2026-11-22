import { describe, expect, it } from 'vitest';
import { routeSeo } from './seo';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES } from './templates';
import { isRetired, isVariant, shouldIndex } from './templateTiers';

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

// The same list scripts/seo.ts indexes: not retired, indexable, and not a library variant.
const INDEXABLE = TEMPLATES.filter((t) => !isRetired(t.id) && shouldIndex(t) && !(isVariant(t.id) && t.lib));
const seoOf = (id: string) => routeSeo(`/templates/${id}`)!;

describe('template page titles and descriptions', () => {
  it('cover a real set of pages, with and without manual meta', () => {
    expect(INDEXABLE.length).toBeGreaterThan(60);
    expect(INDEXABLE.some((t) => t.meta)).toBe(true);
    expect(INDEXABLE.some((t) => !t.meta)).toBe(true);
  });
  it('keep titles within 60 characters and descriptions within 70-155', () => {
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(title.length, `${t.id} title`).toBeLessThanOrEqual(60);
      expect(description.length, `${t.id} description`).toBeLessThanOrEqual(155);
      expect(description.length, `${t.id} description`).toBeGreaterThanOrEqual(70);
    }
  });
  it('drop the old English tail', () => {
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(title, t.id).not.toContain('Word template');
      expect(description, t.id).not.toContain('editable Word CV format');
    }
  });
  it('never share a title or a description', () => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const t of INDEXABLE) {
      const { title, description } = seoOf(t.id);
      expect(titles.get(title), `${t.id} repeats the title of ${titles.get(title)}`).toBeUndefined();
      expect(descriptions.get(description), `${t.id} repeats the description of ${descriptions.get(description)}`).toBeUndefined();
      titles.set(title, t.id);
      descriptions.set(description, t.id);
    }
  });
  it('use the manual meta unchanged when a template has one', () => {
    const withMeta = INDEXABLE.filter((t) => t.meta);
    expect(withMeta.length).toBeGreaterThan(0);
    for (const t of withMeta) {
      expect(seoOf(t.id).title, t.id).toBe(t.meta!.title);
      expect(seoOf(t.id).description, t.id).toBe(t.meta!.description);
    }
  });
  it('show the price from SINGLE_TEMPLATE_PRICE in every generated description', () => {
    for (const t of INDEXABLE.filter((x) => !x.meta)) {
      expect(seoOf(t.id).description, t.id).toContain(`৳${bn(SINGLE_TEMPLATE_PRICE)}`);
    }
  });
});

// ---- Prompt 2: real body content ----
import { templateGuide, bnNum } from './templateCopy';
import { SINGLE_TEMPLATE_PRICE as PRICE } from './templates';
import { CATEGORY_PAGES_LIVE as LIVE } from './templateTiers';

const esc2 = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function bodyHtml(t: (typeof TEMPLATES)[number]): string {
  const g = templateGuide(t);
  const a = (l: { href: string; text: string }) => `<a href="${l.href}">${esc2(l.text)}</a>`;
  return [
    `<h1>${esc2(t.title.bn)}</h1><p>${esc2(g.summary)}</p>`,
    `<h2>${g.forWhomHeading}</h2><p>${esc2(g.forWhom)}</p>`,
    `<h2>${g.contentsHeading}</h2><ul>${g.contents.map((c) => `<li>${esc2(c)}</li>`).join('')}</ul>`,
    `<h2>${g.editHeading}</h2><ol>${g.steps.map((c) => `<li>${esc2(c)}</li>`).join('')}</ol>`,
    `<h2>${g.faqHeading}</h2>${g.faq.map((f) => `<h3>${esc2(f.q)}</h3><p>${esc2(f.a)}</p>`).join('')}`,
    `<h2>${g.moreHeading}</h2><ul>${g.more.map((l) => `<li>${a(l)}</li>`).join('')}</ul>`,
  ].join('');
}
const words = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

describe('template page body content', () => {
  const pages = INDEXABLE;
  it('has real content on every indexable page', () => {
    expect(pages.length).toBeGreaterThan(60);
    for (const t of pages) {
      const h = bodyHtml(t);
      expect(words(h), t.id).toBeGreaterThanOrEqual(120);
      expect((h.match(/<h2>/g) ?? []).length, t.id).toBeGreaterThanOrEqual(2);
      expect((h.match(/<h1>/g) ?? []).length, t.id).toBe(1);
      expect(h, t.id).not.toMatch(/undefined|NaN|\[object/);
      expect(h, t.id).toContain(`৳${bnNum(PRICE)}`);
    }
  });
  it('links only to indexable pages', () => {
    for (const t of pages) {
      for (const l of templateGuide(t).more) {
        const m = l.href.match(/^\/templates\/([^/]+)$/);
        if (m && m[1] !== 'category') {
          const o = TEMPLATES.find((x) => x.id === m[1])!;
          expect(o && !isRetired(o.id) && shouldIndex(o) && !isVariant(o.id), `${t.id} -> ${m[1]}`).toBe(true);
        }
        if (l.href.startsWith('/templates/category')) expect(LIVE).toBe(true);
      }
    }
  });
  it('is deterministic and different across sectors', () => {
    const t = pages[0];
    expect(templateGuide(t).forWhom).toBe(templateGuide(t).forWhom);
    const bySector = new Map<string, string>();
    for (const x of pages) bySector.set(x.sector + '/' + x.hub, templateGuide(x).forWhom);
    expect(new Set(bySector.values()).size).toBeGreaterThan(5);
  });
});
