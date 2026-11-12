// CV Partner Workspace: mobile-first screens for partners with a running pass.
// Home, Clients (+ one client), Library, Marketing kit, Performance, Help. Server rules live in server/partner.ts.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { sampleFor } from '../builder/partnerSamples';
import { LEVELS, PARTNER_WHATSAPP, PROFESSIONS, whatsappLink, type ProfessionId } from '../../shared/partner';
import { useAuth } from '../lib/auth';
import { num, useLang } from '../lib/lang';
import {
  createClient, exportClient, getClient, listClients, partnerErrorText, partnerSettings, patchClient, removeClient, saveClientCv,
  type ClientSummary, type PartnerMe,
} from '../lib/partner';
import { Link, navigate } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';
import kitData from '../content/partner/kit.json';
import library from '../content/partner/library.json';

type B = { en: string; bn: string };
type Props = { me: PartnerMe; path: string; reload: () => Promise<void> };

const kit = kitData as { posts: { id: string; title: B; text: string }[]; replies: { id: string; title: B; text: string }[]; files: { title: B; url: string }[] };
const lib = library as { phrases: Record<string, string[]>; coverLetters: { id: string; title: B; body: string }[]; emails: { id: string; title: B; body: string }[] };

const TABS: { href: string; label: B }[] = [
  { href: '/partner', label: { en: 'Home', bn: 'হোম' } },
  { href: '/partner/clients', label: { en: 'Clients', bn: 'ক্লায়েন্ট' } },
  { href: '/partner/library', label: { en: 'Library', bn: 'লাইব্রেরি' } },
  { href: '/partner/kit', label: { en: 'Kit', bn: 'কিট' } },
  { href: '/partner/performance', label: { en: 'Progress', bn: 'অগ্রগতি' } },
  { href: '/partner/help', label: { en: 'Help', bn: 'সাহায্য' } },
];

const STATUS: Record<string, { label: B; cls: string }> = {
  new: { label: { en: 'New', bn: 'নতুন' }, cls: 'bg-leaf-soft text-leaf-dark' },
  progress: { label: { en: 'In progress', bn: 'চলছে' }, cls: 'bg-gold-soft text-gold' },
  delivered: { label: { en: 'Delivered', bn: 'ডেলিভারড' }, cls: 'bg-emerald-100 text-emerald-800' },
};

/** Copy text to the clipboard; falls back to a hidden textarea on older phones. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyButton({ text, label }: { text: string; label?: B }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-quiet bg-white !min-h-9 shrink-0 !px-3 text-sm"
      onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1500); } }}>
      {done ? t({ en: 'Copied ✓', bn: 'কপি হয়েছে ✓' }) : t(label ?? { en: 'Copy', bn: 'কপি' })}
    </button>
  );
}

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl bg-white p-4 ring-1 ring-line md:p-5 ${className}`}>{children}</div>
);

function Bar({ value, max, warn }: { value: number; max: number; warn?: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={`h-full rounded-full ${warn ? 'bg-alert' : 'bg-leaf'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PartnerWorkspace({ me, path, reload }: Props) {
  const { t } = useLang();
  useEffect(() => setPageMeta(t({ en: 'Partner Workspace', bn: 'পার্টনার ওয়ার্কস্পেস' }), '', '/partner'), [t]);

  const clientId = /^\/partner\/clients\/([\w-]+)$/.exec(path)?.[1];
  let body: React.ReactNode;
  if (clientId) body = <ClientPage id={clientId} />;
  else if (path === '/partner/clients') body = <ClientsPage />;
  else if (path === '/partner/library') body = <LibraryPage />;
  else if (path === '/partner/kit') body = <KitPage me={me} />;
  else if (path === '/partner/performance') body = <PerformancePage me={me} />;
  else if (path === '/partner/help') body = <HelpPage me={me} reload={reload} />;
  else body = <HomePage me={me} />;

  const active = TABS.slice().reverse().find((x) => path === x.href || path.startsWith(`${x.href}/`))?.href ?? '/partner';
  return (
    <div className="min-h-[70vh] bg-mist/60 pb-10">
      <div className="sticky top-[4.25rem] z-20 border-b border-line bg-paper/95 backdrop-blur max-md:top-[7.6rem]">
        <nav aria-label={t({ en: 'Partner menu', bn: 'পার্টনার মেনু' })} className="wrap flex gap-1 overflow-x-auto py-2">
          {TABS.map((x) => (
            <Link key={x.href} href={x.href} aria-current={x.href === active ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${x.href === active ? 'bg-leaf text-white' : 'bg-white text-leaf-dark ring-1 ring-line'}`}>
              {t(x.label)}
            </Link>
          ))}
        </nav>
      </div>
      <div className="wrap max-w-3xl py-5">{body}</div>
    </div>
  );
}

/* ── Home ─────────────────────────────────────────────────────── */

