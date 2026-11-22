// Plain-HTML body and JSON-LD for /cv-format-bd. WebPage + BreadcrumbList only (no FAQPage).
import { esc } from './pageHtml';
import { SITE, a, blockHtml, crumbsLd, faqHtml, footerHtml, webPageLd } from './seoPageHtml';
import {
  CV_FORMAT_ANSWER, CV_FORMAT_AUTHOR, CV_FORMAT_BLOCKS, CV_FORMAT_FAQ, CV_FORMAT_FAQ_HEADING, CV_FORMAT_LINKS, CV_FORMAT_LINKS_HEADING, CV_FORMAT_NOTE, CV_FORMAT_PATH, CV_FORMAT_SEO, CV_FORMAT_UPDATED,
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

export function cvFormatPage(): CvFormatBuildPage {
  const body = `<article><h1>${esc(CV_FORMAT_SEO.h1)}</h1><p><strong>${esc(CV_FORMAT_ANSWER)}</strong></p>${CV_FORMAT_BLOCKS.map((b) => blockHtml(b)).join('')}${faqHtml(CV_FORMAT_FAQ_HEADING, CV_FORMAT_FAQ)}<section id="more"><h2>${esc(CV_FORMAT_LINKS_HEADING)}</h2><ul>${CV_FORMAT_LINKS.map((l) => `<li>${a(l.href, l.text)}</li>`).join('')}</ul></section>${footerHtml({ updated: CV_FORMAT_UPDATED, checked: CV_FORMAT_UPDATED, author: CV_FORMAT_AUTHOR, lines: [CV_FORMAT_NOTE] })}</article>`;
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
