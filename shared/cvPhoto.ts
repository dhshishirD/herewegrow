// Pure helpers for the professional CV photo maker (src/components/CvPhotoTool.tsx): framing maths, edge clean-up,
// background compositing and light enhancement. No DOM here, so every function can be unit tested (shared/cvPhoto.test.ts).
// Pixel buffers are plain Uint8ClampedArray: RGBA for pictures, one byte per pixel for the cut-out matte ("alpha").

import { findPreset } from './photoPresets';

export interface Bilingual { en: string; bn: string }
export interface Rgb { r: number; g: number; b: number }
export interface Rect { x: number; y: number; w: number; h: number }
/** Where the frame sits: zoom 1 shows the largest window of the chosen shape, (cx, cy) is its centre as a fraction of the picture. */
export interface View { zoom: number; cx: number; cy: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ---------- Model and size constants ----------

/** Longest side of the copy sent to the cut-out model. The matte is later stretched over the full-size picture. */
export const MODEL_MAX_SIDE = 1024;
/** Longest side of the working copy kept in memory, so a 12+ megapixel camera photo cannot exhaust a phone. */
export const WORK_MAX_SIDE = 2400;
/** Longest side of a downloaded file for the 4:5 and 1:1 shapes (never more than the photo itself has). */
export const EXPORT_MAX_SIDE = 1200;
export const MAX_ZOOM = 4;

// ---------- Frames (shapes) ----------

export type FrameId = '4x5' | '1x1' | '35x45';

export interface FrameDef {
  id: FrameId;
  ratio: number;
  label: Bilingual;
  sub: Bilingual;
  /** Fixed pixel size (print size at 300 DPI). Other frames follow the photo, up to EXPORT_MAX_SIDE. */
  fixed?: { w: number; h: number };
}

const passport = findPreset('passport');

export const FRAMES: FrameDef[] = [
  { id: '4x5', ratio: 4 / 5, label: { en: '4:5 portrait', bn: '৪:৫ পোর্ট্রেট' }, sub: { en: 'CV and application photo', bn: 'সিভি ও আবেদনের ছবি' } },
  { id: '1x1', ratio: 1, label: { en: '1:1 square', bn: '১:১ বর্গ' }, sub: { en: 'Profile photo', bn: 'প্রোফাইল ছবি' } },
  {
    id: '35x45',
    ratio: 35 / 45,
    label: { en: '35×45 mm', bn: '৩৫×৪৫ মিমি' },
    sub: { en: 'Passport-style shape', bn: 'পাসপোর্ট-ধাঁচের আকার' },
    fixed: passport ? { w: passport.w, h: passport.h } : { w: 413, h: 531 },
  },
];

export const findFrame = (id: FrameId): FrameDef => FRAMES.find((f) => f.id === id) ?? FRAMES[0];

/** Pixel size of the file: the print size for fixed frames, otherwise the crop's own size capped at EXPORT_MAX_SIDE. */
export function outputSize(frame: FrameDef, cropW: number, cropH: number): { w: number; h: number } {
  if (frame.fixed) return { ...frame.fixed };
  const longSide = clamp(Math.round(Math.max(cropW, cropH)), 200, EXPORT_MAX_SIDE);
  return frame.ratio >= 1
    ? { w: longSide, h: Math.max(1, Math.round(longSide / frame.ratio)) }
    : { w: Math.max(1, Math.round(longSide * frame.ratio)), h: longSide };
}

// ---------- Crop maths ----------

/** The part of the picture inside the frame, in picture pixels. Always stays inside the picture. */
export function cropRect(imgW: number, imgH: number, ratio: number, view: View): Rect {
  let bw = imgW;
  let bh = imgW / ratio;
  if (bh > imgH) {
    bh = imgH;
    bw = imgH * ratio;
  }
  const z = clamp(view.zoom, 1, MAX_ZOOM);
  const w = bw / z;
  const h = bh / z;
  return {
    x: clamp(view.cx * imgW - w / 2, 0, imgW - w),
    y: clamp(view.cy * imgH - h / 2, 0, imgH - h),
    w,
    h,
  };
}

/** Moves the view by a drag of (dxFrac, dyFrac), given as fractions of the frame's width and height. Dragging right moves the picture right. */
export function panView(imgW: number, imgH: number, ratio: number, view: View, dxFrac: number, dyFrac: number): View {
  const r = cropRect(imgW, imgH, ratio, view);
  const next = { ...view, cx: (r.x + r.w / 2 - dxFrac * r.w) / imgW, cy: (r.y + r.h / 2 - dyFrac * r.h) / imgH };
  const r2 = cropRect(imgW, imgH, ratio, next);
  return { zoom: next.zoom, cx: (r2.x + r2.w / 2) / imgW, cy: (r2.y + r2.h / 2) / imgH };
}

/** Same view with a new zoom, kept centred on the same point and inside the picture. */
export function zoomView(imgW: number, imgH: number, ratio: number, view: View, zoom: number): View {
  const r = cropRect(imgW, imgH, ratio, { ...view, zoom });
  return { zoom: clamp(zoom, 1, MAX_ZOOM), cx: (r.x + r.w / 2) / imgW, cy: (r.y + r.h / 2) / imgH };
}

export const CENTERED: View = { zoom: 1, cx: 0.5, cy: 0.5 };

// ---------- Subject bounds and automatic framing ----------

export interface Bounds { x0: number; y0: number; x1: number; y1: number }

/** Bounding box of the person in the matte (pixels above `threshold`), ignoring a few stray specks. Null if nobody was found. */
export function alphaBounds(alpha: ArrayLike<number>, w: number, h: number, threshold = 128): Bounds | null {
  const cols = new Uint32Array(w);
  const rows = new Uint32Array(h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] >= threshold) {
        cols[x]++;
        rows[y]++;
      }
    }
  }
  const minCol = Math.max(2, Math.round(h * 0.01));
  const minRow = Math.max(2, Math.round(w * 0.01));
  const first = (a: Uint32Array, min: number) => a.findIndex((v) => v >= min);
  const last = (a: Uint32Array, min: number) => {
    for (let i = a.length - 1; i >= 0; i--) if (a[i] >= min) return i;
    return -1;
  };
  const x0 = first(cols, minCol);
  const x1 = last(cols, minCol);
  const y0 = first(rows, minRow);
  const y1 = last(rows, minRow);
  if (x0 < 0 || y0 < 0 || x1 < x0 || y1 < y0) return null;
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

