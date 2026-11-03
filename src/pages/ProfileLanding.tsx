import { useEffect } from 'react';
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, Wallet, X, Check } from 'lucide-react';
import { findProduct, SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { PROFILE_PAGES, type ProfileKind } from '../../shared/profilePages';
import { useCheckout } from '../components/Checkout';
import { ExpertSection } from '../components/Expert';
import { FeatureList } from '../components/FeatureList';
import { ProfileMakeover } from '../components/ProfileMakeover';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { FaqList } from './CatalogPages';

const COMBO = 'combo-cv-linkedin-bdjobs';

export default function Landing({ kind }: { kind: ProfileKind }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const page = PROFILE_PAGES[kind];
  const product = findProduct(page.productId)!;
  const combo = findProduct(COMBO)!;
  const other = PROFILE_PAGES[kind === 'linkedin' ? 'bdjobs' : 'linkedin'];
  const otherName = kind === 'linkedin' ? { en: 'BDJobs profile', bn: 'বিডিজবস প্রোফাইল' } : { en: 'LinkedIn profile', bn: 'লিংকডইন প্রোফাইল' };

  useEffect(() => setPageMeta(t(page.eyebrow), t(page.lead), page.path), [t, page]);

  const trust = [
    { icon: Wallet, text: { en: `Fixed price ${taka(product.price, 'en')}`, bn: `নির্দিষ্ট দাম ${taka(product.price, 'bn')}` } },
    { icon: Clock, text: product.delivery },
    { icon: ShieldCheck, text: { en: 'bKash, Nagad, Rocket', bn: 'বিকাশ, নগদ, রকেট' } },
  ];

  return (
    <>
      {/* Hero */}
      <section className="lux-band relative overflow-hidden text-white">
        <div aria-hidden="true" className="lux-dots pointer-events-none absolute inset-0" />
        <div className="wrap relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <nav aria-label={t({ en: 'Breadcrumb', bn: 'অবস্থান' })} className="text-sm text-white/60">
              <Link href="/" className="hover:text-white">{t({ en: 'Home', bn: 'হোম' })}</Link>
              <span aria-hidden="true" className="mx-1.5">/</span>
              <Link href="/services#profile" className="hover:text-white">{t({ en: 'Services', bn: 'সার্ভিস' })}</Link>
            </nav>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-saffron ring-1 ring-white/15">
              <BadgeCheck size={16} aria-hidden="true" /> {t(page.eyebrow)}
            </p>
            <h1 className="mt-5 text-4xl text-white sm:text-5xl lg:text-[3.4rem]">
              <span className="text-shine">{t(page.title)}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{t(page.lead)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn bg-saffron px-6 text-ink shadow-lg shadow-black/20 hover:bg-white" onClick={() => order(product.id)}>
                {t({ en: 'Optimize my profile', bn: 'আমার প্রোফাইল অপটিমাইজ করুন' })} · {taka(product.price, lang)}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a href={whatsappLink(`Hello HereWeGrow, I want ${product.name.en}.`)} target="_blank" rel="noreferrer" className="btn border border-white/30 text-white hover:border-white">
                WhatsApp {num(SUPPORT_WHATSAPP_DISPLAY, lang)}
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              {trust.map(({ icon: Icon, text }) => (
                <li key={text.en} className="flex items-center gap-2"><Icon size={16} className="text-saffron" aria-hidden="true" /> {t(text)}</li>
              ))}
            </ul>
          </div>
          <ProfileMakeover kind={kind} />
        </div>
      </section>

      {/* Why profiles get skipped */}
      <section className="wrap py-16 md:py-20">
        <p className="font-display font-semibold text-gold">{t({ en: 'Why profiles get skipped', bn: 'কেন প্রোফাইল এড়িয়ে যাওয়া হয়' })}</p>
        <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">{t({ en: 'HR decides in seconds. These three things lose them.', bn: 'এইচআর কয়েক সেকেন্ডে সিদ্ধান্ত নেন। এই তিনটি কারণে আপনি পিছিয়ে পড়েন।' })}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {page.pains.map((p, i) => (
            <article key={p.title.en} className="svc-card reveal rounded-3xl bg-white p-7 ring-1 ring-line">
              <p aria-hidden="true" className="font-display text-5xl font-bold text-saffron/80">{num(String(i + 1).padStart(2, '0'), lang)}</p>
              <h3 className="mt-4 text-xl">{t(p.title)}</h3>
              <p className="mt-2 text-muted">{t(p.body)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Before / after lines */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-16 md:py-20">
          <p className="font-display font-semibold text-gold">{t({ en: 'What we change', bn: 'আমরা যা বদলাই' })}</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">{t({ en: 'Same person. A profile that sells.', bn: 'একই মানুষ। কিন্তু প্রোফাইল এখন নিজেকে তুলে ধরে।' })}</h2>
          <div className="mt-10 grid gap-4">
            {page.changes.map((c) => (
              <div key={c.area.en} className="reveal grid gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line md:grid-cols-[10rem_1fr_1fr] md:items-stretch md:gap-4 md:p-5">
                <p className="font-display text-lg font-semibold md:pt-2">{t(c.area)}</p>
                <p className="flex gap-2.5 rounded-xl bg-white p-3.5 text-muted ring-1 ring-line">
                  <X size={18} className="mt-0.5 shrink-0 text-alert" aria-label={t({ en: 'Before', bn: 'আগে' })} />
                  <span className="line-through decoration-alert/40">{c.before}</span>
                </p>
                <p className="flex gap-2.5 rounded-xl bg-leaf-soft p-3.5 font-medium text-ink ring-1 ring-leaf/20">
                  <Check size={18} className="mt-0.5 shrink-0 text-leaf" aria-label={t({ en: 'After', bn: 'পরে' })} />
                  <span>{c.after}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">{t({ en: 'Examples with sample data. Your profile is written from your real experience.', bn: 'নমুনা তথ্যের উদাহরণ। আপনার প্রোফাইল লেখা হয় আপনার আসল অভিজ্ঞতা থেকে।' })}</p>
        </div>
      </section>

      {/* Offer */}
      <section className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="font-display font-semibold text-gold">{t({ en: 'How it works', bn: 'যেভাবে কাজ হয়' })}</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">{t({ en: 'Three steps. No passwords needed to start.', bn: 'তিন ধাপ। শুরু করতে পাসওয়ার্ড লাগবে না।' })}</h2>
          <ol className="mt-8 grid gap-6">
            {page.steps.map((s, i) => (
              <li key={s.title.en} className="flex gap-4">
                <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-dark font-display text-lg font-bold text-saffron">{num(String(i + 1), lang)}</span>
                <div>
                  <p className="font-semibold">{t(s.title)}</p>
                  <p className="text-muted">{t(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <article className="svc-card group flex flex-col rounded-3xl bg-white p-7 ring-1 ring-line">
            <h3 className="text-2xl">{t(product.name)}</h3>
            <p className="mt-2 text-muted">{t(product.summary)}</p>
            <FeatureList items={product.includes} className="mt-5 flex-1 content-start" />
            <p className="mt-6 font-display text-4xl font-bold">{taka(product.price, lang)}</p>
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => order(product.id)}>
              {t({ en: 'Order now', bn: 'অর্ডার করুন' })} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
          <article className="svc-card svc-card-featured group relative flex flex-col rounded-3xl p-7 text-white">
            <p className="absolute -top-3 left-6 rounded-full bg-saffron px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-md">{t(combo.badge ?? { en: 'Best value', bn: 'সবচেয়ে সাশ্রয়ী' })}</p>
            <h3 className="text-2xl text-white">{t(combo.name)}</h3>
            <p className="mt-2 text-white/75">{t(combo.summary)}</p>
            <FeatureList items={combo.includes} tone="dark" className="mt-5 flex-1 content-start" />
            <p className="mt-6 font-display text-4xl font-bold">{taka(combo.price, lang)}</p>
            <button type="button" className="btn mt-4 w-full bg-saffron text-ink hover:bg-white" onClick={() => order(combo.id)}>
              {t({ en: 'Get the combo', bn: 'কম্বো নিন' })} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>

      <ExpertSection />

      <section className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Questions', bn: 'প্রশ্ন ও উত্তর' })}</h2>
          <p className="mt-4 text-muted">
            {t({ en: 'Also need your ', bn: 'আপনার ' })}
            <Link href={other.path} className="font-semibold text-leaf underline underline-offset-4">{t(otherName)}</Link>
            {t({ en: ' done?', bn: ' কি করাতে চান?' })}
          </p>
        </div>
        <FaqList items={page.faq} />
      </section>

      {/* Closing call to action, sticky on phones */}
      <div className="sticky bottom-3 z-30 mx-auto w-full max-w-md px-4 md:hidden">
        <button type="button" onClick={() => order(product.id)} className="btn w-full bg-leaf-dark text-white shadow-2xl ring-1 ring-saffron/50">
          {t({ en: 'Optimize my profile', bn: 'প্রোফাইল অপটিমাইজ করুন' })} · {taka(product.price, lang)}
        </button>
      </div>
      <p className="wrap mt-6 text-xs text-muted">
        {t({
          en: 'HereWeGrow is independent and not affiliated with LinkedIn or BDJobs. Names are trademarks of their owners.',
          bn: 'HereWeGrow একটি স্বাধীন প্রতিষ্ঠান, লিংকডইন বা বিডিজবসের সাথে সম্পর্কিত নয়। নামগুলো তাদের মালিকদের ট্রেডমার্ক।',
        })}
      </p>
    </>
  );
}
