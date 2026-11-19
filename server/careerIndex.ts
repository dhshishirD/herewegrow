// The /careers index: every published role as a crawlable link, grouped by field.
// Rendered from D1 on request (cached for 5 minutes), so publishing or unpublishing a role
// shows up here without any extra step.

import type { D1Like } from './cf';
import { CSS, ldJson } from './careerPage';
import { escapeHtml as esc } from './markdown';
import { renderSiteFooter, renderSiteHeader } from './careerShell';

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

/** Small static map that folds near-duplicate fields into one broader group. Unknown fields keep their own name. */
const FIELD_GROUPS: Record<string, string> = {
  'healthcare & medicine': 'Healthcare',
  'healthcare & nursing': 'Healthcare',
  'banking': 'Banking & Finance',
  'finance': 'Banking & Finance',
  'banking & finance': 'Banking & Finance',
};
export const groupOf = (field: string | null | undefined): string => {
  const f = field?.trim();
  return f ? FIELD_GROUPS[f.toLowerCase()] ?? f : OTHER;
};

/** Chips only help once the list is long enough to need filtering. */
export const CHIP_MIN_ROLES = 13;
/** Below this many roles we show a "more roles are coming" card. */
export const MORE_COMING_BELOW = 15;

const EXTRA_CSS = `
main.wide{max-width:1100px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px;padding:0;list-style:none}
.chips a{display:inline-block;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;text-decoration:none;font-size:.9rem;color:var(--ink)}
.chips a[aria-current="true"]{background:var(--blue);border-color:var(--blue);color:#fff}
.funnel{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;background:var(--mist);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:18px 0}
.funnel ol{display:flex;flex-wrap:wrap;gap:6px 10px;margin:0;padding:0;list-style:none;flex:1 1 360px;font-size:.92rem}
.funnel li{background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 12px}.funnel li b{color:var(--blue)}
.funnel .more{flex-basis:100%;margin:0;font-size:.88rem;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:0;list-style:none}
.grid li{margin:0}.role{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;color:var(--ink)}
.role:hover{border-color:var(--blue)}.role h3{margin:0;font-size:1.05rem}.role h3 a{color:var(--blue);text-decoration:none}.role .bn{display:block;color:var(--muted);font-size:.9rem}.role p{margin:.5em 0 .9em;color:var(--muted);font-size:.9rem;flex:1}
.role .cta{align-self:flex-start;padding:7px 14px;font-size:.9rem}.role .kick{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-bottom:4px}.role.soon{background:var(--mist);border-style:dashed}
`;

export function renderCareersIndex(roles: IndexRole[]): string {
  const url = `${SITE}/careers`;
  const groups = new Map<string, IndexRole[]>();
  for (const r of [...roles].sort((a, b) => a.title_en.localeCompare(b.title_en))) {
    const f = groupOf(r.field);
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

  const showChips = roles.length >= CHIP_MIN_ROLES && fields.length > 1;
  const chips =
    showChips
      ? `<ul class="chips" aria-label="Filter by field"><li><a href="#all" data-field="" aria-current="true">All</a></li>${fields
          .map((f) => `<li><a href="#field-${fieldSlug(f)}" data-field="${fieldSlug(f)}">${esc(f)}</a></li>`)
          .join('')}</ul>`
      : '';
  const card = (r: IndexRole, kicker: boolean) =>
    `<li class="role">${kicker ? `<span class="kick">${esc(groupOf(r.field))}</span>` : ''}<h3><a href="/careers/${esc(r.slug)}">${esc(r.title_en)}</a>${r.title_bn ? `<span class="bn">${esc(r.title_bn)}</span>` : ''}</h3>${
      r.summary ? `<p>${esc(clip(r.summary, 140))}</p>` : '<p></p>'
    }<a class="cta" href="/builder">Build a CV for this role</a></li>`;
  // A short list reads better as one wide grid (field shown on each card); a long list is grouped under field headings with filter chips.
  const sections = showChips
    ? fields
        .map((f) => `<section data-field="${fieldSlug(f)}" id="field-${fieldSlug(f)}"><h2>${esc(f)}</h2><ul class="grid">${groups.get(f)!.map((r) => card(r, false)).join('')}</ul></section>`)
        .join('')
    : `<section><h2>All roles</h2><ul class="grid">${fields.flatMap((f) => groups.get(f)!).map((r) => card(r, true)).join('')}</ul></section>`;
  const soon = roles.length < MORE_COMING_BELOW
    ? `<ul class="grid" style="margin-top:16px"><li class="role soon"><h3>More roles are coming</h3><p>We add new role guides every week. Meanwhile, read the <a href="/guides">career guides</a> or pick a CV format from the <a href="/templates">CV templates</a>.</p></li></ul>`
    : '';
  const funnel = `<div class="funnel"><ol><li><b>1</b> Pick a role</li><li><b>2</b> Check the skills</li><li><b>3</b> Build the CV free</li><li><b>4</b> Download with Pro</li></ol><a class="cta" href="/builder">Build your CV free</a><p class="more">Also: <a href="/biodata">marriage biodata maker</a> · <a href="/cv-for-gulf-jobs">CV for Gulf jobs</a> · <a href="/europass-cv">Europass CV for abroad</a> · <a href="/tools/cv-checker">free CV checker</a></p></div>`;
  const empty = `<div class="card"><p>The first career role guides are on the way. Meanwhile, read our <a href="/guides">career guides</a> or <a href="/builder">build your CV free</a>.</p></div>`;

  // Filter without a page reload; the anchors still work with scripts off.
  const script = showChips
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
${renderSiteHeader("/careers")}
<main class="wide" id="all">
<nav class="crumbs"><a href="/">Home</a> / Careers</nav>
<h1>Career roles in Bangladesh</h1>
<p class="sub">Salary ranges, skills employers look for, who hires, courses to close the gap and a free skill test for each role.</p>
${funnel}
${roles.length ? chips + sections + soon : empty}
<p class="note">Salary figures are ranges with a last-checked date on each role page. Some course links are affiliate links.</p>
</main>
${renderSiteFooter()}
${script}
</body>
</html>
`;
}

/** GET /careers: the index of published roles. Always answers, so the menu link never lands on a 404. */
export async function serveCareersIndex(env: { DB?: D1Like }): Promise<Response> {
  let rows: IndexRole[] = [];
  if (env.DB) {
    try {
      rows = (await env.DB.prepare("SELECT slug, title_en, title_bn, field, summary FROM roles WHERE status = 'published'").all<IndexRole>()).results ?? [];
    } catch (e) {
      // Do not crash the Worker (Cloudflare error 1101): log the cause and show the friendly page, uncached and not indexable.
      console.error('careers index: could not read roles from D1', e);
      return new Response(renderCareersIndex([]), {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '60' },
      });
    }
  }
  return new Response(renderCareersIndex(rows), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
