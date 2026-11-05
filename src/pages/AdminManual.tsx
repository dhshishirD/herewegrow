// Manual access (admins only): approve a payment you verified yourself, or grant free access.
// The server checks is_admin on every call and records every action; this page only hides itself from everyone else.
// Names, notes and references are typed by admins but still rendered as React text only.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { PRODUCTS } from '../../shared/catalog';
import { PLANS, findPlan } from '../../shared/plans';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';

type Mode = 'paid' | 'free';

interface Grant {
  id: string;
  createdAt: number;
  kind: Mode;
  phone: string;
  productId: string;
  productName: string;
  amount: number;
  reference: string | null;
  invoiceId: string;
  note: string;
}

interface Draft { mode: Mode; phone: string; productId: string; amount: string; reference: string; note: string }

const EMPTY: Draft = { mode: 'paid', phone: '', productId: PRODUCTS.find((p) => p.kind === 'template')?.id ?? '', amount: '', reference: '', note: '' };

const ORIGIN = 'https://herewegrow.pro';
const dhakaTime = (ts: number) => new Date(ts).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium' });
const listPrice = (productId: string) => findPlan(productId)?.price ?? PRODUCTS.find((p) => p.id === productId)?.price ?? 0;
const nameOf = (productId: string) => findPlan(productId)?.name.en ?? PRODUCTS.find((p) => p.id === productId)?.name.en ?? productId;
const taka = (n: number) => `৳${n.toLocaleString('en-US')}`;

/** What to send the customer on WhatsApp once access is given. */
function customerMessage(g: Grant, proUntil: number | null): string {
  if (findPlan(g.productId)) {
    return `Assalamu alaikum! Your HereWeGrow Pro is active${proUntil ? ` until ${dateOnly(proUntil)}` : ''}. Log in at ${ORIGIN} with ${g.phone} (we send a code by SMS) and the Pro features are ready. Thank you!`;
  }
  const product = PRODUCTS.find((p) => p.id === g.productId);
  if (product?.files?.length) {
    return `Assalamu alaikum! Your payment is confirmed. Download your files here: ${ORIGIN}/order?invoice_id=${g.invoiceId} (invoice ${g.invoiceId}). Thank you!`;
  }
  return `Assalamu alaikum! Your payment for ${nameOf(g.productId)} is confirmed (invoice ${g.invoiceId}). Please send the details we need on WhatsApp and we will start right away. Thank you!`;
}

const label = 'text-sm font-medium text-ink';

