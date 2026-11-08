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

  it.each(['classic', 'executive', 'elegant'])('%s stays one column (no table)', async (id) => {
    const xml = await documentXml(id as BuilderState['design']);
    expect(xml).not.toContain('<w:tbl>');
  });

  it('works with an empty CV on a sidebar design', async () => {
    const blob = await buildDocx({ data: emptyCv(), design: 'modern', accent: '#1d4ed8' });
    expect(blob.size).toBeGreaterThan(1000);
  });
});
