import { describe, expect, it } from 'vitest';
import { printDocument } from './printIsolated';
import { renderCvHtml } from './renderCvHtml';
import { DEFAULT_MARGINS, emptyCv, type BuilderState } from './model';

const state = (over: Partial<BuilderState> = {}): BuilderState => ({
  data: { ...emptyCv(), name: 'Rajoni Hassan', headline: 'Executive' },
  design: 'classic', accent: '#1e3a5f', font: 'sans', headings: 'en', margins: DEFAULT_MARGINS, ...over,
} as BuilderState);

describe('clean PDF from saved data', () => {
  it('renders the CV from saved data with a footer only when asked', async () => {
    const free = await renderCvHtml(state(), true);
    const pro = await renderCvHtml(state(), false);
    expect(free).toContain('Rajoni Hassan');
    expect(free).toContain('cv-watermark');
    expect(pro).toContain('Rajoni Hassan');
    expect(pro).not.toContain('cv-watermark');
  });

  it('the printed document holds the CV and our styles only', () => {
    const doc = printDocument('<p>CV body</p>', 'Rajoni_Hassan_CV', '<style>.x{}</style>');
    expect(doc).toContain('<title>Rajoni_Hassan_CV</title>');
    expect(doc).toContain('<div id="cv-print"><p>CV body</p></div>');
    expect(doc.match(/<body>/g)).toHaveLength(1);
    expect(doc).not.toMatch(/<script/i);
  });

  it('escapes the title', () => {
    expect(printDocument('', 'A<b>"', '')).toContain('<title>A&lt;b&gt;&quot;</title>');
  });
});
