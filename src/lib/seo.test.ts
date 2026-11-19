import { describe, expect, it } from 'vitest';
import { seoTarget } from './seo';

describe('builder preset URLs', () => {
  it('are noindex and canonical to the matching page', () => {
    expect(seoTarget('/builder', '?preset=europass')).toEqual({ canonical: '/europass-cv', noindex: true });
    expect(seoTarget('/builder', '?preset=gulf')).toEqual({ canonical: '/cv-for-gulf-jobs', noindex: true });
    expect(seoTarget('/builder', '?preset=scholarship')).toEqual({ canonical: '/scholarship-cv', noindex: true });
    expect(seoTarget('/builder', '?preset=academic')).toEqual({ canonical: '/academic-cv', noindex: true });
    expect(seoTarget('/builder', '?preset=other')).toEqual({ canonical: '/builder', noindex: true });
  });
  it('leave the plain builder and other pages indexable', () => {
    expect(seoTarget('/builder', '')).toEqual({ canonical: '/builder', noindex: false });
    expect(seoTarget('/europass-cv', '?preset=europass')).toEqual({ canonical: '/europass-cv', noindex: false });
    expect(seoTarget('/', '')).toEqual({ canonical: '/', noindex: false });
  });
});
