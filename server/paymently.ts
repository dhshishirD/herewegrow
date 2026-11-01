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

export interface GatewayResult {
  ok: boolean;
  httpStatus: number;
  data: Record<string, unknown>;
  /** First part of the reply when it was not JSON (for example an HTML error page). */
  rawSnippet: string | null;
}

export async function callGateway(
  env: Env,
  endpoint: 'checkout-v2' | 'checkout' | 'verify-payment',
  payload: unknown,
): Promise<GatewayResult> {
  if (!env.PAYMENT_API_KEY) {
    throw new Error('PAYMENT_API_KEY is not set on the Worker.');
  }
  const base = (env.PAYMENT_API_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  const res = await fetch(`${base}/${endpoint}`, {
    method: 'POST',
    headers: {
      'RT-UDDOKTAPAY-API-KEY': env.PAYMENT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    return { ok: res.ok, httpStatus: res.status, data: JSON.parse(text) as Record<string, unknown>, rawSnippet: null };
  } catch {
    return { ok: res.ok, httpStatus: res.status, data: {}, rawSnippet: text.replace(/\s+/g, ' ').slice(0, 160) };
  }
}

/** A short, key-free description of a failed gateway reply, safe to show the buyer. */
export function describeFailure(r: GatewayResult): string {
  const msg = typeof r.data.message === 'string' ? r.data.message : r.rawSnippet ? `non-JSON reply: ${r.rawSnippet}` : 'no message';
  return `HTTP ${r.httpStatus}: ${msg}`.slice(0, 220);
}
