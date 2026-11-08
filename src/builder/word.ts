import { findFont } from './fonts';
// Builds an editable Word (.docx) version of the CV in the browser.
// Loaded only when someone asks for a Word file, so the builder page stays light.
// Sidebar designs (Modern, Graphite, Corporate, Pulse, Banner) come out as a real two-column Word table with a
// shaded sidebar, so the file matches the preview. Every other design uses the one-column layout,
// which is the easiest to edit and ATS-safe.
// Elegant, Bold, Minimal, Timeline, Fresher and Bars follow their preview too: colour band, edge strip,
// labels column, rule beside entries, skill tags and section bars. Classic and Executive stay plain.

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
  VerticalAlign,
  WidthType,
} from 'docx';
import type { IParagraphOptions } from 'docx';
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

/** How a sidebar design looks in Word. Mirrors Modern, Graphite, Corporate, Pulse and Banner in designs.tsx. */
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
  /** Corporate, Pulse and Banner underline their sidebar headings. */
  rule: boolean;
  /** Banner only: colour of the full-width band above both columns, which holds the name and headline. */
  band?: string;
  /** Colour of the heading underline when it is not the heading colour (Banner uses the accent). */
  ruleColor?: string;
}

export function sidebarSpec(design: DesignId, accent: string): SidebarSpec | null {
  const a = hex(accent);
  if (design === 'modern') return { side: 'left', widthPx: 250, fill: a, text: 'FFFFFF', head: 'FFFFFF', muted: 'E5E7EB', refs: true, rule: false };
  if (design === 'graphite') return { side: 'left', widthPx: 250, fill: '1F2933', text: 'FFFFFF', head: 'FFFFFF', muted: 'CBD2D9', refs: true, rule: false };
  if (design === 'corporate') return { side: 'right', widthPx: 236, fill: tint(a, 0.07), text: '1F2933', head: a, muted: '52606D', refs: false, rule: true };
  if (design === 'pulse') return { side: 'right', widthPx: 236, fill: tint(a, 0.06), text: '1F2933', head: a, muted: '52606D', refs: true, rule: false };
  if (design === 'banner') return { side: 'left', widthPx: 250, fill: 'FFFFFF', text: '1F2933', head: '374151', muted: '52606D', refs: true, rule: true, band: a, ruleColor: a };
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
  const mainPadL = side?.side === 'left' ? (side.band ? 20 : 40) * PX : marginX;
  const mainPadR = side?.side === 'right' ? 34 * PX : marginX;
  let CONTENT = side ? A4.width - sideW - mainPadL - mainPadR : A4.width - marginX * 2;

  const design = state.design;
  const up = (t: string) => ((state.headings ?? 'en') === 'en' ? t.toUpperCase() : t);
  const tintAcc = (n: number) => tint(state.accent, n);
  const shade = (fill: string) => ({ type: ShadingType.CLEAR, color: 'auto', fill });
  // Inside Elegant's and Minimal's table rows a keep-with-next chain would tie the whole table together and push it to page two
  const kn = design === 'elegant' || design === 'minimal' ? {} : { keepNext: true };
  const tiny = () => new Paragraph({ spacing: { before: 0, after: 0, line: 20 }, children: [new TextRun({ text: '', size: 2 })] });

  /** Extra paragraph settings for lines inside one entry (Elegant and Timeline draw a rule beside entries). */
  let ex: Partial<IParagraphOptions> = {};
  const rule = (n: number) => ({ left: { style: BorderStyle.SINGLE, size: 12, color: tintAcc(n), space: 8 } });
  const entryEx: Partial<IParagraphOptions> =
    design === 'elegant' ? { indent: { left: 240 }, border: rule(0.2) }
    : design === 'timeline' ? { indent: { left: 300 }, border: rule(0.19) }
    : design === 'fresher' ? { indent: { left: 240 } }
    : {};

  /** Section heading, in the look of the chosen design. Minimal returns nothing: its labels sit in a column. */
  const heading = (text: string): Paragraph[] => {
    const keep = kn; // a heading never sits alone at the bottom of a page (except inside table rows, see kn)
    if (design === 'elegant')
      return [new Paragraph({ ...keep, spacing: { before: 280, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB', space: 3 } }, children: [new TextRun({ text: up(text), bold: true, color: accent, size: 20, characterSpacing: 50 })] })];
    if (design === 'minimal') return [];
    if (design === 'timeline')
      return [new Paragraph({ ...keep, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: '■  ', color: accent, size: 22 }), new TextRun({ text, bold: true, color: '111827', size: 30 })] })];
    if (design === 'bold')
      return [new Paragraph({ ...keep, spacing: { before: 260, after: 120 }, children: [new TextRun({ text: ` ${up(text)} `, bold: true, color: 'FFFFFF', size: 20, characterSpacing: 30, shading: shade(accent) })] })];
    if (design === 'fresher')
      return [new Paragraph({ ...keep, spacing: { before: 240, after: 100 }, children: [new TextRun({ text: '■  ', color: accent, size: 16 }), new TextRun({ text: up(text), bold: true, color: accent, size: 21, characterSpacing: 20 })] })];
    if (design === 'bars')
      return [new Paragraph({ ...keep, alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 }, shading: shade(accent), children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 25 })] })];
    return [new Paragraph({
      ...keep,
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 2 } },
      children: [new TextRun({ text: up(text), bold: true, color: accent, size: 22 })],
    })];
  };

  /** The date at the right end of an entry's title line. */
  const dateRuns = (t: string): TextRun[] =>
    design === 'elegant' ? [new TextRun({ text: '\t' }), new TextRun({ text: ` ${t} `, color: accent, bold: true, size: 20, shading: shade(tintAcc(0.08)) })]
    : design === 'bold' ? [new TextRun({ text: `\t${t}`, color: accent, bold: true })]
    : [new TextRun({ text: `\t${t}`, color: grey })];

  /** A line with text on the left and something (dates, year) right-aligned. */
  const leftRight = (left: TextRun[], right: string) =>
    new Paragraph({
      ...kn,
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }],
      spacing: { after: 20 },
      ...ex,
      children: [...left, ...(right ? dateRuns(right) : [])],
    });

  const bullet = (text: string) => {
    const left = (ex.indent as { left?: number } | undefined)?.left ?? 0;
    return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 20 }, ...ex, ...(left ? { indent: { left: left + 360, hanging: 240 } } : {}), children: [new TextRun(text)] });
  };
  const plain = (text: string, o: { color?: string; bold?: boolean } = {}) => new Paragraph({ spacing: { after: 40 }, ...ex, children: [new TextRun({ text, ...o })] });

  const personalTable = (out: Paragraph[], rows: [string, string][]) => {
    for (const [a, v] of rows) out.push(new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: 2600 }], spacing: { after: 20 }, children: [new TextRun({ text: a, color: grey }), new TextRun(`\t${v}`)] }));
  };

  const details = (out: Paragraph[], text: string) => {
    const items = lines(text);
    if (items.length === 1) out.push(plain(items[0]));
    else for (const x of items) out.push(bullet(x));
  };
  const spacer = () => new Paragraph({ spacing: { after: 40 }, children: [] });
  const entry = (out: Paragraph[], title: string, sub: string, date: string, text: string) => {
    if (design === 'bars') {
      // Dates, title and grey line sit on a tinted bar; the details hang below it
      const band = shade(tintAcc(0.12));
      const barLine = (runs: TextRun[], keep: boolean) => new Paragraph({ keepNext: keep, shading: band, spacing: { after: 0 }, children: runs });
      if (date) out.push(barLine([new TextRun({ text: date, bold: true, size: 20 })], true));
      out.push(barLine([new TextRun({ text: title, bold: true })], !!sub || !!text));
      if (sub) out.push(barLine([new TextRun({ text: sub, color: grey })], !!text));
      ex = { indent: { left: 120 } };
      details(out, text);
      ex = {};
      out.push(spacer());
      return;
    }
    ex = entryEx;
    if (design === 'timeline') {
      if (date) out.push(new Paragraph({ keepNext: true, spacing: { after: 20 }, ...ex, children: [new TextRun({ text: date.toUpperCase(), bold: true, color: accent, size: 19 })] }));
      out.push(new Paragraph({ keepNext: true, spacing: { after: 20 }, ...ex, children: [new TextRun({ text: title, bold: true })] }));
    } else out.push(leftRight([new TextRun({ text: title, bold: true })], date));
    if (sub) out.push(plain(sub, { color: grey }));
    details(out, text);
    ex = {};
    out.push(spacer());
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
  const renderSection = (out: Paragraph[], k: string) => {
    if (k === 'summary' && d.summary) out.push(...heading(L.summary), plain(d.summary));
    if (k === 'experience' && d.experience.length) {
      out.push(...heading(L.experience));
      for (const e of d.experience) entry(out, e.role, [e.org, e.location].filter(Boolean).join(', '), [e.start, e.current ? L.present : e.end].filter(Boolean).join(' – '), e.bullets);
    }
    if (k === 'education' && d.education.length) {
      out.push(...heading(L.education));
      for (const e of d.education) entry(out, degreeLine(e.degree, e.major), [e.institution, e.result].filter(Boolean).join(', '), e.year, e.details);
    }
    if (k === 'skills' && (d.skills || d.languages)) {
      out.push(...heading(L.skills));
      if (d.skills) out.push(plain(list(d.skills).join(', ')));
      if (d.languages) out.push(new Paragraph({ children: [new TextRun({ text: `${L.languages}: `, bold: true }), new TextRun(d.languages)] }));
    }
    if (k === 'training' && d.training.length) {
      out.push(...heading(L.training));
      for (const t of d.training) entry(out, t.name, [t.org, t.duration].filter(Boolean).join(', '), t.year, t.details);
    }
    if (k.startsWith('custom:')) {
      const c = d.custom.find((x) => `custom:${x.id}` === k);
      if (c && c.items.some((i) => i.title || i.details)) {
        out.push(...heading(c.title));
        for (const i of c.items) entry(out, i.title, i.subtitle, i.date, i.details);
      }
    }
    if (k === 'personal' && d.showPersonal) {
      const rows = personalRows(d, L);
      if (rows.length) {
        out.push(...heading(L.personal));
        personalTable(out, rows);
      }
    }
    if (k === 'references' && d.references.length) {
      out.push(...heading(L.references));
      for (const r of d.references) referenceBlock(out, r, { muted: grey });
    }
  };
  const sections = (out: Paragraph[], skip: string[]) => {
    for (const k of d.order) {
      if (d.hidden.includes(k) || skip.includes(k)) continue;
      renderSection(out, k);
    }
  };

  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
  const photoPara = (size: number, alignment: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    d.photo ? new Paragraph({ alignment, children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: size, height: size } })] }) : null;
  const para = (text: string, o: { size?: number; bold?: boolean; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number; before?: number; caps?: boolean } = {}) =>
    new Paragraph({ alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 40 }, children: [new TextRun({ text, bold: o.bold, color: o.color, size: o.size, allCaps: o.caps })] });
  /** Name, headline and contact line as three paragraphs. */
  const nameBlock = (o: { nameSize: number; nameColor: string; nameBold?: boolean; caps?: boolean; headColor: string; headWhite?: boolean; sep: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; contactColor?: string; contactSize?: number }) => {
    const out: Paragraph[] = [para(d.name || 'Your Name', { size: o.nameSize, bold: o.nameBold ?? true, color: o.nameColor, align: o.align, caps: o.caps, after: 40 })];
    if (d.headline) out.push(para(d.headline, { size: 25, bold: !o.headWhite, color: o.headColor, align: o.align, after: 60 }));
    const c = contactLine(d).join(o.sep);
    if (c) out.push(para(c, { size: o.contactSize ?? 20, color: o.contactColor ?? grey, align: o.align, after: 60 }));
    return out;
  };
  /** Name block beside a photo, in a borderless table that can carry a rule underneath. */
  const headerTable = (texts: Paragraph[], photo: Paragraph | null, photoLeft: boolean, width: number, bottom?: string) => {
    const pw = 1700;
    const borders = bottom ? { ...cellBorders, bottom: { style: BorderStyle.SINGLE, size: 24, color: bottom } } : cellBorders;
    const textCell = new TableCell({ width: { size: photo ? width - pw : width, type: WidthType.DXA }, borders, margins: { top: 0, bottom: 140, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER, children: texts });
    const cells = [textCell];
    if (photo) {
      const photoCell = new TableCell({ width: { size: pw, type: WidthType.DXA }, borders, margins: { top: 0, bottom: 140, left: photoLeft ? 0 : 200, right: photoLeft ? 200 : 0 }, verticalAlign: VerticalAlign.CENTER, children: [photo] });
      if (photoLeft) cells.unshift(photoCell);
      else cells.push(photoCell);
    }
    return new Table({ width: { size: width, type: WidthType.DXA }, columnWidths: photo ? (photoLeft ? [pw, width - pw] : [width - pw, pw]) : [width], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows: [new TableRow({ children: cells })] });
  };
  const bleeds = !!side || design === 'elegant' || design === 'bold';

  let children: (Paragraph | Table)[];

  if (!side) {
    const body: Paragraph[] = [];
    const A = AlignmentType;
    if (design === 'elegant') {
      /* ── Elegant: colour band with name and photo, then the sections, all in one table so the band can bleed ── */
      const photoW = 2300;
      const textW = A4.width - (d.photo ? photoW : 0);
      const white = nameBlock({ nameSize: 58, nameColor: 'FFFFFF', headColor: 'FFFFFF', headWhite: true, sep: '   ·   ', contactColor: 'FFFFFF', contactSize: 19 });
      const bandCells = [new TableCell({ width: { size: textW, type: WidthType.DXA }, shading: shade(accent), borders: cellBorders, margins: { top: 500, bottom: 420, left: marginX, right: d.photo ? 100 : marginX }, verticalAlign: VerticalAlign.CENTER, children: white })];
      if (d.photo) bandCells.push(new TableCell({ width: { size: photoW, type: WidthType.DXA }, shading: shade(accent), borders: cellBorders, margins: { top: 300, bottom: 300, left: 0, right: marginX }, verticalAlign: VerticalAlign.CENTER, children: [photoPara(100, A.RIGHT)!] }));
      sections(body, []);
      if (!body.length) body.push(tiny());
      children = [
        new Table({
          width: { size: A4.width, type: WidthType.DXA },
          columnWidths: d.photo ? [textW, photoW] : [A4.width],
          layout: TableLayoutType.FIXED,
          borders: TableBorders.NONE,
          rows: [
            new TableRow({ children: bandCells }),
            new TableRow({ children: [new TableCell({ columnSpan: d.photo ? 2 : 1, width: { size: A4.width, type: WidthType.DXA }, borders: cellBorders, margins: { top: 200, bottom: 300, left: marginX, right: marginX }, children: body })] }),
          ],
        }),
        tiny(),
      ];
    } else if (design === 'bold') {
      /* ── Bold: colour strip down the left edge, big capital name, labels as filled tags ── */
      const stripW = 14 * PX;
      const mainL = 44 * PX;
      CONTENT = A4.width - stripW - mainL - marginX;
      const texts = nameBlock({ nameSize: 60, nameColor: '111827', caps: true, headColor: accent, sep: '   |   ' });
      sections(body, []);
      const inner: (Paragraph | Table)[] = [headerTable(texts, photoPara(100, A.RIGHT), false, CONTENT), tiny(), ...body];
      children = [
        new Table({
          width: { size: A4.width, type: WidthType.DXA },
          columnWidths: [stripW, A4.width - stripW],
          layout: TableLayoutType.FIXED,
          borders: TableBorders.NONE,
          rows: [new TableRow({
            height: { value: A4.height - marginY * 2 - 900, rule: HeightRule.ATLEAST },
            children: [
              new TableCell({ width: { size: stripW, type: WidthType.DXA }, shading: shade(accent), borders: cellBorders, children: [tiny()] }),
              new TableCell({ width: { size: A4.width - stripW, type: WidthType.DXA }, borders: cellBorders, margins: { top: 500, bottom: 300, left: mainL, right: marginX }, children: inner }),
            ],
          })],
        }),
        tiny(),
      ];
    } else if (design === 'minimal') {
      /* ── Minimal: each section is a row, label in a narrow left column ── */
      const tableW = A4.width - marginX * 2;
      const labelW = 132 * PX;
      const gap = 24 * PX;
      CONTENT = tableW - labelW - gap;
      const topRule = { ...cellBorders, top: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB' } };
      const labels = L as Record<string, string>;
      const rows: TableRow[] = [];
      for (const k of d.order) {
        if (d.hidden.includes(k)) continue;
        const out: Paragraph[] = [];
        renderSection(out, k);
        if (!out.length) continue;
        const label = k.startsWith('custom:') ? d.custom.find((x) => `custom:${x.id}` === k)?.title ?? '' : k === 'summary' ? labels.profile : labels[k];
        rows.push(new TableRow({
          children: [
            new TableCell({ width: { size: labelW, type: WidthType.DXA }, borders: topRule, margins: { top: 160, bottom: 60, left: 0, right: 0 }, children: [new Paragraph({ children: [new TextRun({ text: up(label), bold: true, color: accent, size: 17, characterSpacing: 50 })] })] }),
            new TableCell({ width: { size: tableW - labelW, type: WidthType.DXA }, borders: topRule, margins: { top: 160, bottom: 60, left: gap, right: 0 }, children: out }),
          ],
        }));
      }
      children = [
        ...nameBlock({ nameSize: 58, nameColor: '111827', nameBold: false, headColor: accent, sep: '   /   ' }),
        tiny(),
        ...(rows.length ? [new Table({ width: { size: tableW, type: WidthType.DXA }, columnWidths: [labelW, tableW - labelW], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows })] : []),
        tiny(),
      ];
    } else if (design === 'timeline') {
      /* ── Timeline: photo left, heavy rule under the header, entries hang off a line ── */
      sections(body, []);
      children = [headerTable(nameBlock({ nameSize: 54, nameColor: '111827', headColor: accent, sep: '   ·   ' }), photoPara(90, A.LEFT), true, CONTENT, accent), tiny(), ...body];
    } else if (design === 'bars') {
      /* ── Bars: photo left, headline on a tinted bar, full-width section bars ── */
      sections(body, []);
      children = [
        headerTable(nameBlock({ nameSize: 44, nameColor: '111827', headColor: '111827', sep: '   |   ' }).filter((_, i) => i !== 1 || !d.headline), photoPara(90, A.LEFT), true, CONTENT, '111827'),
        ...(d.headline ? [new Paragraph({ alignment: A.CENTER, spacing: { before: 160, after: 80 }, shading: shade(tintAcc(0.12)), children: [new TextRun({ text: d.headline, bold: true, size: 30 })] })] : []),
        ...body,
      ];
    } else if (design === 'fresher') {
      /* ── Fresher: centred header, top skills as tags, compact sections ── */
      const photo = photoPara(90, A.CENTER);
      if (photo) body.push(photo);
      body.push(...nameBlock({ nameSize: 54, nameColor: '111827', headColor: accent, sep: '   ·   ', align: A.CENTER }));
      if (!d.hidden.includes('skills') && d.skills)
        body.push(new Paragraph({
          alignment: A.CENTER,
          spacing: { before: 120, after: 80 },
          children: list(d.skills).slice(0, 10).flatMap((x, i) => [...(i ? [new TextRun({ text: '  ' })] : []), new TextRun({ text: ` ${x} `, bold: true, color: 'FFFFFF', size: 20, shading: shade(accent) })]),
        }));
      sections(body, []);
      children = body;
    } else {
      /* ── One column: Classic, Executive ── */
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
    }
  } else {
    /* ── Two columns: a borderless table, the sidebar cell shaded ── */
    const sideItems: Paragraph[] = [];
    const sh = (text: string) =>
      new Paragraph({
        spacing: { before: 280, after: 100 },
        ...(side.rule ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: side.ruleColor ?? side.head, space: 3 } } } : {}),
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
    if (side.band) {
      // Banner: the name sits in the band, and the summary is an ordinary section in the main column
      sections(main, ['skills', 'personal', 'references']);
    } else {
      main.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: d.name || 'Your Name', bold: true, size: 56, color: '111827' })] }));
      if (d.headline) main.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: d.headline, bold: true, color: accent, size: 26 })] }));
      if (!d.hidden.includes('summary') && d.summary) main.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: d.summary, color: '374151' })] }));
      sections(main, ['summary', 'skills', 'personal', ...(side.refs ? ['references'] : [])]);
    }

    const mainW = A4.width - sideW;
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
    // Banner: one full-width coloured row on top, the name starting where the main column starts
    const bandRow = side.band
      ? [new TableRow({
          height: { value: 150 * PX, rule: HeightRule.ATLEAST },
          children: [new TableCell({
            columnSpan: 2,
            width: { size: A4.width, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: side.band },
            borders: cellBorders,
            margins: { top: 500, bottom: 34 * PX, left: sideW + 20 * PX, right: marginX },
            children: [
              new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: d.name || 'Your Name', bold: true, size: 72, color: 'FFFFFF' })] }),
              ...(d.headline ? [new Paragraph({ children: [new TextRun({ text: d.headline, color: 'FFFFFF', size: 30 })] })] : []),
            ],
          })],
        })]
      : [];
    children = [
      new Table({
        width: { size: A4.width, type: WidthType.DXA },
        columnWidths: side.side === 'left' ? [sideW, mainW] : [mainW, sideW],
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: [...bandRow, new TableRow({
          // Tall enough that the sidebar colour fills page one; a longer CV just flows onto page two
          ...(side.band ? {} : { height: { value: A4.height - marginY * 2 - 900, rule: HeightRule.ATLEAST } }),
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
      properties: { page: { size: A4, margin: { top: marginY, bottom: marginY, left: bleeds ? 0 : marginX, right: bleeds ? 0 : marginX } } },
      ...(opts.watermark
        ? { footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, indent: bleeds ? { right: marginX } : undefined, children: [new TextRun({ text: 'Made with HereWeGrow.pro', size: 14, color: '94A3B8' })] })] }) } }
        : {}),
      children,
    }],
  });
  return Packer.toBlob(doc);
}
