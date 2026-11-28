import { useEffect, useState } from 'react';
import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { PhotoTool } from '../components/PhotoTool';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import {
  PASSPORT_AUTHOR, PASSPORT_FAQ, PASSPORT_INTRO, PASSPORT_MISTAKES, PASSPORT_PATH, PASSPORT_RELATED, PASSPORT_SIZE_NOTE, PASSPORT_SIZE_TABLE,
  PASSPORT_SOURCES, PASSPORT_STEPS, PASSPORT_TAKE, PASSPORT_UPDATED_LABEL,
} from '../../shared/passportPhotoContent';

export function PassportPhotoMaker() {
  const { t, lang } = useLang();
  const [preset, setPreset] = useState('passport');

  useEffect(() => {
    setPageMeta(
      t({ en: 'Passport size photo maker online, free', bn: 'পাসপোর্ট সাইজ ছবি মেকার অনলাইনে, ফ্রি' }),
      t({ en: 'Make a passport size photo online: 35×45 mm, stamp size, 2×2 inch. Free, in your browser, nothing uploaded.', bn: 'অনলাইনে পাসপোর্ট সাইজ ছবি বানান: ৩৫×৪৫ মিমি, স্ট্যাম্প সাইজ, ২×২ ইঞ্চি। ফ্রি, ব্রাউজারেই চলে, আপলোড হয় না।' }),
      PASSPORT_PATH,
    );
  }, [t]);

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB, { href: '/tools/photo-signature-resizer', label: { en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' } }]}
        title={t({ en: 'Passport size photo maker', bn: 'পাসপোর্ট সাইজ ছবি মেকার' })}
        intro={t(PASSPORT_INTRO)}
      />

      <PhotoTool preset={preset} onPreset={setPreset} />

      <div className="border-t border-line bg-mist">
        <div className="wrap grid gap-12 py-12">
          <section aria-labelledby="pp-sizes">
            <h2 id="pp-sizes" className="text-3xl">{t({ en: 'Common print sizes in pixels', bn: 'প্রচলিত প্রিন্ট সাইজ, পিক্সেলে' })}</h2>
            <div className="mt-6 max-w-3xl overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-3">{t({ en: 'Size', bn: 'মাপ' })}</th>
                    <th className="p-3">{t({ en: 'Millimetres', bn: 'মিলিমিটার' })}</th>
                    <th className="p-3">{t({ en: 'Pixels at 300 DPI', bn: '৩০০ DPI-তে পিক্সেল' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {PASSPORT_SIZE_TABLE.map((r) => (
                    <tr key={r.mm} className="border-b border-line last:border-0">
                      <td className="p-3 font-semibold">{t(r.name)}</td>
                      <td className="p-3">{num(r.mm, lang)}</td>
                      <td className="p-3">{num(r.px, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-muted">{t(PASSPORT_SIZE_NOTE)}</p>
          </section>

          <section aria-labelledby="pp-how">
            <h2 id="pp-how" className="text-3xl">{t({ en: 'How to make a passport size photo', bn: 'পাসপোর্ট সাইজ ছবি বানানোর নিয়ম' })}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {PASSPORT_STEPS.map((s, i) => (
                <li key={s.title.en} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-bold text-white">{num(i + 1, lang)}</span>
                  <p className="mt-3 font-display text-lg font-semibold">{t(s.title)}</p>
                  <p className="mt-1 text-muted">{t(s.body)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="pp-take">
            <h2 id="pp-take" className="text-3xl">{t({ en: 'How to take the photo', bn: 'ছবি তোলার নিয়ম' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PASSPORT_TAKE.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="pp-mistakes">
            <h2 id="pp-mistakes" className="text-3xl">{t({ en: 'Common mistakes', bn: 'সাধারণ ভুল' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PASSPORT_MISTAKES.map((x) => <li key={x.en}>{t(x)}</li>)}
            </ul>
          </section>

          <section aria-labelledby="pp-faq">
            <h2 id="pp-faq" className="text-3xl">{t({ en: 'Passport size photo questions', bn: 'পাসপোর্ট সাইজ ছবি নিয়ে প্রশ্ন' })}</h2>
            <div className="mt-6 max-w-3xl space-y-3">
              {PASSPORT_FAQ.map((f) => (
                <details key={f.q.en} className="group rounded-2xl bg-white p-5 ring-1 ring-line">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">{t(f.q)}</summary>
                  <p className="mt-2 text-muted">{t(f.a)}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="pp-sources">
            <h2 id="pp-sources" className="text-3xl">{t({ en: 'Sources', bn: 'সূত্র' })}</h2>
            <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-6 text-muted">
              {PASSPORT_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-leaf underline underline-offset-4">{t(s.label)}</a>
                  {': '}{t(s.note)}
                </li>
              ))}
              <li>{t({ en: 'Photo rules differ by country and form. Always check your own form or the issuing office.', bn: 'ছবির নিয়ম দেশ ও ফর্মভেদে আলাদা। সবসময় নিজের ফর্ম বা ইস্যুকারী অফিস দেখুন।' })}</li>
            </ul>
          </section>

          <section aria-labelledby="pp-next">
            <h2 id="pp-next" className="text-3xl">{t({ en: 'Related', bn: 'আরও দেখুন' })}</h2>
            <ul className="mt-4 space-y-2">
              {PASSPORT_RELATED.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-semibold text-leaf underline underline-offset-4">{t(l.label)}</Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-muted">
            {t({ en: 'By ', bn: 'লেখক: ' })}
            <Link href={PASSPORT_AUTHOR.url} className="underline underline-offset-4">{PASSPORT_AUTHOR.name}</Link>
            {t({ en: `, Career Solutions. Last updated ${PASSPORT_UPDATED_LABEL.en}.`, bn: `, Career Solutions। সর্বশেষ হালনাগাদ ${PASSPORT_UPDATED_LABEL.bn}।` })}
          </p>
        </div>
      </div>
    </>
  );
}
