import { describe, expect, it } from 'vitest';
import { analyzeCv } from './cvAnalysis';
import { htmlToCv } from './docxText';

describe('htmlToCv', () => {
  it('turns paragraphs and lists into lines and decodes entities', () => {
    const r = htmlToCv('<h1>Rahim &amp; Co</h1><p>Mobile: 01712345678</p><p></p><ul><li>Led 4 teams</li></ul>');
    expect(r.text).toBe('Rahim & Co\nMobile: 01712345678\nLed 4 teams');
    expect(r.layout).toEqual({ fromPdf: false, fromDocx: true, splitRowShare: 0 });
  });

  it('puts table cells on one tab-separated line', () => {
    const r = htmlToCv('<table><tr><td><p>Sales Intern</p></td><td><p>Jan 2024 - Jun 2024</p></td></tr></table>');
    expect(r.text).toBe('Sales Intern\tJan 2024 - Jun 2024');
  });

  it('a one-column CV with a date table is not a column layout', () => {
    const html = '<p>Name</p><p>Summary</p><p>Experience</p><table><tr><td>ABC Traders</td><td>2024 - 2025</td></tr></table><p>Education</p>';
    expect(htmlToCv(html).layout.splitRowShare).toBeLessThan(0.3);
  });

  it('a two-column table CV is flagged', () => {
    const side = (l: string, r: string) => `<tr><td>${l}</td><td>${r}</td></tr>`;
    const html = `<table>${side('Skills', 'Customer service, data entry and Excel')}${side('Languages', 'Bangla native, English working level')}${side('Contact', 'rahim@example.com, 01712345678')}</table><p>Name</p>`;
    const r = htmlToCv(html);
    expect(r.layout.splitRowShare).toBeGreaterThanOrEqual(0.3);
    expect(analyzeCv(r.text, r.layout).checks.find((c) => c.id === 'columns')?.pass).toBe(false);
  });

  it('survives odd input', () => {
    expect(htmlToCv('')).toEqual({ text: '', layout: { fromPdf: false, fromDocx: true, splitRowShare: 0 } });
    expect(htmlToCv('<p>a &#x110000; b &#65; &bogus;</p>').text).toBe('a &#x110000; b A &bogus;');
  });
});

describe('analyzeCv for Word files', () => {
  const text = 'Rahim\nrahim@gmail.com 01712345678\nExperience\nEducation\nSkills';
  const ids = (layout: Parameters<typeof analyzeCv>[1]) => analyzeCv(text, layout).checks.map((c) => c.id);
  it('runs the column check but not the PDF-readability check', () => {
    expect(ids({ fromPdf: false, fromDocx: true, splitRowShare: 0 })).toContain('columns');
    expect(ids({ fromPdf: false, fromDocx: true, splitRowShare: 0 })).not.toContain('readable');
  });
  it('keeps PDF at 14 checks, Word at 13 and pasted text at 12', () => {
    expect(ids({ fromPdf: true, splitRowShare: 0 })).toHaveLength(14);
    expect(ids({ fromPdf: false, fromDocx: true, splitRowShare: 0 })).toHaveLength(13);
    expect(ids({ fromPdf: false, splitRowShare: 0 })).toHaveLength(12);
  });
});
