import { describe, expect, it } from 'vitest';
import {
  FRAMES, alphaBounds, autoFrame, autoLevels, classifyMatteError, compositeFrame, cropRect, cvPhotoFileName, enhanceLut,
  estimateBackground, featherAlpha, foregroundColours, findFrame, formatBytes, outputSize, panView, parseHex, refineAlpha, toHex, zoomView, NO_ENHANCE,
} from './cvPhoto';

const solid = (w: number, h: number, c: [number, number, number]) => {
  const a = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) a.set([...c, 255], i * 4);
  return a;
};

describe('crop maths', () => {
  it('fits the largest window of the shape at zoom 1', () => {
    const r = cropRect(4000, 3000, 4 / 5, { zoom: 1, cx: 0.5, cy: 0.5 });
    expect(r.h).toBeCloseTo(3000);
    expect(r.w).toBeCloseTo(2400);
    expect(r.x).toBeCloseTo(800);
    const t = cropRect(3000, 4000, 1, { zoom: 1, cx: 0.5, cy: 0.5 });
    expect(t.w).toBeCloseTo(3000);
    expect(t.h).toBeCloseTo(3000);
  });
  it('zooms in and never leaves the picture', () => {
    const r = cropRect(1000, 1000, 1, { zoom: 2, cx: 0, cy: 1 });
    expect(r).toEqual({ x: 0, y: 500, w: 500, h: 500 });
    expect(cropRect(1000, 1000, 1, { zoom: 99, cx: 0.5, cy: 0.5 }).w).toBeCloseTo(250);
    expect(cropRect(1000, 1000, 1, { zoom: 0.2, cx: 0.5, cy: 0.5 }).w).toBeCloseTo(1000);
  });
  it('pans so the picture follows the finger and stops at the edge', () => {
    const v = { zoom: 2, cx: 0.5, cy: 0.5 };
    const moved = panView(1000, 1000, 1, v, 0.2, 0);
    expect(moved.cx).toBeLessThan(0.5);
    expect(moved.cx).toBeCloseTo(0.4);
    const far = panView(1000, 1000, 1, v, 5, 5);
    expect(far.cx).toBeCloseTo(0.25);
    expect(far.cy).toBeCloseTo(0.25);
  });
  it('keeps the centre when zooming and clamps near an edge', () => {
    const v = zoomView(1000, 1000, 1, { zoom: 1, cx: 0.5, cy: 0.5 }, 2);
    expect(v.zoom).toBe(2);
    expect(v.cx).toBeCloseTo(0.5);
    const edge = zoomView(1000, 1000, 1, { zoom: 1.2, cx: 0.9, cy: 0.1 }, 3);
    const r = cropRect(1000, 1000, 1, edge);
    expect(r.x + r.w).toBeLessThanOrEqual(1000.0001);
    expect(r.y).toBeGreaterThanOrEqual(0);
  });
  it('gives the print size for 35x45 mm and a capped size for the others', () => {
    expect(outputSize(findFrame('35x45'), 100, 100)).toEqual({ w: 413, h: 531 });
    expect(outputSize(findFrame('4x5'), 2400, 3000)).toEqual({ w: 960, h: 1200 });
    expect(outputSize(findFrame('1x1'), 600, 600)).toEqual({ w: 600, h: 600 });
    expect(outputSize(findFrame('4x5'), 30, 40)).toEqual({ w: 160, h: 200 });
    expect(FRAMES.map((f) => f.id)).toEqual(['4x5', '1x1', '35x45']);
  });
});

describe('subject bounds and auto framing', () => {
  const w = 100, h = 100;
  const person = new Uint8ClampedArray(w * h);
  for (let y = 20; y < 100; y++) for (let x = 30; x < 70; x++) person[y * w + x] = 255;
  person[2 * w + 2] = 255; // a stray speck
  it('finds the person and ignores specks', () => {
    expect(alphaBounds(person, w, h)).toEqual({ x0: 30, y0: 20, x1: 70, y1: 100 });
    expect(alphaBounds(new Uint8ClampedArray(w * h), w, h)).toBeNull();
  });
  it('frames head and shoulders with a gap above the head and the person centred', () => {
    const b = alphaBounds(person, w, h)!;
    const v = autoFrame(b, w, h, 4 / 5);
    const r = cropRect(w, h, 4 / 5, v);
    expect(r.w).toBeGreaterThan(b.x1 - b.x0);
    expect(r.x + r.w / 2).toBeCloseTo(50, 0);
    expect(r.y).toBeLessThanOrEqual(b.y0);
    expect(b.y0 - r.y).toBeLessThan(r.h * 0.2);
  });
  it('crops a tall full-length photo down to the upper body', () => {
    const b = { x0: 400, y0: 200, x1: 600, y1: 1900 };
    const v = autoFrame(b, 1000, 2000, 4 / 5);
    const r = cropRect(1000, 2000, 4 / 5, v);
    expect(r.h).toBeLessThan(700);
    expect(r.y).toBeCloseTo(200 - r.h * 0.1, 0);
  });
});

