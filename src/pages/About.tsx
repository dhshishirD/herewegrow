import { useEffect } from 'react';
import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { PageHead } from '../components/PageHead';
import { EXPERT } from '../content/expert';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { track } from '../lib/track';

export function AboutPage() {
  const { t, lang } = useLang();
  const title = t({ en: 'About HereWeGrow', bn: 'HereWeGrow সম্পর্কে' });
  const intro = t({
    en: 'HereWeGrow is the online home of Career Solutions: CV writing, templates and free tools for job seekers in Bangladesh.',
    bn: 'HereWeGrow হলো Career Solutions-এর অনলাইন ঠিকানা: বাংলাদেশের চাকরিপ্রার্থীদের জন্য সিভি রাইটিং, টেমপ্লেট ও ফ্রি টুলস।',
  });
  useEffect(() => setPageMeta(title, intro, '/about'), [title, intro]);

  return (
    <>
      <PageHead crumbs={[{ href: '/about', label: { en: 'About', bn: 'আমাদের কথা' } }]} title={title} intro={intro} />
      <section className="wrap grid gap-12 py-16 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
        <div>
          <img src={EXPERT.photo} alt={t(EXPERT.name)} width={640} height={800} className="aspect-[4/5] w-full max-w-sm rounded-2xl object-cover shadow-lg ring-1 ring-line" />
          <p className="mt-5 font-display text-2xl">{t(EXPERT.name)}</p>
          <p className="text-muted">{t(EXPERT.role)}</p>
          <dl className="mt-6 grid max-w-sm grid-cols-3 gap-4 border-y border-line py-5">
            {EXPERT.facts.map((f) => (
              <div key={f.label.en}>
                <dt className="sr-only">{t(f.label)}</dt>
                <dd>
                  <span className="block font-display text-xl text-leaf">{t(f.value)}</span>
                  <span className="mt-0.5 block text-sm text-muted">{t(f.label)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl">{t({ en: 'Why I started this', bn: 'কেন শুরু করেছি' })}</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed">
            {EXPERT.story.map((p) => <p key={p.en}>{t(p)}</p>)}
          </div>
          <h3 className="mt-12 font-display text-2xl">{t({ en: 'What we help with', bn: 'যেসব কাজে সাহায্য করি' })}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {EXPERT.covers.map((c) => (
              <li key={c.en} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t(c)}
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/services" className="btn btn-primary">{t({ en: 'See CV services', bn: 'সিভি সার্ভিস দেখুন' })}</Link>
            <a href={whatsappLink('Hello, I would like to talk about my CV.')} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'about' })} className="btn btn-quiet bg-white">
              WhatsApp {num(SUPPORT_WHATSAPP_DISPLAY, lang)}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
