// CV builder designs: ids, names and which need Pro. No layout code here, so the
// build-time SEO pages can use it too. The layouts live in src/builder/designs.tsx.

export type DesignId = 'classic' | 'modern' | 'executive' | 'elegant' | 'minimal' | 'timeline' | 'corporate';

export interface DesignInfo {
  id: DesignId;
  name: { en: string; bn: string };
  note: { en: string; bn: string };
  /** Anyone can try it; downloading needs Pro. */
  pro?: boolean;
  /** Shows the photo when one is added. */
  photo?: boolean;
}

export const DESIGN_LIST: DesignInfo[] = [
  { id: 'classic', name: { en: 'Classic (ATS)', bn: 'ক্লাসিক (ATS)' }, note: { en: 'Best for online job portals', bn: 'অনলাইন জব পোর্টালের জন্য সেরা' } },
  { id: 'modern', name: { en: 'Modern', bn: 'মডার্ন' }, note: { en: 'Colour sidebar and photo', bn: 'রঙিন সাইডবার ও ছবি' }, photo: true },
  { id: 'executive', name: { en: 'Executive', bn: 'এক্সিকিউটিভ' }, note: { en: 'For senior roles', bn: 'সিনিয়র পদের জন্য' }, photo: true },
  { id: 'elegant', name: { en: 'Elegant', bn: 'এলিগ্যান্ট' }, note: { en: 'Colour header band, premium look', bn: 'রঙিন হেডার, প্রিমিয়াম লুক' }, pro: true, photo: true },
  { id: 'minimal', name: { en: 'Minimal', bn: 'মিনিমাল' }, note: { en: 'Clean labels column, lots of white space', bn: 'পরিষ্কার লেবেল কলাম, প্রচুর ফাঁকা জায়গা' }, pro: true },
  { id: 'timeline', name: { en: 'Timeline', bn: 'টাইমলাইন' }, note: { en: 'Your career as a clear timeline', bn: 'ক্যারিয়ার এক নজরে টাইমলাইনে' }, pro: true, photo: true },
  { id: 'corporate', name: { en: 'Corporate', bn: 'কর্পোরেট' }, note: { en: 'Soft sidebar for banks and corporates', bn: 'ব্যাংক ও কর্পোরেটের জন্য হালকা সাইডবার' }, pro: true, photo: true },
];

export const DESIGN_IDS = DESIGN_LIST.map((d) => d.id);
export const FREE_DESIGN_COUNT = DESIGN_LIST.filter((d) => !d.pro).length;
export const PRO_DESIGN_COUNT = DESIGN_LIST.length - FREE_DESIGN_COUNT;
