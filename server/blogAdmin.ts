// GET /api/admin/blog: every blog post file (live and scheduled) with its checks, for the admin Blog page.
// Admin only. The post list is the private index the build wrote next to the site (admin-blog-index.json);
// it is read through the asset binding, which the public cannot reach (the Worker answers 404 for that path).

import { dhakaToday } from '../shared/blogParse';
import { summarize, type BlogIndexEntry } from '../shared/blogAdmin';
import { requireAdmin } from './admin';
import type { AuthEnv } from './auth';
import { json } from './paymently';

export interface BlogAdminEnv extends AuthEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

export async function handleAdminBlog(request: Request, env: BlogAdminEnv, now = Date.now()): Promise<Response> {
  if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
  const admin = await requireAdmin(env, request);
  if (admin instanceof Response) return admin;
  if (!env.ASSETS) return json({ ok: false, error: 'config' }, 503);
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/admin-blog-index.json', request.url)));
    if (!res.ok) return json({ ok: false, error: 'index' }, 502);
    const index = (await res.json()) as BlogIndexEntry[];
    return json({ ok: true, ...summarize(index, dhakaToday(now)) });
  } catch (e) {
    console.error('admin blog failed', e);
    return json({ ok: false, error: 'index' }, 502);
  }
}
