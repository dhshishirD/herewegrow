import { routeSeo } from '../../shared/seo';

/** /builder?preset=<id> is the same app as /builder: keep it out of search results and point it at the page that explains it. */
const PRESET_PAGES: Record<string, string> = { gulf: '/cv-for-gulf-jobs', europass: '/europass-cv', scholarship: '/scholarship-cv', academic: '/academic-cv' };

/** Canonical path and robots rule for a path plus query string. Pure, so it can be tested. */
export function seoTarget(path: string, search: string): { canonical: string; noindex: boolean } {
  const preset = path === '/builder' ? new URLSearchParams(search).get('preset') : null;
  if (!preset) return { canonical: path === '/' ? '/' : path, noindex: false };
  return { canonical: PRESET_PAGES[preset] ?? '/builder', noindex: true };
}

const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
};

export function setPageMeta(title: string, description: string, path: string) {
  // Search-optimised wording for public pages, the same text the pre-built HTML carries.
  const seo = routeSeo(path);
  if (seo) {
    title = seo.title;
    description = seo.description;
  }
  const full = title.includes('HereWeGrow') ? title : `${title} | HereWeGrow`;
  document.title = full;
  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', full);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', `https://herewegrow.pro${path}`);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  const target = seoTarget(path, window.location.search);
  canonical.href = `https://herewegrow.pro${target.canonical}`;
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonical.href);

  // Only this function adds or removes this tag (it carries data-seo-robots), so other pages' own robots tags are untouched.
  const robots = document.head.querySelector<HTMLMetaElement>('meta[data-seo-robots]');
  if (target.noindex) {
    const el = robots ?? document.createElement('meta');
    el.name = 'robots';
    el.content = 'noindex,follow';
    el.setAttribute('data-seo-robots', '');
    if (!robots) document.head.appendChild(el);
  } else robots?.remove();
}
