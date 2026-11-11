import { describe, expect, it } from 'vitest';
import worker from './index';

const env = { ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } } as unknown as Parameters<typeof worker.fetch>[1];

describe('retired template pages', () => {
  it('answer with a 301 to the template list', async () => {
    const res = await worker.fetch(new Request('https://herewegrow.pro/templates/hwg-cv-europass-europass-017'), env);
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://herewegrow.pro/templates');
  });
  it('leave live templates and preview images alone', async () => {
    for (const p of ['/templates/hwg-cv-europass-europass-016', '/templates/hwg-cv-europass-europass-017/thumb.webp', '/templates']) {
      const res = await worker.fetch(new Request(`https://herewegrow.pro${p}`), env);
      expect(res.status, p).toBe(200);
    }
  });
});
