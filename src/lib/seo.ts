import { routeSeo } from '../../shared/seo';

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
  canonical.href = `https://herewegrow.pro${path === '/' ? '/' : path}`;
}
