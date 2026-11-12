// The signed-in home: who you are, your CVs, what you bought, and the next useful thing to do.
import { useEffect, useState } from 'react';
import { SUPPORT_WHATSAPP } from '../../shared/catalog';
import { cloudId } from '../lib/cvs';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { Link, navigate } from '../lib/router';
import { track } from '../lib/track';
import { LinkPhone } from '../components/LinkPhone';

type B = { en: string; bn: string };
interface Summary {
  cvs: { id: string; title: string; design: string | null; updatedAt: number }[];
  cvLimit: number;
  activity: { id: string; kind: string; name: B; amount: number; at: number }[];
  partner: { applied: boolean; active: boolean };
}

const DAY = 86_400_000;

function Tile({ href, icon, title, text, cta, tone = 'plain', onClick }: { href: string; icon: string; title: B; text: B; cta: B; tone?: 'plain' | 'hot'; onClick?: () => void }) {
  const { t } = useLang();
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${tone === 'hot' ? 'bg-leaf-dark text-white' : 'bg-white ring-1 ring-line'}`}
    >
      <span aria-hidden="true" className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${tone === 'hot' ? 'bg-white/15' : 'bg-leaf-soft'}`}>{icon}</span>
      <span className="mt-3 text-lg font-bold">{t(title)}</span>
      <span className={`mt-1 flex-1 text-[0.95rem] ${tone === 'hot' ? 'text-white/80' : 'text-muted'}`}>{t(text)}</span>
      <span className={`mt-4 font-semibold ${tone === 'hot' ? 'text-saffron' : 'text-leaf'}`}>{t(cta)} →</span>
    </Link>
  );
}

