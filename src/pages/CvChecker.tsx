import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { useEffect, useState } from 'react';
import { findProduct } from '../../shared/catalog';
import { useCheckout } from '../components/Checkout';
import { analyzeCv, type Analysis, type Layout } from '../lib/cvAnalysis';
import { num, taka, useLang } from '../lib/lang';
import { navigate } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

type Mode = 'pdf' | 'text';

export function CvChecker() {
  const { t, lang } = useLang();
  const order = useCheckout();
  const [mode, setMode] = useState<Mode>('pdf');
  const [pasted, setPasted] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [cvText, setCvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [drag, setDrag] = useState(false);
  const review = findProduct('cv-review');

  useEffect(() => {
    setPageMeta(
      t({ en: 'Free CV checker: ATS score and fixes', bn: 'ফ্রি সিভি চেকার: ATS স্কোর ও সংশোধন' }),
      t({
        en: 'Check your CV for free. Get a score out of 100 and the exact fixes for ATS software and recruiters in Bangladesh.',
        bn: 'বিনামূল্যে সিভি চেক করুন। ১০০-এর মধ্যে স্কোর এবং ATS সফটওয়্যার ও রিক্রুটারদের জন্য কী ঠিক করতে হবে তা দেখুন।',
      }),
      '/tools/cv-checker',
    );
  }, [t]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setResult(null);
    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isDocx = lowerName.endsWith('.docx');
    if (!isPdf && !isDocx) {
      setError(
        lowerName.endsWith('.doc')
          ? t({ en: 'Old .doc files are not supported. Open it in Word and save as .docx or PDF, or paste the text instead.', bn: 'পুরনো .doc ফাইল পড়া যায় না। Word-এ খুলে .docx বা PDF হিসেবে সেভ করুন, অথবা টেক্সট পেস্ট করুন।' })
          : t({ en: 'Choose a PDF or Word (.docx) file, or paste the text instead.', bn: 'PDF বা Word (.docx) ফাইল বেছে নিন, অথবা টেক্সট পেস্ট করুন।' }),
      );
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(t({ en: 'This file is larger than 8 MB. A CV file is usually under 1 MB.', bn: 'ফাইলটি ৮ MB-এর বেশি। সিভির ফাইল সাধারণত ১ MB-এর কম হয়।' }));
      return;
    }
    setBusy(true);
    setFileName(file.name);
    try {
      let read: { text: string; layout: Layout };
      if (isPdf) {
        const { readPdf } = await import('../lib/pdfText');
        read = await readPdf(file);
      } else {
        const { readDocx } = await import('../lib/docxText');
        read = await readDocx(file);
      }
      const r = analyzeCv(read.text, read.layout);
      setCvText(read.text);
      setResult(r);
      track('checker_score', { score: r.score });
    } catch {
      setError(
        isPdf
          ? t({ en: 'This PDF could not be read. It may be password-protected. Try pasting the text instead.', bn: 'PDF-টি পড়া যায়নি। হয়তো পাসওয়ার্ড দেওয়া। টেক্সট পেস্ট করে চেষ্টা করুন।' })
          : t({ en: 'This Word file could not be read. It may be damaged or password-protected. Save it again as .docx or PDF, or paste the text instead.', bn: 'Word ফাইলটি পড়া যায়নি। হয়তো নষ্ট বা পাসওয়ার্ড দেওয়া। আবার .docx বা PDF হিসেবে সেভ করুন, অথবা টেক্সট পেস্ট করুন।' }),
      );
    }
    setBusy(false);
  };

  const onText = () => {
    setError(null);
    if (pasted.trim().split(/\s+/).length < 30) {
      setError(t({ en: 'Paste your whole CV, at least a few paragraphs.', bn: 'পুরো সিভি পেস্ট করুন, অন্তত কয়েক অনুচ্ছেদ।' }));
      return;
    }
    const r = analyzeCv(pasted, { fromPdf: false, splitRowShare: 0 });
    setCvText(pasted);
    setResult(r);
    track('checker_score', { score: r.score });
  };

  const openInBuilder = () => {
    try { sessionStorage.setItem('hwg_checker_text', cvText); } catch { /* storage blocked: the builder opens empty */ }
    navigate('/builder?from=checker');
  };

  const failed = result?.checks.filter((c) => !c.pass) ?? [];
  const passed = result?.checks.filter((c) => c.pass) ?? [];
  const tone = !result ? '' : result.score >= 80 ? 'text-leaf' : result.score >= 55 ? 'text-gold' : 'text-alert';
  const verdict = !result
    ? null
    : result.score >= 80
      ? t({ en: 'Strong. A few small fixes will make it even better.', bn: 'ভালো। ছোট কয়েকটি সংশোধনে আরও ভালো হবে।' })
      : result.score >= 55
        ? t({ en: 'Good start, but recruiters may pass over it. Fix the points below.', bn: 'ভালো শুরু, তবে রিক্রুটাররা এড়িয়ে যেতে পারেন। নিচের বিষয়গুলো ঠিক করুন।' })
        : t({ en: 'This CV is likely to be filtered out. It needs real work.', bn: 'এই সিভি ছাঁটাই হওয়ার সম্ভাবনা বেশি। ভালোভাবে কাজ করা দরকার।' });

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB]}
        title={t({ en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' })}
        intro={t({
              en: 'See how your CV reads to ATS software and to a recruiter, with a score out of 100 and the exact fixes. Your file is read in your browser and never uploaded.',
              bn: 'ATS সফটওয়্যার ও রিক্রুটারের চোখে আপনার সিভি কেমন, তা ১০০-এর মধ্যে স্কোর ও নির্দিষ্ট সংশোধনসহ দেখুন। ফাইলটি আপনার ব্রাউজারেই পড়া হয়, কোথাও আপলোড হয় না।',
            })}
      />

      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <div role="tablist" aria-label={t({ en: 'How to add your CV', bn: 'সিভি কীভাবে দেবেন' })} className="inline-flex rounded-lg bg-mist p-1">
            {(['pdf', 'text'] as Mode[]).map((m) => (
              <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => setMode(m)}
                className={`rounded-md px-4 py-2 font-display font-semibold ${mode === m ? 'bg-white text-leaf shadow-sm' : 'text-muted'}`}>
                {m === 'pdf' ? t({ en: 'Upload CV', bn: 'সিভি আপলোড' }) : t({ en: 'Paste text', bn: 'টেক্সট পেস্ট' })}
              </button>
            ))}
          </div>

          {mode === 'pdf' ? (
            <div className="mt-6">
              <label className="label" htmlFor="cv-file">{t({ en: 'Your CV (PDF or Word)', bn: 'আপনার সিভি (PDF বা Word)' })}</label>
              <label
                htmlFor="cv-file"
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); void onFile(e.dataTransfer.files?.[0]); }}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-leaf ${drag ? 'border-leaf bg-leaf-soft' : 'border-line bg-mist hover:border-leaf'}`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 text-leaf"><path d="M12 16V4m0 0L7 9m5-5l5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="font-display text-lg font-semibold">{busy ? t({ en: 'Reading your CV…', bn: 'সিভি পড়া হচ্ছে…' }) : t({ en: 'Drop your CV here, or tap to choose', bn: 'সিভি এখানে ফেলুন, অথবা চেপে বেছে নিন' })}</span>
                <span className="text-sm text-muted">{fileName || t({ en: 'PDF or Word (.docx), up to 8 MB', bn: 'PDF বা Word (.docx), ৮ MB পর্যন্ত' })}</span>
                <input id="cv-file" type="file" accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={busy} onChange={(e) => void onFile(e.target.files?.[0])} className="sr-only" />
              </label>
              <p className="mt-2 text-sm text-muted">
                {t({ en: 'Use the same file you send to employers. Word files are checked for layout too.', bn: 'নিয়োগকর্তাকে যে ফাইল পাঠান, সেটিই দিন। Word ফাইলেও লেআউট চেক হয়।' })}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <label className="label" htmlFor="cv-text">{t({ en: 'Paste your CV text', bn: 'সিভির টেক্সট পেস্ট করুন' })}</label>
              <textarea id="cv-text" rows={10} className="field" value={pasted} onChange={(e) => setPasted(e.target.value)} />
              <button type="button" className="btn btn-primary mt-3" onClick={onText}>{t({ en: 'Check my CV', bn: 'সিভি চেক করুন' })}</button>
              <p className="mt-2 text-sm text-muted">{t({ en: 'Layout checks need a PDF or Word file; pasted text checks content only.', bn: 'লেআউট চেকের জন্য PDF বা Word ফাইল লাগবে; পেস্ট করা টেক্সটে শুধু কনটেন্ট চেক হয়।' })}</p>
            </div>
          )}

          {busy && <p className="mt-4 text-muted" role="status">{t({ en: 'Reading your CV…', bn: 'সিভি পড়া হচ্ছে…' })}</p>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-alert/10 px-4 py-3 text-alert">{error}</p>}

          <p className="mt-8 text-sm text-muted">
            {t({
              en: 'This is an automatic check of common problems. It cannot judge everything a recruiter sees, such as how well your experience fits a role.',
              bn: 'এটি সাধারণ সমস্যার স্বয়ংক্রিয় চেক। আপনার অভিজ্ঞতা পদের সাথে কতটা মেলে, এমন সব বিষয় এটি বিচার করতে পারে না।',
            })}
          </p>
        </div>

        <div aria-live="polite">
          {!result ? (
            <div className="rounded-2xl border border-line p-6" aria-label={t({ en: 'Example result', bn: 'উদাহরণ ফল' })}>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t({ en: 'Example result', bn: 'উদাহরণ ফল' })}</p>
              <div className="mt-3 flex items-end gap-4 border-b border-line pb-4">
                <p className="font-display text-6xl font-bold leading-none text-gold">{num(64, lang)}</p>
                <p className="pb-1 text-muted">{t({ en: 'out of 100. Good start, but recruiters may pass over it.', bn: '১০০-এর মধ্যে। ভালো শুরু, তবে রিক্রুটাররা এড়িয়ে যেতে পারেন।' })}</p>
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  { en: 'Add a short summary at the top', bn: 'উপরে ছোট একটি সামারি যোগ করুন' },
                  { en: 'Put numbers in your job points (200 students, 30% growth)', bn: 'কাজের বিবরণে সংখ্যা দিন (২০০ ছাত্র, ৩০% বৃদ্ধি)' },
                  { en: 'Add your LinkedIn link next to your email', bn: 'ইমেইলের পাশে LinkedIn লিংক যোগ করুন' },
                ].map((x) => <li key={x.en} className="border-l-[3px] border-gold pl-4 text-muted">{t(x)}</li>)}
              </ul>
              <p className="mt-4 text-sm text-muted">{t({ en: 'Upload your CV on the left to see your own score and fixes.', bn: 'আপনার নিজের স্কোর ও সংশোধন দেখতে বাঁ দিকে সিভি দিন।' })}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-5 border-b border-line pb-6">
                <p className={`font-display text-7xl font-bold leading-none ${tone}`}>{num(result.score, lang)}</p>
                <div className="pb-1">
                  <p className="font-display font-semibold">{t({ en: 'out of 100', bn: '১০০-এর মধ্যে' })}</p>
                  <p className="text-muted">{verdict}</p>
                </div>
              </div>

              {failed.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold">{t({ en: `Fix these (${failed.length})`, bn: `যা ঠিক করবেন (${num(failed.length, 'bn')})` })}</h2>
                  <ul className="mt-3 space-y-4">
                    {failed.map((c) => (
                      <li key={c.id} className="border-l-[3px] border-gold pl-4">
                        <p className="font-display font-semibold">{t(c.title)}</p>
                        <p className="text-muted">{t(c.fix)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {passed.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold">{t({ en: 'Already good', bn: 'যা ঠিক আছে' })}</h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {passed.map((c) => (
                      <li key={c.id} className="rounded-full bg-leaf-soft px-3 py-1 text-sm font-medium text-leaf-dark">✓ {t(c.title)}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 rounded-2xl bg-leaf-soft p-6">
                <p className="font-display text-xl font-bold text-leaf-dark">{t({ en: 'Fix it yourself, free', bn: 'নিজেই ঠিক করুন, ফ্রি' })}</p>
                <p className="mt-1 text-leaf-dark/80">
                  {t({
                    en: 'Open this CV in the builder. Your details are filled in, so you only fix the points above and download.',
                    bn: 'এই সিভি বিল্ডারে খুলুন। আপনার তথ্য আগে থেকেই বসানো থাকবে, শুধু উপরের বিষয়গুলো ঠিক করে ডাউনলোড করুন।',
                  })}
                </p>
                <button type="button" className="btn btn-primary mt-4" onClick={openInBuilder}>
                  {t({ en: 'Open in the CV builder', bn: 'সিভি বিল্ডারে খুলুন' })}
                </button>
              </div>

              {review && (
                <div className="mt-8 rounded-2xl bg-leaf-dark p-6 text-white">
                  <p className="font-display text-xl font-bold">
                    {t({ en: 'Want an expert to fix it with you?', bn: 'বিশেষজ্ঞকে দিয়ে ঠিক করাতে চান?' })}
                  </p>
                  <p className="mt-1 text-white/80">
                    {t({
                      en: 'A CV review gives written feedback on every section and 5 rewritten lines, within 24 hours.',
                      bn: 'সিভি রিভিউতে প্রতিটি অংশের লিখিত মতামত ও ৫টি নতুন লাইন পাবেন, ২৪ ঘণ্টার মধ্যে।',
                    })}
                  </p>
                  <button type="button" className="btn mt-4 bg-white text-leaf-dark hover:bg-leaf-soft" onClick={() => order('cv-review')}>
                    {t({ en: `Get a CV review for ${taka(review.price, 'en')}`, bn: `${taka(review.price, 'bn')}-এ সিভি রিভিউ নিন` })}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
