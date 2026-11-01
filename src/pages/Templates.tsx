import { useEffect, useMemo, useState } from 'react';
import { PRODUCTS, findProduct } from '../../shared/catalog';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES, findTemplate, type Sector, type Template, type TemplateStyle } from '../../shared/templates';
import { PackGrid } from '../components/Catalog';
import { useCheckout } from '../components/Checkout';
import { PageHead } from '../components/PageHead';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { NotFound } from './Policies';

const thumb = (id: string) => `/templates/${id}/thumb.webp`;
const pageImg = (id: string, n: number) => `/templates/${id}/page-${n}.webp`;

const STYLE_LABEL: Record<TemplateStyle, { en: string; bn: string }> = {
  ats: { en: 'ATS-safe', bn: 'ATS-নিরাপদ' },
  designed: { en: 'Designed', bn: 'ডিজাইনড' },
};

const STYLE_HINT: Record<TemplateStyle, { en: string; bn: string }> = {
  ats: {
    en: 'Plain layout that job portals and ATS software read correctly. Best for online applications.',
    bn: 'সাধারণ লেআউট, জব পোর্টাল ও ATS সফটওয়্যার সঠিকভাবে পড়তে পারে। অনলাইন আবেদনের জন্য সেরা।',
  },
  designed: {
    en: 'Colour, columns and a photo space. Best for printing, email and walk-in interviews.',
    bn: 'রং, কলাম ও ছবির জায়গাসহ। প্রিন্ট, ইমেইল ও সরাসরি ইন্টারভিউয়ের জন্য সেরা।',
  },
};

