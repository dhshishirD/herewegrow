import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { useEffect, useState } from 'react';
import { matchCv, type MatchResult } from '../lib/jobMatch';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

export function JobMatch() {
  const { t, lang } = useLang();
  const [cv, setCv] = useState('');
  const [ad, setAd] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    setPageMeta(
      t({ en: 'Free CV vs job ad match checker', bn: 'ফ্রি সিভি বনাম চাকরির বিজ্ঞাপন ম্যাচ চেকার' }),
      t({
        en: 'Paste a job ad and your CV to see which keywords you are missing. Free, runs in your browser.',
        bn: 'চাকরির বিজ্ঞাপন ও আপনার সিভি দিয়ে দেখুন কোন কীওয়ার্ড বাদ পড়েছে। ফ্রি, আপনার ব্রাউজারেই চলে।',
      }),
      '/tools/job-match',
    );
  }, [t]);

  const onPdf = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError(t({ en: 'Choose a PDF, or paste your CV text.', bn: 'PDF বেছে নিন, অথবা সিভির টেক্সট পেস্ট করুন।' }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(t({ en: 'This file is larger than 8 MB.', bn: 'ফাইলটি ৮ MB-এর বেশি।' }));
      return;
    }
    setBusy(true);
    try {
      const { readPdf } = await import('../lib/pdfText');
      setCv((await readPdf(file)).text);
      setFileName(file.name);
    } catch {
      setError(t({ en: 'This PDF could not be read. Paste the text instead.', bn: 'PDF পড়া যায়নি। টেক্সট পেস্ট করুন।' }));
    }
    setBusy(false);
  };

  const run = () => {
    setError(null);
    if (cv.trim().split(/\s+/).length < 20) {
      setError(t({ en: 'Add your CV first: upload a PDF or paste the text.', bn: 'আগে সিভি দিন: PDF আপলোড করুন বা টেক্সট পেস্ট করুন।' }));
      return;
    }
    if (ad.trim().split(/\s+/).length < 15) {
      setError(t({ en: 'Paste the whole job ad, at least a few lines.', bn: 'পুরো চাকরির বিজ্ঞাপন পেস্ট করুন, অন্তত কয়েক লাইন।' }));
      return;
    }
    const r = matchCv(cv, ad);
    setResult(r);
    track('job_match', { score: r.score });
  };

  const tone = !result ? '' : result.score >= 70 ? 'text-leaf' : result.score >= 40 ? 'text-gold' : 'text-alert';

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB]}
        title={t({ en: 'CV vs job ad match', bn: 'সিভি বনাম চাকরির বিজ্ঞাপন ম্যাচ' })}
        intro={t({
          en: 'Recruiters and ATS software look for the words in the job ad. Paste the ad and your CV to see which important words your CV is missing. Nothing leaves your browser.',
          bn: 'রিক্রুটার ও ATS সফটওয়্যার বিজ্ঞাপনের শব্দগুলো খোঁজে। বিজ্ঞাপন ও সিভি দিলে দেখবেন কোন গুরুত্বপূর্ণ শব্দ আপনার সিভিতে নেই। কিছুই আপনার ব্রাউজারের বাইরে যায় না।',
        })}
      />
      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div>
            <label className="label" htmlFor="jm-ad">{t({ en: '1. Job ad (paste the text)', bn: '১. চাকরির বিজ্ঞাপন (টেক্সট পেস্ট করুন)' })}</label>
            <textarea id="jm-ad" rows={8} className="field" value={ad} onChange={(e) => setAd(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="jm-file">{t({ en: '2. Your CV (PDF)', bn: '২. আপনার সিভি (PDF)' })}</label>
            <input id="jm-file" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e) => onPdf(e.target.files?.[0])} className="field" />
            {busy && <p className="mt-2 text-muted" role="status">{t({ en: 'Reading your CV…', bn: 'সিভি পড়া হচ্ছে…' })}</p>}
            {fileName && !busy && <p className="mt-2 text-sm text-muted">{fileName}</p>}
          </div>
          <div>
            <label className="label" htmlFor="jm-cv">{t({ en: 'Or paste your CV text', bn: 'অথবা সিভির টেক্সট পেস্ট করুন' })}</label>
            <textarea id="jm-cv" rows={6} className="field" value={cv} onChange={(e) => { setCv(e.target.value); setFileName(''); }} />
          </div>
          {error && <p role="alert" className="rounded-lg bg-alert/10 px-4 py-3 text-alert">{error}</p>}
          <button type="button" className="btn btn-primary" onClick={run}>{t({ en: 'Check the match', bn: 'ম্যাচ দেখুন' })}</button>
        </div>

        <div>
          {!result ? (
            <div className="rounded-2xl border border-line p-6 text-muted">
              {t({ en: 'Your match score and the missing keywords will appear here.', bn: 'আপনার ম্যাচ স্কোর ও বাদ পড়া কীওয়ার্ড এখানে আসবে।' })}
            </div>
          ) : (
            <div className="rounded-2xl border border-line p-6" aria-live="polite">
              <div className="flex items-end gap-4 border-b border-line pb-5">
                <p className={`font-display text-7xl font-bold leading-none ${tone}`}>{num(result.score, lang)}%</p>
                <p className="pb-1 text-muted">{t({ en: 'of the ad’s key words are in your CV.', bn: 'বিজ্ঞাপনের মূল শব্দের এতটা আপনার সিভিতে আছে।' })}</p>
              </div>
              {result.missing.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-xl">{t({ en: 'Missing from your CV', bn: 'আপনার সিভিতে নেই' })}</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {result.missing.map((k) => <li key={k.term} className="rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold">{k.term}</li>)}
                  </ul>
                  <p className="mt-3 text-sm text-muted">{t({ en: 'Add a word only if it is true for you: in your summary, skills or a job entry.', bn: 'শব্দটি আপনার ক্ষেত্রে সত্য হলেই যোগ করুন: সারসংক্ষেপ, দক্ষতা বা কাজের বিবরণে।' })}</p>
                </div>
              )}
              {result.found.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-xl">{t({ en: 'Already in your CV', bn: 'সিভিতে আছে' })}</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {result.found.map((k) => <li key={k.term} className="rounded-full bg-leaf-soft px-3 py-1 text-sm font-semibold">{k.term}</li>)}
                  </ul>
                </div>
              )}
              <p className="mt-5 text-sm text-muted">{t({ en: 'This is a keyword guide, not a hiring verdict. Similar words with different endings may be counted as different.', bn: 'এটি কীওয়ার্ডের একটি দিকনির্দেশ, নিয়োগের রায় নয়। একই অর্থের ভিন্ন রূপের শব্দ আলাদা গণ্য হতে পারে।' })}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/builder" className="btn btn-primary">{t({ en: 'Edit my CV in the builder', bn: 'বিল্ডারে সিভি ঠিক করুন' })}</Link>
                <Link href="/services" className="btn btn-quiet">{t({ en: 'Have an expert tailor it', bn: 'বিশেষজ্ঞকে দিয়ে মানিয়ে নিন' })}</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
