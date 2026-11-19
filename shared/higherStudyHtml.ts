// Plain-HTML body and JSON-LD for the three higher study pages. Used by the build (scripts/seo.ts) so search engines get
// the full text without running JavaScript. The React pages (src/pages/HigherStudyPages.tsx) show the same copy.

import { esc } from './pageHtml';
import {
  SITE, a, blockHtml, choicesHtml, crumbsLd, faqHtml, faqLd, footerHtml, quizHtml, webPageLd,
} from './seoPageHtml';
import {
  ACADEMIC_BUILDER_HREF, ACADEMIC_PATH, ACADEMIC_PREVIEW, BN_KEYWORD, CHOICES_HEADING, HOW_STEP_ID, HS_AUTHOR, HS_CHECKED, HS_CONTENT, HS_NOTE, HS_PRICES, HS_PRIVACY, HS_UPDATED,
  HS_WHATSAPP_HREF, HUB_PATH, HUB_PICKS, HUB_PICKS_HEADING, HUB_PREVIEWS, HUB_TOOLS, HUB_TOOLS_HEADING, SCHOLARSHIP_BN_LINE, SCHOLARSHIP_BUILDER_HREF, SCHOLARSHIP_PATH,
  SCHOLARSHIP_PREVIEW, SCHOLARSHIP_QUIZ, SCHOLARSHIP_QUIZ_HEADING, SCHOLARSHIP_QUIZ_INTRO, SCHOLARSHIP_QUIZ_RESULTS, WORD_SECTION, higherStudyChoices, higherStudyTemplates, templateAlt,
  type HsPath, type HsPreview, type HsTemplate,
} from './higherStudyPages';

