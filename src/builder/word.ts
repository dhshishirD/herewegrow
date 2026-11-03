// Builds an editable Word (.docx) version of the CV in the browser.
// Loaded only when someone asks for a Word file, so the builder page stays light.
// The Word file always uses the one-column Classic layout: it is the easiest to edit and ATS-safe.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx';
import { contactLine, degreeLine, personalRows } from './designs';
import { LABELS, clampMargin, lines, list, type BuilderState } from './model';

const A4 = { width: 11906, height: 16838 };
const MARGIN = 1000; // about 1.76 cm, used until the person picks a margin
const TWIPS_PER_MM = 56.693;

const hex = (c: string) => c.replace('#', '').toUpperCase();

function dataUrlBytes(url: string): Uint8Array {
  const b64 = url.split(',')[1] ?? '';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** watermark: free downloads carry a small "Made with HereWeGrow.pro" footer; Pro files do not. */
export async function buildDocx(state: BuilderState, opts: { watermark?: boolean } = {}): Promise<Blob> {
  const d = state.data;
  const L = LABELS[state.headings ?? 'en'];
  const accent = hex(state.accent);
  const grey = '52606D';
  const marginX = state.margins ? Math.round(clampMargin(state.margins.x) * TWIPS_PER_MM) : MARGIN;
  const marginY = state.margins ? Math.round(clampMargin(state.margins.y) * TWIPS_PER_MM) : MARGIN;
  const CONTENT = A4.width - marginX * 2;

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 2 } },
      children: [new TextRun({ text: (state.headings ?? 'en') === 'en' ? text.toUpperCase() : text, bold: true, color: accent, size: 22 })],
    });

  /** A line with text on the left and something (dates, year) right-aligned. */
  const leftRight = (left: TextRun[], right: string) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT }],
      spacing: { after: 20 },
      children: [...left, ...(right ? [new TextRun({ text: `\t${right}`, color: grey })] : [])],
    });

  const bullet = (text: string) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 20 }, children: [new TextRun(text)] });
  const plain = (text: string, opts: { color?: string; bold?: boolean } = {}) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text, ...opts })] });

  const body: Paragraph[] = [];

  if (d.photo) {
    body.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ type: 'jpg', data: dataUrlBytes(d.photo), transformation: { width: 96, height: 96 } })],
    }));
  }
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.name || 'Your Name', bold: true, size: 44 })] }));
  if (d.headline) body.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.headline, bold: true, color: accent, size: 24 })] }));
  const contact = contactLine(d).join('  |  ');
  if (contact) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: contact, color: grey })] }));

  const details = (text: string) => {
    const items = lines(text);
    if (items.length === 1) body.push(plain(items[0]));
    else for (const x of items) body.push(bullet(x));
  };
  const entry = (title: string, sub: string, date: string, text: string) => {
    body.push(leftRight([new TextRun({ text: title, bold: true })], date));
    if (sub) body.push(plain(sub, { color: grey }));
    details(text);
    body.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  };

  for (const k of d.order) {
    if (d.hidden.includes(k)) continue;
    if (k === 'summary' && d.summary) body.push(heading(L.summary), plain(d.summary));
    if (k === 'experience' && d.experience.length) {
      body.push(heading(L.experience));
      for (const e of d.experience) entry(e.role, [e.org, e.location].filter(Boolean).join(', '), [e.start, e.current ? L.present : e.end].filter(Boolean).join(' – '), e.bullets);
    }
    if (k === 'education' && d.education.length) {
      body.push(heading(L.education));
      for (const e of d.education) entry(degreeLine(e.degree, e.major), [e.institution, e.result].filter(Boolean).join(', '), e.year, e.details);
    }
    if (k === 'skills' && (d.skills || d.languages)) {
      body.push(heading(L.skills));
      if (d.skills) body.push(plain(list(d.skills).join(', ')));
      if (d.languages) body.push(new Paragraph({ children: [new TextRun({ text: `${L.languages}: `, bold: true }), new TextRun(d.languages)] }));
    }
    if (k === 'training' && d.training.length) {
      body.push(heading(L.training));
      for (const t of d.training) entry(t.name, [t.org, t.duration].filter(Boolean).join(', '), t.year, t.details);
    }
    if (k.startsWith('custom:')) {
      const c = d.custom.find((x) => `custom:${x.id}` === k);
      if (c && c.items.some((i) => i.title || i.details)) {
        body.push(heading(c.title));
        for (const i of c.items) entry(i.title, i.subtitle, i.date, i.details);
      }
    }
    if (k === 'personal' && d.showPersonal) {
      const rows = personalRows(d, L);
      if (rows.length) {
        body.push(heading(L.personal));
        for (const [a, v] of rows) body.push(new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: 2600 }], spacing: { after: 20 }, children: [new TextRun({ text: a, color: grey }), new TextRun(`\t${v}`)] }));
      }
    }
    if (k === 'references' && d.references.length) {
      body.push(heading(L.references));
      for (const r of d.references) {
        body.push(plain(r.name, { bold: true }));
        for (const x of [r.title, r.org]) if (x) body.push(plain(x));
        const c = [r.phone, r.email].filter(Boolean).join(', ');
        if (c) body.push(plain(c, { color: grey }));
        if (r.relation) body.push(plain(r.relation, { color: grey }));
        body.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
      }
    }
  }

  const doc = new Document({
    creator: 'HereWeGrow CV builder',
    title: `${d.name || 'My'} CV`,
    styles: { default: { document: { run: { font: { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Nirmala UI' }, size: 21 } } } },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }],
      }],
    },
    sections: [{
      properties: { page: { size: A4, margin: { top: marginY, bottom: marginY, left: marginX, right: marginX } } },
      ...(opts.watermark
        ? { footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Made with HereWeGrow.pro', size: 14, color: '94A3B8' })] })] }) } }
        : {}),
      children: body,
    }],
  });
  return Packer.toBlob(doc);
}
