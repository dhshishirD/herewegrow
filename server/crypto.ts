// Small Web Crypto helpers shared by the auth code.

const enc = new TextEncoder();

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function sha256Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

export async function sha256B64url(text: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text))));
}

/** Random URL-safe id with the given number of random bytes. */
export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

/** A 6-digit code with no modulo bias. */
export function randomCode(): string {
  const buf = new Uint32Array(1);
  let n: number;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= 4_294_000_000); // largest multiple of 1e6 below 2^32
  return String(n % 1_000_000).padStart(6, '0');
}

/** Compare two strings in time that does not depend on where they differ. */
export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
