// Words for the passport size photo maker page (src/pages/PassportPhotoMaker.tsx). Shared with the build-time
// SEO page (scripts/seo.ts) so the static HTML carries the same text. Sizes come from shared/photoPresets.ts.

import { PRINT_DPI, findPreset, mmLabel } from './photoPresets';
import type { Bilingual } from './photoResizerContent';

const bnD = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const bnMm = (s: string) => bnD(s).replace('mm', 'মিমি');
const pxOf = (id: string) => { const p = findPreset(id)!; return `${p.w}×${p.h}`; };
const mmOf = (id: string) => mmLabel(findPreset(id)!.mm!);

export const PASSPORT_PATH = '/tools/passport-size-photo-maker';
export const PASSPORT_UPDATED_LABEL: Bilingual = { en: '28 November 2026', bn: '২৮ নভেম্বর ২০২৬' };
export const PASSPORT_AUTHOR = { name: 'Daloyar Hassan Shishir', url: '/about' } as const;

export const PASSPORT_INTRO: Bilingual = {
  en: `A passport size photo is a printed size, most often ${mmOf('passport')}. At ${PRINT_DPI} DPI that is ${pxOf('passport')} pixels, which is what this tool makes. Sizes differ by country and form, so use the size your form or embassy names.`,
  bn: `পাসপোর্ট সাইজ ছবি মানে ছাপা ছবির মাপ, সবচেয়ে প্রচলিত ${bnMm(mmOf('passport'))}। ${bnD(PRINT_DPI)} DPI-তে এটি ${bnD(pxOf('passport'))} পিক্সেল, এই টুল সেই মাপেই ফাইল বানায়। দেশ ও ফর্মভেদে মাপ আলাদা, তাই আপনার ফর্ম বা দূতাবাস যে মাপ বলে সেটাই নিন।`,
};

export const PASSPORT_SIZE_TABLE: { name: Bilingual; mm: string; px: string }[] = ['passport', 'stamp', 'inch2', 'inch1'].map((id) => {
  const p = findPreset(id)!;
  return { name: p.label, mm: mmLabel(p.mm!), px: pxOf(id) };
});

export const PASSPORT_SIZE_NOTE: Bilingual = {
  en: `Pixels are the size in millimetres divided by 25.4 and multiplied by ${PRINT_DPI}, rounded to a whole pixel. These are common sizes, not a rule of any form.`,
  bn: `পিক্সেল = মিলিমিটারে মাপ ÷ ২৫.৪ × ${bnD(PRINT_DPI)}, পূর্ণসংখ্যায় রাউন্ড করা। এগুলো প্রচলিত মাপ, কোনো ফর্মের নিয়ম নয়।`,
};

export const PASSPORT_STEPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: 'Take a good photo first', bn: 'আগে ভালো একটি ছবি তুলুন' },
    body: { en: 'Follow the tips below. A sharp, evenly lit photo gives the best result.', bn: 'নিচের পরামর্শ মেনে তুলুন। স্পষ্ট ও সমান আলোর ছবিতে ফল সবচেয়ে ভালো হয়।' },
  },
  {
    title: { en: 'Choose the size', bn: 'মাপ বেছে নিন' },
    body: { en: `“Passport size” is already selected (${mmOf('passport')}, ${pxOf('passport')} px). Pick another print size or “Other size” if your form says so.`, bn: `“পাসপোর্ট সাইজ” আগে থেকেই বাছা (${bnMm(mmOf('passport'))}, ${bnD(pxOf('passport'))} px)। ফর্মে অন্য মাপ থাকলে অন্য প্রিন্ট সাইজ বা “অন্য মাপ” বেছে নিন।` },
  },
  {
    title: { en: 'Frame your face', bn: 'মুখ ফ্রেমে সাজান' },
    body: { en: 'Choose your photo, then zoom and drag so your head and shoulders sit in the middle of the frame.', bn: 'ছবি বেছে নিয়ে জুম করুন ও টেনে মাথা-কাঁধ ফ্রেমের মাঝখানে আনুন।' },
  },
  {
    title: { en: 'Download and print or upload', bn: 'ডাউনলোড করে প্রিন্ট বা আপলোড করুন' },
    body: { en: `Press “Make my file” and download the JPG. To print, tell the print shop the size (${mmOf('passport')}) or set that print size in the print dialog, because the file stores pixels, not a print size.`, bn: `“ফাইল তৈরি করুন” চেপে JPG ডাউনলোড করুন। ছাপাতে হলে প্রিন্টের দোকানে মাপ (${bnMm(mmOf('passport'))}) বলুন বা প্রিন্ট ডায়ালগে সেই মাপ সেট করুন, কারণ ফাইলে পিক্সেল থাকে, প্রিন্টের মাপ নয়।` },
  },
];

