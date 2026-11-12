// CV Partner: the public landing + apply + pay page, and the entry to the Partner Workspace.
// Logged-in partners with a running pass see the workspace at /partner and /partner/*; everyone else sees the landing.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import terms from '../../content/partner-terms.md?raw';
import { PARTNER_PLANS } from '../../shared/plans';
import { discountedPrice } from '../../shared/promo';
import { PARTNER_WHATSAPP } from '../../shared/partner';
import { PageHead } from '../components/PageHead';
import { useAuth } from '../lib/auth';
import { num, taka, useLang } from '../lib/lang';
import { partnerApply, partnerErrorText, partnerMe, type PartnerMe } from '../lib/partner';
import { checkPromo, PROMO_ERRORS, savedPromo, type PromoCheck } from '../lib/promo';
import { setPageMeta } from '../lib/seo';
import { track, tracker } from '../lib/track';

const Workspace = lazy(() => import('./PartnerWorkspace'));

type B = { en: string; bn: string };

const INCLUDED: B[] = [
  { en: 'Partner Builder: all premium CV designs, no watermark, PDF, Word and an ATS version', bn: 'পার্টনার বিল্ডার: সব প্রিমিয়াম সিভি ডিজাইন, ওয়াটারমার্ক ছাড়া, PDF, Word ও ATS ভার্সন' },
  { en: 'Client folders: every client’s CV saved, searchable, one-tap WhatsApp', bn: 'ক্লায়েন্ট ফোল্ডার: প্রতিজনের সিভি সেভ, সার্চ, এক ট্যাপে হোয়াটসঅ্যাপ' },
  { en: 'Profession starters: Fresher, Nurse, Teacher, Banker, Gulf, Driver, IT and more, already filled with good sample text', bn: 'পেশা অনুযায়ী শুরু: ফ্রেশার, নার্স, শিক্ষক, ব্যাংকার, গালফ, ড্রাইভার, আইটি ও আরও, ভালো নমুনা লেখাসহ' },
  { en: 'Your own client link: the client fills a simple form and their details arrive ready in your folder', bn: 'আপনার নিজের লিংক: ক্লায়েন্ট সহজ ফর্ম পূরণ করলে তথ্য আপনার ফোল্ডারে তৈরি হয়ে আসে' },
  { en: 'Library: English phrase bank by profession, cover letter and email-application texts', bn: 'লাইব্রেরি: পেশাভিত্তিক ইংরেজি ফ্রেজ ব্যাংক, কভার লেটার ও ইমেইল আবেদনের লেখা' },
  { en: 'Marketing kit: ready Bangla post texts and reply scripts to get clients', bn: 'মার্কেটিং কিট: ক্লায়েন্ট পাওয়ার জন্য তৈরি বাংলা পোস্ট ও রিপ্লাই স্ক্রিপ্ট' },
  { en: 'Performance bonus: deliver more CVs, earn free extra days', bn: 'পারফরম্যান্স বোনাস: বেশি সিভি ডেলিভারি করলে বিনামূল্যে বাড়তি দিন' },
];

const STEPS: { t: B; d: B }[] = [
  { t: { en: 'Pick a pass and sign up', bn: 'পাস বেছে নিন ও সাইন আপ করুন' }, d: { en: 'Log in with your phone, accept the short terms, pay once by bKash or Nagad.', bn: 'ফোন দিয়ে লগইন, সংক্ষিপ্ত শর্তে সম্মতি, বিকাশ বা নগদে একবার পেমেন্ট।' } },
  { t: { en: 'Make a client CV in minutes', bn: 'কয়েক মিনিটে ক্লায়েন্টের সিভি বানান' }, d: { en: 'Choose the profession, replace the sample text with the client’s facts, download.', bn: 'পেশা বেছে নিন, নমুনা লেখার জায়গায় ক্লায়েন্টের তথ্য বসান, ডাউনলোড করুন।' } },
  { t: { en: 'Charge your own price', bn: 'নিজের দামে বিক্রি করুন' }, d: { en: 'What you charge your clients is your decision. We do not promise any income.', bn: 'ক্লায়েন্টের কাছ থেকে কত নেবেন সেটা আপনার সিদ্ধান্ত। আমরা আয়ের কোনো প্রতিশ্রুতি দিই না।' } },
];

