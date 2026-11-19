import JSZip from 'jszip';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ABROAD_PRESETS, abroadPreset } from '../../shared/abroadPresets';
import { DESIGN_LIST } from '../../shared/designList';
import { CvDocument } from './designs';
import { HIGHER_ACCENT, HIGHER_NOTE, higherOrder, higherStudySample, withHigherStudy } from './higherStudy';
import { builderHistoryShape } from './historyShape';
import { emptyCv, normalise, sampleCv, type BuilderState, type CvData } from './model';
import { buildDocx } from './word';

const base = (data: CvData = emptyCv()): BuilderState => ({ data, design: 'classic', accent: '#1e3a5f' });
const titles = (s: BuilderState) => s.data.order.map((k) => (k.startsWith('custom:') ? s.data.custom.find((c) => `custom:${c.id}` === k)!.title : k));
const html = (s: BuilderState) => renderToStaticMarkup(<CvDocument d={s.data} design={s.design} accent={s.accent} layout={s.layout} font={s.font} />);

describe('higher-study model', () => {
  it('a new CV has referees on request off, and an old saved CV loads without the field', () => {
    expect(emptyCv().refsOnRequest).toBe(false);
    const sample = sampleCv();
    const old = { ...sample } as Partial<CvData>;
    delete old.refsOnRequest;
    const d = normalise(old);
    expect(d.refsOnRequest).toBe(false);
    expect(d.order).toEqual(sample.order);
    expect(normalise({ ...emptyCv(), refsOnRequest: true }).refsOnRequest).toBe(true);
  });
  it('turning referees on request on is its own undo step', () => {
    const a = base();
    expect(builderHistoryShape.shape(base({ ...a.data, refsOnRequest: true }))).not.toBe(builderHistoryShape.shape(a));
    expect(builderHistoryShape.shape({ ...a, layout: 'scholarship' })).not.toBe(builderHistoryShape.shape(a));
  });
});

describe('preset registration', () => {
  it('registers both ids on the free Classic design and no design was added', () => {
    for (const id of ['scholarship', 'academic'] as const) {
      expect(abroadPreset(id)).toMatchObject({ design: 'classic', showPersonal: false, layout: id });
      expect(DESIGN_LIST.find((d) => d.id === ABROAD_PRESETS[id].design)?.pro).toBeFalsy();
    }
    expect(DESIGN_LIST.map((d) => d.id)).not.toContain('scholarship');
  });
});

describe('withHigherStudy', () => {
  it('scholarship section order and defaults', () => {
    const s = withHigherStudy(base({ ...emptyCv(), showPersonal: true }), 'scholarship');
    expect(titles(s)).toEqual(['summary', 'education', 'Research', 'Publications and presentations', 'Awards, scholarships and honours', 'experience', 'skills', 'training', 'Volunteering and leadership', 'personal', 'references']);
    expect(s).toMatchObject({ layout: 'scholarship', design: 'classic', accent: HIGHER_ACCENT, font: 'times' });
    expect(s.data.showPersonal).toBe(false);
    expect(s.data.photo).toBe('');
    expect(s.data.references).toHaveLength(2);
  });
  it('academic adds teaching, conferences, grants and service in order', () => {
    const t = titles(withHigherStudy(base(), 'academic'));
    expect(t).toEqual(['summary', 'education', 'Research', 'Publications and presentations', 'Teaching experience', 'Conferences', 'Grants and fellowships', 'Awards, scholarships and honours', 'experience', 'skills', 'training', 'Academic service and memberships', 'Volunteering and leadership', 'personal', 'references']);
  });
  it('opening again keeps the order, colour and font the person chose', () => {
    const once = withHigherStudy(base(), 'academic');
    const edited: BuilderState = { ...once, accent: '#7c2d12', font: 'garamond', data: { ...once.data, order: [...once.data.order].reverse() } };
    const again = withHigherStudy(edited, 'academic');
    expect(again.data.order).toEqual(edited.data.order);
    expect(again.accent).toBe('#7c2d12');
    expect(again.font).toBe('garamond');
    expect(again.data.custom).toHaveLength(once.data.custom.length);
  });
  it('keeps existing sections with the same title instead of duplicating them', () => {
    const d = emptyCv();
    d.custom = [{ id: 'r1', title: 'research', items: [] }];
    const s = withHigherStudy(base(d), 'scholarship');
    expect(s.data.custom.filter((c) => c.title.toLowerCase() === 'research')).toHaveLength(1);
    expect(higherOrder(s.data, 'scholarship')).toContain('custom:r1');
  });
  it('has a bilingual note', () => {
    expect(HIGHER_NOTE.en).toBe("Preset follows common scholarship norms. Always follow the programme's own form first.");
    expect(HIGHER_NOTE.bn).toBeTruthy();
  });
});

