import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { DESIGN_LIST } from '../../shared/designList';
import { emptyCv, sampleCv, type BuilderState } from './model';
import { buildDocx, sidebarSpec } from './word';

const SIDEBAR_DESIGNS = ['modern', 'graphite', 'corporate', 'pulse'];

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

  it.each(SIDEBAR_DESIGNS)('%s is a two-column table with a shaded sidebar', async (id) => {
    const xml = await documentXml(id as BuilderState['design']);
    expect(xml).toContain('<w:tbl>');
    expect((xml.match(/<w:tc>/g) ?? []).length).toBe(2);
    expect(xml).toContain('w:fill=');
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
