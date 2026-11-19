import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { setSameLevel, newLanguage } from './cefr';
import { CvDocument } from './designs';
import { EUROPASS_ACCENT, EUROPASS_NOTE, applyEducationFirst, euDate, euDates, europassOrder, withEuropass } from './europass';
import { builderHistoryShape } from './historyShape';
import { BUILT_IN, emptyCv, normalise, newCustomItem, newEducation, newExperience, sampleCv, type BuilderState, type CvData } from './model';

const base = (data: CvData = emptyCv()): BuilderState => ({ data, design: 'classic', accent: '#1e3a5f' });

describe('model defaults and migration for the new fields', () => {
  it('a new CV has no language levels, digital skills or licence, and education stays second', () => {
    const d = emptyCv();
    expect(d.langLevels).toEqual([]);
    expect(d.digitalSkills).toBe('');
    expect(d.drivingLicence).toBe('');
    expect(d.educationFirst).toBe(false);
    expect(d.order).toEqual([...BUILT_IN]);
  });

  it('an old saved CV without the new fields still loads, with the same section order', () => {
    const sample = sampleCv();
    const old = { ...sample } as Partial<CvData>;
    for (const k of ['langLevels', 'digitalSkills', 'drivingLicence', 'educationFirst'] as const) delete old[k];
    const d = normalise(old);
    expect(d.langLevels).toEqual([]);
    expect(d.digitalSkills).toBe('');
    expect(d.educationFirst).toBe(false);
    expect(d.order).toEqual(sample.order);
    expect(d.order).not.toContain('cefr');
  });

  it('keeps the added sections where the CV lists them and drops unknown keys', () => {
    const d = normalise({ ...emptyCv(), order: ['summary', 'cefr', 'driving', 'nonsense', ...BUILT_IN.filter((k) => k !== 'summary')] });
    expect(d.order.slice(0, 3)).toEqual(['summary', 'cefr', 'driving']);
    expect(d.order).not.toContain('nonsense');
    expect(d.order).not.toContain('digital');
  });

  it('cleans bad saved language entries', () => {
    const d = normalise({ ...emptyCv(), langLevels: [{ id: 'x', name: 'English', listening: 'Q' } as never], digitalSkills: 5 as never });
    expect(d.langLevels[0]).toMatchObject({ id: 'x', name: 'English', listening: '', mother: false });
    expect(d.digitalSkills).toBe('');
  });

  it('adding a language, or turning on education first, is its own undo step', () => {
    const a = base();
    const b = base({ ...a.data, langLevels: [newLanguage({ id: 'l1', name: 'English' })] });
    const sh = builderHistoryShape.shape;
    expect(sh(b)).not.toBe(sh(a));
    expect(sh(base({ ...a.data, educationFirst: true }))).not.toBe(sh(a));
    expect(sh({ ...a, layout: 'europass' })).not.toBe(sh(a));
    // typing a name keeps the same shape
    expect(sh(base({ ...b.data, langLevels: [{ ...b.data.langLevels[0], name: 'English (UK)' }] }))).toBe(sh(b));
  });
});

