// First-party analytics client. No cookies; never throws.

type Store = Pick<Storage, 'getItem' | 'setItem'>;
type Meta = Record<string, string | number>;

export interface TrackerDeps {
  storage: Store | null;
  session: Store | null;
  send: (body: object) => void;
  now: () => number;
  referrer: string;
  search: string;
  gtag?: (...a: unknown[]) => void;
}

const IDLE_MS = 30 * 60_000;
const VID_KEY = 'hwg_vid';
const SID_KEY = 'hwg_sid';

const uuid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

const read = (s: Store | null, k: string): string | null => {
  try {
    return s?.getItem(k) ?? null;
  } catch {
    return null;
  }
};
const write = (s: Store | null, k: string, v: string) => {
  try {
    s?.setItem(k, v);
  } catch {
    /* storage blocked: fall back to memory */
  }
};

export function createTracker(deps: TrackerDeps) {
  let disabled = false;
  let memVid: string | null = null;
  let memSession: { sid: string; last: number } | null = null;

  const vid = (): string => {
    const stored = read(deps.storage, VID_KEY);
    if (stored) return stored;
    if (!memVid) {
      memVid = uuid();
      write(deps.storage, VID_KEY, memVid);
    }
    return memVid;
  };

  /** Current session id, rolling it after 30 minutes idle. `fresh` is true when this call started a session. */
  const session = (): { sid: string; fresh: boolean } => {
    const now = deps.now();
    let cur = memSession;
    try {
      const raw = read(deps.session, SID_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { sid?: unknown; last?: unknown };
        if (typeof p.sid === 'string' && typeof p.last === 'number') cur = { sid: p.sid, last: p.last };
      }
    } catch {
      /* ignore corrupt value */
    }
    const fresh = !cur || now - cur.last > IDLE_MS;
    const next = fresh ? { sid: uuid(), last: now } : { sid: cur!.sid, last: now };
    memSession = next;
    write(deps.session, SID_KEY, JSON.stringify(next));
    return { sid: next.sid, fresh };
  };

  const post = (body: Record<string, unknown>) => {
    try {
      deps.send(body);
    } catch {
      /* analytics must never break the page */
    }
  };

  return {
    vid,
    disable() {
      disabled = true;
    },
    pageview(path: string) {
      try {
        if (disabled) return;
        const { sid, fresh } = session();
        const body: Record<string, unknown> = { vid: vid(), sid, type: 'pageview', path };
        if (fresh) {
          const q = new URLSearchParams(deps.search);
          if (deps.referrer) body.ref = deps.referrer;
          const s = q.get('utm_source');
          const m = q.get('utm_medium');
          const c = q.get('utm_campaign');
          if (s) body.utmSource = s;
          if (m) body.utmMedium = m;
          if (c) body.utmCampaign = c;
        }
        post(body);
      } catch {
        /* never throw */
      }
    },
    event(name: string, meta?: Meta) {
      try {
        if (disabled) return;
        const { sid } = session();
        const path = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
        const body: Record<string, unknown> = { vid: vid(), sid, type: 'event', name, path };
        if (meta) body.meta = meta;
        post(body);
        try {
          deps.gtag?.('event', name, meta);
        } catch {
          /* ignore */
        }
      } catch {
        /* never throw */
      }
    },
  };
}

const safe = (f: () => Store): Store | null => {
  try {
    return f();
  } catch {
    return null;
  }
};

const browser = typeof window !== 'undefined';

export const tracker = createTracker({
  storage: browser ? safe(() => window.localStorage) : null,
  session: browser ? safe(() => window.sessionStorage) : null,
  send: (body) => {
    void fetch('/api/t', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {});
  },
  now: () => Date.now(),
  referrer: browser ? document.referrer : '',
  search: browser ? window.location.search : '',
  gtag: browser ? (...a) => (window as unknown as { gtag?: (...x: unknown[]) => void }).gtag?.(...a) : undefined,
});

try {
  if (browser && window.localStorage.getItem('hwg_noTrack') === '1') tracker.disable();
} catch {
  /* ignore */
}

export const track = (name: string, meta?: Meta) => tracker.event(name, meta);
