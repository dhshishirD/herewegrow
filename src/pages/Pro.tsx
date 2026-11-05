import { useEffect, useState } from 'react';
import { DESIGN_LIST, PRO_DESIGN_COUNT } from '../../shared/designList';
import { PLANS, PRO_LIMITS, type PlanId } from '../../shared/plans';
import { discountedPrice } from '../../shared/promo';
import { PageHead } from '../components/PageHead';
import { useAuth } from '../lib/auth';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { checkPromo, PROMO_ERRORS, redeemTrial, savedPromo, type PromoCheck } from '../lib/promo';
import { setPageMeta } from '../lib/seo';
import { track, tracker } from '../lib/track';

type B = { en: string; bn: string };

const EVERY_PLAN: B[] = [
  { en: 'Download PDF and Word without the HereWeGrow mark', bn: 'HereWeGrow চিহ্ন ছাড়া PDF ও Word ডাউনলোড' },
  { en: `All ${PRO_DESIGN_COUNT} premium CV designs: ${DESIGN_LIST.filter((d) => d.pro).map((d) => d.name.en).join(', ')}`, bn: `সব ${num(PRO_DESIGN_COUNT, 'bn')}টি প্রিমিয়াম সিভি ডিজাইন: ${DESIGN_LIST.filter((d) => d.pro).map((d) => d.name.bn).join(', ')}` },
  { en: `Save up to ${PRO_LIMITS.savedCvs} CVs online, open them on any device`, bn: `অনলাইনে ${num(PRO_LIMITS.savedCvs, 'bn')}টি পর্যন্ত সিভি সেভ, যেকোনো ডিভাইসে খুলুন` },
  { en: 'New Pro tools, e-books and guides as they come, at no extra cost', bn: 'নতুন প্রো টুল, ই-বুক ও গাইড আসলেই পাবেন, বাড়তি খরচ ছাড়া' },
];

const PLAN_TEXT: Record<PlanId, { tag?: B; perDay: B; templates: B }> = {
  'pro-7': {
    perDay: { en: 'For one job application', bn: 'একটি চাকরির আবেদনের জন্য' },
    templates: { en: 'Word templates at 50% off', bn: 'Word টেমপ্লেট ৫০% ছাড়ে' },
  },
  'pro-30': {
    tag: { en: 'Most chosen', bn: 'সবচেয়ে বেশি নেওয়া হয়' },
    perDay: { en: 'About 5 Tk a day', bn: 'দিনে প্রায় ৫ টাকা' },
    templates: { en: 'Word templates at 50% off, plus 1 free each month', bn: 'Word টেমপ্লেট ৫০% ছাড়ে, সাথে প্রতি মাসে ১টি ফ্রি' },
  },
  'pro-365': {
    tag: { en: 'Best value', bn: 'সবচেয়ে সাশ্রয়ী' },
    perDay: { en: 'Less than 1.5 Tk a day', bn: 'দিনে দেড় টাকারও কম' },
    templates: { en: 'Every Word template included', bn: 'সব Word টেমপ্লেট ফ্রি' },
  },
};

const FAQ: { q: B; a: B }[] = [
  {
    q: { en: 'Will money be taken again automatically?', bn: 'টাকা কি আবার নিজে থেকে কেটে নেবে?' },
    a: { en: 'No. You pay once by bKash, Nagad or Rocket. Nothing renews by itself; we send an SMS 3 days before your Pro ends.', bn: 'না। বিকাশ, নগদ বা রকেটে একবার পেমেন্ট করবেন। নিজে থেকে কিছু নবায়ন হয় না; প্রো শেষ হওয়ার ৩ দিন আগে এসএমএস পাঠাব।' },
  },
  {
    q: { en: 'I still have Pro. What if I buy again?', bn: 'প্রো চালু থাকা অবস্থায় আবার কিনলে কী হবে?' },
    a: { en: 'The new days are added after your current end date. You never lose days.', bn: 'নতুন দিনগুলো আপনার বর্তমান মেয়াদের পরে যোগ হবে। কোনো দিন নষ্ট হবে না।' },
  },
  {
    q: { en: 'What happens to my CVs when Pro ends?', bn: 'প্রো শেষ হলে আমার সিভির কী হবে?' },
    a: { en: 'They stay saved. You can still open and edit them; clean downloads come back when you renew.', bn: 'সেভ থাকবে। খুলতে ও এডিট করতে পারবেন; নবায়ন করলে আবার মার্কছাড়া ডাউনলোড পাবেন।' },
  },
];