describe('Europass-style layout helpers', () => {
  it('writes dates as MM/YYYY', () => {
    expect(euDate('Jan 2024')).toBe('01/2024');
    expect(euDate('September 2023')).toBe('09/2023');
    expect(euDate('2024-03')).toBe('03/2024');
    expect(euDate('3/2024')).toBe('03/2024');
    expect(euDate('12.2019')).toBe('12/2019');
    expect(euDate('2022')).toBe('2022');
    expect(euDate('13/2024')).toBe('13/2024');
    expect(euDate('')).toBe('');
    expect(euDates('Jan 2024', '', true, 'Present')).toBe('01/2024 – Present');
    expect(euDates('Jul 2023', 'Dec 2023', false, 'Present')).toBe('07/2023 – 12/2023');
  });

  it('moves education above work for freshers and back', () => {
    const o = ['summary', 'experience', 'education', 'skills'];
    expect(applyEducationFirst(o, true)).toEqual(['summary', 'education', 'experience', 'skills']);
    expect(applyEducationFirst(applyEducationFirst(o, true), false)).toEqual(o);
    expect(applyEducationFirst(o, false)).toBe(o);
  });

  it('orders the sections: profile, work, education, languages, digital, skills, projects, volunteering, certificates', () => {
    const s = withEuropass(base());
    const names = s.data.order.map((k) => (k.startsWith('custom:') ? s.data.custom.find((c) => `custom:${c.id}` === k)!.title : k));
    expect(names).toEqual(['summary', 'experience', 'education', 'cefr', 'digital', 'skills', 'Projects', 'Volunteering', 'training', 'driving', 'personal', 'references']);
    expect(europassOrder({ ...s.data, educationFirst: true }).indexOf('education')).toBeLessThan(europassOrder({ ...s.data, educationFirst: true }).indexOf('experience'));
  });

  it('turns the layout on with personal details off and the free Classic design', () => {
    const s = withEuropass(base({ ...emptyCv(), showPersonal: true }));
    expect(s.layout).toBe('europass');
    expect(s.design).toBe('classic');
    expect(s.accent).toBe(EUROPASS_ACCENT);
    expect(s.data.showPersonal).toBe(false);
    expect(s.data.photo).toBe('');
  });

  it('opening the preset again keeps the order and colour the person chose', () => {
    const once = withEuropass(base());
    const edited: BuilderState = { ...once, accent: '#7c2d12', data: { ...once.data, order: [...once.data.order].reverse() } };
    const again = withEuropass(edited);
    expect(again.data.order).toEqual(edited.data.order);
    expect(again.accent).toBe('#7c2d12');
    expect(again.data.custom).toHaveLength(2);
  });

  it('has an unofficial note in both languages and no Europass branding in the CV', () => {
    expect(EUROPASS_NOTE.en).toBe('Europass-style layout. Unofficial: not affiliated with Europass or the European Union.');
    expect(EUROPASS_NOTE.bn).toBeTruthy();
    const html = renderToStaticMarkup(<CvDocument d={withEuropass(base({ ...sampleCv(), name: 'Rahim Uddin' })).data} design="classic" accent="#1d5bd8" layout="europass" />);
    expect(html).not.toMatch(/europass|<svg|flag/i);
  });
});

describe('Europass-style preview', () => {
  const s = withEuropass(base());
  const data: CvData = {
    ...s.data,
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    experience: [newExperience({ role: 'Analyst', org: 'ACME', start: 'Jan 2022', current: true, bullets: 'Built reports' })],
    education: [newEducation({ degree: 'BBA', institution: 'DU', year: 'Jun 2021' })],
    langLevels: [
      newLanguage({ name: 'Bangla', mother: true }),
      { ...setSameLevel(newLanguage({ name: 'English', certificate: 'IELTS 7.0, 2024' }), 'C1'), writing: 'B2' },
    ],
    digitalSkills: 'Excel\nPower BI',
    drivingLicence: 'Category B',
    educationFirst: true,
    order: applyEducationFirst(s.data.order, true),
  };
  const html = renderToStaticMarkup(<CvDocument d={data} design="classic" accent="#1d5bd8" layout="europass" />);

  it('shows the grid, mother tongue first, certificate, digital skills and licence', () => {
    for (const x of ['Mother tongue', 'Bangla', 'Other languages', 'English', 'IELTS 7.0, 2024', 'Listening', 'Reading', 'Spoken interaction', 'Spoken production', 'Writing', 'Digital skills', 'Power BI', 'Driving licence', 'Category B'])
      expect(html).toContain(x);
    expect(html.indexOf('Mother tongue')).toBeLessThan(html.indexOf('Other languages'));
    expect((html.match(/>C1</g) ?? []).length).toBe(4);
    expect(html).toContain('>B2<');
  });

  it('uses Europass-style headings, MM/YYYY dates and education first when asked', () => {
    expect(html).toContain('Work experience');
    expect(html).toContain('Education and training');
    expect(html).toContain('01/2022 – Present');
    expect(html).toContain('06/2021');
    expect(html.indexOf('Education and training')).toBeLessThan(html.indexOf('Work experience'));
  });

  it('other designs still show the language levels as plain lines', () => {
    const modern = renderToStaticMarkup(<CvDocument d={data} design="modern" accent="#1d5bd8" />);
    expect(modern).toContain('English: Listening C1');
    expect(modern).toContain('Category B');
  });

  it('a project entry shows in the layout', () => {
    const withProject = { ...data, custom: data.custom.map((c, i) => (i === 0 ? { ...c, items: [newCustomItem({ title: 'Survey tool', date: 'Mar 2023', details: 'Built it' })] } : c)) };
    const out = renderToStaticMarkup(<CvDocument d={withProject} design="classic" accent="#1d5bd8" layout="europass" />);
    expect(out).toContain('Survey tool');
    expect(out).toContain('03/2023');
  });
});
