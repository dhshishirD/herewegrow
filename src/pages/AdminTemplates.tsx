// Template library admin (admins only): see views and sales per template, hide weak or duplicate ones, feature the best,
// set the order, and fix a title, category or profession. Hiding never deletes: buyers keep their downloads.
// The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { CATEGORIES, TEMPLATES, hubOf, type Template } from '../../shared/templates';
import { applyOverrides, type TemplateOverride } from '../../shared/templateOverrides';

type Ov = TemplateOverride & { note?: string | null };
interface Stat { views: number; sales: number }
type View = 'all' | 'visible' | 'hidden' | 'featured' | 'unseen';

const post = (path: string, body: unknown) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const PAGE = 40;

export function AdminTemplatesPage() {
  const { user, ready, openLogin } = useAuth();
  const [ov, setOv] = useState<Record<string, Ov>>({});
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('all');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'views' | 'sales'>('order');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/templates');
    const d = (await res.json().catch(() => ({}))) as { overrides?: Record<string, Ov>; stats?: Record<string, Stat> };
    if (!res.ok) {
      setError(res.status === 500 ? 'The database could not be read. Apply migration 0008 (template_overrides) in D1.' : `Could not load (${res.status}).`);
      return;
    }
    setError('');
    setOv(d.overrides ?? {});
    setStats(d.stats ?? {});
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

  // The list as admin sees it: every template (hidden kept), with fixed titles and categories applied.
  const all = useMemo(() => applyOverrides(TEMPLATES, ov, { keepHidden: true }), [ov]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = all.filter((t) => {
      const o = ov[t.id];
      const s = stats[t.id];
      if (view === 'visible' && o?.hidden) return false;
      if (view === 'hidden' && !o?.hidden) return false;
      if (view === 'featured' && !o?.featured) return false;
      if (view === 'unseen' && (s?.views ?? 0) > 0) return false;
      if (cat !== 'all' && hubOf(t) !== cat) return false;
      return !needle || `${t.id} ${t.title.en} ${t.prof ?? ''}`.toLowerCase().includes(needle);
    });
    if (sortBy === 'views') out.sort((a, b) => (stats[b.id]?.views ?? 0) - (stats[a.id]?.views ?? 0));
    if (sortBy === 'sales') out.sort((a, b) => (stats[b.id]?.sales ?? 0) - (stats[a.id]?.sales ?? 0));
    return out;
  }, [all, ov, stats, view, cat, q, sortBy]);

  useEffect(() => setLimit(PAGE), [view, cat, q, sortBy]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Templates</h1>
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

  const hiddenCount = Object.values(ov).filter((o) => o.hidden).length;
  const featuredCount = Object.values(ov).filter((o) => o.featured).length;

  const save = async (id: string, patch: Partial<Ov>) => {
    setBusy(true);
    try {
      const res = await post(`/api/admin/templates/${id}`, patch);
      if (!res.ok) setError(`Could not save (${res.status}).`);
      else await load();
    } finally {
      setBusy(false);
    }
  };

  const bulk = async (hidden: boolean) => {
    if (picked.size === 0) return;
    if (hidden && !window.confirm(`Hide ${picked.size} template${picked.size === 1 ? '' : 's'} from the shop? Buyers keep their downloads, and you can show them again.`)) return;
    setBusy(true);
    try {
      const res = await post('/api/admin/templates/bulk', { ids: [...picked], hidden });
      if (!res.ok) setError(`Could not save (${res.status}).`);
      else {
        setPicked(new Set());
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (!n.delete(id)) n.add(id);
      return n;
    });

  const chip = (on: boolean) => `rounded-full px-3 py-1 text-sm font-semibold ${on ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:ring-leaf'}`;
  const shown = rows.slice(0, limit);

  return (
    <AdminShell active="/admin/templates" title="Templates" subtitle="Hide weak or duplicate templates, feature the best, set the order, and fix titles. Hiding never deletes: buyers keep their downloads.">
      <div className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

        <Card>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div><div className="text-2xl font-bold">{TEMPLATES.length - hiddenCount}</div><div className="text-xs text-muted">on sale</div></div>
            <div><div className="text-2xl font-bold">{hiddenCount}</div><div className="text-xs text-muted">hidden</div></div>
            <div><div className="text-2xl font-bold">{featuredCount}</div><div className="text-xs text-muted">featured</div></div>
            <div><div className="text-2xl font-bold">{Object.values(stats).reduce((n, s) => n + s.sales, 0)}</div><div className="text-xs text-muted">single sales</div></div>
          </div>
          <p className="mt-3 text-xs text-muted">Views are the last 30 days. Sales count single-template purchases only (packs and carts are not split per template).</p>
        </Card>

        <Card>
          <div className="flex flex-wrap gap-2">
            {([['all', 'All'], ['visible', 'On sale'], ['hidden', 'Hidden'], ['featured', 'Featured'], ['unseen', 'No views']] as const).map(([v, label]) => (
              <button key={v} type="button" className={chip(view === v)} onClick={() => setView(v)}>{label}</button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input className="field" placeholder="Search title, id or profession" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            <select className="field" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}
            </select>
            <select className="field" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} aria-label="Sort">
              <option value="order">Shop order</option>
              <option value="views">Most views first</option>
              <option value="sales">Most sales first</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">{rows.length} shown · {picked.size} selected</span>
            <button type="button" className="btn btn-quiet" onClick={() => setPicked(new Set(shown.map((t) => t.id)))}>Select these {shown.length}</button>
            <button type="button" className="btn btn-quiet" disabled={picked.size === 0} onClick={() => setPicked(new Set())}>Clear</button>
            <button type="button" className="btn btn-primary" disabled={busy || picked.size === 0} onClick={() => void bulk(true)}>Hide selected</button>
            <button type="button" className="btn btn-quiet" disabled={busy || picked.size === 0} onClick={() => void bulk(false)}>Show selected</button>
          </div>
        </Card>

        <Card>
          {shown.length === 0 ? (
            <p className="text-muted">No templates match.</p>
          ) : (
            <ul className="divide-y divide-line">
              {shown.map((t) => (
                <Row key={t.id} t={t} o={ov[t.id]} s={stats[t.id]} picked={picked.has(t.id)} onPick={() => toggle(t.id)} open={open === t.id} onOpen={() => setOpen(open === t.id ? null : t.id)} busy={busy} save={save} />
              ))}
            </ul>
          )}
          {rows.length > limit && (
            <div className="mt-4 text-center"><button type="button" className="btn btn-quiet" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, rows.length - limit)} more</button></div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}

function Row({ t, o, s, picked, onPick, open, onOpen, busy, save }: { t: Template; o: Ov | undefined; s: Stat | undefined; picked: boolean; onPick: () => void; open: boolean; onOpen: () => void; busy: boolean; save: (id: string, p: Partial<Ov>) => Promise<void> }) {
  const hidden = !!o?.hidden;
  return (
    <li className={`py-3 ${hidden ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={picked} onChange={onPick} aria-label={`Select ${t.id}`} className="h-4 w-4" />
        <img src={`/templates/${t.id}/thumb.webp`} alt="" width={48} height={68} loading="lazy" decoding="async" className="h-[68px] w-12 shrink-0 rounded bg-mist object-cover object-top ring-1 ring-line" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{t.title.en}</div>
          <div className="truncate text-xs text-muted">{t.id} · {CATEGORIES.find((c) => c.id === hubOf(t))?.name.en} · {t.pages}p{t.prof ? ` · ${t.prof}` : ''}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {hidden && <Badge tone="slate">hidden</Badge>}
            {o?.featured && <Badge tone="amber">featured</Badge>}
            {o?.sort != null && <Badge tone="blue">order {o.sort}</Badge>}
            {o?.note && <Badge tone="slate">note</Badge>}
          </div>
        </div>
        <div className="hidden text-right text-xs text-muted sm:block">
          <div><b className="text-ink">{s?.views ?? 0}</b> views</div>
          <div><b className="text-ink">{s?.sales ?? 0}</b> sold</div>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void save(t.id, { hidden: !hidden })}>{hidden ? 'Show' : 'Hide'}</button>
          <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void save(t.id, { featured: !o?.featured })}>{o?.featured ? 'Unfeature' : 'Feature'}</button>
          <button type="button" className="btn btn-quiet" onClick={onOpen} aria-expanded={open}>{open ? 'Close' : 'Edit'}</button>
        </div>
      </div>
      <div className="mt-1 text-xs text-muted sm:hidden">{s?.views ?? 0} views · {s?.sales ?? 0} sold</div>
      {open && <Editor key={t.id + String(o ? 1 : 0)} t={t} o={o} busy={busy} save={save} />}
    </li>
  );
}

function Editor({ t, o, busy, save }: { t: Template; o: Ov | undefined; busy: boolean; save: (id: string, p: Partial<Ov>) => Promise<void> }) {
  const base = TEMPLATES.find((x) => x.id === t.id);
  const [titleEn, setTitleEn] = useState(o?.titleEn ?? '');
  const [titleBn, setTitleBn] = useState(o?.titleBn ?? '');
  const [hub, setHub] = useState(o?.hub ?? '');
  const [prof, setProf] = useState(o?.prof ?? '');
  const [sort, setSort] = useState(o?.sort != null ? String(o.sort) : '');
  const [note, setNote] = useState(o?.note ?? '');
  const submit = () =>
    void save(t.id, { titleEn: titleEn || null, titleBn: titleBn || null, hub: hub || null, prof: prof || null, sort: sort === '' ? null : Number(sort), note: note || null });
  return (
    <div className="mt-3 grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-2">
      <label className="text-sm">Title (English)
        <input className="field mt-1" maxLength={120} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={base?.title.en} />
      </label>
      <label className="text-sm">Title (Bangla)
        <input className="field mt-1" maxLength={120} value={titleBn} onChange={(e) => setTitleBn(e.target.value)} placeholder={base?.title.bn} />
      </label>
      <label className="text-sm">Category
        <select className="field mt-1" value={hub} onChange={(e) => setHub(e.target.value)}>
          <option value="">As shipped ({CATEGORIES.find((c) => c.id === (base ? hubOf(base) : ''))?.name.en})</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}
        </select>
      </label>
      <label className="text-sm">Profession tag
        <input className="field mt-1" maxLength={40} value={prof} onChange={(e) => setProf(e.target.value)} placeholder={base?.prof ?? 'none'} />
      </label>
      <label className="text-sm">Position (lower = earlier; featured always first)
        <input className="field mt-1" type="number" step={1} value={sort} onChange={(e) => setSort(e.target.value)} placeholder="natural order" />
      </label>
      <label className="text-sm">Private note
        <input className="field mt-1" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Looks like modern-014; font check…" />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>Save changes</button>
        <a className="text-sm underline" href={`/templates/${t.id}`} target="_blank" rel="noreferrer">Open public page</a>
        <span className="text-xs text-muted">Empty fields go back to what was shipped.</span>
      </div>
    </div>
  );
}
