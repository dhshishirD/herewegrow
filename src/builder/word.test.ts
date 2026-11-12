import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { DESIGN_LIST } from '../../shared/designList';
import { emptyCv, sampleCv, type BuilderState } from './model';
import { buildDocx, sidebarSpec } from './word';

const SIDEBAR_DESIGNS = ['modern', 'graphite', 'corporate', 'pulse', 'banner'];
const PLAIN_SIDEBARS = SIDEBAR_DESIGNS.filter((x) => x !== 'banner');
/** Newer designs: colour header band over a main column and a right-hand panel. */
const PANEL_DESIGNS = ['care', 'journey', 'terminal', 'chalk', 'scholar', 'ledger', 'office', 'spark', 'support', 'passport', 'road', 'orbit'];
/** Designs that are one column by design, so they may be a plain layout. */
const ONE_COLUMN = ['classic', 'executive'];

async function documentXml(design: BuilderState['design']) {
  const state: BuilderState = { data: { ...sampleCv(), name: 'Rahim Uddin' }, design, accent: '#1d4ed8' };
  const blob = await buildDocx(state, { watermark: true });
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file('word/document.xml')!.async('string');
}

describe('Word export layouts', () => {
  it('knows exactly the sidebar designs', () => {
    const ids = DESIGN_LIST.map((x) => x.id).filter((id) => sidebarSpec(id, '#1d4ed8'));
    expect(ids.sort()).toEqual([...SIDEBAR_DESIGNS, ...PANEL_DESIGNS].sort());
  });

  it.each(DESIGN_LIST.map((x) => x.id))('%s builds a Word file with the CV name', async (id) => {
    const xml = await documentXml(id);
    expect(xml).toContain('Rahim Uddin');
  });

  it.each(PLAIN_SIDEBARS)('%s is a two-column table with a shaded sidebar', async (id) => {
    const xml = await documentXml(id as BuilderState['design']);
    expect(xml).toContain('<w:tbl>');
    expect((xml.match(/<w:tc>/g) ?? []).length).toBe(2);
    expect(xml).toContain('w:fill=');
  });

  it('banner has a full-width coloured band above the two columns', async () => {
    const xml = await documentXml('banner');
    expect(xml).toContain('w:gridSpan');
    expect((xml.match(/<w:tc>/g) ?? []).length).toBe(3); // band + side column + main column
    expect(xml).toContain('w:fill="1D4ED8"');
    expect(xml.indexOf('Rahim Uddin')).toBeLessThan(xml.indexOf('<w:tc>', xml.indexOf('w:gridSpan') + 1));
  });

  // Regression: the newer designs used to fall through to the plain one-column file, so "Word" never matched the preview
  it.each(DESIGN_LIST.map((x) => x.id).filter((id) => !ONE_COLUMN.includes(id)))('%s is not the plain Classic file', async (id) => {
    const [xml, classic] = await Promise.all([documentXml(id), documentXml('classic')]);
    expect(xml).not.toEqual(classic);
    const usesTable = xml.includes('<w:tbl>');
    const usesShading = xml.includes('<w:shd');
    expect(usesTable || usesShading).toBe(true);
  });

  it.each(PANEL_DESIGNS)('%s has a full-width header band over a main column and a panel', async (id) => {
    const xml = await documentXml(id as BuilderState['design']);
    const spec = sidebarSpec(id as BuilderState['design'], '#1d4ed8')!;
    expect(xml).toContain('<w:tbl>');
    expect(xml).toContain('w:gridSpan'); // the band spans both columns
    expect(xml).toContain(`w:fill="${spec.band}"`); // band colour
    expect(xml).toContain(`w:fill="${spec.fill}"`); // panel colour
    expect(xml.indexOf('Rahim Uddin')).toBeLessThan(xml.indexOf('Professional Summary'.toUpperCase()));
    // name, headline and contact are in the band, ahead of everything else; the panel starts with the skills
    expect(xml.indexOf('nusrat.jahan@email.com')).toBeGreaterThan(-1);
    expect(xml.indexOf('nusrat.jahan@email.com')).toBeLessThan(xml.indexOf('SKILLS'));
    expect(xml.split('nusrat.jahan@email.com').length - 1).toBe(1); // contact shown once, not again in the panel
  });

  it('terminal uses a mono face and // headings', async () => {
    const xml = await documentXml('terminal');
    expect(xml).toContain('Consolas');
    expect(xml).toContain('// WORK EXPERIENCE');
  });

  it('passport puts the personal details in a card above the main column', async () => {
    const state: BuilderState = { data: { ...sampleCv(), name: 'Rahim Uddin', showPersonal: true }, design: 'passport', accent: '#1d4ed8' };
    const zip = await JSZip.loadAsync(await (await buildDocx(state)).arrayBuffer());
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml.indexOf('DATE OF BIRTH')).toBeGreaterThan(-1);
    expect(xml.indexOf('DATE OF BIRTH')).toBeLessThan(xml.indexOf('PROFESSIONAL SUMMARY'));
    expect(xml.split('DATE OF BIRTH').length - 1).toBe(1); // not repeated in the panel
  });

  it('ledger has a thin colour bar above the white band', async () => {
    const xml = await documentXml('ledger');
    expect(xml).toContain('w:fill="1D4ED8"');
    expect((xml.match(/<w:tr>/g) ?? []).length).toBeGreaterThanOrEqual(3); // top bar, band, body
  });

  it('ascent is a header band over label rows with a cream label column', async () => {
    const xml = await documentXml('ascent');
    expect(xml).toContain('w:gridSpan');
    expect(xml).toContain('w:fill="F7F1E1"');
    expect(xml).toContain('PROFILE');
    expect(xml).toContain('C9A24B'); // gold rule under the band
  });

  it('keeps headings and entries from being chained together inside the panel designs', async () => {
    // A long keep-with-next chain inside one table row makes Word and LibreOffice push the whole row to page two
    for (const id of PANEL_DESIGNS) expect(await documentXml(id as BuilderState['design'])).not.toContain('w:keepNext');
  });

  it('the ATS option is the plain one-column file for any design', async () => {
    const state: BuilderState = { data: { ...sampleCv(), name: 'Rahim Uddin' }, design: 'spark', accent: '#1d4ed8' };
    const zip = await JSZip.loadAsync(await (await buildDocx({ ...state, design: 'classic' })).arrayBuffer());
    expect(await zip.file('word/document.xml')!.async('string')).not.toContain('<w:tbl>');
  });

  it.each(ONE_COLUMN)('%s stays one column (no table)', async (id) => {
    const xml = await documentXml(id as BuilderState['design']);
    expect(xml).not.toContain('<w:tbl>');
  });

  it('elegant has a coloured band row above the sections', async () => {
    const xml = await documentXml('elegant');
    expect(xml).toContain('w:fill="1D4ED8"');
    expect((xml.match(/<w:tr>/g) ?? []).length).toBe(2);
    expect(xml).toContain('w:pBdr'); // rule beside each entry
  });

  it('bold has an accent strip cell beside the content', async () => {
    const xml = await documentXml('bold');
    expect(xml).toContain('<w:tbl>');
    expect(xml).toContain('w:fill="1D4ED8"');
    expect(xml).toContain('w:caps');
  });

  it('minimal puts each section label in its own table row', async () => {
    const xml = await documentXml('minimal');
    const rows = (xml.match(/<w:tr>/g) ?? []).length;
    expect(rows).toBeGreaterThanOrEqual(5);
    expect(xml).toContain('PROFILE');
  });

  it('timeline, fresher and bars follow their preview', async () => {
    const timeline = await documentXml('timeline');
    expect(timeline).toContain('<w:tbl>'); // header table with the heavy rule
    expect(timeline).toContain('■');
    const fresher = await documentXml('fresher');
    expect(fresher).not.toContain('<w:tbl>');
    expect(fresher).toContain('w:shd'); // skill tags
    const bars = await documentXml('bars');
    expect(bars).toContain('w:shd'); // section bars
    expect(bars).toContain('<w:jc w:val="center"/>');
  });

  it('works with an empty CV on a sidebar design', async () => {
    const blob = await buildDocx({ data: emptyCv(), design: 'modern', accent: '#1d4ed8' });
    expect(blob.size).toBeGreaterThan(1000);
  });

  it.each(DESIGN_LIST.map((x) => x.id))('%s builds from an empty CV', async (id) => {
    const blob = await buildDocx({ data: emptyCv(), design: id, accent: '#1d4ed8' });
    expect(blob.size).toBeGreaterThan(1000);
  });
  it.each(['modern', 'banner', 'office'])('%s: a blank referee does not leave an empty REFERENCES heading', async (id) => {
    const d = { ...sampleCv(), references: [{ id: 'x', name: '', title: '', org: '', phone: '', email: '', relation: '' }] };
    const blob = await buildDocx({ data: d, design: id as BuilderState['design'], accent: '#1d4ed8' });
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).not.toContain('REFERENCES');
  });
});
