import { describe, expect, it } from 'vitest';
import { BIG_CHANGE_CHARS, COALESCE_MS, HISTORY_LIMIT, applyChange, initHistory, redoHistory, undoHistory, type HistoryShape } from './history';
import { builderHistoryShape } from './historyShape';
import { emptyCv, newExperience, type BuilderState } from './model';

// A tiny state: a text field and a list, enough to stand in for the CV
interface S { text: string; items: string[] }
const shape: HistoryShape<S> = { shape: (s) => String(s.items.length), size: (s) => s.text.length + s.items.join('').length };
const s0: S = { text: '', items: [] };

const typeLetters = (h = initHistory(s0), word = 'hello', start = 1000) => {
  let t = start;
  for (let i = 1; i <= word.length; i++) h = applyChange(h, { ...h.present, text: word.slice(0, i) }, (t += 50), shape);
  return h;
};

describe('undo and redo', () => {
  it('typing in one go is one step: one undo takes back the whole word', () => {
    const h = typeLetters();
    expect(h.present.text).toBe('hello');
    expect(h.past).toHaveLength(1);
    expect(undoHistory(h).present.text).toBe('');
  });

  it('a pause starts a new step', () => {
    let h = typeLetters(initHistory(s0), 'ab', 1000);
    h = applyChange(h, { ...h.present, text: 'abc' }, 1000 + 100 + COALESCE_MS + 1, shape);
    expect(h.past).toHaveLength(2);
    expect(undoHistory(h).present.text).toBe('ab');
  });

  it('removing a list entry is always its own step and can be undone', () => {
    let h = applyChange(initHistory(s0), { ...s0, items: ['Bank officer'] }, 1000, shape);
    h = applyChange(h, { ...h.present, text: 'x' }, 1100, shape); // typing right after adding
    const before = h.present;
    h = applyChange(h, { ...before, items: [] }, 1200, shape); // delete, within the typing window
    expect(h.present.items).toEqual([]);
    const back = undoHistory(h);
    expect(back.present).toEqual(before);
    expect(back.present.items).toEqual(['Bank officer']);
  });

  it('a typed letter right after a delete does not swallow the delete', () => {
    let h = applyChange(initHistory({ text: 'a', items: ['one'] }), { text: 'a', items: [] }, 1000, shape);
    h = applyChange(h, { text: 'ab', items: [] }, 1050, shape);
    expect(h.past).toHaveLength(2);
    expect(undoHistory(undoHistory(h)).present.items).toEqual(['one']);
  });

  it('deleting a big block of text is its own step', () => {
    const long = 'x'.repeat(BIG_CHANGE_CHARS + 20);
    let h = applyChange(initHistory(s0), { ...s0, text: 'start' }, 1000, shape);
    h = applyChange(h, { ...h.present, text: 'start' + long }, 1050, shape);
    h = applyChange(h, { ...h.present, text: 'start' }, 1100, shape);
    expect(undoHistory(h).present.text).toBe('start' + long);
  });

  it('redo puts it back, and a new edit after an undo clears the redo list', () => {
    let h = applyChange(initHistory(s0), { ...s0, items: ['a'] }, 1000, shape);
    h = undoHistory(h);
    expect(redoHistory(h).present.items).toEqual(['a']);
    h = applyChange(h, { ...s0, items: ['b'] }, 5000, shape);
    expect(h.future).toHaveLength(0);
    expect(redoHistory(h)).toBe(h);
  });

  it('nothing to undo or redo returns the same history', () => {
    const h = initHistory(s0);
    expect(undoHistory(h)).toBe(h);
    expect(redoHistory(h)).toBe(h);
  });

  it('setting the same state again is not a step', () => {
    const h = initHistory(s0);
    expect(applyChange(h, s0, 1000, shape)).toBe(h);
  });

  it(`keeps at most ${HISTORY_LIMIT} steps`, () => {
    let h = initHistory(s0);
    for (let i = 0; i < HISTORY_LIMIT + 30; i++) h = applyChange(h, { ...s0, items: Array(i + 1).fill('i') }, 1000 + i * 5000, shape);
    expect(h.past).toHaveLength(HISTORY_LIMIT);
  });

  it('undo then redo then undo walks back and forth', () => {
    let h = initHistory(s0);
    for (const n of [1, 2, 3]) h = applyChange(h, { ...s0, items: Array(n).fill('i') }, n * 10000, shape);
    h = undoHistory(undoHistory(h));
    expect(h.present.items).toHaveLength(1);
    h = redoHistory(h);
    expect(h.present.items).toHaveLength(2);
    h = undoHistory(h);
    expect(h.present.items).toHaveLength(1);
  });
});

describe('CV builder history shape', () => {
  const base = (): BuilderState => ({ data: { ...emptyCv(), name: 'Rahim', experience: [newExperience({ role: 'Officer', bullets: 'Did a thing' })] }, design: 'classic', accent: '#1e3a5f' });
  const { shape: sh, size } = builderHistoryShape;

  it('typing changes the size but not the shape', () => {
    const a = base();
    const b: BuilderState = { ...a, data: { ...a.data, name: 'Rahim U' } };
    expect(sh(b)).toBe(sh(a));
    expect(size(b)).toBeGreaterThan(size(a));
  });

  it('removing an entry, a section, the photo, or changing the design changes the shape', () => {
    const a = base();
    expect(sh({ ...a, data: { ...a.data, experience: [] } })).not.toBe(sh(a));
    expect(sh({ ...a, data: { ...a.data, photo: 'data:image/jpeg;base64,AAAA' } })).not.toBe(sh(a));
    expect(sh({ ...a, data: { ...a.data, hidden: ['skills'] } })).not.toBe(sh(a));
    expect(sh({ ...a, design: 'modern' })).not.toBe(sh(a));
    expect(sh({ ...a, accent: '#0f766e' })).not.toBe(sh(a));
    expect(sh({ ...a, data: { ...a.data, custom: [{ id: 'c1', title: 'Projects', items: [] }], order: [...a.data.order, 'custom:c1'] } })).not.toBe(sh(a));
  });

  it('the photo bytes do not count as typed text', () => {
    const a: BuilderState = { ...base(), data: { ...base().data, photo: 'data:image/jpeg;base64,' + 'A'.repeat(50000) } };
    expect(size(a)).toBeLessThan(2000);
  });
});
