import { useEffect } from 'react';
import { ServiceRateCard } from '../components/Catalog';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';

function PageHead({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="bg-mist">
      <div className="wrap py-12 md:py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { t } = useLang();
  const title = t({ en: 'CV writing and review', bn: 'সিভি রাইটিং ও রিভিউ' });
  const intro = t({
    en: 'Fixed prices, Word and PDF files, and changes included. Pay with bKash, Nagad or Rocket, then send your details on WhatsApp.',
    bn: 'নির্দিষ্ট দাম, Word ও PDF ফাইল, সংশোধনসহ। বিকাশ, নগদ বা রকেটে পেমেন্ট করে হোয়াটসঅ্যাপে তথ্য পাঠান।',
  });
  useEffect(() => setPageMeta(title, intro, '/services'), [title, intro]);

  return (
    <>
      <PageHead title={title} intro={intro} />
      <section className="wrap py-10"><ServiceRateCard /></section>
      <section className="wrap">
        <p className="max-w-2xl text-muted">
          {t({ en: 'Not sure which to choose? ', bn: 'কোনটি নেবেন বুঝতে পারছেন না? ' })}
          <Link href="/tools/cv-checker" className="font-semibold text-leaf underline underline-offset-4">
            {t({ en: 'Check your CV for free first', bn: 'আগে ফ্রিতে সিভি চেক করুন' })}
          </Link>
          {t({ en: ', then decide.', bn: ', তারপর সিদ্ধান্ত নিন।' })}
        </p>
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
      href: '/tools/cv-checker',
      name: { en: 'CV checker', bn: 'সিভি চেকার' },
      body: { en: 'A score out of 100 and a list of fixes for your CV.', bn: '১০০-এর মধ্যে স্কোর ও সিভির জন্য সংশোধনের তালিকা।' },
    },
    {
      href: '/tools/photo-signature-resizer',
      name: { en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' },
      body: { en: 'Exact sizes for Teletalk government job forms.', bn: 'টেলিটক সরকারি চাকরির ফর্মের সঠিক মাপ।' },
    },
  ];

  return (
    <>
      <PageHead title={title} intro={intro} />
      <section className="wrap grid gap-6 py-10 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block rounded-2xl p-7 ring-1 ring-line hover:ring-leaf">
            <h2 className="text-2xl font-bold group-hover:text-leaf">{t(tool.name)}</h2>
            <p className="mt-2 text-muted">{t(tool.body)}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
