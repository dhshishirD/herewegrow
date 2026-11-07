// Security headers added to every response the Worker sends (API, career pages and the built site).
// The CSP lists exactly the outside services the site uses: Google Analytics, Meta Pixel, Cloudflare Turnstile
// and Google Fonts (the CV builder loads font choices from there). Anything else is blocked.
// Scripts keep 'unsafe-inline' because index.html carries the small Google tag snippet.

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const BASE: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

/** Same response with the security headers added. Headers a handler already set are left alone. */
export function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(BASE)) if (!headers.has(k)) headers.set(k, v);
  if ((headers.get('Content-Type') ?? '').includes('text/html') && !headers.has('Content-Security-Policy')) headers.set('Content-Security-Policy', CSP);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
