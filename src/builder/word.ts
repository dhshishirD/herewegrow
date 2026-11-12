import { findFont } from './fonts';
// Builds an editable Word (.docx) version of the CV in the browser.
// Loaded only when someone asks for a Word file, so the builder page stays light.
// Sidebar designs (Modern, Graphite, Corporate, Pulse, Banner) come out as a real two-column Word table with a
// shaded sidebar, so the file matches the preview. Every other design uses the one-column layout,
// which is the easiest to edit and ATS-safe.
// Elegant, Bold, Minimal, Timeline, Fresher and Bars follow their preview too: colour band, edge strip,
// labels column, rule beside entries, skill tags and section bars. Classic and Executive stay plain.
// The newer designs (Care, Journey, Terminal, Chalk, Scholar, Ledger, Office, Spark, Support, Passport, Road, Orbit)
// are a colour header band over a main column and a right-hand panel; Ascent is a header band over a label column.
// Every design has its own Word layout. Only "Classic (ATS)" is the plain one-column file.

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

/** Mixes colour a with colour b: amount 0 is all a, 1 is all b. Word has no gradients, so a header gradient becomes its middle colour. */
export function mix(a: string, b: string, amount: number): string {
  const x = parseInt(hex(a), 16);
  const y = parseInt(hex(b), 16);
  const ch = (shift: number) => {
    const v = Math.round(((x >> shift) & 255) * (1 - amount) + ((y >> shift) & 255) * amount);
    return v.toString(16).padStart(2, '0');
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
  /** Newer designs: the band holds the name, headline, contact line and photo (the panel then has no photo or contact block). */
  hdr?: {
    photo: 'left' | 'right';
    nameColor: string;
    headColor: string;
    contactColor: string;
    /** Font for the name: a serif for the warm designs, a mono face for Terminal. */
    font?: string;
    /** A thin coloured row above a white band (Ledger). */
    topBar?: string;
  };
  /** Skills in the panel as tags instead of a bullet list. */
  pills?: { fill: string; text: string; font?: string };
  /** Page colour behind the main column (cream designs). */
  mainFill?: string;
  /** How section headings in the main column look. */
  title?: 'underline' | 'bar' | 'dot' | 'mono';
  /** Colour of the heading rule, bar or square. */
  titleRule?: string;
  /** Entry subtitles (company, school) in the accent colour, bold. */
  subAccent?: boolean;
  /** Passport: personal details sit in a card above the main column. */
  card?: boolean;
}

const WHITE = 'FFFFFF';
const SERIF_WORD = 'Cambria';
const MONO_WORD = 'Consolas';

/** The panel-and-band look shared by the newer designs. Each design passes only what differs. */
function bandSpec(accent: string, o: Partial<SidebarSpec> & { band: string; hdr: NonNullable<SidebarSpec['hdr']> }): SidebarSpec {
  const a = hex(accent);
  return { side: 'right', widthPx: 232, fill: tint(a, 0.09), text: '1F2933', head: a, muted: '52606D', refs: true, rule: true, ruleColor: tint(a, 0.28), title: 'underline', titleRule: a, pills: { fill: WHITE, text: a }, ...o };
}

export function sidebarSpec(design: DesignId, accent: string): SidebarSpec | null {
  const a = hex(accent);
  const lightHdr = (font?: string, photo: 'left' | 'right' = 'right') => ({ photo, nameColor: '111827', headColor: a, contactColor: '111827', font });
  const darkHdr = (font?: string, photo: 'left' | 'right' = 'left') => ({ photo, nameColor: WHITE, headColor: WHITE, contactColor: WHITE, font });
  if (design === 'care') return bandSpec(accent, { band: mix(a, '000000', 0.15), hdr: darkHdr(SERIF_WORD), fill: tint(a, 0.08), titleRule: tint(a, 0.4), subAccent: true, pills: undefined });
  if (design === 'journey') return bandSpec(accent, { band: mix(a, '6D28D9', 0.3), hdr: darkHdr(SERIF_WORD), fill: tint(a, 0.06), title: 'dot', titleRule: 'F5B301', rule: false });
  if (design === 'terminal') {
    const hi = mix(a, WHITE, 0.55);
    return bandSpec(accent, { band: '0B1220', hdr: { photo: 'left', nameColor: WHITE, headColor: hi, contactColor: 'E5E7EB', font: MONO_WORD }, fill: '0B1220', text: 'E5E7EB', head: hi, muted: 'AEB6C4', rule: false, title: 'mono', titleRule: a, subAccent: true, pills: { fill: mix('0B1220', a, 0.28), text: hi, font: MONO_WORD } });
  }
  if (design === 'chalk') return bandSpec(accent, { band: mix(a, '000000', 0.14), hdr: darkHdr(SERIF_WORD), titleRule: 'E0A526', mainFill: 'FBF6E9', subAccent: true });
  if (design === 'scholar') return bandSpec(accent, { band: mix(a, '000000', 0.33), hdr: darkHdr(SERIF_WORD, 'right'), fill: tint(a, 0.08), title: 'bar', titleRule: 'D4A62A', subAccent: true });
  if (design === 'ledger') return bandSpec(accent, { band: WHITE, hdr: { ...lightHdr(undefined), topBar: a }, title: 'bar', titleRule: '16A34A', subAccent: true });
  if (design === 'office') return bandSpec(accent, { band: mix(a, '000000', 0.16), hdr: darkHdr(undefined, 'right'), titleRule: 'E0A526', subAccent: true });
  if (design === 'spark') return bandSpec(accent, { band: mix(a, '000000', 0.45), hdr: darkHdr(undefined, 'left'), fill: 'FFF3EA', titleRule: 'F97316', subAccent: true });
  if (design === 'support') return bandSpec(accent, { band: mix(a, 'EC4899', 0.15), hdr: darkHdr(undefined, 'right'), title: 'bar', titleRule: '22D3EE', subAccent: true });
  if (design === 'passport') return bandSpec(accent, { band: mix(a, '000000', 0.14), hdr: darkHdr(SERIF_WORD, 'left'), fill: 'F5EDD2', mainFill: 'FBF8EE', titleRule: 'C9A24B', card: true, subAccent: true });
  if (design === 'road') return bandSpec(accent, { band: '18202F', hdr: darkHdr(undefined, 'right'), title: 'bar', titleRule: 'FACC15', subAccent: true });
  if (design === 'orbit') return bandSpec(accent, { band: 'FBF5EC', hdr: lightHdr(SERIF_WORD, 'right'), fill: 'F1E6D4', mainFill: 'FBF5EC', titleRule: 'E0674F', subAccent: true });
  if (design === 'modern') return { side: 'left', widthPx: 250, fill: a, text: 'FFFFFF', head: 'FFFFFF', muted: 'E5E7EB', refs: true, rule: false };
  if (design === 'graphite') return { side: 'left', widthPx: 250, fill: '1F2933', text: 'FFFFFF', head: 'FFFFFF', muted: 'CBD2D9', refs: true, rule: false };
  if (design === 'corporate') return { side: 'right', widthPx: 236, fill: tint(a, 0.07), text: '1F2933', head: a, muted: '52606D', refs: false, rule: true };
  if (design === 'pulse') return { side: 'right', widthPx: 236, fill: tint(a, 0.06), text: '1F2933', head: a, muted: '52606D', refs: true, rule: false };
  if (design === 'banner') return { side: 'left', widthPx: 250, fill: 'FFFFFF', text: '1F2933', head: '374151', muted: '52606D', refs: true, rule: true, band: a, ruleColor: a };
  return null;
}

/** watermark: free downloads carry a small "Made with HereWeGrow.pro" footer; Pro files do not. */
export async function buildDocx(state: BuilderState, opts: { watermark?: boolean; brand?: string } = {}): Promise<Blob> {
  const d = state.data;
  const L = LABELS[state.headings ?? 'en'];
  const accent = hex(state.accent);
  const grey = '52606D';
  const marginX = state.margins ? Math.round(clampMargin(state.margins.x) * TWIPS_PER_MM) : MARGIN;
  const marginY = state.margins ? Math.round(clampMargin(state.margins.y) * TWIPS_PER_MM) : MARGIN;
  const side = sidebarSpec(state.design, state.accent);
  const sideW = side ? side.widthPx * PX : 0;
  // Width of the column the main text lives in, used for right-aligned dates
  const SIDE_PAD = (side?.hdr ? 22 : 26) * PX;
  /** Header-band designs carry a tall band, so spacing is tighter to keep a normal CV on one page. */
  const T = side?.hdr ? 0.62 : side?.band ? 0.8 : 1;
  const mainPadL = side?.hdr ? 44 * PX : side?.side === 'left' ? (side.band ? 20 : 40) * PX : marginX;
  const mainPadR = side?.hdr ? 30 * PX : side?.side === 'right' ? 34 * PX : marginX;
  let CONTENT = side ? A4.width - sideW - mainPadL - mainPadR : A4.width - marginX * 2;

  const design = state.design;
  const up = (t: string) => ((state.headings ?? 'en') === 'en' ? t.toUpperCase() : t);
  const tintAcc = (n: number) => tint(state.accent, n);
  const shade = (fill: string) => ({ type: ShadingType.CLEAR, color: 'auto', fill });
  // Inside Elegant's and Minimal's table rows a keep-with-next chain would tie the whole table together and push it to page two
  const kn = design === 'elegant' || design === 'minimal' || side?.hdr ? {} : { keepNext: true };
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
    if (design === 'ascent') return []; // its labels sit in the left column
    if (side?.hdr) {
      const ruleColor = side.titleRule ?? accent;
      if (side.title === 'bar')
        return [new Paragraph({ ...keep, spacing: { before: Math.round(260 * T), after: 110 }, indent: { left: 140 }, border: { left: { style: BorderStyle.SINGLE, size: 24, color: ruleColor, space: 6 } }, children: [new TextRun({ text: up(text), bold: true, color: accent, size: 22, characterSpacing: 25 })] })];
      if (side.title === 'dot')
        return [new Paragraph({ ...keep, spacing: { before: Math.round(260 * T), after: 110 }, children: [new TextRun({ text: '■  ', color: ruleColor, size: 16 }), new TextRun({ text: up(text), bold: true, color: accent, size: 22, characterSpacing: 25 })] })];
      if (side.title === 'mono')
        return [new Paragraph({ ...keep, spacing: { before: Math.round(260 * T), after: 110 }, children: [new TextRun({ text: `// ${up(text)}`, bold: true, color: accent, size: 22, font: MONO_WORD })] })];
      return [new Paragraph({ ...keep, spacing: { before: Math.round(260 * T), after: 110 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ruleColor, space: 3 } }, children: [new TextRun({ text: up(text), bold: true, color: accent, size: 22, characterSpacing: 25 })] })];
    }
    if (design === 'elegant')
      return [new Paragraph({ ...keep, spacing: { before: Math.round(280 * T), after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB', space: 3 } }, children: [new TextRun({ text: up(text), bold: true, color: accent, size: 20, characterSpacing: 50 })] })];
    if (design === 'minimal') return [];
    if (design === 'timeline')
      return [new Paragraph({ ...keep, spacing: { before: Math.round(300 * T), after: 120 }, children: [new TextRun({ text: '■  ', color: accent, size: 22 }), new TextRun({ text, bold: true, color: '111827', size: 30 })] })];
    if (design === 'bold')
      return [new Paragraph({ ...keep, spacing: { before: Math.round(260 * T), after: 120 }, children: [new TextRun({ text: ` ${up(text)} `, bold: true, color: 'FFFFFF', size: 20, characterSpacing: 30, shading: shade(accent) })] })];
    if (design === 'fresher')
      return [new Paragraph({ ...keep, spacing: { before: Math.round(240 * T), after: 100 }, children: [new TextRun({ text: '■  ', color: accent, size: 16 }), new TextRun({ text: up(text), bold: true, color: accent, size: 21, characterSpacing: 20 })] })];
    if (design === 'bars')
      return [new Paragraph({ ...keep, alignment: AlignmentType.CENTER, spacing: { before: Math.round(240 * T), after: 120 }, shading: shade(accent), children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 25 })] })];
    return [new Paragraph({
      ...keep,
      spacing: { before: Math.round(240 * T), after: 100 },
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
    if (sub) out.push(plain(sub, side?.subAccent ? { color: accent, bold: true } : { color: grey }));
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
    if (k === 'references' && d.references.some((r) => r.name || r.title || r.org || r.phone || r.email)) {
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
  const para = (text: string, o: { size?: number; bold?: boolean; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number; before?: number; caps?: boolean; font?: string } = {}) =>
    new Paragraph({ alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 40 }, children: [new TextRun({ text, bold: o.bold, color: o.color, size: o.size, allCaps: o.caps, font: o.font })] });
  /** Name, headline and contact line as three paragraphs. */
  const nameBlock = (o: { nameSize: number; nameColor: string; nameBold?: boolean; caps?: boolean; headColor: string; headWhite?: boolean; sep: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; contactColor?: string; contactSize?: number; font?: string }) => {
    const out: Paragraph[] = [para(d.name || 'Your Name', { size: o.nameSize, bold: o.nameBold ?? true, color: o.nameColor, align: o.align, caps: o.caps, after: 40, font: o.font })];
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
  const bleeds = !!side || design === 'elegant' || design === 'bold' || design === 'ascent';

  let children: (Paragraph | Table)[];

  if (!side) {
    const body: Paragraph[] = [];
    const A = AlignmentType;
    if (design === 'elegant') {
      /* ── Elegant: colour band with name and photo, then the sections, all in one table so the band can bleed ── */
      const photoW = 2300;
      const textW = A4.width - (d.photo ? photoW : 0);
      const white = nameBlock({ nameSize: 58, nameColor: 'FFFFFF', headColor: 'FFFFFF', headWhite: true, sep: '   ·   ', contactColor: 'FFFFFF', contactSize: 19 });
      const bandCells = [new TableCell({ width: { size: textW, type: WidthType.DXA }, shading: shade(accent), borders: cellBorders, margins: { top: Math.round(500 * T), bottom: Math.round(420 * T), left: marginX, right: d.photo ? 100 : marginX }, verticalAlign: VerticalAlign.CENTER, children: white })];
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
    } else if (design === 'ascent') {
      /* ── Ascent: colour band with a gold rule, then each section is a row with a cream label column ── */
      const GOLD = 'C9A24B';
      const labelW = 150 * PX;
      const padL = 24 * PX;
      const padR = 40 * PX;
      const bandPad = 44 * PX;
      CONTENT = A4.width - labelW - padL - padR;
      const labels = L as Record<string, string>;
      const texts = nameBlock({ nameSize: 56, nameColor: WHITE, headColor: WHITE, headWhite: true, sep: '   ·   ', contactColor: WHITE, contactSize: 19, font: SERIF_WORD });
      const bandInner = headerTable(texts, photoPara(100, A.LEFT), true, A4.width - bandPad * 2);
      const rows: TableRow[] = [new TableRow({
        children: [new TableCell({
          columnSpan: 2,
          width: { size: A4.width, type: WidthType.DXA },
          shading: shade(accent),
          borders: { ...cellBorders, bottom: { style: BorderStyle.SINGLE, size: 32, color: GOLD } },
          margins: { top: 520, bottom: 440, left: bandPad, right: bandPad },
          children: [bandInner, tiny()],
        })],
      })];
      const rowTop = { ...cellBorders, top: { style: BorderStyle.SINGLE, size: 6, color: 'E7DFC9' } };
      for (const k of d.order) {
        if (d.hidden.includes(k)) continue;
        const out: Paragraph[] = [];
        renderSection(out, k);
        if (!out.length) continue;
        const label = k.startsWith('custom:') ? d.custom.find((x) => `custom:${x.id}` === k)?.title ?? '' : k === 'summary' ? labels.profile : labels[k];
        rows.push(new TableRow({
          children: [
            new TableCell({ width: { size: labelW, type: WidthType.DXA }, shading: shade('F7F1E1'), borders: rowTop, margins: { top: 200, bottom: 100, left: 26 * PX, right: 8 * PX }, children: [new Paragraph({ children: [new TextRun({ text: up(label), bold: true, color: accent, size: 16, characterSpacing: 16, font: SERIF_WORD })] })] }),
            new TableCell({ width: { size: A4.width - labelW, type: WidthType.DXA }, borders: rowTop, margins: { top: 180, bottom: 60, left: padL, right: padR }, children: out }),
          ],
        }));
      }
      children = [new Table({ width: { size: A4.width, type: WidthType.DXA }, columnWidths: [labelW, A4.width - labelW], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows }), tiny()];
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
    const mono = side.hdr && side.title === 'mono';
    const sh = (text: string) =>
      new Paragraph({
        spacing: { before: Math.round(280 * T), after: 100 },
        ...(side.rule ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: side.ruleColor ?? side.head, space: 3 } } } : {}),
        children: [new TextRun({ text: `${mono ? '// ' : ''}${(state.headings ?? 'en') === 'en' ? text.toUpperCase() : text}`, bold: true, color: side.head, size: 20, font: mono ? MONO_WORD : undefined })],
      });
    const sp = (text: string, o: { muted?: boolean; bold?: boolean } = {}) =>
      new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text, bold: o.bold, color: o.muted ? side.muted : side.text, size: 20 })] });

    // Newer designs show photo and contact in the header band, so the panel starts with the skills
    if (d.photo && !side.hdr) {
      sideItems.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: 100, height: 100 } })],
      }));
    }
    if (!side.hdr) {
      sideItems.push(sh(L.contact));
      for (const c of contactLine(d)) sideItems.push(sp(c));
    }
    if (!d.hidden.includes('skills')) {
      if (d.skills) {
        sideItems.push(sh(L.skills));
        const items = list(d.skills);
        const chips = side.pills;
        if (chips) {
          // Skills as tags: shaded runs that wrap like the rounded tags in the preview
          sideItems.push(new Paragraph({
            spacing: { after: 70, line: 380 },
            children: items.flatMap((s, i) => [
              ...(i ? [new TextRun({ text: '  ' })] : []),
              new TextRun({ text: ` ${s} `, bold: true, color: chips.text, size: 20, font: chips.font, shading: shade(chips.fill) }),
            ]),
          }));
        } else for (const s of items) sideItems.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: s, color: side.text, size: 20 })] }));
      }
      if (d.languages) sideItems.push(sh(L.languages), sp(d.languages));
    }
    // Passport shows these in a card above the main column instead
    const personal = d.showPersonal && !d.hidden.includes('personal') && !side.card ? personalRows(d, L) : [];
    if (personal.length) {
      sideItems.push(sh(L.personal));
      for (const [a, v] of personal) sideItems.push(new Paragraph({ spacing: { after: 70 }, children: [new TextRun({ text: a, color: side.muted, size: 17, break: 0 }), new TextRun({ text: v, color: side.text, size: 20, break: 1 })] }));
    }
    const refList = d.references.filter((r) => r.name || r.title || r.org || r.phone || r.email);
    if (side.refs && !d.hidden.includes('references') && refList.length) {
      sideItems.push(sh(L.references));
      for (const r of refList) referenceBlock(sideItems, r, { main: side.text, muted: side.muted });
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

    // Passport: a card with the personal details, three to a row, above the main column
    const lead: (Paragraph | Table)[] = [];
    const cardRows = side.card && d.showPersonal && !d.hidden.includes('personal') ? personalRows(d, L) : [];
    if (cardRows.length) {
      const cw = Math.floor((A4.width - sideW - mainPadL - mainPadR) / 3);
      const edge = { style: BorderStyle.SINGLE, size: 4, color: 'E8E0C4' };
      const trs: TableRow[] = [];
      for (let i = 0; i < cardRows.length; i += 3) {
        const chunk = cardRows.slice(i, i + 3);
        trs.push(new TableRow({
          children: [0, 1, 2].map((j) => new TableCell({
            width: { size: cw, type: WidthType.DXA },
            shading: shade(WHITE),
            borders: { top: i === 0 ? edge : noBorder, bottom: i + 3 >= cardRows.length ? edge : noBorder, left: j === 0 ? edge : noBorder, right: j === 2 ? edge : noBorder },
            margins: { top: 80, bottom: 80, left: 160, right: 100 },
            children: chunk[j]
              ? [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: chunk[j][0].toUpperCase(), color: grey, size: 15, characterSpacing: 20 })] }), new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: chunk[j][1], bold: true, size: 21 })] })]
              : [new Paragraph({ children: [] })],
          })),
        }));
      }
      lead.push(new Table({ width: { size: cw * 3, type: WidthType.DXA }, columnWidths: [cw, cw, cw], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows: trs }), tiny());
    }

    const mainW = A4.width - sideW;
    const sideCell = new TableCell({
      width: { size: sideW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: side.fill },
      borders: cellBorders,
      margins: { top: Math.round(300 * T), bottom: side.hdr || side.band ? 0 : 300, left: SIDE_PAD, right: SIDE_PAD },
      children: sideItems,
    });
    const mainCell = new TableCell({
      width: { size: mainW, type: WidthType.DXA },
      ...(side.mainFill ? { shading: shade(side.mainFill) } : {}),
      borders: cellBorders,
      margins: { top: Math.round(300 * T), bottom: side.hdr || side.band ? 0 : 300, left: mainPadL, right: mainPadR },
      children: [...lead, ...main],
    });
    // Newer designs: the band holds name, headline, contact and photo across the full width
    const HDR_BAND_H = 2500; // twips, with a 100 px photo
    const hdrRows: TableRow[] = [];
    if (side.hdr) {
      const h = side.hdr;
      const texts = nameBlock({ nameSize: 56, nameColor: h.nameColor, headColor: h.headColor, headWhite: h.headColor === WHITE, sep: '   ·   ', contactColor: h.contactColor, contactSize: 20, font: h.font });
      const inner = headerTable(texts, photoPara(100, h.photo === 'left' ? AlignmentType.LEFT : AlignmentType.RIGHT), h.photo === 'left', A4.width - mainPadL * 2);
      if (h.topBar) hdrRows.push(new TableRow({ children: [new TableCell({ columnSpan: 2, width: { size: A4.width, type: WidthType.DXA }, shading: shade(h.topBar), borders: cellBorders, children: [tiny()] })] }));
      hdrRows.push(new TableRow({
        children: [new TableCell({
          columnSpan: 2,
          width: { size: A4.width, type: WidthType.DXA },
          shading: shade(side.band!),
          borders: cellBorders,
          margins: { top: 420, bottom: 360, left: mainPadL, right: mainPadL },
          children: [inner, tiny()],
        })],
      }));
    }
    // Banner: one full-width coloured row on top, the name starting where the main column starts
    const bandRow = side.hdr ? hdrRows : side.band
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
          ...(side.hdr
            ? { height: { value: A4.height - marginY * 2 - HDR_BAND_H - (side.hdr.topBar ? 150 : 0) - 2400, rule: HeightRule.ATLEAST } }
            : side.band ? {} : { height: { value: A4.height - marginY * 2 - 900, rule: HeightRule.ATLEAST } }),
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
      // Partner Starter: one small line after the last content, so it sits on the last page only
      children: opts.brand
        ? [...children, new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200 }, indent: bleeds ? { right: marginX } : undefined, children: [new TextRun({ text: opts.brand, size: 14, color: '94A3B8' })] })]
        : children,
    }],
  });
  return Packer.toBlob(doc);
}
