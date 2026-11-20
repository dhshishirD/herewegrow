// Renders a published role pack to one self-contained, search-friendly HTML page.
// Only free content goes in: growth plan, goal sheet, cover letter, interview questions
// and CV notes are Pro and never appear here.

import { escapeHtml as esc, renderMarkdown } from './markdown';
import type { RolePack } from './rolePack';
import { renderSiteFooter, renderSiteHeader, SHELL_CSS } from './careerShell';
import { relatedTemplates } from '../shared/careerTemplates';
import { SINGLE_TEMPLATE_PRICE } from '../shared/templates';

const SITE = 'https://herewegrow.pro';

/** JSON for a <script type="application/ld+json"> block that cannot close the tag early. */
export const ldJson = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');

export const CSS = `
:root{--ink:#0b1a33;--muted:#51607a;--line:#e2e8f2;--mist:#f2f5fa;--blue:#1d5bd8;--navy:#0b1f3f}
*{box-sizing:border-box}body{margin:0;font:16px/1.65 system-ui,-apple-system,"Segoe UI","Noto Sans Bengali","Hind Siliguri",sans-serif;color:var(--ink);background:#fbfcfe}
main{max-width:760px;margin:0 auto;padding:28px 20px 64px}h1{font-size:2rem;line-height:1.2;margin:.2em 0}h2{font-size:1.35rem;margin:1.8em 0 .5em}h3{font-size:1.1rem}
.sub{color:var(--muted);margin:0 0 1rem}.crumbs{font-size:.875rem;color:var(--muted)}.crumbs a{color:var(--blue)}
.card{background:var(--mist);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:12px 0}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left}
a{color:var(--blue)}.cta{display:inline-block;background:var(--blue);color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600}
.note{font-size:.875rem;color:var(--muted)}
.table-wrap{overflow-x:auto;margin:12px 0}.table-wrap table{min-width:480px}th{font-size:.875rem;color:var(--muted)}
blockquote{margin:16px 0;padding:12px 16px;border-left:4px solid var(--blue);background:var(--mist);border-radius:0 12px 12px 0}blockquote p{margin:0}
.btn-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:14px 0}.btn-row .free{font-size:.9rem;color:var(--muted)}
.tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;padding:0;list-style:none;margin:12px 0}
.tpl{display:block;height:100%;background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px;text-decoration:none;color:var(--ink)}
.tpl:hover{border-color:var(--blue)}.tpl img{display:block;width:100%;height:auto;aspect-ratio:210/297;object-fit:cover;object-position:top;background:var(--mist);border-radius:6px}
.tpl strong{display:block;margin-top:8px;font-size:.95rem;line-height:1.3}.tpl span{font-size:.85rem;color:var(--muted)}
` + SHELL_CSS;

