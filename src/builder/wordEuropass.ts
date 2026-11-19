// Editable Word (.docx) file for the Europass-style layout: one column, dates on the left and details on the right,
// international dates (MM/YYYY) and a real table for the CEFR language levels. A4, no text boxes, so nothing overlaps.
// Loaded on demand by word.ts when the layout is on.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
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
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { CEFR_NOTE, CEFR_SKILLS, CEFR_SKILL_LABEL, usableLanguages } from './cefr';
import { contactLine, degreeLine, personalRows } from './designs';
import { EUROPASS_LABELS_BN, EUROPASS_LABELS_EN, euDate, euDates } from './europass';
import { findFont } from './fonts';
import { LABELS, clampMargin, lines, list, type BuilderState } from './model';

const A4 = { width: 11906, height: 16838 };
const DEFAULT_MARGIN = 1000;
const TWIPS_PER_MM = 56.693;
const DATE_W = 1900; // left column: dates and labels
const GAP = 280; // space between the two columns
const GREY = '52606D';
const RULE = 'CBD5E1';

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

export async function buildEuropassDocx(state: BuilderState, opts: { watermark?: boolean; brand?: string } = {}): Promise<Blob> {
  const d = state.data;
  const lang = state.headings ?? 'en';
  const L = { ...LABELS[lang], ...(lang === 'bn' ? EUROPASS_LABELS_BN : EUROPASS_LABELS_EN) } as Record<string, string>;
  const accent = hex(state.accent);
  const marginX = state.margins ? Math.round(clampMargin(state.margins.x) * TWIPS_PER_MM) : DEFAULT_MARGIN;
  const marginY = state.margins ? Math.round(clampMargin(state.margins.y) * TWIPS_PER_MM) : DEFAULT_MARGIN;
  const W = A4.width - marginX * 2;
  const MAIN_W = W - DATE_W;

  const run = (text: string, o: { bold?: boolean; color?: string; size?: number } = {}) => new TextRun({ text, ...o });
  const plain = (text: string, o: { color?: string; bold?: boolean; after?: number } = {}) =>
    new Paragraph({ spacing: { after: o.after ?? 40 }, children: [run(text, { color: o.color, bold: o.bold })] });
  const bullet = (text: string) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 20 }, children: [run(text)] });
  const detailParas = (text: string): Paragraph[] => {
    const items = lines(text);
    return items.length === 1 ? [plain(items[0])] : items.map(bullet);
  };
  const heading = (text: string) =>
    new Paragraph({ keepNext: true, spacing: { before: 260, after: 110 }, border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: accent, space: 2 } }, children: [run(text, { bold: true, color: accent, size: 22 })] });

  const cell = (width: number, children: Paragraph[], o: { right?: number; borders?: typeof noBorders } = {}) =>
    new TableCell({ width: { size: width, type: WidthType.DXA }, borders: o.borders ?? noBorders, margins: { top: 0, bottom: 0, left: 0, right: o.right ?? 0 }, children: children.length ? children : [new Paragraph({ children: [] })] });
  /** Dates (or a label) on the left, details on the right. Each row stays whole on one page. */
  const rows = (items: { left: string; right: Paragraph[] }[]) =>
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [DATE_W, MAIN_W],
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      rows: items.map((x) => new TableRow({
        cantSplit: true,
        children: [
          cell(DATE_W, x.left ? [new Paragraph({ spacing: { after: 40 }, children: [run(x.left, { color: GREY })] })] : [], { right: GAP }),
          cell(MAIN_W, [...x.right, gap()]),
        ],
      })),
    });
  const entry = (left: string, title: string, sub: string, text: string): { left: string; right: Paragraph[] } => ({
    left,
    right: [new Paragraph({ keepNext: !!(sub || text), spacing: { after: 20 }, children: [run(title, { bold: true })] }), ...(sub ? [plain(sub, { color: GREY })] : []), ...detailParas(text)],
  });

  const body: (Paragraph | Table)[] = [];
  /** A thin empty line: space after an entry or table without a full blank line. */
  function gap() { return new Paragraph({ spacing: { before: 0, after: 60, line: 120 }, run: { size: 2 }, children: [] }); }

  /* Header: name, headline, contact line (and a photo only if the person added one), with a rule under it */
  const head: Paragraph[] = [new Paragraph({ spacing: { after: 40 }, children: [run(d.name || 'Your Name', { bold: true, size: 54, color: '111827' })] })];
  if (d.headline) head.push(new Paragraph({ spacing: { after: 60 }, children: [run(d.headline, { bold: true, color: accent, size: 25 })] }));
  const contact = contactLine(d).join('   |   ');
  if (contact) head.push(new Paragraph({ spacing: { after: 100 }, children: [run(contact, { color: GREY, size: 20 })] }));
  const photoW = 1500;
  const headBorders = { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 24, color: accent } };
  const headCells = [new TableCell({ width: { size: d.photo ? W - photoW : W, type: WidthType.DXA }, borders: headBorders, margins: { top: 0, bottom: 80, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER, children: head })];
  if (d.photo)
    headCells.push(new TableCell({
      width: { size: photoW, type: WidthType.DXA }, borders: headBorders, margins: { top: 0, bottom: 80, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ type: imageType(d.photo), data: dataUrlBytes(d.photo), transformation: { width: 80, height: 80 } })] })],
    }));
  body.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: d.photo ? [W - photoW, photoW] : [W], layout: TableLayoutType.FIXED, borders: TableBorders.NONE, rows: [new TableRow({ cantSplit: true, children: headCells })] }));

  /* The CEFR grid: a real table, one row per language, header row shaded */
  const cefr = () => {
    const all = usableLanguages(d.langLevels);
    const mother = all.filter((x) => x.mother);
    const other = all.filter((x) => !x.mother);
    if (!all.length) return;
    body.push(heading(L.languages));
    if (mother.length) body.push(rows([{ left: CEFR_NOTE.mother[lang], right: [plain(mother.map((x) => x.name.trim()).join(', '), { bold: true })] }]));
    if (!other.length) return;
    body.push(new Paragraph({ keepNext: true, spacing: { before: 60, after: 60 }, children: [run(CEFR_NOTE.other[lang], { color: GREY })] }));
    const nameW = Math.floor(W * 0.2);
    const colW = Math.floor((W - nameW) / CEFR_SKILLS.length);
    const widths = [nameW, ...CEFR_SKILLS.map(() => colW)];
    const total = widths.reduce((a, b) => a + b, 0);
    const edge = { style: BorderStyle.SINGLE, size: 4, color: RULE };
    const c = (i: number, paras: Paragraph[], head = false) =>
      new TableCell({
        width: { size: widths[i], type: WidthType.DXA },
        borders: { top: none, left: none, right: none, bottom: edge },
        shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF2F7' } : undefined,
        margins: { top: 50, bottom: 50, left: 80, right: 60 },
        children: paras,
      });
    const cellP = (text: string, o: { bold?: boolean; color?: string; size?: number } = {}) => new Paragraph({ spacing: { after: 0 }, children: [run(text, o)] });
    body.push(new Table({
      width: { size: total, type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      rows: [
        new TableRow({ cantSplit: true, tableHeader: true, children: [c(0, [cellP('')], true), ...CEFR_SKILLS.map((s, i) => c(i + 1, [cellP(CEFR_SKILL_LABEL[s][lang], { bold: true, color: accent, size: 17 })], true))] }),
        ...other.map((e) => new TableRow({
          cantSplit: true,
          children: [
            c(0, [cellP(e.name.trim(), { bold: true }), ...(e.certificate.trim() ? [cellP(e.certificate.trim(), { color: GREY, size: 17 })] : [])]),
            ...CEFR_SKILLS.map((s, i) => c(i + 1, [cellP(e[s])])),
          ],
        })),
      ],
    }));
    body.push(gap());
  };

  for (const k of d.order) {
    if (d.hidden.includes(k)) continue;
    if (k === 'summary' && d.summary) body.push(heading(L.summary), plain(d.summary));
    else if (k === 'experience' && d.experience.length)
      body.push(heading(L.experience), rows(d.experience.map((e) => entry(euDates(e.start, e.end, e.current, L.present), e.role, [e.org, e.location].filter(Boolean).join(', '), e.bullets))));
    else if (k === 'education' && d.education.length)
      body.push(heading(L.education), rows(d.education.map((e) => entry(euDate(e.year), degreeLine(e.degree, e.major), [e.institution, e.result].filter(Boolean).join(', '), e.details))));
    else if (k === 'cefr') cefr();
    else if (k === 'digital' && d.digitalSkills.trim()) body.push(heading(L.digitalSkills), ...detailParas(d.digitalSkills));
    else if (k === 'skills' && (d.skills || (d.languages && !usableLanguages(d.langLevels).length))) {
      body.push(heading(L.skills));
      if (d.skills) body.push(plain(list(d.skills).join(', ')));
      if (d.languages && !usableLanguages(d.langLevels).length) body.push(new Paragraph({ spacing: { after: 40 }, children: [run(`${L.languages}: `, { bold: true }), run(d.languages)] }));
    } else if (k === 'training' && d.training.length)
      body.push(heading(L.training), rows(d.training.map((t) => entry(euDate(t.year), t.name, [t.org, t.duration].filter(Boolean).join(', '), t.details))));
    else if (k === 'driving' && d.drivingLicence.trim()) body.push(heading(L.drivingLicence), plain(d.drivingLicence.trim()));
    else if (k.startsWith('custom:')) {
      const c = d.custom.find((x) => `custom:${x.id}` === k);
      if (c && c.items.some((i) => i.title || i.details)) body.push(heading(c.title), rows(c.items.map((i) => entry(euDate(i.date), i.title, i.subtitle, i.details))));
    } else if (k === 'personal' && d.showPersonal) {
      const pr = personalRows(d, L);
      if (pr.length) body.push(heading(L.personal), rows(pr.map(([a, v]) => ({ left: a, right: [plain(v)] }))));
    } else if (k === 'references' && d.references.some((r) => r.name || r.title || r.org || r.phone || r.email))
      body.push(
        heading(L.references),
        rows(d.references.map((r) => ({
          left: '',
          right: [plain(r.name, { bold: true, after: 20 }), ...[r.title, r.org].filter(Boolean).map((x) => plain(x, { after: 20 })), ...([r.phone, r.email].filter(Boolean).length ? [plain([r.phone, r.email].filter(Boolean).join(', '), { color: GREY, after: 20 })] : []), ...(r.relation ? [plain(r.relation, { color: GREY, after: 20 })] : [])],
        }))),
      );
  }
  // Word needs a paragraph after a table; keep it tiny so it never pushes a blank page
  body.push(new Paragraph({ spacing: { before: 0, after: 0, line: 20 }, children: [new TextRun({ text: '', size: 2 })] }));
  if (opts.brand) body.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200 }, children: [run(opts.brand, { size: 14, color: '94A3B8' })] }));

  const f = findFont(state.font).word;
  const doc = new Document({
    creator: 'HereWeGrow CV builder',
    title: `${d.name || 'My'} CV`,
    styles: { default: { document: { run: { font: { ascii: f, hAnsi: f, cs: 'Nirmala UI' }, size: 21 } } } },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
    sections: [{
      properties: { page: { size: A4, margin: { top: marginY, bottom: marginY, left: marginX, right: marginX } } },
      ...(opts.watermark ? { footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Made with HereWeGrow.pro', { size: 14, color: '94A3B8' })] })] }) } } : {}),
      children: body,
    }],
  });
  return Packer.toBlob(doc);
}
