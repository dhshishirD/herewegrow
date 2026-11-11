// The public blog pages as ready-made HTML (for search engines and link previews) and the blog sitemap.
// Pure functions: the Worker passes in the posts that are live right now.

import type { Post } from './blogParse';
import { renderMarkdown } from './blogParse';
import { SITE, esc, type HeadPage } from './pageHtml';
import { TITLE_MAX, fit, routeSeo } from './seo';

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
    modifiedAt: new Date(p.updatedAt).toISOString(),
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

export function blogListPage(posts: PublicPost[]): HeadPage {
  const seo = routeSeo('/blog')!;
  return {
    path: '/blog',
    ...seo,
    body: `<h1>ব্লগ: সিভি ও চাকরির গাইড</h1><ul>${posts.map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a>: ${esc(p.metaDescription)}</li>`).join('')}</ul>`,
    jsonLd: [crumbs([['HereWeGrow', '/'], ['Blog', '/blog']])],
  };
}

export function blogPostPage(post: PublicPost, liveSlugs: ReadonlySet<string>): HeadPage {
  const url = `${SITE}/blog/${post.slug}`;
  return {
    path: `/blog/${post.slug}`,
    title: post.metaTitle.includes('HereWeGrow') ? post.metaTitle : fit(TITLE_MAX, `${post.metaTitle} | HereWeGrow`, post.metaTitle),
    description: post.metaDescription,
    body: `<article lang="bn"><h1>${esc(post.title)}</h1>${renderMarkdown(post.body ?? '', { liveSlugs })}</article>`,
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
        author: { '@type': 'Person', name: 'Daloyar Hassan Shishir', url: `${SITE}/about` },
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