/** Everything inside <main>: the same HTML for the public page and the admin preview. All text is escaped. */
export function renderRoleBody(pack: RolePack): string {
  const s = pack.salary;
  const courses = pack.courses.length
    ? `<h2>Courses to close the gap</h2><ul>${pack.courses
        .map(
          (c) =>
            `<li><a href="${esc(c.url)}" rel="noopener nofollow${c.is_affiliate ? ' sponsored' : ''}">${esc(c.title)}</a> <span class="note">${esc(c.provider)}</span></li>`,
        )
        .join('')}</ul>${pack.courses.some((c) => c.is_affiliate) ? '<p class="note">Some course links are affiliate links. They cost you nothing extra.</p>' : ''}`
    : '';
  const skills = pack.skills.length
    ? `<h2>Skills employers look for</h2><ul>${pack.skills.map((k) => `<li>${esc(k.name)} <span class="note">(${esc(k.level)})</span></li>`).join('')}</ul>`
    : '';
  const faq = pack.faq.length
    ? `<h2>Frequently asked questions</h2>${pack.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
    : '';

  return `<nav class="crumbs"><a href="/">Home</a> / <a href="/careers">Careers</a> / ${esc(pack.title_en)}</nav>
<h1>${esc(pack.title_en)}</h1>
${pack.title_bn ? `<p class="sub">${esc(pack.title_bn)} · ${esc(pack.field)}</p>` : `<p class="sub">${esc(pack.field)}</p>`}
<p>${esc(pack.summary)}</p>
${buildButton('top')}
<div class="card"><strong>Salary range (BDT per month)</strong>
<table><tr><th>Entry</th><th>Mid</th><th>Senior</th></tr><tr><td>${esc(s.entry)}</td><td>${esc(s.mid)}</td><td>${esc(s.senior)}</td></tr></table>
<p class="note">${esc(s.note)} Last checked ${esc(s.checked)}.</p></div>
<h2>Benefits</h2>${list(pack.benefits)}
<h2>Who hires</h2>${list(pack.companies)}
${pack.season.length ? `<h2>When vacancies appear</h2>${list(pack.season)}` : ''}
${skills}
${renderMarkdown(pack.body_md)}
${courses}
${faq}
${renderRelatedTemplates(pack)}
<p>Check your current CV first with the <a href="/tools/cv-checker">free CV checker</a>.</p>
<div class="card"><strong>Go further with Pro</strong>
<p>Get the full toolkit for this role: a role-specific CV template, cover letter, interview questions and a 1 to 3 year growth plan.</p>
<a class="cta" href="/pro">See Pro</a> <a href="/builder">or build your CV free</a></div>
${buildButton('bottom', pack.title_en)}`;
}

const buildButton = (where: 'top' | 'bottom', title?: string) =>
  `<div class="btn-row" data-build="${where}">${where === 'bottom' && title ? `<strong>Ready to apply as ${esc(title)}?</strong>` : ''}<a class="cta" href="/builder">Build a CV for this role</a><span class="free">Free to build. Pay only if you want to download.</span></div>`;

/** Up to 3 CV formats that suit the role, with preview image, page count and price. */
function renderRelatedTemplates(pack: RolePack): string {
  const tpls = relatedTemplates(pack.title_en, pack.field);
  if (!tpls.length) return '';
  return `<h2>CV formats for this role</h2><ul class="tpls">${tpls
    .map(
      (t) =>
        `<li><a class="tpl" href="/templates/${esc(t.id)}"><img src="/templates/${esc(t.id)}/thumb.webp" alt="${esc(t.title.en)} preview" width="420" height="594" loading="lazy" decoding="async" /><strong>${esc(t.title.en)}</strong><span>${t.pages} ${t.pages === 1 ? 'page' : 'pages'} · BDT ${SINGLE_TEMPLATE_PRICE}</span></a></li>`,
    )
    .join('')}</ul><p><a href="/templates">See all CV templates</a></p>`;
}

export function renderRolePage(pack: RolePack, updatedAt: number): string {
  const url = `${SITE}/careers/${pack.slug}`;
  const title = pack.seo_title ?? `${pack.title_en} in Bangladesh | HereWeGrow`;
  const description = pack.seo_desc ?? (pack.summary.length > 155 ? `${pack.summary.slice(0, 152)}...` : pack.summary);
  const modified = new Date(updatedAt).toISOString();

  const jsonLd: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: `${SITE}/og.jpg`,
      dateModified: modified,
      mainEntityOfPage: url,
      inLanguage: 'en',
      author: { '@type': 'Person', name: 'Daloyar Hassan Shishir', url: `${SITE}/about`, sameAs: ['https://www.dhshishir.com'] },
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'HereWeGrow', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Careers', item: `${SITE}/careers` },
        { '@type': 'ListItem', position: 3, name: pack.title_en, item: url },
      ],
    },
  ];
  if (pack.faq.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pack.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="HereWeGrow" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>${CSS}</style>
${jsonLd.map((d) => `<script type="application/ld+json">${ldJson(d)}</script>`).join('\n')}
</head>
<body>
${renderSiteHeader("/careers")}
<main>
${renderRoleBody(pack)}
</main>
${renderSiteFooter()}
<script src="/career-track.js" defer></script>
</body>
</html>
`;
}
