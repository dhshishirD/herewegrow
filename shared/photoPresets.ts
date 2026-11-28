// Size presets and small pure helpers for the photo and signature resizer (src/pages/PhotoResizer.tsx).
// Print sizes are written in millimetres or inches and turned into pixels here at 300 DPI, so no pixel figure is typed by hand.
// The presets are tool options only. They do not say any portal or form requires that size.

export interface Bilingual { en: string; bn: string }

export const PRINT_DPI = 300;
export const MM_PER_INCH = 25.4;

/** Millimetres to pixels at the given DPI, rounded to a whole pixel. */
export const mmToPx = (mm: number, dpi = PRINT_DPI): number => Math.round((mm / MM_PER_INCH) * dpi);
export const inchToMm = (inch: number): number => inch * MM_PER_INCH;

export type PresetGroup = 'job' | 'print' | 'kb';

export interface PresetDef {
  id: string;
  group: PresetGroup;
  label: Bilingual;
  /** Pixel size. For 'kb' presets this is the longest side: the picture keeps its own shape and is not cropped. */
  w: number;
  h: number;
  /** Size in millimetres, for print sizes. */
  mm?: { w: number; h: number };
  /** Largest file size in KB, or null when the preset sets no file limit. */
  kb: number | null;
  /** Keep the picture's own shape (no crop) and only scale it down. */
  keepRatio?: boolean;
}

const print = (id: string, label: Bilingual, wMm: number, hMm: number): PresetDef => ({
  id,
  group: 'print',
  label,
  w: mmToPx(wMm),
  h: mmToPx(hMm),
  mm: { w: wMm, h: hMm },
  kb: null,
});

const kbTarget = (kb: number): PresetDef => ({
  id: `kb-${kb}`,
  group: 'kb',
  label: { en: `About ${kb} KB`, bn: `প্রায় ${kb} KB` },
  w: KB_MAX_SIDE,
  h: KB_MAX_SIDE,
  kb,
  keepRatio: true,
});

/** Longest side (px) a KB-target picture starts at; the tool shrinks it further only when the KB target needs it. */
export const KB_MAX_SIDE = 1200;

export const PRESETS: PresetDef[] = [
  { id: 'photo', group: 'job', label: { en: 'Photo', bn: 'ছবি' }, w: 300, h: 300, kb: 100 },
  { id: 'signature', group: 'job', label: { en: 'Signature', bn: 'স্বাক্ষর' }, w: 300, h: 80, kb: 60 },
  print('passport', { en: 'Passport size', bn: 'পাসপোর্ট সাইজ' }, 35, 45),
  print('stamp', { en: 'Stamp size', bn: 'স্ট্যাম্প সাইজ' }, 20, 25),
  print('inch2', { en: '2×2 inch', bn: '২×২ ইঞ্চি' }, inchToMm(2), inchToMm(2)),
  print('inch1', { en: '1×1 inch', bn: '১×১ ইঞ্চি' }, inchToMm(1), inchToMm(1)),
  ...[20, 50, 100, 200].map(kbTarget),
];

export const findPreset = (id: string): PresetDef | undefined => PRESETS.find((p) => p.id === id);

/** Millimetre label such as "35×45 mm" or "50.8×50.8 mm". */
export const mmLabel = (mm: { w: number; h: number }): string => {
  const f = (n: number) => String(Math.round(n * 10) / 10);
  return `${f(mm.w)}×${f(mm.h)} mm`;
};

/** Pixel size for a keep-shape preset: scale the picture down so its longest side is at most `maxSide`. Never scales up. */
export function fitWithin(natW: number, natH: number, maxSide: number): { w: number; h: number } {
  const s = Math.min(1, maxSide / Math.max(natW, natH));
  return { w: Math.max(1, Math.round(natW * s)), h: Math.max(1, Math.round(natH * s)) };
}

/** What kind of file the visitor picked. HEIC/HEIF (iPhone) cannot be opened by most browsers other than Safari. */
export function classifyFile(f: { name: string; type: string }): 'ok' | 'heic' | 'notImage' {
  const name = f.name.toLowerCase();
  if (/image\/hei[cf]/.test(f.type) || /\.(heic|heif)$/.test(name)) return 'heic';
  if (f.type.startsWith('image/')) return 'ok';
  // Some browsers give no type for a file; trust a picture extension then.
  if (!f.type && /\.(jpe?g|png|webp|gif|bmp)$/.test(name)) return 'ok';
  return 'notImage';
}

export const HEIC_MESSAGE: Bilingual = {
  en: 'This HEIC photo cannot be opened in this browser. Open the site in Safari, or on an iPhone set Settings > Camera > Formats > Most Compatible, or save the photo as JPG first, then choose it again.',
  bn: 'এই ব্রাউজারে HEIC ছবি খোলে না। সাইটটি Safari-তে খুলুন, অথবা আইফোনে Settings > Camera > Formats > Most Compatible দিন, অথবা ছবিটি আগে JPG হিসেবে সেভ করে আবার বেছে নিন।',
};

const bnDigits = (s: string) => s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/** Message for when even the smallest JPG at the smallest tried size is over the KB target. */
export function unreachableMessage(smallestBytes: number, limitKb: number, w: number, h: number): Bilingual {
  const kb = (smallestBytes / 1024).toFixed(1);
  return {
    en: `The smallest file we could make is ${kb} KB at ${w}×${h} px, still over your ${limitKb} KB limit. Raise the KB limit, or use a simpler picture (zoom in on the face or signature).`,
    bn: `সবচেয়ে ছোট যে ফাইল বানানো গেছে তা ${bnDigits(w + '×' + h)} px-এ ${bnDigits(kb)} KB, যা আপনার ${bnDigits(String(limitKb))} KB সীমার চেয়ে বেশি। KB সীমা বাড়ান, অথবা সহজ ছবি নিন (মুখ বা স্বাক্ষরে জুম করুন)।`,
  };
}
