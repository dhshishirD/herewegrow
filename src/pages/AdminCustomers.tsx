// Admin "Customers": find an account by phone, email or name, see what it holds, open its CVs, give Pro.
// The server checks is_admin on every call and logs every search and every CV opened or exported (admin_lookups).
// Everything typed by customers is rendered as React text only.

import { useState, type FormEvent } from 'react';
import { PLANS } from '../../shared/plans';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { Link } from '../lib/router';
import { useAuth } from '../lib/auth';
import type { BuilderState } from '../builder/model';

interface Cv { id: string; title: string; design: string | null; updatedAt: number }
interface Customer {
  id: string; name: string | null; phone: string | null; email: string | null; hasGoogle: boolean; isAdmin: boolean; createdAt: number;
  proUntil: number | null; proActive: boolean;
  orders: { id: string; productName: string; amount: number; status: string; invoiceId: string | null; createdAt: number }[];
  grants: { invoiceId: string; kind: 'paid' | 'free'; productName: string; amount: number; note: string; createdAt: number }[];
  passes: { orderId: string; planId: string; days: number; grantedAt: number }[];
  cvs: Cv[];
  partner: { code: string; name: string; suspended: boolean } | null;
}
interface Lookup { at: number; adminId: string; query: string; userId: string | null; action: string }

const dhakaTime = (ts: number) => new Date(ts).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium' });
const taka = (n: number) => `৳${n.toLocaleString('en-US')}`;
const contactOf = (c: Customer) => c.phone ?? c.email ?? '';
const ACTION_LABEL: Record<string, string> = { search: 'Searched', cv_view: 'Opened CV', cv_pdf: 'PDF of CV', cv_word: 'Word of CV' };

const errorText = (status: number, error?: string) =>
  error === 'db' ? 'The database could not be read or the audit log could not be written. Has migration 0010 been applied in D1?'
    : status === 401 || status === 403 ? 'Session expired or not an admin. Sign in again.'
    : error === 'query' ? 'Type at least 3 characters.'
    : `Failed (${error ?? status}).`;