/**
 * A head-and-shoulders view from the person's bounding box (picture pixels): the frame is a little wider than the
 * person, centred on them, with a small gap above the head. A full-length photo ends up cropped to the upper body.
 */
export function autoFrame(b: Bounds, imgW: number, imgH: number, ratio: number): View {
  let bw = imgW;
  if (imgW / ratio > imgH) bw = imgH * ratio;
  const subjectW = Math.max(1, b.x1 - b.x0);
  const winW = subjectW * 1.35;
  const zoom = clamp(bw / winW, 1, MAX_ZOOM);
  const winH = winW / ratio;
  const top = b.y0 - winH * 0.1;
  const view: View = { zoom, cx: (b.x0 + b.x1) / 2 / imgW, cy: (top + winH / 2) / imgH };
  const r = cropRect(imgW, imgH, ratio, view);
  return { zoom, cx: (r.x + r.w / 2) / imgW, cy: (r.y + r.h / 2) / imgH };
}

// ---------- Colours ----------

export function parseHex(s: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export const toHex = (c: Rgb): string => '#' + [c.r, c.g, c.b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

export type BgId = 'white' | 'blue' | 'grey' | 'custom';

export const BACKGROUNDS: { id: BgId; hex: string; label: Bilingual }[] = [
  { id: 'white', hex: '#ffffff', label: { en: 'White', bn: 'সাদা' } },
  { id: 'blue', hex: '#d3e5f6', label: { en: 'Light blue', bn: 'হালকা নীল' } },
  { id: 'grey', hex: '#e7e9ec', label: { en: 'Light grey', bn: 'হালকা ধূসর' } },
  { id: 'custom', hex: '#ffffff', label: { en: 'Your colour', bn: 'নিজের রং' } },
];

// ---------- Matte clean-up ----------

/** Smooth S-curve: values below `lo` become 0, above `hi` become 1. Removes faint grey haze and fills near-solid areas. */
export function smoothstep(lo: number, hi: number, v: number): number {
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Tightens the matte a little (pulls the edge in by a hair so the old background does not show) and keeps it soft. */
export function refineAlpha(alpha: Uint8ClampedArray, lo = 0.15, hi = 0.95): Uint8ClampedArray {
  const out = new Uint8ClampedArray(alpha.length);
  for (let i = 0; i < alpha.length; i++) out[i] = Math.round(smoothstep(lo, hi, alpha[i] / 255) * 255);
  return out;
}

/** Separable box blur (edges repeat). Radius 0 returns a copy. */
export function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const r = Math.max(0, Math.floor(radius));
  if (r === 0) return src.slice();
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const win = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + clamp(k, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / win;
      sum += src[row + clamp(x + r + 1, 0, w - 1)] - src[row + clamp(x - r, 0, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += tmp[clamp(k, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / win;
      sum += tmp[clamp(y + r + 1, 0, h - 1) * w + x] - tmp[clamp(y - r, 0, h - 1) * w + x];
    }
  }
  return out;
}

/** Box blur of a one-byte-per-pixel matte, used to feather the edge slightly. Radius 0 returns a copy. */
export function featherAlpha(alpha: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
  if (Math.floor(radius) <= 0) return alpha.slice();
  const f = boxBlur(Float32Array.from(alpha), w, h, radius);
  const out = new Uint8ClampedArray(w * h);
  for (let i = 0; i < out.length; i++) out[i] = Math.round(f[i]);
  return out;
}

/**
 * Colours of the person with the old wall taken out of the edge. Edge pixels are a mix of person and wall, and that
 * mix is what shows as a light fringe on a dark background. Here every pixel the matte is sure about (alpha >= 95%,
 * and not within a pixel or two of an unsure one) is spread outwards by a blur, and the edge band gets the person's own
 * colour from just inside it.
 * Returns RGBA: the colour, and in the alpha byte how much sure-person colour was found nearby. A zero alpha byte means
 * "leave this pixel as photographed" (it is well inside the person, or there is no person colour nearby).
 */
export function foregroundColours(rgba: Uint8ClampedArray, rawAlpha: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
  const n = w * h;
  const sure = new Float32Array(n);
  for (let i = 0; i < n; i++) if (rawAlpha[i] >= 242) sure[i] = 1;
  // Core = sure pixels whose whole neighbourhood is sure
  const near = boxBlur(sure, w, h, Math.max(1, Math.round(radius / 3)));
  const pr = new Float32Array(n), pg = new Float32Array(n), pb = new Float32Array(n), pw = new Float32Array(n);
  const core = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (sure[i] === 1 && near[i] > 0.999) {
      core[i] = 1;
      pr[i] = rgba[i * 4];
      pg[i] = rgba[i * 4 + 1];
      pb[i] = rgba[i * 4 + 2];
      pw[i] = 1;
    }
  }
  const br = boxBlur(pr, w, h, radius), bg = boxBlur(pg, w, h, radius), bb = boxBlur(pb, w, h, radius), bw = boxBlur(pw, w, h, radius);
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const wt = bw[i];
    if (!core[i] && wt > 0.02) {
      out[i * 4] = Math.round(br[i] / wt);
      out[i * 4 + 1] = Math.round(bg[i] / wt);
      out[i * 4 + 2] = Math.round(bb[i] / wt);
      out[i * 4 + 3] = Math.round(Math.min(1, wt * 4) * 255);
    } else {
      out[i * 4] = rgba[i * 4];
      out[i * 4 + 1] = rgba[i * 4 + 1];
      out[i * 4 + 2] = rgba[i * 4 + 2];
    }
  }
  return out;
}

/** Radius for foregroundColours: about 1/150 of the long side, between 3 and 8 px. */
export const foregroundRadiusFor = (w: number, h: number): number => clamp(Math.round(Math.max(w, h) / 150), 3, 8);

/** Feather radius in pixels for a picture of this size: about 1 px on a phone-sized preview, a little more on big files. */
export const featherRadiusFor = (w: number, h: number): number => clamp(Math.round(Math.max(w, h) / 700), 1, 3);

/** Average colour of the pixels the matte says are background (alpha <= 8). Null if there are too few to trust. */
export function estimateBackground(rgba: Uint8ClampedArray, alpha: Uint8ClampedArray, minPixels = 50): Rgb | null {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] <= 8) {
      r += rgba[i * 4];
      g += rgba[i * 4 + 1];
      b += rgba[i * 4 + 2];
      n++;
    }
  }
  return n < minPixels ? null : { r: r / n, g: g / n, b: b / n };
}

