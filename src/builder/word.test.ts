import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { DESIGN_LIST } from '../../shared/designList';
import { emptyCv, sampleCv, type BuilderState } from './model';
import { buildDocx, sidebarSpec } from './word';

const SIDEBAR_DESIGNS = ['modern', 'graphite', 'corporate', 'pulse', 'banner'];
const PLAIN_SIDEBARS = SIDEBAR_DESIGNS.filter((x) => x !== 'banner');

async function documentXml(design: BuilderState['design']) {
  const state: BuilderState = { data: { ...sampleCv(), name: 'Rahim Uddin' }, design, accent: '#1d4ed8' };
  const blob = await buildDocx(state, { watermark: true });
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file('word/document.xml')!.async('string');
}

describe('Word export layouts', () => {
  it('knows exactly the sidebar designs', () => {
    const ids = DESIGN_LIST.map((x) => x.id).filter((id) => sidebarSpec(id, '#1d4ed8'));
    expect(ids.sort()).toEqual([...SIDEBAR_DESIGNS].sort());
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

  it.each(['classic', 'executive'])('%s stays one column (no table)', async (id) => {
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
});