describe('colours', () => {
  it('parses hex colours', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('d3e5f6')).toEqual({ r: 211, g: 229, b: 246 });
    expect(parseHex('nope')).toBeNull();
    expect(toHex({ r: 211, g: 229, b: 246 })).toBe('#d3e5f6');
  });
});

describe('matte clean-up', () => {
  it('refine removes faint haze and fills near-solid areas but keeps the soft middle', () => {
    const out = refineAlpha(Uint8ClampedArray.from([0, 10, 128, 250, 255]));
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBeGreaterThan(100);
    expect(out[2]).toBeLessThan(160);
    expect(out[3]).toBe(255);
    expect(out[4]).toBe(255);
  });
  it('feather softens a hard edge without moving it', () => {
    const w = 20, h = 4;
    const a = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) for (let x = 10; x < w; x++) a[y * w + x] = 255;
    const f = featherAlpha(a, w, h, 2);
    expect(f[1 * w + 0]).toBe(0);
    expect(f[1 * w + 19]).toBe(255);
    const edge = f[1 * w + 9];
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(255);
    expect(f[1 * w + 9]).toBeLessThan(f[1 * w + 10]);
    expect(featherAlpha(a, w, h, 0)).toEqual(a);
  });
  it('estimates the old background colour from background pixels only', () => {
    const rgba = solid(10, 10, [200, 180, 160]);
    const alpha = new Uint8ClampedArray(100);
    for (let i = 0; i < 40; i++) alpha[i] = 255;
    for (let i = 0; i < 40; i++) rgba.set([10, 10, 10, 255], i * 4);
    const bg = estimateBackground(rgba, alpha, 10)!;
    expect(bg.r).toBeCloseTo(200);
    expect(estimateBackground(rgba, alpha, 500)).toBeNull();
  });
});

describe('compositing', () => {
  const dark = { r: 20, g: 40, b: 90 };
  const white = { r: 255, g: 255, b: 255 };
  it('puts the person on the chosen colour and the background pixels become that colour exactly', () => {
    const rgba = solid(2, 1, [255, 255, 255]);
    rgba.set([30, 20, 10, 255], 0);
    const raw = Uint8ClampedArray.from([255, 0]);
    compositeFrame(rgba, raw, raw, { bg: dark, bgEstimate: null, strength: 0, enhance: NO_ENHANCE });
    expect([...rgba.slice(0, 4)]).toEqual([30, 20, 10, 255]);
    expect([...rgba.slice(4, 8)]).toEqual([20, 40, 90, 255]);
  });
  it('removes the old white wall from a dark hair edge, so no light halo shows on a dark background', () => {
    // Hair is black (0). A half-covered edge pixel over a white wall was photographed as grey 128.
    const edge = () => Uint8ClampedArray.from([128, 128, 128, 255]);
    const a = Uint8ClampedArray.from([128]);
    const plain = edge();
    compositeFrame(plain, a, a, { bg: dark, bgEstimate: null, strength: 0, enhance: NO_ENHANCE });
    const fixed = edge();
    compositeFrame(fixed, a, a, { bg: dark, bgEstimate: white, strength: 1, enhance: NO_ENHANCE });
    // Without the fix the pixel stays light grey; with it, it is close to the dark colour mixed with black hair
    expect(plain[0]).toBeGreaterThan(70);
    expect(fixed[0]).toBeLessThan(20);
    expect(fixed[2]).toBeLessThan(plain[2]);
  });
  it('takes the wall tint out of edge pixels using the person\'s own colour, so a dark background shows no light fringe', () => {
    // 12x1 strip: black hair (0..5), a half-covered edge pixel photographed as grey over a white wall (6), white wall (7..11)
    const w = 12, h = 1;
    const rgba = new Uint8ClampedArray(w * 4);
    const raw = new Uint8ClampedArray(w);
    for (let x = 0; x < w; x++) {
      const v = x < 6 ? 0 : x === 6 ? 128 : 255;
      rgba.set([v, v, v, 255], x * 4);
      raw[x] = x < 6 ? 255 : x === 6 ? 128 : 0;
    }
    const fg = foregroundColours(rgba, raw, w, h, 3);
    expect(fg[6 * 4]).toBeLessThan(10); // the grey edge pixel now carries hair colour
    const out = rgba.slice();
    compositeFrame(out, raw, raw, { bg: dark, bgEstimate: white, strength: 0, enhance: NO_ENHANCE, fg });
    expect(out[6 * 4]).toBeLessThan(dark.r + 10); // a mix of black hair and the dark colour, nowhere near light grey
    const naive = rgba.slice();
    compositeFrame(naive, raw, raw, { bg: dark, bgEstimate: null, strength: 0, enhance: NO_ENHANCE });
    expect(naive[6 * 4]).toBeGreaterThan(out[6 * 4] + 40);
  });
  it('also works on a white background (same pixel stays a smooth grey blend)', () => {
    const px = Uint8ClampedArray.from([128, 128, 128, 255]);
    const a = Uint8ClampedArray.from([128]);
    compositeFrame(px, a, a, { bg: white, bgEstimate: white, strength: 1, enhance: NO_ENHANCE });
    expect(px[0]).toBeGreaterThan(120);
    expect(px[0]).toBeLessThan(140);
  });
  it('keeps the matte as alpha when there is no background colour (transparent PNG)', () => {
    const rgba = solid(1, 1, [100, 100, 100]);
    compositeFrame(rgba, Uint8ClampedArray.from([200]), Uint8ClampedArray.from([200]), { bg: null, bgEstimate: null, strength: 0, enhance: NO_ENHANCE });
    expect(rgba[3]).toBe(200);
  });
});

