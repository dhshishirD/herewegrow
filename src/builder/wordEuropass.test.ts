import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { newLanguage, setSameLevel } from './cefr';
import { withEuropass } from './europass';
import { emptyCv, newEducation, newExperience, sampleCv, type BuilderState } from './model';
import { buildDocx } from './word';

export const europassSample = (): BuilderState => {
  const s = withEuropass({ data: { ...sampleCv(), name: 'Rahim Uddin' }, design: 'classic', accent: '#1d5bd8' });
  return {
    ...s,
    data: {
      ...s.data,
      langLevels: [
        newLanguage({ name: 'Bangla', mother: true }),
        { ...setSameLevel(newLanguage({ name: 'English', certificate: 'IELTS 7.0, 2024' }), 'C1'), writing: 'B2' },
        setSameLevel(newLanguage({ name: 'German' }), 'A2'),
      ],
      digitalSkills: 'MS Office: advanced\nPower BI',
      drivingLicence: 'Category B',
      experience: [newExperience({ role: 'Analyst', org: 'ACME Ltd', location: 'Dhaka', start: 'Jan 2022', current: true, bullets: 'Built weekly reports\nCut costs by 12%' })],
      education: [newEducation({ degree: 'BBA', major: 'Finance', institution: 'University of Dhaka', year: 'Jun 2021' })],
    },
  };
};

async function xmlOf(state: BuilderState, opts = { watermark: true }) {
  const blob = await buildDocx(state, opts);
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file('word/document.xml')!.async('string');
}

describe('Word export of the Europass-style layout', () => {
  it('builds a file with the name, headings, MM/YYYY dates and the language grid text', async () => {
    const xml = await xmlOf(europassSample());
    for (const x of ['Rahim Uddin', 'Work experience', 'Education and training', 'Mother tongue', 'Bangla', 'Other languages', 'English', 'German', 'IELTS 7.0, 2024', 'Listening', 'Reading', 'Spoken interaction', 'Spoken production', 'Writing', 'Digital skills', 'Power BI', 'Driving licence', 'Category B', '01/2022', '06/2021'])
      expect(xml, x).toContain(x);
    expect(xml.indexOf('Mother tongue')).toBeLessThan(xml.indexOf('Other languages'));
    expect(xml).not.toMatch(/europass/i);
  });

  it('draws the grid as a real 6-column table with a repeating header row', async () => {
    const xml = await xmlOf(europassSample());
    const grid = xml.split('<w:tbl>').find((t) => t.includes('Spoken production'))!;
    expect(grid).toBeTruthy();
    expect(grid).toContain('<w:tblHeader');
    expect((grid.match(/<w:gridCol /g) ?? []).length).toBe(6);
    expect((grid.match(/<w:tr>|<w:tr /g) ?? []).length).toBe(3); // header + English + German
  });

  it('fits the A4 text width: every table is no wider than the page less margins, and rows never split', async () => {
    const xml = await xmlOf(europassSample());
    const widths = [...xml.matchAll(/<w:tblW [^>]*w:w="(\d+)"/g)].map((m) => +m[1]);
    expect(widths.length).toBeGreaterThan(2);
    for (const w of widths) expect(w).toBeLessThanOrEqual(11906 - 2000);
    for (const row of xml.split('<w:tr>').slice(1)) expect(row).toContain('w:cantSplit');
    // column widths of each table add up to its width
    for (const t of xml.split('<w:tbl>').slice(1)) {
      const total = +t.match(/<w:tblW [^>]*w:w="(\d+)"/)![1];
      const cols = [...(t.split('</w:tblGrid>')[0].matchAll(/<w:gridCol [^>]*w:w="(\d+)"/g))].map((m) => +m[1]);
      expect(cols.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(total + 6);
    }
  });

  it('keeps the usual rules: free file carries the footer, a Pro file does not, ATS stays Classic', async () => {
    const free = await buildDocx(europassSample(), { watermark: true });
    const zipFree = await JSZip.loadAsync(await free.arrayBuffer());
    expect(Object.keys(zipFree.files).some((f) => f.includes('footer'))).toBe(true);
    const pro = await buildDocx(europassSample(), { watermark: false });
    const zipPro = await JSZip.loadAsync(await pro.arrayBuffer());
    expect(Object.keys(zipPro.files).some((f) => f.includes('footer'))).toBe(false);
    const ats = await xmlOf({ ...europassSample(), layout: undefined });
    expect(ats).not.toContain('<w:tblHeader');
    expect(ats).toContain('Spoken production'); // other designs still print the levels, as text
  });

  it('builds from an empty CV', async () => {
    const xml = await xmlOf(withEuropass({ data: emptyCv(), design: 'classic', accent: '#1d5bd8' }));
    expect(xml).toContain('Your Name');
  });
});
