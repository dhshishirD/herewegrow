// Meta Pixel, loaded only when an ID is set in shared/pixel.ts, and never for opted-out visitors or admins.
// Our own event names are mapped to Meta's standard events where one fits, otherwise sent as custom events.

import { META_PIXEL_ID } from '../../shared/pixel';

type Fbq = (...a: unknown[]) => void;
const w = (): (Window & { fbq?: Fbq; _fbq?: Fbq }) | null => (typeof window === 'undefined' ? null : window);

/** Our event name → Meta event. Anything not listed is sent as a custom event in PascalCase. */
export const PIXEL_STANDARD: Record<string, string> = {
  view_service: 'ViewContent',
  view_template: 'ViewContent',
  view_pro: 'ViewContent',
  checkout_click: 'InitiateCheckout',
  contact_submit: 'Lead',
  cta_whatsapp_click: 'Contact',
  login_success: 'CompleteRegistration',
};

export const pixelName = (name: string): { standard: boolean; name: string } =>
  PIXEL_STANDARD[name] ? { standard: true, name: PIXEL_STANDARD[name] } : { standard: false, name: name.replace(/(^|_)([a-z])/g, (_, __, c: string) => c.toUpperCase()) };

let loaded = false;
let blocked = false;
// Events fired before we know the visitor is not an admin wait here, then go out (or are dropped) once we know
let unlocked = false;
let pending: (() => void)[] = [];

/** Stop the Pixel for this visitor (opt-out or admin). */
export function pixelOff() {
  blocked = true;
  pending = [];
}

/** The account answer is in and the visitor is counted: send what was waiting. */
export function pixelUnlock() {
  if (unlocked) return;
  unlocked = true;
  const q = pending;
  pending = [];
  if (!blocked) for (const f of q) f();
}

const when = (f: () => void) => {
  if (blocked) return;
  if (unlocked) f();
  else if (pending.length < 20) pending.push(f);
};

function load(): Fbq | null {
  const win = w();
  if (!META_PIXEL_ID || blocked || !win) return null;
  if (loaded) return win.fbq ?? null;
  loaded = true;
  // Meta's standard loader, written out so the queue exists before the script arrives
  const f: Fbq & { queue?: unknown[][]; loaded?: boolean; version?: string; callMethod?: Fbq } = function (...a: unknown[]) {
    if (f.callMethod) f.callMethod(...a);
    else (f.queue ??= []).push(a);
  };
  f.loaded = true;
  f.version = '2.0';
  f.queue = [];
  win.fbq = f;
  win._fbq = f;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  f('init', META_PIXEL_ID);
  return f;
}

export function pixelPageView() {
  when(() => load()?.('track', 'PageView'));
}

export function pixelEvent(name: string, meta?: Record<string, string | number>) {
  when(() => {
    const fb = load();
    if (!fb) return;
    const m = pixelName(name);
    fb(m.standard ? 'track' : 'trackCustom', m.name, meta ?? {});
  });
}

/** Fired once per invoice on the payment success page, with the real amount, so Meta can optimise for purchases. */
export function pixelPurchase(value: number, invoiceId: string) {
  const fb = load();
  if (!fb) return;
  const key = `hwg_px_${invoiceId}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
  } catch {
    /* storage blocked: allow the event */
  }
  fb('track', 'Purchase', { value, currency: 'BDT' });
}
