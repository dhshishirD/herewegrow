// Analytics dashboard (admins only): live visitors, totals, daily chart, pages, sources, audience and actions.
// The server checks is_admin on every call; this page only hides itself from everyone else.
// Paths, referrers and utm values come from visitors, so they are only ever rendered as React text.

import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';
import { dropOff } from '../lib/funnel';

type Preset = 'today' | 'yesterday' | '7d' | '30d';
const PRESETS: { id: Preset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

interface Overview { visitors: number; sessions: number; pageviews: number; bounceRate: number | null; pagesPerSession: number; approximate: boolean; daily: { day: string; visitors: number; pageviews: number }[] }
interface Pages { topPages: { path: string; views: number; visitors: number }[]; entryPages: { path: string; sessions: number }[] }
interface Sources { sources: { source: string; medium: string; campaign: string; visitors: number; paid: number }[] }
interface Funnel { steps: { key: 'visit' | 'viewed' | 'order_started' | 'paid'; visitors: number }[] }
interface Revenue { today: number; week: number; proActivations: number; orders: number }
interface Audience { devices: { device: string; visitors: number }[]; countries: { country: string; visitors: number }[]; newVsReturning: { new: number; returning: number } }
interface Actions { actions: { name: string; n: number; visitors: number }[] }
interface Live { count: number; visitors: { page: string; agoSec: number }[]; newMessages?: number }
type MsgStatus = 'new' | 'replied' | 'closed';
interface Msg { id: string; createdAt: number; name: string; phone: string; email: string | null; message: string; page: string | null; utmSource: string | null; status: MsgStatus; note: string | null }

const STEP_LABEL: Record<Funnel['steps'][number]['key'], string> = {
  visit: 'Visited',
  viewed: 'Viewed a service, template or Pro',
  order_started: 'Started an order',
  paid: 'Paid',
};

type Got<T> = { ok: true; data: T } | { ok: false; error: string };

const MESSAGES: Record<string, string> = {
  login: 'Session expired, sign in again.',
  forbidden: 'This account is not an admin.',
  range: 'Invalid date range.',
  db: 'Database error. Has migration 0005 been applied?',
  network: 'Could not reach the server.',
};

const get = async <T,>(path: string): Promise<Got<T>> => {
  let res: Response;
  try {
    res = await fetch(path);
  } catch {
    return { ok: false, error: 'network' };
  }
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (res.ok && body) return { ok: true, data: body };
  if (res.status === 401) return { ok: false, error: 'login' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (res.status === 400) return { ok: false, error: 'range' };
  return { ok: false, error: body?.error === 'db' ? 'db' : `http ${res.status}` };
};

const fail = (code: string) => MESSAGES[code] ?? `Could not load the stats (${code}).`;

/** Every day from the first to the last in the data, with zeros for days with no visits. */
function fillDays(data: Overview['daily']): Overview['daily'] {
  if (data.length < 2) return data;
  const byDay = new Map(data.map((d) => [d.day, d]));
  const out: Overview['daily'] = [];
  const end = Date.parse(`${data[data.length - 1].day}T00:00:00Z`);
  for (let t = Date.parse(`${data[0].day}T00:00:00Z`); t <= end; t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push(byDay.get(day) ?? { day, visitors: 0, pageviews: 0 });
  }
  return out;
}

function Bars({ data: raw }: { data: Overview['daily'] }) {
  const data = fillDays(raw);
  if (data.length === 0) return <p className="text-muted">No visits in this range.</p>;
  const max = Math.max(...data.map((d) => d.pageviews), 1);
  const W = 640;
  const H = 140;
  const step = W / data.length;
  const bw = Math.max(2, step * 0.7);
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label="Page views per day">
      {data.map((d, i) => {
        const h = (d.pageviews / max) * H;
        const x = i * step + (step - bw) / 2;
        return (
          <g key={d.day}>
            <title>{`${d.day}: ${d.pageviews} page views, ${d.visitors} visitors`}</title>
            <rect x={x} y={H - h} width={bw} height={h} rx={2} className="fill-leaf" />
            {(data.length <= 10 || i % Math.ceil(data.length / 8) === 0) && (
              <text x={x + bw / 2} y={H + 13} textAnchor="middle" fontSize="10" className="fill-muted">{d.day.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Table({ title, head, rows, note }: { title: string; head: string[]; rows: ReactNode[][]; note?: string }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing yet.</p>
      ) : (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-muted">{head.map((h, i) => <th key={h} className={`py-1 font-medium ${i ? 'text-right' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {r.map((c, j) => <td key={j} className={`py-1 ${j ? 'text-right' : 'max-w-[16rem] truncate'}`}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function FunnelBars({ steps }: { steps: Funnel['steps'] }) {
  const max = Math.max(...steps.map((x) => x.visitors), 1);
  const drops = steps.map((st, i) => (i ? dropOff(steps[i - 1].visitors, st.visitors) : null));
  return (
    <>
      <ul className="mt-3 space-y-3">
        {steps.map((st, i) => {
          const drop = drops[i];
          return (
            <li key={st.key}>
              <div className="flex justify-between text-sm">
                <span>{STEP_LABEL[st.key]}</span>
                <span>
                  {st.visitors}
                  {drop === 'exceeds' ? <span className="text-muted"> · —*</span> : drop !== null && <span className="text-muted"> · {drop}% drop-off</span>}
                </span>
              </div>
              <div className="mt-1 h-3 rounded bg-line">
                <div className="h-3 rounded bg-leaf" style={{ width: `${(st.visitors / max) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      {drops.includes('exceeds') && <p className="mt-2 text-xs text-muted">* Step counts are independent, so a step can exceed the previous one.</p>}
    </>
  );
}

const taka = (n: number) => `৳${n.toLocaleString('en-US')}`;

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-line bg-white p-4">
    <div className="text-sm text-muted">{label}</div>
    <div className="mt-1 text-2xl font-bold">{value}</div>
  </div>
);

const INBOX_TABS: { id: MsgStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'new', label: 'New' }, { id: 'replied', label: 'Replied' }, { id: 'closed', label: 'Closed' },
];
const dhakaTime = (ts: number) => new Date(ts).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });

function MessageCard({ m, onSave, busy }: { m: Msg; onSave: (id: string, status: MsgStatus, note: string) => void; busy: boolean }) {
  const [note, setNote] = useState(m.note ?? '');
  return (
    <li className="rounded-xl border border-line p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{m.name} · {m.phone}</span>
        <span className="text-xs text-muted">{dhakaTime(m.createdAt)} · {m.status}</span>
      </div>
      <p className="mt-1 text-xs text-muted">Page: {m.page ?? '-'} · Source: {m.utmSource ?? '-'}{m.email ? ` · ${m.email}` : ''}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm">{m.message}</p>
      <textarea className="field mt-2" rows={2} maxLength={500} placeholder="Note" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-2 flex flex-wrap gap-2">
        {m.status !== 'replied' && <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => onSave(m.id, 'replied', note)}>Replied</button>}
        {m.status !== 'closed' && <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => onSave(m.id, 'closed', note)}>Closed</button>}
        {m.status !== 'new' && <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => onSave(m.id, 'new', note)}>Reopen</button>}
        <a className="btn btn-primary" href={`https://wa.me/88${m.phone}`} target="_blank" rel="noreferrer">Reply on WhatsApp</a>
      </div>
    </li>
  );
}

function Inbox({ newMessages }: { newMessages: number }) {
  const [tab, setTab] = useState<MsgStatus | 'all'>('all');
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setMessages(null);
    setError(null);
    void get<{ messages: Msg[] }>(`/api/admin/contacts${tab === 'all' ? '' : `?status=${tab}`}`).then((r) => {
      if (cancelled) return;
      if (r.ok) setMessages(r.data.messages);
      else setError(fail(r.error));
    });
    return () => {
      cancelled = true;
    };
  }, [tab, reload]);

  const save = async (id: string, status: MsgStatus, note: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note }) });
      if (res.ok) setReload((n) => n + 1);
      else setError(res.status === 401 ? MESSAGES.login : res.status === 403 ? MESSAGES.forbidden : `Could not save (http ${res.status}).`);
    } catch {
      setError(MESSAGES.network);
    }
    setBusy(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Messages
          {newMessages > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white" aria-label={`${newMessages} new`}>{newMessages}</span>}
        </h2>
        <div className="flex gap-2">
          {INBOX_TABS.map((x) => (
            <button key={x.id} type="button" aria-pressed={tab === x.id} className={`btn ${tab === x.id ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setTab(x.id)}>{x.label}</button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}
      {!messages && !error && <p className="mt-2 text-sm text-muted">Loading…</p>}
      {messages && messages.length === 0 && <p className="mt-2 text-sm text-muted">No messages.</p>}
      {messages && messages.length > 0 && (
        <ul className="mt-3 space-y-3">{messages.map((m) => <MessageCard key={`${m.id}:${m.status}:${m.note ?? ''}`} m={m} onSave={save} busy={busy} />)}</ul>
      )}
    </section>
  );
}

export function AdminDashboardPage() {
  const { user, ready, openLogin } = useAuth();
  const [preset, setPreset] = useState<Preset | null>('7d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [live, setLive] = useState<Live | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [data, setData] = useState<{ overview: Overview; pages: Pages; sources: Sources; audience: Audience; actions: Actions; funnel: Funnel; revenue: Revenue } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = !!user?.isAdmin;

  const query = preset ? `preset=${preset}` : custom.from && custom.to ? `from=${custom.from}&to=${custom.to}` : null;

  useEffect(() => {
    if (!isAdmin) return;
    let stopped = false;
    let inFlight = false;
    const poll = async () => {
      if (inFlight || document.hidden) return;
      inFlight = true;
      const r = await get<Live>('/api/admin/stats/live');
      inFlight = false;
      if (stopped) return;
      if (r.ok) {
        setLive(r.data);
        setLiveError(null);
      } else {
        setLive(null);
        setLiveError(fail(r.error));
      }
    };
    void poll();
    const t = setInterval(() => void poll(), 15_000);
    const onVisible = () => void poll();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !query) return;
    let cancelled = false;
    setData(null);
    setError(null);
    void (async () => {
      const [overview, pages, sources, audience, actions, funnel, revenue] = await Promise.all([
        get<Overview>(`/api/admin/stats/overview?${query}`),
        get<Pages>(`/api/admin/stats/pages?${query}`),
        get<Sources>(`/api/admin/stats/sources?${query}`),
        get<Audience>(`/api/admin/stats/audience?${query}`),
        get<Actions>(`/api/admin/stats/actions?${query}`),
        get<Funnel>(`/api/admin/stats/funnel?${query}`),
        get<Revenue>('/api/admin/stats/revenue'),
      ]);
      if (cancelled) return;
      if (overview.ok && pages.ok && sources.ok && audience.ok && actions.ok && funnel.ok && revenue.ok) {
        setData({ overview: overview.data, pages: pages.data, sources: sources.data, audience: audience.data, actions: actions.data, funnel: funnel.data, revenue: revenue.data });
      } else {
        const bad = [overview, pages, sources, audience, actions, funnel, revenue].find((r) => !r.ok);
        setError(fail(bad && !bad.ok ? bad.error : 'unknown'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, query]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>Log in</button>
      </div>
    );
  }
  if (!user.isAdmin) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Not allowed</h1>
        <p className="mt-3 text-muted">This page is for the site admin.</p>
      </div>
    );
  }

  const o = data?.overview;
  return (
    <div className="wrap max-w-5xl py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/careers" className="underline">Career Hub</Link>
          <Link href="/admin/promos" className="underline">Promo codes</Link>
        </nav>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-4">
        <h2 className="text-lg font-semibold">Live now: {live ? live.count : liveError ? 'unavailable' : '…'}</h2>
        {liveError && <p role="alert" className="mt-2 text-sm text-red-800">{liveError}</p>}
        {live && live.visitors.length > 0 && (
          <ul className="mt-2 text-sm text-muted">
            {live.visitors.slice(0, 10).map((v, i) => <li key={i}><span className="text-ink">{v.page}</span> · {v.agoSec}s ago</li>)}
          </ul>
        )}
      </section>

      <Inbox newMessages={live?.newMessages ?? 0} />

      <div className="mt-6 flex flex-wrap items-end gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={`btn ${preset === p.id ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setPreset(p.id)}>{p.label}</button>
        ))}
        <label className="ml-2 text-sm">From
          <input type="date" className="field mt-1" value={custom.from} onChange={(e) => { setCustom({ ...custom, from: e.target.value }); setPreset(null); }} />
        </label>
        <label className="text-sm">To
          <input type="date" className="field mt-1" value={custom.to} onChange={(e) => { setCustom({ ...custom, to: e.target.value }); setPreset(null); }} />
        </label>
      </div>

      {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {!data && !error && query && <p className="mt-4 text-muted">Loading…</p>}

      {o && data && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Kpi label="Visitors" value={String(o.visitors)} />
            <Kpi label="Sessions" value={String(o.sessions)} />
            <Kpi label="Page views" value={String(o.pageviews)} />
            <Kpi label="Bounce" value={o.bounceRate === null ? '—' : `${Math.round(o.bounceRate * 100)}%`} />
            <Kpi label="Pages / session" value={o.pagesPerSession.toFixed(1)} />
          </div>
          {o.approximate && <p className="mt-2 text-xs text-muted">Includes rolled-up days (older than 90 days): visitor counts, bounce rate and paid attribution are approximate or unavailable for those days.</p>}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Revenue today" value={taka(data.revenue.today)} />
            <Kpi label="Revenue, last 7 days" value={taka(data.revenue.week)} />
            <Kpi label="Paid orders (incl. Pro), 7 days" value={String(data.revenue.orders)} />
            <Kpi label="Pro activations, last 7 days" value={String(data.revenue.proActivations)} />
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-white p-4">
            <h2 className="text-lg font-semibold">Funnel</h2>
            <FunnelBars steps={data.funnel.steps} />
          </section>

          <section className="mt-6 rounded-2xl border border-line bg-white p-4">
            <h2 className="text-lg font-semibold">Page views per day</h2>
            <Bars data={o.daily} />
          </section>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Table title="Top pages" head={['Page', 'Views', 'Visitors']} rows={data.pages.topPages.map((p) => [p.path, p.views, p.visitors])} />
            <Table title="Entry pages" head={['Page', 'Sessions']} rows={data.pages.entryPages.map((p) => [p.path, p.sessions])} />
            <Table
              title="Sources"
              head={['Source', 'Medium', 'Campaign', 'Visitors', 'Paid']}
              rows={data.sources.sources.map((s) => [s.source, s.medium || '-', s.campaign || '-', s.visitors, s.paid])}
              note="Visitors = sessions' entry source within the range; Paid = buyers' first-touch source — not a conversion rate."
            />
            <Table title="Actions" head={['Action', 'Count', 'Visitors']} rows={data.actions.actions.map((a) => [a.name, a.n, a.visitors])} />
            <Table title="Devices" head={['Device', 'Visitors']} rows={data.audience.devices.map((d) => [d.device, d.visitors])} />
            <Table title="Countries" head={['Country', 'Visitors']} rows={data.audience.countries.map((c) => [c.country, c.visitors])} />
            <Table title="New vs returning" head={['Visitors', 'Count']} rows={[['New', data.audience.newVsReturning.new], ['Returning', data.audience.newVsReturning.returning]]} />
          </div>
        </>
      )}
    </div>
  );
}
