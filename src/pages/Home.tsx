import { useEffect } from 'react';
import { findProduct } from '../../shared/catalog';
import { GUIDES } from '../../shared/guides';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES, findTemplate } from '../../shared/templates';
import { ServiceRateCard } from '../components/Catalog';
import { useCheckout } from '../components/Checkout';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { FAQ, STEPS } from '../content/faq';
import { FaqList } from './CatalogPages';
import { ExpertSection, ReviewsSection } from '../components/Expert';

const FEATURED = ['ats-banking-standard-bd', 'creative-modern-executive-2page', 'ats-graduate-standard-single-page', 'creative-finance-accountant-2page'];

const PATHS = [
  {
    href: '/templates',
    price: { en: 'From ৳39', bn: '৳৩৯ থেকে' },
    title: { en: 'Do it yourself', bn: 'নিজে করুন' },
    body: { en: '39 Word templates for bank, corporate, engineering, teaching and more. Download instantly.', bn: 'ব্যাংক, কর্পোরেট, ইঞ্জিনিয়ারিং, শিক্ষকতাসহ ৩৯টি Word টেমপ্লেট। সাথে সাথে ডাউনলোড।' },
    cta: { en: 'Browse templates', bn: 'টেমপ্লেট দেখুন' },
  },
  {
    href: '/services',
    price: { en: 'From ৳199', bn: '৳১৯৯ থেকে' },
    title: { en: 'Get it written', bn: 'লিখিয়ে নিন' },
    body: { en: 'An expert reviews or writes your CV in 24 to 48 hours, with changes included.', bn: 'বিশেষজ্ঞ ২৪–৪৮ ঘণ্টায় আপনার সিভি রিভিউ বা নতুন করে লিখে দেবেন, সংশোধনসহ।' },
    cta: { en: 'See prices', bn: 'দাম দেখুন' },
  },
  {
    href: '/tools',
    price: { en: 'Free', bn: 'ফ্রি' },
    title: { en: 'Use free tools', bn: 'ফ্রি টুলস' },
    body: { en: 'Build a CV online, score it out of 100, and resize photos for Teletalk forms. No sign-up.', bn: 'অনলাইনে সিভি বানান, ১০০-এর মধ্যে স্কোর দেখুন, টেলিটক ফর্মের জন্য ছবি রিসাইজ করুন। সাইন-আপ লাগে না।' },
    cta: { en: 'Open tools', bn: 'টুলস খুলুন' },
  },
];

