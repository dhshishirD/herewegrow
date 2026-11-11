import { useEffect } from 'react';
import { CATEGORY_CONTENT } from '../../shared/categoryContent';
import { categoryLive, findCategoryPage, templatesOfCategory } from '../../shared/categoryPages';
import { PageHead } from '../components/PageHead';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { NotFound } from './Policies';
import { TemplateCard } from './Templates';

/** /templates/category/<slug>: Bangla introduction, the templates of one kind, and a few questions. */
export function CategoryPage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const cat = categoryLive(slug) ? findCategoryPage(slug) : undefined;
  useEffect(() => {
    if (cat) setPageMeta(cat.title.bn, '', `/templates/category/${slug}`);
  }, [cat, slug]);
  if (!cat) return <NotFound />;
  const content = CATEGORY_CONTENT[slug];
  const tpls = templatesOfCategory(slug);
  return (
    <>
      <PageHead
        crumbs={[{ href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } }]}
        title={cat.title.bn}
        intro={<p>{t({ en: `${tpls.length} editable Word templates`, bn: `Word-এ এডিটযোগ্য ${num(String(tpls.length), lang)}টি টেমপ্লেট` })}</p>}
      />
      <section className="wrap max-w-3xl py-10" lang="bn">
        {content.intro.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-lg leading-[1.85] first:mt-0">{p}</p>
        ))}
      </section>
      <section className="wrap pb-12">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {tpls.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/templates" className="font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">
            {t({ en: 'See all templates', bn: 'সব টেমপ্লেট দেখুন' })}
          </Link>
        </p>
      </section>
      <section className="wrap max-w-3xl pb-6" lang="bn">
        <h2 className="font-display text-2xl">সাধারণ প্রশ্ন</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {content.faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-xl text-leaf transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
