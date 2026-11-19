// Shared site chrome for the server-rendered Career Hub pages (/careers and /careers/<slug>):
// a header and footer that match the main HereWeGrow site, plus the CSS they need.
// No client JavaScript: the nav simply wraps on small screens.

const SITE_NAV: [string, string][] = [
  ['/builder', 'CV builder'],
  ['/templates', 'Templates'],
  ['/biodata', 'Marriage biodata'],
  ['/careers', 'Career roles'],
  ['/tools', 'Free tools'],
  ['/pro', 'Pro'],
];

const FOOTER_LINKS: [string, string][] = [
  ['/builder', 'CV builder'],
  ['/templates', 'CV templates'],
  ['/careers', 'Career roles'],
  ['/guides', 'Career guides'],
  ['/tools/cv-checker', 'Free CV checker'],
  ['/about', 'About us'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms and refunds'],
  ['/order', 'Download your files again'],
];

export const SHELL_CSS = `
header.site{background:#fff;border-bottom:1px solid var(--line);padding:0}
.hdr{max-width:1100px;margin:0 auto;padding:10px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px}
.hdr .brand{display:flex;align-items:center;gap:9px;color:var(--navy);font-weight:700;font-size:1.15rem;text-decoration:none}
.hdr .brand img{width:30px;height:30px;border-radius:8px}
.hdr nav{display:flex;flex-wrap:wrap;gap:2px 4px;flex:1 1 auto}
.hdr nav a{color:var(--ink);text-decoration:none;font-weight:500;font-size:.95rem;padding:6px 10px;border-radius:8px}
.hdr nav a:hover,.hdr nav a[aria-current="page"]{color:var(--blue);background:var(--mist)}
.hdr .hcta{background:var(--blue);color:#fff;text-decoration:none;font-weight:600;font-size:.95rem;padding:8px 16px;border-radius:8px;white-space:nowrap}
@media(max-width:700px){.hdr .hcta{display:none}.hdr nav{flex-basis:100%;order:3}}
footer.site{background:var(--navy);color:rgba(255,255,255,.85);margin-top:40px;padding:36px 20px 28px}
footer.site .ft{max-width:1100px;margin:0 auto}
footer.site .fbrand{display:flex;align-items:center;gap:9px;color:#fff;font-weight:700;font-size:1.2rem}
footer.site .fbrand img{width:30px;height:30px;border-radius:8px}
footer.site p{margin:.6em 0;font-size:.9rem;color:rgba(255,255,255,.72)}
footer.site ul{display:flex;flex-wrap:wrap;gap:6px 22px;list-style:none;padding:0;margin:16px 0}
footer.site a{color:#fff;text-decoration:none;font-size:.92rem}footer.site a:hover{text-decoration:underline}
`;

export function renderSiteHeader(current: string = ''): string {
  return `<header class="site"><div class="hdr"><a class="brand" href="/"><img src="/logo-mark.svg" alt="" width="30" height="30" />HereWeGrow</a>
<nav aria-label="Main">${SITE_NAV.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
<a class="hcta" href="/builder">Build your CV free</a></div></header>`;
}

export function renderSiteFooter(): string {
  return `<footer class="site"><div class="ft">
<p class="fbrand"><img src="/logo-mark.svg" alt="" width="30" height="30" />HereWeGrow</p>
<p>CV writing, CV templates and free job tools for Bangladeshi job seekers.</p>
<nav aria-label="Footer"><ul>${FOOTER_LINKS.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>
<p>HereWeGrow is an independent service and is not affiliated with any employer or bank named on these pages. Salary figures are ranges, not offers. Some course links are affiliate links.</p>
<p>&copy; HereWeGrow</p></div></footer>`;
}
