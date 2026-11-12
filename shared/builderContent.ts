// Words and groupings for the CV builder page: design groups (the filter chips and the "designs by job"
// list), the how-it-works steps and the FAQ. Shared so the build-time SEO page prints the same text.

import { DESIGN_LIST, FREE_DESIGN_COUNT, type DesignId } from './designList';
import { TEMPLATE_PRESETS } from './templatePresets';

export interface Bilingual { en: string; bn: string }

export interface DesignGroup { id: string; name: Bilingual; designs: DesignId[] }

/** Which designs suit which kind of job. A design can sit in more than one group. */
export const DESIGN_GROUPS: DesignGroup[] = [
  { id: 'fresher', name: { en: 'Fresher and student', bn: 'ফ্রেশার ও স্টুডেন্ট' }, designs: ['journey', 'fresher', 'scholar', 'modern', 'classic'] },
  { id: 'banking', name: { en: 'Banking and finance', bn: 'ব্যাংক ও ফাইন্যান্স' }, designs: ['ascent', 'ledger', 'bars', 'corporate', 'executive'] },
  { id: 'teaching', name: { en: 'Teaching', bn: 'শিক্ষকতা' }, designs: ['chalk', 'scholar', 'elegant', 'minimal'] },
  { id: 'health', name: { en: 'Nursing and health', bn: 'নার্সিং ও স্বাস্থ্য' }, designs: ['care', 'elegant', 'minimal'] },
  { id: 'it', name: { en: 'IT and software', bn: 'আইটি ও সফটওয়্যার' }, designs: ['terminal', 'graphite', 'pulse', 'modern'] },
  { id: 'sales', name: { en: 'Sales and service', bn: 'সেলস ও সার্ভিস' }, designs: ['spark', 'support', 'pulse', 'bold'] },
  { id: 'office', name: { en: 'Admin and office', bn: 'অ্যাডমিন ও অফিস' }, designs: ['office', 'ledger', 'corporate', 'classic'] },
  { id: 'gulf', name: { en: 'Gulf and abroad', bn: 'গালফ ও বিদেশ' }, designs: ['passport', 'road', 'classic', 'bars'] },
  { id: 'field', name: { en: 'Driver and merchandiser', bn: 'ড্রাইভার ও মার্চেন্ডাইজার' }, designs: ['road', 'orbit', 'graphite'] },
  { id: 'creative', name: { en: 'Creative', bn: 'ক্রিয়েটিভ' }, designs: ['banner', 'timeline', 'bold', 'orbit'] },
];

/** A design that copies one of our Word templates: the template to link to. First template wins. */
export function templateForDesign(design: DesignId): string | null {
  const hit = Object.entries(TEMPLATE_PRESETS).find(([, p]) => p.design === design);
  return hit ? hit[0] : null;
}

export const BUILDER_STEPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: 'Pick a design', bn: 'ডিজাইন বেছে নিন' },
    body: {
      en: 'Choose a layout made for your kind of job, such as banking, teaching, nursing, IT, sales or Gulf. Change the colour any time.',
      bn: 'ব্যাংক, শিক্ষকতা, নার্সিং, আইটি, সেলস বা গালফের মতো আপনার চাকরির ধরনের ডিজাইন বেছে নিন। রং যখন খুশি বদলান।',
    },
  },
  {
    title: { en: 'Add your details', bn: 'আপনার তথ্য দিন' },
    body: {
      en: 'Type into the form or upload your old CV (PDF or Word) and we fill it for you. The preview updates as you type.',
      bn: 'ফর্মে লিখুন, অথবা পুরনো সিভি (PDF বা Word) আপলোড করুন, আমরা ফর্ম পূরণ করে দেব। লেখার সাথে সাথে প্রিভিউ বদলায়।',
    },
  },
  {
    title: { en: 'Download', bn: 'ডাউনলোড করুন' },
    body: {
      en: 'Download a PDF, or an editable Word file. Free designs are free to download. Premium designs need Pro.',
      bn: 'PDF বা এডিটযোগ্য Word ফাইল ডাউনলোড করুন। ফ্রি ডিজাইন বিনামূল্যে ডাউনলোড হয়। প্রিমিয়াম ডিজাইনের জন্য Pro লাগে।',
    },
  },
];