const ERRORS: Record<string, B> = {
  gateway: { en: 'The payment page did not open. Please try again in a minute.', bn: 'পেমেন্ট পেজ খোলেনি। এক মিনিট পরে আবার চেষ্টা করুন।' },
  generic: { en: 'Something went wrong. Please try again.', bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।' },
};

function Tick() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-leaf">
      <path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProPage() {
  const { t, lang } = useLang();
  const { user, ready, openLogin, loginOpen, refresh } = useAuth();
  const [code, setCode] = useState(savedPromo);
  const [promo, setPromo] = useState<PromoCheck | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: B } | null>(null);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState('');

  useEffect(() => track('view_pro'), []);

  const title = t({ en: 'HereWeGrow Pro', bn: 'HereWeGrow প্রো' });
  const intro = t({
    en: 'Everything you need for a job-winning CV, in one pass. Pay once by bKash or Nagad. No auto-renewal.',
    bn: 'চাকরি পাওয়ার মতো সিভির জন্য যা লাগে, সব এক পাসে। বিকাশ বা নগদে একবার পেমেন্ট। নিজে থেকে নবায়ন হয় না।',
  });
  useEffect(() => setPageMeta(title, intro, '/pro'), [title, intro]);

  const applyCode = async () => {
    if (!code.trim()) return;
    setPromoBusy(true);
    setPromoMsg(null);
    const r = await checkPromo(code, 'pro-30');
    setPromoBusy(false);
    if (r.ok) {
      setPromo(r);
      setPromoMsg(null);
    } else {
      setPromo(null);
      setPromoMsg({ ok: false, text: PROMO_ERRORS[r.error] ?? PROMO_ERRORS.generic });
    }
  };

  const takeTrial = async () => {
    track('pro_click', { plan: 'trial' });
    if (!promo?.ok || promo.kind !== 'trial') return;
    if (!user) {
      openLogin();
      return;
    }
    setPromoBusy(true);
    const r = await redeemTrial(promo.code);
    setPromoBusy(false);
    if (r.ok) {
      await refresh();
      setPromo(null);
      setPromoMsg({ ok: true, text: { en: `Done! ${r.days} days of Pro are now on your account.`, bn: `হয়ে গেছে! আপনার অ্যাকাউন্টে ${num(r.days, 'bn')} দিনের প্রো যুক্ত হয়েছে।` } });
    } else {
      setPromoMsg({ ok: false, text: PROMO_ERRORS[r.error] ?? PROMO_ERRORS.generic });
    }
  };

  const discount = promo?.ok && promo.kind === 'discount' ? promo : null;

  const buy = async (id: PlanId) => {
    track('pro_click', { plan: id });
    setError('');
    if (!user) {
      setPending(id);
      openLogin();
      return;
    }
    setBusy(id);
    track('checkout_click', { product: id });
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, lang, promo: discount?.code, vid: tracker.vid() }) });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; paymentUrl?: string; error?: string };
      if (d.ok && d.paymentUrl) {
        window.location.href = d.paymentUrl;
        return;
      }
      if (d.error === 'login') {
        setPending(id);
        openLogin();
      } else if (d.error === 'promo') {
        setPromo(null);
        setPromoMsg({ ok: false, text: PROMO_ERRORS[(d as { reason?: string }).reason ?? ''] ?? PROMO_ERRORS.generic });
      } else setError(t(ERRORS[d.error ?? ''] ?? ERRORS.generic));
    } catch {
      setError(t(ERRORS.generic));
    }
    setBusy(null);
  };

  // After logging in from a "Get" button, carry on to payment. If the login box is closed without logging in, forget it.
  useEffect(() => {
    if (!pending || loginOpen) return;
    const id = pending;
    setPending(null);
    if (user) void buy(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loginOpen, pending]);

  const until = user?.pro && user.proUntil
    ? new Date(user.proUntil).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      <PageHead crumbs={[{ href: '/pro', label: { en: 'Pro', bn: 'প্রো' } }]} title={title} intro={intro} />
      <section className="wrap py-12">
        {until && (
          <p role="status" className="mb-8 rounded-xl bg-leaf-soft px-5 py-4">
            {t({ en: `Your Pro is active until ${until}. Buying again adds the days after that date.`, bn: `আপনার প্রো ${until} পর্যন্ত চালু। আবার কিনলে দিনগুলো এই তারিখের পরে যোগ হবে।` })}
          </p>
        )}
        {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}

        <div className="mb-8 rounded-xl bg-white p-5 ring-1 ring-line">
          <label className="label" htmlFor="promo-code">{t({ en: 'Promo code', bn: 'প্রোমো কোড' })}</label>
          <div className="mt-1 flex flex-wrap gap-3">
            <input id="promo-code" className="field max-w-xs uppercase" value={code} maxLength={24} autoComplete="off" placeholder={t({ en: 'Enter code', bn: 'কোড দিন' })}
              onChange={(e) => { setCode(e.target.value); setPromo(null); setPromoMsg(null); }}
              onKeyDown={(e) => e.key === 'Enter' && void applyCode()} />
            <button type="button" className="btn btn-quiet bg-white" disabled={promoBusy || !code.trim()} onClick={() => void applyCode()}>
              {promoBusy ? '…' : t({ en: 'Apply', bn: 'প্রয়োগ করুন' })}
            </button>
          </div>
          {promoMsg && <p role={promoMsg.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${promoMsg.ok ? 'text-leaf-dark' : 'text-red-800'}`}>{t(promoMsg.text)}</p>}
          {discount && (
            <p role="status" className="mt-3 text-sm text-leaf-dark">
              {t({ en: `Code ${discount.code} applied. Your price is shown on each pass below.`, bn: `কোড ${discount.code} প্রয়োগ হয়েছে। নিচে প্রতিটি পাসে আপনার মূল্য দেখানো আছে।` })}
            </p>
          )}
          {promo?.ok && promo.kind === 'trial' && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p role="status" className="text-sm text-leaf-dark">
                {t({ en: `This code gives you ${promo.days} days of Pro free. One free trial per account.`, bn: `এই কোডে ${num(promo.days, 'bn')} দিনের প্রো ফ্রি। প্রতি অ্যাকাউন্টে একবার।` })}
              </p>
              <button type="button" className="btn btn-primary" disabled={promoBusy} onClick={() => void takeTrial()}>
                {user ? t({ en: `Get ${promo.days} days free`, bn: `${num(promo.days, 'bn')} দিন ফ্রি নিন` }) : t({ en: 'Log in to get it', bn: 'পেতে লগইন করুন' })}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => {
            const x = PLAN_TEXT[p.id];
            const featured = p.id === 'pro-30';
            return (
              <article key={p.id} className={`relative flex flex-col rounded-2xl bg-white p-6 transition-shadow hover:shadow-md ${featured ? 'ring-2 ring-leaf shadow-lg md:-translate-y-2' : 'ring-1 ring-line'}`}>
                <div className="flex min-h-7 items-center justify-between gap-2">
                  <h2 className="text-xl font-bold">{t(p.name)}</h2>
                  {x.tag && <span className="rounded bg-gold-soft px-2 py-0.5 text-sm font-semibold text-gold">{t(x.tag)}</span>}
                </div>
                <p className="mt-4 font-display text-4xl font-bold">{discount && <span className="mr-2 text-xl font-normal text-muted line-through">{taka(p.price, lang)}</span>}{taka(discount ? discountedPrice(p.price, discount) : p.price, lang)}<span className="ml-1.5 font-body text-base font-normal text-muted">/ {t({ en: `${p.days} days`, bn: `${num(p.days, 'bn')} দিন` })}</span></p>
                <p className="mt-1 text-sm text-muted">{t(x.perDay)}</p>
                <ul className="mt-5 flex-1 space-y-2">
                  <li className="flex gap-2.5"><Tick /><span>{t({ en: `${p.days} days of everything in Pro`, bn: `${num(p.days, 'bn')} দিন প্রো-এর সবকিছু` })}</span></li>
                  <li className="flex gap-2.5"><Tick /><span className="font-semibold">{t(x.templates)}</span></li>
                </ul>
                <button type="button" disabled={!ready || busy !== null} onClick={() => void buy(p.id)}
                  className={`btn mt-6 w-full ${featured ? 'btn-primary' : 'btn-quiet bg-white'}`}>
                  {busy === p.id ? t({ en: 'Opening payment…', bn: 'পেমেন্ট খুলছে…' }) : t({ en: `Get ${p.days}-day Pro`, bn: `${num(p.days, 'bn')} দিনের প্রো নিন` })}
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">
          {t({ en: 'Pay with bKash, Nagad or Rocket. You log in with your mobile number first, so Pro is saved to your account.', bn: 'বিকাশ, নগদ বা রকেটে পেমেন্ট। আগে মোবাইল নম্বর দিয়ে লগইন করবেন, যাতে প্রো আপনার অ্যাকাউন্টে যুক্ত হয়।' })}
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-leaf-dark">
          {[
            { en: 'bKash · Nagad · Rocket', bn: 'বিকাশ · নগদ · রকেট' },
            { en: 'One payment, no auto-renewal', bn: 'একবার পেমেন্ট, নিজে থেকে নবায়ন নেই' },
            { en: 'Days add up if you buy again', bn: 'আবার কিনলে দিন যোগ হয়' },
          ].map((x) => <li key={x.en} className="flex items-center gap-2"><Tick />{t(x)}</li>)}
        </ul>

        <div className="mt-14">
          <h2 className="text-2xl font-bold">{t({ en: 'Premium designs', bn: 'প্রিমিয়াম ডিজাইন' })}</h2>
          <p className="mt-1 text-muted">{t({ en: 'Try every design free in the builder. Pro unlocks the download.', bn: 'বিল্ডারে সব ডিজাইন ফ্রি-তে চেষ্টা করুন। ডাউনলোড খুলতে প্রো লাগে।' })}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DESIGN_LIST.filter((d) => d.pro).map((d) => (
              <li key={d.id} className="rounded-xl bg-white p-4 ring-1 ring-line">
                <p className="font-display text-lg font-semibold">{t(d.name)}</p>
                <p className="mt-1 text-sm text-muted">{t(d.note)}</p>
              </li>
            ))}
            <li className="rounded-xl bg-leaf-soft p-4">
              <Link href="/builder" className="font-display text-lg font-semibold text-leaf-dark underline underline-offset-4">{t({ en: 'Try them in the builder', bn: 'বিল্ডারে দেখে নিন' })}</Link>
              <p className="mt-1 text-sm text-leaf-dark">{t({ en: 'No sign-up needed', bn: 'সাইন-আপ লাগবে না' })}</p>
            </li>
          </ul>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t({ en: 'Every pass includes', bn: 'প্রতিটি পাসে যা থাকছে' })}</h2>
            <ul className="mt-4 space-y-2.5">
              {EVERY_PLAN.map((line) => <li key={line.en} className="flex gap-2.5"><Tick /><span>{t(line)}</span></li>)}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {t({ en: `Fair use: up to ${PRO_LIMITS.templateDownloadsPerDay} template downloads a day.`, bn: `ন্যায্য ব্যবহার: দিনে ${num(PRO_LIMITS.templateDownloadsPerDay, 'bn')}টি পর্যন্ত টেমপ্লেট ডাউনলোড।` })}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t({ en: 'Questions', bn: 'প্রশ্ন' })}</h2>
            <dl className="mt-4 space-y-5">
              {FAQ.map((f) => (
                <div key={f.q.en}>
                  <dt className="font-semibold">{t(f.q)}</dt>
                  <dd className="mt-1 text-muted">{t(f.a)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
