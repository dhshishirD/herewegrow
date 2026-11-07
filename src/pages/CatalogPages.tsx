import { useEffect } from 'react';
import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { ServiceRateCard } from '../components/Catalog';
import { ExpertSection } from '../components/Expert';
import { PageHead } from '../components/PageHead';
import { SERVICE_FAQ, STEPS } from '../content/faq';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { track } from '../lib/track';

export function FaqList({ items }: { items: { q: { en: string; bn: string }; a: { en: string; bn: string } }[] }) {
  const { t } = useLang();
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q.en} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
            {t(f.q)}
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-xl text-leaf transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-muted">{t(f.a)}</p>
        </details>
      ))}
    </div>
  );
}

const GROUPS: { id: 'cv' | 'profile' | 'study'; name: { en: string; bn: string }; intro: { en: string; bn: string } }[] = [
  {
    id: 'cv',
    name: { en: 'CV writing', bn: 'সিভি রাইটিং' },
    intro: { en: 'A new CV written for you, or an expert review of the one you have.', bn: 'আপনার জন্য নতুন সিভি, অথবা বর্তমান সিভির বিশেষজ্ঞ রিভিউ।' },
  },
  {
    id: 'profile',
    name: { en: 'LinkedIn and BDJobs', bn: 'লিংকডইন ও বিডিজবস' },
    intro: { en: 'Recruiters search these profiles before they read your CV.', bn: 'সিভি পড়ার আগে রিক্রুটাররা এই প্রোফাইলগুলো খোঁজেন।' },
  },
  {
    id: 'study',
    name: { en: 'Higher study abroad', bn: 'বিদেশে উচ্চশিক্ষা' },
    intro: { en: 'Documents for master’s, PhD and scholarship applications.', bn: 'মাস্টার্স, পিএইচডি ও স্কলারশিপ আবেদনের কাগজপত্র।' },
  },
];

export function ServicesPage() {
  const { t, lang } = useLang();
  const title = t({ en: 'CV, LinkedIn and study-abroad services', bn: 'সিভি, লিংকডইন ও উচ্চশিক্ষার সার্ভিস' });
  const intro = t({
    en: 'Done for you by the Career Solutions team: CVs, LinkedIn and BDJobs profiles, and higher-study documents. Fixed prices, changes included.',
    bn: 'Career Solutions টিম করে দেবে: সিভি, লিংকডইন ও বিডিজবস প্রোফাইল এবং উচ্চশিক্ষার কাগজপত্র। নির্দিষ্ট দাম, সংশোধনসহ।',
  });
  useEffect(() => setPageMeta(title, intro, '/services'), [title, intro]);
  useEffect(() => track('view_service'), []);

  return (
    <>
      <PageHead
        crumbs={[{ href: '/services', label: { en: 'CV services', bn: 'সিভি সার্ভিস' } }]}
        title={title}
        intro={intro}
        aside={
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
            <p className="font-display text-lg font-semibold">{t({ en: 'Not sure which one you need?', bn: 'কোনটি লাগবে বুঝতে পারছেন না?' })}</p>
            <p className="mt-1 text-muted">
              {t({ en: 'Check your CV for free first, or ask us on WhatsApp.', bn: 'আগে ফ্রিতে সিভি চেক করুন, অথবা হোয়াটসঅ্যাপে জিজ্ঞেস করুন।' })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/tools/cv-checker" className="btn btn-primary">{t({ en: 'Check my CV', bn: 'সিভি চেক করুন' })}</Link>
              <a href={whatsappLink('Hello HereWeGrow, which CV service is right for me?')} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'services' })} className="btn btn-quiet bg-white">
                WhatsApp {num(SUPPORT_WHATSAPP_DISPLAY, lang)}
              </a>
            </div>
          </div>
        }
      />

      <nav aria-label={t({ en: 'Service groups', bn: 'সার্ভিসের ধরন' })} className="wrap pt-10">
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="inline-block rounded-full bg-white px-4 py-1.5 font-display font-semibold ring-1 ring-line hover:text-leaf hover:ring-leaf">{t(g.name)}</a>
            </li>
          ))}
        </ul>
      </nav>
      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="wrap scroll-mt-24 pt-12">
          <h2 className="text-3xl">{t(g.name)}</h2>
          <p className="mt-2 max-w-2xl text-muted">{t(g.intro)}</p>
          {g.id === 'profile' && (
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-semibold">
              <Link href="/linkedin-profile-optimization" className="text-leaf underline underline-offset-4">{t({ en: 'See a LinkedIn before and after', bn: 'লিংকডইনের আগে-পরে দেখুন' })}</Link>
              <Link href="/bdjobs-profile-optimization" className="text-leaf underline underline-offset-4">{t({ en: 'See a BDJobs before and after', bn: 'বিডিজবসের আগে-পরে দেখুন' })}</Link>
            </p>
          )}
          <div className="mt-6"><ServiceRateCard group={g.id} /></div>
        </section>
      ))}
      <div className="pb-14" />

      <section className="border-y border-line bg-white">
        <div className="wrap py-16">
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'How it works', bn: 'যেভাবে কাজ হয়' })}</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Before you order', bn: 'অর্ডারের আগে জেনে নিন' })}</h2>
          <p className="mt-4 text-muted">
            {t({ en: 'Prefer to do it yourself? ', bn: 'নিজে করতে চান? ' })}
            <Link href="/templates" className="font-semibold text-leaf underline underline-offset-4">{t({ en: 'Templates start at ৳39', bn: 'টেমপ্লেট ৳৩৯ থেকে' })}</Link>
          </p>
        </div>
        <FaqList items={SERVICE_FAQ} />
      </section>
    </>
  );
}