export const PASSPORT_TAKE: Bilingual[] = [
  { en: 'Use a plain, light background. If your form names a background colour, use that colour.', bn: 'সাধারণ, হালকা ব্যাকগ্রাউন্ড নিন। ফর্মে নির্দিষ্ট রং বলা থাকলে সেই রং।' },
  { en: 'Face the camera straight on, with both eyes open and visible.', bn: 'সোজা ক্যামেরার দিকে তাকান, দুই চোখ খোলা ও স্পষ্ট।' },
  { en: 'Light your face evenly from the front, such as by a window in daylight. Avoid shadows on the face or the wall.', bn: 'সামনে থেকে সমান আলো রাখুন, যেমন দিনের আলোয় জানালার পাশে। মুখে বা দেয়ালে ছায়া এড়ান।' },
  { en: 'Keep the camera at eye level and your head and shoulders in the middle, not tilted.', bn: 'ক্যামেরা চোখের সমান উচ্চতায় রাখুন; মাথা-কাঁধ মাঝখানে, কাত নয়।' },
  { en: 'Use a recent photo without filters or beauty mode.', bn: 'সাম্প্রতিক ছবি নিন, ফিল্টার বা বিউটি মোড ছাড়া।' },
  { en: 'Rules for glasses, caps and clothing differ by form. Follow your form where it states them.', bn: 'চশমা, টুপি ও পোশাকের নিয়ম ফর্মভেদে আলাদা। ফর্মে যা লেখা আছে তা মানুন।' },
];

export const PASSPORT_MISTAKES: Bilingual[] = [
  { en: 'Stretching a wide or tall photo to fit. Zoom and drag instead, so the face keeps its shape.', bn: 'চওড়া বা লম্বা ছবি টেনে মাপে আনা। বরং জুম করে ও টেনে সাজান, যাতে মুখের আকৃতি ঠিক থাকে।' },
  { en: 'Cropping too tight, so the top of the head or the chin is cut off.', bn: 'বেশি কাছ থেকে কাটা, ফলে মাথার উপরের বা থুতনির অংশ কেটে যায়।' },
  { en: 'A shadow behind the head or a patterned wall.', bn: 'মাথার পেছনে ছায়া বা নকশা করা দেয়াল।' },
  { en: 'A blurry or dark phone photo. Wipe the lens and use daylight.', bn: 'ঝাপসা বা অন্ধকার ফোনের ছবি। লেন্স মুছে দিনের আলোয় তুলুন।' },
  { en: 'Using this pixel size for a form that asks for a different size or a file-size limit. Check the form, and use “Other size” or a KB target.', bn: 'ফর্মে অন্য মাপ বা ফাইল সাইজের সীমা থাকলেও এই পিক্সেল মাপ ব্যবহার করা। ফর্ম দেখুন, দরকারে “অন্য মাপ” বা KB লক্ষ্য নিন।' },
];

export const PASSPORT_FAQ: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { en: 'What is the passport size photo size in mm and pixels?', bn: 'পাসপোর্ট সাইজ ছবির মাপ মিমি ও পিক্সেলে কত?' },
    a: { en: `A common size is ${mmOf('passport')}, which is ${pxOf('passport')} px at ${PRINT_DPI} DPI. Other forms use other sizes, so check yours.`, bn: `প্রচলিত একটি মাপ ${bnMm(mmOf('passport'))}, যা ${bnD(PRINT_DPI)} DPI-তে ${bnD(pxOf('passport'))} পিক্সেল। অন্য ফর্মে অন্য মাপ থাকে, তাই নিজেরটি দেখুন।` },
  },
  {
    q: { en: 'Which size does a Bangladesh passport need?', bn: 'বাংলাদেশের পাসপোর্টের জন্য কোন মাপ লাগে?' },
    a: {
      en: '35×45 mm is a common passport-photo size and is the size listed by the Bangladesh Embassy in The Hague for e-passport applications (see the sources, checked 29 November 2026). Other offices or forms may ask for a different size (for example 45×55 mm printed or 25×30 mm online), so always follow the instruction of the office or form you are applying to.',
      bn: '৩৫×৪৫ মিমি পাসপোর্ট ছবির একটি প্রচলিত মাপ, এবং ই-পাসপোর্টের আবেদনে হেগে বাংলাদেশ দূতাবাসও এই মাপই উল্লেখ করেছে (নিচের সূত্র দেখুন, ২৯ নভেম্বর ২০২৬ তারিখে দেখা)। অন্য অফিস বা ফর্মে ভিন্ন মাপ চাওয়া হতে পারে (যেমন ছাপা ছবিতে ৪৫×৫৫ মিমি বা অনলাইনে ২৫×৩০ মিমি), তাই যে অফিস বা ফর্মে আবেদন করছেন তার নির্দেশনাই মানুন।',
    },
  },
  {
    q: { en: 'What is the difference between passport size and stamp size?', bn: 'পাসপোর্ট সাইজ আর স্ট্যাম্প সাইজে পার্থক্য কী?' },
    a: { en: `Stamp size is smaller. This tool offers ${mmOf('stamp')} (${pxOf('stamp')} px at ${PRINT_DPI} DPI) for stamp size and ${mmOf('passport')} for passport size. Both are common sizes, not rules.`, bn: `স্ট্যাম্প সাইজ ছোট। এই টুলে স্ট্যাম্প সাইজে ${bnMm(mmOf('stamp'))} (${bnD(PRINT_DPI)} DPI-তে ${bnD(pxOf('stamp'))} px) ও পাসপোর্ট সাইজে ${bnMm(mmOf('passport'))} আছে। দুটোই প্রচলিত মাপ, নিয়ম নয়।` },
  },
  {
    q: { en: 'Is my photo uploaded?', bn: 'আমার ছবি কি আপলোড হয়?' },
    a: { en: 'No. The photo is resized inside your browser and is not uploaded or saved.', bn: 'না। ছবি আপনার ব্রাউজারের ভেতরেই রিসাইজ হয়, আপলোড বা সেভ হয় না।' },
  },
  {
    q: { en: 'Can I use this for a job application form?', bn: 'চাকরির আবেদনের ফর্মে কি এটা চলবে?' },
    a: { en: 'Job portals usually ask for a pixel size and a KB limit, not a print size. Use the job-form presets on the main photo and signature resizer.', bn: 'চাকরির পোর্টালে সাধারণত পিক্সেল মাপ ও KB সীমা চাওয়া হয়, প্রিন্ট সাইজ নয়। মূল ছবি ও স্বাক্ষর রিসাইজারের চাকরির ফর্মের প্রিসেট ব্যবহার করুন।' },
  },
];

