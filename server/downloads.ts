// Download links for paid template files.
// A link is signed with a server secret and expires, so it can't be guessed or reused forever.
// Files are read from the private R2 bucket; nothing is public.

import type { Product } from '../shared/catalog';
import type { Env } from './paymently';

const LINK_DAYS = 7;
const enc = new TextEncoder();

async function sign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const secretOf = (env: Env) => env.DOWNLOAD_SECRET || env.PAYMENT_API_KEY || '';

export interface DownloadLink {
  file: string;
  url: string;
  bytes: number;
}

/** Signed links for a paid product's files. Empty when the bucket isn't set up or a file is missing. */
export async function downloadLinks(env: Env, invoiceId: string, product: Pick<Product, 'files'>): Promise<DownloadLink[]> {
  const secret = secretOf(env);
  if (!env.FILES || !secret || !product.files?.length) return [];
  const exp = Math.floor(Date.now() / 1000) + LINK_DAYS * 86400;
  const links: DownloadLink[] = [];
  for (const file of product.files) {
    const head = await env.FILES.head(file).catch(() => null);
    if (!head) {
      console.error('download file missing in bucket', file);
      return [];
    }
    const sig = await sign(secret, `${invoiceId}|${file}|${exp}`);
    const q = new URLSearchParams({ inv: invoiceId, f: file, exp: String(exp), sig });
    links.push({ file, url: `/api/download?${q}`, bytes: head.size });
  }
  return links;
}

/** GET /api/download: streams one file if the signed link is valid and not expired. */
export async function handleDownload(request: Request, env: Env): Promise<Response> {
  const q = new URL(request.url).searchParams;
  const inv = q.get('inv') ?? '';
  const file = q.get('f') ?? '';
  const exp = Number(q.get('exp') ?? 0);
  const sig = q.get('sig') ?? '';
  const secret = secretOf(env);

  const expired = page(410, 'This download link has expired. Message us on WhatsApp with your invoice number and we will send a new one.');
  const invalid = page(403, 'This download link is not valid. Use the link from your payment page, or message us on WhatsApp.');

  if (!env.FILES || !secret || !inv || !file || !sig || !Number.isFinite(exp)) return invalid;
  if (!/^[a-z0-9-]+\.(docx|zip)$/.test(file)) return invalid;
  if ((await sign(secret, `${inv}|${file}|${exp}`)) !== sig) return invalid;
  if (exp < Date.now() / 1000) return expired;

  const obj = await env.FILES.get(file);
  if (!obj) return page(404, 'This file is not available right now. Message us on WhatsApp and we will send it.');

  const type = file.endsWith('.zip') ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return new Response(obj.body, {
    headers: {
      'Content-Type': type,
      'Content-Length': String(obj.size),
      'Content-Disposition': `attachment; filename="HereWeGrow-${file}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function page(status: number, message: string): Response {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download</title>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.25rem;color:#15241d">
<h1 style="font-size:1.5rem">Download problem</h1><p>${message}</p>
<p><a style="color:#0f6b4c" href="https://wa.me/8801981505759">WhatsApp 01981-505759</a> · <a style="color:#0f6b4c" href="/">herewegrow.pro</a></p></body>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