// ---------- Light enhancement ----------

export interface Levels { lo: number; hi: number }
export interface Enhance {
  /** -100..100 (percent of full range, 0 = unchanged) */
  brightness: number;
  /** -100..100 (0 = unchanged) */
  contrast: number;
  levels?: Levels | null;
}

export const NO_ENHANCE: Enhance = { brightness: 0, contrast: 0, levels: null };

/** A 256-entry table that applies levels, then contrast, then brightness to one channel value. */
export function enhanceLut(e: Enhance): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256);
  const lo = e.levels ? e.levels.lo : 0;
  const hi = e.levels ? Math.max(lo + 1, e.levels.hi) : 255;
  const c = 1 + clamp(e.contrast, -100, 100) / 100;
  const bOff = (clamp(e.brightness, -100, 100) / 100) * 255 * 0.5;
  for (let v = 0; v < 256; v++) {
    let x = ((v - lo) / (hi - lo)) * 255;
    x = (x - 128) * c + 128 + bOff;
    lut[v] = Math.round(clamp(x, 0, 255));
  }
  return lut;
}

/**
 * Simple auto-levels from the person's pixels only (alpha >= 200): stretch the 0.5th..99.5th brightness percentiles.
 * The stretch is limited to about 1.2x, so it only lifts a dull photo and never changes a good one much. Null means leave as is.
 */