describe('light enhancement', () => {
  it('is the identity with no changes', () => {
    const lut = enhanceLut(NO_ENHANCE);
    for (const v of [0, 17, 128, 200, 255]) expect(lut[v]).toBe(v);
  });
  it('brightness lifts and darkens, contrast spreads around the middle', () => {
    expect(enhanceLut({ brightness: 20, contrast: 0 })[100]).toBeGreaterThan(100);
    expect(enhanceLut({ brightness: -20, contrast: 0 })[100]).toBeLessThan(100);
    const hi = enhanceLut({ brightness: 0, contrast: 40 });
    expect(hi[200]).toBeGreaterThan(200);
    expect(hi[60]).toBeLessThan(60);
    expect(hi[128]).toBe(128);
  });
  it('levels stretch a dull range to the full range', () => {
    const lut = enhanceLut({ brightness: 0, contrast: 0, levels: { lo: 30, hi: 220 } });
    expect(lut[30]).toBe(0);
    expect(lut[220]).toBe(255);
    expect(lut[125]).toBeGreaterThan(120);
  });
  it('auto-levels finds a limited stretch from the person only, and leaves a full-range photo alone', () => {
    const n = 2000;
    const rgba = new Uint8ClampedArray(n * 4);
    const alpha = new Uint8ClampedArray(n).fill(255);
    for (let i = 0; i < n; i++) {
      const v = 60 + Math.round((i / n) * 130); // dull: 60..190
      rgba.set([v, v, v, 255], i * 4);
    }
    const lv = autoLevels(rgba, alpha)!;
    expect(lv.lo).toBeLessThanOrEqual(40);
    expect(lv.hi).toBeGreaterThanOrEqual(200);
    expect(lv.hi - lv.lo).toBeGreaterThanOrEqual(210);
    expect(255 / (lv.hi - lv.lo)).toBeLessThan(1.22);
    const full = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) { const v = Math.round((i / (n - 1)) * 255); full.set([v, v, v, 255], i * 4); }
    expect(autoLevels(full, alpha)).toBeNull();
    expect(autoLevels(rgba, new Uint8ClampedArray(n))).toBeNull();
  });
});

describe('helpers', () => {
  it('names files sensibly and formats sizes', () => {
    expect(cvPhotoFileName('jpg', false)).toBe('cv-photo.jpg');
    expect(cvPhotoFileName('png', true)).toBe('cv-photo-transparent.png');
    expect(cvPhotoFileName('png', false)).toBe('cv-photo.png');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
  it('sorts errors into helpful messages', () => {
    expect(classifyMatteError(new Error('Failed to fetch'))).toBe('download');
    expect(classifyMatteError(new Error('Out of memory'))).toBe('memory');
    expect(classifyMatteError(new Error('WebAssembly is not supported'))).toBe('unsupported');
    expect(classifyMatteError(new Error('boom'))).toBe('other');
  });
});
