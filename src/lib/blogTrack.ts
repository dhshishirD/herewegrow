// Reading behaviour on a blog post: how far down the reader got, how long the page was visible, and which
// call-to-action links they clicked. Sends at most one blog_exit per view plus one blog_cta_click per click.
// Never throws; nothing is sent for signed-in admins or opted-out devices (the tracker itself drops those).

import { useEffect, type RefObject } from 'react';
import type { CtaKind, CtaPos, ScrollMark } from '../../shared/blogPerformance';
import { tracker } from './track';

const SITE_HOSTS = new Set(['herewegrow.pro', 'www.herewegrow.pro']);
const MAX_SECONDS = 600;

/** Which CTA a post link is, or null when it is not a call to action (other posts, outside sites). */
export function ctaKindOf(href: string): CtaKind | null {
  let u: URL;
  try {
    u = new URL(href, 'https://herewegrow.pro');
  } catch {
    return null;
  }
  if (/(^|\.)wa\.me$|(^|\.)whatsapp\.com$|^wa\.link$/i.test(u.hostname)) return 'whatsapp';
  if (!SITE_HOSTS.has(u.hostname)) return null;
  const p = u.pathname;
  if (p === '/builder' || p.startsWith('/builder/')) return 'builder';
  if (p.startsWith('/tools/cv-checker')) return 'cv_checker';
  if (p === '/templates' || p.startsWith('/templates/')) return 'templates';
  if (p === '/blog' || p.startsWith('/blog/')) return null;
  return 'other';
}

/** Top, middle or end third of the article, from the link's position (0 at the top, 1 at the bottom). */
export function ctaPosOf(ratio: number): CtaPos {
  return ratio < 1 / 3 ? 'top' : ratio < 2 / 3 ? 'middle' : 'end';
}

/** The highest scroll mark (0/25/50/75/100) reached; 98 % or more counts as the end. */
export function markOf(pct: number): ScrollMark {
  if (pct >= 98) return 100;
  if (pct >= 75) return 75;
  if (pct >= 50) return 50;
  if (pct >= 25) return 25;
  return 0;
}

export type ReadMeta = { s: string; sc: ScrollMark; t: number };

export function createReadTracker(o: { slug: string; now: () => number; send: (meta: ReadMeta) => void }) {
  let max = 0;
  let ms = 0;
  let since: number | null = null;
  let done = false;
  const show = () => {
    if (since === null) since = o.now();
  };
  const hide = () => {
    if (since !== null) {
      ms += o.now() - since;
      since = null;
    }
  };
  return {
    scroll(pct: number) {
      if (pct > max) max = Math.min(100, pct);
    },
    show,
    hide,
    /** Sends the one exit event for this view; later calls do nothing. */
    finish() {
      if (done) return;
      done = true;
      hide();
      o.send({ s: o.slug, sc: markOf(max), t: Math.min(MAX_SECONDS, Math.round(ms / 1000)) });
    },
  };
}

/** Tracks scroll depth and visible time of the post inside `ref`, and sends blog_exit once when the reader leaves. */
export function useBlogReadTracking(slug: string | null, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;
    const rt = createReadTracker({ slug, now: () => Date.now(), send: (m) => tracker.event('blog_exit', m) });
    const measure = () => {
      try {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.height > 0) rt.scroll(((Math.min(r.height, window.innerHeight - r.top)) / r.height) * 100);
      } catch {
        /* never throw */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') rt.show();
      else {
        measure();
        rt.finish();
      }
    };
    const onHide = () => {
      measure();
      rt.finish();
    };
    if (document.visibilityState === 'visible') rt.show();
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('scroll', measure);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onHide);
      measure();
      rt.finish(); // leaving the post inside the app (route change)
    };
  }, [slug, ref]);
}

/** A click inside the post: sends blog_cta_click when it landed on a call-to-action link. */
export function trackCtaClick(slug: string, link: HTMLAnchorElement, article: HTMLElement) {
  try {
    const kind = ctaKindOf(link.getAttribute('href') ?? '');
    if (!kind) return;
    const a = article.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    tracker.event('blog_cta_click', { s: slug, cta: kind, pos: ctaPosOf(a.height > 0 ? (l.top - a.top) / a.height : 0) });
  } catch {
    /* never throw */
  }
}
