// Editable Word (.docx) file for the higher-study layouts (scholarship, academic): one column, education first,
// serif 11 pt, dates on the right through a tab stop. No tables except the referees, no text boxes, so nothing overlaps.
// Loaded on demand by word.ts when the layout is on.

import { AlignmentType, BorderStyle, Document, Footer, ImageRun, LevelFormat, Packer, Paragraph, TabStopType, Table, TableBorders, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from 'docx';
import { contactLine, degreeLine, personalRows } from './designs';
import { findFont } from './fonts';
import { HIGHER_LABELS_BN, HIGHER_LABELS_EN, REFEREES_ON_REQUEST } from './higherStudy';
import { LABELS, clampMargin, lines, list, type BuilderState } from './model';

const A4 = { width: 11906, height: 16838 };
const DEFAULT_MARGIN = 1000;
const TWIPS_PER_MM = 56.693;
const GREY = '52606D';

const hex = (c: string) => c.replace('#', '').toUpperCase();
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: none, bottom: none, left: none, right: none };
const imageType = (url: string): 'jpg' | 'png' | 'gif' => (/^data:image\/png/i.test(url) ? 'png' : /^data:image\/gif/i.test(url) ? 'gif' : 'jpg');
function dataUrlBytes(url: string): Uint8Array {
  const bin = atob(url.split(',')[1] ?? '');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function buildHigherStudyDocx(state: BuilderState, opts: { watermark?: boolean; brand?: string } = {}): Promise<Blob> {
  const d = state.data;
  const lang = state.headings ?? 'en';
  const L = { ...LABELS[lang], ...(lang === 'bn' ? HIGHER_LABELS_BN : HIGHER_LABELS_EN) } as Record<string, string>;
  const accent = hex(state.accent);
  const marginX = state.margins ? Math.round(clampMargin(state.margins.x) * TWIPS_PER_MM) : DEFAULT_MARGIN;
  const marginY = state.margins ? Math.round(clampMargin(state.margins.y) * TWIPS_PER_MM) : DEFAULT_MARGIN;
  const W = A4.width - marginX * 2;

  const run = (text: string, o: { bold?: boolean; italics?: boolean; color?: string; size?: number; allCaps?: boolean } = {}) => new TextRun({ text, ...o });
  const plain = (text: string, o: { color?: string; bold?: boolean; italics?: boolean; after?: number; keepNext?: boolean } = {}) =>
    new Paragraph({ keepNext: o.keepNext, spacing: { after: o.after ?? 40 }, children: [run(text, { color: o.color, bold: o.bold, italics: o.italics })] });
  const bullet = (text: string) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 20 }, children: [run(text)] });
  const detailParas = (text: string): Paragraph[] => {
    const items = lines(text);
    return items.length === 1 ? [plain(items[0])] : items.map(bullet);
  };
  const heading = (text: string) =>
    new Paragraph({ keepNext: true, spacing: { before: 240, after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 1 } }, children: [run(text, { bold: true, color: accent, allCaps: true })] });
  /** Title on the left, date flush right; a grey italic line and details under it. */
  const entry = (date: string, title: string, sub: string, text: string): Paragraph[] => [
    new Paragraph({
      keepNext: !!(sub || text),
      tabStops: [{ type: TabStopType.RIGHT, position: W }],
      spacing: { before: 60, after: 20 },
      children: [run(title, { bold: true }), ...(date ? [new TextRun({ text: `\t${date}` })] : [])],
    }),
    ...(sub ? [plain(sub, { italics: true, keepNext: !!text })] : []),
    ...detailParas(text),
  ];

  const body: (Paragraph | Table)[] = [];

  /* Header: name, headline, contact line, rule; a photo only if the person added one */
  const head: Paragraph[] = [new Paragraph({ spacing: { after: 40 }, children: [run(d.name || 'Your Name', { bold: true, size: 52, color: '111827' })] })];
  if (d.headline) head.push(new Paragraph({ spacing: { after: 40 }, children: [run(d.headline, { bold: true, color: accent })] }));
  const contact = contactLine(d).join('   |   ');
  if (contact) head.push(new Paragraph({ spacing: { after: 80 }, children: [run(contact, { color: GREY })] }));
  const photoW = 1500;
  const headBorders = { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 16, color: accent } };
  const cells = [new TableCell({ width: { size: d.photo ? W - photoW : W, type: WidthType.DXA }, borders: headBorders, margins: { top: 0, bottom: 80, left: 0, right: 0 }, children: head })];
  if (d.photo)
    cells.push(new TableCell({
      width: { size: photoW, type: WidthType.DXA }, borders: headBorders, margins: { top: 0, bottom: 80, left: 0, right: 0 },
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: 80, height: 80 } })] })],
    }));
  body.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: d.photo ? [W - photoW, photoW] : [W], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows: [new TableRow({ cantSplit: true, children: cells })] }));

  for (const k of d.order) {
    if (d.hidden.includes(k)) continue;
    if (k === 'summary' && d.summary) body.push(heading(L.summary), plain(d.summary));
    else if (k === 'experience' && d.experience.length)
      body.push(heading(L.experience), ...d.experience.flatMap((e) => entry([e.start, e.current ? L.present : e.end].filter(Boolean).join(' – '), e.role, [e.org, e.location].filter(Boolean).join(', '), e.bullets)));
    else if (k === 'education' && d.education.length)
      body.push(heading(L.education), ...d.education.flatMap((e) => entry(e.year, degreeLine(e.degree, e.major), [e.institution, e.result].filter(Boolean).join(', '), e.details)));
    else if (k === 'skills' && (d.skills || d.languages)) {
      body.push(heading(L.skills));
      if (d.skills) body.push(plain(list(d.skills).join(', ')));
      if (d.languages) body.push(new Paragraph({ spacing: { after: 40 }, children: [run(`${L.languages}: `, { bold: true }), run(d.languages)] }));
    } else if (k === 'training' && d.training.length)
      body.push(heading(L.training), ...d.training.flatMap((t) => entry(t.year, t.name, [t.org, t.duration].filter(Boolean).join(', '), t.details)));
    else if (k.startsWith('custom:')) {
      const c = d.custom.find((x) => `custom:${x.id}` === k);
      if (c && c.items.some((i) => i.title || i.details)) body.push(heading(c.title), ...c.items.flatMap((i) => entry(i.date, i.title, i.subtitle, i.details)));
    } else if (k === 'personal' && d.showPersonal) {
      const pr = personalRows(d, L);
      if (pr.length) body.push(heading(L.personal), ...pr.map(([a, v]) => new Paragraph({ spacing: { after: 20 }, children: [run(`${a}: `, { bold: true }), run(v)] })));
    } else if (k === 'references') {
      const refs = d.references.filter((r) => r.name || r.title || r.org || r.phone || r.email);
      if (d.refsOnRequest) body.push(heading(L.references), plain(REFEREES_ON_REQUEST[lang]));
      else if (refs.length) {
        body.push(heading(L.references));
        // Two referees side by side, as on the page
        const half = Math.floor(W / 2);
        const cell = (r?: (typeof refs)[number]) =>
          new TableCell({
            width: { size: half, type: WidthType.DXA }, borders: noBorders, margins: { top: 0, bottom: 60, left: 0, right: 200 },
            children: r
              ? [plain(r.name, { bold: true, after: 10 }), ...[r.title, r.org].filter(Boolean).map((x) => plain(x, { after: 10 })), ...([r.email, r.phone].filter(Boolean).length ? [plain([r.email, r.phone].filter(Boolean).join(', '), { color: GREY, after: 10 })] : [])]
              : [new Paragraph({ children: [] })],
          });
        const trs: TableRow[] = [];
        for (let i = 0; i < refs.length; i += 2) trs.push(new TableRow({ cantSplit: true, children: [cell(refs[i]), cell(refs[i + 1])] }));
        body.push(new Table({ width: { size: half * 2, type: WidthType.DXA }, columnWidths: [half, half], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows: trs }));
      }
    }
  }
  body.push(new Paragraph({ spacing: { before: 0, after: 0, line: 20 }, children: [new TextRun({ text: '', size: 2 })] }));
  if (opts.brand) body.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200 }, children: [run(opts.brand, { size: 14, color: '94A3B8' })] }));

  // Serif 11 pt: the chosen font, or Times New Roman
  const f = state.font && state.font !== 'default' ? findFont(state.font).word : 'Times New Roman';
  const doc = new Document({
    creator: 'HereWeGrow CV builder',
    title: `${d.name || 'My'} CV`,
    styles: { default: { document: { run: { font: { ascii: f, hAnsi: f, cs: 'Nirmala UI' }, size: 22 } } } },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
    sections: [{
      properties: { page: { size: A4, margin: { top: marginY, bottom: marginY, left: marginX, right: marginX } } },
      ...(opts.watermark ? { footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Made with HereWeGrow.pro', { size: 14, color: '94A3B8' })] })] }) } } : {}),
      children: body,
    }],
  });
  return Packer.toBlob(doc);
}
