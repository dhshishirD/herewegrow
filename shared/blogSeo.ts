// The public blog pages as ready-made HTML (for search engines and link previews) and the blog sitemap.
// Pure functions: the Worker passes in the posts that are live right now.

import type { Post } from './blogParse';
import { renderMarkdown } from './blogParse';
import { SITE, esc, type HeadPage } from './pageHtml';
import { routeSeo } from './seo';

/** Every post is written by the founder: shown on cards and posts, and named in the structured data. */
export const BLOG_AUTHOR = { name: 'Daloyar Hassan Shishir', nameBn: 'দেলোয়ার হাসান শিশির', url: `${SITE}/about` } as const;
const authorLd = { '@type': 'Person', name: BLOG_AUTHOR.name, url: BLOG_AUTHOR.url };

/** What a visitor may see of a post. */
export interface PublicPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Bangladesh date it went live. */
  publishDate: string;
  /** ISO time it went live (for structured data). */
  publishedAt: string;
  modifiedAt: string;
  minutes: number;
  keywords: string[];
  /** Markdown body; only in the single-post response. */
  body?: string;
}

interface PostLike extends Pick<Post, 'slug' | 'title' | 'metaTitle' | 'metaDescription' | 'publishDate' | 'minutes' | 'primaryKeyword' | 'secondaryKeywords' | 'body'> {
  publishAt: number | null;
  updatedAt: number;
}

export function toPublic(p: PostLike, withBody: boolean): PublicPost {
  const out: PublicPost = {
    slug: p.slug,
    title: p.title,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    publishDate: p.publishDate,
    publishedAt: new Date(p.publishAt ?? 0).toISOString(),
    // A post edited before its publish time would otherwise be "modified" before it was published.
    modifiedAt: new Date(Math.max(p.updatedAt, p.publishAt ?? 0)).toISOString(),
    minutes: p.minutes,
    keywords: [p.primaryKeyword, ...p.secondaryKeywords].filter(Boolean),
  };
  if (withBody) out.body = p.body;
  return out;
}

const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});

const dayBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
/** Plain-HTML byline (author and date) for search engines; the app shows the same facts. */
const byline = (p: PublicPost) => `<p>${esc(BLOG_AUTHOR.nameBn)} · <time datetime="${esc(p.publishDate)}">${esc(dayBn(p.publishedAt))}</time></p>`;

const postLd = (p: PublicPost) => ({
  '@type': 'BlogPosting',
  headline: p.title,
  url: `${SITE}/blog/${p.slug}`,
  datePublished: p.publishedAt,
  dateModified: p.modifiedAt,
  author: authorLd,
  image: `${SITE}/og.jpg`,
});

export function blogListPage(posts: PublicPost[]): HeadPage {
  const seo = routeSeo('/blog')!;
  return {
    path: '/blog',
    ...seo,
    body: `<h1>ব্লগ: সিভি ও চাকরির গাইড</h1><ul>${posts.map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a>${byline(p)}<p>${esc(p.metaDescription)}</p></li>`).join('')}</ul>`,
    jsonLd: [
      {
        '@type': 'Blog',
        '@id': `${SITE}/blog#blog`,
        name: 'HereWeGrow blog',
        url: `${SITE}/blog`,
        inLanguage: 'bn',
        publisher: { '@id': `${SITE}/#org` },
        author: authorLd,
        blogPost: posts.map(postLd),
      },
      crumbs([['HereWeGrow', '/'], ['Blog', '/blog']]),
    ],
  };
}

export function blogPostPage(post: PublicPost, liveSlugs: ReadonlySet<string>): HeadPage {
  const url = `${SITE}/blog/${post.slug}`;
  return {
    path: `/blog/${post.slug}`,
    title: post.metaTitle.includes('HereWeGrow') ? post.metaTitle : `${post.metaTitle} | HereWeGrow`,
    description: post.metaDescription,
    body: `<article lang="bn"><h1>${esc(post.title)}</h1>${byline(post)}${renderMarkdown(post.body ?? '', { liveSlugs })}</article>`,
    jsonLd: [
      {
        '@type': 'Article',
        headline: post.title,
        description: post.metaDescription,
        inLanguage: 'bn',
        datePublished: post.publishedAt,
        dateModified: post.modifiedAt,
        mainEntityOfPage: url,
        image: `${SITE}/og.jpg`,
        keywords: post.keywords.join(', '),
        author: authorLd,
        publisher: { '@id': `${SITE}/#org` },
      },
      crumbs([['HereWeGrow', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
    ],
  };
}

/** /sitemap-blog.xml: the blog page and every live post. */
export function blogSitemapXml(posts: PublicPost[]): string {
  const last = posts.reduce((m, p) => (p.modifiedAt > m ? p.modifiedAt : m), '');
  const urls = [
    ...(posts.length ? [`  <url><loc>${SITE}/blog</loc><lastmod>${last.slice(0, 10)}</lastmod><priority>0.8</priority></url>`] : []),
    ...posts.map((p) => `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.modifiedAt.slice(0, 10)}</lastmod><priority>0.8</priority></url>`),
  ].join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}${urls ? '\n' : ''}</urlset>\n`;
}
