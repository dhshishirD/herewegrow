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

describe('references split by the next heading', () => {
  const REFS = `A NAME
a@b.com

REFERENCES
Dr. Hossain Al Mamun
Professor
Department of English
+8801711987266, profham.sust@gmail.com
Dr. Md. Ismail Hossain
Professor
VOLUNTEERING
Shahjalal University of Science and Technology, Sylhet
+8801711069070
ismail-scw@sust.edu`;
  const { data } = parseCv(REFS);

  it('gives the second referee back their university, phone and email', () => {
    expect(data.references).toHaveLength(2);
    const r2 = data.references[1];
    expect(r2.org).toMatch(/Shahjalal University/);
    expect(r2.phone).toMatch(/1711069070/);
    expect(r2.email).toBe('ismail-scw@sust.edu');
  });

  it('does not leave those contact lines as a Volunteering section', () => {
    expect(data.custom.map((c) => c.title)).not.toContain('Volunteering');
  });

  it('keeps real volunteering entries and puts References last', () => {
    const r = parseCv(`${REFS}\n• Taught English to 40 children`);
    expect(r.data.custom.find((c) => c.title === 'Volunteering')?.items).toHaveLength(1);
    expect(r.data.order[r.data.order.length - 1]).toBe('references');
  });
});
