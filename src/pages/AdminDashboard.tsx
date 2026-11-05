// Analytics dashboard (admins only): live visitors, totals, daily chart, pages, sources, audience and actions.
// The server checks is_admin on every call; this page only hides itself from everyone else.
// Paths, referrers and utm values come from visitors, so they are only ever rendered as React text.

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';

type Preset = 'today' | 'yesterday' | '7d' | '30d';
const PRESETS: { id: Preset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

interface Overview { visitors: number; sessions: number; pageviews: number; bounceRate: number; pagesPerSession: number; daily: { day: string; visitors: number; pageviews: number }[] }
interface Pages { topPages: { path: string; views: number; visitors: number }[]; entryPages: { path: string; sessions: number }[] }
interface Sources { sources: { source: string; medium: string; campaign: string; visitors: number }[] }
interface Audience { devices: { device: string; visitors: number }[]; countries: { country: string; visitors: number }[]; newVsReturning: { new: number; returning: number } }
interface Actions { actions: { name: string; n: number; visitors: number }[] }
interface Live { count: number; visitors: { page: string; agoSec: number }[] }

const get = async <T,>(path: string): Promise<T | null> => {
  const res = await fetch(path).catch(() => null);
  return res?.ok ? ((await res.json().catch(() => null)) as T | null) : null;
};

function Bars({ data }: { data: Overview['daily'] }) {
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

function Table({ title, head, rows }: { title: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
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

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-line bg-white p-4">
    <div className="text-sm text-muted">{label}</div>
    <div className="mt-1 text-2xl font-bold">{value}</div>
  </div>
);

export function AdminDashboardPage() {
  const { user, ready, openLogin } = useAuth();
  const [preset, setPreset] = useState<Preset | null>('7d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [live, setLive] = useState<Live | null>(null);
  const [data, setData] = useState<{ overview: Overview; pages: Pages; sources: Sources; audience: Audience; actions: Actions } | null>(null);
  const [failed, setFailed] = useState(false);
  const isAdmin = !!user?.isAdmin;

  const query = preset ? `preset=${preset}` : custom.from && custom.to ? `from=${custom.from}&to=${custom.to}` : null;

  useEffect(() => {
    if (!isAdmin) return;
    const poll = async () => setLive(await get<Live>('/api/admin/stats/live'));
    void poll();
    const t = setInterval(() => void poll(), 15_000);
    return () => clearInterval(t);
  }, [isAdmin]);

  const load = useCallback(async (q: string) => {
    const [overview, pages, sources, audience, actions] = await Promise.all([
      get<Overview>(`/api/admin/stats/overview?${q}`),
      get<Pages>(`/api/admin/stats/pages?${q}`),
      get<Sources>(`/api/admin/stats/sources?${q}`),
      get<Audience>(`/api/admin/stats/audience?${q}`),
      get<Actions>(`/api/admin/stats/actions?${q}`),
    ]);
    if (overview && pages && sources && audience && actions) {
      setData({ overview, pages, sources, audience, actions });
      setFailed(false);
    } else {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && query) void load(query);
  }, [isAdmin, query, load]);

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
        <h2 className="text-lg font-semibold">Live now: {live ? live.count : '…'}</h2>
        {live && live.visitors.length > 0 && (
          <ul className="mt-2 text-sm text-muted">
            {live.visitors.slice(0, 10).map((v, i) => <li key={i}><span className="text-ink">{v.page}</span> · {v.agoSec}s ago</li>)}
          </ul>
        )}
      </section>

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

      {failed && <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">Could not load the stats. Apply migration 0005 in D1, then reload.</div>}

      {o && data && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Kpi label="Visitors" value={String(o.visitors)} />
            <Kpi label="Sessions" value={String(o.sessions)} />
            <Kpi label="Page views" value={String(o.pageviews)} />
            <Kpi label="Bounce" value={`${Math.round(o.bounceRate * 100)}%`} />
            <Kpi label="Pages / session" value={o.pagesPerSession.toFixed(1)} />
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-white p-4">
            <h2 className="text-lg font-semibold">Page views per day</h2>
            <Bars data={o.daily} />
          </section>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Table title="Top pages" head={['Page', 'Views', 'Visitors']} rows={data.pages.topPages.map((p) => [p.path, p.views, p.visitors])} />
            <Table title="Entry pages" head={['Page', 'Sessions']} rows={data.pages.entryPages.map((p) => [p.path, p.sessions])} />
            <Table title="Sources" head={['Source', 'Medium', 'Campaign', 'Visitors']} rows={data.sources.sources.map((s) => [s.source, s.medium || '-', s.campaign || '-', s.visitors])} />
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
