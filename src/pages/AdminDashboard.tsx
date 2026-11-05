// Analytics dashboard (admins only): live visitors, totals, daily chart, pages, sources, audience and actions.
// The server checks is_admin on every call; this page only hides itself from everyone else.
// Paths, referrers and utm values come from visitors, so they are only ever rendered as React text.

import { useEffect, useState, type ReactNode } from 'react';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';
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
  if (data.length === 0) return <p className="text-sm text-muted">No visits in this range.</p>;
  const max = Math.max(...data.map((d) => d.pageviews), 1);
  const W = 640;
  const H = 150;
  const step = W / data.length;
  const bw = Math.max(2, Math.min(step * 0.62, 36));
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" role="img" aria-label="Page views per day">
      <defs>
        <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b7bf0" />
          <stop offset="100%" stopColor="#1d5bd8" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1="0" x2={W} y1={H - f * H} y2={H - f * H} className="stroke-line" strokeDasharray={f ? '3 4' : undefined} />
          {f > 0 && <text x="0" y={H - f * H - 4} fontSize="10" className="fill-muted">{Math.round(max * f)}</text>}
        </g>
      ))}
      {data.map((d, i) => {
        const h = Math.max((d.pageviews / max) * H, d.pageviews ? 2 : 0);
        const x = i * step + (step - bw) / 2;
        return (
          <g key={d.day}>
            <title>{`${d.day}: ${d.pageviews} page views, ${d.visitors} visitors`}</title>
            <rect x={x} y={H - h} width={bw} height={h} rx={Math.min(5, bw / 2)} fill="url(#bar)" />
            {(data.length <= 10 || i % Math.ceil(data.length / 8) === 0) && (
              <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize="10" className="fill-muted">{d.day.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Table({ title, head, rows, note }: { title: string; head: string[]; rows: ReactNode[][]; note?: string }) {
  // The first number column drives a soft bar behind each row, so the biggest rows read at a glance.
  const nums = rows.map((r) => (typeof r[1] === 'number' ? (r[1] as number) : 0));
  const max = Math.max(...nums, 1);
  const bars = rows.length > 1 && typeof rows[0]?.[1] === 'number';
  return (
    <Card title={title} note={note}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">{head.map((h, i) => <th key={h} className={`pb-2 font-medium ${i ? 'text-right' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line transition hover:bg-mist/60">
                {r.map((c, j) => (
                  <td key={j} className={`relative py-2 ${j ? 'text-right tabular-nums' : 'max-w-[16rem] truncate pr-3 font-medium'}`}>
                    {j === 1 && bars && <span aria-hidden="true" className="absolute inset-y-1.5 right-0 -z-0 rounded-l bg-leaf-soft" style={{ width: `${Math.max(6, (nums[i] / max) * 100)}%` }} />}
                    <span className="relative">{c}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function FunnelBars({ steps }: { steps: Funnel['steps'] }) {
  const max = Math.max(...steps.map((x) => x.visitors), 1);
  const drops = steps.map((st, i) => (i ? dropOff(steps[i - 1].visitors, st.visitors) : null));
  return (
    <>
      <ul className="space-y-4">
        {steps.map((st, i) => {
          const drop = drops[i];
          return (
            <li key={st.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{STEP_LABEL[st.key]}</span>
                <span className="tabular-nums">
                  <strong className="text-base">{st.visitors}</strong>
                  {drop === 'exceeds' ? <span className="ml-2 text-xs text-muted">—*</span> : drop !== null && <span className="ml-2 text-xs text-muted">{drop}% drop-off</span>}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gradient-to-r from-leaf to-saffron transition-[width] duration-500" style={{ width: `${Math.max((st.visitors / max) * 100, st.visitors ? 2 : 0)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      {drops.includes('exceeds') && <p className="mt-3 text-xs text-muted">* Step counts are independent, so a step can exceed the previous one.</p>}
    </>
  );
}

const taka = (n: number) => `৳${n.toLocaleString('en-US')}`;

const Kpi = ({ label, value, accent = 'bg-leaf' }: { label: string; value: string; accent?: string }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(11_26_51/0.05),0_8px_24px_-12px_rgb(11_26_51/0.18)] ring-1 ring-line/80">
    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
    <div className="mt-1.5 text-2xl font-bold tracking-tight tabular-nums text-ink sm:text-3xl">{value}</div>
  </div>
);

const INBOX_TABS: { id: MsgStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'new', label: 'New' }, { id: 'replied', label: 'Replied' }, { id: 'closed', label: 'Closed' },
];
const dhakaTime = (ts: number) => new Date(ts).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });

const STATUS_TONE: Record<MsgStatus, 'amber' | 'green' | 'slate'> = { new: 'amber', replied: 'green', closed: 'slate' };

function MessageCard({ m, onSave, busy }: { m: Msg; onSave: (id: string, status: MsgStatus, note: string) => void; busy: boolean }) {
  const [note, setNote] = useState(m.note ?? '');
  return (
    <li className="rounded-xl border border-line bg-white p-4 transition hover:border-leaf/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold">
          {m.name} <span className="font-normal text-muted">{m.phone}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-muted">{dhakaTime(m.createdAt)} <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge></span>
      </div>
      <p className="mt-1 text-xs text-muted">Page: {m.page ?? '-'} · Source: {m.utmSource ?? '-'}{m.email ? ` · ${m.email}` : ''}</p>
      <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-mist/70 px-3 py-2 text-sm">{m.message}</p>
      <textarea className="field mt-3" rows={2} maxLength={500} placeholder="Note" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-3 flex flex-wrap gap-2">
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
    <Card
      className="mt-5"
      title="Messages"
      aside={
        <div className="flex flex-wrap items-center gap-2">
          {newMessages > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white" aria-label={`${newMessages} new`}>{newMessages} new</span>}
          <div role="group" aria-label="Filter messages" className="flex gap-1 rounded-xl bg-mist p-1">
            {INBOX_TABS.map((x) => (
              <button key={x.id} type="button" aria-pressed={tab === x.id} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === x.id ? 'bg-white text-leaf shadow-sm' : 'text-muted hover:text-ink'}`} onClick={() => setTab(x.id)}>{x.label}</button>
            ))}
          </div>
        </div>
      }
    >
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      {!messages && !error && <p className="text-sm text-muted">Loading…</p>}
      {messages && messages.length === 0 && <p className="text-sm text-muted">No messages.</p>}
      {messages && messages.length > 0 && (
        <ul className="space-y-3">{messages.map((m) => <MessageCard key={`${m.id}:${m.status}:${m.note ?? ''}`} m={m} onSave={save} busy={busy} />)}</ul>
      )}
    </Card>
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
  const livePill = (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5">
        {live && live.count > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live && live.count > 0 ? 'bg-saffron' : 'bg-white/40'}`} />
      </span>
      <div className="leading-tight">
        <div className="text-2xl font-bold tabular-nums">{live ? live.count : liveError ? '–' : '…'}</div>
        <div className="text-xs text-white/70">{liveError ? 'live count unavailable' : 'on the site now'}</div>
      </div>
    </div>
  );

  return (
    <AdminShell active="/admin" title="Analytics" subtitle="Who is visiting, what they do, and what it earns." actions={livePill}>
      {liveError && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{liveError}</div>}

      <Card title="Right now" aside={<span className="text-xs text-muted">last 5 minutes</span>}>
        {live && live.visitors.length > 0 ? (
          <ul className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {live.visitors.slice(0, 10).map((v, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                <span className="truncate font-medium text-ink">{v.page}</span>
                <span className="shrink-0 text-xs text-muted">{v.agoSec}s ago</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{live ? 'No one on the site right now.' : '…'}</p>
        )}
      </Card>

      <Inbox newMessages={live?.newMessages ?? 0} />

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div role="group" aria-label="Date range" className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-line/80">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" aria-pressed={preset === p.id} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${preset === p.id ? 'bg-leaf text-white shadow' : 'text-muted hover:bg-mist hover:text-ink'}`} onClick={() => setPreset(p.id)}>{p.label}</button>
          ))}
        </div>
        <label className="text-xs font-medium text-muted">From
          <input type="date" className="field mt-1 !min-h-[2.5rem] !py-1.5 text-sm" value={custom.from} onChange={(e) => { setCustom({ ...custom, from: e.target.value }); setPreset(null); }} />
        </label>
        <label className="text-xs font-medium text-muted">To
          <input type="date" className="field mt-1 !min-h-[2.5rem] !py-1.5 text-sm" value={custom.to} onChange={(e) => { setCustom({ ...custom, to: e.target.value }); setPreset(null); }} />
        </label>
      </div>

      {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {!data && !error && query && <p className="mt-4 text-muted">Loading…</p>}

      {o && data && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Kpi label="Visitors" value={String(o.visitors)} />
            <Kpi label="Sessions" value={String(o.sessions)} />
            <Kpi label="Page views" value={String(o.pageviews)} />
            <Kpi label="Bounce" value={o.bounceRate === null ? '—' : `${Math.round(o.bounceRate * 100)}%`} accent="bg-saffron" />
            <Kpi label="Pages / session" value={o.pagesPerSession.toFixed(1)} accent="bg-saffron" />
          </div>
          {o.approximate && <p className="mt-2 text-xs text-muted">Includes rolled-up days (older than 90 days): visitor counts, bounce rate and paid attribution are approximate or unavailable for those days.</p>}

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Revenue today" value={taka(data.revenue.today)} accent="bg-gold" />
            <Kpi label="Revenue, last 7 days" value={taka(data.revenue.week)} accent="bg-gold" />
            <Kpi label="Paid orders (incl. Pro), 7 days" value={String(data.revenue.orders)} accent="bg-gold" />
            <Kpi label="Pro activations, last 7 days" value={String(data.revenue.proActivations)} accent="bg-gold" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card title="Page views per day"><Bars data={o.daily} /></Card>
            <Card title="Funnel"><FunnelBars steps={data.funnel.steps} /></Card>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
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
    </AdminShell>
  );
}
