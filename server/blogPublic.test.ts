import { describe, expect, it } from 'vitest';
import { parsePost } from '../shared/blogParse';
import { dhakaAt, seedPosts, setupBlogTables } from './blogDb';
import { blogSitemap, handleBlogApi, serveBlog, type BlogPublicEnv } from './blogPublic';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 23, 5);
const SHELL = '<!doctype html><html><head><title>x</title><meta name="description" content="x" /><meta property="og:title" content="x" /><meta property="og:description" content="x" /><meta property="og:url" content="x" /><meta property="og:image" content="x" /><link rel="canonical" href="x" /></head><body><div id="root"></div></body></html>';
const post = (id: string, date: string, extra = '') =>
  parsePost(`---\nid: ${id}\ntitle: "শিরোনাম ${id}"\nslug: post-${id.toLowerCase()}\npublishDate: ${date}\nauthor: লেখক\nprimaryKeyword: কী\nmetaTitle: "মেটা ${id}"\nmetaDescription: "বর্ণনা ${id}"\ncta: Builder\n---\n## শুরু\n\nবডি টেক্সট ${id} <script>alert(1)</script> ${extra}`, `${id}.md`);

const setup = async (shell: string | null = SHELL) => {
  const db = fakeD1();
  await setupBlogTables(db);
  await seedPosts(db, [post('P001', '2026-11-22'), post('P002', '2026-11-24', '[আগের](/blog/post-p001) [পরের](/blog/post-p002)')], NOW, null);
  const env: BlogPublicEnv = { DB: db, ASSETS: { fetch: async () => (shell === null ? new Response('no', { status: 404 }) : new Response(shell)) } };
  const get = (path: string, at = NOW) => serveBlog(new Request(`https://herewegrow.pro${path}`), env, path, at);
  return { db, env, get };
};

describe('GET /blog pages', () => {
  it('the list shows only live posts, with head tags and boot data', async () => {
    const { get } = await setup();
    const res = await get('/blog');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('post-p001');
    expect(html).not.toContain('post-p002');
    expect(html).toContain('id="blog-boot"');
    expect(html).toContain('<link rel="canonical" href="https://herewegrow.pro/blog" />');
  });

  it('a live post is rendered with its own title, canonical link and article data', async () => {
    const { get } = await setup();
    const html = await (await get('/blog/post-p001')).text();
    expect(html).toContain('<title>মেটা P001 | HereWeGrow</title>');
    expect(html).toContain('href="https://herewegrow.pro/blog/post-p001"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('<h1>শিরোনাম P001</h1>');
    expect(html).not.toContain('<script>alert(1)');
  });

  it('a post is a 404 before its time and live from the moment it is due', async () => {
    const { get } = await setup();
    expect((await get('/blog/post-p002')).status).toBe(404);
    expect((await get('/blog/post-p002', dhakaAt('2026-11-24') - 1)).status).toBe(404);
    const live = await get('/blog/post-p002', dhakaAt('2026-11-24'));
    expect(live.status).toBe(200);
    // links to a post that is not live yet are plain text; live ones stay links
    const html = await live.text();
    expect(html).toContain('href="/blog/post-p001"');
  });

  it('unknown or malformed paths are 404, and a database failure is 503, never a fake empty blog', async () => {
    const { get, env } = await setup();
    expect((await get('/blog/NOPE')).status).toBe(404);
    expect((await get('/blog/a/b')).status).toBe(404);
    const empty = fakeD1();
    await empty.prepare('DROP TABLE blog_posts').run();
    const broken = { ...env, DB: empty };
    const res = await serveBlog(new Request('https://herewegrow.pro/blog'), broken, '/blog', NOW);
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('60');
  });
});

describe('API and sitemap', () => {
  it('lists live posts without text and returns one live post with its text', async () => {
    const { env } = await setup();
    const list = (await (await handleBlogApi(new Request('https://x/api/blog/posts'), env, '/api/blog/posts', NOW)).json()) as { posts: Array<Record<string, unknown>>; liveSlugs: string[] };
    expect(list.posts.map((p) => p.slug)).toEqual(['post-p001']);
    expect(list.posts[0]).not.toHaveProperty('body');
    const one = await handleBlogApi(new Request('https://x/api/blog/posts/post-p001'), env, '/api/blog/posts/post-p001', NOW);
    expect(((await one.json()) as { post: { body: string } }).post.body).toContain('বডি টেক্সট');
    expect((await handleBlogApi(new Request('https://x/api/blog/posts/post-p002'), env, '/api/blog/posts/post-p002', NOW)).status).toBe(404);
    expect((await handleBlogApi(new Request('https://x/api/blog/posts', { method: 'POST' }), env, '/api/blog/posts', NOW)).status).toBe(405);
  });

  it('the sitemap has the blog page and live posts only', async () => {
    const { env } = await setup();
    const xml = await (await blogSitemap(env, NOW)).text();
    expect(xml).toContain('<loc>https://herewegrow.pro/blog</loc>');
    expect(xml).toContain('<loc>https://herewegrow.pro/blog/post-p001</loc>');
    expect(xml).not.toContain('post-p002');
  });
});
