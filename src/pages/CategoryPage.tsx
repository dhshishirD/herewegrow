import { useEffect } from 'react';
import { PageHead } from '../components/PageHead';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { cardLine, categoryCards, categoryPath, findCategory } from '../../shared/categoryCopy';
import { NotFound } from './Policies';

/** Category buying guide, /templates/category/<slug>. Same copy as the prerendered HTML (shared/categoryHtml.ts). */
export function CategoryPage({ slug }: { slug: string }) {
  const c = findCategory(slug);
  useEffect(() => {
    if (c) setPageMeta(c.title, c.description, categoryPath(c.slug));
  }, [c]);
  if (!c) return <NotFound />;
  const cards = categoryCards(c);
  return (
    <>
      <PageHead
        title={c.h1}
        crumbs={[{ href: '/templates', label: { en: 'CV templates', bn: 'সিভি টেমপ্লেট' } }]}
        intro={<span className="block space-y-2">{c.intro.map((x) => <span key={x} className="block">{x}</span>)}</span>}
      />
      <div className="wrap space-y-10 py-8 text-base sm:space-y-12 sm:py-10">
        <ul id="templates" className="grid scroll-mt-24 grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3">
          {cards.map((k) => (
            <li key={k.id} className="space-y-2">
              <Link href={k.href} className="block overflow-hidden rounded-xl bg-mist p-3 ring-1 ring-line hover:ring-2 hover:ring-leaf">
                <img src={`/templates/${k.id}/thumb.webp`} alt={k.title} width={420} height={594} loading="lazy" decoding="async" className="aspect-[210/297] w-full bg-white object-cover object-top shadow-sm" />
              </Link>
              <h3 className="font-semibold"><Link href={k.href} className="hover:text-leaf">{k.title}</Link></h3>
              <p className="text-sm text-muted">{cardLine(k)}</p>
            </li>
          ))}
        </ul>
        <section id="choose" className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{c.chooseHeading}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">{c.choose.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
        <section id="faq" className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">{c.faqHeading}</h2>
          {c.faq.map((f) => (
            <div key={f.q} className="mt-4">
              <h3 className="text-lg font-semibold">{f.q}</h3>
              <p className="mt-1">{f.a}</p>
            </div>
          ))}
        </section>
        <p className="max-w-3xl"><Link href="/templates" className="font-semibold text-leaf hover:underline">সব সিভি টেমপ্লেট</Link></p>
      </div>
    </>
  );
}