export function AdminCustomersPage() {
  const { user, ready, openLogin } = useAuth();
  const [q, setQ] = useState('');
  const [searched, setSearched] = useState('');
  const [results, setResults] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<Lookup[] | null>(null);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user || !user.isAdmin) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">{user ? 'Not allowed' : 'Customers'}</h1>
        {user ? <p className="mt-3 text-muted">This page is for the site admin.</p> : <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>Log in</button>}
      </div>
    );
  }

  const search = async (text: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(text)}`);
      const d = (await res.json().catch(() => ({}))) as { customers?: Customer[]; error?: string };
      if (res.ok && d.customers) { setResults(d.customers); setSearched(text); } else { setResults(null); setError(errorText(res.status, d.error)); }
    } catch {
      setError('Could not reach the server.');
    }
    setBusy(false);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void search(q.trim()); };

  const showLog = async () => {
    const res = await fetch('/api/admin/customers/log');
    const d = (await res.json().catch(() => ({}))) as { lookups?: Lookup[] };
    setLog(d.lookups ?? []);
  };

  return (
    <AdminShell active="/admin/customers" title="Customers" subtitle="Find a customer by mobile, email or name. Every search and every CV you open or download is recorded.">
      <Card>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input className="field min-w-0 flex-1" autoFocus autoComplete="off" spellCheck={false} placeholder="01XXXXXXXXX, name@gmail.com or a name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
          <button type="submit" className="btn btn-primary" disabled={busy || q.trim().length < 3}>{busy ? 'Searching…' : 'Search'}</button>
        </form>
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      </Card>

      {results && results.length === 0 && <Card className="mt-5"><p className="text-sm text-muted">No account matches “{searched}”. Try the other contact the customer might have used (mobile, Google email, or name).</p></Card>}
      <div className="mt-5 space-y-5">
        {results?.map((c) => <CustomerCard key={c.id} c={c} query={searched} onChanged={() => void search(searched)} />)}
      </div>

      <Card className="mt-5" title="Recent lookups" aside={<button type="button" className="btn btn-quiet" onClick={() => void showLog()}>{log ? 'Refresh' : 'Show'}</button>}>
        {!log && <p className="text-sm text-muted">Who looked at which customer, and when.</p>}
        {log && log.length === 0 && <p className="text-sm text-muted">Nothing yet.</p>}
        {log && log.length > 0 && (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-muted"><th className="px-2 py-2 font-medium">When</th><th className="px-2 py-2 font-medium">What</th><th className="px-2 py-2 font-medium">Search</th><th className="px-2 py-2 font-medium">Account</th></tr></thead>
              <tbody>{log.map((l, i) => (
                <tr key={`${l.at}-${i}`} className="border-t border-line"><td className="whitespace-nowrap px-2 py-2 text-muted">{dhakaTime(l.at)}</td><td className="px-2 py-2">{ACTION_LABEL[l.action] ?? l.action}</td><td className="px-2 py-2">{l.query || '—'}</td><td className="px-2 py-2 font-mono text-xs text-muted">{l.userId ? l.userId.slice(0, 8) : '—'}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

function CustomerCard({ c, query, onChanged }: { c: Customer; query: string; onChanged: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busyCv, setBusyCv] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; html: string } | null>(null);
  const [planId, setPlanId] = useState(PLANS[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [granting, setGranting] = useState(false);

  /** Fetches one CV (the server logs why: view, pdf or word). */
  const fetchCv = async (cv: Cv, why: 'view' | 'pdf' | 'word'): Promise<BuilderState | null> => {
    const res = await fetch(`/api/admin/customers/${c.id}/cvs/${cv.id}?for=${why}&q=${encodeURIComponent(query)}`);
    const d = (await res.json().catch(() => ({}))) as { cv?: { state: BuilderState }; error?: string };
    if (!res.ok || !d.cv?.state?.data) { setMsg(errorText(res.status, d.error)); return null; }
    return d.cv.state;
  };
  const fileName = (s: BuilderState) => `${(s.data.name || 'CV').replace(/\s+/g, '_')}_CV`;

  const run = async (cv: Cv, why: 'view' | 'pdf' | 'word' | 'ats') => {
    setMsg(null);
    setBusyCv(`${cv.id}:${why}`);
    try {
      const state = await fetchCv(cv, why === 'ats' ? 'word' : why);
      if (!state) return;
      if (why === 'word' || why === 'ats') {
        const { buildDocx } = await import('../builder/word');
        const blob = await buildDocx(why === 'ats' ? { ...state, design: 'classic' } : state, { watermark: false });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${fileName(state)}${why === 'ats' ? '_ATS' : ''}.docx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        return;
      }
      const { renderCvHtml } = await import('../builder/renderCvHtml');
      const html = await renderCvHtml(state, false); // support copies never carry the free-plan footer
      if (why === 'view') return setPreview({ title: cv.title, html });
      const { printCvIsolated } = await import('../builder/printIsolated');
      if (!(await printCvIsolated(html, fileName(state)))) setMsg('The browser blocked the print window. Open the preview and use Print there.');
    } catch (e) {
      console.error(e);
      setMsg('Could not make that file.');
    } finally {
      setBusyCv(null);
    }
  };

  const grantPro = async () => {
    setGranting(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'free', contact: contactOf(c), productId: planId, note, requestId }),
      });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; proUntil?: number | null; errors?: string[]; error?: string };
      if (d.ok) { setMsg(`Done. Pro runs until ${d.proUntil ? dateOnly(d.proUntil) : '…'}.`); setReviewing(false); setNote(''); setRequestId(crypto.randomUUID()); onChanged(); }
      else if (res.status === 409) { setMsg('This exact request was already done. Nothing was added.'); setReviewing(false); }
      else setMsg(d.errors?.join(' ') ?? errorText(res.status, d.error));
    } catch {
      setMsg('Could not reach the server. Check the account before trying again.');
    }
    setGranting(false);
  };

  const plan = PLANS.find((p) => p.id === planId);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{c.name || 'No name'}</h2>
          <p className="mt-0.5 break-all text-sm text-muted">{[c.phone, c.email].filter(Boolean).join(' · ') || 'No phone or email'}</p>
          <p className="mt-1 text-xs text-muted">Joined {dateOnly(c.createdAt)} · {[c.phone && 'SMS login', c.hasGoogle && 'Google login'].filter(Boolean).join(' + ') || 'no login method'}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.proActive ? <Badge tone="green">Pro until {dateOnly(c.proUntil!)}</Badge> : <Badge>{c.proUntil ? `Pro ended ${dateOnly(c.proUntil)}` : 'Free'}</Badge>}
          {c.partner && <Badge tone={c.partner.suspended ? 'red' : 'blue'}>Partner {c.partner.code}{c.partner.suspended ? ' (suspended)' : ''}</Badge>}
          {c.isAdmin && <Badge tone="amber">Admin</Badge>}
        </div>
      </div>

      {msg && <p role="status" className="mt-3 rounded-xl bg-mist px-4 py-2 text-sm">{msg}</p>}

      <h3 className="mt-5 text-sm font-semibold">Saved CVs ({c.cvs.length})</h3>
      {c.cvs.length === 0 && <p className="mt-1 text-sm text-muted">No saved CV. (A CV that was only ever on their own device cannot be seen here.)</p>}
      <ul className="mt-2 divide-y divide-line">
        {c.cvs.map((cv) => (
          <li key={cv.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-medium">{cv.title}</p>
              <p className="text-xs text-muted">{cv.design ?? 'classic'} · updated {dhakaTime(cv.updatedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['view', 'pdf', 'word', 'ats'] as const).map((w) => (
                <button key={w} type="button" className="btn btn-quiet" disabled={!!busyCv} onClick={() => void run(cv, w)}>
                  {busyCv === `${cv.id}:${w}` ? '…' : w === 'view' ? 'Preview' : w === 'pdf' ? 'Clean PDF' : w === 'word' ? 'Word' : 'Word (ATS)'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-semibold">Payments and access</h3>
      {c.orders.length + c.grants.length + c.passes.length === 0 && <p className="mt-1 text-sm text-muted">No orders or grants.</p>}
      <ul className="mt-1 space-y-1 text-sm">
        {c.orders.map((o) => <li key={o.id}>{dhakaTime(o.createdAt)} · {o.productName} · {taka(o.amount)} · {o.status}{o.invoiceId && <span className="ml-1 font-mono text-xs text-muted">{o.invoiceId}</span>}</li>)}
        {c.grants.map((g) => <li key={g.invoiceId}>{dhakaTime(g.createdAt)} · <Badge tone={g.kind === 'paid' ? 'green' : 'blue'}>{g.kind === 'paid' ? 'Manual paid' : 'Free grant'}</Badge> {g.productName} · “{g.note}”</li>)}
        {c.passes.map((p) => <li key={p.orderId} className="text-muted">{dhakaTime(p.grantedAt)} · +{p.days} days Pro ({p.planId})</li>)}
      </ul>

      <h3 className="mt-5 text-sm font-semibold">Give Pro</h3>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-sm font-medium">Plan
          <select className="field mt-1" value={planId} onChange={(e) => { setPlanId(e.target.value); setReviewing(false); }}>
            {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name.en}</option>)}
          </select>
        </label>
        <label className="min-w-[12rem] flex-1 text-sm font-medium">Note (why)
          <input className="field mt-1" maxLength={200} placeholder="Support fix, scholarship…" value={note} onChange={(e) => { setNote(e.target.value); setReviewing(false); }} />
        </label>
        {!reviewing && <button type="button" className="btn btn-primary" disabled={note.trim().length < 3} onClick={() => { setRequestId(crypto.randomUUID()); setReviewing(true); }}>Review</button>}
      </div>
      {reviewing && (
        <div className="mt-3 rounded-xl border border-leaf/30 bg-leaf-soft p-4 text-sm">
          <p>Give <b>{plan?.name.en}</b> free to <b>{contactOf(c)}</b>. Recorded as ৳0, not revenue.</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="btn btn-primary" disabled={granting} onClick={() => void grantPro()}>{granting ? 'Saving…' : 'Confirm'}</button>
            <button type="button" className="btn btn-quiet" disabled={granting} onClick={() => setReviewing(false)}>Back</button>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">Approving a bKash/Nagad payment instead? <Link href={`/admin/manual?contact=${encodeURIComponent(contactOf(c))}`} className="underline">Open Manual access</Link> with this customer filled in.</p>

      {preview && (
        <div role="dialog" aria-label={`Preview of ${preview.title}`} className="fixed inset-0 z-50 overflow-auto bg-black/60 p-4">
          <div className="mx-auto max-w-[230mm]">
            <button type="button" className="btn mb-3 bg-white" onClick={() => setPreview(null)}>Close preview</button>
            {/* Markup comes from our own renderer, which escapes everything the customer typed. */}
            <div className="bg-white shadow-xl" dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
        </div>
      )}
    </Card>
  );
}
