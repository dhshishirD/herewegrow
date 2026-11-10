// Blog posts are plain markdown files in content/blog/. This file turns one file into a post and
// its body into safe HTML. It has no Node or browser imports, so the build (scripts/seo.ts,
// scripts/blog.ts) and the app (src/pages/Blog.tsx) use exactly the same code.
//
// Supported markdown: ## and ### headings, paragraphs, - and 1. lists, - [ ] checklists, tables,
// > quotes, ---, **bold**, *italic*, `code`, [links](/path or https://...). A line that is only
// **bold** becomes its own paragraph (used for FAQ questions). HTML comments are dropped.
// Two safe visual blocks, written between ":::bar" / ":::stats" and ":::" lines (see vizBlock below):
//   :::bar          title: ...   note: ...   unit: %   then one "label | number" row per line
//   :::stats        one "big text | small text" row per line

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


const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bn = (s: string) => s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** Builds a bar chart or a row of stat tiles from the lines of a ":::bar" / ":::stats" block. Text is escaped; widths are numbers. */
function vizBlock(kind: 'bar' | 'stats', body: string[], opts: RenderOptions): string {
  if (kind === 'stats') {
    const tiles = body
      .map((l) => l.split('|').map((x) => x.trim()))
      .filter((c) => c.length >= 2 && c[0] && c[1])
      .map((c, i) => `<div class="viz-tile" style="--i:${i}"><b>${esc(c[0])}</b><span>${inline(c.slice(1).join(' | '), opts)}</span></div>`);
    return tiles.length ? `<div class="viz-stats">${tiles.join('')}</div>` : '';
  }
  let title = '';
  let note = '';
  let unit = '';
  const rows: { label: string; value: number }[] = [];
  for (const l of body) {
    const meta = l.match(/^(title|note|unit):\s*(.*)$/);
    if (meta) {
      if (meta[1] === 'title') title = meta[2].trim();
      else if (meta[1] === 'note') note = meta[2].trim();
      else unit = meta[2].trim();
      continue;
    }
    const i = l.lastIndexOf('|');
    const num = i > 0 ? l.slice(i + 1).trim() : '';
    if (i > 0 && /^\d+(\.\d+)?$/.test(num)) rows.push({ label: l.slice(0, i).trim(), value: Number(num) });
  }
  if (!rows.length) return '';
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  const aria = `${title ? title + ': ' : ''}${rows.map((r) => `${r.label} ${bn(String(r.value))}${unit}`).join(', ')}`;
  const bars = rows
    .map((r, i) => {
      const w = Math.round((r.value / max) * 1000) / 10;
      const val = esc(bn(String(r.value)) + unit);
      return `<div class="viz-row" style="--i:${i}" title="${esc(r.label)}: ${val}"><span class="viz-l">${esc(r.label)}</span><span class="viz-trk"><i class="viz-fill" style="--v:${w}"></i><span class="viz-val">${val}</span></span></div>`;
    })
    .join('');
  return `<figure class="viz" role="img" aria-label="${esc(aria)}">${title ? `<figcaption class="viz-t">${esc(title)}</figcaption>` : ''}${note ? `<figcaption class="viz-s">${esc(note)}</figcaption>` : ''}${bars}</figure>`;
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
    const block = line.trim().match(/^:::(bar|stats)$/);
    if (block) {
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') body.push(lines[i++].trim());
      i++; // the closing :::
      const html = vizBlock(block[1] as 'bar' | 'stats', body, opts);
      if (html) out.push(html);
      continue;
    }
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
    while (i < lines.length && lines[i].trim() && !/^(#{1,3} |>|---+$|\s*[-*] |\d+\. |\||:::)/.test(lines[i]) && !/^\*\*[^*]+\*\*$/.test(lines[i].trim())) para.push(lines[i++].trim());
    if (!para.length) { para.push(line.trim()); i++; }
    out.push(`<p>${inline(para.join(' '), opts)}</p>`);
  }
  return out.join('\n');
}