export const BUILDER_FAQ: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { en: 'Is the CV builder really free?', bn: 'সিভি বিল্ডার কি সত্যিই ফ্রি?' },
    a: {
      en: `Yes. You can fill the form, see the preview and download a PDF without signing up. ${FREE_DESIGN_COUNT} designs are free; free downloads carry a small “Made with HereWeGrow.pro” footer. Pro removes the footer and unlocks the premium designs.`,
      bn: `হ্যাঁ। সাইন-আপ ছাড়াই ফর্ম পূরণ, প্রিভিউ দেখা ও PDF ডাউনলোড করা যায়। ${FREE_DESIGN_COUNT}টি ডিজাইন ফ্রি; ফ্রি ডাউনলোডে ছোট একটি “Made with HereWeGrow.pro” ফুটার থাকে। Pro নিলে ফুটার থাকে না এবং প্রিমিয়াম ডিজাইন খোলা যায়।`,
    },
  },
  {
    q: { en: 'Is my CV safe? Do I need an account?', bn: 'আমার সিভি কি নিরাপদ? অ্যাকাউন্ট লাগবে?' },
    a: {
      en: 'No account is needed to build and download. Your CV is saved on your own device as you type, and an uploaded CV is read on your device, not sent to us. If you log in with your phone number you can also keep CVs online and open them on any device.',
      bn: 'বানাতে ও ডাউনলোড করতে অ্যাকাউন্ট লাগে না। লেখার সাথে সাথে সিভি আপনার নিজের ডিভাইসে সেভ হয়, আর আপলোড করা সিভি আপনার ডিভাইসেই পড়া হয়, আমাদের কাছে পাঠানো হয় না। ফোন নম্বর দিয়ে লগইন করলে সিভি অনলাইনে রেখে যেকোনো ডিভাইসে খোলা যায়।',
    },
  },
  {
    q: { en: 'Which design is ATS-friendly?', bn: 'কোন ডিজাইন ATS-ফ্রেন্ডলি?' },
    a: {
      en: 'Classic and Bars are plain one-column layouts that applicant tracking systems and online job portals read easily. The other designs use colour, columns or graphics, so they suit emailing a PDF or handing over a printed copy better. No design can promise a particular result with a recruiter.',
      bn: 'ক্লাসিক ও বার্স এক কলামের সাদামাটা ডিজাইন, যা ATS ও অনলাইন জব পোর্টাল সহজে পড়ে। অন্য ডিজাইনে রং, কলাম বা গ্রাফিক আছে, তাই PDF ইমেইল করা বা প্রিন্ট দেওয়ার জন্য ভালো। কোনো ডিজাইনই রিক্রুটারের কাছে নির্দিষ্ট ফল দেওয়ার প্রতিশ্রুতি দিতে পারে না।',
    },
  },
  {
    q: { en: 'Can I make a CV on my phone?', bn: 'মোবাইলে কি সিভি বানানো যায়?' },
    a: {
      en: 'Yes. On a phone the builder works in three steps: fill the form, pick a design, download. You can open the PDF from your phone and share it straight away.',
      bn: 'হ্যাঁ। ফোনে বিল্ডার তিন ধাপে চলে: ফর্ম পূরণ, ডিজাইন বাছাই, ডাউনলোড। PDF ফোন থেকেই খুলে সঙ্গে সঙ্গে শেয়ার করা যায়।',
    },
  },
  {
    q: { en: 'Does it support Bangladeshi CV details and Bangla?', bn: 'বাংলাদেশি সিভির তথ্য ও বাংলা কি আছে?' },
    a: {
      en: 'Yes. You can add father’s and mother’s name, date of birth, NID, nationality, religion, addresses and a photo, which many Bangladeshi and Gulf employers ask for. The builder runs in English and Bangla.',
      bn: 'হ্যাঁ। বাবা-মায়ের নাম, জন্ম তারিখ, NID, জাতীয়তা, ধর্ম, ঠিকানা ও ছবি যোগ করা যায়, যা অনেক বাংলাদেশি ও গালফের নিয়োগকর্তা চান। বিল্ডার ইংরেজি ও বাংলা দুই ভাষায় চলে।',
    },
  },
  {
    q: { en: 'Can I download a Word file to edit later?', bn: 'পরে এডিট করার জন্য কি Word ফাইল পাওয়া যায়?' },
    a: {
      en: 'Yes, there is a Word download. It uses a simple, clean layout that opens well in Word, not the full artwork of each design. For the full designed look in Word, you can buy one of our ready-made Word templates.',
      bn: 'হ্যাঁ, Word ডাউনলোড আছে। এটি সাধারণ পরিষ্কার ডিজাইনে হয় এবং Word-এ ভালো খোলে, প্রতিটি ডিজাইনের পুরো আর্টওয়ার্ক থাকে না। Word-এ পুরো ডিজাইনের চেহারা চাইলে আমাদের রেডিমেড Word টেমপ্লেট কিনতে পারেন।',
    },
  },
  {
    q: { en: 'What is the difference between the builder and the Word templates?', bn: 'বিল্ডার আর Word টেমপ্লেটের পার্থক্য কী?' },
    a: {
      en: 'The builder is online: you type once and switch designs freely. A Word template is a ready-made file you edit yourself in Word. Several builder designs copy the look of our Word templates, so you can try the look free before you buy the file.',
      bn: 'বিল্ডার অনলাইনে চলে: একবার লিখে ইচ্ছামতো ডিজাইন বদলানো যায়। Word টেমপ্লেট একটি রেডিমেড ফাইল, যা আপনি নিজে Word-এ এডিট করেন। বিল্ডারের কয়েকটি ডিজাইন আমাদের Word টেমপ্লেটের চেহারা নকল করে, তাই ফাইল কেনার আগে চেহারাটি ফ্রি-তে দেখে নিতে পারেন।',
    },
  },
];

export const BUILDER_UPDATED = '2026-11-13';

/** Designs by their group, for the "designs by job" list. */
export const designsByGroup = () =>
  DESIGN_GROUPS.map((g) => ({ ...g, items: g.designs.map((id) => DESIGN_LIST.find((d) => d.id === id)!).filter(Boolean) }));