export function AdminManualPage() {
  const { user, ready, openLogin } = useAuth();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<{ grant: Grant; proUntil: number | null; belowPrice: boolean; accountCreated: boolean } | null>(null);
  // One id per review, sent with the request: pressing Confirm twice cannot make two grants.
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [history, setHistory] = useState<Grant[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/manual');
      const d = (await res.json().catch(() => ({}))) as { grants?: Grant[]; error?: string };
      if (res.ok && d.grants) {
        setHistory(d.grants);
        setHistoryError(null);
      } else {
        setHistoryError(d.error === 'db' ? 'The database could not be read. Apply migration 0006 in D1.' : `Could not load the history (${res.status}).`);
      }
    } catch {
      setHistoryError('Could not reach the server.');
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user || !user.isAdmin) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">{user ? 'Not allowed' : 'Manual access'}</h1>
        {user ? <p className="mt-3 text-muted">This page is for the site admin.</p> : <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>Log in</button>}
      </div>
    );
  }

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setConfirming(false);
    setDone(null);
    setErrors([]);
  };
  const amountValue = draft.amount === '' ? listPrice(draft.productId) : Number(draft.amount);

  const review = (e: FormEvent) => {
    e.preventDefault();
    setRequestId(crypto.randomUUID());
    setConfirming(true);
    setDone(null);
    setErrors([]);
  };

  const submit = async () => {
    setBusy(true);
    setErrors([]);
    try {
      const res = await fetch('/api/admin/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: draft.mode,
          phone: draft.phone,
          productId: draft.productId,
          amount: draft.mode === 'paid' ? amountValue : undefined,
          reference: draft.mode === 'paid' ? draft.reference : undefined,
          note: draft.note,
          requestId,
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; grant?: Grant; proUntil?: number | null; belowPrice?: boolean; accountCreated?: boolean; errors?: string[]; error?: string };
      if (d.ok && d.grant) {
        setDone({ grant: d.grant, proUntil: d.proUntil ?? null, belowPrice: !!d.belowPrice, accountCreated: !!d.accountCreated });
        setConfirming(false);
        setDraft({ ...EMPTY, mode: draft.mode, productId: draft.productId });
        await load();
      } else if (res.status === 409 && d.grant) {
        setConfirming(false);
        setErrors([`This was already approved on ${dhakaTime(d.grant.createdAt)} for ${d.grant.phone} (${d.grant.productName}). Invoice ${d.grant.invoiceId}. Nothing was added.`]);
      } else if (res.status === 401 || res.status === 403) {
        setErrors(['Session expired or not an admin. Sign in again.']);
      } else {
        setConfirming(false);
        setErrors(d.errors ?? [d.error === 'db' ? 'Database error. Has migration 0006 been applied?' : `Failed (${d.error ?? res.status}).`]);
      }
    } catch {
      setErrors(['Could not reach the server. Nothing was saved; check the history before trying again.']);
    }
    setBusy(false);
  };

  const options = (
    <>
      <optgroup label="Pro passes">
        {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name.en} · {taka(p.price)}</option>)}
      </optgroup>
      <optgroup label="CV services">
        {PRODUCTS.filter((p) => p.kind === 'service').map((p) => <option key={p.id} value={p.id}>{p.name.en} · {taka(p.price)}</option>)}
      </optgroup>
      <optgroup label="Template packs">
        {PRODUCTS.filter((p) => p.kind === 'pack').map((p) => <option key={p.id} value={p.id}>{p.name.en} · {taka(p.price)}</option>)}
      </optgroup>
      <optgroup label="Single templates">
        {PRODUCTS.filter((p) => p.kind === 'template').map((p) => <option key={p.id} value={p.id}>{p.name.en} · {taka(p.price)}</option>)}
      </optgroup>
    </>
  );

  return (
    <AdminShell active="/admin/manual" title="Manual access" subtitle="Approve a payment you checked yourself, or give someone free access. Every action is recorded below.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Card>
          <div role="group" aria-label="Type of access" className="grid grid-cols-2 gap-1 rounded-xl bg-mist p-1">
            {(['paid', 'free'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={draft.mode === m} onClick={() => set({ mode: m })} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${draft.mode === m ? 'bg-white text-leaf shadow-sm' : 'text-muted hover:text-ink'}`}>
                {m === 'paid' ? 'Approve a payment' : 'Grant free access'}
              </button>
            ))}
          </div>

          <form onSubmit={review} className="mt-4 space-y-3">
            <label className={`${label} block`}>Customer's mobile number
              <input className="field mt-1" inputMode="numeric" autoComplete="off" placeholder="01XXXXXXXXX" required value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
            </label>
            <label className={`${label} block`}>Product
              <select className="field mt-1" value={draft.productId} onChange={(e) => set({ productId: e.target.value, amount: '' })}>{options}</select>
            </label>
            {draft.mode === 'paid' && (
              <>
                <label className={`${label} block`}>Amount you received (৳)
                  <input className="field mt-1" type="number" min={1} step={1} required placeholder={String(listPrice(draft.productId))} value={draft.amount} onChange={(e) => set({ amount: e.target.value })} />
                </label>
                <label className={`${label} block`}>Payment transaction id
                  <input className="field mt-1 font-mono uppercase" autoComplete="off" spellCheck={false} required maxLength={40} placeholder="From the bKash / Nagad / Rocket SMS" value={draft.reference} onChange={(e) => set({ reference: e.target.value })} />
                </label>
              </>
            )}
            <label className={`${label} block`}>Note {draft.mode === 'free' ? '(why)' : '(for your records)'}
              <input className="field mt-1" required minLength={3} maxLength={200} placeholder={draft.mode === 'free' ? 'Student scholarship, partner gift…' : 'Gateway stayed pending, SMS seen at 3:40 pm'} value={draft.note} onChange={(e) => set({ note: e.target.value })} />
            </label>
            {!confirming && <button type="submit" className="btn btn-primary w-full">Review</button>}
          </form>

          {errors.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {errors.map((x) => <p key={x}>{x}</p>)}
            </div>
          )}

          {confirming && (
            <div className="mt-4 rounded-xl border border-leaf/30 bg-leaf-soft p-4 text-sm">
              <p className="font-semibold text-ink">Check before you confirm</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-muted">Customer</dt><dd>{draft.phone}</dd>
                <dt className="text-muted">Gets</dt><dd>{nameOf(draft.productId)}</dd>
                {draft.mode === 'paid' ? (
                  <>
                    <dt className="text-muted">Received</dt>
                    <dd>{taka(amountValue)}{amountValue < listPrice(draft.productId) && <span className="ml-2"><Badge tone="amber">below list price {taka(listPrice(draft.productId))}</Badge></span>}</dd>
                    <dt className="text-muted">Transaction</dt><dd className="font-mono">{draft.reference.trim().toUpperCase()}</dd>
                  </>
                ) : (
                  <><dt className="text-muted">Price</dt><dd>Free (recorded as ৳0, not revenue)</dd></>
                )}
              </dl>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn btn-primary flex-1" disabled={busy} onClick={() => void submit()}>{busy ? 'Saving…' : draft.mode === 'paid' ? 'Confirm and approve' : 'Confirm and grant'}</button>
                <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => setConfirming(false)}>Back</button>
              </div>
            </div>
          )}

          {done && (
            <div role="status" className="mt-4 rounded-xl border border-gold/30 bg-gold-soft p-4 text-sm">
              <p className="font-semibold text-gold">Done: {done.grant.productName} for {done.grant.phone}</p>
              {done.belowPrice && <p className="mt-1 text-amber-800">Saved at {taka(done.grant.amount)}, below the list price.</p>}
              {done.proUntil && <p className="mt-1">Pro now runs until {dateOnly(done.proUntil)}.</p>}
              {done.accountCreated && (
                <p className="mt-1 text-amber-800">
                  No account existed for this number, so one was created. The customer must log in with an SMS code to this number; a Google sign-in is a different account and will not show this.
                </p>
              )}
              <p className="mt-2 text-muted">Invoice number</p>
              <p className="select-all break-all font-mono text-ink">{done.grant.invoiceId}</p>
              <a className="btn btn-primary mt-3 w-full" target="_blank" rel="noreferrer" href={`https://wa.me/88${done.grant.phone}?text=${encodeURIComponent(customerMessage(done.grant, done.proUntil))}`}>
                Message the customer on WhatsApp
              </a>
            </div>
          )}
        </Card>

        <Card title="History" aside={history ? <span className="text-xs text-muted">{history.length} most recent</span> : undefined}>
          {historyError && <p role="alert" className="text-sm text-red-800">{historyError}</p>}
          {!history && !historyError && <p className="text-sm text-muted">Loading…</p>}
          {history && history.length === 0 && <p className="text-sm text-muted">Nothing yet. Approvals and free grants will appear here.</p>}
          {history && history.length > 0 && (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-2 py-2 font-medium">When</th><th className="px-2 py-2 font-medium">Customer</th><th className="px-2 py-2 font-medium">Product</th><th className="px-2 py-2 text-right font-medium">Amount</th><th className="px-2 py-2 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((g) => (
                    <tr key={g.id} className="border-t border-line align-top transition hover:bg-mist/60">
                      <td className="whitespace-nowrap px-2 py-2.5 text-muted">{dhakaTime(g.createdAt)}</td>
                      <td className="px-2 py-2.5">
                        <div className="font-medium">{g.phone}</div>
                        <div className="mt-0.5 max-w-[12rem] truncate text-xs text-muted" title={g.note}>{g.note}</div>
                      </td>
                      <td className="px-2 py-2.5">
                        <div>{g.productName}</div>
                        <div className="mt-0.5"><Badge tone={g.kind === 'paid' ? 'green' : 'blue'}>{g.kind === 'paid' ? 'Paid' : 'Free'}</Badge></div>
                      </td>
                      <td className="px-2 py-2.5 text-right font-medium">{g.kind === 'paid' ? taka(g.amount) : '—'}</td>
                      <td className="px-2 py-2.5 font-mono text-xs text-muted"><div>{g.reference ?? '—'}</div><div className="select-all">{g.invoiceId}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