function StyleBadge({ style }: { style: TemplateStyle }) {
  const { t } = useLang();
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-sm font-semibold ${style === 'ats' ? 'bg-leaf-soft text-leaf-dark' : 'bg-gold-soft text-gold'}`}>
      {t(STYLE_LABEL[style])}
    </span>
  );
}

function pagesLabel(n: number, t: (x: { en: string; bn: string }) => string, lang: 'en' | 'bn') {
  return t({ en: `${n} ${n === 1 ? 'page' : 'pages'}`, bn: `${num(String(n), lang)} পৃষ্ঠা` });
}

function TemplateCard({ tpl }: { tpl: Template }) {
  const { t, lang } = useLang();
  return (
    <li>
      <Link href={`/templates/${tpl.id}`} className="group block">
        <div className="overflow-hidden rounded-xl bg-mist p-3 ring-1 ring-line transition group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-leaf">
          <img
            src={thumb(tpl.id)}
            alt={t({ en: `Preview of the ${tpl.title.en}`, bn: `${tpl.title.bn}-এর প্রিভিউ` })}
            width={420}
            height={594}
            loading="lazy"
            decoding="async"
            className="aspect-[210/297] w-full bg-white object-cover object-top shadow-sm"
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug group-hover:text-leaf">{t(tpl.title)}</h3>
          <p className="font-display text-lg font-bold text-leaf whitespace-nowrap">{taka(SINGLE_TEMPLATE_PRICE, lang)}</p>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          <StyleBadge style={tpl.style} />
          <span>{pagesLabel(tpl.pages, t, lang)}</span>
        </p>
      </Link>
    </li>
  );
}

type StyleFilter = 'all' | TemplateStyle;

export function TemplatesPage() {
  const { t, lang } = useLang();
  const order = useCheckout();
  const [style, setStyle] = useState<StyleFilter>('all');
  const [sector, setSector] = useState<Sector | 'all'>('all');

  const title = t({ en: 'CV templates you can edit in Word', bn: 'Word-এ এডিট করার মতো সিভি টেমপ্লেট' });
  const intro = t({
    en: `${TEMPLATES.length} templates made by our CV team. See every page before you buy, pay ${taka(SINGLE_TEMPLATE_PRICE, 'en')} with bKash or Nagad, and download the Word file straight away.`,
    bn: `আমাদের সিভি টিমের তৈরি ${num(String(TEMPLATES.length), 'bn')}টি টেমপ্লেট। কেনার আগে প্রতিটি পৃষ্ঠা দেখুন, বিকাশ বা নগদে ${taka(SINGLE_TEMPLATE_PRICE, 'bn')} দিন, সাথে সাথে Word ফাইল ডাউনলোড করুন।`,
  });
  useEffect(() => setPageMeta(title, intro, '/templates'), [title, intro]);

  const list = useMemo(
    () => TEMPLATES.filter((x) => (style === 'all' || x.style === style) && (sector === 'all' || x.sector === sector)),
    [style, sector],
  );

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 font-display font-semibold transition-colors ${active ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:ring-leaf hover:text-leaf'}`;

  const best = findProduct('pack-best-40');

  return (
    <>
      <PageHead
        crumbs={[{ href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } }]}
        title={title}
        intro={intro}
        aside={
          best && (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-display text-lg font-semibold">{t({ en: 'Need more than one?', bn: 'একাধিক লাগবে?' })}</p>
              <p className="mt-1 text-muted">
                {t({
                  en: `Get all 40 for ${taka(best.price, 'en')}, less than ৳7 each.`,
                  bn: `৪০টিই নিন ${taka(best.price, 'bn')}-এ, প্রতিটি ৳৭-এরও কম।`,
                })}
              </p>
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => order(best.id)}>
                {t({ en: `Buy all 40 for ${taka(best.price, 'en')}`, bn: `${taka(best.price, 'bn')}-এ ৪০টিই কিনুন` })}
              </button>
            </div>
          )
        }
      />

      <section className="wrap py-8" aria-labelledby="gallery-title">
        <h2 id="gallery-title" className="sr-only">{t({ en: 'All templates', bn: 'সব টেমপ্লেট' })}</h2>
        <div className="space-y-3">
          <div role="group" aria-label={t({ en: 'Style', bn: 'স্টাইল' })} className="flex flex-wrap gap-2">
            {(['all', 'ats', 'designed'] as StyleFilter[]).map((s) => (
              <button key={s} type="button" aria-pressed={style === s} className={chip(style === s)} onClick={() => setStyle(s)}>
                {s === 'all' ? t({ en: 'All styles', bn: 'সব স্টাইল' }) : t(STYLE_LABEL[s])}
              </button>
            ))}
          </div>
          <div role="group" aria-label={t({ en: 'Job sector', bn: 'চাকরির খাত' })} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button type="button" aria-pressed={sector === 'all'} className={`${chip(sector === 'all')} shrink-0`} onClick={() => setSector('all')}>
              {t({ en: 'All jobs', bn: 'সব চাকরি' })}
            </button>
            {SECTORS.map((s) => (
              <button key={s.id} type="button" aria-pressed={sector === s.id} className={`${chip(sector === s.id)} shrink-0`} onClick={() => setSector(s.id)}>
                {t(s.name)}
              </button>
            ))}
          </div>
          {style !== 'all' && <p className="max-w-2xl text-sm text-muted">{t(STYLE_HINT[style])}</p>}
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {t({ en: `${list.length} templates`, bn: `${num(String(list.length), 'bn')}টি টেমপ্লেট` })}
        </p>
        {list.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {list.map((tpl) => <TemplateCard key={tpl.id} tpl={tpl} />)}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl bg-mist p-8">
            <p className="font-display text-lg font-semibold">{t({ en: 'No template matches both filters.', bn: 'দুটি ফিল্টারের সাথে মেলে এমন টেমপ্লেট নেই।' })}</p>
            <button type="button" className="btn btn-quiet mt-4" onClick={() => { setStyle('all'); setSector('all'); }}>
              {t({ en: 'Show all templates', bn: 'সব টেমপ্লেট দেখুন' })}
            </button>
          </div>
        )}
      </section>

      <section className="wrap py-10" aria-labelledby="packs-title">
        <h2 id="packs-title" className="text-3xl font-bold">{t({ en: 'Save with a pack', bn: 'প্যাকে কিনে সাশ্রয় করুন' })}</h2>
        <p className="mt-2 max-w-2xl text-muted">
          {t({ en: 'Every template for one job sector in a single download.', bn: 'এক খাতের সব টেমপ্লেট এক ডাউনলোডে।' })}
        </p>
        <div className="mt-6"><PackGrid /></div>
      </section>

      <section className="wrap pb-6">
        <p className="max-w-2xl text-muted">
          {t({ en: 'Want an expert to write it for you? CV writing starts at ', bn: 'বিশেষজ্ঞকে দিয়ে লেখাতে চান? সিভি রাইটিং শুরু ' })}
          <Link href="/services" className="font-semibold text-leaf underline underline-offset-4">{taka(499, lang)}</Link>
          {t({ en: '.', bn: ' থেকে।' })}
        </p>
      </section>
    </>
  );
}

