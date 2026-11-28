// Plain-HTML body and JSON-LD for /cv-format-bd. WebPage + BreadcrumbList only (no FAQPage).
import { esc } from './pageHtml';
import { SITE, a, blockHtml, crumbsLd, faqHtml, footerHtml, webPageLd } from './seoPageHtml';
import {
  CV_FORMAT_ANSWER, CV_FORMAT_AUTHOR, CV_FORMAT_CHECKED, CV_FORMAT_FAQ, CV_FORMAT_FAQ_HEADING, CV_FORMAT_GALLERY_HEADING, CV_FORMAT_GALLERY_LINKS, CV_FORMAT_GALLERY_NOTE, CV_FORMAT_LINKS, CV_FORMAT_LINKS_HEADING, CV_FORMAT_NOTE, CV_FORMAT_PATH, CV_FORMAT_SEO, CV_FORMAT_SOURCES, CV_FORMAT_TOC_HEADING, CV_FORMAT_UPDATED, CV_FORMAT_WRITE_LINK,
  cvFormatGallery, cvFormatSections, cvFormatToc, type SampleCv,
} from './cvFormatPage';

export interface CvFormatBuildPage {
  path: string;
  title: string;
  description: string;
  image: string;
  body: string;
  jsonLd: unknown[];
  priority: number;
  lastmod: string;
}

const sampleHtml = (c: SampleCv) =>
  `<section id="${c.id}"><h2>${esc(c.h2)}</h2><p>${esc(c.intro)}</p><div class="sample-cv"><p><strong>${esc(c.label)}</strong></p><h3>${esc(c.name)}</h3><p>${esc(c.contact)}</p>${c.sections.map((sec) => `<h4>${esc(sec.h)}</h4>${sec.entries.map((e) => `${e.head ? `<p><strong>${esc(e.head)}</strong></p>` : ''}${(e.lines ?? []).map((l) => `<p>${esc(l)}</p>`).join('')}${e.bullets ? `<ul>${e.bullets.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`).join('')}`).join('')}</div></section>`;

const galleryHtml = () =>
  `<h3>${esc(CV_FORMAT_GALLERY_HEADING)}</h3><p>${esc(CV_FORMAT_GALLERY_NOTE)}</p><ul class="template-gallery">${cvFormatGallery().map((g) => `<li><a href="${g.href}"><img src="${g.img}" alt="${esc(g.alt)}" width="420" height="544" loading="lazy"><br>${esc(g.label)}</a><br>${esc(g.kind)}</li>`).join('')}</ul><p>${CV_FORMAT_GALLERY_LINKS.map((l) => a(l.href, l.text)).join(' | ')}</p>`;

const sectionsHtml = () =>
  cvFormatSections().map((x) => {
    if (x.kind === 'sample') return sampleHtml(x.s);
    const h = blockHtml(x.b);
    return x.gallery ? h.replace(/<\/section>$/, `${galleryHtml()}</section>`) : h;
  }).join('');

const tocHtml = () => `<nav id="toc" aria-label="${esc(CV_FORMAT_TOC_HEADING)}"><p><strong>${esc(CV_FORMAT_TOC_HEADING)}</strong></p><ol>${cvFormatToc().map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></nav><p>${esc(CV_FORMAT_WRITE_LINK.lead)} ${a(CV_FORMAT_WRITE_LINK.href, CV_FORMAT_WRITE_LINK.text)}</p>`;

export function cvFormatPage(): CvFormatBuildPage {
  const body = `<article><h1>${esc(CV_FORMAT_SEO.h1)}</h1><p><strong>${esc(CV_FORMAT_ANSWER)}</strong></p>${tocHtml()}${sectionsHtml()}${faqHtml(CV_FORMAT_FAQ_HEADING, CV_FORMAT_FAQ)}<section id="more"><h2>${esc(CV_FORMAT_LINKS_HEADING)}</h2><ul>${CV_FORMAT_LINKS.map((l) => `<li>${a(l.href, l.text)}</li>`).join('')}</ul></section>${footerHtml({ sources: CV_FORMAT_SOURCES, updated: CV_FORMAT_UPDATED, checked: CV_FORMAT_CHECKED, author: CV_FORMAT_AUTHOR, lines: [CV_FORMAT_NOTE] })}</article>`;
  return {
    path: CV_FORMAT_PATH,
    title: CV_FORMAT_SEO.title,
    description: CV_FORMAT_SEO.description,
    image: `${SITE}/og.jpg`,
    body,
    jsonLd: [
      webPageLd({ path: CV_FORMAT_PATH, type: 'WebPage', name: CV_FORMAT_SEO.h1, description: CV_FORMAT_SEO.description, date: CV_FORMAT_UPDATED, author: CV_FORMAT_AUTHOR }),
      crumbsLd([['HereWeGrow', '/'], ['CV format', CV_FORMAT_PATH]]),
    ],
    priority: 0.9,
    lastmod: CV_FORMAT_UPDATED,
  };
}