export function ToolsPage() {
  const { t } = useLang();
  const title = t({ en: 'Free tools for job seekers', bn: 'চাকরিপ্রার্থীদের জন্য ফ্রি টুলস' });
  const intro = t({
    en: 'Free to use, no sign-up. Everything runs in your browser, so your files stay with you.',
    bn: 'বিনামূল্যে, সাইন-আপ ছাড়া। সবকিছু আপনার ব্রাউজারে চলে, তাই ফাইল আপনার কাছেই থাকে।',
  });
  useEffect(() => setPageMeta(title, intro, '/tools'), [title, intro]);

  const tools = [
    {
      href: '/builder',
      badge: <span className="font-display text-xl font-semibold text-white">CV</span>,
      tone: 'bg-leaf-dark',
      name: { en: 'CV builder', bn: 'সিভি বিল্ডার' },
      body: {
        en: 'Fill in a simple form, choose from 3 designs and download a print-ready PDF. Saved on your device.',
        bn: 'সহজ ফর্ম পূরণ করুন, ৩টি ডিজাইন থেকে বেছে নিন, প্রিন্ট-রেডি PDF ডাউনলোড করুন। আপনার ডিভাইসেই সেভ থাকে।',
      },
      cta: { en: 'Build my CV', bn: 'সিভি বানান' },
    },
    {
      href: '/tools/cv-checker',
      badge: <span className="font-display text-xl font-semibold text-leaf">86</span>,
      tone: 'bg-leaf-soft',
      name: { en: 'CV checker', bn: 'সিভি চেকার' },
      body: {
        en: 'Upload your CV as a PDF and get a score out of 100, with the exact fixes for ATS software and recruiters.',
        bn: 'PDF সিভি আপলোড করে ১০০-এর মধ্যে স্কোর পান, সাথে ATS সফটওয়্যার ও রিক্রুটারের জন্য নির্দিষ্ট সংশোধন।',
      },
      cta: { en: 'Check my CV', bn: 'সিভি চেক করুন' },
    },
    {
      href: '/tools/photo-signature-resizer',
      badge: <span className="font-display text-[0.8rem] font-semibold leading-tight text-gold">300<br />×300</span>,
      tone: 'bg-gold-soft',
      name: { en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' },
      body: {
        en: 'Exact Teletalk sizes for government job forms: photo 300×300 under 100 KB, signature 300×80 under 60 KB.',
        bn: 'সরকারি চাকরির টেলিটক ফর্মের সঠিক মাপ: ছবি ৩০০×৩০০ (১০০ KB-এর কম), স্বাক্ষর ৩০০×৮০ (৬০ KB-এর কম)।',
      },
      cta: { en: 'Resize a photo', bn: 'ছবি রিসাইজ করুন' },
    },
    {
      href: '/tools/application-letter',
      badge: <span className="font-display text-xl font-semibold text-leaf">✉</span>,
      tone: 'bg-leaf-soft',
      name: { en: 'Application letter generator', bn: 'আবেদনপত্র জেনারেটর' },
      body: {
        en: 'A neat application letter for a government or private job, in Bangla or English. Edit, copy or download as Word.',
        bn: 'সরকারি বা বেসরকারি চাকরির গোছানো আবেদনপত্র, বাংলা বা ইংরেজিতে। এডিট, কপি বা Word-এ ডাউনলোড করুন।',
      },
      cta: { en: 'Write a letter', bn: 'চিঠি লিখুন' },
    },
  ];

  return (
    <>
      <PageHead crumbs={[{ href: '/tools', label: { en: 'Free tools', bn: 'ফ্রি টুলস' } }]} title={title} intro={intro} />
      <section className="wrap grid gap-6 py-14 md:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group flex flex-col rounded-2xl bg-white p-8 ring-1 ring-line transition hover:ring-2 hover:ring-leaf">
            <span aria-hidden="true" className={`grid h-16 w-16 place-items-center rounded-xl text-center ${tool.tone}`}>{tool.badge}</span>
            <h2 className="mt-6 text-3xl group-hover:text-leaf">{t(tool.name)}</h2>
            <p className="mt-3 flex-1 text-muted">{t(tool.body)}</p>
            <p className="mt-6 font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">{t(tool.cta)}</p>
          </Link>
        ))}
      </section>
      <section className="wrap">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-leaf-dark px-7 py-8 text-white sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl">{t({ en: 'Need a better CV, not just a score?', bn: 'শুধু স্কোর নয়, ভালো সিভি দরকার?' })}</p>
            <p className="mt-1 text-white/75">{t({ en: 'Pick a ready template for ৳39, or have an expert write it.', bn: '৳৩৯-এ রেডি টেমপ্লেট নিন, অথবা বিশেষজ্ঞকে দিয়ে লেখান।' })}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/templates" className="btn bg-saffron text-ink hover:bg-white">{t({ en: 'See templates', bn: 'টেমপ্লেট দেখুন' })}</Link>
            <Link href="/services" className="btn border border-white/40 text-white hover:border-white">{t({ en: 'CV writing', bn: 'সিভি রাইটিং' })}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
