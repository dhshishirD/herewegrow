import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ProfileKind } from '../../shared/profilePages';
import { useLang } from '../lib/lang';

// Before → after animation of a generic job-profile card, drawn in HTML and CSS only
// (no images, video or animation library), so it adds a few KB and paints instantly.
// Layout is generic on purpose: no platform logos or trademarks.

type Stage = 'before' | 'after';

function Avatar({ after }: { after: boolean }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id={after ? 'pm-av-a' : 'pm-av-b'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={after ? '#5eead4' : '#d6dbd8'} />
          <stop offset="1" stopColor={after ? '#2ec4a6' : '#bfc6c2'} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={`url(#${after ? 'pm-av-a' : 'pm-av-b'})`} />
      <circle cx="32" cy="25" r="11" fill={after ? '#0b1f3f' : '#9aa39f'} />
      <path d="M10 64c2-13 11-20 22-20s20 7 22 20z" fill={after ? '#0b1f3f' : '#9aa39f'} />
      {after && <path d="M27 46l5 6 5-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />}
    </svg>
  );
}

function Meter({ label, value, after }: { label: string; value: string; after: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[0.7rem] font-semibold">
        <span className="text-muted">{label}</span>
        <span className={after ? 'text-leaf' : 'text-alert'}>{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
        <div className={`pm-fill h-full origin-left rounded-full ${after ? 'bg-gradient-to-r from-leaf to-saffron' : 'bg-alert/70'}`} style={{ transform: `scaleX(${after ? 1 : 0.32})` }} />
      </div>
    </div>
  );
}

function LinkedInCard({ after }: { after: boolean }) {
  const skills = after ? ['Credit Analysis', 'Financial Modelling', 'Power BI', 'KYC/AML'] : ['MS Word', 'Hardworking'];
  return (
    <div className="pm-card">
      <div className={`h-16 sm:h-20 ${after ? 'pm-banner-after' : 'bg-[#e6e9e7]'}`} />
      <div className="px-4 pb-4 sm:px-5">
        <div className="-mt-9 flex items-end justify-between">
          <div className={`h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border-4 border-white ${after ? 'ring-2 ring-leaf' : ''}`}><Avatar after={after} /></div>
          {after ? (
            <span className="pm-pop mb-1 inline-flex items-center gap-1 rounded-full bg-leaf px-2.5 py-1 text-[0.65rem] font-bold text-white">✓ Recruiter-ready</span>
          ) : (
            <span className="mb-1 rounded-full bg-mist px-2.5 py-1 text-[0.65rem] font-semibold text-muted">4 profile views</span>
          )}
        </div>
        <p className="pm-in mt-2 font-display text-base font-semibold text-ink">Nusrat Jahan</p>
        <p className={`pm-in text-[0.78rem] leading-snug ${after ? 'font-medium text-ink' : 'text-muted'}`} style={{ '--d': '1' } as CSSProperties}>
          {after ? 'Management Trainee Candidate · Banking & Finance | Credit Analysis · Excel · Power BI' : 'Student at XYZ University | Looking for a job'}
        </p>
        <p className="pm-in mt-0.5 text-[0.7rem] text-muted" style={{ '--d': '2' } as CSSProperties}>Dhaka, Bangladesh{after ? ' · 500+ connections' : ' · 23 connections'}</p>

        <div className="pm-in mt-3 rounded-lg border border-line p-2.5" style={{ '--d': '3' } as CSSProperties}>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">About</p>
          {after ? (
            <p className="mt-1 text-[0.72rem] leading-snug text-ink">Finance graduate who built a loan-risk model in Excel, cutting review time by 40%. Ready for credit and MTO roles.</p>
          ) : (
            <div className="mt-1.5 space-y-1"><div className="h-1.5 w-3/4 rounded bg-mist" /><div className="h-1.5 w-1/2 rounded bg-mist" /></div>
          )}
        </div>

        <div className="pm-in mt-2.5 flex flex-wrap gap-1.5" style={{ '--d': '4' } as CSSProperties}>
          {skills.map((s) => (
            <span key={s} className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${after ? 'bg-leaf-soft text-leaf' : 'bg-mist text-muted'}`}>{s}</span>
          ))}
        </div>

        <div className="pm-in mt-3" style={{ '--d': '5' } as CSSProperties}>
          <Meter label="Profile strength" value={after ? 'All-Star' : 'Beginner'} after={after} />
        </div>
        <div className="pm-in mt-3 grid grid-cols-2 gap-2 text-center" style={{ '--d': '6' } as CSSProperties}>
          <div className="rounded-lg bg-mist px-2 py-1.5"><p className={`font-display text-sm font-bold ${after ? 'text-leaf' : 'text-muted'}`}>{after ? '1,240' : '12'}</p><p className="text-[0.6rem] text-muted">search appearances</p></div>
          <div className="rounded-lg bg-mist px-2 py-1.5"><p className={`font-display text-sm font-bold ${after ? 'text-leaf' : 'text-muted'}`}>{after ? '18' : '0'}</p><p className="text-[0.6rem] text-muted">recruiter messages</p></div>
        </div>
      </div>
    </div>
  );
}

function BdjobsCard({ after }: { after: boolean }) {
  const rows: [string, boolean][] = [
    ['Personal details', true],
    ['Career summary', after],
    ['Education', true],
    ['Experience', after],
    ['Skills & keywords', after],
    ['Job categories', after],
    ['Photo', after],
  ];
  return (
    <div className="pm-card">
      <div className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${after ? 'pm-banner-after text-white' : 'bg-[#e6e9e7]'}`}>
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 border-white"><Avatar after={after} /></div>
        <div className="min-w-0">
          <p className={`font-display text-sm font-semibold ${after ? 'text-white' : 'text-ink'}`}>Rafiq Hasan</p>
          <p className={`truncate text-[0.7rem] ${after ? 'text-white/85' : 'text-muted'}`}>{after ? 'Accounts Executive · VAT · Payroll · Tally' : 'Objective: seeking a challenging position'}</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <Meter label="Profile completeness" value={after ? '100%' : '34%'} after={after} />
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
          {rows.map(([name, ok], i) => (
            <li key={name} className="pm-in flex items-center justify-between px-2.5 py-1.5 text-[0.72rem]" style={{ '--d': String(i) } as CSSProperties}>
              <span className={ok ? 'text-ink' : 'text-muted'}>{name}</span>
              {ok ? (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-leaf text-[0.55rem] font-bold text-white">✓</span>
              ) : (
                <span className="rounded bg-alert/10 px-1.5 py-0.5 text-[0.6rem] font-semibold text-alert">Missing</span>
              )}
            </li>
          ))}
        </ul>
        <div className="pm-in mt-3 flex items-center justify-between gap-2" style={{ '--d': '7' } as CSSProperties}>
          <p className="text-[0.7rem] text-muted">Matching jobs <span className={`font-display text-sm font-bold ${after ? 'text-leaf' : 'text-ink'}`}>{after ? '48' : '3'}</span></p>
          <span className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-bold ${after ? 'pm-pop bg-leaf text-white shadow' : 'bg-mist text-muted'}`}>
            {after ? '⚡ 1-click Apply ready' : 'Complete profile to apply'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfileMakeover({ kind }: { kind: ProfileKind }) {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('before');
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);

  // Start only when on screen; show the finished state if the visitor prefers less motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage('after');
      setAuto(false);
      return;
    }
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return setVisible(true);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const id = window.setTimeout(() => setStage((s) => (s === 'before' ? 'after' : 'before')), stage === 'before' ? 2200 : 5200);
    return () => window.clearTimeout(id);
  }, [auto, visible, stage]);

  const pick = (s: Stage) => {
    setAuto(false);
    setStage(s);
  };
  const Card = kind === 'linkedin' ? LinkedInCard : BdjobsCard;

  return (
    <div ref={root} className="pm-stage mx-auto w-full max-w-[25rem]" data-s={stage}>
      <div className="pm-glow" aria-hidden="true" />
      <div className="pm-cards relative" aria-hidden="true">
        <div className="pm-layer pm-before"><Card after={false} /></div>
        <div className="pm-layer pm-after"><Card after /></div>
        <div className="pm-scan"><span /></div>
      </div>
      <p className="sr-only">
        {t({ en: 'Illustration: a weak, half-empty profile turns into a complete, recruiter-ready profile.', bn: 'চিত্র: দুর্বল, অর্ধেক ফাঁকা প্রোফাইল পরিণত হয় সম্পূর্ণ, রিক্রুটার-রেডি প্রোফাইলে।' })}
      </p>
      <div className="relative mt-5 flex items-center justify-center gap-3">
        <div role="group" aria-label={t({ en: 'Show profile', bn: 'প্রোফাইল দেখুন' })} className="inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur">
          {(['before', 'after'] as Stage[]).map((s) => (
            <button key={s} type="button" aria-pressed={stage === s} onClick={() => pick(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${stage === s ? 'bg-white text-ink shadow' : 'text-white/80 hover:text-white'}`}>
              {s === 'before' ? t({ en: 'Before', bn: 'আগে' }) : t({ en: 'After HereWeGrow', bn: 'HereWeGrow-এর পরে' })}
            </button>
          ))}
        </div>
        {!auto && (
          <button type="button" onClick={() => { setStage('before'); setAuto(true); }} className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white">
            {t({ en: 'Replay', bn: 'আবার দেখুন' })}
          </button>
        )}
      </div>
      <p className="relative mt-2 text-center text-xs text-white/55">{t({ en: 'Illustration with sample data', bn: 'নমুনা তথ্য দিয়ে তৈরি চিত্র' })}</p>
    </div>
  );
}
