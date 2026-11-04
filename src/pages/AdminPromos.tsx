// Promo code admin (admins only): create a code, make a batch of single-use codes, switch codes on or off.
// The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';

interface PromoRow {
  code: string;
  type: 'percent' | 'fixed' | 'trial_days';
  value: number;
  scope: string;
  maxUses: number | null;
  perUser: number;
  expiresAt: number | null;
  active: boolean;
  note: string | null;
  used: number;
  discountTotal: number;
}

const describe = (p: PromoRow) => (p.type === 'percent' ? `${p.value}% off` : p.type === 'fixed' ? `৳${p.value} off` : `${p.value} free Pro days`);
const post = (path: string, body?: unknown) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
/** End of the chosen day, Dhaka time. */
const endOfDay = (d: string) => (d ? new Date(`${d}T23:59:59+06:00`).getTime() : null);

export function AdminPromosPage() {
  const { user, ready, openLogin } = useAuth();
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const [made, setMade] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/promos');
    const d = (await res.json().catch(() => ({}))) as { promos?: PromoRow[] };
    if (!res.ok) {
      setNotice({ ok: false, lines: [res.status === 500 ? 'The database could not be read. Apply migration 0004 (promo tables) in D1.' : `Could not load codes (${res.status}).`] });
      return;
    }
    setRows(d.promos ?? []);
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Promo codes</h1>
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

  const send = async (path: string, body: unknown, okText: (d: { codes?: string[] }) => string) => {
    setBusy(true);
    setNotice(null);
    setMade([]);
    try {
      const res = await post(path, body);
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; codes?: string[]; errors?: string[]; error?: string };
      if (d.ok) {
        setNotice({ ok: true, lines: [okText(d)] });
        if (d.codes && d.codes.length > 1) setMade(d.codes);
        await load();
        return true;
      }
      setNotice({ ok: false, lines: d.errors ?? [d.error === 'db' ? 'Database error. Apply migration 0004 in D1.' : `Failed (${d.error ?? res.status}).`] });
    } finally {
      setBusy(false);
    }
    return false;
  };

  const fields = (f: FormData) => ({
    type: f.get('type'),
    value: Number(f.get('value')),
    scope: f.get('scope') || 'all',
    maxUses: f.get('maxUses') ? Number(f.get('maxUses')) : null,
    perUser: f.get('perUser') ? Number(f.get('perUser')) : null,
    expiresAt: endOfDay(String(f.get('expires') ?? '')),
    note: f.get('note') || null,
  });

  const createOne = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (await send('/api/admin/promos', { code: f.get('code'), ...fields(f) }, (d) => `Created ${d.codes?.[0]}.`)) form.reset();
  };

  const createMany = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await send('/api/admin/promos', { prefix: f.get('prefix'), count: Number(f.get('count')), ...fields(f) }, (d) => `Made ${d.codes?.length} single-use codes. Copy them below.`);
  };

  const toggle = async (p: PromoRow) => {
    setBusy(true);
    await post(`/api/admin/promos/${p.code}/${p.active ? 'disable' : 'enable'}`);
    setBusy(false);
    await load();
  };

  const Fields = (
    <>
      <label className="text-sm">Type
        <select name="type" className="field mt-1" defaultValue="percent">
          <option value="percent">Percent off</option>
          <option value="fixed">Taka off</option>
          <option value="trial_days">Free Pro days (trial)</option>
        </select>
      </label>
      <label className="text-sm">Value
        <input name="value" type="number" min={1} required className="field mt-1" placeholder="30 or 7" />
      </label>
      <label className="text-sm">Works on
        <select name="scope" className="field mt-1" defaultValue="all">
          <option value="all">Everything</option>
          <option value="pro">Pro passes</option>
          <option value="template">Templates and packs</option>
          <option value="service">CV services</option>
        </select>
      </label>
      <label className="text-sm">Total uses (empty = unlimited)
        <input name="maxUses" type="number" min={1} className="field mt-1" />
      </label>
      <label className="text-sm">Uses per account
        <input name="perUser" type="number" min={1} className="field mt-1" placeholder="1" />
      </label>
      <label className="text-sm">Last day (empty = no end)
        <input name="expires" type="date" className="field mt-1" />
      </label>
      <label className="text-sm sm:col-span-2">Note (for you)
        <input name="note" maxLength={200} className="field mt-1" placeholder="Eid offer, workshop batch…" />
      </label>
    </>
  );

  return (
    <div className="wrap max-w-4xl py-12">
      <h1 className="text-3xl font-bold">Promo codes</h1>
      <p className="mt-2 text-sm text-muted">
        No one pays under ৳10. A trial code gives free Pro days once per account and only works on Pro. A code is used up when the payment is confirmed, not when it is typed.
        A public offer link looks like <code>herewegrow.pro/pro?promo=EID30</code>.
      </p>

      {notice && (
        <div role={notice.ok ? 'status' : 'alert'} className={`mt-6 rounded-lg px-4 py-3 text-sm ${notice.ok ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-800'}`}>
          <ul className="list-disc pl-5">{notice.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
      )}
      {made.length > 0 && <textarea readOnly className="mt-3 h-40 w-full rounded-xl border border-line bg-white p-3 font-mono text-sm" value={made.join('\n')} aria-label="New codes" onFocus={(e) => e.currentTarget.select()} />}

      <h2 className="mt-8 text-xl font-semibold">New code</h2>
      <form onSubmit={(e) => void createOne(e)} className="mt-3 grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">Code (letters, numbers, hyphen)
          <input name="code" required maxLength={24} className="field mt-1 uppercase" placeholder="EID30" />
        </label>
        {Fields}
        <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={busy}>Create code</button></div>
      </form>

      <h2 className="mt-8 text-xl font-semibold">Many single-use codes</h2>
      <p className="mt-1 text-sm text-muted">For a workshop or giveaway: one code per person, each works once. Example result: WS-K7M2QX.</p>
      <form onSubmit={(e) => void createMany(e)} className="mt-3 grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <label className="text-sm">Prefix
          <input name="prefix" required maxLength={12} className="field mt-1 uppercase" placeholder="WS" />
        </label>
        <label className="text-sm">How many (up to 500)
          <input name="count" type="number" min={1} max={500} required className="field mt-1" defaultValue={20} />
        </label>
        {Fields}
        <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={busy}>Make codes</button></div>
      </form>

      <h2 className="mt-10 text-xl font-semibold">All codes</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-muted">No codes yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((p) => (
            <li key={p.code} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-mono font-semibold">{p.code} <span className={`ml-2 rounded px-2 py-0.5 font-body text-xs ${p.active ? 'bg-green-50 text-green-900' : 'bg-mist text-muted'}`}>{p.active ? 'on' : 'off'}</span></div>
                <div className="text-sm text-muted">
                  {describe(p)} · {p.scope} · used {p.used}{p.maxUses ? ` of ${p.maxUses}` : ''}
                  {p.discountTotal > 0 && ` · ৳${p.discountTotal} given`}
                  {p.expiresAt ? ` · ends ${new Date(p.expiresAt).toLocaleDateString('en-GB')}` : ''}
                  {p.note ? ` · ${p.note}` : ''}
                </div>
              </div>
              <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void toggle(p)}>{p.active ? 'Turn off' : 'Turn on'}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