function HomePage({ me }: { me: PartnerMe }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [sheet, setSheet] = useState(false);
  const used = me.used ?? 0;
  const cap = me.cap ?? 0;
  const near = cap > 0 && used / cap >= 0.8;
  const left = me.daysLeft ?? 0;
  const delivered = me.month?.delivered ?? 0;
  const next = me.month?.next ?? null;
  const level = LEVELS.find((l) => l.id === me.month?.level);
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${t({ en: 'Send your details for your CV here: ', bn: 'আপনার CV-র তথ্য এখানে দিন: ' })}${me.intakeUrl ?? ''}`)}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t({ en: 'Hello', bn: 'স্বাগতম' })}, {me.name || user?.name || ''}</h1>
        <p className="text-muted">{me.plan ? t(me.plan.name) : ''}{me.plan?.badge ? ' · ★' : ''}</p>
      </div>

      {left <= 7 && (
        <Panel className="!bg-gold-soft">
          <p className="font-semibold">{t({ en: `Your pass ends in ${left} day${left === 1 ? '' : 's'}.`, bn: `আপনার পাস ${num(left, lang)} দিনে শেষ হবে।` })}</p>
          <Link href="/partner/plans" className="btn btn-primary mt-3 !min-h-10">{t({ en: 'Add more time', bn: 'মেয়াদ বাড়ান' })}</Link>
        </Panel>
      )}

      <button type="button" onClick={() => { track('partner_new_client_click'); setSheet(true); }} className="btn btn-primary w-full !min-h-14 text-lg">
        + {t({ en: 'New client CV', bn: 'নতুন ক্লায়েন্টের CV' })}
      </button>
      {sheet && <NewClientSheet onClose={() => setSheet(false)} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <p className="label">{t({ en: 'Pass', bn: 'পাস' })}</p>
          <p className="font-display text-3xl font-bold">{num(left, lang)} <span className="text-base font-normal text-muted">{t({ en: 'days left', bn: 'দিন বাকি' })}</span></p>
        </Panel>
        <Panel>
          <p className="label">{t({ en: 'Client places used', bn: 'ক্লায়েন্ট জায়গা ব্যবহার' })}</p>
          <p className="font-display text-3xl font-bold">{num(used, lang)} <span className="text-base font-normal text-muted">/ {num(cap, lang)}</span></p>
          <div className="mt-2"><Bar value={used} max={cap} warn={near} /></div>
          {near && <p className="mt-2 text-sm font-semibold text-alert">{used >= cap ? t({ en: 'All places used.', bn: 'সব জায়গা শেষ।' }) : t({ en: 'You have used 80% of your places.', bn: 'আপনার ৮০% জায়গা ব্যবহার হয়ে গেছে।' })}{' '}<Link href="/partner/plans" className="underline">{t({ en: 'See passes', bn: 'পাস দেখুন' })}</Link></p>}
        </Panel>
      </div>

      <Panel>
        <p className="label">{t({ en: 'Delivered this month', bn: 'এ মাসে ডেলিভারড' })}</p>
        <p className="font-display text-3xl font-bold">{num(delivered, lang)}{level ? <span className="ml-2 rounded bg-gold-soft px-2 py-0.5 align-middle font-body text-sm font-semibold text-gold">{t(level.name)}</span> : null}</p>
        {next ? (
          <>
            <div className="mt-2"><Bar value={delivered} max={next.at} /></div>
            <p className="mt-2 text-sm text-muted">{t({ en: `${next.at - delivered} more to ${LEVELS.find((l) => l.id === next.id)!.name.en}: +${next.days} free days.`, bn: `${LEVELS.find((l) => l.id === next.id)!.name.bn} হতে আর ${num(next.at - delivered, lang)}টি: +${num(next.days, lang)} দিন ফ্রি।` })}</p>
          </>
        ) : <p className="mt-2 text-sm text-muted">{t({ en: 'Top level reached this month. Well done!', bn: 'এ মাসে সর্বোচ্চ লেভেলে পৌঁছেছেন। চমৎকার!' })}</p>}
      </Panel>

      <Panel>
        <p className="font-semibold">{t({ en: 'Your client link', bn: 'আপনার ক্লায়েন্ট লিংক' })}</p>
        <p className="mt-1 text-sm text-muted">{t({ en: 'Send this to a client. They fill a simple form and appear in your Clients list with details ready.', bn: 'ক্লায়েন্টকে এটি পাঠান। সে সহজ ফর্ম পূরণ করবে, আর তথ্যসহ আপনার ক্লায়েন্ট তালিকায় চলে আসবে।' })}</p>
        <p className="mt-3 break-all rounded-lg bg-mist px-3 py-2 text-sm">{me.intakeUrl}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={me.intakeUrl ?? ''} label={{ en: 'Copy link', bn: 'লিংক কপি' }} />
          <a className="btn btn-quiet bg-white !min-h-9 !px-3 text-sm" href={waShare} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </Panel>
    </div>
  );
}

function NewClientSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [prof, setProf] = useState<ProfessionId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const go = async () => {
    setError('');
    if (name.trim().length < 2) return setError(t({ en: 'Write the client’s name.', bn: 'ক্লায়েন্টের নাম লিখুন।' }));
    setBusy(true);
    const c = await createClient({ name: name.trim(), phone: phone.trim() || undefined, profession: prof });
    if (!c.ok) {
      setBusy(false);
      return setError(partnerErrorText(c.error, t));
    }
    // Starter content goes into the folder first, so the Builder opens straight onto a good CV.
    await saveClientCv(c.value, sampleFor(prof, name.trim()));
    track('partner_client_created', { profession: prof ?? 'blank' });
    navigate(`/builder?client=${c.value}`);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={t({ en: 'New client CV', bn: 'নতুন ক্লায়েন্টের CV' })}>
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-2xl bg-white p-5 md:max-w-lg md:rounded-2xl">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{t({ en: 'New client CV', bn: 'নতুন ক্লায়েন্টের CV' })}</h2>
          <button type="button" onClick={onClose} className="btn btn-quiet !min-h-9 !px-3" aria-label={t({ en: 'Close', bn: 'বন্ধ' })}>✕</button></div>
        <div className="mt-4 space-y-4">
          <label className="block"><span className="label">{t({ en: 'Client name', bn: 'ক্লায়েন্টের নাম' })}</span>
            <input className="field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoFocus /></label>
          <label className="block"><span className="label">{t({ en: 'Client phone (optional)', bn: 'ক্লায়েন্টের ফোন (ঐচ্ছিক)' })}</span>
            <input className="field" value={phone} maxLength={20} inputMode="tel" placeholder="01XXXXXXXXX" onChange={(e) => setPhone(e.target.value)} /></label>
          <div>
            <span className="label">{t({ en: 'Profession (fills a top design and sample text)', bn: 'পেশা (সেরা ডিজাইন ও নমুনা লেখা বসে যাবে)' })}</span>
            <div className="mt-1 flex flex-wrap gap-2" role="radiogroup">
              {PROFESSIONS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={prof === p.id} onClick={() => setProf(prof === p.id ? null : p.id)}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold ${prof === p.id ? 'bg-leaf text-white' : 'bg-mist text-leaf-dark'}`}>{t(p.name)}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{t({ en: 'Sample lines are marked “(sample - replace)”. Replace them with the client’s real facts before delivering.', bn: 'নমুনা লাইনে “(sample - replace)” লেখা থাকবে। ডেলিভারির আগে ক্লায়েন্টের আসল তথ্য বসান।' })}</p>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
          <button type="button" className="btn btn-primary w-full !min-h-12" disabled={busy} onClick={() => void go()}>{busy ? '…' : t({ en: 'Create and open CV', bn: 'তৈরি করে CV খুলুন' })}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Clients ──────────────────────────────────────────────────── */

