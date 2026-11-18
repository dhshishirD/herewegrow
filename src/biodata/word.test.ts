import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildBiodataDocx } from './word';
import { sampleBiodata } from './sample';
import { COLOURS } from './styles';

async function xml(b: Blob) {
  const zip = await JSZip.loadAsync(await b.arrayBuffer());
  return zip.file('word/document.xml')!.async('string');
}

describe('buildBiodataDocx', () => {
  it('writes the name, section titles and rows into the Word file', async () => {
    const x = await xml(await buildBiodataDocx(sampleBiodata(), COLOURS[0], { footer: false }));
    expect(x).toContain('Ayesha Rahman');
    expect(x).toContain('Personal Details');
    expect(x).toContain('Marital status');
    expect(x).toContain('MA in English');
  });
  it('leaves out empty sections', async () => {
    const d = sampleBiodata();
    d.expectations = '';
    const x = await xml(await buildBiodataDocx(d, COLOURS[0], { footer: false }));
    expect(x).not.toContain('Partner Expectations');
  });
  it('adds the HereWeGrow line only when asked', async () => {
    const on = await xml(await buildBiodataDocx(sampleBiodata(), COLOURS[0], { footer: true }));
    const off = await xml(await buildBiodataDocx(sampleBiodata(), COLOURS[0], { footer: false }));
    expect(on).toContain('herewegrow.pro');
    expect(off).not.toContain('herewegrow.pro');
  });
});
