// Blog posts are plain markdown files in content/blog/. This file turns one file into a post and
// its body into safe HTML. It has no Node or browser imports, so the build (scripts/seo.ts,
// scripts/blog.ts) and the app (src/pages/Blog.tsx) use exactly the same code.
//
// Supported markdown: ## and ### headings, paragraphs, - and 1. lists, - [ ] checklists, tables,
// > quotes, ---, **bold**, *italic*, `code`, [links](/path or https://...). A line that is only
// **bold** becomes its own paragraph (used for FAQ questions). HTML comments are dropped.

export interface PostMeta {
  /** Plan id, e.g. P001. */
  id: string;
  title: string;
  slug: string;
  /** ISO date (Bangladesh time). The post goes live on this date. */
  publishDate: string;
  author: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  /** Where the post sends readers (shown in the plan only). */
  cta: string;
}

export interface Post extends PostMeta {
  /** Markdown body, without the front matter. */
  body: string;
  minutes: number;
}

const REQUIRED = ['id', 'title', 'slug', 'publishDate', 'metaTitle', 'metaDescription'] as const;

function value(raw: string): string | string[] {
  const v = raw.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
  }
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  return v;
}

/** Reads one markdown file with a simple `key: value` front matter. Throws a clear error when a required field is missing. */
export function parsePost(raw: string, fileName = 'post'): Post {
  const m = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${fileName}: front matter (--- ... ---) is missing`);
  const fields: Record<string, string | string[]> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1 || line.startsWith(' ')) continue;
    fields[line.slice(0, i).trim()] = value(line.slice(i + 1));
  }
  for (const k of REQUIRED) {
    if (typeof fields[k] !== 'string' || !fields[k]) throw new Error(`${fileName}: "${k}" is missing in the front matter`);
  }
  const str = (k: string) => (typeof fields[k] === 'string' ? (fields[k] as string) : '');
  const slug = str('slug');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${fileName}: slug "${slug}" must use a-z, 0-9 and hyphens only`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str('publishDate'))) throw new Error(`${fileName}: publishDate must look like 2026-11-22`);
  const body = m[2].replace(/<!--[\s\S]*?-->/g, '').trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    id: str('id'),
    title: str('title'),
    slug,
    publishDate: str('publishDate'),
    author: str('author'),
    primaryKeyword: str('primaryKeyword'),
    secondaryKeywords: Array.isArray(fields.secondaryKeywords) ? fields.secondaryKeywords : [],
    metaTitle: str('metaTitle'),
    metaDescription: str('metaDescription'),
    cta: str('cta'),
    body,
    minutes: readMinutes(words),
  };
}

/** Reading time in minutes for a word count. */
export const readMinutes = (words: number) => Math.max(1, Math.round(words / 180));

/** Posts whose date has come, newest first. `today` is an ISO date in Bangladesh time. */
export function publishedPosts<T extends { publishDate: string }>(posts: T[], today: string): T[] {
  return posts.filter((p) => p.publishDate <= today).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

/** Today's date in Bangladesh (UTC+6), as an ISO date. */
export function dhakaToday(now = Date.now()): string {
  return new Date(now + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface RenderOptions {
  /** Slugs of live posts. A link to /blog/<slug> that is not live yet is shown as plain text. */
  liveSlugs: ReadonlySet<string>;
}

function inline(text: string, opts: RenderOptions): string {
  const codes: string[] = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${c}</code>`);
    return `\uE000${codes.length - 1}\uE001`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
    const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
    const ok = href.startsWith('https://') || (href.startsWith('/') && !href.startsWith('//') && (!blog || opts.liveSlugs.has(blog[1])));
    if (!ok) return label;
    const ext = href.startsWith('https://') ? ' rel="noopener noreferrer" target="_blank"' : '';
    return `<a href="${href}"${ext}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>');
  return s.replace(/\uE000(\d+)\uE001/g, (_, i: string) => codes[Number(i)]);
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** Turns the post body into HTML. Everything is escaped first, so only the tags below can appear. */
export function renderMarkdown(md: string, opts: RenderOptions): string {
  const lines = md.replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^# /.test(line)) { i++; continue; } // the page title comes from the front matter
    const h = line.match(/^(#{2,3}) (.+)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2], opts)}</h${h[1].length}>`); i++; continue; }
    if (/^---+$/.test(line.trim())) { out.push('<hr />'); i++; continue; }
    if (line.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(q.join(' '), opts)}</p></blockquote>`);
      continue;
    }
    if (line.trim().startsWith('|') && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1] ?? '')) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c, opts)}</th>`).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c, opts)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*] /, ''));
      const check = items.every((x) => /^\[[ xX]\] /.test(x));
      out.push(
        `<ul${check ? ' class="checklist"' : ''}>${items
          .map((x) => (check ? `<li><span aria-hidden="true">☐</span> ${inline(x.slice(4), opts)}</li>` : `<li>${inline(x, opts)}</li>`))
          .join('')}</ul>`,
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ''));
      out.push(`<ol>${items.map((x) => `<li>${inline(x, opts)}</li>`).join('')}</ol>`);
      continue;
    }
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) { out.push(`<p class="q">${inline(line.trim(), opts)}</p>`); i++; continue; }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3} |>|---+$|\s*[-*] |\d+\. |\|)/.test(lines[i]) && !/^\*\*[^*]+\*\*$/.test(lines[i].trim())) para.push(lines[i++].trim());
    if (!para.length) { para.push(line.trim()); i++; }
    out.push(`<p>${inline(para.join(' '), opts)}</p>`);
  }
  return out.join('\n');
}
