import { useEffect, useMemo, type MouseEvent } from 'react';
import posts from 'virtual:blog-posts';
import { renderMarkdown, type Post } from '../../shared/blogParse';
import { PageHead } from '../components/PageHead';
import { EXPERT } from '../content/expert';
import { num, useLang } from '../lib/lang';
import { Link, navigate } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { NotFound } from './Policies';

const BLOG_CRUMB = { href: '/blog', label: { en: 'Blog', bn: 'ব্লগ' } };
const liveSlugs: ReadonlySet<string> = new Set(posts.map((p) => p.slug));

const dateLabel = (iso: string, lang: 'en' | 'bn') =>
  new Date(iso).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function minutes(p: Post, t: (x: { en: string; bn: string }) => string, lang: 'en' | 'bn') {
  return t({ en: `${p.minutes} min read`, bn: `${num(String(p.minutes), lang)} মিনিটে পড়ুন` });
}

export function BlogPage() {
  const { t, lang } = useLang();
  const title = t({ en: 'Blog', bn: 'ব্লগ: সিভি ও চাকরির গাইড' });
  const intro = t({
    en: 'Practical Bangla guides on CVs, applications and interviews, with samples and checklists.',
    bn: 'সিভি, দরখাস্ত, আবেদন ও ইন্টারভিউয়ের কাজের গাইড, নমুনা ও চেকলিস্টসহ।',
  });
  useEffect(() => setPageMeta(title, intro, '/blog'), [title, intro]);

  return (
    <>
      <PageHead crumbs={[]} title={title} intro={intro} />
      <section className="wrap py-14">
        {posts.length === 0 && <p className="text-muted">{t({ en: 'The first posts are coming soon.', bn: 'প্রথম পোস্টগুলো শিগগিরই আসছে।' })}</p>}
        <ul className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-line transition hover:ring-2 hover:ring-leaf">
                <p className="text-sm text-muted">
                  <time dateTime={p.publishDate}>{dateLabel(p.publishDate, lang)}</time> · {minutes(p, t, lang)}
                </p>
                <h2 className="mt-2 text-2xl leading-snug group-hover:text-leaf">{p.title}</h2>
                <p className="mt-3 flex-1 text-muted">{p.metaDescription}</p>
                <p className="mt-5 font-display font-semibold text-leaf underline decoration-2 underline-offset-[6px]">{t({ en: 'Read the post', bn: 'পোস্টটি পড়ুন' })}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const post = posts.find((p) => p.slug === slug);
  const html = useMemo(() => (post ? renderMarkdown(post.body, { liveSlugs }) : ''), [post]);
  useEffect(() => {
    if (post) setPageMeta(post.metaTitle, post.metaDescription, `/blog/${post.slug}`);
  }, [post]);
  if (!post) return <NotFound />;
  const more = posts.filter((x) => x.slug !== post.slug).slice(0, 3);

  // The body is plain HTML, so same-site links are handled here to keep page changes instant.
  const onClick = (e: MouseEvent<HTMLElement>) => {
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href');
    if (!a || !href?.startsWith('/') || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      <PageHead
        crumbs={[BLOG_CRUMB]}
        title={post.title}
        intro={
          <p className="flex flex-wrap items-center gap-3 text-base">
            <img src={EXPERT.photoSquare} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span>{t(EXPERT.name)}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={post.publishDate}>{dateLabel(post.publishDate, lang)}</time>
            <span aria-hidden="true">/</span>
            <span>{minutes(post, t, lang)}</span>
          </p>
        }
      />
      {/* eslint-disable-next-line */}
      <article lang="bn" className="blog-prose wrap max-w-3xl py-12 text-lg leading-[1.85]" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />

      <section className="wrap max-w-3xl pb-6">
        {more.length > 0 && (
          <>
            <h2 className="font-display text-2xl">{t({ en: 'More posts', bn: 'আরও পোস্ট' })}</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {more.map((x) => (
                <li key={x.slug}>
                  <Link href={`/blog/${x.slug}`} className="block py-4 text-lg font-semibold hover:text-leaf">{x.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
