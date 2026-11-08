import { useEffect } from 'react';
import { ArrowRight, BadgeCheck, Check, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { ABROAD_PAGES, type AbroadKind } from '../../shared/abroadPages';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';
import { whatsappLink } from '../lib/whatsapp';
import { FaqList } from './CatalogPages';

export default function AbroadLanding({ kind }: { kind: AbroadKind }) {
  const { t, lang } = useLang();
  const page = ABROAD_PAGES[kind];
  const builderHref = `/builder?preset=${page.presetId}`;

  useEffect(() => setPageMeta(t(page.eyebrow), t(page.lead), page.path), [t, page]);
  useEffect(() => track('view_abroad', { kind }), [kind]);

  const trust = [
    { icon: Wallet, text: { en: 'Free to start, no sign-up', bn: 'শুরু বিনামূল্যে, সাইন-আপ লাগে না' } },
    { icon: Smartphone, text: { en: 'Works on your phone', bn: 'ফোনেই কাজ করে' } },
    { icon: ShieldCheck, text: { en: 'Your CV stays on your device', bn: 'সিভি আপনার ডিভাইসেই থাকে' } },
  ];

  return (
    <>
      <section className="lux-band relative overflow-hidden text-white">
        <div aria-hidden="true" className="lux-dots pointer-events-none absolute inset-0" />
        <div className="wrap relative py-14 md:py-20">
          <nav aria-label={t({ en: 'Breadcrumb', bn: 'অবস্থান' })} className="text-sm text-white/60">
            <Link href="/" className="hover:text-white">{t({ en: 'Home', bn: 'হোম' })}</Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <Link href="/builder" className="hover:text-white">{t({ en: 'CV builder', bn: 'সিভি বিল্ডার' })}</Link>
          </nav>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-saffron ring-1 ring-white/15">
            <BadgeCheck size={16} aria-hidden="true" /> {t(page.eyebrow)}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl text-white sm:text-5xl">
            <span className="text-shine">{t(page.title)}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{t(page.lead)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={builderHref} onClick={() => track('abroad_cta_click', { kind, where: 'hero' })} className="btn bg-saffron px-6 text-ink shadow-lg shadow-black/20 hover:bg-white">
              {t({ en: 'Build my Gulf CV free', bn: 'বিনামূল্যে আমার গাল্ফ সিভি বানান' })}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href={whatsappLink('Hello HereWeGrow, I need help with my Gulf job CV.')} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'abroad' })} className="btn border border-white/30 text-white hover:border-white">
              WhatsApp {num(SUPPORT_WHATSAPP_DISPLAY, lang)}
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            {trust.map(({ icon: Icon, text }) => (
              <li key={text.en} className="flex items-center gap-2"><Icon size={16} className="text-saffron" aria-hidden="true" /> {t(text)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <p className="font-display font-semibold text-gold">{t({ en: 'What Gulf employers expect', bn: 'গাল্ফের নিয়োগকর্তারা যা আশা করেন' })}</p>
        <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">{t({ en: 'Five things to get right before you send', bn: 'পাঠানোর আগে এই পাঁচটি বিষয় ঠিক করুন' })}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {page.expect.map((e, i) => (
            <article key={e.title.en} className="svc-card reveal rounded-3xl bg-white p-7 ring-1 ring-line">
              <p aria-hidden="true" className="font-display text-5xl font-bold text-saffron/80">{num(String(i + 1).padStart(2, '0'), lang)}</p>
              <h3 className="mt-4 text-xl">{t(e.title)}</h3>
              <p className="mt-2 text-muted">{t(e.body)}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          {t({ en: `Last checked ${page.lastChecked}. Norms differ by employer and country, so always follow the job ad.`, bn: `সর্বশেষ যাচাই ${num(page.lastChecked, lang)}। নিয়ম নিয়োগকর্তা ও দেশভেদে আলাদা, তাই সবসময় চাকরির বিজ্ঞাপনের নির্দেশ মানুন।` })}
        </p>
      </section>

      <section className="border-y border-line bg-white">
        <div className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="font-display font-semibold text-gold">{t({ en: 'How it works', bn: 'যেভাবে কাজ হয়' })}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{t({ en: 'Three steps, about ten minutes', bn: 'তিন ধাপ, প্রায় দশ মিনিট' })}</h2>
            <ol className="mt-8 grid gap-6">
              {page.steps.map((s, i) => (
                <li key={s.title.en} className="flex gap-4">
                  <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-dark font-display text-lg font-bold text-saffron">{num(String(i + 1), lang)}</span>
                  <div>
                    <h3 className="text-base font-semibold">{t(s.title)}</h3>
                    <p className="text-muted">{t(s.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={builderHref} onClick={() => track('abroad_cta_click', { kind, where: 'steps' })} className="btn btn-primary mt-8">
              {t({ en: 'Build this CV free', bn: 'বিনামূল্যে এই সিভি বানান' })} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <aside className="rounded-3xl bg-leaf-soft p-7 ring-1 ring-leaf/20">
            <h2 className="flex items-center gap-2 text-2xl"><ShieldCheck size={22} className="text-leaf" aria-hidden="true" /> {t({ en: 'Stay safe from fraud', bn: 'প্রতারণা থেকে সাবধান' })}</h2>
            <ul className="mt-5 grid gap-4">
              {page.safety.map((s) => (
                <li key={s.en} className="flex gap-3"><Check size={18} className="mt-1 shrink-0 text-leaf" aria-hidden="true" /><span>{t(s)}</span></li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <div className="rounded-3xl bg-white p-7 ring-1 ring-line md:p-10">
          <h2 className="text-2xl sm:text-3xl">{t({ en: 'Want it cleaner or written for you?', bn: 'আরও পরিপাটি চান, বা আমরা লিখে দিই?' })}</h2>
          <p className="mt-3 max-w-2xl text-muted">
            {t({ en: 'Pro removes the footer mark and adds Word export and premium designs. Or let our CV experts write and review it at a fixed price.', bn: 'Pro-তে ফুটার চিহ্ন থাকে না, Word এক্সপোর্ট ও প্রিমিয়াম ডিজাইন মেলে। অথবা নির্দিষ্ট দামে আমাদের সিভি বিশেষজ্ঞদের দিয়ে লিখিয়ে বা রিভিউ করিয়ে নিন।' })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pro" className="btn btn-primary">{t({ en: 'See Pro, from ৳49', bn: 'Pro দেখুন, ৳৪৯ থেকে' })}</Link>
            <Link href="/services" className="btn border border-line hover:border-leaf">{t({ en: 'CV writing service', bn: 'সিভি রাইটিং সার্ভিস' })}</Link>
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 pb-16 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Questions', bn: 'প্রশ্ন ও উত্তর' })}</h2>
          <p className="mt-4 text-muted">
            {t({ en: 'More help: ', bn: 'আরও সাহায্য: ' })}
            <Link href="/guides" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'career guides', bn: 'ক্যারিয়ার গাইড' })}</Link>
            {' · '}
            <Link href="/tools/cv-checker" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'free CV checker', bn: 'ফ্রি সিভি চেকার' })}</Link>
          </p>
        </div>
        <FaqList items={page.faq} />
      </section>

      <div className="sticky bottom-3 z-30 mx-auto w-full max-w-md px-4 md:hidden">
        <Link href={builderHref} onClick={() => track('abroad_cta_click', { kind, where: 'sticky' })} className="btn w-full bg-leaf-dark text-white shadow-2xl ring-1 ring-saffron/50">
          {t({ en: 'Build my Gulf CV free', bn: 'বিনামূল্যে গাল্ফ সিভি বানান' })}
        </Link>
      </div>
    </>
  );
}