export function AccountPage() {
  const { user, ready, openLogin, logout } = useAuth();
  const { lang, t } = useLang();
  const failed = new URLSearchParams(window.location.search).get('login') === 'failed';
  const [data, setData] = useState<Summary | null | undefined>(undefined);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void fetch('/api/account/summary')
      .then((r) => r.json() as Promise<{ ok: boolean } & Summary>)
      .then((d) => live && setData(d.ok ? d : null))
      .catch(() => live && setData(null));
    return () => { live = false; };
  }, [userId]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;

  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">{t({ en: 'Your account', bn: 'আপনার অ্যাকাউন্ট' })}</h1>
        {failed && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {t({ en: 'Google login did not work. Please try again.', bn: 'গুগল লগইন কাজ করেনি। আবার চেষ্টা করুন।' })}
          </p>
        )}
        <p className="mt-3 text-muted">{t({ en: 'Log in with your mobile number to save CVs and see your orders.', bn: 'সিভি সেভ করতে ও অর্ডার দেখতে মোবাইল নম্বর দিয়ে লগইন করুন।' })}</p>
        <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>{t({ en: 'Log in', bn: 'লগইন করুন' })}</button>
      </div>
    );
  }

  const loc = lang === 'bn' ? 'bn-BD' : 'en-GB';
  const day = (ts: number) => new Date(ts).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
  const num = (n: number) => n.toLocaleString(loc);
  const first = (user.name ?? '').trim().split(/\s+/)[0] || t({ en: 'there', bn: 'বন্ধু' });
  const cvs = data?.cvs ?? [];
  const activity = data?.activity ?? [];
  const partner = data?.partner;
  const proDays = user.pro && user.proUntil ? Math.max(0, Math.ceil((user.proUntil - Date.now()) / DAY)) : 0;
  const boughtService = activity.some((a) => a.kind === 'service');
  const wa = (text: string) => `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;
  const openCv = (id: string) => {
    cloudId.set(id);
    navigate('/builder');
  };

  return (
    <div className="pb-6">
      <section className="bg-leaf-dark text-white">
        <div className="wrap flex max-w-5xl flex-col items-start gap-5 py-8 sm:flex-row sm:items-center md:py-10">
          <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-saffron font-display text-3xl font-bold text-leaf-dark">{first.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 sm:flex-1">
            <h1 className="text-3xl font-bold md:text-4xl">{t({ en: `Welcome, ${first}`, bn: `স্বাগতম, ${first}` })}</h1>
            <p className="mt-1 text-white/75">{[user.phone, user.email].filter(Boolean).join(' · ')}</p>
            <p className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-white/15 px-3 py-1">
                {user.pro && proDays
                  ? t({ en: `Pro · ${proDays} days left`, bn: `প্রো · ${num(proDays)} দিন বাকি` })
                  : t({ en: 'Free account', bn: 'ফ্রি অ্যাকাউন্ট' })}
              </span>
              {partner?.active && <span className="rounded-full bg-saffron px-3 py-1 text-leaf-dark">{t({ en: 'CV Partner', bn: 'সিভি পার্টনার' })}</span>}
            </p>
          </div>
          <Link href="/builder" className="btn bg-white text-leaf-dark hover:bg-leaf-soft" onClick={() => track('account_cta', { to: 'builder' })}>
            {cvs.length ? t({ en: 'Continue my CV', bn: 'আমার CV চালিয়ে যান' }) : t({ en: 'Build my first CV', bn: 'প্রথম CV বানান' })}
          </Link>
        </div>
      </section>

      {!user.phone && <LinkPhone />}
      <div className="wrap max-w-5xl py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
            <p className="text-sm font-semibold text-muted">{t({ en: 'Saved CVs', bn: 'সেভ করা CV' })}</p>
            <p className="mt-1 font-display text-3xl font-bold">{data === undefined ? '…' : num(cvs.length)}<span className="ml-1 text-base font-normal text-muted">/ {num(data?.cvLimit ?? 1)}</span></p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
            <p className="text-sm font-semibold text-muted">{t({ en: 'Orders', bn: 'অর্ডার' })}</p>
            <p className="mt-1 font-display text-3xl font-bold">{data === undefined ? '…' : num(activity.length)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
            <p className="text-sm font-semibold text-muted">{t({ en: 'Plan', bn: 'প্ল্যান' })}</p>
            <p className="mt-1 font-display text-2xl font-bold">{user.pro ? 'Pro' : t({ en: 'Free', bn: 'ফ্রি' })}</p>
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-bold">{t({ en: 'My CVs', bn: 'আমার CV' })}</h2>
        {data === undefined ? (
          <p className="mt-3 text-muted">…</p>
        ) : cvs.length ? (
          <ul className="mt-4 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
            {cvs.slice(0, 6).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg bg-leaf-soft text-lg">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.title}</p>
                  <p className="text-sm text-muted">{t({ en: 'Updated', bn: 'হালনাগাদ' })} {day(c.updatedAt)}</p>
                </div>
                <button type="button" className="btn btn-quiet" onClick={() => openCv(c.id)}>{t({ en: 'Open', bn: 'খুলুন' })}</button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-leaf/40 bg-leaf-soft/50 p-6">
            <p className="text-lg font-semibold">{t({ en: 'You have no saved CV yet', bn: 'এখনো কোনো CV সেভ করা নেই' })}</p>
            <p className="mt-1 text-muted">{t({ en: 'Make one free in about 10 minutes. You can also upload your old CV and we fill the form.', bn: 'প্রায় ১০ মিনিটে ফ্রিতে বানান। চাইলে পুরোনো CV আপলোড করুন, ফর্ম আমরা পূরণ করে দেব।' })}</p>
            <Link href="/builder" className="btn btn-primary mt-4">{t({ en: 'Start my CV', bn: 'CV শুরু করুন' })}</Link>
          </div>
        )}

        <h2 className="mt-12 text-2xl font-bold">{t({ en: 'Recommended for you', bn: 'আপনার জন্য' })}</h2>
        <p className="mt-1 text-muted">{t({ en: 'Pick what you need next. We keep adding more here.', bn: 'এরপর যা দরকার বেছে নিন। এখানে আমরা আরও যোগ করছি।' })}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile tone="hot" href="/services" icon="✍️" onClick={() => track('account_cta', { to: 'services' })}
            title={boughtService ? { en: 'Another expert CV', bn: 'আরেকটি এক্সপার্ট CV' } : { en: 'Let an expert write your CV', bn: 'এক্সপার্টকে দিয়ে CV লেখান' }}
            text={{ en: 'A CV that gets you called, written from your facts. Fresher or experienced.', bn: 'আপনার তথ্য থেকে লেখা, যে CV দেখে ডাক আসে। ফ্রেশার বা অভিজ্ঞ।' }}
            cta={{ en: 'See services', bn: 'সার্ভিস দেখুন' }} />
          <Tile href="/tools/cv-checker" icon="✅" onClick={() => track('account_cta', { to: 'cv_checker' })}
            title={{ en: 'Free CV checker', bn: 'ফ্রি CV চেকার' }}
            text={{ en: 'See what is missing in your CV before you apply. Runs on your phone.', bn: 'আবেদনের আগে দেখুন CV-তে কী কম আছে। আপনার ফোনেই চলে।' }}
            cta={{ en: 'Check my CV', bn: 'আমার CV দেখুন' }} />
          <Tile href="/tools/job-match" icon="🎯" onClick={() => track('account_cta', { to: 'job_match' })}
            title={{ en: 'CV vs job ad match', bn: 'CV বনাম বিজ্ঞাপন ম্যাচ' }}
            text={{ en: 'Paste a job ad and see how well your CV fits it.', bn: 'চাকরির বিজ্ঞাপন পেস্ট করে দেখুন আপনার CV কতটা মেলে।' }}
            cta={{ en: 'Match now', bn: 'মিলিয়ে দেখুন' }} />
          <Tile href="/templates" icon="🎨" onClick={() => track('account_cta', { to: 'templates' })}
            title={{ en: 'CV templates', bn: 'CV টেমপ্লেট' }}
            text={{ en: 'Designed CV formats for freshers, experienced, Gulf and study abroad.', bn: 'ফ্রেশার, অভিজ্ঞ, গালফ ও বিদেশে পড়ার জন্য ডিজাইনড CV ফরম্যাট।' }}
            cta={{ en: 'Browse templates', bn: 'টেমপ্লেট দেখুন' }} />
          <Tile href="/linkedin-profile-optimization" icon="💼" onClick={() => track('account_cta', { to: 'linkedin' })}
            title={{ en: 'LinkedIn and BDJobs profile', bn: 'লিংকডইন ও বিডিজবস প্রোফাইল' }}
            text={{ en: 'Let recruiters find you. We set up your profile.', bn: 'রিক্রুটাররা যেন আপনাকে খুঁজে পায়। প্রোফাইল আমরা সাজিয়ে দিই।' }}
            cta={{ en: 'Learn more', bn: 'বিস্তারিত' }} />
          <Tile href="/guides" icon="📚" onClick={() => track('account_cta', { to: 'guides' })}
            title={{ en: 'Career guides', bn: 'ক্যারিয়ার গাইড' }}
            text={{ en: 'Simple Bangla guides on CVs, interviews and getting hired.', bn: 'CV, ইন্টারভিউ ও চাকরি পাওয়ার সহজ বাংলা গাইড।' }}
            cta={{ en: 'Read guides', bn: 'গাইড পড়ুন' }} />
        </div>

        <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-line sm:flex-row sm:items-center">
          <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-gold-soft text-2xl">🤝</span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{partner?.active ? t({ en: 'Your Partner Workspace', bn: 'আপনার পার্টনার ওয়ার্কস্পেস' }) : t({ en: 'Earn by making CVs for others', bn: 'অন্যের CV বানিয়ে আয় করুন' })}</p>
            <p className="text-muted">{partner?.active ? t({ en: 'Open your clients, library and kit.', bn: 'ক্লায়েন্ট, লাইব্রেরি ও কিট খুলুন।' }) : t({ en: 'CV Partner gives you every design, client folders and your own client link.', bn: 'সিভি পার্টনারে পাবেন সব ডিজাইন, ক্লায়েন্ট ফোল্ডার ও নিজস্ব ক্লায়েন্ট লিংক।' })}</p>
          </div>
          <Link href="/partner" className="btn btn-primary" onClick={() => track('account_cta', { to: 'partner' })}>{partner?.active ? t({ en: 'Open workspace', bn: 'ওয়ার্কস্পেস খুলুন' }) : t({ en: 'See CV Partner', bn: 'সিভি পার্টনার দেখুন' })}</Link>
        </div>

        <h2 className="mt-12 text-2xl font-bold">{t({ en: 'Coming soon', bn: 'শিগগিরই আসছে' })}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { i: '🧭', t: { en: 'Job opportunities', bn: 'চাকরির সুযোগ' }, d: { en: 'Jobs and openings that match your CV.', bn: 'আপনার CV-র সাথে মেলে এমন চাকরি।' } },
            { i: '🎓', t: { en: 'Skill courses', bn: 'স্কিল কোর্স' }, d: { en: 'Short courses that make your CV stronger.', bn: 'CV শক্তিশালী করার ছোট কোর্স।' } },
            { i: '🗣️', t: { en: 'Interview practice', bn: 'ইন্টারভিউ প্র্যাকটিস' }, d: { en: 'Practise common questions before the real day.', bn: 'আসল দিনের আগে সাধারণ প্রশ্নের অনুশীলন।' } },
          ].map((x) => (
            <div key={x.t.en} className="rounded-2xl border border-dashed border-line bg-white/60 p-5">
              <span aria-hidden="true" className="text-2xl">{x.i}</span>
              <p className="mt-2 font-bold">{t(x.t)} <span className="ml-1 rounded bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold">{t({ en: 'Soon', bn: 'শিগগির' })}</span></p>
              <p className="mt-1 text-sm text-muted">{t(x.d)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {t({ en: 'What would help you most? ', bn: 'আপনার সবচেয়ে কী কাজে লাগবে? ' })}
          <a className="font-semibold text-leaf underline" href={wa('Hello HereWeGrow, I would like to see this on my dashboard: ')} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'account' })}>{t({ en: 'Tell us on WhatsApp', bn: 'হোয়াটসঅ্যাপে জানান' })}</a>
        </p>

        <h2 className="mt-12 text-2xl font-bold">{t({ en: 'Orders and downloads', bn: 'অর্ডার ও ডাউনলোড' })}</h2>
        {data === undefined ? (
          <p className="mt-3 text-muted">…</p>
        ) : activity.length ? (
          <ul className="mt-4 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="min-w-0"><span className="font-semibold">{t(a.name)}</span><span className="ml-2 text-sm text-muted">{day(a.at)}</span></span>
                <span className="text-sm font-semibold">{a.amount ? `৳${num(a.amount)}` : t({ en: 'Free', bn: 'ফ্রি' })}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">{t({ en: 'Nothing here yet. Your orders will show up here.', bn: 'এখনো কিছু নেই। আপনার অর্ডার এখানে দেখা যাবে।' })}</p>
        )}
        <p className="mt-3 text-sm"><Link href="/order" className="font-semibold text-leaf underline">{t({ en: 'Download your files again', bn: 'আবার ফাইল ডাউনলোড করুন' })}</Link></p>

        <h2 className="mt-12 text-2xl font-bold">{t({ en: 'Account', bn: 'অ্যাকাউন্ট' })}</h2>
        <dl className="mt-4 grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-line sm:grid-cols-3">
          <div><dt className="label">{t({ en: 'Name', bn: 'নাম' })}</dt><dd>{user.name || '—'}</dd></div>
          <div><dt className="label">{t({ en: 'Mobile', bn: 'মোবাইল' })}</dt><dd>{user.phone || '—'}</dd></div>
          <div><dt className="label">{t({ en: 'Email', bn: 'ইমেইল' })}</dt><dd className="break-all">{user.email || '—'}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          {user.isAdmin && <Link href="/admin" className="btn btn-quiet">Admin</Link>}
          <a className="btn btn-quiet" href={wa('Hello HereWeGrow, I need help with my account.')} target="_blank" rel="noreferrer">{t({ en: 'Get help', bn: 'সাহায্য নিন' })}</a>
          <button type="button" className="btn btn-quiet" onClick={() => void logout()}>{t({ en: 'Log out', bn: 'লগআউট' })}</button>
        </div>
      </div>
    </div>
  );
}