export function autoLevels(rgba: Uint8ClampedArray, alpha: Uint8ClampedArray, minPixels = 500): Levels | null {
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] >= 200) {
      const p = i * 4;
      hist[Math.round(0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2])]++;
      n++;
    }
  }
  if (n < minPixels) return null;
  const pct = (q: number) => {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= n * q) return v;
    }
    return 255;
  };
  let lo = pct(0.005);
  let hi = pct(0.995);
  if (hi - lo >= 250) return null;
  // Never stretch by more than about 1.2x: keep the range at least MIN_SPAN wide, centred on the same middle
  const MIN_SPAN = 212;
  if (hi - lo < MIN_SPAN) {
    const mid = (lo + hi) / 2;
    lo = mid - MIN_SPAN / 2;
    hi = mid + MIN_SPAN / 2;
    if (lo < 0) { hi -= lo; lo = 0; }
    if (hi > 255) { lo -= hi - 255; hi = 255; }
  }
  return { lo: Math.round(Math.max(0, lo)), hi: Math.round(Math.min(255, hi)) };
}

// ---------- Compositing ----------

export interface CompositeOptions {
  /** Colour to put behind the person. Null keeps the picture transparent (PNG). */
  bg: Rgb | null;
  /** Colour of the old background, to take its tint out of hair and edge pixels. Null skips that step. */
  bgEstimate: Rgb | null;
  /** 0..1, how much of the edge colour correction to apply. */
  strength: number;
  enhance: Enhance;
  /** Output of foregroundColours: person colours for edge pixels. Preferred over the photo's own edge colours when present. */
  fg?: Uint8ClampedArray | null;
}

/**
 * Writes the finished picture into `rgba` in place. `rawAlpha` is the model's matte (used to work out how much old
 * background is mixed into an edge pixel), `alpha` is the cleaned-up matte used to place the person on the new colour.
 * Without bg the alpha channel carries the matte (transparent PNG). With bg the result is fully opaque.
 */
