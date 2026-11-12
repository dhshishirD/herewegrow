// Text under the CV builder: how it works, designs by job and the FAQ. It is what people and search engines
// read to understand the tool; the same words are pre-rendered by scripts/seo.ts.

import { BUILDER_FAQ, BUILDER_STEPS, BUILDER_UPDATED, designsByGroup, templateForDesign } from '../../shared/builderContent';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';

export function BuilderInfo({ onPick }: { onPick: (id: string) => void }) {
  const { t } = useLang();
  return (
    <div className="no-print border-t border-line bg-mist">
      <div className="wrap grid gap-12 py-12 md:py-16">
        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-3xl">{t({ en: 'How to make a CV online, free', bn: 'অনলাইনে ফ্রি সিভি বানানোর নিয়ম' })}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {BUILDER_STEPS.map((s, i) => (
              <li key={s.title.en} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-display text-lg font-semibold">{t(s.title)}</p>
                <p className="mt-1 text-muted">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="by-job">
          <h2 id="by-job" className="text-3xl">{t({ en: 'CV designs for your kind of job', bn: 'আপনার চাকরির ধরন অনুযায়ী সিভি ডিজাইন' })}</h2>
          <p className="mt-2 max-w-2xl text-muted">
            {t({
              en: 'Every design works for any job. These are the ones that suit each field best. Tap a design to try it with your own details.',
              bn: 'প্রতিটি ডিজাইন যেকোনো চাকরিতে চলে। নিচেরগুলো প্রতিটি ক্ষেত্রের জন্য সবচেয়ে মানানসই। ডিজাইনে ট্যাপ করে নিজের তথ্য দিয়ে দেখুন।',
            })}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {designsByGroup().map((g) => (
              <div key={g.id} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <h3 className="font-display text-lg font-semibold">{t(g.name)}</h3>
                <ul className="mt-3 space-y-2">
                  {g.items.map((d) => {
                    const tpl = templateForDesign(d.id);
                    return (
                      <li key={d.id}>
                        <button type="button" onClick={() => onPick(d.id)} className="text-left font-semibold text-leaf underline underline-offset-4">{t(d.name)}</button>
                        <span className="block text-sm text-muted">{t(d.note)}{tpl && <> · <Link href={`/templates/${tpl}`} className="underline underline-offset-4">{t({ en: 'Word version', bn: 'Word ভার্সন' })}</Link></>}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            {t({ en: 'Looking for a ready-made Word file instead?', bn: 'এর বদলে রেডিমেড Word ফাইল চান?' })}{' '}
            <Link href="/templates" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'See CV templates', bn: 'সিভি টেমপ্লেট দেখুন' })}</Link>
            {' · '}
            <Link href="/cv-for-gulf-jobs" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Gulf CV format', bn: 'গালফ সিভি ফরম্যাট' })}</Link>
            {' · '}
            <Link href="/tools/cv-checker" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' })}</Link>
          </p>
        </section>

        <section aria-labelledby="builder-faq">
          <h2 id="builder-faq" className="text-3xl">{t({ en: 'CV builder questions', bn: 'সিভি বিল্ডার নিয়ে প্রশ্ন' })}</h2>
          <div className="mt-6 max-w-3xl space-y-3">
            {BUILDER_FAQ.map((f) => (
              <details key={f.q.en} className="group rounded-2xl bg-white p-5 ring-1 ring-line">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{t(f.q)}</summary>
                <p className="mt-2 text-muted">{t(f.a)}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">{t({ en: `Last updated ${BUILDER_UPDATED}`, bn: `সর্বশেষ হালনাগাদ ${BUILDER_UPDATED}` })}</p>
        </section>
      </div>
    </div>
  );
}
