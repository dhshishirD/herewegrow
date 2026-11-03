import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DESIGN_LIST } from '../../shared/designList';
import { CvDocument } from './designs';
import { emptyCv } from './model';

describe('CV designs', () => {
  const d = { ...emptyCv(), name: 'Rahim Uddin', headline: 'Credit Analyst', skills: 'Excel, Credit analysis, Reporting', languages: 'Bangla, English' };
  it.each(DESIGN_LIST.map((x) => x.id))('%s renders name, headline and skills', (id) => {
    const html = renderToStaticMarkup(<CvDocument d={d} design={id} accent="#1d4ed8" />);
    expect(html).toContain('Rahim Uddin');
    expect(html).toContain('Credit Analyst');
    expect(html).toContain('Credit analysis');
  });
});
