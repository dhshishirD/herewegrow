// AI writing helpers inside the Builder: a button + result card for a field, and a job-match panel.
import { useState, type ReactNode } from 'react';
import { AI_ERRORS, runAi, type AiAction, type AiError, type AiResult } from '../lib/ai';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { Link, navigate } from '../lib/router';

/** Runs an action for a Pro user. Others are sent to log in or to the Pro page. Returns null when nothing ran. */
export function useAiRunner() {
  const { lang, t } = useLang();
  const { user, openLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  const run = async (action: AiAction, body: Record<string, unknown>): Promise<AiResult | null> => {
    setError(null);
    if (!user) {
      openLogin();
      return null;
    }
    if (!user.pro) {
      if (window.confirm(t({ en: 'AI writing help is part of Pro. Get Pro from ৳49?', bn: 'এআই লেখার সাহায্য প্রো-এর অংশ। ৳৪৯ থেকে প্রো নিন?' }))) navigate('/pro');
      return null;
    }
    setBusy(true);
    const r = await runAi(action, body, lang);
    setBusy(false);
    if (r.ok) {
      setLeft(r.left);
      return r.result;
    }
    setError(r.error);
    return null;
  };
  return { run, busy, error, left, clear: () => setError(null) };
}

export function AiErrorNote({ error }: { error: AiError | null }) {
  const { t } = useLang();
  if (!error) return null;
  return (
    <p role="alert" className="mt-2 rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">
      {t(AI_ERRORS[error])}{' '}
      {(error === 'pro' || error === 'quota') && <Link href="/pro" className="font-semibold underline">{t({ en: 'See Pro', bn: 'প্রো দেখুন' })}</Link>}
    </p>
  );
}

export function AiButton({ onClick, busy, children }: { onClick: () => void; busy: boolean; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn btn-quiet bg-white !min-h-10 disabled:opacity-60">
      <span aria-hidden="true">✨</span> {children}
      {!user?.pro && <span className="ml-1.5 rounded bg-gold-soft px-1 text-[10px] font-bold uppercase text-gold">Pro</span>}
    </button>
  );
}

/** A suggestion the person can accept or drop. Nothing changes on the CV until they accept. */
export function Suggestion({ title, children, onUse, onClose, useLabel }: { title: string; children: ReactNode; onUse?: () => void; onClose: () => void; useLabel?: string }) {
  const { t } = useLang();
  return (
    <div className="mt-3 rounded-xl bg-leaf-soft/60 p-4 ring-1 ring-leaf/30" role="status">
      <p className="text-sm font-semibold text-leaf-dark">{title}</p>
      <div className="mt-2 whitespace-pre-line">{children}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {onUse && <button type="button" className="btn btn-primary !min-h-10" onClick={onUse}>{useLabel ?? t({ en: 'Use this', bn: 'এটি ব্যবহার করুন' })}</button>}
        <button type="button" className="btn btn-quiet bg-white !min-h-10" onClick={onClose}>{t({ en: 'Close', bn: 'বন্ধ করুন' })}</button>
      </div>
      <p className="mt-2 text-xs text-muted">{t({ en: 'AI can make mistakes. Check every fact and fill in any [X] with your real number.', bn: 'এআই ভুল করতে পারে। প্রতিটি তথ্য মিলিয়ে নিন, আর [X] জায়গায় আপনার আসল সংখ্যা বসান।' })}</p>
    </div>
  );
}

/** Rewrite or translate the text of one field. */
export function FieldAi({ text, role, current, onApply }: { text: string; role?: string; current?: boolean; onApply: (v: string) => void }) {
  const { t } = useLang();
  const ai = useAiRunner();
  const [out, setOut] = useState<{ kind: 'rewrite' | 'english'; value: string } | null>(null);

  const go = async (kind: 'rewrite' | 'english') => {
    setOut(null);
    const r = await ai.run(kind === 'rewrite' ? 'rewrite-bullet' : 'improve-english', { text, role, current });
    if (!r) return;
    const value = r.items ? r.items.join('\n') : (r.text ?? '');
    if (value) setOut({ kind, value });
  };
  const thin = text.trim().length < 3;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <AiButton busy={ai.busy} onClick={() => (thin ? window.alert(t({ en: 'Write a few words first.', bn: 'আগে কয়েকটি শব্দ লিখুন।' })) : void go('rewrite'))}>
          {ai.busy ? t({ en: 'Working…', bn: 'কাজ চলছে…' }) : t({ en: 'Make stronger', bn: 'আরও জোরালো করুন' })}
        </AiButton>
        <AiButton busy={ai.busy} onClick={() => (thin ? window.alert(t({ en: 'Write a few words first.', bn: 'আগে কয়েকটি শব্দ লিখুন।' })) : void go('english'))}>
          {t({ en: 'Bangla → English', bn: 'বাংলা → ইংরেজি' })}
        </AiButton>
      </div>
      <AiErrorNote error={ai.error} />
      {out && (
        <Suggestion
          title={out.kind === 'rewrite' ? t({ en: 'Stronger version', bn: 'আরও জোরালো সংস্করণ' }) : t({ en: 'English version', bn: 'ইংরেজি সংস্করণ' })}
          onUse={() => { onApply(out.value); setOut(null); }}
          onClose={() => setOut(null)}
          useLabel={t({ en: 'Replace my text', bn: 'আমার লেখার জায়গায় বসান' })}
        >
          {out.value}
        </Suggestion>
      )}
      {ai.left !== null && <p className="mt-1 text-xs text-muted">{t({ en: `${ai.left} AI actions left today`, bn: `আজ আর ${ai.left}টি এআই কাজ বাকি` })}</p>}
    </div>
  );
}

