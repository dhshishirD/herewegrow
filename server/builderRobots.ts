// /builder with ?preset=, ?template= or ?client= is a tool view, not a page to index. The browser already sets noindex
// and a canonical (src/lib/seo.ts); this adds the same as response headers so crawlers that do not run scripts see it too.

const CANONICAL: Record<string, string> = {
  europass: '/europass-cv',
  gulf: '/cv-for-gulf-jobs',
  scholarship: '/scholarship-cv',
  academic: '/academic-cv',
};

export function withBuilderRobots(request: Request, response: Response): Response {
  const url = new URL(request.url);
  if (url.pathname !== '/builder') return response;
  const preset = url.searchParams.get('preset');
  if (!preset && !url.searchParams.has('template') && !url.searchParams.has('client')) return response;
  const out = new Response(response.body, response);
  out.headers.set('X-Robots-Tag', 'noindex, follow');
  const target = preset && Object.prototype.hasOwnProperty.call(CANONICAL, preset) ? CANONICAL[preset] : null;
  if (target) out.headers.set('Link', `<https://herewegrow.pro${target}>; rel="canonical"`);
  return out;
}
