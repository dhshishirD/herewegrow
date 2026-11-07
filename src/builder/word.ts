import { findFont } from './fonts';
// Builds an editable Word (.docx) version of the CV in the browser.
// Loaded only when someone asks for a Word file, so the builder page stays light.
// Sidebar designs (Modern, Graphite, Corporate, Pulse) come out as a real two-column Word table with a
// shaded sidebar, so the file matches the preview. Every other design uses the one-column layout,
// which is the easiest to edit and ATS-safe.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeightRule,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  TabStopType,
  TextRun,
  WidthType,
} from 'docx';
import type { DesignId } from '../../shared/designList';
import { contactLine, degreeLine, personalRows } from './designs';
import { LABELS, clampMargin, lines, list, type BuilderState, type CvData } from './model';

const A4 = { width: 11906, height: 16838 };
const MARGIN = 1000; // about 1.76 cm, used until the person picks a margin
const TWIPS_PER_MM = 56.693;
const PX = 15; // one CSS pixel in twips

const hex = (c: string) => c.replace('#', '').toUpperCase();

/** Mixes a colour with white: amount 0.08 gives the soft tint the preview uses for light sidebars. */
function tint(color: string, amount: number): string {
  const n = parseInt(hex(color), 16);
  const ch = (shift: number) => {
    const v = (n >> shift) & 255;
    return Math.round(255 - (255 - v) * amount).toString(16).padStart(2, '0');
  };
  return `${ch(16)}${ch(8)}${ch(0)}`.toUpperCase();
}