export interface HigherStudyPage {
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

const abs = (p: string) => `${SITE}${p}`;

const choices = (p: HsPath) => choicesHtml(CHOICES_HEADING, higherStudyChoices(p), HS_WHATSAPP_HREF);

const figureHtml = (p: HsPreview, eager: boolean, href?: string) => {
  const img = `<img src="${p.thumb}" width="${p.tw}" height="${p.th}" alt="${esc(p.alt)}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} />`;
  return `<figure>${href ? `<a href="${href}">${img}</a>` : img}<figcaption>${esc(p.caption)}</figcaption></figure>`;
};

const templatesHtml = (bn: string, tpls: HsTemplate[]) =>
  `<section id="${WORD_SECTION.id}"><h2>${esc(WORD_SECTION.h2)} <span lang="bn">${WORD_SECTION.bn}</span></h2><p>${esc(WORD_SECTION.intro)}</p><ul>${tpls.map((t) => `<li><a href="${t.path}"><img src="${t.thumb}" width="${t.w}" height="${t.h}" alt="${esc(templateAlt(t, bn))}" loading="lazy" /></a><h3>${a(t.path, t.name)}</h3><p>${esc(t.note)} Word template ${HS_PRICES.single}.</p></li>`).join('')}</ul></section>`;

const footer = (path: HsPath) =>
  footerHtml({ sources: HS_CONTENT[path].sources, updated: HS_UPDATED, checked: HS_CHECKED, author: HS_AUTHOR, lines: [HS_PRIVACY, HS_NOTE] });

const previewLd = (p: HsPreview, name: string) => ({ '@type': 'ImageObject', contentUrl: abs(p.src), url: abs(p.src), name, caption: p.alt, width: p.w, height: p.h });

const builderLd = (name: string, href: string) => ({
  '@type': 'WebApplication',
  name,
  url: abs(href),
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' },
  publisher: { '@id': `${SITE}/#org` },
});

const ld = (path: HsPath, type: 'WebPage' | 'CollectionPage', extra?: Record<string, unknown>) =>
  webPageLd({ path, type, name: HS_CONTENT[path].seo.h1, description: HS_CONTENT[path].seo.description, date: HS_UPDATED, author: HS_AUTHOR, extra });

export function higherStudyPages(): HigherStudyPage[] {
  const tpls = higherStudyTemplates();
  const academic = HS_CONTENT[ACADEMIC_PATH];
  const scholarship = HS_CONTENT[SCHOLARSHIP_PATH];
  const hub = HS_CONTENT[HUB_PATH];
  const templateImages = tpls.map((t) => abs(t.thumb));

  const academicPage: HigherStudyPage = {
    path: ACADEMIC_PATH,
    ...academic.seo,
    image: abs(ACADEMIC_PREVIEW.og),
    body: `<article><h1>${esc(academic.seo.h1)}</h1><p><strong>${esc(academic.answer)}</strong></p>${choices(ACADEMIC_PATH)}${academic.intro.map((x) => `<p>${esc(x)}</p>`).join('')}<p>${a(HUB_PATH, 'Higher study CV: which one do I need?')} · ${a(SCHOLARSHIP_PATH, 'Scholarship CV format')}</p>${figureHtml(ACADEMIC_PREVIEW, true)}${blockHtml(academic.blocks.find((b) => b.id === HOW_STEP_ID)!)}${templatesHtml(BN_KEYWORD[ACADEMIC_PATH], tpls)}${academic.blocks.filter((b) => b.id !== HOW_STEP_ID).map((b) => blockHtml(b, academic.folded)).join('')}<p>${a(ACADEMIC_BUILDER_HREF, 'Build an academic CV free')}</p>${faqHtml(academic.faqHeading, academic.faq)}<p>${a('/tools/cv-checker', 'Free CV checker')} · ${a('/templates', 'All CV templates')} · ${a('/pro', 'Pro')} · ${a('/services', 'Academic CV and SOP services')}</p>${footer(ACADEMIC_PATH)}</article>`,
    jsonLd: [
      ld(ACADEMIC_PATH, 'WebPage', { primaryImageOfPage: previewLd(ACADEMIC_PREVIEW, 'Academic CV preview (sample data)') }),
      builderLd('HereWeGrow academic CV builder', ACADEMIC_BUILDER_HREF),
      faqLd(academic.faq),
      crumbsLd([['HereWeGrow', '/'], ['Higher study CV', HUB_PATH], ['Academic CV', ACADEMIC_PATH]]),
    ],
    priority: 0.9,
    lastmod: HS_UPDATED,
    images: [abs(ACADEMIC_PREVIEW.src), ...templateImages],
  };

  const scholarshipPage: HigherStudyPage = {
    path: SCHOLARSHIP_PATH,
    ...scholarship.seo,
    image: abs(SCHOLARSHIP_PREVIEW.og),
    body: `<article><h1>${esc(scholarship.seo.h1)}</h1><p lang="bn">${esc(SCHOLARSHIP_BN_LINE)}</p><p><strong>${esc(scholarship.answer)}</strong></p>${choices(SCHOLARSHIP_PATH)}${scholarship.intro.map((x) => `<p>${esc(x)}</p>`).join('')}<p>${a(HUB_PATH, 'Higher study CV: which one do I need?')} · ${a(ACADEMIC_PATH, 'Academic CV format')}</p>${figureHtml(SCHOLARSHIP_PREVIEW, true)}${blockHtml(scholarship.blocks.find((b) => b.id === HOW_STEP_ID)!)}${quizHtml({ id: 'which-format', heading: SCHOLARSHIP_QUIZ_HEADING, intro: SCHOLARSHIP_QUIZ_INTRO, questions: SCHOLARSHIP_QUIZ, results: Object.values(SCHOLARSHIP_QUIZ_RESULTS), withActions: true })}${templatesHtml(BN_KEYWORD[SCHOLARSHIP_PATH], tpls)}${scholarship.blocks.filter((b) => b.id !== HOW_STEP_ID).map((b) => blockHtml(b, scholarship.folded)).join('')}<p>${a(SCHOLARSHIP_BUILDER_HREF, 'Build a scholarship CV free')}</p>${faqHtml(scholarship.faqHeading, scholarship.faq)}<p>${a('/tools/cv-checker', 'Free CV checker')} · ${a('/templates', 'All CV templates')} · ${a('/pro', 'Pro')} · ${a('/services', 'Academic CV and SOP services')}</p>${footer(SCHOLARSHIP_PATH)}</article>`,
    jsonLd: [
      ld(SCHOLARSHIP_PATH, 'WebPage', { primaryImageOfPage: previewLd(SCHOLARSHIP_PREVIEW, 'Scholarship CV preview (sample data)') }),
      builderLd('HereWeGrow scholarship CV builder', SCHOLARSHIP_BUILDER_HREF),
      faqLd(scholarship.faq),
      crumbsLd([['HereWeGrow', '/'], ['Higher study CV', HUB_PATH], ['Scholarship CV', SCHOLARSHIP_PATH]]),
    ],
    priority: 0.8,
    lastmod: HS_UPDATED,
    images: [abs(SCHOLARSHIP_PREVIEW.src), ...templateImages],
  };

  const list = [
    { name: 'Scholarship CV format for Bangladeshi students', path: SCHOLARSHIP_PATH },
    { name: 'Academic CV format, template and free maker', path: ACADEMIC_PATH },
    ...HUB_TOOLS.map((t) => ({ name: t.label, path: t.href })),
  ].filter((x, i, all) => all.findIndex((y) => y.path === x.path) === i);
  const hubPage: HigherStudyPage = {
    path: HUB_PATH,
    ...hub.seo,
    image: abs(SCHOLARSHIP_PREVIEW.og),
    body: `<article><h1>${esc(hub.seo.h1)}</h1><p><strong>${esc(hub.answer)}</strong></p>${choices(HUB_PATH)}${hub.intro.map((x) => `<p>${esc(x)}</p>`).join('')}${HUB_PREVIEWS.map((p, i) => figureHtml(p, i === 0, i === 0 ? SCHOLARSHIP_PATH : ACADEMIC_PATH)).join('')}<section id="which-cv"><h2>${esc(HUB_PICKS_HEADING)}</h2><ul>${HUB_PICKS.map((p) => `<li>${esc(p.situation)}: ${a(p.href, p.label)}. ${esc(p.note)}</li>`).join('')}</ul></section><section id="tools"><h2>${esc(HUB_TOOLS_HEADING)}</h2><ul>${HUB_TOOLS.map((t) => `<li>${a(t.href, t.label)}: ${esc(t.note)}</li>`).join('')}</ul></section>${templatesHtml(BN_KEYWORD[HUB_PATH], tpls)}${hub.blocks.map((b) => blockHtml(b, hub.folded)).join('')}${faqHtml(hub.faqHeading, hub.faq)}<p>${a(SCHOLARSHIP_PATH, 'Scholarship CV')} · ${a(ACADEMIC_PATH, 'Academic CV')} · ${a('/templates', 'All CV templates')} · ${a('/pro', 'Pro')}</p>${footer(HUB_PATH)}</article>`,
    jsonLd: [
      ld(HUB_PATH, 'CollectionPage', {
        mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(x.path), name: x.name })) },
        primaryImageOfPage: previewLd(HUB_PREVIEWS[0], 'Scholarship CV preview (sample data)'),
      }),
      previewLd(HUB_PREVIEWS[1], 'Academic CV preview (sample data)'),
      faqLd(hub.faq),
      crumbsLd([['HereWeGrow', '/'], ['Higher study CV', HUB_PATH]]),
    ],
    priority: 0.8,
    lastmod: HS_UPDATED,
    images: [abs(SCHOLARSHIP_PREVIEW.src), abs(ACADEMIC_PREVIEW.src), ...templateImages],
  };

  return [academicPage, scholarshipPage, hubPage];
}
