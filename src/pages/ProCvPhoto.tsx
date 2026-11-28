import { useEffect } from 'react';
import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { CvPhotoTool } from '../components/CvPhotoTool';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import {
  CVPHOTO_ANSWER, CVPHOTO_AUTHOR, CVPHOTO_COLOURS, CVPHOTO_COLOURS_HEADING, CVPHOTO_DOWNLOAD_NOTE, CVPHOTO_FAQ, CVPHOTO_H1, CVPHOTO_INTRO, CVPHOTO_LIMITS,
  CVPHOTO_MISTAKES, CVPHOTO_NOT, CVPHOTO_NOT_HEADING, CVPHOTO_PASSPORTSTYLE, CVPHOTO_PATH, CVPHOTO_PRIVACY, CVPHOTO_RELATED, CVPHOTO_SOURCES, CVPHOTO_STEPS,
  CVPHOTO_TAKE, CVPHOTO_TAKE_HEADING, CVPHOTO_TAKE_INTRO, CVPHOTO_UPDATED_LABEL,
} from '../../shared/cvPhotoContent';
import { routeSeo } from '../../shared/seo';
import { num } from '../lib/lang';

export function ProCvPhoto() {
  const { t, lang } = useLang();

  useEffect(() => {
    const s = routeSeo(CVPHOTO_PATH)!;
    setPageMeta(s.title, s.description, CVPHOTO_PATH);
  }, []);

  return (
    <>
      <PageHead crumbs={[TOOLS_CRUMB]} title={t(CVPHOTO_H1)} intro={t(CVPHOTO_INTRO)} />

      <CvPhotoTool />

      <div className="border-t border-line bg-mist">
        <div className="wrap grid gap-12 py-12">
          <section aria-labelledby="cvp-answer">
            <h2 id="cvp-answer" className="text-3xl">{t({ en: 'The short answer', bn: 'সংক্ষিপ্ত উত্তর' })}</h2>
            <p className="mt-4 max-w-3xl text-lg text-muted">{t(CVPHOTO_ANSWER)}</p>
          </section>

          <section aria-labelledby="cvp-how">
            <h2 id="cvp-how" className="text-3xl">{t({ en: 'How to make a professional CV photo', bn: 'প্রফেশনাল সিভি ছবি বানানোর ৪ ধাপ' })}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {CVPHOTO_STEPS.map((s, i) => (
                <li key={s.title.en} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-bold text-white">{num(i + 1, lang)}</span>
                  <p className="mt-3 font-display text-lg font-semibold">{t(s.title)}</p>
                  <p className="mt-1 text-muted">{t(s.body)}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-3xl text-sm text-muted">{t(CVPHOTO_DOWNLOAD_NOTE)}</p>
          </section>

          <section aria-labelledby="cvp-take">
            <h2 id="cvp-take" className="text-3xl">{t(CVPHOTO_TAKE_HEADING)}</h2>
            <p className="mt-3 max-w-3xl text-muted">{t(CVPHOTO_TAKE_INTRO)}</p>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_TAKE.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="cvp-colours">
            <h2 id="cvp-colours" className="text-3xl">{t(CVPHOTO_COLOURS_HEADING)}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_COLOURS.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="cvp-mistakes">
            <h2 id="cvp-mistakes" className="text-3xl">{t({ en: 'Common mistakes', bn: 'সাধারণ ভুল' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_MISTAKES.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
            <h3 className="mt-6 text-xl font-semibold">{t({ en: 'What the tool cannot do well', bn: 'টুল যা ভালো পারে না' })}</h3>
            <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_LIMITS.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="cvp-not">
            <h2 id="cvp-not" className="text-3xl">{t(CVPHOTO_NOT_HEADING)}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_NOT.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
            <p className="mt-4 max-w-3xl">
              <Link href="/tools/photo-signature-resizer" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' })}</Link>
              {' · '}
              <Link href="/tools/passport-size-photo-maker" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Passport size photo maker', bn: 'পাসপোর্ট সাইজ ছবি মেকার' })}</Link>
            </p>
          </section>

          <section aria-labelledby="cvp-ppstyle">
            <h2 id="cvp-ppstyle" className="text-3xl">{t(CVPHOTO_PASSPORTSTYLE.h2)}</h2>
            <p className="mt-4 max-w-3xl text-muted">{t(CVPHOTO_PASSPORTSTYLE.p)}</p>
          </section>

          <section aria-labelledby="cvp-privacy">
            <h2 id="cvp-privacy" className="text-3xl">{t({ en: 'Is my photo safe?', bn: 'আমার ছবি কি নিরাপদ?' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_PRIVACY.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="cvp-faq">
            <h2 id="cvp-faq" className="text-3xl">{t({ en: 'Questions about the CV photo maker', bn: 'সিভি ছবি মেকার নিয়ে প্রশ্ন' })}</h2>
            <div className="mt-6 max-w-3xl space-y-3">
              {CVPHOTO_FAQ.map((f) => (
                <details key={f.q.en} className="group rounded-2xl bg-white p-5 ring-1 ring-line">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">{t(f.q)}</summary>
                  <p className="mt-2 text-muted">{t(f.a)}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="cvp-sources">
            <h2 id="cvp-sources" className="text-3xl">{t({ en: 'Sources', bn: 'সূত্র' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {CVPHOTO_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-leaf underline underline-offset-4">{t(s.label)}</a>
                  {': '}{t(s.note)}
                </li>
              ))}
              <li>{t({ en: 'The photo tips on this page are general advice, not rules of any employer or form.', bn: 'এই পেজের ছবি-সংক্রান্ত পরামর্শ সাধারণ পরামর্শ, কোনো নিয়োগকর্তা বা ফর্মের নিয়ম নয়।' })}</li>
            </ul>
          </section>

          <section aria-labelledby="cvp-next">
            <h2 id="cvp-next" className="text-3xl">{t({ en: 'Related', bn: 'আরও দেখুন' })}</h2>
            <ul className="mt-4 space-y-2">
              {CVPHOTO_RELATED.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-semibold text-leaf underline underline-offset-4">{t(l.label)}</Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-muted">
            {t({ en: 'By ', bn: 'লেখক: ' })}
            <Link href={CVPHOTO_AUTHOR.url} className="underline underline-offset-4">{CVPHOTO_AUTHOR.name}</Link>
            {t({ en: `, Career Solutions. Last updated ${CVPHOTO_UPDATED_LABEL.en}.`, bn: `, Career Solutions। সর্বশেষ হালনাগাদ ${CVPHOTO_UPDATED_LABEL.bn}।` })}
          </p>
        </div>
      </div>
    </>
  );
}
