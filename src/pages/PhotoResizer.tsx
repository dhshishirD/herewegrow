import { useEffect, useState } from 'react';
import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { PhotoTool } from '../components/PhotoTool';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import {
  PHOTO_AUTHOR, PHOTO_FAQ, PHOTO_FIGURES_NOTE, PHOTO_FORMATS, PHOTO_INTRO, PHOTO_PRIVACY, PHOTO_RELATED, PHOTO_REJECTIONS, PHOTO_SECTIONS, PHOTO_SOURCES, PHOTO_STEPS, PHOTO_UPDATED_LABEL,
} from '../../shared/photoResizerContent';

export function PhotoResizer() {
  const { t, lang } = useLang();
  const [preset, setPreset] = useState('photo');

  useEffect(() => {
    const title = t({ en: 'Photo and signature resizer: job forms, passport size, KB', bn: 'ছবি ও স্বাক্ষর রিসাইজার: চাকরির ফর্ম, পাসপোর্ট সাইজ, KB' });
    const desc = t({
      en: 'Free photo and signature resizer: 300×300 and 300×80 for job forms, passport and stamp size, or a KB target. Runs in your browser.',
      bn: 'ফ্রি ছবি ও স্বাক্ষর রিসাইজার: চাকরির ফর্মের ৩০০×৩০০ ও ৩০০×৮০, পাসপোর্ট ও স্ট্যাম্প সাইজ, বা KB লক্ষ্য। ব্রাউজারেই চলে।',
    });
    setPageMeta(title, desc, '/tools/photo-signature-resizer');
  }, [t]);

  // Opening the page at an anchor such as #passport-size also picks that size in the tool
  useEffect(() => {
    const hit = PHOTO_SECTIONS.find((s) => s.id === window.location.hash.slice(1));
    if (hit) setPreset(hit.preset);
  }, []);

  const pickSize = (id: string) => {
    setPreset(id);
    document.getElementById('photo-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB]}
        title={t({ en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' })}
        intro={t(PHOTO_INTRO)}
      />

      <PhotoTool preset={preset} onPreset={setPreset} />

      <div className="border-t border-line bg-mist">
        <div className="wrap grid gap-12 py-12">
          <section aria-labelledby="photo-how">
            <h2 id="photo-how" className="text-3xl">{t({ en: 'How to resize your photo and signature', bn: 'ছবি ও স্বাক্ষর রিসাইজ করার নিয়ম' })}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {PHOTO_STEPS.map((s, i) => (
                <li key={s.title.en} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-bold text-white">{num(i + 1, lang)}</span>
                  <p className="mt-3 font-display text-lg font-semibold">{t(s.title)}</p>
                  <p className="mt-1 text-muted">{t(s.body)}</p>
                </li>
              ))}
            </ol>
          </section>

          {PHOTO_SECTIONS.map((sec) => (
            <section key={sec.id} id={sec.id} aria-labelledby={`${sec.id}-h`} className="scroll-mt-24">
              <h2 id={`${sec.id}-h`} className="text-3xl">{t(sec.h2)}</h2>
              {sec.p.map((p) => <p key={p.en} className="mt-4 max-w-3xl text-muted">{t(p)}</p>)}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button type="button" className="btn btn-primary" onClick={() => pickSize(sec.preset)}>
                  {t({ en: 'Use this size in the tool', bn: 'টুলে এই মাপ নিন' })}
                </button>
                {sec.more && (
                  <Link href={sec.more.href} className="font-semibold text-leaf underline underline-offset-4">{t(sec.more.label)}</Link>
                )}
              </div>
            </section>
          ))}

          <section aria-labelledby="photo-formats">
            <h2 id="photo-formats" className="text-3xl">{t({ en: 'Supported formats', bn: 'কোন ফরম্যাট চলবে' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PHOTO_FORMATS.map((f) => <li key={f.en}>{t(f)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="photo-privacy">
            <h2 id="photo-privacy" className="text-3xl">{t({ en: 'Is my photo safe?', bn: 'আমার ছবি কি নিরাপদ?' })}</h2>
            <p className="mt-4 max-w-3xl text-muted">{t(PHOTO_PRIVACY)}</p>
          </section>

          <section aria-labelledby="photo-rejected">
            <h2 id="photo-rejected" className="text-3xl">{t({ en: 'Why was my photo or signature rejected?', bn: 'ছবি বা স্বাক্ষর কেন বাতিল হয়?' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PHOTO_REJECTIONS.map((r) => <li key={r.en}>{t(r)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="photo-faq">
            <h2 id="photo-faq" className="text-3xl">{t({ en: 'Photo and signature questions', bn: 'ছবি ও স্বাক্ষর নিয়ে প্রশ্ন' })}</h2>
            <div className="mt-6 max-w-3xl space-y-3">
              {PHOTO_FAQ.map((f) => (
                <details key={f.q.en} className="group rounded-2xl bg-white p-5 ring-1 ring-line">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">{t(f.q)}</summary>
                  <p className="mt-2 text-muted">{t(f.a)}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="photo-sources">
            <h2 id="photo-sources" className="text-3xl">{t({ en: 'Sources', bn: 'সূত্র' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PHOTO_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-leaf underline underline-offset-4">{t(s.label)}</a>
                  {': '}{t(s.note)}
                </li>
              ))}
              <li>{t(PHOTO_FIGURES_NOTE)}</li>
              <li>{t({ en: 'Sizes can differ from portal to portal. Always check your own circular or form.', bn: 'পোর্টালভেদে মাপ আলাদা হতে পারে। সবসময় নিজের বিজ্ঞপ্তি বা ফর্ম দেখুন।' })}</li>
            </ul>
          </section>

          <section aria-labelledby="photo-next">
            <h2 id="photo-next" className="text-3xl">{t({ en: 'Next steps for your application', bn: 'আবেদনের পরের ধাপ' })}</h2>
            <ul className="mt-4 space-y-2">
              {PHOTO_RELATED.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-semibold text-leaf underline underline-offset-4">{t(l.label)}</Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-muted">
            {t({ en: 'By ', bn: 'লেখক: ' })}
            <Link href={PHOTO_AUTHOR.url} className="underline underline-offset-4">{PHOTO_AUTHOR.name}</Link>
            {t({ en: `, Career Solutions. Last updated ${PHOTO_UPDATED_LABEL.en}.`, bn: `, Career Solutions। সর্বশেষ হালনাগাদ ${PHOTO_UPDATED_LABEL.bn}।` })}
          </p>
        </div>
      </div>
    </>
  );
}