function dataUrlBytes(url: string): Uint8Array {
  const b64 = url.split(',')[1] ?? '';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const imageType = (url: string): 'jpg' | 'png' | 'gif' => (/^data:image\/png/i.test(url) ? 'png' : /^data:image\/gif/i.test(url) ? 'gif' : 'jpg');

/** How a sidebar design looks in Word. Mirrors Modern, Graphite, Corporate and Pulse in designs.tsx. */
interface SidebarSpec {
  side: 'left' | 'right';
  widthPx: number;
  fill: string;
  text: string;
  /** Colour of the small sidebar headings. */
  head: string;
  muted: string;
  /** Whether references sit in the sidebar (Modern, Graphite, Pulse) or stay in the main column (Corporate). */
  refs: boolean;
  /** Corporate and Pulse underline their sidebar headings. */
  rule: boolean;
}

export function sidebarSpec(design: DesignId, accent: string): SidebarSpec | null {
  const a = hex(accent);
  if (design === 'modern') return { side: 'left', widthPx: 250, fill: a, text: 'FFFFFF', head: 'FFFFFF', muted: 'E5E7EB', refs: true, rule: false };
  if (design === 'graphite') return { side: 'left', widthPx: 250, fill: '1F2933', text: 'FFFFFF', head: 'FFFFFF', muted: 'CBD2D9', refs: true, rule: false };
  if (design === 'corporate') return { side: 'right', widthPx: 236, fill: tint(a, 0.07), text: '1F2933', head: a, muted: '52606D', refs: false, rule: true };
  if (design === 'pulse') return { side: 'right', widthPx: 236, fill: tint(a, 0.06), text: '1F2933', head: a, muted: '52606D', refs: true, rule: false };
  return null;
}

/** watermark: free downloads carry a small "Made with HereWeGrow.pro" footer; Pro files do not. */
export async function buildDocx(state: BuilderState, opts: { watermark?: boolean } = {}): Promise<Blob> {
  const d = state.data;
  const L = LABELS[state.headings ?? 'en'];
  const accent = hex(state.accent);
  const grey = '52606D';
  const marginX = state.margins ? Math.round(clampMargin(state.margins.x) * TWIPS_PER_MM) : MARGIN;
  const marginY = state.margins ? Math.round(clampMargin(state.margins.y) * TWIPS_PER_MM) : MARGIN;
  const side = sidebarSpec(state.design, state.accent);
  const sideW = side ? side.widthPx * PX : 0;
  // Width of the column the main text lives in, used for right-aligned dates
  const SIDE_PAD = 26 * PX;
  const mainPadL = side?.side === 'left' ? 40 * PX : marginX;
  const mainPadR = side?.side === 'right' ? 34 * PX : marginX;
  const CONTENT = side ? A4.width - sideW - mainPadL - mainPadR : A4.width - marginX * 2;

  const heading = (text: string) =>
    new Paragraph({
      keepNext: true, // a heading never sits alone at the bottom of a page
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 2 } },
      children: [new TextRun({ text: (state.headings ?? 'en') === 'en' ? text.toUpperCase() : text, bold: true, color: accent, size: 22 })],
    });

  /** A line with text on the left and something (dates, year) right-aligned. */
  const leftRight = (left: TextRun[], right: string) =>
    new Paragraph({
      keepNext: true,
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }],
      spacing: { after: 20 },
      children: [...left, ...(right ? [new TextRun({ text: `\t${right}`, color: grey })] : [])],
    });

  const bullet = (text: string) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 20 }, children: [new TextRun(text)] });
  const plain = (text: string, o: { color?: string; bold?: boolean } = {}) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text, ...o })] });

  const personalTable = (out: Paragraph[], rows: [string, string][]) => {
    for (const [a, v] of rows) out.push(new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: 2600 }], spacing: { after: 20 }, children: [new TextRun({ text: a, color: grey }), new TextRun(`\t${v}`)] }));
  };

  const details = (out: Paragraph[], text: string) => {
    const items = lines(text);
    if (items.length === 1) out.push(plain(items[0]));
    else for (const x of items) out.push(bullet(x));
  };
  const entry = (out: Paragraph[], title: string, sub: string, date: string, text: string) => {
    out.push(leftRight([new TextRun({ text: title, bold: true })], date));
    if (sub) out.push(plain(sub, { color: grey }));
    details(out, text);
    out.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  };

  const referenceBlock = (out: Paragraph[], r: CvData['references'][number], color: { main?: string; muted: string }) => {
    out.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: r.name, bold: true, color: color.main })] }));
    for (const x of [r.title, r.org]) if (x) out.push(plain(x, { color: color.main }));
    const c = [r.phone, r.email].filter(Boolean).join(', ');
    if (c) out.push(plain(c, { color: color.muted }));
    if (r.relation) out.push(plain(r.relation, { color: color.muted }));
    out.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  };

  /** Main text column: every section, in the person's order, except those the sidebar already shows. */
  const sections = (out: Paragraph[], skip: string[]) => {
    for (const k of d.order) {
      if (d.hidden.includes(k) || skip.includes(k)) continue;
      if (k === 'summary' && d.summary) out.push(heading(L.summary), plain(d.summary));
      if (k === 'experience' && d.experience.length) {
        out.push(heading(L.experience));
        for (const e of d.experience) entry(out, e.role, [e.org, e.location].filter(Boolean).join(', '), [e.start, e.current ? L.present : e.end].filter(Boolean).join(' – '), e.bullets);
      }
      if (k === 'education' && d.education.length) {
        out.push(heading(L.education));
        for (const e of d.education) entry(out, degreeLine(e.degree, e.major), [e.institution, e.result].filter(Boolean).join(', '), e.year, e.details);
      }
      if (k === 'skills' && (d.skills || d.languages)) {
        out.push(heading(L.skills));
        if (d.skills) out.push(plain(list(d.skills).join(', ')));
        if (d.languages) out.push(new Paragraph({ children: [new TextRun({ text: `${L.languages}: `, bold: true }), new TextRun(d.languages)] }));
      }
      if (k === 'training' && d.training.length) {
        out.push(heading(L.training));
        for (const t of d.training) entry(out, t.name, [t.org, t.duration].filter(Boolean).join(', '), t.year, t.details);
      }
      if (k.startsWith('custom:')) {
        const c = d.custom.find((x) => `custom:${x.id}` === k);
        if (c && c.items.some((i) => i.title || i.details)) {
          out.push(heading(c.title));
          for (const i of c.items) entry(out, i.title, i.subtitle, i.date, i.details);
        }
      }
      if (k === 'personal' && d.showPersonal) {
        const rows = personalRows(d, L);
        if (rows.length) {
          out.push(heading(L.personal));
          personalTable(out, rows);
        }
      }
      if (k === 'references' && d.references.length) {
        out.push(heading(L.references));
        for (const r of d.references) referenceBlock(out, r, { muted: grey });
      }
    }
  };

  let children: (Paragraph | Table)[];

  if (!side) {
    /* ── One column: Classic and the designs that read top to bottom ── */
    const body: Paragraph[] = [];
    if (d.photo) {
      body.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: 96, height: 96 } })],
      }));
    }
    body.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.name || 'Your Name', bold: true, size: 44 })] }));
    if (d.headline) body.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.headline, bold: true, color: accent, size: 24 })] }));
    const contact = contactLine(d).join('  |  ');
    if (contact) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: contact, color: grey })] }));
    sections(body, []);
    children = body;
  } else {
    /* ── Two columns: a borderless table, the sidebar cell shaded ── */
    const sideItems: Paragraph[] = [];
    const sh = (text: string) =>
      new Paragraph({
        spacing: { before: 280, after: 100 },
        ...(side.rule ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: side.head, space: 3 } } } : {}),
        children: [new TextRun({ text: (state.headings ?? 'en') === 'en' ? text.toUpperCase() : text, bold: true, color: side.head, size: 20 })],
      });
    const sp = (text: string, o: { muted?: boolean; bold?: boolean } = {}) =>
      new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text, bold: o.bold, color: o.muted ? side.muted : side.text, size: 20 })] });

    if (d.photo) {
      sideItems.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: 100, height: 100 } })],
      }));
    }
    sideItems.push(sh(L.contact));
    for (const c of contactLine(d)) sideItems.push(sp(c));
    if (!d.hidden.includes('skills')) {
      if (d.skills) {
        sideItems.push(sh(L.skills));
        for (const s of list(d.skills)) sideItems.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: s, color: side.text, size: 20 })] }));
      }
      if (d.languages) sideItems.push(sh(L.languages), sp(d.languages));
    }
    const personal = d.showPersonal && !d.hidden.includes('personal') ? personalRows(d, L) : [];
    if (personal.length) {
      sideItems.push(sh(L.personal));
      for (const [a, v] of personal) sideItems.push(new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text: a, color: side.muted, size: 17, break: 0 }), new TextRun({ text: v, color: side.text, size: 20, break: 1 })] }));
    }
    if (side.refs && !d.hidden.includes('references') && d.references.length) {
      sideItems.push(sh(L.references));
      for (const r of d.references) referenceBlock(sideItems, r, { main: side.text, muted: side.muted });
    }

    const main: Paragraph[] = [];
    main.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: d.name || 'Your Name', bold: true, size: 56, color: '111827' })] }));
    if (d.headline) main.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: d.headline, bold: true, color: accent, size: 26 })] }));
    if (!d.hidden.includes('summary') && d.summary) main.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: d.summary, color: '374151' })] }));
    sections(main, ['summary', 'skills', 'personal', ...(side.refs ? ['references'] : [])]);

    const mainW = A4.width - sideW;
    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const sideCell = new TableCell({
      width: { size: sideW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: side.fill },
      borders: cellBorders,
      margins: { top: 300, bottom: 300, left: SIDE_PAD, right: SIDE_PAD },
      children: sideItems,
    });
    const mainCell = new TableCell({
      width: { size: mainW, type: WidthType.DXA },
      borders: cellBorders,
      margins: { top: 300, bottom: 300, left: mainPadL, right: mainPadR },
      children: main,
    });
    children = [
      new Table({
        width: { size: A4.width, type: WidthType.DXA },
        columnWidths: side.side === 'left' ? [sideW, mainW] : [mainW, sideW],
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: [new TableRow({
          // Tall enough that the sidebar colour fills page one; a longer CV just flows onto page two
          height: { value: A4.height - marginY * 2 - 900, rule: HeightRule.ATLEAST },
          children: side.side === 'left' ? [sideCell, mainCell] : [mainCell, sideCell],
        })],
      }),
      // Word needs a paragraph after a table; keep it tiny so it never pushes a blank page
      new Paragraph({ spacing: { before: 0, after: 0, line: 20 }, children: [new TextRun({ text: '', size: 2 })] }),
    ];
  }

  const doc = new Document({
    creator: 'HereWeGrow CV builder',
    title: `${d.name || 'My'} CV`,
    styles: { default: { document: { run: { font: { ascii: findFont(state.font).word, hAnsi: findFont(state.font).word, cs: 'Nirmala UI' }, size: 21 } } } },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }],
      }],
    },
    sections: [{
      // Sidebar designs run the shaded column to the page edges left and right
      properties: { page: { size: A4, margin: { top: marginY, bottom: marginY, left: side ? 0 : marginX, right: side ? 0 : marginX } } },
      ...(opts.watermark
        ? { footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, indent: side ? { right: marginX } : undefined, children: [new TextRun({ text: 'Made with HereWeGrow.pro', size: 14, color: '94A3B8' })] })] }) } }
        : {}),
      children,
    }],
  });
  return Packer.toBlob(doc);
}
