import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { useEffect, useMemo, useState } from 'react';
import { buildLetter, emptyLetter, missingFields, type LetterInput, type LetterKind, type LetterLang } from '../lib/applicationLetter';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

type Field = { key: keyof LetterInput; label: { en: string; bn: string }; rows?: number; req?: boolean };

const FIELDS: Field[] = [
  { key: 'name', label: { en: 'Your name', bn: 'আপনার নাম' }, req: true },
  { key: 'post', label: { en: 'Post you are applying for', bn: 'যে পদে আবেদন' }, req: true },
  { key: 'org', label: { en: 'Organisation', bn: 'প্রতিষ্ঠানের নাম' }, req: true },
  { key: 'orgAddress', label: { en: 'Organisation address (optional)', bn: 'প্রতিষ্ঠানের ঠিকানা (ঐচ্ছিক)' } },
  { key: 'source', label: { en: 'Where you saw the circular (e.g. BDJobs)', bn: 'বিজ্ঞপ্তি কোথায় দেখেছেন (যেমন বিডিজবস)' } },
  { key: 'education', label: { en: 'Education', bn: 'শিক্ষাগত যোগ্যতা' }, rows: 2 },
  { key: 'experience', label: { en: 'Experience', bn: 'অভিজ্ঞতা' }, rows: 2 },
  { key: 'strengths', label: { en: 'Skills or strengths (private jobs)', bn: 'দক্ষতা বা শক্তির জায়গা (বেসরকারি চাকরি)' }, rows: 2 },
  { key: 'address', label: { en: 'Your address', bn: 'আপনার ঠিকানা' } },
  { key: 'phone', label: { en: 'Mobile', bn: 'মোবাইল' } },
  { key: 'email', label: { en: 'Email', bn: 'ইমেইল' } },
  { key: 'date', label: { en: 'Date', bn: 'তারিখ' } },
];

export function ApplicationLetter() {
  const { t, lang } = useLang();
  const [form, setForm] = useState<LetterInput>(() => emptyLetter(lang));
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageMeta(
      t({ en: 'Free application letter generator (Bangla and English)', bn: 'ফ্রি আবেদনপত্র জেনারেটর (বাংলা ও ইংরেজি)' }),
      t({
        en: 'Write a job application letter in minutes: government or private job, Bangla or English. Copy it or download a Word file. Free.',
        bn: 'সরকারি বা বেসরকারি চাকরির আবেদনপত্র মিনিটেই লিখুন, বাংলা বা ইংরেজিতে। কপি করুন বা Word ফাইল নামান। ফ্রি।',
      }),
      '/tools/application-letter',
    );
  }, [t]);

  const set = (k: keyof LetterInput, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const missing = useMemo(() => missingFields(form), [form]);

  const generate = () => {
    if (missing.length) {
      setError(t({ en: 'Please fill your name, the post and the organisation.', bn: 'আপনার নাম, পদ ও প্রতিষ্ঠানের নাম দিন।' }));
      return;
    }
    setError(null);
    setText(buildLetter(form));
    track('letter_generate', { kind: form.kind, lang: form.lang });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t({ en: 'Could not copy. Select the text and copy it.', bn: 'কপি হয়নি। লেখা সিলেক্ট করে কপি করুন।' }));
    }
  };

  const word = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    const bn = form.lang === 'bn';
    const font = bn ? 'Nirmala UI' : 'Times New Roman';
    const doc = new Document({
      styles: { default: { document: { run: { font: { ascii: font, hAnsi: font, cs: 'Nirmala UI' }, size: 24 } } } },
      sections: [{
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: text.split('\n').map((line) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun(line)] })),
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application-letter.docx';
    a.click();
    URL.revokeObjectURL(url);
    track('letter_word');
  };

  const choice = <T extends string>(value: T, current: T, label: { en: string; bn: string }, on: (v: T) => void) => (
    <button type="button" aria-pressed={value === current} onClick={() => on(value)}
      className={`rounded-lg px-4 py-2 font-display font-semibold ${value === current ? 'bg-white text-leaf shadow-sm' : 'text-muted'}`}>
      {t(label)}
    </button>
  );

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB]}
        title={t({ en: 'Application letter generator', bn: 'আবেদনপত্র জেনারেটর' })}
        intro={t({
          en: 'Fill a few details and get a neat application letter for a government or private job, in Bangla or English. Edit it, copy it or download a Word file. Nothing is sent anywhere.',
          bn: 'কয়েকটি তথ্য দিলেই সরকারি বা বেসরকারি চাকরির গোছানো আবেদনপত্র পাবেন, বাংলা বা ইংরেজিতে। এডিট করুন, কপি করুন বা Word ফাইল নামান। কিছুই কোথাও পাঠানো হয় না।',
        })}
      />
      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <div role="group" aria-label={t({ en: 'Job type', bn: 'চাকরির ধরন' })} className="inline-flex rounded-lg bg-mist p-1">
              {choice<LetterKind>('private', form.kind, { en: 'Private job', bn: 'বেসরকারি' }, (v) => set('kind', v))}
              {choice<LetterKind>('govt', form.kind, { en: 'Govt job', bn: 'সরকারি' }, (v) => set('kind', v))}
            </div>
            <div role="group" aria-label={t({ en: 'Letter language', bn: 'চিঠির ভাষা' })} className="inline-flex rounded-lg bg-mist p-1">
              {choice<LetterLang>('bn', form.lang, { en: 'বাংলা', bn: 'বাংলা' }, (v) => set('lang', v))}
              {choice<LetterLang>('en', form.lang, { en: 'English', bn: 'English' }, (v) => set('lang', v))}
            </div>
          </div>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label" htmlFor={`lt-${f.key}`}>{t(f.label)}{f.req ? ' *' : ''}</label>
              {f.rows ? (
                <textarea id={`lt-${f.key}`} rows={f.rows} className="field" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <input id={`lt-${f.key}`} className="field" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              )}
            </div>
          ))}
          {error && <p role="alert" className="rounded-lg bg-alert/10 px-4 py-3 text-alert">{error}</p>}
          <button type="button" className="btn btn-primary" onClick={generate}>{t({ en: 'Write my letter', bn: 'চিঠি লিখুন' })}</button>
        </div>
        <div>
          {text ? (
            <>
              <label className="label" htmlFor="lt-out">{t({ en: 'Your letter (you can edit it)', bn: 'আপনার চিঠি (এডিট করা যাবে)' })}</label>
              <textarea id="lt-out" rows={22} className="field leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} />
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={copy}>{copied ? t({ en: 'Copied', bn: 'কপি হয়েছে' }) : t({ en: 'Copy', bn: 'কপি' })}</button>
                <button type="button" className="btn btn-quiet" onClick={word}>{t({ en: 'Download Word file', bn: 'Word ফাইল নামান' })}</button>
              </div>
              <p className="mt-6 text-muted">
                {t({ en: 'A letter alone is not enough. ', bn: 'শুধু চিঠিতে হয় না। ' })}
                <Link href="/builder" className="font-semibold text-leaf underline">{t({ en: 'Build a matching CV, free.', bn: 'মানানসই সিভি বানান, ফ্রি।' })}</Link>
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-line p-6 text-muted">
              {t({ en: 'Your letter will appear here after you fill the form and press "Write my letter".', bn: 'ফর্ম পূরণ করে "চিঠি লিখুন" চাপলে আপনার চিঠি এখানে আসবে।' })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