const ago = (ts: number, lang: string) => new Date(ts).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dhaka' });

function ClientsPage() {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'progress' | 'delivered'>('all');
  const [rows, setRows] = useState<ClientSummary[] | null>(null);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const h = setTimeout(async () => {
      const r = await listClients(q.trim());
      if (r.ok) setRows(r.value);
      else setError(partnerErrorText(r.error, t));
    }, q ? 300 : 0);
    return () => clearTimeout(h);
  }, [q, t]);

  const shown = (rows ?? []).filter((c) => filter === 'all' || c.status === filter);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t({ en: 'Clients', bn: 'ক্লায়েন্ট' })}</h1>
        <button type="button" className="btn btn-primary !min-h-10" onClick={() => setSheet(true)}>+ {t({ en: 'New', bn: 'নতুন' })}</button>
      </div>
      {sheet && <NewClientSheet onClose={() => setSheet(false)} />}
      <input className="field" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ en: 'Search name, phone or note', bn: 'নাম, ফোন বা নোট খুঁজুন' })} />
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'progress', 'delivered'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${filter === f ? 'bg-leaf text-white' : 'bg-white text-leaf-dark ring-1 ring-line'}`}>
            {f === 'all' ? t({ en: 'All', bn: 'সব' }) : t(STATUS[f].label)}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
      {rows === null && !error && <p className="text-muted">…</p>}
      {rows && shown.length === 0 && <Panel><p className="text-muted">{t({ en: 'No clients here yet. Tap “New”, or share your client link from Home.', bn: 'এখানে এখনও কোনো ক্লায়েন্ট নেই। “নতুন” চাপুন, অথবা হোম থেকে আপনার ক্লায়েন্ট লিংক পাঠান।' })}</p></Panel>}
      <ul className="space-y-3">
        {shown.map((c) => {
          const wa = whatsappLink(c.phone);
          return (
            <li key={c.id}>
              <Panel className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/partner/clients/${c.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.name || t({ en: '(no name)', bn: '(নাম নেই)' })}</p>
                    <p className="text-sm text-muted">{[c.profession ? t(PROFESSIONS.find((p) => p.id === c.profession)!.name) : '', c.phone ?? '', ago(c.updatedAt, lang)].filter(Boolean).join(' · ')}</p>
                  </Link>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${STATUS[c.status].cls}`}>{t(STATUS[c.status].label)}</span>
                </div>
                {c.source === 'intake' && c.status === 'new' && <p className="mt-1 text-xs font-semibold text-leaf">{t({ en: 'Filled by the client through your link', bn: 'আপনার লিংকে ক্লায়েন্ট নিজে পূরণ করেছে' })}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/builder?client=${c.id}`} className="btn btn-primary !min-h-9 !px-4 text-sm">{t({ en: 'Open CV', bn: 'CV খুলুন' })}</Link>
                  {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-quiet bg-white !min-h-9 !px-4 text-sm">WhatsApp</a>}
                </div>
              </Panel>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClientPage({ id }: { id: string }) {
  const { t } = useLang();
  const [c, setC] = useState<ClientSummary | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', note: '', profession: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void getClient(id).then((r) => {
      if (!r.ok) return setMissing(true);
      setC(r.value);
      setForm({ name: r.value.name, phone: r.value.phone ?? '', note: r.value.note ?? '', profession: r.value.profession ?? '' });
    });
  }, [id]);

  if (missing) return <Panel><p>{t({ en: 'Client not found.', bn: 'ক্লায়েন্ট পাওয়া যায়নি।' })}</p><Link href="/partner/clients" className="btn btn-quiet mt-3">{t({ en: 'Back', bn: 'ফিরে যান' })}</Link></Panel>;
  if (!c) return <p className="text-muted">…</p>;

  const save = async () => {
    const r = await patchClient(id, { name: form.name, phone: form.phone, note: form.note, profession: (form.profession || null) as ProfessionId | null });
    setMsg(r.ok ? { ok: true, text: t({ en: 'Saved.', bn: 'সেভ হয়েছে।' }) } : { ok: false, text: partnerErrorText(r.ok ? '' : r.error === 'not_found' ? 'phone' : r.error, t) });
  };
  const exportData = async () => {
    const r = await exportClient(id);
    if (!r.ok) return setMsg({ ok: false, text: partnerErrorText(r.error, t) });
    const blob = new Blob([JSON.stringify(r.value, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `client-${id.slice(0, 8)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const del = async () => {
    if (!window.confirm(t({ en: 'Delete this client and their CV for good? The place in your count is not given back.', bn: 'এই ক্লায়েন্ট ও তার CV চিরতরে মুছবেন? আপনার গণনার জায়গা ফেরত আসবে না।' }))) return;
    const r = await removeClient(id);
    if (r.ok) navigate('/partner/clients');
    else setMsg({ ok: false, text: partnerErrorText(r.error, t) });
  };
  const wa = whatsappLink(form.phone, t({ en: `Hello ${form.name}, your CV is ready.`, bn: `আসসালামু আলাইকুম ${form.name}, আপনার CV তৈরি।` }));

  return (
    <div className="space-y-4">
      <Link href="/partner/clients" className="text-sm font-semibold text-leaf underline">← {t({ en: 'Clients', bn: 'ক্লায়েন্ট' })}</Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="truncate text-2xl font-bold">{c.name || t({ en: '(no name)', bn: '(নাম নেই)' })}</h1>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${STATUS[c.status].cls}`}>{t(STATUS[c.status].label)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/builder?client=${id}`} className="btn btn-primary !min-h-11">{t({ en: 'Open CV', bn: 'CV খুলুন' })}</Link>
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-quiet bg-white !min-h-11">WhatsApp</a>}
      </div>
      <Panel className="space-y-4">
        <label className="block"><span className="label">{t({ en: 'Name', bn: 'নাম' })}</span><input className="field" value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block"><span className="label">{t({ en: 'Phone (optional)', bn: 'ফোন (ঐচ্ছিক)' })}</span><input className="field" inputMode="tel" value={form.phone} maxLength={20} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="block"><span className="label">{t({ en: 'Profession', bn: 'পেশা' })}</span>
          <select className="field" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}>
            <option value="">—</option>{PROFESSIONS.map((p) => <option key={p.id} value={p.id}>{t(p.name)}</option>)}
          </select></label>
        <label className="block"><span className="label">{t({ en: 'Your note (private)', bn: 'আপনার নোট (গোপন)' })}</span><textarea className="field min-h-24" value={form.note} maxLength={1000} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'text-leaf-dark' : 'text-red-800'}>{msg.text}</p>}
        <button type="button" className="btn btn-primary" onClick={() => void save()}>{t({ en: 'Save', bn: 'সেভ' })}</button>
      </Panel>
      <Panel>
        <p className="font-semibold">{t({ en: 'Privacy', bn: 'গোপনীয়তা' })}</p>
        <p className="mt-1 text-sm text-muted">{t({ en: 'Only you can see this client. You can download their data or delete it any time.', bn: 'এই ক্লায়েন্টকে শুধু আপনি দেখতে পারেন। যেকোনো সময় তথ্য ডাউনলোড বা মুছতে পারবেন।' })}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet bg-white !min-h-10" onClick={() => void exportData()}>{t({ en: 'Download data', bn: 'তথ্য ডাউনলোড' })}</button>
          <button type="button" className="btn btn-quiet !min-h-10 !border-alert !text-alert" onClick={() => void del()}>{t({ en: 'Delete client', bn: 'ক্লায়েন্ট মুছুন' })}</button>
        </div>
      </Panel>
    </div>
  );
}

