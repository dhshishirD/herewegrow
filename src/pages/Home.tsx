import { useEffect } from 'react';
import { PackGrid, ServiceRateCard } from '../components/Catalog';
import { ReviewedCv } from '../components/ReviewedCv';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';

const STEPS = [
  {
    title: { en: 'Choose a service or pack', bn: 'সার্ভিস বা প্যাক বেছে নিন' },
    body: { en: 'Prices are fixed and shown up front.', bn: 'দাম নির্দিষ্ট, আগেই দেখানো।' },
  },
  {
    title: { en: 'Pay with bKash, Nagad or Rocket', bn: 'বিকাশ, নগদ বা রকেটে পেমেন্ট' },
    body: { en: 'Payment is confirmed automatically.', bn: 'পেমেন্ট স্বয়ংক্রিয়ভাবে নিশ্চিত হয়।' },
  },
  {
    title: { en: 'Send your details on WhatsApp', bn: 'হোয়াটসঅ্যাপে তথ্য পাঠান' },
    body: { en: 'Your current CV, or answers to a short form.', bn: 'বর্তমান সিভি, বা একটি ছোট ফর্মের উত্তর।' },
  },
  {
    title: { en: 'Get your files', bn: 'ফাইল বুঝে নিন' },
    body: { en: 'Word and PDF, with changes included.', bn: 'Word ও PDF, সংশোধনসহ।' },
  },
];

const FAQ = [
  {
    q: { en: 'What is an ATS-friendly CV?', bn: 'ATS-ফ্রেন্ডলি সিভি কী?' },
    a: {
      en: 'Many banks and large companies use software that reads CVs before a person does. An ATS-friendly CV uses one column, real text and clear headings, so the software reads every line.',
      bn: 'অনেক ব্যাংক ও বড় প্রতিষ্ঠান মানুষের আগে সফটওয়্যার দিয়ে সিভি পড়ে। ATS-ফ্রেন্ডলি সিভিতে এক কলাম, আসল টেক্সট ও স্পষ্ট হেডিং থাকে, তাই সফটওয়্যার প্রতিটি লাইন পড়তে পারে।',
    },
  },
  {
    q: { en: 'Who writes my CV?', bn: 'আমার সিভি কে লিখবেন?' },
    a: {
      en: 'CVs are written and checked by the Career Solutions team, who have written CVs for bank, NGO, corporate and teaching roles.',
      bn: 'সিভি লেখেন ও যাচাই করেন Career Solutions টিম, যারা ব্যাংক, এনজিও, কর্পোরেট ও শিক্ষকতার পদের জন্য সিভি লিখে আসছেন।',
    },
  },
  {
    q: { en: 'Can I edit the templates myself?', bn: 'টেমপ্লেট কি নিজে এডিট করতে পারব?' },
    a: {
      en: 'Yes. Every template comes as an editable Word file, and opens in Microsoft Word, WPS Office or Google Docs, including on a phone.',
      bn: 'হ্যাঁ। প্রতিটি টেমপ্লেট এডিটযোগ্য Word ফাইল, যা মোবাইলসহ Microsoft Word, WPS Office বা Google Docs-এ খোলে।',
    },
  },
  {
    q: { en: 'What if the payment goes through but I see an error?', bn: 'টাকা কেটে গেছে কিন্তু এরর দেখাচ্ছে, কী করব?' },
    a: {
      en: 'Send your transaction ID on WhatsApp. We check it against the payment record and confirm your order the same day.',
      bn: 'হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান। পেমেন্ট রেকর্ডের সাথে মিলিয়ে একই দিনে অর্ডার নিশ্চিত করা হবে।',
    },
  },
];

