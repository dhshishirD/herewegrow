// Blog build step. Reads content/blog/*.md and hands the posts that are live today to the app as
// the virtual module "virtual:blog-posts". A post whose publishDate is still in the future is not
// in the bundle, the sitemap or the pre-built pages. The daily deploy (see
// .github/workflows/daily-publish.yml) rebuilds the site so a post appears on its date.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { dhakaToday, parsePost, publishedPosts, type Post } from '../shared/blogParse';
import { toIndexEntry } from '../shared/blogAdmin';

const DIR = join(process.cwd(), 'content', 'blog');

export function loadAllPosts(dir = DIR): Post[] {
  const posts = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(readFileSync(join(dir, f), 'utf8'), f));
  const seen = new Set<string>();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`Two blog posts share the slug "${p.slug}"`);
    seen.add(p.slug);
  }
  return posts;
}

/** Live posts for a production build (set BLOG_TODAY=2026-11-22 to preview a later date); every post while developing, so drafts can be previewed. */
export function loadLivePosts(onlyLive = true): Post[] {
  const posts = loadAllPosts();
  return onlyLive ? publishedPosts(posts, process.env.BLOG_TODAY || dhakaToday()) : posts.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

const ID = 'virtual:blog-posts';
export const ADMIN_INDEX = 'admin-blog-index.json';

export function blogData(): Plugin {
  let serving = false;
  return {
    name: 'hwg-blog-data',
    configResolved(c) {
      serving = c.command === 'serve';
    },
    resolveId(id) {
      return id === ID ? `\0${ID}` : undefined;
    },
    load(id) {
      if (id !== `\0${ID}`) return undefined;
      this.addWatchFile(DIR);
      return `export default ${JSON.stringify(loadLivePosts(!serving))}`;
    },
    // Every post file, scheduled ones too, without bodies. The Worker never serves this file to the
    // public (wrangler.toml run_worker_first); it reads it only for a signed-in admin.
    generateBundle() {
      const index = loadAllPosts().map(toIndexEntry);
      this.emitFile({ type: 'asset', fileName: ADMIN_INDEX, source: JSON.stringify(index) });
    },
  };
}
