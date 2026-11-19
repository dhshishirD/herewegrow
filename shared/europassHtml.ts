// Plain-HTML body and JSON-LD for the three Europass pages. Used by the build (scripts/seo.ts) so search engines get
// the full text without running JavaScript. The React pages (src/pages/EuropassPages.tsx) show the same copy.

import { esc } from './pageHtml';
import {
  SITE, a, blockHtml, choicesHtml as choicesHtmlG, crumbsLd, faqHtml as faqHtmlG, faqLd, footerHtml as footerHtmlG, quizHtml as quizHtmlG, webPageLd as webPageLdG,
} from './seoPageHtml';
import {
  CHOICES_HEADING, EUROPASS_PREVIEW, EUROPASS_WHATSAPP_HREF, PILLAR_FOLDED, QUIZ, QUIZ_HEADING, QUIZ_INTRO, QUIZ_RESULTS, WORD_FOLDED, europassChoices,
  EUROPASS_AUTHOR, EUROPASS_BUILDER_HREF, EUROPASS_CHECKED, EUROPASS_HUB_PATH, EUROPASS_PILLAR_PATH, EUROPASS_PRICES, EUROPASS_PRIVACY,
  EUROPASS_SEO, EUROPASS_SOURCES, EUROPASS_UNOFFICIAL, EUROPASS_UPDATED, EUROPASS_WORD_PATH, HUB_CHOOSE, HUB_FAQ, HUB_INTRO,
  PILLAR_ANSWER, PILLAR_BLOCKS, PILLAR_FAQ, PILLAR_INTRO, WORD_ANSWER, WORD_BLOCKS, WORD_FAQ, europassHubTemplates, imageAlt, EUROPASS_OG,
  type Faq, type HubTemplate,
} from './europassPages';

export interface EuropassPage {
  path: string;
  title: string;
  description: string;
  image: string;
  body: string;
  jsonLd: unknown[];
  priority: number;
  lastmod: string;
  images: string[];
}

const choicesHtml = (wordHref: string) => choicesHtmlG(CHOICES_HEADING, europassChoices(wordHref), EUROPASS_WHATSAPP_HREF);

const quizHtml = () => quizHtmlG({ id: 'do-i-need', heading: QUIZ_HEADING, intro: QUIZ_INTRO, questions: QUIZ, results: Object.values(QUIZ_RESULTS) });

const ownPreviewHtml = () =>
  `<figure><img src="${EUROPASS_PREVIEW.src}" width="${EUROPASS_PREVIEW.w}" height="${EUROPASS_PREVIEW.h}" alt="${esc(EUROPASS_PREVIEW.alt)}" loading="eager" fetchpriority="high" /><figcaption>${esc(EUROPASS_PREVIEW.caption)}</figcaption></figure>`;

const faqHtml = (items: Faq[]) => faqHtmlG('Questions about the Europass-style CV', items);

const footerHtml = (withSources: boolean) =>
  footerHtmlG({ sources: withSources ? EUROPASS_SOURCES : undefined, updated: EUROPASS_UPDATED, checked: EUROPASS_CHECKED, author: EUROPASS_AUTHOR, lines: [EUROPASS_PRIVACY, EUROPASS_UNOFFICIAL] });

const webPageLd = (path: string, type: 'WebPage' | 'CollectionPage', extra: Record<string, unknown> = {}) =>
  webPageLdG({ path, type, name: EUROPASS_SEO[path as keyof typeof EUROPASS_SEO].h1, description: EUROPASS_SEO[path as keyof typeof EUROPASS_SEO].description, date: EUROPASS_UPDATED, author: EUROPASS_AUTHOR, extra });
const imageLd = (t: HubTemplate) => ({ '@type': 'ImageObject', contentUrl: `${SITE}${t.full}`, url: `${SITE}${t.full}`, name: t.name, caption: imageAlt(t), width: t.fullW, height: t.fullH });

const imgHtml = (t: HubTemplate, eager: boolean, full = false) =>
  `<img src="${full ? t.full : t.thumb}" width="${full ? t.fullW : t.w}" height="${full ? t.fullH : t.h}" alt="${esc(imageAlt(t))}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} />`;

