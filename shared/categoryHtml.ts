// Plain-HTML body and JSON-LD for the category buying-guide pages. Used by the build (scripts/seo.ts);
// the React page (src/pages/CategoryPage.tsx) shows the same copy. Only CollectionPage + BreadcrumbList JSON-LD (no FAQPage).
import { esc } from './pageHtml';
import { SITE, a, crumbsLd } from './seoPageHtml';
import { CATEGORY_PAGES, cardLine, categoryCards, categoryPath } from './categoryCopy';
import { TEMPLATES_LASTMOD } from './templates';
import { CATEGORY_PAGES_LIVE } from './templateTiers';

export interface CategoryBuildPage {
  path: string;
  title: string;
  description: string;
  image: string;
  body: string;
  jsonLd: unknown[];
  priority: number;
  lastmod: string;
  images: string[];
  /** True until CATEGORY_PAGES_LIVE: keeps the page out of search results and the sitemap. */
  noindex: boolean;
}

export function categoryPages(): CategoryBuildPage[] {
  return CATEGORY_PAGES.map((c) => {
    const cards = categoryCards(c);
    const path = categoryPath(c.slug);
    const thumbs = cards.map((k) => `${SITE}/templates/${k.id}/thumb.webp`);
    const body = `<article><h1>${esc(c.h1)}</h1>${c.intro.map((x) => `<p>${esc(x)}</p>`).join('')}<ul id="templates">${cards
      .map((k) => `<li><a href="${k.href}"><img src="/templates/${k.id}/thumb.webp" alt="${esc(k.title)}" loading="lazy" /></a><h3>${a(k.href, k.title)}</h3><p>${esc(cardLine(k))}</p></li>`)
      .join('')}</ul><section id="choose"><h2>${esc(c.chooseHeading)}</h2><ul>${c.choose.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section><section id="faq"><h2>${esc(c.faqHeading)}</h2>${c.faq
      .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
      .join('')}</section><p>${a('/templates', 'সব সিভি টেমপ্লেট')}</p></article>`;
    return {
      path,
      title: c.title,
      description: c.description,
      image: thumbs[0],
      body,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: c.h1,
          description: c.description,
          url: `${SITE}${path}`,
          inLanguage: 'bn',
          isPartOf: { '@id': `${SITE}/#website` },
          mainEntity: { '@type': 'ItemList', numberOfItems: cards.length, itemListElement: cards.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${k.href}`, name: k.title })) },
        },
        crumbsLd([['HereWeGrow', '/'], ['CV templates', '/templates'], [c.crumb, path]]),
      ],
      priority: 0.8,
      lastmod: TEMPLATES_LASTMOD,
      images: thumbs,
      noindex: !CATEGORY_PAGES_LIVE,
    };
  });
}
