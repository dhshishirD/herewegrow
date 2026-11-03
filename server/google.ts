// Google sign-in: OAuth code flow with state + PKCE. The ID token comes straight from
// Google's token endpoint over TLS, so its claims are read without a signature check.

import type { AuthEnv } from './auth';
import { randomToken, sha256B64url } from './crypto';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const googleConfigured = (env: AuthEnv) => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.KV);

/** Returns the Google consent URL; the state and PKCE verifier are kept in KV for 10 minutes. */
export async function googleStartUrl(env: AuthEnv, origin: string, next: string): Promise<string> {
  const state = randomToken(16);
  const verifier = randomToken(32);
  await env.KV!.put(`oauth:${state}`, JSON.stringify({ verifier, next }), { expirationTtl: 600 });
  const q = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: await sha256B64url(verifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return `${AUTH_URL}?${q}`;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
  next: string;
}

/** Exchange the callback code. Returns null for any failure (bad state, unverified email, wrong audience). */
export async function googleFinish(
  env: AuthEnv,
  origin: string,
  code: string,
  state: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleIdentity | null> {
  const raw = await env.KV!.get(`oauth:${state}`);
  if (!raw) return null;
  await env.KV!.delete(`oauth:${state}`); // state works once
  const { verifier, next } = JSON.parse(raw) as { verifier: string; next: string };

  const res = await fetchFn(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return null;
  const { id_token } = (await res.json().catch(() => ({}))) as { id_token?: string };
  if (!id_token) return null;
  try {
    const payload = JSON.parse(atob(id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    if (payload.aud !== env.GOOGLE_CLIENT_ID || payload.email_verified !== true) return null;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      name: typeof payload.name === 'string' ? payload.name.slice(0, 80) : '',
      next,
    };
  } catch {
    return null;
  }
}

/** Only same-site paths are allowed as the post-login destination. */
export const safeNext = (v: string | null) => (v && /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) ? v : '/account');