export function europassPages(): EuropassPage[] {
  const tpls = europassHubTemplates();
  const pillar = EUROPASS_SEO[EUROPASS_PILLAR_PATH];
  const hub = EUROPASS_SEO[EUROPASS_HUB_PATH];
  const word = EUROPASS_SEO[EUROPASS_WORD_PATH];

  const pillarPage: EuropassPage = {
    path: EUROPASS_PILLAR_PATH,
    ...pillar,
    image: `${SITE}${EUROPASS_OG.src}`,
    body: `<article><h1>${esc(pillar.h1)}</h1><p><strong>${esc(PILLAR_ANSWER)}</strong></p>${choicesHtml(EUROPASS_WORD_PATH)}${PILLAR_INTRO.map((x) => `<p>${esc(x)}</p>`).join('')}<p>${a(EUROPASS_HUB_PATH, 'All Europass-style templates')}</p>${ownPreviewHtml()}${blockHtml(PILLAR_BLOCKS.find((b) => b.id === 'how')!)}${quizHtml()}${PILLAR_BLOCKS.filter((b) => b.id !== 'how').map((b) => blockHtml(b, PILLAR_FOLDED)).join('')}${faqHtml(PILLAR_FAQ)}<p>${a('/tools/cv-checker', 'Free CV checker')} · ${a('/pro', 'Pro')} · ${a('/services', 'CV writing service')}</p>${footerHtml(true)}</article>`,
    jsonLd: [
      webPageLd(EUROPASS_PILLAR_PATH, 'WebPage', { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${SITE}${EUROPASS_PREVIEW.src}`, url: `${SITE}${EUROPASS_PREVIEW.src}`, name: 'Europass-style CV preview (sample data)', caption: EUROPASS_PREVIEW.alt, width: EUROPASS_PREVIEW.w, height: EUROPASS_PREVIEW.h } }),
      {
        '@type': 'WebApplication',
        name: 'HereWeGrow Europass-style CV builder',
        url: `${SITE}${EUROPASS_BUILDER_HREF}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' },
        publisher: { '@id': `${SITE}/#org` },
      },
      faqLd(PILLAR_FAQ),
      crumbsLd([['HereWeGrow', '/'], ['Europass CV', EUROPASS_PILLAR_PATH]]),
    ],
    priority: 0.9,
    lastmod: EUROPASS_UPDATED,
    images: [`${SITE}${EUROPASS_PREVIEW.src}`],
  };

  const hubPage: EuropassPage = {
    path: EUROPASS_HUB_PATH,
    ...hub,
    image: `${SITE}${EUROPASS_OG.src}`,
    body: `<article><h1>${esc(hub.h1)}</h1><p>${esc(HUB_INTRO)}</p>${choicesHtml('#templates')}<p>${a(EUROPASS_PILLAR_PATH, 'Europass CV guide')} · ${a(EUROPASS_WORD_PATH, 'Word template details')}</p><ul id="templates">${tpls.map((t, i) => `<li><a href="${t.path}">${imgHtml(t, i === 0)}</a><h3>${a(t.path, t.name)}</h3><p>${t.pages} ${t.pages === 1 ? 'page' : 'pages'}, ${esc(t.color.toLowerCase())}. Word template ${EUROPASS_PRICES.single}.</p></li>`).join('')}</ul><section id="choose"><h2>How to choose a Europass-style template</h2><ul>${HUB_CHOOSE.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>${faqHtml(HUB_FAQ)}<p>${a('/templates', 'All CV templates')} · ${a('/tools/cv-checker', 'Free CV checker')} · ${a('/pro', 'Pro')}</p>${footerHtml(false)}</article>`,
    jsonLd: [
      webPageLd(EUROPASS_HUB_PATH, 'CollectionPage', {
        mainEntity: { '@type': 'ItemList', numberOfItems: tpls.length, itemListElement: tpls.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${t.path}`, name: t.name, image: `${SITE}${t.thumb}` })) },
      }),
      crumbsLd([['HereWeGrow', '/'], ['Templates', '/templates'], ['Europass-style CV', EUROPASS_HUB_PATH]]),
    ],
    priority: 0.8,
    lastmod: EUROPASS_UPDATED,
    images: tpls.map((t) => `${SITE}${t.thumb}`),
  };

  const wordTpls = tpls.slice(0, 5);
  const wordPage: EuropassPage = {
    path: EUROPASS_WORD_PATH,
    ...word,
    image: `${SITE}${EUROPASS_OG.src}`,
    body: `<article><h1>${esc(word.h1)}</h1><p><strong>${esc(WORD_ANSWER)}</strong></p>${choicesHtml('#templates')}<p>${a(EUROPASS_PILLAR_PATH, 'Europass CV guide')} · ${a(EUROPASS_HUB_PATH, 'All Europass-style templates')}</p><ul id="templates">${wordTpls.map((t, i) => `<li><a href="${t.path}">${imgHtml(t, i === 0, true)}</a><p>${a(t.path, t.name)}</p></li>`).join('')}</ul>${WORD_BLOCKS.map((b) => blockHtml(b, WORD_FOLDED)).join('')}${faqHtml(WORD_FAQ)}<p>${a('/templates', 'All CV templates')} · ${a('/tools/cv-checker', 'Free CV checker')} · ${a('/pro', 'Pro')}</p>${footerHtml(false)}</article>`,
    jsonLd: [
      webPageLd(EUROPASS_WORD_PATH, 'WebPage', { primaryImageOfPage: imageLd(wordTpls[0]) }),
      ...wordTpls.map(imageLd),
      faqLd(WORD_FAQ),
      crumbsLd([['HereWeGrow', '/'], ['Europass CV', EUROPASS_PILLAR_PATH], ['Word template', EUROPASS_WORD_PATH]]),
    ],
    priority: 0.8,
    lastmod: EUROPASS_UPDATED,
    images: wordTpls.map((t) => `${SITE}${t.full}`),
  };

  return [pillarPage, hubPage, wordPage];
}