describe('preview HTML', () => {
  it('scholarship shows the headings in order with no photo, personal details or logo', () => {
    const out = html(higherStudySample('scholarship'));
    const heads = ['Profile', 'Education', 'Research', 'Publications and presentations', 'Awards, scholarships and honours', 'Work experience', 'Skills and languages', 'Volunteering and leadership', 'Referees'];
    let at = -1;
    for (const h of heads) {
      const i = out.indexOf(`>${h}<`);
      expect(i, h).toBeGreaterThan(at);
      at = i;
    }
    expect(out).toContain('CGPA 3.80/4.00');
    expect(out).toContain('IELTS Academic 7.5');
    expect(out).toContain('nasrin.sultana@example.edu');
    expect(out).not.toMatch(/<img|Date of birth|Nationality|Teaching experience/);
  });
  it('academic adds its extra headings', () => {
    const out = html(higherStudySample('academic'));
    for (const h of ['Teaching experience', 'Conferences', 'Grants and fellowships', 'Academic service and memberships']) expect(out).toContain(`>${h}<`);
  });
  it('referees on request replaces the two slots', () => {
    const s = higherStudySample('scholarship');
    const out = html({ ...s, data: { ...s.data, refsOnRequest: true } });
    expect(out).toContain('Referees available on request.');
    expect(out).not.toContain('nasrin.sultana@example.edu');
  });
  it('uses a serif stack and 11 pt', () => {
    const out = html(withHigherStudy(base(), 'scholarship'));
    expect(out).toContain('Times New Roman');
    expect(out).toContain('font-size:14.67px');
  });
});

describe('Word export', () => {
  const xmlOf = async (s: BuilderState) => (await JSZip.loadAsync(await (await buildDocx(s, { watermark: true })).arrayBuffer())).file('word/document.xml')!.async('string');
  it.each(['scholarship', 'academic'] as const)('%s file has the headings, CGPA, test score and both referees', async (layout) => {
    const xml = await xmlOf(higherStudySample(layout));
    const heads = ['Profile', 'Education', 'Research', 'Publications and presentations', 'Awards, scholarships and honours', 'Work experience', 'Skills and languages', 'Volunteering and leadership', 'Referees', ...(layout === 'academic' ? ['Teaching experience', 'Conferences', 'Grants and fellowships', 'Academic service and memberships'] : [])];
    for (const h of heads) expect(xml, h).toContain(h);
    for (const x of ['Tahmina Akter', layout === 'academic' ? 'CGPA 3.85/4.00' : 'CGPA 3.80/4.00', 'IELTS Academic 7.5', 'Prof. Nasrin Sultana', 'Dr. Imran Hossain', 'imran.hossain@example.edu']) expect(xml, x).toContain(x);
    expect(xml.indexOf('Education')).toBeLessThan(xml.indexOf('Work experience'));
    expect(xml).not.toContain('Date of birth');
  });
  it('referees on request in Word', async () => {
    const s = higherStudySample('scholarship');
    const xml = await xmlOf({ ...s, data: { ...s.data, refsOnRequest: true } });
    expect(xml).toContain('Referees available on request.');
    expect(xml).not.toContain('imran.hossain@example.edu');
  });
});
