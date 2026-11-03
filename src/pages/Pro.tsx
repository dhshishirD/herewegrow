import { useEffect, useState } from 'react';
import { PLANS, PRO_LIMITS, type PlanId } from '../../shared/plans';
import { PageHead } from '../components/PageHead';
import { useAuth } from '../lib/auth';
import { num, taka, useLang } from '../lib/lang';
import { setPageMeta } from '../lib/seo';

type B = { en: string; bn: string };

const EVERY_PLAN: B[] = [
  { en: 'Download PDF and Word without the HereWeGrow mark', bn: 'HereWeGrow চিহ্ন ছাড়া PDF ও Word ডাউনলোড' },
  { en: 'All premium CV designs', bn: 'সব প্রিমিয়াম সিভি ডিজাইন' },
  { en: `Save up to ${PRO_LIMITS.savedCvs} CVs online, open them on any device`, bn: `অনলাইনে ${num(PRO_LIMITS.savedCvs, 'bn')}টি পর্যন্ত সিভি সেভ, যেকোনো ডিভাইসে খুলুন` },
  { en: 'AI writing help: summary, bullet points, Bangla to English, match a job ad', bn: 'এআই লেখার সাহায্য: সামারি, বুলেট পয়েন্ট, বাংলা থেকে ইংরেজি, চাকরির বিজ্ঞাপনের সাথে মিল' },
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
    a: { en: 'They stay saved. You can still open and edit them; clean downloads and AI come back when you renew.', bn: 'সেভ থাকবে। খুলতে ও এডিট করতে পারবেন; নবায়ন করলে আবার মার্কছাড়া ডাউনলোড ও এআই পাবেন।' },
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
  const { user, ready, openLogin, loginOpen } = useAuth();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState('');

  const title = t({ en: 'HereWeGrow Pro', bn: 'HereWeGrow প্রো' });
  const intro = t({
    en: 'Everything you need for a job-winning CV, in one pass. Pay once by bKash or Nagad. No auto-renewal.',
    bn: 'চাকরি পাওয়ার মতো সিভির জন্য যা লাগে, সব এক পাসে। বিকাশ বা নগদে একবার পেমেন্ট। নিজে থেকে নবায়ন হয় না।',
  });
  useEffect(() => setPageMeta(title, intro, '/pro'), [title, intro]);

  const buy = async (id: PlanId) => {
    setError('');
    if (!user) {
      setPending(id);
      openLogin();
      return;
    }
    setBusy(id);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id, lang }) });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; paymentUrl?: string; error?: string };
      if (d.ok && d.paymentUrl) {
        window.location.href = d.paymentUrl;
        return;
      }
      if (d.error === 'login') {
        setPending(id);
        openLogin();
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

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => {
            const x = PLAN_TEXT[p.id];
            const featured = p.id === 'pro-30';
            return (
              <article key={p.id} className={`flex flex-col rounded-2xl bg-white p-6 ${featured ? 'ring-2 ring-leaf shadow-lg' : 'ring-1 ring-line'}`}>
                <div className="flex min-h-7 items-center justify-between gap-2">
                  <h2 className="text-xl font-bold">{t(p.name)}</h2>
                  {x.tag && <span className="rounded bg-gold-soft px-2 py-0.5 text-sm font-semibold text-gold">{t(x.tag)}</span>}
                </div>
                <p className="mt-4 font-display text-4xl font-bold">{taka(p.price, lang)}</p>
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

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t({ en: 'Every pass includes', bn: 'প্রতিটি পাসে যা থাকছে' })}</h2>
            <ul className="mt-4 space-y-2.5">
              {EVERY_PLAN.map((line) => <li key={line.en} className="flex gap-2.5"><Tick /><span>{t(line)}</span></li>)}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {t({ en: `Fair use: ${PRO_LIMITS.aiActionsPerDay} AI actions and ${PRO_LIMITS.templateDownloadsPerDay} template downloads a day.`, bn: `ন্যায্য ব্যবহার: দিনে ${num(PRO_LIMITS.aiActionsPerDay, 'bn')}টি এআই কাজ ও ${num(PRO_LIMITS.templateDownloadsPerDay, 'bn')}টি টেমপ্লেট ডাউনলোড।` })}
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
