// Real "last modified" dates for sitemap.xml.
// A page's date moves only when its content changes. Each page's title, description, text,
// structured data and images are fingerprinted; shared/lastmod.json remembers the fingerprint and the
// day it last changed. The build refreshes that file, so after `npm run build` commit it with the change.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export type LastmodFile = Record<string, { h: string; d: string }>;

/** What counts as page content. Anything that changes what Google sees changes the fingerprint. */
interface Fingerprinted {
  path: string;
  title: string;
  description: string;
  body: string;
  jsonLd?: unknown[];
  image?: string;
  images?: string[];
  noindex?: boolean;
  canonical?: string;
  /** Day the page was first published, when it has one (a guide's date, a country page's last check). Used the first time the page is seen. */
  firstDate?: string;
}

export const hashPage = (p: Fingerprinted): string =>
  createHash('sha1')
    .update(JSON.stringify([p.title, p.description, p.body, p.jsonLd ?? null, p.image ?? null, p.images ?? null, !!p.noindex, p.canonical ?? null]))
    .digest('hex')
    .slice(0, 12);

/** Next lastmod file for these pages, and the date of each. Pure: today is passed in. */
export function resolveLastmod(prev: LastmodFile, pages: Fingerprinted[], today: string): { file: LastmodFile; dates: Record<string, string> } {
  const file: LastmodFile = {};
  for (const p of pages) {
    const h = hashPage(p);
    const old = prev[p.path];
    file[p.path] = !old ? { h, d: p.firstDate ?? today } : old.h === h ? old : { h, d: today };
  }
  return { file, dates: Object.fromEntries(Object.entries(file).map(([k, v]) => [k, v.d])) };
}

export const LASTMOD_PATH = new URL('../shared/lastmod.json', import.meta.url);

export const readLastmod = (): LastmodFile => (existsSync(LASTMOD_PATH) ? JSON.parse(readFileSync(LASTMOD_PATH, 'utf8')) : {});

/** Sorted keys and one line per page keep the diff small. */
export function writeLastmod(file: LastmodFile): void {
  const lines = Object.keys(file)
    .sort()
    .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(file[k])}`);
  writeFileSync(LASTMOD_PATH, `{\n${lines.join(',\n')}\n}\n`);
}
