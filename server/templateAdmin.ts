// Template library controls for the admin panel: hide / feature / reorder / fix title or category, plus per-template numbers.
// Nothing here deletes a template or touches an order; a template with no row is exactly what the code ships.

import type { D1Like } from './cf';
import { dhakaDay } from './analytics';
import { cleanPatch, isActive, isTemplateId, type OverrideMap, type TemplateOverride } from '../shared/templateOverrides';

const DAY_MS = 86_400_000;

interface Row {
  id: string;
  hidden: number;
  featured: number;
  sort: number | null;
  hub: string | null;
  prof: string | null;
  title_en: string | null;
  title_bn: string | null;
  note: string | null;
  updated_at: number;
}

const toOverride = (r: Row): TemplateOverride & { note: string | null } => ({
  hidden: !!r.hidden,
  featured: !!r.featured,
  sort: r.sort,
  hub: r.hub,
  prof: r.prof,
  titleEn: r.title_en,
  titleBn: r.title_bn,
  note: r.note,
});

async function allRows(db: D1Like): Promise<Row[]> {
  return (await db.prepare('SELECT id, hidden, featured, sort, hub, prof, title_en, title_bn, note, updated_at FROM template_overrides').all<Row>()).results ?? [];
}

/** Every override the admin has set, with the private note. */
export async function listOverrides(db: D1Like): Promise<Record<string, TemplateOverride & { note: string | null }>> {
  const out: Record<string, TemplateOverride & { note: string | null }> = {};
  for (const r of await allRows(db)) out[r.id] = toOverride(r);
  return out;
}

/** The public subset: only rows that change something, no note. The site applies it on top of the shipped list. */
export async function publicOverrides(db: D1Like): Promise<OverrideMap> {
  const out: OverrideMap = {};
  for (const r of await allRows(db)) {
    const { note: _note, ...o } = toOverride(r);
    if (isActive(o)) out[r.id] = o;
  }
  return out;
}

/** Change some fields of one template. Fields left out keep their value. Returns null for an unknown template. */
export async function setOverride(db: D1Like, id: unknown, raw: unknown, now: number = Date.now()): Promise<{ ok: true } | { ok: false; error: 'not_found' | 'invalid'; errors?: string[] }> {
  if (!isTemplateId(id)) return { ok: false, error: 'not_found' };
  const { patch, errors } = cleanPatch(raw);
  if (errors.length) return { ok: false, error: 'invalid', errors };
  const has = (k: keyof typeof patch) => patch[k] !== undefined;
  // Insert the row if needed, then update only the supplied columns: concurrent edits of different fields never clobber each other.
  await db.prepare('INSERT OR IGNORE INTO template_overrides (id, updated_at) VALUES (?, ?)').bind(id, now).run();
  const sets: string[] = [];
  const args: unknown[] = [];
  const col = (name: string, key: keyof typeof patch, map: (v: never) => unknown = (v) => v) => {
    if (!has(key)) return;
    sets.push(`${name} = ?`);
    args.push(map(patch[key] as never));
  };
  col('hidden', 'hidden', (v: boolean) => (v ? 1 : 0));
  col('featured', 'featured', (v: boolean) => (v ? 1 : 0));
  col('sort', 'sort');
  col('hub', 'hub');
  col('prof', 'prof');
  col('title_en', 'titleEn');
  col('title_bn', 'titleBn');
  col('note', 'note');
  if (sets.length) {
    await db.prepare(`UPDATE template_overrides SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`).bind(...args, now, id).run();
  }
  // A row that is back to all-defaults is removed, so the table only holds real decisions.
  await db
    .prepare("DELETE FROM template_overrides WHERE id = ? AND hidden = 0 AND featured = 0 AND sort IS NULL AND hub IS NULL AND prof IS NULL AND title_en IS NULL AND title_bn IS NULL AND (note IS NULL OR note = '')")
    .bind(id)
    .run();
  return { ok: true };
}

/** Hide or show many templates at once. Unknown ids are skipped; the count of changed ones is returned. */
export async function bulkHide(db: D1Like, ids: unknown, hidden: boolean, now: number = Date.now()): Promise<number> {
  const list = Array.isArray(ids) ? [...new Set(ids.filter(isTemplateId))].slice(0, 300) : [];
  for (const id of list) await setOverride(db, id, { hidden }, now);
  return list.length;
}

export interface TemplateStat {
  views: number;
  sales: number;
}

/** Views (last `days` days, product page opened) and single-template sales (all time, paid orders for that template). */
export async function templateStats(db: D1Like, days = 30, now: number = Date.now()): Promise<Record<string, TemplateStat>> {
  const out: Record<string, TemplateStat> = {};
  const at = (id: string) => (out[id] ??= { views: 0, sales: 0 });
  const from = dhakaDay(now - (days - 1) * DAY_MS);
  const views = await db
    .prepare("SELECT json_extract(meta, '$.id') AS id, COUNT(*) AS n FROM events WHERE type = 'event' AND name = 'view_template' AND day >= ? AND json_valid(meta) GROUP BY 1")
    .bind(from)
    .all<{ id: string | null; n: number }>();
  for (const r of views.results ?? []) if (r.id && isTemplateId(r.id)) at(r.id).views = r.n;
  const sales = await db
    .prepare("SELECT product_id AS pid, COUNT(*) AS n FROM orders WHERE status = 'paid' AND product_id LIKE 'tpl-%' GROUP BY product_id")
    .all<{ pid: string; n: number }>();
  for (const r of sales.results ?? []) {
    const id = r.pid.slice(4);
    if (isTemplateId(id)) at(id).sales = r.n;
  }
  return out;
}
