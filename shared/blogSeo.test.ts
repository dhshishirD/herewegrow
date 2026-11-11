import { describe, expect, it } from 'vitest';
import { BLOG_AUTHOR, blogListPage, blogPostPage, blogSitemapXml, toPublic } from './blogSeo';
import type { Post } from './blogParse';

const post = (over: Partial<Post> = {}) => ({
  id: 'P001',
  title: 'সিভি লেখার নিয়ম',
  slug: 'cv-lekhar-niyom',
  publishDate: '2026-11-22',
  author: 'x',
  primaryKeyword: 'সিভি',
  secondaryKeywords: [],
  metaTitle: 'সিভি লেখার নিয়ম',
  metaDescription: 'বর্ণনা',
  cta: 'Builder',
  body: 'টেক্সট',
  minutes: 3,
  publishAt: Date.UTC(2026, 10, 22, 2),
  updatedAt: Date.UTC(2026, 10, 10),
  ...over,
});

describe('blog structured data and bylines', () => {
  it('never reports a post as modified before it was published', () => {
    const pub = toPublic(post(), false);
    expect(pub.publishedAt).toBe('2026-11-22T02:00:00.000Z');
    expect(pub.modifiedAt).toBe(pub.publishedAt);
    expect(toPublic(post({ updatedAt: Date.UTC(2026, 10, 25) }), false).modifiedAt).toBe('2026-11-25T00:00:00.000Z');
  });

  it('the sitemap carries the real last-modified day of each post', () => {
    const xml = blogSitemapXml([toPublic(post(), false), toPublic(post({ slug: 'b', updatedAt: Date.UTC(2026, 10, 30) }), false)]);
    expect(xml).toContain('<loc>https://herewegrow.pro/blog/cv-lekhar-niyom</loc><lastmod>2026-11-22</lastmod>');
    expect(xml).toContain('<loc>https://herewegrow.pro/blog/b</loc><lastmod>2026-11-30</lastmod>');
    expect(xml).toContain('<loc>https://herewegrow.pro/blog</loc><lastmod>2026-11-30</lastmod>');
  });

  it('a post page names the author and dates in both the text and the Article data', () => {
    const page = blogPostPage(toPublic(post({ updatedAt: Date.UTC(2026, 10, 25) }), true), new Set());
    expect(page.body).toContain(BLOG_AUTHOR.nameBn);
    expect(page.body).toContain('<time datetime="2026-11-22">');
    const article = page.jsonLd!.find((x) => (x as { '@type': string })['@type'] === 'Article') as Record<string, unknown>;
    expect(article.headline).toBe('সিভি লেখার নিয়ম');
    expect(article.datePublished).toBe('2026-11-22T02:00:00.000Z');
    expect(article.dateModified).toBe('2026-11-25T00:00:00.000Z');
    expect(article.author).toEqual({ '@type': 'Person', name: 'Daloyar Hassan Shishir', url: 'https://herewegrow.pro/about' });
    expect(article.image).toBe('https://herewegrow.pro/og.jpg');
  });

  it('the blog page lists each post with author and date, and describes them as BlogPosting data', () => {
    const page = blogListPage([toPublic(post(), false)]);
    expect(page.body).toContain(BLOG_AUTHOR.nameBn);
    expect(page.body).toContain('<time datetime="2026-11-22">');
    const blog = page.jsonLd!.find((x) => (x as { '@type': string })['@type'] === 'Blog') as { blogPost: Record<string, unknown>[] };
    expect(blog.blogPost).toHaveLength(1);
    expect(blog.blogPost[0]).toMatchObject({ '@type': 'BlogPosting', headline: 'সিভি লেখার নিয়ম', datePublished: '2026-11-22T02:00:00.000Z', url: 'https://herewegrow.pro/blog/cv-lekhar-niyom' });
    expect(blog.blogPost[0].author).toMatchObject({ name: 'Daloyar Hassan Shishir' });
  });

  it('an empty blog still produces valid data', () => {
    const page = blogListPage([]);
    expect(page.body).toContain('<ul></ul>');
    expect((page.jsonLd![0] as { blogPost: unknown[] }).blogPost).toEqual([]);
  });
});