export function TemplateDetail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const tpl = findTemplate(id);

  const title = tpl ? t(tpl.title) : '';
  const desc = tpl
    ? t({
        en: `Editable Word CV template, ${tpl.pages} ${tpl.pages === 1 ? 'page' : 'pages'}, ${STYLE_LABEL[tpl.style].en}. See every page, pay ${taka(SINGLE_TEMPLATE_PRICE, 'en')} with bKash or Nagad and download instantly.`,
        bn: `এডিটযোগ্য Word সিভি টেমপ্লেট, ${num(String(tpl.pages), 'bn')} পৃষ্ঠা, ${STYLE_LABEL[tpl.style].bn}। প্রতিটি পৃষ্ঠা দেখুন, বিকাশ বা নগদে ${taka(SINGLE_TEMPLATE_PRICE, 'bn')} দিয়ে সাথে সাথে ডাউনলোড করুন।`,
      })
    : '';
  useEffect(() => {
    if (tpl) setPageMeta(title, desc, `/templates/${tpl.id}`);
  }, [tpl, title, desc]);

  if (!tpl) return <NotFound />;

  const sectorName = SECTORS.find((s) => s.id === tpl.sector)?.name;
  const packs = PRODUCTS.filter((p) => p.kind === 'pack' && p.templates?.includes(tpl.id)).sort((a, b) => a.price - b.price);
  const related = TEMPLATES.filter((x) => x.sector === tpl.sector && x.id !== tpl.id).slice(0, 4);

  return (
    <>
      <nav aria-label={t({ en: 'Breadcrumb', bn: 'অবস্থান' })} className="wrap pt-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-leaf hover:underline">{t({ en: 'Home', bn: 'হোম' })}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/templates" className="hover:text-leaf hover:underline">{t({ en: 'Templates', bn: 'টেমপ্লেট' })}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{title}</li>
        </ol>
      </nav>

      <section className="wrap grid gap-10 py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="order-2 space-y-6 rounded-2xl bg-mist p-4 sm:p-8 lg:order-1">
          {Array.from({ length: tpl.pages }, (_, i) => (
            <figure key={i}>
              <img
                src={pageImg(tpl.id, i + 1)}
                alt={t({ en: `Page ${i + 1} of the ${tpl.title.en}`, bn: `${tpl.title.bn}, পৃষ্ঠা ${num(String(i + 1), 'bn')}` })}
                width={900}
                height={1273}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-auto w-full bg-white shadow-md"
              />
              {tpl.pages > 1 && (
                <figcaption className="mt-2 text-center text-sm text-muted">
                  {t({ en: `Page ${i + 1} of ${tpl.pages}`, bn: `পৃষ্ঠা ${num(String(i + 1), 'bn')} / ${num(String(tpl.pages), 'bn')}` })}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <StyleBadge style={tpl.style} />
              <span>{pagesLabel(tpl.pages, t, lang)}</span>
              {sectorName && <span>{t(sectorName)}</span>}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-3 text-muted">{t(STYLE_HINT[tpl.style])}</p>

            <div className="mt-6 rounded-2xl p-6 ring-1 ring-line">
              <p className="font-display text-4xl font-bold text-leaf">{taka(SINGLE_TEMPLATE_PRICE, lang)}</p>
              <ul className="mt-4 space-y-1.5">
                {[
                  { en: 'Editable Word file (.docx), opens in Word and Google Docs', bn: 'এডিটযোগ্য Word ফাইল (.docx), Word ও Google Docs-এ খোলে' },
                  { en: 'Sample text to replace with your own details', bn: 'নিজের তথ্য বসানোর জন্য নমুনা লেখা' },
                  { en: 'Download right after you pay', bn: 'পেমেন্টের পরই ডাউনলোড' },
                ].map((line) => (
                  <li key={line.en} className="flex gap-2.5">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>{t(line)}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => order(`tpl-${tpl.id}`)}>
                {t({ en: `Buy for ${taka(SINGLE_TEMPLATE_PRICE, 'en')}`, bn: `${taka(SINGLE_TEMPLATE_PRICE, 'bn')}-এ কিনুন` })}
              </button>
              <p className="mt-2 text-center text-sm text-muted">{t({ en: 'bKash, Nagad or Rocket', bn: 'বিকাশ, নগদ বা রকেট' })}</p>
            </div>

            {packs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold">{t({ en: 'Also in these packs', bn: 'এই প্যাকগুলোতেও আছে' })}</h2>
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {packs.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-semibold">{t(p.name)}</p>
                        <p className="text-sm text-muted">
                          {(() => {
                            const n = p.id === 'pack-best-40' ? 40 : p.templates?.length ?? 0;
                            return t({ en: `${n} templates`, bn: `${num(String(n), 'bn')}টি টেমপ্লেট` });
                          })()}
                        </p>
                      </div>
                      <button type="button" className="btn btn-quiet whitespace-nowrap" onClick={() => order(p.id)}>{taka(p.price, lang)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="wrap py-10" aria-labelledby="related-title">
          <h2 id="related-title" className="text-2xl font-bold">
            {sectorName ? t({ en: `More ${sectorName.en.toLowerCase()} templates`, bn: `আরও ${sectorName.bn} টেমপ্লেট` }) : t({ en: 'More templates', bn: 'আরও টেমপ্লেট' })}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {related.map((x) => <TemplateCard key={x.id} tpl={x} />)}
          </ul>
        </section>
      )}
    </>
  );
}
