import { describe, expect, it } from 'vitest';
import { parseEdit, parseWhen, problemsOf, slotNotes } from './blogEdit';

const good = { title: 'শিরোনাম', slug: 'my-post', metaTitle: 'মেটা', metaDescription: 'বর্ণনা', primaryKeyword: 'কী', secondaryKeywords: [' এক ', ''], author: 'লেখক', cta: 'Builder', body: 'বডি' };

describe('parseEdit', () => {
  it('accepts a full form and trims keywords', () => {
    const r = parseEdit(good);
    expect(r.ok && r.value.secondaryKeywords).toEqual(['এক']);
  });
  it('rejects missing fields, bad slugs, empty body and oversized text', () => {
    expect(parseEdit({ ...good, title: undefined })).toEqual({ ok: false, error: 'bad_input' });
    expect(parseEdit({ ...good, slug: 'Bad Slug' })).toEqual({ ok: false, error: 'bad_slug' });
    expect(parseEdit({ ...good, body: '  ' })).toEqual({ ok: false, error: 'body_required' });
    expect(parseEdit({ ...good, title: ' ' })).toEqual({ ok: false, error: 'title_required' });
    expect(parseEdit({ ...good, title: 'x'.repeat(201) })).toEqual({ ok: false, error: 'bad_input' });
    expect(parseEdit({ ...good, secondaryKeywords: 'x' })).toEqual({ ok: false, error: 'bad_input' });
    expect(parseEdit(null)).toEqual({ ok: false, error: 'bad_input' });
  });
});

describe('parseWhen', () => {
  it('reads Bangladesh time (UTC+6), defaulting to 09:00', () => {
    expect(parseWhen('2026-11-22')).toBe(Date.UTC(2026, 10, 22, 3, 0));
    expect(parseWhen('2026-11-22', '21:30')).toBe(Date.UTC(2026, 10, 22, 15, 30));
    expect(parseWhen('2026-11-22', '03:00')).toBe(Date.UTC(2026, 10, 21, 21, 0));
  });
  it('rejects dates and times that are not real', () => {
    for (const [d, t] of [['2026-02-30', '09:00'], ['2026-13-01', '09:00'], ['22-11-2026', '09:00'], ['2026-11-22', '24:00'], ['2026-11-22', '9:00'], [5, '09:00']] as const) expect(parseWhen(d, t)).toBeNull();
  });
});

describe('problemsOf', () => {
  it('lists what blocks publishing', () => {
    expect(problemsOf({ body: 'ok', author: 'a', primaryKeyword: 'k', metaTitle: 't', metaDescription: 'd' })).toEqual([]);
    const p = problemsOf({ body: 'x ⚠ [আপনার ইনপুট]', author: '', primaryKeyword: '', metaTitle: '', metaDescription: '' });
    expect(p).toHaveLength(5);
  });
});

describe('slotNotes', () => {
  const sun = Date.UTC(2026, 10, 22, 3); // Sunday 22 Nov, 09:00 Dhaka
  it('is quiet on a plan day with no clash', () => expect(slotNotes(sun, [])).toEqual([]));
  it('notes off-plan days and same-day posts', () => {
    const mon = Date.UTC(2026, 10, 23, 3);
    expect(slotNotes(mon, [])[0]).toContain('সোমবার');
    expect(slotNotes(sun, [{ id: 'P002', publishAt: sun + 3600_000 }, { id: 'P003', publishAt: null }])).toEqual(['ওই দিনে আরও পোস্ট আছে: P002']);
  });
});
