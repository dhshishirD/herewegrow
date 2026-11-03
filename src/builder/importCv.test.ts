import { describe, expect, it } from 'vitest';
import { parseCv } from './importCv';

const CV = `DALOYAR HASSAN SHISHIR
Policy Analyst
+8801700000000 | a@b.com

EDUCATION
B.A. in English Language and Literature in Honours
Shahjalal University of Science and Technology, CGPA 2.99/4.00 2023

PROJECTS
General Member 2021 – Present
Society for Development Discourse and Change

Selected Policy Analysis (non-peer-reviewed, published at dhshishir.com, September 2026)
• Bay of Bengal Maritime Geopolitics: Naval Strategy
• Red Sea Crisis and Global Chokepoints

FELLOWSHIPS AND INTERNATIONAL PROGRAMS
• Young Leaders Program Delegate June 2025
• Visiting Fellow, Study of the Malaysian Development Model August 2026

VOLUNTEER ROLES
• Taught English to 40 children

WORK EXPERIENCE
Lecturer, English Language and Grammar
University Coaching Center, Bangladesh
May 2019 – Present
• Taught grammar to 200 students
`;

describe('importing a CV with headings the site does not know', () => {
  const { data } = parseCv(CV);
  const titles = data.custom.map((c) => c.title);

  it('gives each unknown or extra heading its own section', () => {
    expect(titles).toContain('Projects');
    expect(titles).toContain('Policy Analysis and Writing');
    expect(titles).toContain('Fellowships and International Programs');
    expect(titles).toContain('Volunteering');
  });

  it('does not pile the later headings into Projects', () => {
    const projects = data.custom.find((c) => c.title === 'Projects')!;
    const text = JSON.stringify(projects.items);
    expect(text).not.toMatch(/Young Leaders|Bay of Bengal|Taught English/);
  });

  it('turns a made-up ALL-CAPS heading into a section with its own name', () => {
    const r = parseCv('A NAME\nEDUCATION\nBBA, DU 2020\n\nSELECTED MEDIA APPEARANCES\n• Interviewed on TV in 2025\n• Quoted in a daily newspaper');
    expect(r.data.custom.map((c) => c.title)).toContain('Selected Media Appearances');
  });

  it('keeps the name line from being taken as a heading', () => {
    expect(data.name).toBe('DALOYAR HASSAN SHISHIR');
  });
});
