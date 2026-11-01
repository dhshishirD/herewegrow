import { useEffect } from 'react';
import { GUIDES, findGuide, type Block } from '../../shared/guides';
import { PageHead } from '../components/PageHead';
import { EXPERT } from '../content/expert';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { NotFound } from './Policies';

const GUIDES_CRUMB = { href: '/guides', label: { en: 'Career guides', bn: 'ক্যারিয়ার গাইড' } };

const dateLabel = (iso: string, lang: 'en' | 'bn') =>
  new Date(iso).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function minutes(n: number, t: (x: { en: string; bn: string }) => string, lang: 'en' | 'bn') {
  return t({ en: `${n} min read`, bn: `${num(String(n), lang)} মিনিটে পড়ুন` });
}

export function GuidesPage() {
  const { t, lang } = useLang();
  const title = t({ en: 'Career guides', bn: 'ক্যারিয়ার গাইড' });
  const intro = t({
    en: 'Short, practical guides in Bangla for job seekers in Bangladesh: CV formats, government job forms and more.',
    bn: 'বাংলাদেশের চাকরিপ্রার্থীদের জন্য বাংলায় ছোট ও কাজের গাইড: সিভি ফরম্যাট, সরকারি চাকরির ফর্মসহ আরও অনেক কিছু।',
  });
  useEffect(() => setPageMeta(title, intro, '/guides'), [title, intro]);

  return (
    <>
      <PageHead crumbs={[GUIDES_CRUMB]} title={title} intro={intro} />
      <section className="wrap py-14">
        <ul className="grid gap-6 md:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-line transition hover:ring-2 hover:ring-leaf">
                <p className="text-sm text-muted">{minutes(g.minutes, t, lang)}</p>
                <h2 className="mt-2 text-2xl leading-snug group-hover:text-leaf">{g.title.bn}</h2>
                {lang === 'en' && <p className="mt-1 text-muted">{g.title.en}</p>}
                <p className="mt-3 flex-1 text-muted">{g.summary}</p>
                <p className="mt-5 font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">{t({ en: 'Read the guide', bn: 'গাইডটি পড়ুন' })}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  if ('h2' in b) return <h2 className="mt-12 text-2xl sm:text-3xl">{b.h2}</h2>;
  if ('p' in b) return <p className="mt-5">{b.p}</p>;
  if ('ul' in b)
    return (
      <ul className="mt-5 space-y-2.5">
        {b.ul.map((x) => (
          <li key={x} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    );
  if ('ol' in b)
    return (
      <ol className="mt-5 space-y-3">
        {b.ol.map((x, i) => (
          <li key={x} className="flex gap-4">
            <span aria-hidden="true" className="w-7 shrink-0 font-display text-2xl leading-[1.5] text-saffron">{num(String(i + 1), 'bn')}</span>
            <span>{x}</span>
          </li>
        ))}
      </ol>
    );
  return <p className="mt-8 rounded-xl border-l-4 border-saffron bg-gold-soft px-5 py-4">{b.tip}</p>;
}

export function GuidePage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const g = findGuide(slug);
  useEffect(() => {
    if (g) setPageMeta(g.title.bn, g.summary, `/guides/${g.slug}`);
  }, [g]);
  if (!g) return <NotFound />;
  const more = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <>
      <PageHead
        crumbs={[GUIDES_CRUMB]}
        title={g.title.bn}
        intro={
          <p className="flex flex-wrap items-center gap-3 text-base">
            <img src={EXPERT.photoSquare} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span>{t(EXPERT.name)}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={g.date}>{dateLabel(g.date, lang)}</time>
            <span aria-hidden="true">/</span>
            <span>{minutes(g.minutes, t, lang)}</span>
          </p>
        }
      />
      <article lang="bn" className="wrap max-w-3xl py-12 text-lg leading-[1.85]">
        {lang === 'en' && (
          <p className="mb-8 rounded-xl bg-mist px-5 py-3 text-base text-muted">
            {g.title.en}. This guide is written in Bangla for job seekers in Bangladesh.
          </p>
        )}
        <p className="text-xl text-muted">{g.summary}</p>
        {g.body.map((b, i) => <BlockView key={i} b={b} />)}

        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-leaf-dark px-7 py-7 text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl">{t({ en: 'Ready for the next step?', bn: 'পরের ধাপের জন্য প্রস্তুত?' })}</p>
          <Link href={g.cta.href} className="btn shrink-0 bg-saffron text-ink hover:bg-white">{t(g.cta.label)}</Link>
        </div>
      </article>

      <section className="wrap max-w-3xl pb-6">
        <h2 className="font-display text-2xl">{t({ en: 'More guides', bn: 'আরও গাইড' })}</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {more.map((x) => (
            <li key={x.slug}>
              <Link href={`/guides/${x.slug}`} className="block py-4 text-lg font-semibold hover:text-leaf">{x.title.bn}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