export const PASSPORT_SOURCES: { label: Bilingual; url: string; note: Bilingual }[] = [
  {
    label: { en: 'Bangladesh Embassy in The Hague, e-passport page (mofa.gov.bd)', bn: 'হেগে বাংলাদেশ দূতাবাস, ই-পাসপোর্ট পেজ (mofa.gov.bd)' },
    url: 'https://hague.mofa.gov.bd/pages/static-pages/e-passport-69595bcb2b767a2ae71c42e3',
    note: { en: 'Lists “Three (03) passport-size photographs (Size: 35 mm x 45 mm)” for e-passport applications. A government page, but for that mission only. Checked 29 November 2026.', bn: 'ই-পাসপোর্ট আবেদনে “Three (03) passport-size photographs (Size: 35 mm x 45 mm)” লেখা আছে। এটি সরকারি পেজ, তবে শুধু ওই মিশনের জন্য। ২৯ নভেম্বর ২০২৬ তারিখে দেখা।' },
  },
  {
    label: { en: 'passport-photo.online stamp size page (commercial)', bn: 'passport-photo.online স্ট্যাম্প সাইজ পেজ (বাণিজ্যিক)' },
    url: 'https://passport-photo.online/en-in/stamp-size-photo',
    note: { en: `Gives ${mmOf('stamp')} as the base stamp size. Checked 28 November 2026. Not an official source.`, bn: `মূল স্ট্যাম্প সাইজ ${bnMm(mmOf('stamp'))}। ২৮ নভেম্বর ২০২৬ তারিখে দেখা। সরকারি সূত্র নয়।` },
  },
  {
    label: { en: 'passport-photo.online Bangladesh passport photo page (commercial)', bn: 'passport-photo.online বাংলাদেশ পাসপোর্ট ছবি পেজ (বাণিজ্যিক)' },
    url: 'https://passport-photo.online/bangladesh-passport-photo',
    note: { en: 'Lists 45×55 mm for a standard passport, 25×30 mm for an e-passport and 35×45 mm for a visa, so commercial sites disagree with each other. Checked 28 November 2026. Not an official source.', bn: 'সাধারণ পাসপোর্টে ৪৫×৫৫ মিমি, ই-পাসপোর্টে ২৫×৩০ মিমি ও ভিসায় ৩৫×৪৫ মিমি বলে। ২৮ নভেম্বর ২০২৬ তারিখে দেখা। সরকারি সূত্র নয়।' },
  },
  {
    label: { en: 'visafoto Bangladesh passport photo requirements (commercial)', bn: 'visafoto বাংলাদেশ পাসপোর্ট ছবির নিয়ম (বাণিজ্যিক)' },
    url: 'https://visafoto.com/bangladesh/passport-visa-photo-requirements-bangladesh',
    note: { en: 'Lists 25×30 mm for the online form and 35×45 mm for e-visa, and says to check the embassy. Checked 28 November 2026. Not an official source.', bn: 'অনলাইন ফর্মে ২৫×৩০ মিমি ও ই-ভিসায় ৩৫×৪৫ মিমি বলে এবং দূতাবাসে মিলিয়ে নিতে বলে। ২৮ নভেম্বর ২০২৬ তারিখে দেখা। সরকারি সূত্র নয়।' },
  },
];

export const PASSPORT_RELATED: { href: string; label: Bilingual }[] = [
  { href: '/tools/photo-signature-resizer', label: { en: 'Photo and signature resizer (job forms, stamp size, KB)', bn: 'ছবি ও স্বাক্ষর রিসাইজার (চাকরির ফর্ম, স্ট্যাম্প সাইজ, KB)' } },
  { href: '/guides/teletalk-photo-signature-size', label: { en: 'Guide: photo and signature rules for job applications (Bangla)', bn: 'গাইড: চাকরির আবেদনে ছবি ও স্বাক্ষরের নিয়ম' } },
  { href: '/builder', label: { en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' } },
];
