// Career Hub publishing: a published role is rendered once to HTML and stored in KV (career:<slug>),
// so public requests are one KV read. Unpublishing deletes the snapshot. The sitemap comes from D1.

import type { D1Like, KVLike } from './cf';
import { renderRolePage } from './careerPage';
import { escapeHtml } from './markdown';
import type { RolePack } from './rolePack';

export interface CareersEnv {
  DB?: D1Like;
  KV?: KVLike;
}

const SITE = 'https://herewegrow.pro';
const snapshotKey = (slug: string) => `career:${slug}`;
const ROLE_PATH = /^\/careers\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

export type PublishResult = { ok: true; slug: string } | { ok: false; error: 'not_found' | 'config' };

/** Renders the stored pack, saves the snapshot, and marks the role published. Safe to run again to refresh. */
export async function publishRole(env: CareersEnv, id: string, now = Date.now()): Promise<PublishResult> {
  if (!env.DB || !env.KV) return { ok: false, error: 'config' };
  const row = await env.DB.prepare('SELECT slug, pack_json, updated_at FROM roles WHERE id = ?').bind(id).first<{ slug: string; pack_json: string; updated_at: number }>();
  if (!row) return { ok: false, error: 'not_found' };
  await env.KV.put(snapshotKey(row.slug), renderRolePage(JSON.parse(row.pack_json) as RolePack, row.updated_at));
  await env.DB.prepare("UPDATE roles SET status = 'published', published_at = COALESCE(published_at, ?) WHERE id = ?").bind(now, id).run();
  return { ok: true, slug: row.slug };
}

export async function unpublishRole(env: CareersEnv, id: string): Promise<PublishResult> {
  if (!env.DB || !env.KV) return { ok: false, error: 'config' };
  const row = await env.DB.prepare('SELECT slug FROM roles WHERE id = ?').bind(id).first<{ slug: string }>();
  if (!row) return { ok: false, error: 'not_found' };
  await env.DB.prepare("UPDATE roles SET status = 'draft' WHERE id = ?").bind(id).run();
  await env.KV.delete(snapshotKey(row.slug));
  return { ok: true, slug: row.slug };
}

/** The saved page for GET /careers/<slug>, or null so the request falls through to the app. */
export async function serveCareerPage(env: Pick<CareersEnv, 'KV'>, pathname: string): Promise<Response | null> {
  const slug = ROLE_PATH.exec(pathname)?.[1];
  if (!slug || !env.KV) return null;
  const html = await env.KV.get(snapshotKey(slug));
  if (!html) return null;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}

/** /sitemap-careers.xml: published roles only. */
export async function careersSitemap(env: Pick<CareersEnv, 'DB'>): Promise<Response> {
  const rows = env.DB
    ? ((await env.DB.prepare("SELECT slug, updated_at FROM roles WHERE status = 'published' ORDER BY slug").all<{ slug: string; updated_at: number }>()).results ?? [])
    : [];
  const urls = rows
    .map((r) => `  <url><loc>${escapeHtml(`${SITE}/careers/${r.slug}`)}</loc><lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}${urls ? '\n' : ''}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
