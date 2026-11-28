import { describe, expect, it } from 'vitest';
import { PRESETS, classifyFile, findPreset, fitWithin, inchToMm, mmLabel, mmToPx, unreachableMessage } from './photoPresets';

describe('mm to pixels at 300 DPI', () => {
  it('computes the common print sizes', () => {
    expect(mmToPx(35)).toBe(413);
    expect(mmToPx(45)).toBe(531);
    expect(mmToPx(20)).toBe(236);
    expect(mmToPx(25)).toBe(295);
    expect(mmToPx(inchToMm(2))).toBe(600);
    expect(mmToPx(inchToMm(1))).toBe(300);
  });
  it('builds the presets from millimetres, not typed pixels', () => {
    const p = findPreset('passport')!;
    expect([p.w, p.h]).toEqual([413, 531]);
    expect(p.mm).toEqual({ w: 35, h: 45 });
    expect(p.kb).toBeNull();
    const s = findPreset('stamp')!;
    expect([s.w, s.h]).toEqual([236, 295]);
    expect(findPreset('inch2')).toMatchObject({ w: 600, h: 600 });
    expect(findPreset('inch1')).toMatchObject({ w: 300, h: 300 });
  });
  it('keeps the Teletalk-style presets and the four KB targets', () => {
    expect(findPreset('photo')).toMatchObject({ w: 300, h: 300, kb: 100 });
    expect(findPreset('signature')).toMatchObject({ w: 300, h: 80, kb: 60 });
    expect(PRESETS.filter((p) => p.group === 'kb').map((p) => p.kb)).toEqual([20, 50, 100, 200]);
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
  });
  it('formats millimetre labels', () => {
    expect(mmLabel({ w: 35, h: 45 })).toBe('35×45 mm');
    expect(mmLabel({ w: inchToMm(2), h: inchToMm(2) })).toBe('50.8×50.8 mm');
  });
});

describe('fitWithin', () => {
  it('scales the longest side down and keeps the shape', () => {
    expect(fitWithin(4000, 3000, 1200)).toEqual({ w: 1200, h: 900 });
    expect(fitWithin(600, 800, 1200)).toEqual({ w: 600, h: 800 });
  });
});

describe('classifyFile', () => {
  it('flags HEIC by type or extension', () => {
    expect(classifyFile({ name: 'a.HEIC', type: '' })).toBe('heic');
    expect(classifyFile({ name: 'a.jpg', type: 'image/heif' })).toBe('heic');
  });
  it('accepts pictures and rejects other files', () => {
    expect(classifyFile({ name: 'a.jpg', type: 'image/jpeg' })).toBe('ok');
    expect(classifyFile({ name: 'a.png', type: '' })).toBe('ok');
    expect(classifyFile({ name: 'a.pdf', type: 'application/pdf' })).toBe('notImage');
  });
});

describe('unreachableMessage', () => {
  it('states the smallest reachable size and the limit', () => {
    const m = unreachableMessage(30 * 1024, 20, 300, 300);
    expect(m.en).toContain('30.0 KB');
    expect(m.en).toContain('20 KB');
    expect(m.bn).toContain('৩০.০ KB');
  });
});
