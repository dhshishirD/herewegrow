// Cloudflare Worker for herewegrow.pro.
// /api/* is handled here; every other path is served from the built site in ./dist.

import { handleCheckout, handleVerify } from '../server/handlers';
import { handleAuth } from '../server/authHandlers';
import { handleDownload } from '../server/downloads';
import { json, type Env } from '../server/paymently';

interface WorkerEnv extends Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/auth/')) return handleAuth(request, env, pathname);
      if (pathname === '/api/download' && request.method === 'GET') return handleDownload(request, env);
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      if (pathname === '/api/checkout') return handleCheckout(request, env);
      if (pathname === '/api/verify') return handleVerify(request, env);
      return json({ ok: false, error: 'not_found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
