// GET /api/template-overrides: the small public list of admin decisions (hidden, featured, order, fixed titles).
// Cached for a minute at the edge. If the table is missing or the database is down, the answer is an empty list,
// so the site simply shows the templates as shipped.

import type { AuthEnv } from './auth';
import { publicOverrides } from './templateAdmin';

export async function handleTemplateOverrides(env: AuthEnv): Promise<Response> {
  let overrides = {};
  try {
    if (env.DB) overrides = await publicOverrides(env.DB);
  } catch (e) {
    console.error('template overrides unavailable', e);
  }
  return new Response(JSON.stringify({ ok: true, overrides }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
}