export function compositeFrame(rgba: Uint8ClampedArray, rawAlpha: Uint8ClampedArray, alpha: Uint8ClampedArray, o: CompositeOptions): void {
  const lut = enhanceLut(o.enhance);
  const s = clamp(o.strength, 0, 1);
  const B = o.bgEstimate;
  for (let i = 0; i < alpha.length; i++) {
    const p = i * 4;
    let r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
    const a = alpha[i] / 255;
    const ra = rawAlpha[i] / 255;
    if (o.fg && o.fg[p + 3] > 40) {
      // Edge pixel: use the person's own colour from just inside the edge, not the wall-tinted mix
      const k = o.fg[p + 3] / 255;
      r = r + k * (o.fg[p] - r);
      g = g + k * (o.fg[p + 1] - g);
      b = b + k * (o.fg[p + 2] - b);
    } else if (B && s > 0 && ra > 0.02 && ra < 0.98) {
      // No person colour nearby: take the old wall's share out of the pixel (F = (C - (1-a) B) / a)
      r = r + s * (clamp((r - (1 - ra) * B.r) / ra, 0, 255) - r);
      g = g + s * (clamp((g - (1 - ra) * B.g) / ra, 0, 255) - g);
      b = b + s * (clamp((b - (1 - ra) * B.b) / ra, 0, 255) - b);
    }
    r = lut[Math.round(r)];
    g = lut[Math.round(g)];
    b = lut[Math.round(b)];
    if (o.bg) {
      rgba[p] = Math.round(r * a + o.bg.r * (1 - a));
      rgba[p + 1] = Math.round(g * a + o.bg.g * (1 - a));
      rgba[p + 2] = Math.round(b * a + o.bg.b * (1 - a));
      rgba[p + 3] = 255;
    } else {
      rgba[p] = r;
      rgba[p + 1] = g;
      rgba[p + 2] = b;
      rgba[p + 3] = alpha[i];
    }
  }
}

// ---------- Small helpers ----------

/** Names of the downloaded files. */
export function cvPhotoFileName(format: 'jpg' | 'png', transparent: boolean): string {
  if (format === 'jpg') return 'cv-photo.jpg';
  return transparent ? 'cv-photo-transparent.png' : 'cv-photo.png';
}

/** "182.4 KB" or "1.3 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The matte as one byte per pixel from the red channel of an RGBA buffer (the matte is drawn as grey). */
export function alphaFromRgba(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(rgba.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4];
  return out;
}

export type MatteErrorCode = 'unsupported' | 'download' | 'memory' | 'other';

export const MATTE_ERRORS: Record<MatteErrorCode, Bilingual> = {
  unsupported: {
    en: 'This browser cannot run the background remover (it needs WebAssembly). Try the latest Chrome, Edge, Firefox or Safari. Your photo was not uploaded.',
    bn: 'এই ব্রাউজারে ব্যাকগ্রাউন্ড রিমুভার চলছে না (WebAssembly লাগে)। Chrome, Edge, Firefox বা Safari-র নতুন সংস্করণ চেষ্টা করুন। আপনার ছবি আপলোড হয়নি।',
  },
  download: {
    en: 'The model file could not be downloaded. Check your internet connection (an ad blocker or data saver can also block it) and press the button again. Your photo was not uploaded.',
    bn: 'মডেল ফাইল নামানো যায়নি। ইন্টারনেট সংযোগ দেখুন (অ্যাড ব্লকার বা ডেটা সেভারও আটকাতে পারে), তারপর আবার বাটন চাপুন। আপনার ছবি আপলোড হয়নি।',
  },
  memory: {
    en: 'The phone or computer ran out of memory for this photo. Close other tabs and apps, or choose a smaller photo, and try again.',
    bn: 'এই ছবির জন্য ফোন বা কম্পিউটারের মেমোরি কুলায়নি। অন্য ট্যাব ও অ্যাপ বন্ধ করুন, অথবা ছোট ছবি নিয়ে আবার চেষ্টা করুন।',
  },
  other: {
    en: 'The background could not be removed this time. Try again, or try a different photo or browser. Your photo was not uploaded.',
    bn: 'এবার ব্যাকগ্রাউন্ড সরানো যায়নি। আবার চেষ্টা করুন, অথবা অন্য ছবি বা অন্য ব্রাউজার নিন। আপনার ছবি আপলোড হয়নি।',
  },
};

/** Sorts a thrown error into one of the messages above. */
export function classifyMatteError(err: unknown): MatteErrorCode {
  const msg = String((err as { message?: unknown })?.message ?? err ?? '').toLowerCase();
  if (/out of memory|\boom\b|alloc|memory access|rangeerror|array buffer/.test(msg)) return 'memory';
  if (/failed to fetch|networkerror|load failed|network|could not locate file|unable to get model file|fetch|404|403|cors/.test(msg)) return 'download';
  if (/webassembly|wasm is not|not supported/.test(msg)) return 'unsupported';
  return 'other';
}
