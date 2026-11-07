// Cloudflare Worker for herewegrow.pro.
// /api/* is handled here; every other path is served from the built site in ./dist.

import { handleCheckout, handleClaim, handleVerify } from '../server/handlers';
import { handleAdmin } from '../server/admin';
import { careersSitemap, serveCareerPage } from '../server/careers';
import { serveCareersIndex } from '../server/careerIndex';
import { handlePromo } from '../server/promoHandlers';
import { handleAuth } from '../server/authHandlers';
import { handleContact } from '../server/contact';
import { handleTrack } from '../server/analyticsHandlers';
import { handleCvs } from '../server/cvs';
import { handleDownload } from '../server/downloads';
import { sendReminders } from '../server/entitlements';
import { rollupOld } from '../server/retention';
import { weeklyBackup } from '../server/backup';
import { withSecurityHeaders } from '../server/securityHeaders';
import { bulkSmsBd } from '../server/sms';
import { json, type Env } from '../server/paymently';

interface WorkerEnv extends Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

async function handle(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/admin/')) return handleAdmin(request, env, pathname);
      if (pathname.startsWith('/api/promo/')) return handlePromo(request, env, pathname);
      if (pathname.startsWith('/api/auth/')) return handleAuth(request, env, pathname);
      if (pathname === '/api/cvs' || pathname.startsWith('/api/cvs/')) return handleCvs(request, env, pathname);
      if (pathname === '/api/download' && request.method === 'GET') return handleDownload(request, env);
      if (pathname === '/api/t' && request.method === 'POST') return handleTrack(request, env);
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      if (pathname === '/api/contact') return handleContact(request, env);
      if (pathname === '/api/checkout') return handleCheckout(request, env);
      if (pathname === '/api/claim') return handleClaim(request, env);
      if (pathname === '/api/verify') return handleVerify(request, env);
      return json({ ok: false, error: 'not_found' }, 404);
    }

    // Career Hub: saved role pages and their sitemap; anything else under /careers/ falls through to the app.
    if (request.method === 'GET' || request.method === 'HEAD') {
      if (pathname === '/sitemap-careers.xml') return careersSitemap(env);
      if (pathname === '/careers' || pathname === '/careers/') return serveCareersIndex(env);
      const page = await serveCareerPage(env, pathname);
      if (page) return page;
    }

    return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return withSecurityHeaders(await handle(request, env));
  },

  /** Daily Cron Trigger (wrangler.toml): Pro renewal reminders by SMS, and the 90-day analytics rollup. Independent: one failing does not stop the other. */
  async scheduled(_event: unknown, env: WorkerEnv, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<void> {
    if (!env.DB) return;
    ctx.waitUntil(
      sendReminders(env.DB, bulkSmsBd(env))
        .then((r) => console.log('pro reminders', r))
        .catch((e) => console.error('pro reminders failed', e)),
    );
    ctx.waitUntil(
      rollupOld(env.DB)
        .then((r) => console.log('analytics rollup', r))
        .catch((e) => console.error('analytics rollup failed', e)),
    );
    ctx.waitUntil(
      weeklyBackup(env.DB, env.FILES)
        .then((r) => console.log('d1 backup', r))
        .catch((e) => console.error('d1 backup failed', e)),
    );
  },
};