export function Home() {
  const { t, lang } = useLang();
  const order = useCheckout();

  useEffect(() => {
    setPageMeta(
      t({ en: 'HereWeGrow | CV writing, CV templates and free job tools in Bangladesh', bn: 'HereWeGrow | সিভি রাইটিং, সিভি টেমপ্লেট ও ফ্রি জব টুলস' }),
      t({
        en: 'Expert CV writing and review, editable CV templates and free tools for Bangladeshi job seekers. Pay with bKash, Nagad or Rocket.',
        bn: 'বিশেষজ্ঞের সিভি রাইটিং ও রিভিউ, এডিটযোগ্য সিভি টেমপ্লেট ও ফ্রি টুলস। বিকাশ, নগদ বা রকেটে পেমেন্ট।',
      }),
      '/',
    );
  }, [t]);

  const featured = FEATURED.map((id) => findTemplate(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const best = findProduct('pack-best-40');

  return (
    <>
      {/* Hero: the promise on the left, a shortlisted stack of real CVs on the right */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div className="wrap relative grid items-center gap-14 pt-12 pb-16 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="hero-copy">
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-soft px-3.5 py-1 text-sm font-semibold text-leaf-dark">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-leaf" />
              {t({ en: 'Made for job seekers in Bangladesh', bn: 'বাংলাদেশের চাকরিপ্রার্থীদের জন্য' })}
            </p>
            <h1 className="mt-6 text-[2.75rem] leading-[1.12] sm:text-6xl lg:text-[4.25rem]">
              {t({ en: 'A CV that gets you called.', bn: 'যে সিভি দেখে ডাক আসে।' })}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
              {t({
                en: 'Have an expert write it, or download a ready Word template and fill it in yourself. Pay in taka with bKash or Nagad.',
                bn: 'বিশেষজ্ঞকে দিয়ে লিখিয়ে নিন, অথবা রেডি Word টেমপ্লেট ডাউনলোড করে নিজেই পূরণ করুন। বিকাশ বা নগদে টাকায় পেমেন্ট।',
              })}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/templates" className="btn btn-primary !px-6 text-[1.05rem]">
                {t({ en: `Templates from ${taka(SINGLE_TEMPLATE_PRICE, 'en')}`, bn: `টেমপ্লেট ${taka(SINGLE_TEMPLATE_PRICE, 'bn')} থেকে` })}
              </Link>
              <Link href="/services" className="btn btn-quiet bg-white !px-6 text-[1.05rem]">
                {t({ en: 'Get my CV written', bn: 'সিভি লিখিয়ে নিন' })}
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-muted">
              {[
                { en: 'Instant download', bn: 'সাথে সাথে ডাউনলোড' },
                { en: 'Editable in Word', bn: 'Word-এ এডিটযোগ্য' },
                { en: 'Help on WhatsApp', bn: 'হোয়াটসঅ্যাপে সাহায্য' },
              ].map((x) => (
                <li key={x.en} className="flex items-center gap-2">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t(x)}
                </li>
              ))}
            </ul>
          </div>
          <ShortlistStack />
        </div>
      </section>

      {/* Three ways in */}
      <section className="bg-leaf-dark text-white">
        <div className="wrap grid divide-y divide-white/15 md:grid-cols-3 md:divide-x md:divide-y-0">
          {PATHS.map((p) => (
            <Link key={p.href} href={p.href} className="group block py-9 md:px-8 md:py-12 md:first:pl-0 md:last:pr-0">
              <p className="font-display text-saffron">{t(p.price)}</p>
              <h2 className="mt-2 text-2xl text-white sm:text-[1.75rem]">{t(p.title)}</h2>
              <p className="mt-3 text-white/75">{t(p.body)}</p>
              <p className="mt-5 inline-flex items-center gap-2 font-display font-semibold text-white underline decoration-saffron decoration-2 underline-offset-[6px] group-hover:decoration-white">
                {t(p.cta)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured templates */}
      <section className="wrap py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t({ en: 'Templates our team made', bn: 'আমাদের টিমের তৈরি টেমপ্লেট' })}</h2>
            <p className="mt-3 max-w-2xl text-muted">
              {t({
                en: 'See every page before you buy. Download the Word file the moment you pay.',
                bn: 'কেনার আগে প্রতিটি পৃষ্ঠা দেখুন। পেমেন্ট করার সাথে সাথে Word ফাইল ডাউনলোড করুন।',
              })}
            </p>
          </div>
          <Link href="/templates" className="font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">
            {t({ en: `See all ${TEMPLATES.length} templates`, bn: `সব ${num(String(TEMPLATES.length), 'bn')}টি টেমপ্লেট দেখুন` })}
          </Link>
        </div>
        <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {featured.map((tpl) => (
            <li key={tpl.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
              <Link href={`/templates/${tpl.id}`} className="group block">
                <div className="rounded-xl bg-mist p-3 ring-1 ring-line transition group-hover:-translate-y-1 group-hover:ring-leaf">
                  <img src={`/templates/${tpl.id}/thumb.webp`} alt={t({ en: `Preview of the ${tpl.title.en}`, bn: `${tpl.title.bn}-এর প্রিভিউ` })}
                    width={420} height={594} loading="lazy" decoding="async" className="aspect-[210/297] w-full bg-white object-cover object-top shadow-sm" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <h3 className="font-body text-base font-semibold leading-snug group-hover:text-leaf">{t(tpl.title)}</h3>
                  <p className="font-display font-semibold text-leaf">{taka(SINGLE_TEMPLATE_PRICE, lang)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {best && (
          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-gold-soft px-6 py-6 sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="font-display text-xl text-ink">{t({ en: `All 40 templates for ${taka(best.price, 'en')}`, bn: `৪০টি টেমপ্লেট একসাথে ${taka(best.price, 'bn')}` })}</p>
              <p className="mt-1 text-muted">{t({ en: 'Every sector, one download, less than ৳7 each.', bn: 'সব খাত, এক ডাউনলোডে, প্রতিটি ৳৭-এরও কম।' })}</p>
            </div>
            <button type="button" className="btn btn-primary shrink-0" onClick={() => order(best.id)}>
              {t({ en: 'Get all 40', bn: '৪০টিই নিন' })}
            </button>
          </div>
        )}
      </section>

      {/* Services */}
      <section id="services" className="border-t border-line bg-white">
        <div className="wrap py-20">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
            <h2 className="text-3xl sm:text-4xl">{t({ en: 'Or have an expert write it', bn: 'অথবা বিশেষজ্ঞকে দিয়ে লেখান' })}</h2>
            <p className="max-w-2xl text-muted md:justify-self-end">
              {t({
                en: 'Written by the Career Solutions team for bank, NGO, corporate and teaching jobs. Fixed prices, Word and PDF files, changes included.',
                bn: 'ব্যাংক, এনজিও, কর্পোরেট ও শিক্ষকতার চাকরির জন্য লেখে Career Solutions টিম। নির্দিষ্ট দাম, Word ও PDF ফাইল, সংশোধনসহ।',
              })}
            </p>
          </div>
          <div className="mt-10"><ServiceRateCard /></div>
          <p className="mt-6 text-muted">
            {t({ en: 'Also: LinkedIn makeover ৳499, BDJobs profile ৳299, SOP and academic CV for higher study. ', bn: 'আরও আছে: লিংকডইন মেকওভার ৳৪৯৯, বিডিজবস প্রোফাইল ৳২৯৯, উচ্চশিক্ষার SOP ও একাডেমিক সিভি। ' })}
            <Link href="/services#profile" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'See all services', bn: 'সব সার্ভিস দেখুন' })}</Link>
          </p>

          <h3 className="mt-16 font-display text-2xl">{t({ en: 'How a written CV order works', bn: 'সিভি লেখার অর্ডার যেভাবে হয়' })}</h3>
          <ol className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title.en}>
                <p aria-hidden="true" className="font-display text-4xl text-saffron">{num(String(i + 1), lang)}</p>
                <p className="mt-2 font-semibold">{t(s.title)}</p>
                <p className="mt-1 text-muted">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ExpertSection />
      <ReviewsSection />

      {/* Free tools */}
      <section className="wrap py-20">
        <h2 className="text-3xl sm:text-4xl">{t({ en: 'Free tools for your application', bn: 'আবেদনের জন্য ফ্রি টুলস' })}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link href="/tools/cv-checker" className="group flex gap-5 rounded-2xl bg-white p-7 ring-1 ring-line transition hover:ring-leaf">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-leaf-soft font-display text-xl font-semibold text-leaf">86</span>
            <span>
              <span className="block font-display text-2xl group-hover:text-leaf">{t({ en: 'CV checker', bn: 'সিভি চেকার' })}</span>
              <span className="mt-2 block text-muted">
                {t({
                  en: 'Upload your CV as a PDF and get a score out of 100 with the exact fixes. Your file never leaves your phone.',
                  bn: 'PDF সিভি আপলোড করে ১০০-এর মধ্যে স্কোর ও কী ঠিক করতে হবে তা দেখুন। ফাইল আপনার মোবাইলের বাইরে যায় না।',
                })}
              </span>
            </span>
          </Link>
          <Link href="/tools/photo-signature-resizer" className="group flex gap-5 rounded-2xl bg-white p-7 ring-1 ring-line transition hover:ring-leaf">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold-soft font-display text-[0.8rem] font-semibold leading-tight text-gold">300<br />×300</span>
            <span>
              <span className="block font-display text-2xl group-hover:text-leaf">{t({ en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' })}</span>
              <span className="mt-2 block text-muted">
                {t({
                  en: 'Exact Teletalk sizes for government job forms: photo 300×300, signature 300×80.',
                  bn: 'সরকারি চাকরির টেলিটক ফর্মের সঠিক মাপ: ছবি ৩০০×৩০০, স্বাক্ষর ৩০০×৮০।',
                })}
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Guides */}
      <section className="wrap pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Free career guides', bn: 'ফ্রি ক্যারিয়ার গাইড' })}</h2>
          <Link href="/guides" className="font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">{t({ en: 'All guides', bn: 'সব গাইড' })}</Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group block h-full rounded-2xl border-t-4 border-saffron bg-white p-6 ring-1 ring-line transition hover:ring-leaf">
                <h3 lang="bn" className="text-xl leading-snug group-hover:text-leaf">{g.title.bn}</h3>
                <p lang="bn" className="mt-3 text-muted line-clamp-3">{g.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="wrap grid gap-10 pb-20 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Questions people ask', bn: 'যে প্রশ্নগুলো বেশি আসে' })}</h2>
          <p className="mt-4 text-muted">
            {t({ en: 'Something else? ', bn: 'অন্য কোনো প্রশ্ন? ' })}
            <a href={whatsappLink('Hello HereWeGrow, I have a question.')} target="_blank" rel="noreferrer" className="font-semibold text-leaf underline underline-offset-4">
              {t({ en: 'Ask on WhatsApp', bn: 'হোয়াটসঅ্যাপে জিজ্ঞেস করুন' })}
            </a>
          </p>
        </div>
        <FaqList items={FAQ} />
      </section>

      {/* Closing call to action */}
      <section className="-mb-20 border-t border-line bg-leaf-soft">
        <div className="wrap flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
          <h2 className="max-w-xl text-3xl sm:text-4xl">
            {t({ en: 'Not sure where to start? Check your CV for free.', bn: 'কোথা থেকে শুরু করবেন বুঝছেন না? ফ্রিতে সিভি চেক করুন।' })}
          </h2>
          <Link href="/tools/cv-checker" className="btn btn-primary shrink-0 !px-6">
            {t({ en: 'Check my CV', bn: 'সিভি চেক করুন' })}
          </Link>
        </div>
      </section>
    </>
  );
}

/** Three real templates in a loose stack, the top one stamped as shortlisted. */
function ShortlistStack() {
  const { t } = useLang();
  const ids = ['creative-sales-executive-2page', 'ats-classic-professional-2page', 'creative-medical-doctor-2column'];
  return (
    <figure className="hero-stack relative mx-auto aspect-[4/4.3] w-full max-w-[29rem]" aria-label={t({ en: 'CV templates, one marked shortlisted', bn: 'সিভি টেমপ্লেট, একটি বাছাই হয়েছে' })}>
      <img src={`/templates/${ids[0]}/thumb.webp`} alt="" width={420} height={594} className="absolute left-[2%] top-[9%] w-[54%] -rotate-[8deg] rounded-sm bg-white shadow-lg ring-1 ring-line" />
      <img src={`/templates/${ids[2]}/thumb.webp`} alt="" width={420} height={594} className="absolute right-[1%] top-[5%] w-[54%] rotate-[7deg] rounded-sm bg-white shadow-lg ring-1 ring-line" />
      <img src={`/templates/${ids[1]}/page-1.webp`} alt="" width={900} height={1273} fetchPriority="high"
        className="absolute left-1/2 top-0 w-[62%] -translate-x-1/2 rounded-sm bg-white shadow-[0_30px_60px_-20px_rgb(14_59_46/0.45)] ring-1 ring-line" />
      <div className="hero-stamp absolute bottom-[16%] right-[6%] rotate-[-9deg] rounded-lg border-[3px] border-saffron bg-paper/95 px-4 py-2 text-center shadow-md">
        <p className="font-display text-xl font-bold leading-tight text-gold sm:text-2xl">{t({ en: 'Shortlisted', bn: 'বাছাই হয়েছে' })}</p>
        <p className="text-xs font-semibold text-gold/80">{t({ en: 'Call for interview', bn: 'ইন্টারভিউয়ের ডাক' })}</p>
      </div>
    </figure>
  );
}