const PLAN_TEXT: Record<string, { tag?: B; note: B; lines: B[] }> = {
  'partner-30': {
    tag: { en: 'Start here', bn: 'এখান থেকে শুরু' },
    note: { en: 'Try it with real clients', bn: 'আসল ক্লায়েন্ট দিয়ে চালিয়ে দেখুন' },
    lines: [{ en: 'Up to 30 client CVs', bn: 'সর্বোচ্চ ৩০টি ক্লায়েন্ট সিভি' }, { en: 'Small “Made with HWG” line at the end of the CV', bn: 'সিভির শেষে ছোট “Made with HWG” লাইন থাকে' }],
  },
  'partner-90': {
    note: { en: 'For steady work', bn: 'নিয়মিত কাজের জন্য' },
    lines: [{ en: 'Up to 100 client CVs', bn: 'সর্বোচ্চ ১০০টি ক্লায়েন্ট সিভি' }, { en: 'You can remove the HWG line', bn: 'HWG লাইন বন্ধ করতে পারবেন' }],
  },
  'partner-365': {
    tag: { en: 'Best value', bn: 'সবচেয়ে সাশ্রয়ী' },
    note: { en: 'For a serious CV business', bn: 'গুরুত্ব দিয়ে CV ব্যবসার জন্য' },
    lines: [{ en: 'Up to 500 client CVs every 3 months', bn: 'প্রতি ৩ মাসে সর্বোচ্চ ৫০০টি ক্লায়েন্ট সিভি' }, { en: 'Remove the HWG line + Partner badge', bn: 'HWG লাইন বন্ধ + পার্টনার ব্যাজ' }],
  },
};

const FAQ: { q: B; a: B }[] = [
  { q: { en: 'Will money be taken again automatically?', bn: 'টাকা কি আবার নিজে থেকে কেটে নেবে?' }, a: { en: 'No. You pay once. Nothing renews by itself. We remind you before the pass ends.', bn: 'না। একবার পেমেন্ট। নিজে থেকে কিছু নবায়ন হয় না। মেয়াদ শেষের আগে মনে করিয়ে দেব।' } },
  { q: { en: 'Do I get a free client place back if I delete a client?', bn: 'ক্লায়েন্ট মুছলে কি জায়গা ফিরে পাব?' }, a: { en: 'No. Places are counted when a folder is created. You can delete a client’s details any time for their privacy.', bn: 'না। ফোল্ডার তৈরির সময় জায়গা গোনা হয়। ক্লায়েন্টের গোপনীয়তার জন্য যেকোনো সময় তথ্য মুছতে পারবেন।' } },
  { q: { en: 'What if I buy again before the pass ends?', bn: 'মেয়াদ শেষের আগে আবার কিনলে?' }, a: { en: 'The new days are added after your current end date. No day is lost.', bn: 'নতুন দিনগুলো বর্তমান মেয়াদের পরে যোগ হবে। কোনো দিন নষ্ট হবে না।' } },
  { q: { en: 'Is my clients’ information safe?', bn: 'ক্লায়েন্টের তথ্য কি নিরাপদ?' }, a: { en: 'Each partner sees only their own clients. We never ask for NID or passport numbers. You can delete a client or export their data any time.', bn: 'প্রতিজন পার্টনার শুধু নিজের ক্লায়েন্ট দেখেন। NID বা পাসপোর্ট নম্বর চাই না। যেকোনো সময় ক্লায়েন্ট মুছতে বা তথ্য এক্সপোর্ট করতে পারবেন।' } },
];

