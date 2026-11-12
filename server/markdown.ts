// A small, safe Markdown-to-HTML converter for role pages.
// All text is HTML-escaped first, so raw HTML can never reach the page; links are limited to http(s).
// Supports: # / ## / ### headings, paragraphs, **bold**, *italic*, [text](https://link), - and 1. lists,
// > quotes and | pipe | tables (a header row, a |---| line, then rows).

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Links to the owner's own sites pass their reputation on; every other link is nofollow.
const OWN_SITE = /^https?:\/\/(www\.)?(herewegrow\.pro|dhshishir\.com)(\/|$)/i;
const cells = (row: string) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const TABLE_RULE = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function inline(escaped: string): string {
  return escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi, (_m, label: string, href: string) => `<a href="${href}" rel="${OWN_SITE.test(href) ? 'noopener' : 'noopener nofollow'}">${label}</a>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(>])\*([^*\s][^*]*?)\*(?=$|[\s).,;:!?<])/g, '$1<em>$2</em>');
}

export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  let quote: string[] = [];
  let table: string[][] | null = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(escapeHtml(para.join(' ')))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(escapeHtml(i))}</li>`).join('')}</${list.tag}>`);
    list = null;
  };

  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote><p>${inline(escapeHtml(quote.join(' ')))}</p></blockquote>`);
    quote = [];
  };
  const flushTable = () => {
    if (table) {
      const [head, ...rows] = table;
      const tr = (r: string[], tag: 'th' | 'td') => `<tr>${head.map((_h, i) => `<${tag}>${inline(escapeHtml(r[i] ?? ''))}</${tag}>`).join('')}</tr>`;
      out.push(`<div class="table-wrap"><table><thead>${tr(head, 'th')}</thead><tbody>${rows.map((r) => tr(r, 'td')).join('')}</tbody></table></div>`);
    }
    table = null;
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
    flushTable();
  };

  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].trim();
    if (table) {
      if (line.startsWith('|')) {
        table.push(cells(line));
        continue;
      }
      flushTable();
    }
    if (line.startsWith('|') && TABLE_RULE.test((lines[n + 1] ?? '').trim())) {
      flushAll();
      table = [cells(line)];
      n++; // the |---| line
      continue;
    }
    const quoted = /^>\s?(.*)$/.exec(line);
    if (quoted) {
      flushPara();
      flushList();
      if (quoted[1]) quote.push(quoted[1]);
      continue;
    }
    flushQuote();
    step(line);
  }
  flushAll();
  return out.join('\n');

  function step(line: string) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
    if (!line) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      const level = heading[1].length === 3 ? 3 : 2; // the page title is the only h1
      out.push(`<h${level}>${inline(escapeHtml(heading[2]))}</h${level}>`);
    } else if (bullet || numbered) {
      flushPara();
      const tag = bullet ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      list ??= { tag, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
}
