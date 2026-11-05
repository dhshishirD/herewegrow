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
  /** Opt-out: start disabled. */
  noTrack?: boolean;
}

const IDLE_MS = 30 * 60_000;
const VID_KEY = 'hwg_vid';
const SID_KEY = 'hwg_sid';
const QUEUE_CAP = 50;

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
  let disabled = !!deps.noTrack;
  let ready = false;
  let memVid: string | null = null;
  let memSession: { sid: string; last: number; attr: boolean } | null = null;
  type Item = { kind: 'pageview' | 'event'; path: string; name?: string; meta?: Meta };
  let queue: Item[] = [];

  const vid = (): string => {
    const stored = read(deps.storage, VID_KEY);
    if (stored) return stored;
    if (!memVid) {
      memVid = uuid();
      write(deps.storage, VID_KEY, memVid);
    }
    return memVid;
  };

  /** Current session, rolling it after 30 minutes idle. `attr` is true until ref/utm have gone out for it. */
  const session = () => {
    const now = deps.now();
    let cur = memSession;
    try {
      const raw = read(deps.session, SID_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { sid?: unknown; last?: unknown; attr?: unknown };
        if (typeof p.sid === 'string' && typeof p.last === 'number') cur = { sid: p.sid, last: p.last, attr: p.attr === true };
      }
    } catch {
      /* ignore corrupt value */
    }
    const next = !cur || now - cur.last > IDLE_MS ? { sid: uuid(), last: now, attr: false } : { ...cur, last: now };
    memSession = next;
    write(deps.session, SID_KEY, JSON.stringify(next));
    return next;
  };

  const post = (body: Record<string, unknown>) => {
    try {
      deps.send(body);
    } catch {
      /* analytics must never break the page */
    }
  };

  /** Build and send one hit; the first hit of a session carries ref/utm. */
  const emit = (it: Item) => {
    const ses = session();
    const body: Record<string, unknown> = { vid: vid(), sid: ses.sid, type: it.kind, path: it.path };
    if (it.kind === 'event') {
      body.name = it.name;
      if (it.meta) body.meta = it.meta;
    }
    if (!ses.attr) {
      const q = new URLSearchParams(deps.search);
      if (deps.referrer) body.ref = deps.referrer;
      for (const [k, p] of [['utmSource', 'utm_source'], ['utmMedium', 'utm_medium'], ['utmCampaign', 'utm_campaign']] as const) {
        const v = q.get(p);
        if (v) body[k] = v;
      }
      write(deps.session, SID_KEY, JSON.stringify({ ...ses, attr: true }));
      memSession = { ...ses, attr: true };
    }
    post(body);
    if (it.kind === 'event') {
      try {
        deps.gtag?.('event', it.name, it.meta);
      } catch {
        /* ignore */
      }
    }
  };

  const handle = (it: Item) => {
    try {
      if (disabled) return;
      if (!ready) {
        if (queue.length < QUEUE_CAP) queue.push(it);
        return;
      }
      emit(it);
    } catch {
      /* never throw */
    }
  };

  /** First-touch source of this page load: utm_source if present, else the referrer host. Never throws. */
  const source = (): string | null => {
    try {
      const u = new URLSearchParams(deps.search).get('utm_source');
      if (u) return u;
      return deps.referrer ? new URL(deps.referrer).hostname || null : null;
    } catch {
      return null;
    }
  };

  const here = () => (typeof window !== 'undefined' ? window.location.pathname || '/' : '/');

  return {
    vid,
    source,
    /** Stop tracking for good (admin, opt-out) and drop anything queued. */
    disable() {
      disabled = true;
      queue = [];
    },
    /** Auth state is known: send what was queued (page views first, so the first hit carries ref/utm). */
    ready() {
      try {
        ready = true;
        const q = queue;
        queue = [];
        if (disabled) return;
        for (const it of q.filter((i) => i.kind === 'pageview')) handle(it);
        for (const it of q.filter((i) => i.kind === 'event')) handle(it);
      } catch {
        /* never throw */
      }
    },
    pageview(path: string) {
      handle({ kind: 'pageview', path });
    },
    event(name: string, meta?: Meta) {
      handle({ kind: 'event', name, meta, path: here() });
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
  noTrack: browser ? safe(() => window.localStorage)?.getItem('hwg_noTrack') === '1' : false,
  gtag: browser ? (...a) => (window as unknown as { gtag?: (...x: unknown[]) => void }).gtag?.(...a) : undefined,
});

export const track = (name: string, meta?: Meta) => tracker.event(name, meta);
