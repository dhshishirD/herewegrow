// Blog build step. Posts live in the database (see server/blogDb.ts). The markdown files in
// content/blog/ are only a starting set: the build writes them, with their text, to a private
// file (admin-blog-seed.json). The Worker never serves that file to the public (wrangler.toml
// run_worker_first); the admin "Import posts from files" button reads it once to fill the database.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { parsePost, type Post } from '../shared/blogParse';

const DIR = join(process.cwd(), 'content', 'blog');
export const SEED_FILE = 'admin-blog-seed.json';

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

export function blogSeed(): Plugin {
  return {
    name: 'hwg-blog-seed',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: SEED_FILE, source: JSON.stringify(loadAllPosts()) });
    },
  };
}