/* ── Library ──────────────────────────────────────────────────── */

function LibraryPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<'phrases' | 'letters' | 'emails'>('phrases');
  const [prof, setProf] = useState<ProfessionId>('fresher');
  const phrases = lib.phrases[prof] ?? [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t({ en: 'Library', bn: 'লাইব্রেরি' })}</h1>
      <div className="flex gap-2">
        {([['phrases', { en: 'Phrase bank', bn: 'ফ্রেজ ব্যাংক' }], ['letters', { en: 'Cover letters', bn: 'কভার লেটার' }], ['emails', { en: 'Emails', bn: 'ইমেইল' }]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === k ? 'bg-leaf text-white' : 'bg-white text-leaf-dark ring-1 ring-line'}`}>{t(l)}</button>
        ))}
      </div>
      {tab === 'phrases' && (
        <>
          <p className="text-sm text-muted">{t({ en: 'Strong English bullet lines. Replace the [brackets] with the client’s real numbers. Never invent facts.', bn: 'ইংরেজি বুলেট লাইন। [ব্র্যাকেটের] জায়গায় ক্লায়েন্টের আসল সংখ্যা বসান। কখনো মিথ্যা তথ্য লিখবেন না।' })}</p>
          <select className="field" value={prof} onChange={(e) => setProf(e.target.value as ProfessionId)} aria-label={t({ en: 'Profession', bn: 'পেশা' })}>
            {PROFESSIONS.map((p) => <option key={p.id} value={p.id}>{t(p.name)}</option>)}
          </select>
          <ul className="space-y-2">{phrases.map((p) => <li key={p}><Panel className="flex items-start justify-between gap-3 !p-3"><span className="text-sm">{p}</span><CopyButton text={p} /></Panel></li>)}</ul>
          <button type="button" className="btn btn-quiet bg-white" onClick={() => void copyText(phrases.join('\n'))}>{t({ en: 'Copy all', bn: 'সব কপি' })}</button>
        </>
      )}
      {tab === 'letters' && lib.coverLetters.map((x) => <TextBlock key={x.id} title={t(x.title)} text={x.body} />)}
      {tab === 'emails' && lib.emails.map((x) => <TextBlock key={x.id} title={t(x.title)} text={x.body} />)}
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3"><p className="font-semibold">{title}</p><CopyButton text={text} /></div>
      <pre className="mt-3 whitespace-pre-wrap break-words font-body text-sm text-muted">{text}</pre>
    </Panel>
  );
}

/* ── Marketing kit ────────────────────────────────────────────── */

function KitPage({ me }: { me: PartnerMe }) {
  const { t } = useLang();
  // The partner's own client link is filled into the texts that ask for it.
  const fill = useCallback((s: string) => s.replace('[আপনার লিংক]', me.intakeUrl ?? ''), [me.intakeUrl]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t({ en: 'Marketing kit', bn: 'মার্কেটিং কিট' })}</h1>
      <p className="text-sm text-muted">{t({ en: 'Copy a text, put your number and price in the [brackets], and post it in your groups. Never promise a job.', bn: 'লেখা কপি করুন, [ব্র্যাকেটে] আপনার নম্বর ও দাম বসান, তারপর গ্রুপে পোস্ট করুন। চাকরির প্রতিশ্রুতি কখনো দেবেন না।' })}</p>
      <h2 className="text-lg font-bold">{t({ en: 'Posters and banners', bn: 'পোস্টার ও ব্যানার' })}</h2>
      {kit.files.length === 0
        ? <Panel><p className="text-sm text-muted">{t({ en: 'Posters and banners are being added. Ask us on WhatsApp for the latest files.', bn: 'পোস্টার ও ব্যানার যোগ করা হচ্ছে। সর্বশেষ ফাইল পেতে হোয়াটসঅ্যাপে জানান।' })}</p></Panel>
        : <ul className="space-y-2">{kit.files.map((f) => <li key={f.url}><Panel className="flex items-center justify-between gap-3 !p-3"><span>{t(f.title)}</span><a className="btn btn-quiet bg-white !min-h-9 !px-3 text-sm" href={f.url} download target="_blank" rel="noreferrer">{t({ en: 'Download', bn: 'ডাউনলোড' })}</a></Panel></li>)}</ul>}
      <h2 className="text-lg font-bold">{t({ en: 'Post texts', bn: 'পোস্টের লেখা' })}</h2>
      {kit.posts.map((x) => <TextBlock key={x.id} title={t(x.title)} text={fill(x.text)} />)}
      <h2 className="text-lg font-bold">{t({ en: 'Reply scripts', bn: 'রিপ্লাই স্ক্রিপ্ট' })}</h2>
      {kit.replies.map((x) => <TextBlock key={x.id} title={t(x.title)} text={fill(x.text)} />)}
    </div>
  );
}

/* ── Performance ──────────────────────────────────────────────── */

function PerformancePage({ me }: { me: PartnerMe }) {
  const { t, lang } = useLang();
  const delivered = me.month?.delivered ?? 0;
  const top = LEVELS[LEVELS.length - 1].at;
  const earned = useMemo(() => (me.bonuses ?? []).filter((b) => !b.revoked), [me.bonuses]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t({ en: 'Progress', bn: 'অগ্রগতি' })}</h1>
      <Panel>
        <p className="label">{t({ en: 'Delivered CVs this month', bn: 'এ মাসে ডেলিভারড CV' })}</p>
        <p className="font-display text-4xl font-bold">{num(delivered, lang)}</p>
        <div className="mt-3"><Bar value={delivered} max={top} /></div>
        <ul className="mt-4 space-y-2">
          {LEVELS.map((l) => (
            <li key={l.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${delivered >= l.at ? 'bg-emerald-50' : 'bg-mist'}`}>
              <span className="font-semibold">{delivered >= l.at ? '✓ ' : ''}{t(l.name)} · {num(l.at, lang)}</span>
              <span className="text-sm text-muted">+{num(l.days, lang)} {t({ en: 'days', bn: 'দিন' })}{l.capExtra ? ` · +${num(l.capExtra, lang)} ${t({ en: 'places', bn: 'জায়গা' })}` : ''}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t({ en: 'A CV counts when you export the final PDF, the client has a name, the CV has at least 3 filled sections and no sample text is left. One count per client per month. Each bonus is given once a month.', bn: 'ফাইনাল PDF এক্সপোর্ট, ক্লায়েন্টের নাম, সিভিতে অন্তত ৩টি পূরণ করা অংশ এবং নমুনা লেখা না থাকলে CV গোনা হয়। প্রতি ক্লায়েন্ট মাসে একবার। প্রতিটি বোনাস মাসে একবার।' })}</p>
      </Panel>
      <Panel>
        <p className="font-semibold">{t({ en: 'Bonuses earned', bn: 'পাওয়া বোনাস' })}</p>
        {earned.length === 0 ? <p className="mt-1 text-sm text-muted">{t({ en: 'None yet. Your first bonus comes at 10 delivered CVs in a month.', bn: 'এখনও নেই। এক মাসে ১০টি CV ডেলিভারি করলে প্রথম বোনাস।' })}</p>
          : <ul className="mt-2 space-y-1 text-sm">{earned.map((b) => <li key={b.id}>{b.month} · {t(LEVELS.find((l) => l.id === b.level)!.name)} · +{b.days} {t({ en: 'days', bn: 'দিন' })}{b.capExtra ? ` · +${b.capExtra}` : ''}</li>)}</ul>}
      </Panel>
    </div>
  );
}

