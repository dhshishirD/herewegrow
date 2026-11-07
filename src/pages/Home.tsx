import { useEffect } from 'react';
import { findProduct } from '../../shared/catalog';
import { GUIDES } from '../../shared/guides';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES, findTemplate } from '../../shared/templates';
import { ServiceRateCard } from '../components/Catalog';
import { useCheckout } from '../components/Checkout';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { track } from '../lib/track';
import { FAQ, STEPS } from '../content/faq';
import { FaqList } from './CatalogPages';
import { ExpertSection, ReviewsSection } from '../components/Expert';
import { BuilderHero } from '../components/BuilderHero';
import { Showcase } from '../components/Showcase';

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

const TRUST = [
  { en: 'Pay with bKash, Nagad, Rocket', bn: 'বিকাশ, নগদ, রকেটে পেমেন্ট' },
  { en: 'Instant template download', bn: 'টেমপ্লেট সাথে সাথে ডাউনলোড' },
  { en: 'Expert CVs in 24 to 48 hours', bn: 'বিশেষজ্ঞের সিভি ২৪–৪৮ ঘণ্টায়' },
  { en: 'Changes included', bn: 'সংশোধন অন্তর্ভুক্ত' },
  { en: 'Real people on WhatsApp', bn: 'হোয়াটসঅ্যাপে সরাসরি সাহায্য' },
];

