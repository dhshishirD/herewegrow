import type { Layout } from './cvAnalysis';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

const strip = (html: string) => decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/**
 * Turns the HTML that mammoth makes from a Word file into CV text and a layout estimate.
 * Paragraphs become lines; table cells on one row are separated by a tab (as the PDF reader does),
 * and a table row with real text on both sides counts as a side-by-side "column" row.
 */
export function htmlToCv(html: string): { text: string; layout: Layout } {
  const lines: string[] = [];
  let rows = 0;
  let splitRows = 0;

  const parts = html.split(/(<table[\s\S]*?<\/table>)/gi);
  for (const part of parts) {
    if (/^<table/i.test(part)) {
      for (const tr of part.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
        const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => strip(m[1])).filter(Boolean);
        if (!cells.length) continue;
        rows++;
        lines.push(cells.join('\t'));
        if (cells.length >= 2) {
          const left = cells.slice(0, -1).join(' ');
          const right = cells[cells.length - 1];
          const dateLike = right.length < 32 && /\b(19|20)\d{2}\b|present|current|dhaka|chattogram|bangladesh/i.test(right);
          if (!dateLike && left.length >= 4 && right.length >= 12) splitRows++;
        }
      }
    } else {
      for (const block of part.match(/<(p|h[1-6]|li)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? []) {
        const line = strip(block);
        if (!line) continue;
        rows++;
        lines.push(line);
      }
    }
  }
  return { text: lines.join('\n'), layout: { fromPdf: false, fromDocx: true, splitRowShare: rows ? splitRows / rows : 0 } };
}

/** Reads a Word (.docx) CV in the browser; the file is never uploaded. */
export async function readDocx(file: File): Promise<{ text: string; layout: Layout }> {
  const mammoth = (await import('mammoth/mammoth.browser.min.js')) as unknown as {
    convertToHtml: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const res = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  return htmlToCv(res.value);
}
