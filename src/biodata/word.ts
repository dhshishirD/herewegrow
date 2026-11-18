// Editable Word (.docx) version of a marriage biodata, built in the browser.
// One clean layout for every style (colour header, label and value rows) so the person can edit it freely.
import { AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { buildSections, type BiodataData } from './model';
import type { Colour } from './styles';

const hex = (c: string) => c.replace('#', '').toUpperCase();
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };

function photoRun(src: string): ImageRun | null {
  const m = src.match(/^data:image\/(png|jpeg|jpg|gif);base64,(.+)$/);
  if (!m) return null;
  const bin = atob(m[2]);
  const data = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new ImageRun({ type: m[1] === 'jpg' ? 'jpg' : (m[1] as 'png' | 'jpg' | 'gif'), data, transformation: { width: 110, height: 138 } });
}

export async function buildBiodataDocx(d: BiodataData, colour: Colour, opts: { footer: boolean }): Promise<Blob> {
  const main = hex(colour.main);
  const tint = hex(colour.tint);
  const kids: (Paragraph | Table)[] = [];
  const photo = photoRun(d.photo);

  const title = [
    new Paragraph({ children: [new TextRun({ text: 'MARRIAGE BIODATA', size: 20, color: tint, characterSpacing: 60, bold: true })] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: d.name.trim() || 'Your Name', size: 60, bold: true, color: main })] }),
  ];
  kids.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { ...NO_BORDERS, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, children: title }),
      new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: photo ? [photo] : [] })] }),
    ] })],
  }));
  kids.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: tint, space: 4 } }, spacing: { after: 200 }, children: [] }));

  for (const s of buildSections(d)) {
    kids.push(new Paragraph({ keepNext: true, spacing: { before: 240, after: 100 }, shading: { type: ShadingType.CLEAR, fill: main }, children: [new TextRun({ text: ` ${s.title}`, bold: true, color: 'FFFFFF', size: 24 })] }));
    if (s.rows.length) {
      kids.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...NO_BORDERS, insideHorizontal: NONE, insideVertical: NONE },
        rows: s.rows.map(([l, v]) => new TableRow({ cantSplit: true, children: [
          new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, children: [new Paragraph({ children: [new TextRun({ text: l, bold: true, color: main })] })] }),
          new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: NO_BORDERS, children: [new Paragraph({ children: [new TextRun({ text: v })] })] }),
        ] })),
      }));
    }
    if (s.text) for (const line of s.text.split('\n')) kids.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: line })] }));
  }
  if (opts.footer) kids.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 300 }, children: [new TextRun({ text: 'Made with herewegrow.pro', size: 16, color: '94A3B8' })] }));

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Georgia', size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } }, children: kids }],
  });
  return Packer.toBlob(doc);
}