type Icon = 'pen' | 'file' | 'build' | 'in' | 'briefcase' | 'cap' | 'heart' | 'check';
const ICONS: Record<Icon, string> = {
  pen: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  build: 'M4 5h16v14H4zM4 9h16M9 9v10',
  in: 'M5 9v10M5 5.5v.01M10 19v-6a3 3 0 016 0v6M10 9v10',
  briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  cap: 'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.500-7 10-7 10z',
  check: 'M4 12l5 5L20 6',
};
const SERVICES: { icon: Icon; href: string; price: { en: string; bn: string }; title: { en: string; bn: string }; body: { en: string; bn: string } }[] = [
  { icon: 'pen', href: '/services', price: { en: 'From ৳499', bn: '৳৪৯৯ থেকে' }, title: { en: 'CV writing', bn: 'সিভি রাইটিং' }, body: { en: 'Fresher, experienced or executive CV written for you.', bn: 'ফ্রেশার, অভিজ্ঞ বা এক্সিকিউটিভ সিভি আপনার জন্য লেখা।' } },
  { icon: 'file', href: '/templates', price: { en: 'From ৳39', bn: '৳৩৯ থেকে' }, title: { en: 'CV templates', bn: 'সিভি টেমপ্লেট' }, body: { en: 'Editable Word designs for every sector.', bn: 'সব খাতের জন্য এডিটযোগ্য Word ডিজাইন।' } },
  { icon: 'build', href: '/builder', price: { en: 'Free', bn: 'ফ্রি' }, title: { en: 'Online CV builder', bn: 'অনলাইন সিভি বিল্ডার' }, body: { en: 'Fill a form, pick a design, download a PDF.', bn: 'ফর্ম পূরণ করুন, ডিজাইন বেছে নিন, PDF নামান।' } },
  { icon: 'in', href: '/services#profile', price: { en: '৳499', bn: '৳৪৯৯' }, title: { en: 'LinkedIn makeover', bn: 'লিংকডইন মেকওভার' }, body: { en: 'A profile recruiters find and trust.', bn: 'রিক্রুটারদের চোখে পড়ার মতো প্রোফাইল।' } },
  { icon: 'briefcase', href: '/services#profile', price: { en: '৳299', bn: '৳২৯৯' }, title: { en: 'BDJobs profile', bn: 'বিডিজবস প্রোফাইল' }, body: { en: 'Set up so employers can shortlist you.', bn: 'নিয়োগকর্তা যাতে আপনাকে বাছাই করতে পারে।' } },
  { icon: 'cap', href: '/services#profile', price: { en: 'From ৳699', bn: '৳৬৯৯ থেকে' }, title: { en: 'Higher study', bn: 'উচ্চশিক্ষা' }, body: { en: 'Academic CV and SOP or motivation letter.', bn: 'একাডেমিক সিভি ও এসওপি/মোটিভেশন লেটার।' } },
  { icon: 'heart', href: '/services#profile', price: { en: 'From ৳299', bn: '৳২৯৯ থেকে' }, title: { en: 'Marriage biodata', bn: 'বিয়ের বায়োডাটা' }, body: { en: 'Clean biodata in Bangla or English.', bn: 'বাংলা বা ইংরেজিতে পরিপাটি বায়োডাটা।' } },
  { icon: 'check', href: '/tools/cv-checker', price: { en: 'Free', bn: 'ফ্রি' }, title: { en: 'CV checker', bn: 'সিভি চেকার' }, body: { en: 'Score out of 100 with the exact fixes.', bn: '১০০-এর মধ্যে স্কোর ও কী ঠিক করবেন।' } },
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
      {/* Hero: the CV builder is the main product. Promise and one big button on the left, a self-building CV on the right */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div className="wrap relative grid items-center gap-12 pt-10 pb-16 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="hero-copy">
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-soft px-3.5 py-1 text-sm font-semibold text-leaf-dark">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-leaf" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
              {t({ en: 'No laptop needed. Works on your phone', bn: 'ল্যাপটপ লাগবে না, ফোনেই হবে' })}
            </p>
            <h1 className="mt-6 text-[2.5rem] leading-[1.14] sm:text-5xl lg:text-[3.5rem]">
              {t({ en: 'Build a professional CV in minutes. Free to start.', bn: 'কয়েক মিনিটেই বানান প্রফেশনাল সিভি। শুরু ফ্রি।' })}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
              {t({
                en: 'Fill the form, pick a design, download your CV. No sign-up to start, and it looks right on any phone.',
                bn: 'ফর্ম পূরণ করুন, ডিজাইন বেছে নিন, সিভি ডাউনলোড করুন। শুরু করতে সাইন-আপ লাগে না, যেকোনো ফোনে সুন্দরভাবে চলে।',
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/builder" onClick={() => track('cta_click', { where: 'hero_builder' })} className="btn btn-primary !px-7 text-[1.1rem]">
                {t({ en: 'Build my CV free', bn: 'ফ্রি সিভি বানান' })}
              </Link>
              <Link href="/services" onClick={() => track('cta_click', { where: 'hero_services' })} className="font-display font-semibold text-leaf underline decoration-saffron decoration-2 underline-offset-[6px] hover:decoration-leaf">
                {t({ en: 'Or get it written for you', bn: 'অথবা লিখিয়ে নিন' })}
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              {t({ en: 'Prefer a ready Word file? ', bn: 'রেডি Word ফাইল চান? ' })}
              <Link href="/templates" className="font-semibold text-leaf underline underline-offset-4">{t({ en: `Templates from ${taka(SINGLE_TEMPLATE_PRICE, 'en')}`, bn: `টেমপ্লেট ${taka(SINGLE_TEMPLATE_PRICE, 'bn')} থেকে` })}</Link>
            </p>
          </div>
          <BuilderHero />
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label={t({ en: 'Why people use HereWeGrow', bn: 'কেন HereWeGrow' })} className="border-b border-line bg-white">
        <ul className="wrap flex flex-wrap justify-center gap-x-8 gap-y-2 py-4 text-sm font-medium text-muted">
          {TRUST.map((x) => (
            <li key={x.en} className="flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {t(x)}
            </li>
          ))}
        </ul>
      </section>

      {/* Promo slider: CV, LinkedIn and BDJobs before → after */}
      <Showcase />

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

      {/* Everything in one place */}
      <section className="wrap pt-20">
        <div className="max-w-2xl">
          <p className="font-display text-gold">{t({ en: 'All in one place', bn: 'সবকিছু এক জায়গায়' })}</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">{t({ en: 'Everything you need to get hired', bn: 'চাকরি পেতে যা যা লাগে' })}</h2>
          <p className="mt-3 text-muted">{t({ en: 'From your first CV to your LinkedIn and BDJobs profiles, with fixed prices and no surprises.', bn: 'প্রথম সিভি থেকে লিংকডইন ও বিডিজবস প্রোফাইল, নির্দিষ্ট দামে, কোনো লুকানো খরচ নেই।' })}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SERVICES.map((x) => (
            <li key={x.title.en}>
              <Link href={x.href} className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-line transition hover:-translate-y-0.5 sm:p-6 hover:ring-leaf">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf transition group-hover:bg-leaf group-hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[x.icon]} /></svg>
                </span>
                <h3 className="mt-4 font-body text-lg font-semibold leading-snug">{t(x.title)}</h3>
                <p className="mt-1.5 flex-1 text-[0.95rem] text-muted">{t(x.body)}</p>
                <p className="mt-4 font-display font-semibold text-leaf">{t(x.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
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
        <div className="mt-10">
          <p className="font-display text-lg">{t({ en: 'Browse by field', bn: 'খাত অনুযায়ী দেখুন' })}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SECTORS.map((sc) => (
              <li key={sc.id}>
                <Link href="/templates" className="inline-block rounded-full border border-line bg-white px-4 py-2 text-[0.95rem] font-medium transition hover:border-leaf hover:text-leaf">
                  {t(sc.name)} <span className="text-muted">{num(String(TEMPLATES.filter((x) => x.sector === sc.id).length), lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
            <Link href="/linkedin-profile-optimization" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'LinkedIn', bn: 'লিংকডইন' })}</Link>{' · '}<Link href="/bdjobs-profile-optimization" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'BDJobs', bn: 'বিডিজবস' })}</Link>{' · '}
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
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Link href="/builder" className="group flex gap-5 rounded-2xl bg-white p-7 ring-1 ring-line transition hover:ring-leaf">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-leaf-dark font-display text-xl font-semibold text-white">CV</span>
            <span>
              <span className="block font-display text-2xl group-hover:text-leaf">{t({ en: 'CV builder', bn: 'সিভি বিল্ডার' })}</span>
              <span className="mt-2 block text-muted">{t({ en: 'Fill a simple form, pick a design and download a print-ready PDF.', bn: 'সহজ ফর্ম পূরণ করুন, ডিজাইন বেছে নিন, প্রিন্ট-রেডি PDF নামান।' })}</span>
            </span>
          </Link>
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
            <a href={whatsappLink('Hello HereWeGrow, I have a question.')} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'home' })} className="font-semibold text-leaf underline underline-offset-4">
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
