import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DESIGN_LIST } from '../../shared/designList';
import { CvDocument } from './designs';
import { emptyCv, newReference } from './model';

describe('CV designs', () => {
  const d = { ...emptyCv(), name: 'Rahim Uddin', headline: 'Credit Analyst', skills: 'Excel, Credit analysis, Reporting', languages: 'Bangla, English' };
  it.each(DESIGN_LIST.map((x) => x.id))('%s renders name, headline and skills', (id) => {
    const html = renderToStaticMarkup(<CvDocument d={d} design={id} accent="#1d4ed8" />);
    expect(html).toContain('Rahim Uddin');
    expect(html).toContain('Credit Analyst');
    expect(html).toContain('Credit analysis');
  });

  it.each(DESIGN_LIST.map((x) => x.id))('%s shows every referee with phone and email', (id) => {
    const refs = [
      { ...newReference(), name: 'Dr. First Referee', title: 'Professor', org: 'Example University', phone: '+8801711000001', email: 'first@example.com' },
      { ...newReference(), name: 'Dr. Second Referee', title: 'Professor', org: 'Example University', phone: '+8801711000002', email: 'second@example.com' },
    ];
    const html = renderToStaticMarkup(<CvDocument d={{ ...d, references: refs }} design={id} accent="#1d4ed8" />);
    for (const r of refs) for (const v of [r.name, r.phone, r.email]) expect(html).toContain(v);
  });
});
