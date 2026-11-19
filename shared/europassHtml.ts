// Plain-HTML body and JSON-LD for the three Europass pages. Used by the build (scripts/seo.ts) so search engines get
// the full text without running JavaScript. The React pages (src/pages/EuropassPages.tsx) show the same copy.

import { esc } from './pageHtml';
import {
  CHOICES_HEADING, EUROPASS_PREVIEW, EUROPASS_WHATSAPP_HREF, PILLAR_FOLDED, QUIZ, QUIZ_HEADING, QUIZ_INTRO, QUIZ_RESULTS, WORD_FOLDED, europassChoices,
  EUROPASS_AUTHOR, EUROPASS_BUILDER_HREF, EUROPASS_CHECKED, EUROPASS_HUB_PATH, EUROPASS_PILLAR_PATH, EUROPASS_PRICES, EUROPASS_PRIVACY,
  EUROPASS_SEO, EUROPASS_SOURCES, EUROPASS_UNOFFICIAL, EUROPASS_UPDATED, EUROPASS_WORD_PATH, HUB_CHOOSE, HUB_FAQ, HUB_INTRO,
  PILLAR_ANSWER, PILLAR_BLOCKS, PILLAR_FAQ, PILLAR_INTRO, WORD_ANSWER, WORD_BLOCKS, WORD_FAQ, europassHubTemplates, imageAlt, EUROPASS_OG,
  type Block, type Faq, type HubTemplate,
} from './europassPages';

const SITE = 'https://herewegrow.pro';
const a = (href: string, text: string) => `<a href="${href}">${esc(text)}</a>`;

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

export function blockHtml(b: Block, folded: readonly string[] = []): string {
  const table = b.table
    ? `<table><thead><tr>${b.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : '';
  const inner = `${(b.p ?? []).map((x) => `<p>${esc(x)}</p>`).join('')}${b.ul ? `<ul>${b.ul.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${b.ol ? `<ol>${b.ol.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}${table}`;
  return folded.includes(b.id) ? `<details id="${b.id}"><summary><h2>${esc(b.h2)}</h2></summary>${inner}</details>` : `<section id="${b.id}"><h2>${esc(b.h2)}</h2>${inner}</section>`;
}

const choicesHtml = (wordHref: string) => {
  const [build, word, expert] = europassChoices(wordHref);
  return `<section id="choose-path"><h2>${CHOICES_HEADING.en} <span lang="bn">${CHOICES_HEADING.bn}</span></h2><ul>`
    + `<li><h3>${esc(build.title)}</h3><p lang="bn">${esc(build.bn)}</p><p>${esc(build.micro)}</p><p>${a(build.href, build.cta)}</p></li>`
    + `<li><h3>${esc(word.title)}</h3><p lang="bn">${esc(word.bn)}</p><p>${esc(word.micro)}</p><p>${a(word.href, word.cta)}</p></li>`
    + `<li><h3>${esc(expert.title)}</h3><p lang="bn">${esc(expert.bn)}</p><p>${esc(expert.micro)}</p><p>${a(expert.href, expert.cta)} · <a href="${EUROPASS_WHATSAPP_HREF}" rel="noopener">Ask on WhatsApp</a></p></li>`
    + `</ul></section>`;
};

const quizHtml = () =>
  `<section id="do-i-need"><h2>${QUIZ_HEADING.en} <span lang="bn">${QUIZ_HEADING.bn}</span></h2><p>${esc(QUIZ_INTRO)}</p><ol>${QUIZ.map((q) => `<li>${esc(q.q)} ${q.options.map((o) => esc(o.label)).join(' / ')}</li>`).join('')}</ol><ul>${Object.values(QUIZ_RESULTS).map((r) => `<li><strong>${esc(r.title)}.</strong> ${esc(r.body)}</li>`).join('')}</ul></section>`;

const ownPreviewHtml = () =>
  `<figure><img src="${EUROPASS_PREVIEW.src}" width="${EUROPASS_PREVIEW.w}" height="${EUROPASS_PREVIEW.h}" alt="${esc(EUROPASS_PREVIEW.alt)}" loading="eager" fetchpriority="high" /><figcaption>${esc(EUROPASS_PREVIEW.caption)}</figcaption></figure>`;

const faqHtml = (items: Faq[]) => `<details id="faq" open><summary><h2>Questions about the Europass-style CV</h2></summary>${items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</details>`;

const footerHtml = (withSources: boolean) =>
  `${withSources ? `<section id="sources"><h2>Sources</h2><ul>${EUROPASS_SOURCES.map((s) => `<li><a href="${s.url}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></section>` : ''}<p>Last updated ${EUROPASS_UPDATED}. Last checked ${EUROPASS_CHECKED}. By <a href="${EUROPASS_AUTHOR.url}" rel="author">${EUROPASS_AUTHOR.name}</a>, CV consultant, Career Solutions.</p><p>${esc(EUROPASS_PRIVACY)}</p><p>${esc(EUROPASS_UNOFFICIAL)}</p>`;

const faqLd = (items: Faq[]) => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const personLd = { '@type': 'Person', name: EUROPASS_AUTHOR.name, url: EUROPASS_AUTHOR.url };
const crumbsLd = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});
const webPageLd = (path: string, type: 'WebPage' | 'CollectionPage', extra: Record<string, unknown> = {}) => ({
  '@type': type,
  '@id': `${SITE}${path}#webpage`,
  url: `${SITE}${path}`,
  name: EUROPASS_SEO[path as keyof typeof EUROPASS_SEO].h1,
  description: EUROPASS_SEO[path as keyof typeof EUROPASS_SEO].description,
  inLanguage: ['en', 'bn'],
  datePublished: EUROPASS_UPDATED,
  dateModified: EUROPASS_UPDATED,
  author: personLd,
  publisher: { '@id': `${SITE}/#org` },
  ...extra,
});
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
