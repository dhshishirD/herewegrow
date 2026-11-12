// Career Hub admin data: the role table with its checks, and the role packs shipped with the site.
// Packs in content/careers/ reach the Worker as a private file (admin-careers-seed.json, see scripts/careers.ts).
// A pack the database does not have yet is "new"; one that differs from the stored pack is an "update".
// Nothing here publishes on its own: a new pack lands as a draft, and a published role keeps its
// live page until the admin applies that update by name.

import { checkRole, type RoleCheck } from '../shared/careerAdmin';
import type { AuthEnv } from './auth';
import { renderRoleBody } from './careerPage';
import { publishRole } from './careers';
import type { D1Like } from './cf';
import { saveRolePack, validateRolePack, type RolePack } from './rolePack';

export interface CareerAdminEnv extends AuthEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

export interface AdminRole extends RoleCheck {
  id: string;
  slug: string;
  title_en: string;
  title_bn: string | null;
  field: string | null;
  status: 'draft' | 'published';
  published_at: number | null;
  updated_at: number;
  /** A newer pack for this role came with the site and has not been applied. */
  updateWaiting: boolean;
}

export interface PendingPack {
  slug: string;
  title_en: string;
  kind: 'new' | 'update';
  /** True when applying it changes a page that is public right now. */
  live: boolean;
}

interface Row {
  id: string;
  slug: string;
  title_en: string;
  title_bn: string | null;
  field: string | null;
  status: 'draft' | 'published';
  published_at: number | null;
  updated_at: number;
  pack_json: string;
}

/** The valid packs shipped with the site, or null when the file cannot be read (local dev, old build). */
export async function readCareersSeed(request: Request, env: CareerAdminEnv): Promise<RolePack[] | null> {
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/admin-careers-seed.json', request.url)));
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw)) return null;
    return raw.flatMap((p) => {
      const checked = validateRolePack(p);
      return checked.ok ? [checked.pack] : [];
    });
  } catch {
    return null;
  }
}

const rows = async (db: D1Like) =>
  (await db.prepare('SELECT id, slug, title_en, title_bn, field, status, published_at, updated_at, pack_json FROM roles ORDER BY updated_at DESC').all<Row>()).results ?? [];

const differs = (seed: RolePack, stored: string) => JSON.stringify(seed) !== JSON.stringify(JSON.parse(stored));

export async function listAdminRoles(db: D1Like, seed: RolePack[] | null): Promise<{ roles: AdminRole[]; pending: PendingPack[] | null }> {
  const all = await rows(db);
  const bySlug = new Map(all.map((r) => [r.slug, r]));
  const pending: PendingPack[] | null = seed
    ? seed.flatMap((p): PendingPack[] => {
        const have = bySlug.get(p.slug);
        if (!have) return [{ slug: p.slug, title_en: p.title_en, kind: 'new', live: false }];
        return differs(p, have.pack_json) ? [{ slug: p.slug, title_en: p.title_en, kind: 'update', live: have.status === 'published' }] : [];
      })
    : null;
  const waiting = new Set((pending ?? []).filter((p) => p.kind === 'update').map((p) => p.slug));
  const roles = all.map(({ pack_json, ...r }) => ({ ...r, ...checkRole(JSON.parse(pack_json) as RolePack), updateWaiting: waiting.has(r.slug) }));
  return { roles, pending };
}

/**
 * Brings shipped packs into the database. With no slug: every new pack becomes a draft and every
 * changed draft is refreshed; published roles are left alone. With a slug: that one pack is applied,
 * and if its role is public the page is re-rendered (this is the admin's "publish update" click).
 */
export async function applySeed(env: CareerAdminEnv, seed: RolePack[], slug?: string, now = Date.now()): Promise<{ added: string[]; updated: string[]; waiting: string[] }> {
  const db = env.DB!;
  const bySlug = new Map((await rows(db)).map((r) => [r.slug, r]));
  const added: string[] = [];
  const updated: string[] = [];
  const waiting: string[] = [];
  for (const pack of seed) {
    if (slug && pack.slug !== slug) continue;
    const have = bySlug.get(pack.slug);
    if (have && !differs(pack, have.pack_json)) continue;
    if (have?.status === 'published' && !slug) {
      waiting.push(pack.slug);
      continue;
    }
    const saved = await saveRolePack(db, pack, now);
    if (have?.status === 'published') await publishRole(env, saved.id, now);
    (have ? updated : added).push(pack.slug);
  }
  return { added, updated, waiting };
}

/** The role page body (escaped HTML) for the admin preview panel, drafts included. */
export async function previewRole(db: D1Like, id: string): Promise<{ title: string; html: string; check: RoleCheck } | null> {
  const row = await db.prepare('SELECT pack_json FROM roles WHERE id = ?').bind(id).first<{ pack_json: string }>();
  if (!row) return null;
  const pack = JSON.parse(row.pack_json) as RolePack;
  return { title: pack.title_en, html: renderRoleBody(pack), check: checkRole(pack) };
}

/** What stops this role from being published, if anything. */
export async function publishBlockers(db: D1Like, id: string): Promise<string[]> {
  const row = await db.prepare('SELECT pack_json FROM roles WHERE id = ?').bind(id).first<{ pack_json: string }>();
  return row ? checkRole(JSON.parse(row.pack_json) as RolePack).problems : [];
}
