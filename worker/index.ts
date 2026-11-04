// Cloudflare Worker for herewegrow.pro.
// /api/* is handled here; every other path is served from the built site in ./dist.

import { handleCheckout, handleClaim, handleVerify } from '../server/handlers';
import { handleAdmin } from '../server/admin';
import { handleAuth } from '../server/authHandlers';
import { handleCvs } from '../server/cvs';
import { handleDownload } from '../server/downloads';
import { sendReminders } from '../server/entitlements';
import { bulkSmsBd } from '../server/sms';
import { json, type Env } from '../server/paymently';

interface WorkerEnv extends Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/admin/')) return handleAdmin(request, env, pathname);
      if (pathname.startsWith('/api/auth/')) return handleAuth(request, env, pathname);
      if (pathname === '/api/cvs' || pathname.startsWith('/api/cvs/')) return handleCvs(request, env, pathname);
      if (pathname === '/api/download' && request.method === 'GET') return handleDownload(request, env);
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      if (pathname === '/api/checkout') return handleCheckout(request, env);
      if (pathname === '/api/claim') return handleClaim(request, env);
      if (pathname === '/api/verify') return handleVerify(request, env);
      return json({ ok: false, error: 'not_found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },

  /** Daily Cron Trigger (wrangler.toml): Pro renewal reminders by SMS. */
  async scheduled(_event: unknown, env: WorkerEnv, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<void> {
    if (!env.DB) return;
    ctx.waitUntil(
      sendReminders(env.DB, bulkSmsBd(env))
        .then((r) => console.log('pro reminders', r))
        .catch((e) => console.error('pro reminders failed', e)),
    );
  },
};