export function Home() {
  const { t } = useLang();

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

  return (
    <>
      {/* Hero */}
      <section className="bg-mist">
        <div className="wrap grid items-center gap-12 py-14 md:grid-cols-[1.05fr_1fr] md:py-20">
          <div>
            <h1 className="text-[2.6rem] font-bold leading-[1.08] sm:text-6xl">
              {t({ en: 'A CV that gets you called for the interview.', bn: 'যে সিভি দেখে ইন্টারভিউয়ের ডাক আসে।' })}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {t({
                en: 'Expert CV writing, ready-to-edit templates and free tools, made for job seekers in Bangladesh. Pay with bKash or Nagad.',
                bn: 'বাংলাদেশের চাকরিপ্রার্থীদের জন্য বিশেষজ্ঞের সিভি রাইটিং, এডিট-রেডি টেমপ্লেট ও ফ্রি টুলস। বিকাশ বা নগদে পেমেন্ট করুন।',
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tools/cv-checker" className="btn btn-primary">
                {t({ en: 'Check my CV for free', bn: 'ফ্রিতে সিভি চেক করুন' })}
              </Link>
              <Link href="/services" className="btn btn-quiet bg-white">
                {t({ en: 'See CV writing prices', bn: 'সিভি রাইটিংয়ের দাম দেখুন' })}
              </Link>
            </div>
          </div>
          <ReviewedCv />
        </div>
      </section>

      {/* How an order works: a real sequence */}
      <section className="wrap py-16">
        <h2 className="text-3xl font-bold">{t({ en: 'How an order works', bn: 'অর্ডার যেভাবে কাজ করে' })}</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title.en} className="border-l-2 border-leaf pl-4">
              <p className="font-display text-sm font-semibold text-leaf">{t({ en: `Step ${i + 1}`, bn: `ধাপ ${['১', '২', '৩', '৪'][i]}` })}</p>
              <h3 className="mt-1 text-lg font-bold">{t(s.title)}</h3>
              <p className="mt-1 text-muted">{t(s.body)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Services */}
      <section id="services" className="wrap py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{t({ en: 'CV writing and review', bn: 'সিভি রাইটিং ও রিভিউ' })}</h2>
            <p className="mt-2 max-w-2xl text-muted">
              {t({
                en: 'A person who writes CVs every day works on yours. Prices include Word and PDF files.',
                bn: 'প্রতিদিন সিভি লেখেন এমন একজন আপনার সিভিতে কাজ করবেন। দামে Word ও PDF ফাইল অন্তর্ভুক্ত।',
              })}
            </p>
          </div>
        </div>
        <div className="mt-8"><ServiceRateCard /></div>
      </section>

      {/* Templates */}
      <section className="wrap py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{t({ en: 'Edit-it-yourself templates', bn: 'নিজে এডিট করার টেমপ্লেট' })}</h2>
            <p className="mt-2 max-w-2xl text-muted">
              {t({
                en: 'Word files you fill in on a computer or phone. ATS-safe styles are labelled so you know which to send online.',
                bn: 'কম্পিউটার বা মোবাইলে পূরণ করার Word ফাইল। অনলাইনে কোনটি পাঠাবেন বুঝতে ATS-নিরাপদ স্টাইল আলাদা করে চিহ্নিত।',
              })}
            </p>
          </div>
          <Link href="/templates" className="font-display font-semibold text-leaf underline decoration-2 underline-offset-4">
            {t({ en: 'All template packs', bn: 'সব টেমপ্লেট প্যাক' })}
          </Link>
        </div>
        <div className="mt-6"><PackGrid limit={4} /></div>
      </section>

      {/* Free tools */}
      <section className="bg-leaf-soft/60">
        <div className="wrap py-16">
          <h2 className="text-3xl font-bold">{t({ en: 'Free tools for your application', bn: 'আবেদনের জন্য ফ্রি টুলস' })}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Link href="/tools/cv-checker" className="group block rounded-2xl bg-white p-7 ring-1 ring-line hover:ring-leaf">
              <h3 className="text-2xl font-bold group-hover:text-leaf">{t({ en: 'CV checker', bn: 'সিভি চেকার' })}</h3>
              <p className="mt-2 text-muted">
                {t({
                  en: 'Upload your CV as a PDF and get a score with the exact fixes to make. Your file never leaves your phone or computer.',
                  bn: 'PDF সিভি আপলোড করুন, স্কোর ও কী ঠিক করতে হবে তা দেখুন। আপনার ফাইল আপনার মোবাইল বা কম্পিউটারের বাইরে যায় না।',
                })}
              </p>
            </Link>
            <Link href="/tools/photo-signature-resizer" className="group block rounded-2xl bg-white p-7 ring-1 ring-line hover:ring-leaf">
              <h3 className="text-2xl font-bold group-hover:text-leaf">{t({ en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' })}</h3>
              <p className="mt-2 text-muted">
                {t({
                  en: 'Photo 300×300 under 100 KB and signature 300×80 under 60 KB, as Teletalk government job forms ask.',
                  bn: 'টেলিটক সরকারি চাকরির ফর্মের মাপে ছবি ৩০০×৩০০ (১০০ KB-এর কম) ও স্বাক্ষর ৩০০×৮০ (৬০ KB-এর কম)।',
                })}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap py-16">
        <h2 className="text-3xl font-bold">{t({ en: 'Questions people ask', bn: 'যে প্রশ্নগুলো বেশি আসে' })}</h2>
        <div className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q.en} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {t(f.q)}
                <span aria-hidden="true" className="text-2xl text-leaf transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-muted">{t(f.a)}</p>
            </details>
          ))}
        </div>
        <p className="mt-8">
          {t({ en: 'Something else?', bn: 'অন্য কোনো প্রশ্ন?' })}{' '}
          <a href={whatsappLink('Hello HereWeGrow, I have a question.')} target="_blank" rel="noreferrer" className="font-semibold text-leaf underline underline-offset-4">
            {t({ en: 'Ask on WhatsApp', bn: 'হোয়াটসঅ্যাপে জিজ্ঞেস করুন' })}
          </a>
        </p>
      </section>
    </>
  );
}
