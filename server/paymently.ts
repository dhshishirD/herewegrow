// Server-only helpers for the hosted UddoktaPay (Paymently) gateway.
// The API key is read from the Cloudflare environment and never sent to the browser.

export interface Env {
  /** Secret: set in Cloudflare Pages → Settings → Variables and secrets. */
  PAYMENT_API_KEY?: string;
  /** Optional override, defaults to the HereWeGrow Paymently panel. */
  PAYMENT_API_BASE?: string;
}

const DEFAULT_BASE = 'https://herewegrow.paymently.io/api';

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Only accept calls made from this site's own pages (same origin) or local development. */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  const self = new URL(request.url).origin;
  if (origin === self) return true;
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

export async function callGateway(env: Env, endpoint: 'checkout-v2' | 'verify-payment', payload: unknown) {
  if (!env.PAYMENT_API_KEY) {
    throw new Error('Payment is not configured on the server (PAYMENT_API_KEY missing).');
  }
  const res = await fetch(`${env.PAYMENT_API_BASE || DEFAULT_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'RT-UDDOKTAPAY-API-KEY': env.PAYMENT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}
