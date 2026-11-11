// Admin overrides for the template library. Pure logic shared by the Worker (validation) and the site (applying them).
// A template with no override is exactly what the code ships. Hiding never removes a file or an old order's download.

import { CATEGORIES, TEMPLATES, type Template } from './templates';

export interface TemplateOverride {
  hidden?: boolean;
  featured?: boolean;
  /** Lower comes first within its group; empty means "natural order". */
  sort?: number | null;
  hub?: string | null;
  prof?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
}

export type OverrideMap = Record<string, TemplateOverride>;

export const MAX_TITLE = 120;
export const MAX_PROF = 40;
export const MAX_NOTE = 300;

const HUB_IDS: ReadonlySet<string> = new Set(CATEGORIES.map((c) => c.id));
const IDS: ReadonlySet<string> = new Set(TEMPLATES.map((t) => t.id));

export const isTemplateId = (id: unknown): id is string => typeof id === 'string' && IDS.has(id);

const text = (v: unknown, max: number): string | null | undefined => {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  const s = v.replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : null;
};

/** Keep only well-formed fields of an admin edit. Returns the errors for anything that is present but invalid. */
export function cleanPatch(raw: unknown): { patch: TemplateOverride & { note?: string | null }; errors: string[] } {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const patch: TemplateOverride & { note?: string | null } = {};
  const errors: string[] = [];
  if (b.hidden !== undefined) (typeof b.hidden === 'boolean' ? (patch.hidden = b.hidden) : errors.push('hidden'));
  if (b.featured !== undefined) (typeof b.featured === 'boolean' ? (patch.featured = b.featured) : errors.push('featured'));
  if (b.sort !== undefined) {
    if (b.sort === null || b.sort === '') patch.sort = null;
    else if (typeof b.sort === 'number' && Number.isInteger(b.sort) && Math.abs(b.sort) <= 100000) patch.sort = b.sort;
    else errors.push('sort');
  }
  if (b.hub !== undefined) {
    if (b.hub === null || b.hub === '') patch.hub = null;
    else if (typeof b.hub === 'string' && HUB_IDS.has(b.hub)) patch.hub = b.hub;
    else errors.push('hub');
  }
  for (const [key, max] of [['prof', MAX_PROF], ['titleEn', MAX_TITLE], ['titleBn', MAX_TITLE], ['note', MAX_NOTE]] as const) {
    if (b[key] === undefined) continue;
    const v = text(b[key], max);
    if (v === undefined) errors.push(key);
    else (patch as Record<string, unknown>)[key] = v;
  }
  return { patch, errors };
}

/** What the public site needs: only rows that change something, so the payload stays tiny. */
export const isActive = (o: TemplateOverride) =>
  !!(o.hidden || o.featured || o.sort != null || o.hub || o.prof || o.titleEn || o.titleBn);

/** Apply overrides: drop hidden ones (unless asked to keep them), fix title/category/profession, featured first, then manual order. */
export function applyOverrides(list: Template[], map: OverrideMap, opts: { keepHidden?: boolean } = {}): Template[] {
  const out: { t: Template; i: number; o: TemplateOverride | undefined }[] = [];
  list.forEach((t, i) => {
    const o = map[t.id];
    if (o?.hidden && !opts.keepHidden) return;
    out.push({ t: o ? patched(t, o) : t, i, o });
  });
  const rank = (x: { o: TemplateOverride | undefined }) => (x.o?.featured ? 0 : 1);
  out.sort((a, b) => rank(a) - rank(b) || (a.o?.sort ?? 1e9) - (b.o?.sort ?? 1e9) || a.i - b.i);
  return out.map((x) => x.t);
}

function patched(t: Template, o: TemplateOverride): Template {
  return {
    ...t,
    hub: o.hub || t.hub,
    prof: o.prof || t.prof,
    title: { en: o.titleEn || t.title.en, bn: o.titleBn || t.title.bn },
  };
}

export const isHidden = (map: OverrideMap, id: string) => !!map[id]?.hidden;
