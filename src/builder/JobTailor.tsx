import { useMemo, useState } from 'react';
import { MatchRequirements } from '../components/MatchRequirements';
import { matchCv } from '../lib/jobMatch';
import { num } from '../lib/lang';
import { track } from '../lib/track';
import { copyTitle, guessJobTitle } from './tailor';

type T = (s: { en: string; bn: string }) => string;
export type CopyResult = 'ok' | 'login' | 'limit' | 'error';

/** Paste a job ad, see what the CV is missing, add true words in one tap, and keep a separate copy for that job. */
export function JobTailor({ cv, name, lang, t, onAddSkill, onSaveCopy }: {
  cv: string;
  name: string;
  lang: 'en' | 'bn';
  t: T;
  onAddSkill: (term: string) => void;
  onSaveCopy: (title: string) => Promise<CopyResult>;
}) {
  const [ad, setAd] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const long = ad.trim().split(/\s+/).filter(Boolean).length >= 15;
  // Re-runs as the CV changes, so the score moves while the person adds words.
  const r = useMemo(() => (long ? matchCv(cv, ad) : null), [cv, ad, long]);
  const tone = !r ? '' : r.score >= 70 ? 'text-leaf' : r.score >= 40 ? 'text-gold' : 'text-alert';

  const save = async () => {
    setBusy(true);
    setNote(null);
    const res = await onSaveCopy(copyTitle(guessJobTitle(ad), name));
    setBusy(false);
    track('tailor_save_copy', { result: res });
    setNote(
      res === 'ok' ? { ok: true, text: t({ en: 'Copy saved and opened. Your first CV is untouched. Edit this one for the job.', bn: 'কপি সেভ হয়ে খুলেছে। আপনার প্রথম সিভি অক্ষত আছে। এই কপিটি চাকরির জন্য বদলান।' }) }
      : res === 'login' ? null
      : res === 'limit' ? { ok: false, text: t({ en: 'Free accounts keep 1 saved CV. Pro keeps up to 20, one for each job.', bn: 'ফ্রি অ্যাকাউন্টে ১টি সিভি সেভ থাকে। Pro-তে ২০টি পর্যন্ত, প্রতি চাকরির জন্য একটি।' }) }
      : { ok: false, text: t({ en: 'Could not save. Check your connection and try again.', bn: 'সেভ হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।' }) },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {t({
          en: 'Applying to many jobs with one CV? Paste the job ad. You will see which of its key words your CV lacks. Add only what is true for you.',
          bn: 'এক সিভি বহু জায়গায় পাঠাচ্ছেন? চাকরির বিজ্ঞাপন পেস্ট করুন। দেখবেন তার কোন মূল শব্দ আপনার সিভিতে নেই। যেটা আপনার ক্ষেত্রে সত্য, শুধু সেটাই যোগ করুন।',
        })}
      </p>
      <label className="block">
        <span className="label">{t({ en: 'Job ad (paste the text)', bn: 'চাকরির বিজ্ঞাপন (টেক্সট পেস্ট করুন)' })}</span>
        <textarea className="field" data-native-undo rows={6} value={ad} onChange={(e) => setAd(e.target.value)} onFocus={() => track('tailor_open')} />
      </label>
      {ad.trim() && !long && <p className="text-sm text-muted" role="status">{t({ en: 'Paste the whole ad, at least a few lines.', bn: 'পুরো বিজ্ঞাপন দিন, অন্তত কয়েক লাইন।' })}</p>}
      {r && (
        <div className="rounded-2xl border border-line p-4" aria-live="polite">
          <div className="flex items-end gap-3 border-b border-line pb-3">
            <p className={`font-display text-5xl font-bold leading-none ${tone}`}>{num(r.score, lang)}%</p>
            <p className="pb-1 text-sm text-muted">{t({ en: 'of the ad’s key words are in your CV', bn: 'বিজ্ঞাপনের মূল শব্দের এতটা আপনার সিভিতে আছে' })}</p>
          </div>
          <MatchRequirements items={r.requirements} t={t} lang={lang} />
          {r.missing.length > 0 ? (
            <div className="mt-3">
              <h3 className="text-base font-semibold">{t({ en: 'Missing. Tap to add to your skills if true:', bn: 'নেই। সত্য হলে ট্যাপ করে দক্ষতায় যোগ করুন:' })}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {r.missing.map((k) => (
                  <li key={k.term}>
                    <button type="button" className={`rounded-full px-3 py-1 text-sm font-semibold ${k.must ? 'bg-gold-soft ring-1 ring-gold' : 'bg-mist'}`} onClick={() => { onAddSkill(k.term); track('tailor_add_term'); }}>
                      + {k.term}{k.must ? ' ★' : ''}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm">{t({ en: 'Your CV already has the ad’s key words.', bn: 'বিজ্ঞাপনের মূল শব্দ আপনার সিভিতে আছে।' })}</p>
          )}
          {r.found.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {r.found.map((k) => <li key={k.term} className="rounded-full bg-leaf-soft px-3 py-1 text-sm font-semibold">{k.term}</li>)}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">{t({ en: 'A keyword guide, not a hiring verdict.', bn: 'এটি কীওয়ার্ডের দিকনির্দেশ, নিয়োগের রায় নয়।' })}</p>
          <div className="mt-4">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
              {busy ? t({ en: 'Saving…', bn: 'সেভ হচ্ছে…' }) : t({ en: 'Save a separate copy for this job', bn: 'এই চাকরির জন্য আলাদা কপি সেভ করুন' })}
            </button>
            {note && <p role="status" className={`mt-2 text-sm ${note.ok ? 'text-leaf' : 'text-alert'}`}>{note.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
