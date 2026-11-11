// /api/admin/blog*: the admin Blog page. Admin only.
//   GET  /api/admin/blog        every post with status and checks (or setupNeeded when the tables are missing)
//   POST /api/admin/blog/setup  create the blog tables (safe to repeat)
//   GET/POST /api/admin/blog/posts/<id>[/<action>]  edit, schedule, reschedule, publish, unpublish (server/blogEdit.ts)
//   GET  /api/admin/blog/performance?range=7d|30d|all  per-post views, reads, CTA clicks, orders, verdicts and hints (server/blogPerformance.ts)
//   POST /api/admin/blog/seed   import the starting posts shipped with the site (never changes existing posts)
// The starting posts are the private seed file the build wrote next to the site (admin-blog-seed.json);
// it is read through the asset binding, which the public cannot reach (the Worker answers 404 for that path).

import type { Post } from '../shared/blogParse';
import { summarize } from '../shared/blogAdmin';
import { audit, blogTablesExist, listAll, seedPosts, setupBlogTables, toEntry } from './blogDb';
import { blogPerformance, type PerfRange } from './blogPerformance';
import { handlePostRoute } from './blogEdit';
import { requireAdmin } from './admin';
import type { AuthEnv } from './auth';
import { isAllowedOrigin, json } from './paymently';

export interface BlogAdminEnv extends AuthEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

async function readSeed(request: Request, env: BlogAdminEnv): Promise<Post[] | null> {
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/admin-blog-seed.json', request.url)));
    return res.ok ? ((await res.json()) as Post[]) : null;
  } catch {
    return null;
  }
}

export async function handleAdminBlog(request: Request, env: BlogAdminEnv, pathname: string, now = Date.now()): Promise<Response> {
  if (request.method !== 'GET' && !isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  const admin = await requireAdmin(env, request);
  if (admin instanceof Response) return admin;
  const db = env.DB!;
  const actor = admin.phone ?? admin.email ?? admin.id;
  try {
    if (pathname === '/api/admin/blog') {
      if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
      if (!(await blogTablesExist(db))) return json({ ok: true, setupNeeded: true });
      const posts = await listAll(db);
      const seed = await readSeed(request, env);
      const have = new Set(posts.map((p) => p.slug));
      return json({ ok: true, ...summarize(posts.map(toEntry), now), filesPending: seed ? seed.filter((p) => !have.has(p.slug)).length : null });
    }
    if (pathname === '/api/admin/blog/setup') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      await setupBlogTables(db);
      await audit(db, actor, null, 'setup', 'blog tables created', now);
      return json({ ok: true });
    }
    if (pathname === '/api/admin/blog/seed') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      if (!(await blogTablesExist(db))) return json({ ok: false, error: 'setup' }, 409);
      const seed = await readSeed(request, env);
      if (!seed) return json({ ok: false, error: 'seed' }, 502);
      return json({ ok: true, ...(await seedPosts(db, seed, now, actor)) });
    }
    if (pathname === '/api/admin/blog/performance') {
      if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
      if (!(await blogTablesExist(db))) return json({ ok: false, error: 'setup' }, 409);
      const range = new URL(request.url).searchParams.get('range') ?? '30d';
      if (range !== '7d' && range !== '30d' && range !== 'all') return json({ ok: false, error: 'range' }, 400);
      return json({ ok: true, ...(await blogPerformance(db, range as PerfRange, now)) });
    }
    const post = /^\/api\/admin\/blog\/posts\/([A-Za-z0-9-]{1,40})(?:\/([a-z-]+))?$/.exec(pathname);
    if (post) {
      if (!(await blogTablesExist(db))) return json({ ok: false, error: 'setup' }, 409);
      return await handlePostRoute(request, db, actor, post[1], post[2], now);
    }
    return json({ ok: false, error: 'not_found' }, 404);
  } catch (e) {
    console.error('admin blog failed', pathname, e);
    return json({ ok: false, error: 'db' }, 500);
  }
}
