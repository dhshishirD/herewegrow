import { EXPERT } from '../content/expert';
import { REVIEWS } from '../../shared/reviews';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';

/** "Meet your expert": photo, short bio and three facts. */
export function ExpertSection({ linkToAbout = true }: { linkToAbout?: boolean }) {
  const { t } = useLang();
  return (
    <section className="bg-leaf-dark text-white" aria-labelledby="expert-title">
      <div className="wrap grid items-center gap-10 py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-20">
        <figure className="relative mx-auto w-full max-w-[22rem]">
          <img src={EXPERT.photo} alt={t(EXPERT.name)} width={640} height={800} loading="lazy" decoding="async"
            className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/15" />
          <figcaption className="absolute -bottom-5 left-5 right-5 rounded-xl bg-paper px-4 py-3 text-ink shadow-lg">
            <p className="font-display text-lg font-semibold leading-tight">{t(EXPERT.name)}</p>
            <p className="text-sm text-muted">{t(EXPERT.role)}</p>
          </figcaption>
        </figure>
        <div>
          <p className="font-display text-saffron">{t({ en: 'Who works on your CV', bn: 'আপনার সিভিতে কে কাজ করেন' })}</p>
          <h2 id="expert-title" className="mt-2 text-3xl text-white sm:text-4xl">
            {t({ en: 'A real expert, not a template factory', bn: 'টেমপ্লেটের কারখানা নয়, একজন সত্যিকারের বিশেষজ্ঞ' })}
          </h2>
          <p className="mt-5 text-lg text-white/80">{t(EXPERT.short)}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/15 py-6">
            {EXPERT.facts.map((f) => (
              <div key={f.label.en}>
                <dt className="sr-only">{t(f.label)}</dt>
                <dd>
                  <span className="block font-display text-2xl text-white sm:text-3xl">{t(f.value)}</span>
                  <span className="mt-1 block text-sm text-white/70">{t(f.label)}</span>
                </dd>
              </div>
            ))}
          </dl>
          {linkToAbout && (
            <Link href="/about" className="mt-7 inline-block font-display font-semibold text-white underline decoration-saffron decoration-2 underline-offset-[6px] hover:decoration-white">
              {t({ en: 'Read my story', bn: 'আমার গল্প পড়ুন' })}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** Client reviews. Renders nothing until real reviews are added in shared/reviews.ts. */
export function ReviewsSection() {
  const { t } = useLang();
  if (REVIEWS.length === 0) return null;
  return (
    <section className="wrap py-20" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-3xl sm:text-4xl">{t({ en: 'What clients say', bn: 'ক্লায়েন্টরা যা বলেন' })}</h2>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <li key={r.name} className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-line">
            <p aria-label={t({ en: `${r.rating} out of 5`, bn: `৫-এর মধ্যে ${r.rating}` })} className="text-saffron">{'★'.repeat(r.rating)}</p>
            <blockquote className="mt-3 flex-1 text-lg">“{t(r.quote)}”</blockquote>
            <p className="mt-5 font-semibold">{r.name}</p>
            <p className="text-sm text-muted">{t(r.role)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
