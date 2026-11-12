import { describe, expect, it } from 'vitest';
import { downloadLinks, handleDownload } from './downloads';
import type { Env } from './paymently';

const bucket = (keys: string[]) =>
  ({
    head: async (k: string) => (keys.includes(k) ? { size: 10 } : null),
    get: async (k: string) => (keys.includes(k) ? { body: 'x', size: 10 } : null),
  }) as unknown as Env['FILES'];

describe('downloads with bonus files', () => {
  const files = ['hwg-cv-designed-fresher-cv.docx', 'hwg-cv-ats-fresher-cv.docx', 'HWG_How_To_Use_CV_Templates.pdf'];
  const env = { FILES: bucket(files), DOWNLOAD_SECRET: 's3cret' } as unknown as Env;

  it('signs a link for every file and serves the PDF with the right type', async () => {
    const links = await downloadLinks(env, 'INV1', { files });
    expect(links.map((l) => l.file)).toEqual(files);
    const pdf = links[2];
    const res = await handleDownload(new Request(`https://x.test${pdf.url}`), env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    const word = await handleDownload(new Request(`https://x.test${links[1].url}`), env);
    expect(word.headers.get('Content-Type')).toContain('wordprocessingml');
  });
  it('gives no links when a bonus file is missing from the bucket', async () => {
    const partial = { FILES: bucket(files.slice(0, 2)), DOWNLOAD_SECRET: 's3cret' } as unknown as Env;
    expect(await downloadLinks(partial, 'INV1', { files })).toEqual([]);
  });
  it('rejects a tampered link and odd file names', async () => {
    const [l] = await downloadLinks(env, 'INV1', { files });
    expect((await handleDownload(new Request(`https://x.test${l.url}0`), env)).status).toBe(403);
    expect((await handleDownload(new Request('https://x.test/api/download?inv=a&f=../x.pdf&exp=9999999999&sig=z'), env)).status).toBe(403);
  });
});
