// Plain-HTML pieces shared by the prerendered long pages (Europass pages, higher study pages).
// The React twins live in src/components/seo/. Both read the same data, so crawlers and visitors see the same copy.

import { esc } from './pageHtml';
import type { Block, Choice, Faq, QuizQuestion, QuizResult, Source } from './seoPage';

export const SITE = 'https://herewegrow.pro';
export const a = (href: string, text: string) => `<a href="${href}">${esc(text)}</a>`;

/** One section. Ids listed in `folded` become closed accordions: the text stays in the HTML. */
export function blockHtml(b: Block, folded: readonly string[] = []): string {
  const table = b.table
    ? `<table><thead><tr>${b.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : '';
  const inner = `${(b.p ?? []).map((x) => `<p>${esc(x)}</p>`).join('')}${b.ul ? `<ul>${b.ul.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${b.ol ? `<ol>${b.ol.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}${table}${b.source ? `<p>Source: <a href="${b.source.url}" rel="noopener">${esc(b.source.title)}</a>. Last checked ${b.source.checked}.</p>` : ''}`;
  return folded.includes(b.id) ? `<details id="${b.id}"><summary><h2>${esc(b.h2)}</h2></summary>${inner}</details>` : `<section id="${b.id}"><h2>${esc(b.h2)}</h2>${inner}</section>`;
}

export function choicesHtml(heading: { en: string; bn: string }, choices: Choice[], whatsappHref: string): string {
  const [build, word, expert] = choices;
  const alt = (c: Choice) => (c.alt ? ` · ${a(c.alt.href, c.alt.label)}` : '');
  return `<section id="choose-path"><h2>${heading.en} <span lang="bn">${heading.bn}</span></h2><ul>`
    + `<li><h3>${esc(build.title)}</h3><p lang="bn">${esc(build.bn)}</p><p>${esc(build.micro)}</p><p>${a(build.href, build.cta)}${alt(build)}</p></li>`
    + `<li><h3>${esc(word.title)}</h3><p lang="bn">${esc(word.bn)}</p><p>${esc(word.micro)}</p><p>${a(word.href, word.cta)}</p></li>`
    + `<li><h3>${esc(expert.title)}</h3><p lang="bn">${esc(expert.bn)}</p><p>${esc(expert.micro)}</p><p>${a(expert.href, expert.cta)} · <a href="${whatsappHref}" rel="noopener">Ask on WhatsApp</a></p></li>`
    + `</ul></section>`;
}

/** The helper quiz as text: every question and every possible answer, so the logic is readable without JavaScript. */
export function quizHtml(opts: { id: string; heading: { en: string; bn: string }; intro: string; questions: QuizQuestion[]; results: QuizResult[]; withActions?: boolean }): string {
  const { id, heading, intro, questions, results, withActions } = opts;
  const acts = (r: QuizResult) => (withActions ? ` ${r.actions.map((x) => a(x.href, x.label)).join(' · ')}` : '');
  return `<section id="${id}"><h2>${heading.en} <span lang="bn">${heading.bn}</span></h2><p>${esc(intro)}</p><ol>${questions.map((q) => `<li>${esc(q.q)} ${q.options.map((o) => esc(o.label)).join(' / ')}</li>`).join('')}</ol><ul>${results.map((r) => `<li><strong>${esc(r.title)}.</strong> ${esc(r.body)}${acts(r)}</li>`).join('')}</ul></section>`;
}

export const faqHtml = (heading: string, items: Faq[]) => `<details id="faq" open><summary><h2>${esc(heading)}</h2></summary>${items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</details>`;

export function footerHtml(o: { sources?: Source[]; updated: string; checked: string; author: { name: string; url: string }; lines: string[] }): string {
  return `${o.sources ? `<section id="sources"><h2>Sources</h2><ul>${o.sources.map((s) => `<li><a href="${s.url}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></section>` : ''}<p>Last updated ${o.updated}. Last checked ${o.checked}. By <a href="${o.author.url}" rel="author">${o.author.name}</a>, CV consultant, Career Solutions.</p>${o.lines.map((l) => `<p>${esc(l)}</p>`).join('')}`;
}

export const faqLd = (items: Faq[]) => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
export const personLd = (author: { name: string; url: string }) => ({ '@type': 'Person', name: author.name, url: author.url });
export const crumbsLd = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});
export function webPageLd(o: { path: string; type: 'WebPage' | 'CollectionPage'; name: string; description: string; date: string; author: { name: string; url: string }; extra?: Record<string, unknown> }) {
  return {
    '@type': o.type,
    '@id': `${SITE}${o.path}#webpage`,
    url: `${SITE}${o.path}`,
    name: o.name,
    description: o.description,
    inLanguage: ['en', 'bn'],
    datePublished: o.date,
    dateModified: o.date,
    author: personLd(o.author),
    publisher: { '@id': `${SITE}/#org` },
    ...o.extra,
  };
}
