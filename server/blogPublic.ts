// Public blog: /blog and /blog/<slug> pages (ready-made HTML so search engines read them, then the
// app takes over), /api/blog/* for the app, and /sitemap-blog.xml. Posts come from D1 and are live
// the moment their time arrives. Nothing is cached for long, so a publish shows within a minute.

import { blogListPage, blogPostPage, blogSitemapXml, toPublic } from '../shared/blogSeo';
import { renderPage } from '../shared/pageHtml';
import { getLive, listLive } from './blogDb';
import type { D1Like } from './cf';
import { json } from './paymently';

export interface BlogPublicEnv {
  DB?: D1Like;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

const HTML = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' };
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** JSON for a <script type="application/json"> block that cannot close the tag early. */
const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

async function shell(request: Request, env: BlogPublicEnv): Promise<string | null> {
  if (!env.ASSETS) return null;
  const res = await env.ASSETS.fetch(new Request(new URL('/blog-shell.txt', request.url)));
  return res.ok ? res.text() : null;
}

/** GET /blog and GET /blog/<slug>. */
export async function serveBlog(request: Request, env: BlogPublicEnv, pathname: string, now = Date.now()): Promise<Response> {
  const html = await shell(request, env);
  if (!html) return new Response('Not found', { status: 404 });
  const isList = pathname === '/blog' || pathname === '/blog/';
  const m = isList ? null : /^\/blog\/([^/]+)\/?$/.exec(pathname);
  const slug = m?.[1];
  if (!isList && !m) return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  try {
    if (!env.DB) throw new Error('no db');
    const live = await listLive(env.DB, now);
    const list = live.map((p) => toPublic(p, false));
    const slugs = new Set(list.map((p) => p.slug));
    const boot = (data: unknown) => `<script type="application/json" id="blog-boot">${safeJson(data)}</script>`;
    if (isList) {
      const page = renderPage(html, blogListPage(list)).replace('</head>', `${boot({ posts: list, liveSlugs: [...slugs] })}\n  </head>`);
      return new Response(page, { headers: HTML });
    }
    const post = slug && SLUG.test(slug) ? live.find((p) => p.slug === slug) : undefined;
    if (!post) return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    const pub = toPublic(post, true);
    const page = renderPage(html, blogPostPage(pub, slugs)).replace('</head>', `${boot({ posts: list, post: pub, liveSlugs: [...slugs] })}\n  </head>`);
    return new Response(page, { headers: HTML });
  } catch (e) {
    console.error('blog page failed', pathname, e);
    return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '60', 'Cache-Control': 'no-store' } });
  }
}

/** GET /api/blog/posts and GET /api/blog/posts/<slug>. */
export async function handleBlogApi(request: Request, env: BlogPublicEnv, pathname: string, now = Date.now()): Promise<Response> {
  if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
  if (!env.DB) return json({ ok: false, error: 'config' }, 503);
  try {
    if (pathname === '/api/blog/posts') {
      const live = await listLive(env.DB, now);
      return json({ ok: true, posts: live.map((p) => toPublic(p, false)), liveSlugs: live.map((p) => p.slug) });
    }
    const m = /^\/api\/blog\/posts\/([^/]+)$/.exec(pathname);
    if (m && SLUG.test(m[1])) {
      const post = await getLive(env.DB, m[1], now);
      if (!post) return json({ ok: false, error: 'not_found' }, 404);
      const live = await listLive(env.DB, now);
      return json({ ok: true, post: toPublic(post, true), liveSlugs: live.map((p) => p.slug) });
    }
    return json({ ok: false, error: 'not_found' }, 404);
  } catch (e) {
    console.error('blog api failed', pathname, e);
    return json({ ok: false, error: 'db' }, 503);
  }
}

export async function blogSitemap(env: BlogPublicEnv, now = Date.now()): Promise<Response> {
  try {
    if (!env.DB) throw new Error('no db');
    const live = await listLive(env.DB, now);
    return new Response(blogSitemapXml(live.map((p) => toPublic(p, false))), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  } catch (e) {
    console.error('blog sitemap failed', e);
    return new Response('Unavailable', { status: 503, headers: { 'Retry-After': '300' } });
  }
}