/** Writes the professional summary from the rest of the CV. */
export function SummaryAi({ cv, target, onApply }: { cv: string; target: string; onApply: (v: string) => void }) {
  const { t } = useLang();
  const ai = useAiRunner();
  const [out, setOut] = useState('');
  const go = async () => {
    setOut('');
    const r = await ai.run('write-summary', { cv, target });
    if (r?.text) setOut(r.text);
  };
  return (
    <div>
      <AiButton busy={ai.busy} onClick={() => void go()}>
        {ai.busy ? t({ en: 'Writing…', bn: 'লেখা হচ্ছে…' }) : t({ en: 'Write my summary', bn: 'আমার সামারি লিখে দিন' })}
      </AiButton>
      <span className="ml-2 text-sm text-muted">{t({ en: 'Uses your experience and education below.', bn: 'নিচের অভিজ্ঞতা ও শিক্ষা থেকে লেখে।' })}</span>
      <AiErrorNote error={ai.error} />
      {out && <Suggestion title={t({ en: 'Suggested summary', bn: 'প্রস্তাবিত সামারি' })} onUse={() => { onApply(out); setOut(''); }} onClose={() => setOut('')}>{out}</Suggestion>}
    </div>
  );
}

/** Match the CV to a pasted job ad, and get specific ATS fixes. */
export function JobAi({ cv, issues }: { cv: string; issues: string[] }) {
  const { t } = useLang();
  const ai = useAiRunner();
  const [job, setJob] = useState('');
  const [open, setOpen] = useState(false);
  const [match, setMatch] = useState<{ items: string[]; keywords: string[] } | null>(null);
  const [fixes, setFixes] = useState<string[] | null>(null);

  return (
    <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-line">
      <button type="button" className="flex w-full items-center justify-between text-left font-semibold" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span><span aria-hidden="true">✨</span> {t({ en: 'AI: match this CV to a job', bn: 'এআই: চাকরির সাথে সিভি মেলান' })}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="label">{t({ en: 'Paste the job ad', bn: 'চাকরির বিজ্ঞাপন পেস্ট করুন' })}</span>
            <textarea className="field" rows={5} value={job} maxLength={5000} onChange={(e) => setJob(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <AiButton busy={ai.busy} onClick={async () => {
              const r = await ai.run('tailor-to-job', { cv, job });
              if (r) setMatch({ items: r.items ?? [], keywords: r.keywords ?? [] });
            }}>{t({ en: 'Suggest edits for this job', bn: 'এই চাকরির জন্য পরামর্শ দিন' })}</AiButton>
            <AiButton busy={ai.busy} onClick={async () => {
              const r = await ai.run('ats-score', { cv, issues });
              if (r) setFixes(r.items ?? []);
            }}>{t({ en: 'Fix my ATS problems', bn: 'এটিএস সমস্যা ঠিক করুন' })}</AiButton>
          </div>
          <AiErrorNote error={ai.error} />
          {match && (
            <Suggestion title={t({ en: 'Edits for this job', bn: 'এই চাকরির জন্য পরামর্শ' })} onClose={() => setMatch(null)}>
              {match.items.map((x, i) => <span key={i} className="mb-1 block">• {x}</span>)}
              {!!match.keywords.length && (
                <span className="mt-2 block text-sm"><strong>{t({ en: 'Missing keywords: ', bn: 'যে শব্দগুলো নেই: ' })}</strong>{match.keywords.join(', ')}</span>
              )}
            </Suggestion>
          )}
          {fixes && (
            <Suggestion title={t({ en: 'Fixes for your CV', bn: 'আপনার সিভির জন্য সমাধান' })} onClose={() => setFixes(null)}>
              {fixes.map((x, i) => <span key={i} className="mb-1 block">• {x}</span>)}
            </Suggestion>
          )}
          {ai.left !== null && <p className="text-xs text-muted">{t({ en: `${ai.left} AI actions left today`, bn: `আজ আর ${ai.left}টি এআই কাজ বাকি` })}</p>}
        </div>
      )}
    </div>
  );
}
