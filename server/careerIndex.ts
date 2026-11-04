// The /careers index: every published role as a crawlable link, grouped by field.
// Rendered from D1 on request (cached for 5 minutes), so publishing or unpublishing a role
// shows up here without any extra step.

import type { D1Like } from './cf';
import { CSS, ldJson } from './careerPage';
import { escapeHtml as esc } from './markdown';

const SITE = 'https://herewegrow.pro';

export const INDEX_TITLE = 'Career Roles in Bangladesh: Salary and Skills | HereWeGrow';
export const INDEX_DESC =
  'Browse job roles in Bangladesh with salary ranges, the skills employers want, who hires, courses and a free skill test. Checked and updated regularly.';

export interface IndexRole {
  slug: string;
  title_en: string;
  title_bn: string | null;
  field: string | null;
  summary: string | null;
}

const OTHER = 'Other';
const fieldSlug = (field: string) => field.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 3).trimEnd()}...` : s);

const EXTRA_CSS = `
main.wide{max-width:960px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px;padding:0;list-style:none}
.chips a{display:inline-block;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;text-decoration:none;font-size:.9rem;color:var(--ink)}
.chips a[aria-current="true"]{background:var(--blue);border-color:var(--blue);color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;padding:0;list-style:none}
.grid li{margin:0}.role{display:block;height:100%;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;text-decoration:none;color:var(--ink)}
.role:hover{border-color:var(--blue)}.role strong{display:block;font-size:1.05rem;color:var(--blue)}.role .bn{color:var(--muted);font-size:.9rem}.role p{margin:.5em 0 0;color:var(--muted);font-size:.9rem}
`;

export function renderCareersIndex(roles: IndexRole[]): string {
  const url = `${SITE}/careers`;
  const groups = new Map<string, IndexRole[]>();
  for (const r of [...roles].sort((a, b) => a.title_en.localeCompare(b.title_en))) {
    const f = r.field?.trim() || OTHER;
    groups.set(f, [...(groups.get(f) ?? []), r]);
  }
  const fields = [...groups.keys()].sort((a, b) => (a === OTHER ? 1 : b === OTHER ? -1 : a.localeCompare(b)));

  const jsonLd: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'HereWeGrow', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Careers', item: url },
      ],
    },
  ];
  if (roles.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Career roles in Bangladesh',
      numberOfItems: roles.length,
      itemListElement: fields.flatMap((f) => groups.get(f)!).map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/careers/${r.slug}`, name: r.title_en })),
    });
  }

  const chips =
    fields.length > 1
      ? `<ul class="chips" aria-label="Filter by field"><li><a href="#all" data-field="" aria-current="true">All</a></li>${fields
          .map((f) => `<li><a href="#field-${fieldSlug(f)}" data-field="${fieldSlug(f)}">${esc(f)}</a></li>`)
          .join('')}</ul>`
      : '';
  const sections = fields
    .map(
      (f) =>
        `<section data-field="${fieldSlug(f)}" id="field-${fieldSlug(f)}"><h2>${esc(f)}</h2><ul class="grid">${groups
          .get(f)!
          .map(
            (r) =>
              `<li><a class="role" href="/careers/${esc(r.slug)}"><strong>${esc(r.title_en)}</strong>${r.title_bn ? `<span class="bn">${esc(r.title_bn)}</span>` : ''}${
                r.summary ? `<p>${esc(clip(r.summary, 140))}</p>` : ''
              }</a></li>`,
          )
          .join('')}</ul></section>`,
    )
    .join('');
  const empty = `<div class="card"><p>The first career role guides are on the way. Meanwhile, read our <a href="/guides">career guides</a> or <a href="/builder">build your CV free</a>.</p></div>`;

  // Filter without a page reload; the anchors still work with scripts off.
  const script = fields.length > 1
    ? `<script>document.querySelectorAll('.chips a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var f=a.getAttribute('data-field');document.querySelectorAll('.chips a').forEach(function(x){x.removeAttribute('aria-current')});a.setAttribute('aria-current','true');document.querySelectorAll('section[data-field]').forEach(function(s){s.hidden=!!f&&s.getAttribute('data-field')!==f})})})</script>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(INDEX_TITLE)}</title>
<meta name="description" content="${esc(INDEX_DESC)}" />
<link rel="canonical" href="${url}" />
${roles.length ? '' : '<meta name="robots" content="noindex" />\n'}<meta property="og:type" content="website" />
<meta property="og:site_name" content="HereWeGrow" />
<meta property="og:title" content="${esc(INDEX_TITLE)}" />
<meta property="og:description" content="${esc(INDEX_DESC)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>${CSS}${EXTRA_CSS}</style>
${jsonLd.map((d) => `<script type="application/ld+json">${ldJson(d)}</script>`).join('\n')}
</head>
<body>
<header class="site"><a href="/">HereWeGrow</a></header>
<main class="wide" id="all">
<nav class="crumbs"><a href="/">Home</a> / Careers</nav>
<h1>Career roles in Bangladesh</h1>
<p class="sub">Salary ranges, skills employers look for, who hires, courses to close the gap and a free skill test for each role.</p>
${roles.length ? chips + sections : empty}
<p class="note">Salary figures are ranges with a last-checked date on each role page. Some course links are affiliate links.</p>
</main>
${script}
</body>
</html>
`;
}

/** GET /careers: the index of published roles. Always answers, so the menu link never lands on a 404. */
export async function serveCareersIndex(env: { DB?: D1Like }): Promise<Response> {
  const rows = env.DB
    ? ((await env.DB.prepare("SELECT slug, title_en, title_bn, field, summary FROM roles WHERE status = 'published'").all<IndexRole>()).results ?? [])
    : [];
  return new Response(renderCareersIndex(rows), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