const cleanTerms = terms.replace(/<!--[\s\S]*?-->/g, '').replace(/\*\*/g, '').replace(/^## /gm, '').trim();

export function PartnerRoute({ path }: { path: string }) {
  const { user, ready } = useAuth();
  const [me, setMe] = useState<PartnerMe | null | undefined>(undefined);
  const userId = user?.id;
  const load = useCallback(async () => {
    if (!userId) return setMe(null);
    const r = await partnerMe();
    setMe(r.ok ? r.value : null);
  }, [userId]);
  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  if (!ready || me === undefined) return <div className="wrap py-24 text-muted">…</div>;
  if (user && me?.applied && me.active && path !== '/partner/plans') {
    return (
      <Suspense fallback={<div className="wrap py-24 text-muted">…</div>}>
        <Workspace me={me} path={path} reload={load} />
      </Suspense>
    );
  }
  return <Landing me={me} reload={load} />;
}

function Landing({ me, reload }: { me: PartnerMe | null; reload: () => Promise<void> }) {
  const { t, lang } = useLang();
  const { user, openLogin, loginOpen } = useAuth();
  const [plan, setPlan] = useState('partner-30');
  const [name, setName] = useState('');
  const [fb, setFb] = useState('');
  const [where, setWhere] = useState('');
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState(savedPromo);
  const [promo, setPromo] = useState<PromoCheck | null>(null);
  const [promoMsg, setPromoMsg] = useState<B | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [started, setStarted] = useState(false);

  const title = t({ en: 'HWG CV Partner: a CV business on your phone', bn: 'HWG সিভি পার্টনার: ফোন থাকলেই CV-র ব্যবসা' });
  const intro = t({
    en: 'Make professional CVs for your clients from your phone. Pay once, no auto-renewal. We do not promise income; you set your own prices.',
    bn: 'ফোন দিয়েই ক্লায়েন্টদের জন্য প্রফেশনাল সিভি বানান। একবার পেমেন্ট, নিজে থেকে নবায়ন নেই। আয়ের প্রতিশ্রুতি দিই না; দাম আপনিই ঠিক করবেন।',
  });
  useEffect(() => setPageMeta(title, intro, '/partner'), [title, intro]);
  useEffect(() => track('partner_landing_view'), []);
  useEffect(() => {
    if (!name && me?.name) setName(me.name);
    else if (!name && user?.name) setName(user.name);
  }, [me?.name, user?.name, name]);

  const touch = () => {
    if (!started) {
      setStarted(true);
      track('partner_apply_start');
    }
  };

  const setup = !!user && !!me?.hasPass && !me.applied;
  const discount = promo?.ok && promo.kind === 'discount' ? promo : null;
  const priceOf = (list: number) => (discount ? discountedPrice(list, discount) : list);
  const chosen = PARTNER_PLANS.find((p) => p.id === plan)!;

  const applyCode = async () => {
    if (!code.trim()) return;
    const r = await checkPromo(code, plan);
    if (r.ok && r.kind === 'discount') {
      setPromo(r);
      setPromoMsg(null);
    } else {
      setPromo(null);
      setPromoMsg(r.ok ? { en: 'This code is not for Partner passes.', bn: 'এই কোড পার্টনার পাসের জন্য নয়।' } : PROMO_ERRORS[r.error] ?? PROMO_ERRORS.generic);
    }
  };

  const go = async () => {
    setError('');
    if (!user) {
      setPending(true);
      openLogin();
      return;
    }
    if (name.trim().length < 2) return setError(t({ en: 'Please write your name.', bn: 'আপনার নাম লিখুন।' }));
    if (!agree) return setError(t({ en: 'Please tick the Partner Terms to continue.', bn: 'এগিয়ে যেতে পার্টনার শর্তে টিক দিন।' }));
    setBusy(true);
    const a = await partnerApply({ name: name.trim(), fbLink: fb.trim(), sellsWhere: where.trim(), terms: true });
    if (!a.ok) {
      setBusy(false);
      return setError(a.error === 'link' ? t({ en: 'The Facebook link does not look right.', bn: 'ফেসবুক লিংকটি ঠিক মনে হচ্ছে না।' }) : partnerErrorText(a.error, t));
    }
    if (setup) {
      setBusy(false);
      await reload();
      return;
    }
    track('partner_checkout_start', { plan });
    track('checkout_click', { product: plan });
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: plan, lang, promo: discount?.code, vid: tracker.vid() }) });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; paymentUrl?: string; error?: string };
      if (d.ok && d.paymentUrl) {
        window.location.href = d.paymentUrl;
        return;
      }
      if (d.error === 'promo') {
        setPromo(null);
        setPromoMsg({ en: 'This code cannot be used now.', bn: 'এই কোডটি এখন ব্যবহার করা যাবে না।' });
      } else setError(t({ en: 'The payment page did not open. Please try again in a minute.', bn: 'পেমেন্ট পেজ খোলেনি। এক মিনিট পরে আবার চেষ্টা করুন।' }));
    } catch {
      setError(t({ en: 'No connection. Please try again.', bn: 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।' }));
    }
    setBusy(false);
    void reload();
  };

  // After logging in from the button, carry on. If the login box is closed without logging in, forget it.
  useEffect(() => {
    if (!pending || loginOpen) return;
    setPending(false);
    if (user) void go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loginOpen, pending]);

  const ended = me?.applied && !me.active;
  const waLink = `https://wa.me/${PARTNER_WHATSAPP}?text=${encodeURIComponent('Hello HereWeGrow, I have a question about the CV Partner pass.')}`;

  return (
    <>
      <PageHead crumbs={[{ href: '/partner', label: { en: 'CV Partner', bn: 'সিভি পার্টনার' } }]} title={title} intro={intro} />
      <section className="wrap max-w-5xl py-10">
        {setup && (
          <p role="status" className="mb-8 rounded-xl bg-leaf-soft px-5 py-4 font-semibold text-leaf-dark">
            {t({ en: 'Your Partner pass is active. Add your name and accept the terms below to open your workspace.', bn: 'আপনার পার্টনার পাস চালু আছে। ওয়ার্কস্পেস খুলতে নিচে নাম লিখে শর্তে টিক দিন।' })}
          </p>
        )}
        {ended && (
          <p role="status" className="mb-8 rounded-xl bg-leaf-soft px-5 py-4 font-semibold text-leaf-dark">
            {me?.suspended
              ? t({ en: 'This account is paused. Please contact us on WhatsApp.', bn: 'এই অ্যাকাউন্ট সাময়িক বন্ধ। হোয়াটসঅ্যাপে যোগাযোগ করুন।' })
              : t({ en: 'Your Partner pass has ended. Your clients are safe. Pick a pass below to open the workspace again.', bn: 'আপনার পার্টনার পাসের মেয়াদ শেষ। ক্লায়েন্টদের তথ্য নিরাপদ আছে। ওয়ার্কস্পেস আবার খুলতে নিচ থেকে পাস নিন।' })}
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t({ en: 'What you get', bn: 'কী পাচ্ছেন' })}</h2>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map((x) => (
                <li key={x.en} className="flex gap-3">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{t(x)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t({ en: 'How it works', bn: 'কীভাবে কাজ করে' })}</h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.t.en} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf text-white font-semibold">{num(i + 1, lang)}</span>
                  <div><p className="font-semibold">{t(s.t)}</p><p className="text-muted">{t(s.d)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {!setup && <>
        <h2 id="plans" className="mt-14 text-2xl font-bold">{t({ en: 'Choose your pass', bn: 'আপনার পাস বেছে নিন' })}</h2>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <div>
            <label className="label" htmlFor="partner-promo">{t({ en: 'Promo code', bn: 'প্রোমো কোড' })}</label>
            <div className="flex gap-2">
              <input id="partner-promo" className="field max-w-[12rem] uppercase" value={code} maxLength={24} autoComplete="off" onChange={(e) => { setCode(e.target.value); setPromo(null); setPromoMsg(null); }} onKeyDown={(e) => e.key === 'Enter' && void applyCode()} />
              <button type="button" className="btn btn-quiet bg-white" disabled={!code.trim()} onClick={() => void applyCode()}>{t({ en: 'Apply', bn: 'প্রয়োগ' })}</button>
            </div>
          </div>
          {discount && <p role="status" className="text-sm text-leaf-dark">{t({ en: `Code ${discount.code} applied. Prices below include it.`, bn: `কোড ${discount.code} প্রয়োগ হয়েছে। নিচের দামে ধরা আছে।` })}</p>}
          {promoMsg && <p role="alert" className="text-sm text-red-800">{t(promoMsg)}</p>}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label={t({ en: 'Partner pass', bn: 'পার্টনার পাস' })}>
          {PARTNER_PLANS.map((p) => {
            const x = PLAN_TEXT[p.id];
            const on = plan === p.id;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPlan(p.id)}
                className={`relative flex flex-col rounded-2xl bg-white p-5 text-left transition ${on ? 'ring-2 ring-leaf shadow-lg' : 'ring-1 ring-line hover:shadow-md'}`}>
                <span className="flex min-h-7 items-center justify-between gap-2">
                  <span className="text-lg font-bold">{t(p.name)}</span>
                  {x.tag && <span className="rounded bg-gold-soft px-2 py-0.5 text-sm font-semibold text-gold">{t(x.tag)}</span>}
                </span>
                <span className="mt-3 font-display text-3xl font-bold">
                  {discount && <span className="mr-2 text-lg font-normal text-muted line-through">{taka(p.price, lang)}</span>}
                  {taka(priceOf(p.price), lang)}
                  <span className="ml-1.5 font-body text-base font-normal text-muted">/ {t({ en: `${p.days} days`, bn: `${num(p.days, 'bn')} দিন` })}</span>
                </span>
                <span className="mt-1 text-sm text-muted">{t(x.note)}</span>
                <ul className="mt-3 space-y-1 text-sm">{x.lines.map((l) => <li key={l.en}>• {t(l)}</li>)}</ul>
              </button>
            );
          })}
        </div>

        </>}

        <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line md:p-6">
          <h2 className="text-xl font-bold">{t({ en: 'Your details', bn: 'আপনার তথ্য' })}</h2>
          <p className="mt-1 text-sm text-muted">{t({ en: 'You log in with your mobile number. Only your name is required.', bn: 'মোবাইল নম্বর দিয়ে লগইন করবেন। শুধু নাম আবশ্যক।' })}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="label">{t({ en: 'Your name', bn: 'আপনার নাম' })}</span>
              <input className="field" value={name} maxLength={80} onFocus={touch} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
            <label className="block"><span className="label">{t({ en: 'Facebook page or profile link (optional)', bn: 'ফেসবুক পেজ বা প্রোফাইল লিংক (ঐচ্ছিক)' })}</span>
              <input className="field" value={fb} maxLength={200} onFocus={touch} onChange={(e) => setFb(e.target.value)} inputMode="url" /></label>
            <label className="block md:col-span-2"><span className="label">{t({ en: 'Where do you sell CVs? (optional)', bn: 'কোথায় সিভি বিক্রি করেন? (ঐচ্ছিক)' })}</span>
              <input className="field" value={where} maxLength={200} onFocus={touch} onChange={(e) => setWhere(e.target.value)} placeholder={t({ en: 'Facebook group, WhatsApp, shop…', bn: 'ফেসবুক গ্রুপ, হোয়াটসঅ্যাপ, দোকান…' })} /></label>
          </div>
          <label className="mt-4 flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={agree} onChange={(e) => { setAgree(e.target.checked); touch(); }} />
            <span>{t({ en: 'I have read and accept the Partner Terms.', bn: 'আমি পার্টনার শর্ত পড়েছি এবং মেনে নিচ্ছি।' })}{' '}
              <button type="button" className="font-semibold text-leaf underline" onClick={() => setShowTerms((v) => !v)}>{showTerms ? t({ en: 'Hide', bn: 'লুকান' }) : t({ en: 'Read', bn: 'পড়ুন' })}</button></span>
          </label>
          {showTerms && <div className="mt-3 max-h-72 overflow-auto whitespace-pre-line rounded-lg bg-mist p-4 text-sm">{cleanTerms}</div>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
          <button type="button" className="btn btn-primary mt-5 w-full !min-h-12 text-[1.05rem] md:w-auto" disabled={busy} onClick={() => void go()}>
            {busy ? '…' : setup
              ? t({ en: 'Open my workspace', bn: 'আমার ওয়ার্কস্পেস খুলুন' })
              : user
              ? t({ en: `Pay ${taka(priceOf(chosen.price), 'en')} and start`, bn: `${taka(priceOf(chosen.price), 'bn')} পেমেন্ট করে শুরু করুন` })
              : t({ en: 'Log in to continue', bn: 'চালিয়ে যেতে লগইন করুন' })}
          </button>
          <p className="mt-2 text-sm text-muted">{t({ en: 'Pay by bKash, Nagad or Rocket. One payment, no auto-renewal.', bn: 'বিকাশ, নগদ বা রকেটে পেমেন্ট। একবারের পেমেন্ট, অটো-নবায়ন নেই।' })}</p>
        </div>

        <h2 className="mt-14 text-2xl font-bold">{t({ en: 'Questions', bn: 'প্রশ্ন-উত্তর' })}</h2>
        <div className="mt-4 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
          {FAQ.map((f) => (
            <details key={f.q.en} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold">{t(f.q)}</summary>
              <p className="mt-2 text-muted">{t(f.a)}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          {t({ en: 'More questions? ', bn: 'আরও প্রশ্ন? ' })}
          <a className="font-semibold text-leaf underline" href={waLink} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'partner' })}>{t({ en: 'Ask on WhatsApp', bn: 'হোয়াটসঅ্যাপে জিজ্ঞাসা করুন' })}</a>
        </p>
      </section>
    </>
  );
}
