import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';

// Home page promo slider: three animated "before → after" scenes (CV, LinkedIn, BDJobs).
// Everything is HTML + CSS (classes sc-* in index.css), so it is light, crisp and readable by screen readers.
// Autoplays every 7 s, pauses on hover or focus, and stays still for people who prefer reduced motion.

const DURATION = 7000;

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts from `from` to `to` after `delay` ms. */
function useCount(to: number, from = 0, delay = 600, ms = 1400) {
  const [n, setN] = useState(reduced() ? to : from);
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / ms));
      setN(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, from, delay, ms]);
  return n;
}

function Ring({ value, tone }: { value: number; tone: 'bad' | 'good' }) {
  const c = 2 * Math.PI * 16;
  return (
    <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f2" strokeWidth="4" />
      <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" strokeLinecap="round"
        stroke={tone === 'good' ? '#2ec4a6' : '#e0624b'} strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

const Bar = ({ w, className = '' }: { w: string; className?: string }) => <span className={`block h-[5px] rounded-full bg-slate-200 ${className}`} style={{ width: w }} />;

/* ── Scene 1: CV ─────────────────────────────────────────────────── */
function CvScene() {
  const score = useCount(96, 38, 900);
  return (
    <div className="grid h-full grid-cols-2 items-center gap-4 sm:gap-6">
      <div className="sc-in relative rounded-xl bg-white p-3 shadow-sm ring-1 ring-line sm:p-4" style={{ '--d': 0 } as CSSProperties}>
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">Average CV</p>
        <div className="rounded-md bg-slate-50 p-2.5 grayscale">
          <div className="mb-2 h-3 w-3/4 rounded bg-slate-400" />
          <div className="grid grid-cols-[1fr_1.6fr] gap-2">
            <div className="space-y-1.5 rounded bg-sky-100 p-1.5">{['80%', '60%', '70%', '50%', '65%'].map((w, i) => <Bar key={i} w={w} />)}</div>
            <div className="space-y-1.5">{['100%', '90%', '95%', '70%', '100%', '85%', '60%', '92%'].map((w, i) => <Bar key={i} w={w} />)}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-2 py-1.5 ring-1 ring-red-100">
          <div className="relative grid place-items-center"><Ring value={38} tone="bad" /><span className="absolute text-[11px] font-bold">38%</span></div>
          <div className="leading-tight"><p className="text-sm font-bold text-red-700">Rejected</p><p className="text-[11px] text-muted">Hard for ATS to read</p></div>
        </div>
      </div>

      <div className="sc-in relative rounded-xl bg-white p-3 shadow-xl ring-1 ring-line sm:p-4" style={{ '--d': 2 } as CSSProperties}>
        <span className="sc-pop absolute -right-2 -top-3 rounded-full bg-saffron px-2.5 py-1 text-[11px] font-bold text-ink shadow">Shortlisted ✓</span>
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-leaf">HereWeGrow CV</p>
        <div className="rounded-md bg-white p-2.5 ring-1 ring-line">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1"><div className="sc-grow h-3 w-3/4 rounded bg-leaf-dark" /><div className="sc-grow mt-1 h-2 w-1/2 rounded bg-leaf/60" style={{ '--d': 1 } as CSSProperties} /></div>
            <div className="h-9 w-12 rounded bg-leaf-dark" />
          </div>
          {[0, 1, 2].map((s) => (
            <div key={s} className="mt-2.5">
              <div className="sc-grow mb-1 flex items-center gap-1" style={{ '--d': 2 + s } as CSSProperties}><span className="h-2 w-2 rounded-sm bg-leaf" /><span className="h-2 w-16 rounded bg-slate-700" /></div>
              <div className="space-y-1">{['96%', '88%', '72%'].map((w, i) => <span key={i} className="sc-grow block h-[5px] rounded-full bg-slate-200" style={{ width: w, '--d': 3 + s + i * 0.3 } as CSSProperties} />)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-gold-soft px-2 py-1.5 ring-1 ring-saffron/30">
          <div className="relative grid place-items-center"><Ring value={score} tone="good" /><span className="absolute text-[11px] font-bold tabular-nums">{score}%</span></div>
          <div className="leading-tight"><p className="text-sm font-bold text-gold">ATS ready</p><p className="text-[11px] text-muted">Clear, keyword-rich</p></div>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 2: LinkedIn ───────────────────────────────────────────── */
function LinkedInScene() {
  const views = useCount(312, 0, 1300);
  const bars = [28, 34, 30, 46, 58, 74, 92];
  return (
    <div className="grid h-full items-center gap-4 sm:grid-cols-[1.25fr_1fr]">
      <div className="sc-in overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-line" style={{ '--d': 0 } as CSSProperties}>
        <div className="sc-banner h-16 sm:h-20" />
        <div className="px-4 pb-4">
          <div className="relative -mt-8 h-16 w-16 rounded-full bg-white p-1 shadow">
            <div className="sc-otw h-full w-full rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
          </div>
          <p className="mt-2 font-display text-base font-bold text-ink">Nusrat Jahan</p>
          <p className="sc-type text-sm text-muted">Finance Analyst | Financial Modelling | IFRS | Power BI</p>
          <p className="mt-1 text-xs text-muted">Dhaka, Bangladesh · 500+ connections</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Open to work', 'Top skills', 'Featured'].map((x, i) => (
              <span key={x} className="sc-pop rounded-full bg-leaf-soft px-2.5 py-0.5 text-[11px] font-semibold text-leaf-dark" style={{ '--d': 6 + i } as CSSProperties}>{x}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="sc-in rounded-xl bg-white p-4 shadow-sm ring-1 ring-line" style={{ '--d': 3 } as CSSProperties}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Profile views</p>
        <p className="font-display text-3xl font-bold text-leaf tabular-nums">+{views}%</p>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {bars.map((h, i) => <span key={i} className="sc-bar flex-1 rounded-t bg-leaf/80" style={{ height: `${h}%`, '--d': 4 + i * 0.6 } as CSSProperties} />)}
        </div>
        <p className="sc-pop mt-3 rounded-lg bg-gold-soft px-2.5 py-1.5 text-xs font-semibold text-gold" style={{ '--d': 12 } as CSSProperties}>★ Recruiter search appearances up</p>
      </div>
    </div>
  );
}

/* ── Scene 3: BDJobs ─────────────────────────────────────────────── */
function BdjobsScene() {
  const pct = useCount(100, 45, 700, 2200);
  const items = ['Professional photo', 'Career objective', 'Key skills & keywords', 'Experience in detail', 'Expected salary & area'];
  return (
    <div className="relative grid h-full items-center">
      <div className="sc-in mx-auto w-full max-w-md rounded-xl bg-white p-4 shadow-xl ring-1 ring-line sm:p-5" style={{ '--d': 0 } as CSSProperties}>
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold">Job profile</p>
          <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-muted">BDJobs</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted">Profile complete</span><span className="font-bold tabular-nums text-leaf">{pct}%</span></div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-gradient-to-r from-leaf to-saffron" style={{ width: `${pct}%` }} /></div>
        <ul className="mt-4 space-y-2">
          {items.map((x, i) => (
            <li key={x} className="sc-in flex items-center gap-2.5 text-sm" style={{ '--d': 3 + i * 1.6 } as CSSProperties}>
              <span className="sc-tick grid h-5 w-5 place-items-center rounded-full bg-saffron text-[11px] font-bold text-ink" style={{ '--d': 4 + i * 1.6 } as CSSProperties}>✓</span>
              {x}
            </li>
          ))}
        </ul>
      </div>
      <div className="sc-toast absolute -bottom-7 right-0 flex items-center gap-2.5 rounded-xl bg-leaf-dark px-3.5 py-2.5 text-white shadow-2xl sm:right-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-saffron text-ink">👁</span>
        <span className="leading-tight"><span className="block text-sm font-semibold">An employer viewed your CV</span><span className="text-xs text-white/70">Just now · Shortlist stage</span></span>
      </div>
    </div>
  );
}

interface Slide {
  id: string;
  tab: string;
  price: { en: string; bn: string };
  title: { en: string; bn: string };
  body: { en: string; bn: string };
  cta: { en: string; bn: string };
  href: string;
  scene: () => ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 'cv', tab: 'CV', href: '/services', price: { en: 'Written from ৳499 · Templates from ৳39', bn: 'লেখা ৳৪৯৯ থেকে · টেমপ্লেট ৳৩৯ থেকে' },
    title: { en: 'From “Rejected” to shortlisted', bn: '“বাতিল” থেকে শর্টলিস্টে' },
    body: { en: 'A clean, ATS-friendly CV that software can read and recruiters can scan in seconds. Written by experts, or built yourself free.', bn: 'ATS-বান্ধব পরিপাটি সিভি, যা সফটওয়্যার পড়তে পারে আর রিক্রুটার কয়েক সেকেন্ডে বুঝে নেন। বিশেষজ্ঞের লেখা, অথবা ফ্রিতে নিজে বানান।' },
    cta: { en: 'Get my CV done', bn: 'আমার সিভি করিয়ে নিন' }, scene: () => <CvScene />,
  },
  {
    id: 'linkedin', tab: 'LinkedIn', href: '/services#profile', price: { en: 'Makeover ৳499', bn: 'মেকওভার ৳৪৯৯' },
    title: { en: 'A LinkedIn profile recruiters find', bn: 'রিক্রুটাররা খুঁজে পান এমন লিংকডইন' },
    body: { en: 'Keyword-rich headline, About and experience, plus a banner that looks the part. More searches, more profile views, more messages.', bn: 'কিওয়ার্ডসহ হেডলাইন, About ও অভিজ্ঞতা, সাথে মানানসই ব্যানার। বেশি সার্চ, বেশি প্রোফাইল ভিউ, বেশি মেসেজ।' },
    cta: { en: 'Upgrade my LinkedIn', bn: 'লিংকডইন আপগ্রেড করুন' }, scene: () => <LinkedInScene />,
  },
  {
    id: 'bdjobs', tab: 'BDJobs', href: '/services#profile', price: { en: 'Profile setup ৳299', bn: 'প্রোফাইল সেটআপ ৳২৯৯' },
    title: { en: 'A BDJobs profile employers shortlist', bn: 'নিয়োগকর্তা বাছাই করেন এমন বিডিজবস প্রোফাইল' },
    body: { en: 'Every field filled the way employers filter: skills, keywords, experience and salary. Your profile shows up, and gets opened.', bn: 'নিয়োগকর্তারা যেভাবে ফিল্টার করেন সেভাবে প্রতিটি ঘর পূরণ: স্কিল, কিওয়ার্ড, অভিজ্ঞতা, বেতন। প্রোফাইল দেখা যায়, খোলাও হয়।' },
    cta: { en: 'Fix my BDJobs profile', bn: 'বিডিজবস প্রোফাইল ঠিক করুন' }, scene: () => <BdjobsScene />,
  },
];

export function Showcase() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = reduced();

  useEffect(() => {
    if (paused || still) return;
    const id = window.setTimeout(() => setI((x) => (x + 1) % SLIDES.length), DURATION);
    return () => window.clearTimeout(id);
  }, [i, paused, still]);

  const s = SLIDES[i];
  return (
    <section aria-roledescription="carousel" aria-label={t({ en: 'What we do', bn: 'আমরা যা করি' })} className="sc-section relative overflow-hidden">
      <div aria-hidden="true" className="lux-dots pointer-events-none absolute inset-0" />
      <div className="wrap relative py-16 md:py-20"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.25fr] md:gap-14">
          <div>
            <div role="tablist" aria-label={t({ en: 'Choose a service', bn: 'সার্ভিস বেছে নিন' })} className="inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/15">
              {SLIDES.map((x, k) => (
                <button key={x.id} type="button" role="tab" aria-selected={k === i} aria-controls="sc-panel" onClick={() => setI(k)}
                  className={`relative overflow-hidden rounded-full px-4 py-1.5 text-sm font-semibold transition-colors sm:px-5 ${k === i ? 'bg-white text-leaf-dark' : 'text-white/80 hover:text-white'}`}>
                  {x.tab}
                  {k === i && !still && <span key={`${i}-${paused}`} aria-hidden="true" className={`sc-progress absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-leaf ${paused ? 'sc-paused' : ''}`} style={{ animationDuration: `${DURATION}ms` }} />}
                </button>
              ))}
            </div>
            <div key={s.id} className="sc-copy">
              <p className="mt-7 font-display text-sm font-semibold text-saffron">{t(s.price)}</p>
              <h2 className="mt-2 text-3xl text-white sm:text-[2.5rem]">{t(s.title)}</h2>
              <p className="mt-4 max-w-lg text-lg text-white/75">{t(s.body)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={s.href} className="btn bg-white !px-6 text-leaf-dark hover:bg-leaf-soft">{t(s.cta)} →</Link>
                <Link href="/builder" className="btn border-[1.5px] border-white/30 !px-6 text-white hover:border-white">{t({ en: 'Build a CV free', bn: 'ফ্রিতে সিভি বানান' })}</Link>
              </div>
            </div>
          </div>
          <div id="sc-panel" role="tabpanel" aria-label={s.tab} className="sc-stage relative min-h-[24rem] rounded-3xl bg-gradient-to-br from-white to-leaf-soft p-4 shadow-2xl ring-1 ring-white/20 sm:p-7">
            <div key={s.id} className="h-full">{s.scene()}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