/* ── Help ─────────────────────────────────────────────────────── */

function HelpPage({ me, reload }: { me: PartnerMe; reload: () => Promise<void> }) {
  const { t } = useLang();
  const [msg, setMsg] = useState('');
  const toggle = async (v: boolean) => {
    const r = await partnerSettings(v);
    setMsg(r.ok ? '' : partnerErrorText(r.error, t));
    if (r.ok) await reload();
  };
  const wa = `https://wa.me/${PARTNER_WHATSAPP}?text=${encodeURIComponent('Hello HereWeGrow, I need help with my CV Partner workspace.')}`;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t({ en: 'Help', bn: 'সাহায্য' })}</h1>
      <Panel>
        <p className="font-semibold">{t({ en: 'Need help? We are on WhatsApp', bn: 'সাহায্য লাগলে হোয়াটসঅ্যাপে আছি' })}</p>
        <a className="btn btn-primary mt-3" href={wa} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'partner_help' })}>+880 1981-505761</a>
      </Panel>
      <Panel>
        <p className="font-semibold">{t({ en: 'First CV in 5 steps', bn: '৫ ধাপে প্রথম CV' })}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>{t({ en: 'Tap “New client CV”, write the name, pick the profession.', bn: '“নতুন ক্লায়েন্টের CV” চাপুন, নাম লিখুন, পেশা বেছে নিন।' })}</li>
          <li>{t({ en: 'Replace every line marked “(sample - replace)” with the client’s real facts.', bn: '“(sample - replace)” লেখা প্রতিটি লাইন ক্লায়েন্টের আসল তথ্য দিয়ে বদলান।' })}</li>
          <li>{t({ en: 'Use the Library for strong English lines.', bn: 'ভালো ইংরেজি লাইনের জন্য লাইব্রেরি দেখুন।' })}</li>
          <li>{t({ en: 'Pick a design in the Design step.', bn: 'ডিজাইন ধাপে পছন্দের ডিজাইন বেছে নিন।' })}</li>
          <li>{t({ en: 'Download PDF (and ATS PDF if the job portal needs it). Send on WhatsApp.', bn: 'PDF ডাউনলোড করুন (জব পোর্টালে লাগলে ATS PDF)। হোয়াটসঅ্যাপে পাঠান।' })}</li>
        </ol>
      </Panel>
      <Panel>
        <p className="font-semibold">{t({ en: '“Made with HWG” line', bn: '“Made with HWG” লাইন' })}</p>
        {me.plan?.brandingRemovable ? (
          <label className="mt-2 flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5" checked={!!me.removeBranding} onChange={(e) => void toggle(e.target.checked)} />
            <span>{t({ en: 'Remove the line from my PDF and Word files', bn: 'আমার PDF ও Word ফাইল থেকে লাইনটি সরান' })}</span>
          </label>
        ) : <p className="mt-1 text-sm text-muted">{t({ en: 'Your Starter pass adds a tiny line at the end of the CV. The 90-day and Year passes can remove it. The ATS PDF never has it.', bn: 'স্টার্টার পাসে সিভির শেষে ছোট একটি লাইন থাকে। ৯০ দিন ও ১ বছরের পাসে সরানো যায়। ATS PDF-এ কখনো থাকে না।' })}</p>}
        {msg && <p role="alert" className="mt-2 text-red-800">{msg}</p>}
      </Panel>
      <Panel>
        <p className="font-semibold">{t({ en: 'Rules in short', bn: 'নিয়ম সংক্ষেপে' })}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>{t({ en: 'No false experience, fake certificates or job/visa selling.', bn: 'ভুয়া অভিজ্ঞতা, ভুয়া সার্টিফিকেট বা চাকরি/ভিসা বিক্রি নয়।' })}</li>
          <li>{t({ en: 'Do not add NID or passport numbers.', bn: 'NID বা পাসপোর্ট নম্বর দেবেন না।' })}</li>
          <li>{t({ en: 'One account, up to 2 devices.', bn: 'একটি অ্যাকাউন্ট, সর্বোচ্চ ২টি ডিভাইস।' })}</li>
          <li><Link href="/privacy" className="underline">{t({ en: 'Privacy policy', bn: 'গোপনীয়তা নীতি' })}</Link></li>
        </ul>
      </Panel>
    </div>
  );
}
