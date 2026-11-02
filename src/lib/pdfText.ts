import type { Layout } from './cvAnalysis';

interface Item {
  str: string;
  x: number;
  y: number;
  w: number;
}

/**
 * Reads the text of a PDF in the browser (the file is never uploaded)
 * and estimates whether the layout uses side-by-side columns.
 */
export async function readPdf(file: File): Promise<{ text: string; layout: Layout }> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: string[] = [];
  let rows = 0;
  let splitRows = 0;

  for (let p = 1; p <= Math.min(doc.numPages, 6); p++) {
    const page = await doc.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();
    const items: Item[] = [];
    for (const it of content.items) {
      if (!('str' in it) || !it.str.trim()) continue;
      items.push({ str: it.str, x: it.transform[4], y: Math.round(it.transform[5] / 3) * 3, w: it.width });
    }

    // Group into visual rows by y position
    const byRow = new Map<number, Item[]>();
    for (const it of items) byRow.set(it.y, [...(byRow.get(it.y) ?? []), it]);
    const sortedRows = [...byRow.entries()].sort((a, b) => b[0] - a[0]);

    for (const [, rowItems] of sortedRows) {
      rowItems.sort((a, b) => a.x - b.x);
      rows++;
      for (let i = 1; i < rowItems.length; i++) {
        const prev = rowItems[i - 1];
        if (rowItems[i].x - (prev.x + prev.w) > width * 0.18) {
          const left = rowItems.slice(0, i).map((r) => r.str).join(' ').trim();
          const right = rowItems.slice(i).map((r) => r.str).join(' ').trim();
          // Right-aligned dates or places on a one-column CV are fine; real columns carry text on both sides.
          const dateLike = right.length < 32 && /\b(19|20)\d{2}\b|present|current|dhaka|chattogram|bangladesh/i.test(right);
          if (!dateLike && left.length >= 4 && right.length >= 12) splitRows++;
          break;
        }
      }
      // Wide gaps become tabs, so columns such as "Job title<tab>2024" stay apart for the CV builder's import.
      let line = '';
      rowItems.forEach((r, i) => {
        if (i > 0) {
          const prev = rowItems[i - 1];
          line += r.x - (prev.x + prev.w) > 14 ? '\t' : ' ';
        }
        line += r.str;
      });
      lines.push(line.replace(/ {2,}/g, ' '));
    }
  }

  return {
    text: lines.join('\n'),
    layout: { fromPdf: true, splitRowShare: rows ? splitRows / rows : 0 },
  };
}
