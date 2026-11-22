// Plain-HTML body and JSON-LD for the Bangla letter pages (copy in shared/letterPages.ts). WebPage + BreadcrumbList only (no FAQPage).
import { esc } from './pageHtml';
import { SITE, a, blockHtml, crumbsLd, faqHtml, footerHtml, webPageLd } from './seoPageHtml';
import { LETTERS_UPDATED, LETTER_AUTHOR, LETTER_PAGES } from './letterPages';

export interface LetterBuildPage {
  path: string;
  title: string;
  description: string;
  image: string;
  body: string;
  jsonLd: unknown[];
  priority: number;
  lastmod: string;
}

export function letterPages(): LetterBuildPage[] {
  return LETTER_PAGES.map((l) => ({
    path: l.path,
    title: l.title,
    description: l.description,
    image: `${SITE}/og.jpg`,
    body: `<article><h1>${esc(l.h1)}</h1><p><strong>${esc(l.answer)}</strong></p>${l.blocks.map((b) => blockHtml(b)).join('')}${faqHtml(l.faqHeading, l.faq)}<section id="more"><h2>${esc(l.linksHeading)}</h2><ul>${l.links.map((k) => `<li>${a(k.href, k.text)}</li>`).join('')}</ul></section>${footerHtml({ updated: LETTERS_UPDATED, checked: LETTERS_UPDATED, author: LETTER_AUTHOR, lines: [l.note] })}</article>`,
    jsonLd: [
      webPageLd({ path: l.path, type: 'WebPage', name: l.h1, description: l.description, date: LETTERS_UPDATED, author: LETTER_AUTHOR }),
      crumbsLd([['HereWeGrow', '/'], [l.crumb, l.path]]),
    ],
    priority: 0.8,
    lastmod: LETTERS_UPDATED,
  }));
}
