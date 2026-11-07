import { describe, expect, it } from 'vitest';
import { CSP, withSecurityHeaders } from './securityHeaders';

describe('security headers', () => {
  it('adds the basic headers to any response and keeps status and body', async () => {
    const res = withSecurityHeaders(new Response('{"ok":true}', { status: 201, headers: { 'Content-Type': 'application/json' } }));
    expect(res.status).toBe(201);
    expect(await res.text()).toBe('{"ok":true}');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=');
    expect(res.headers.get('Content-Security-Policy')).toBeNull();
  });
  it('adds the CSP to HTML only, and never overrides one a handler set', () => {
    expect(withSecurityHeaders(new Response('<p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })).headers.get('Content-Security-Policy')).toBe(CSP);
    const own = withSecurityHeaders(new Response('<p>', { headers: { 'Content-Type': 'text/html', 'Content-Security-Policy': "default-src 'none'" } }));
    expect(own.headers.get('Content-Security-Policy')).toBe("default-src 'none'");
  });
  it('blocks framing and plugins', () => {
    expect(CSP).toContain("frame-ancestors 'none'");
    expect(CSP).toContain("object-src 'none'");
  });
  it('handles redirects and empty bodies', () => {
    const r = withSecurityHeaders(new Response(null, { status: 302, headers: { Location: '/x' } }));
    expect(r.status).toBe(302);
    expect(r.headers.get('Location')).toBe('/x');
  });
});
