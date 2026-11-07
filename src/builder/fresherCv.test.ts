import { describe, expect, it } from 'vitest';
import { BUILT_IN, fresherCv } from './model';

describe('fresherCv', () => {
  it('puts education before work experience and links every custom section', () => {
    const d = fresherCv();
    expect(d.order.indexOf('education')).toBeLessThan(d.order.indexOf('experience'));
    expect(d.order.indexOf('summary')).toBe(0);
    BUILT_IN.forEach((k) => expect(d.order).toContain(k));
    d.custom.forEach((c) => expect(d.order).toContain(`custom:${c.id}`));
    expect(d.custom.map((c) => c.title)).toEqual(['Projects', 'Extracurricular Activities']);
  });
});
