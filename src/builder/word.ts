// Builds an editable Word (.docx) version of the CV in the browser.
// Loaded only when someone asks for a Word file, so the builder page stays light.
// The Word file always uses the one-column Classic layout: it is the easiest to edit and ATS-safe.

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx';
import { LABELS, lines, list, type BuilderState } from './model';

const A4 = { width: 11906, height: 16838 };
const MARGIN = 1000; // about 1.76 cm
const CONTENT = A4.width - MARGIN * 2;

const hex = (c: string) => c.replace('#', '').toUpperCase();

function dataUrlBytes(url: string): Uint8Array {
  const b64 = url.split(',')[1] ?? '';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function buildDocx(state: BuilderState): Promise<Blob> {
  const d = state.data;
  const L = LABELS[state.headings ?? 'en'];
  const accent = hex(state.accent);
  const grey = '52606D';

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
  const contact = [d.phone, d.email, d.location, d.linkedin].filter(Boolean).join('  |  ');
  if (contact) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: contact, color: grey })] }));

  if (d.summary) {
    body.push(heading(L.summary), plain(d.summary));
  }

  if (d.experience.length) {
    body.push(heading(L.experience));
    for (const e of d.experience) {
      const when = [e.start, e.current ? L.present : e.end].filter(Boolean).join(' – ');
      body.push(leftRight([new TextRun({ text: e.role, bold: true })], when));
      const where = [e.org, e.location].filter(Boolean).join(', ');
      if (where) body.push(plain(where, { color: grey }));
      for (const b of lines(e.bullets)) body.push(bullet(b));
      body.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
    }
  }

  if (d.education.length) {
    body.push(heading(L.education));
    for (const e of d.education) {
      const runs = [new TextRun({ text: e.degree, bold: true })];
      if (e.institution) runs.push(new TextRun(`, ${e.institution}`));
      if (e.result) runs.push(new TextRun({ text: ` (${e.result})`, color: grey }));
      body.push(leftRight(runs, e.year));
    }
  }

  if (d.skills || d.languages) {
    body.push(heading(L.skills));
    if (d.skills) body.push(plain(list(d.skills).join(', ')));
    if (d.languages) body.push(new Paragraph({ children: [new TextRun({ text: `${L.languages}: `, bold: true }), new TextRun(d.languages)] }));
  }

  if (d.training.length) {
    body.push(heading(L.training));
    for (const t of d.training) {
      body.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: t.name, bold: true }), new TextRun([t.org && `, ${t.org}`, t.year && ` (${t.year})`].filter(Boolean).join(''))] }));
    }
  }

  if (d.showPersonal) {
    const rows: [string, string][] = ([
      [L.father, d.father], [L.mother, d.mother], [L.dob, d.dob], [L.nationality, d.nationality], [L.religion, d.religion], [L.permanent, d.permanentAddress],
    ] as [string, string][]).filter(([, v]) => v);
    if (rows.length) {
      body.push(heading(L.personal));
      for (const [k, v] of rows) {
        body.push(new Paragraph({ tabStops: [{ type: TabStopType.LEFT, position: 2600 }], spacing: { after: 20 }, children: [new TextRun({ text: k, color: grey }), new TextRun(`\t${v}`)] }));
      }
    }
  }

  if (d.references.length) {
    body.push(heading(L.references));
    for (const r of d.references) {
      body.push(plain(r.name, { bold: true }));
      if (r.title) body.push(plain(r.title));
      if (r.contact) body.push(plain(r.contact, { color: grey }));
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
    sections: [{ properties: { page: { size: A4, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: body }],
  });
  return Packer.toBlob(doc);
}
