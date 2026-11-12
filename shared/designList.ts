// CV builder designs: ids, names and which need Pro. No layout code here, so the
// build-time SEO pages can use it too. The layouts live in src/builder/designs.tsx.

export type DesignId = 'classic' | 'modern' | 'executive' | 'elegant' | 'minimal' | 'timeline' | 'corporate' | 'pulse' | 'bold' | 'fresher' | 'graphite' | 'banner' | 'bars' | 'ascent' | 'care' | 'journey' | 'terminal';

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
  { id: 'pulse', name: { en: 'Pulse', bn: 'পালস' }, note: { en: 'Two columns, skill tags on a tinted panel', bn: 'দুই কলাম, রঙিন প্যানেলে স্কিল ট্যাগ' }, pro: true, photo: true },
  { id: 'bold', name: { en: 'Bold', bn: 'বোল্ড' }, note: { en: 'Strong name, colour edge and section labels', bn: 'বড় নাম, রঙিন কিনারা ও সেকশন লেবেল' }, pro: true, photo: true },
  { id: 'fresher', name: { en: 'Fresher', bn: 'ফ্রেশার' }, note: { en: 'Skills up top, compact, for first jobs', bn: 'স্কিল উপরে, কম্প্যাক্ট, প্রথম চাকরির জন্য' }, pro: true, photo: true },
  { id: 'graphite', name: { en: 'Graphite', bn: 'গ্রাফাইট' }, note: { en: 'Dark charcoal sidebar, serious and sharp', bn: 'গাঢ় চারকোল সাইডবার, গম্ভীর ও ধারালো' }, pro: true, photo: true },
  { id: 'banner', name: { en: 'Banner', bn: 'ব্যানার' }, note: { en: 'Colour band with your name, photo and clean side column', bn: 'রঙিন ব্যানারে নাম, ছবি ও পরিষ্কার সাইড কলাম' }, pro: true, photo: true },
  { id: 'bars', name: { en: 'Bars (ATS)', bn: 'বার্স (ATS)' }, note: { en: 'Full-width section bars, one column, for banks and corporates', bn: 'পুরো প্রস্থের সেকশন বার, এক কলাম, ব্যাংক ও কর্পোরেটের জন্য' }, pro: true, photo: true },
  { id: 'ascent', name: { en: 'Ascent', bn: 'অ্যাসেন্ট' }, note: { en: 'Navy header with a rising line and cream label column, for bankers', bn: 'নেভি হেডার, ওঠা লাইন ও ক্রিম লেবেল কলাম, ব্যাংকারদের জন্য' }, pro: true, photo: true },
  { id: 'care', name: { en: 'Care', bn: 'কেয়ার' }, note: { en: 'Teal header with a heartbeat line, for nurses and doctors', bn: 'হার্টবিট লাইনসহ টিল হেডার, নার্স ও ডাক্তারদের জন্য' }, pro: true, photo: true },
  { id: 'journey', name: { en: 'Journey', bn: 'জার্নি' }, note: { en: 'Wave header and a study timeline, for freshers and students', bn: 'ওয়েভ হেডার ও পড়াশোনার টাইমলাইন, ফ্রেশার ও স্টুডেন্টদের জন্য' }, pro: true, photo: true },
  { id: 'terminal', name: { en: 'Terminal', bn: 'টার্মিনাল' }, note: { en: 'Dark terminal-style header and skills panel, for IT and software', bn: 'ডার্ক টার্মিনাল স্টাইল হেডার, আইটি ও সফটওয়্যারের জন্য' }, pro: true, photo: true },
];

export const DESIGN_IDS = DESIGN_LIST.map((d) => d.id);
export const FREE_DESIGN_COUNT = DESIGN_LIST.filter((d) => !d.pro).length;
export const PRO_DESIGN_COUNT = DESIGN_LIST.length - FREE_DESIGN_COUNT;
