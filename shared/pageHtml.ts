// Turns the site's empty HTML shell into a ready-made page: title, description, social tags,
// canonical link, structured data, and a plain-HTML copy of the content inside #root.
// Used by the build (scripts/seo.ts) and by the Worker (blog pages), so both write identical pages.

export const SITE = 'https://herewegrow.pro';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface HeadPage {
  path: string;
  title: string;
  description: string;
  image?: string;
  /** Static fallback content placed inside #root. */
  body: string;
  jsonLd?: unknown[];
  /** Path of the page search engines should treat as the original (a template variant points at its lead). Defaults to path. */
  canonical?: string;
}

export function renderPage(template: string, p: HeadPage): string {
  const url = `${SITE}${p.canonical ?? p.path}`;
  const image = p.image ?? `${SITE}/og.jpg`;
  const ld = p.jsonLd?.length
    ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': p.jsonLd }).replace(/</g, '\\u003c')}</script>`
    : '';
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(p.description)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(p.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(p.description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    '</head>',
    `    <meta property="og:locale" content="bn_BD" />\n    <meta property="og:locale:alternate" content="en_US" />\n    <meta name="twitter:card" content="summary_large_image" />\n    ${ld}\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root"><style>#root>main,#root>main *{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif!important}</style><main class="wrap" style="padding:2rem 1.25rem">${p.body}</main></div>`);
}
