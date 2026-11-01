// Single source of truth for everything HereWeGrow sells.
import { SINGLE_TEMPLATE_PRICE, TEMPLATES, type Sector } from './templates';

// The browser reads it to show prices; the server reads it to set the amount
// charged, so a price can never be changed from the browser.

export type Bilingual = { en: string; bn: string };

export type ProductKind = 'service' | 'pack' | 'template';

export interface Product {
  id: string;
  kind: ProductKind;
  name: Bilingual;
  /** One line: what the buyer gets. */
  summary: Bilingual;
  /** What is included, shown as a short list. */
  includes: Bilingual[];
  /** Price in BDT, whole taka. */
  price: number;
  /** How and when it is delivered. */
  delivery: Bilingual;
  /** Shown as the recommended option in its group. */
  featured?: boolean;
  /** For services: which group it is listed under. */
  group?: 'cv' | 'profile' | 'study';
  /** Label on a featured item; defaults to "Most chosen". */
  badge?: Bilingual;
  /** Files in the private R2 bucket, sent as download links once payment is confirmed. */
  files?: string[];
  /** Templates in this pack (template ids), for listing what is inside. */
  templates?: string[];
}

const inSector = (sector: Sector) => TEMPLATES.filter((t) => t.sector === sector).map((t) => t.id);
const instant = { en: 'Instant download after payment', bn: 'পেমেন্টের পরই সাথে সাথে ডাউনলোড' };
const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

function sectorPack(id: string, sector: Sector, name: Bilingual, summary: Bilingual): Product {
  const templates = inSector(sector);
  const n = templates.length;
  return {
    id,
    kind: 'pack',
    name,
    summary,
    includes: [
      { en: `${n} editable Word templates`, bn: `${bnDigits(n)}টি এডিটযোগ্য Word টেমপ্লেট` },
      { en: 'ATS and designed styles, labelled', bn: 'ATS ও ডিজাইনড স্টাইল, আলাদা চিহ্নিত' },
    ],
    price: 99,
    delivery: instant,
    files: [`${id}.zip`],
    templates,
  };
}

export const PRODUCTS: Product[] = [
  // ── Expert services ────────────────────────────────────────────
  {
    id: 'cv-review',
    kind: 'service',
    name: { en: 'CV review', bn: 'সিভি রিভিউ' },
    summary: {
      en: 'An expert reads your CV and tells you exactly what to fix.',
      bn: 'একজন বিশেষজ্ঞ আপনার সিভি পড়ে কী কী ঠিক করতে হবে তা জানাবেন।',
    },
    includes: [
      { en: 'Written feedback on every section', bn: 'প্রতিটি অংশের উপর লিখিত মতামত' },
      { en: 'ATS check and keyword gaps', bn: 'ATS চেক ও কী-ওয়ার্ডের ঘাটতি' },
      { en: '5 rewritten lines you can paste in', bn: 'সরাসরি বসানোর মতো ৫টি নতুন লাইন' },
    ],
    price: 199,
    delivery: { en: 'Within 24 hours on WhatsApp or email', bn: '২৪ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে' },
  },
  {
    id: 'cv-fresher',
    kind: 'service',
    name: { en: 'CV writing: fresher', bn: 'সিভি রাইটিং: ফ্রেশার' },
    summary: {
      en: 'A new one-page CV for students and first-job seekers.',
      bn: 'শিক্ষার্থী ও প্রথম চাকরিপ্রার্থীদের জন্য নতুন এক পৃষ্ঠার সিভি।',
    },
    includes: [
      { en: 'ATS-friendly CV, Word and PDF', bn: 'ATS-ফ্রেন্ডলি সিভি, Word ও PDF' },
      { en: 'Career objective written for you', bn: 'আপনার জন্য লেখা ক্যারিয়ার অবজেক্টিভ' },
      { en: '1 round of changes', bn: '১ বার সংশোধন' },
    ],
    price: 499,
    delivery: { en: 'Within 48 hours', bn: '৪৮ ঘণ্টার মধ্যে' },
  },
  {
    id: 'cv-experienced',
    kind: 'service',
    name: { en: 'CV writing: experienced', bn: 'সিভি রাইটিং: অভিজ্ঞ' },
    summary: {
      en: 'For 2–10 years of experience in bank, NGO, corporate or teaching jobs.',
      bn: 'ব্যাংক, এনজিও, কর্পোরেট বা শিক্ষকতায় ২–১০ বছরের অভিজ্ঞদের জন্য।',
    },
    includes: [
      { en: 'Achievement-based CV, Word and PDF', bn: 'অর্জনভিত্তিক সিভি, Word ও PDF' },
      { en: 'Cover letter for one job', bn: 'একটি চাকরির জন্য কভার লেটার' },
      { en: '2 rounds of changes', bn: '২ বার সংশোধন' },
    ],
    price: 899,
    delivery: { en: 'Within 48 hours', bn: '৪৮ ঘণ্টার মধ্যে' },
    featured: true,
  },
  {
    id: 'cv-executive',
    kind: 'service',
    name: { en: 'CV writing: executive', bn: 'সিভি রাইটিং: এক্সিকিউটিভ' },
    summary: {
      en: 'For managers and senior professionals applying at home or abroad.',
      bn: 'দেশে বা বিদেশে আবেদনকারী ম্যানেজার ও সিনিয়র পেশাজীবীদের জন্য।',
    },
    includes: [
      { en: 'Executive CV, Word and PDF', bn: 'এক্সিকিউটিভ সিভি, Word ও PDF' },
      { en: 'Cover letter and LinkedIn summary', bn: 'কভার লেটার ও লিংকডইন সামারি' },
      { en: '30-minute call and 3 rounds of changes', bn: '৩০ মিনিটের কল ও ৩ বার সংশোধন' },
    ],
    price: 1499,
    delivery: { en: 'Within 3 days', bn: '৩ দিনের মধ্যে' },
  },
  {
    id: 'biodata-custom',
    kind: 'service',
    name: { en: 'Marriage biodata', bn: 'বিয়ের বায়োডাটা' },
    summary: {
      en: 'A neat, respectful biodata in Bangla or English, made for you.',
      bn: 'বাংলা বা ইংরেজিতে আপনার জন্য তৈরি পরিচ্ছন্ন বায়োডাটা।',
    },
    includes: [
      { en: 'Designed biodata, PDF and Word', bn: 'ডিজাইন করা বায়োডাটা, PDF ও Word' },
      { en: 'Bangla, English or both', bn: 'বাংলা, ইংরেজি বা দুটোই' },
      { en: '1 round of changes', bn: '১ বার সংশোধন' },
    ],
    price: 299,
    delivery: { en: 'Within 48 hours', bn: '৪৮ ঘণ্টার মধ্যে' },
  },

  // ── Online profiles ─────────────────────────────────────────────
  {
    id: 'linkedin-profile',
    kind: 'service',
    group: 'profile',
    name: { en: 'LinkedIn profile makeover', bn: 'লিংকডইন প্রোফাইল মেকওভার' },
    summary: {
      en: 'A profile recruiters find in search and want to message.',
      bn: 'এমন প্রোফাইল যা রিক্রুটাররা সার্চে খুঁজে পান ও মেসেজ দিতে চান।',
    },
    includes: [
      { en: 'Headline, About and experience rewritten', bn: 'হেডলাইন, About ও অভিজ্ঞতা নতুন করে লেখা' },
      { en: 'Keywords and skills for your target job', bn: 'লক্ষ্য চাকরির কী-ওয়ার্ড ও স্কিল' },
      { en: 'Banner and photo tips, 1 round of changes', bn: 'ব্যানার ও ছবির পরামর্শ, ১ বার সংশোধন' },
    ],
    price: 499,
    delivery: { en: 'Within 48 hours', bn: '৪৮ ঘণ্টার মধ্যে' },
  },
  {
    id: 'bdjobs-profile',
    kind: 'service',
    group: 'profile',
    name: { en: 'BDJobs profile setup', bn: 'বিডিজবস প্রোফাইল সেটআপ' },
    summary: {
      en: 'Your BDJobs account filled in completely, so employers see a strong profile.',
      bn: 'বিডিজবস অ্যাকাউন্ট পুরোপুরি পূরণ, যাতে নিয়োগকর্তারা শক্তিশালী প্রোফাইল দেখেন।',
    },
    includes: [
      { en: 'Every section filled from your CV', bn: 'আপনার সিভি থেকে প্রতিটি অংশ পূরণ' },
      { en: 'Career summary and skills written', bn: 'ক্যারিয়ার সামারি ও স্কিল লেখা' },
      { en: 'Job alerts set for your target roles', bn: 'লক্ষ্য পদের জন্য জব অ্যালার্ট সেট' },
    ],
    price: 299,
    delivery: { en: 'Within 24 hours', bn: '২৪ ঘণ্টার মধ্যে' },
  },
  {
    id: 'combo-cv-linkedin-bdjobs',
    kind: 'service',
    group: 'profile',
    name: { en: 'Job-ready combo', bn: 'জব-রেডি কম্বো' },
    summary: {
      en: 'CV, LinkedIn and BDJobs done together, all saying the same strong story.',
      bn: 'সিভি, লিংকডইন ও বিডিজবস একসাথে, সব জায়গায় একই শক্তিশালী গল্প।',
    },
    includes: [
      { en: 'Experienced-level CV, Word and PDF', bn: 'অভিজ্ঞ-লেভেল সিভি, Word ও PDF' },
      { en: 'LinkedIn makeover and BDJobs setup', bn: 'লিংকডইন মেকওভার ও বিডিজবস সেটআপ' },
      { en: 'Save ৳398 compared with buying separately', bn: 'আলাদা কেনার চেয়ে ৳৩৯৮ সাশ্রয়' },
    ],
    price: 1299,
    delivery: { en: 'Within 3 days', bn: '৩ দিনের মধ্যে' },
    featured: true,
    badge: { en: 'Best value', bn: 'সবচেয়ে সাশ্রয়ী' },
  },

  // ── Higher study ────────────────────────────────────────────────
  {
    id: 'academic-cv',
    kind: 'service',
    group: 'study',
    name: { en: 'Academic CV for higher study', bn: 'উচ্চশিক্ষার একাডেমিক সিভি' },
    summary: {
      en: 'For master’s, PhD and scholarship applications abroad.',
      bn: 'বিদেশে মাস্টার্স, পিএইচডি ও স্কলারশিপ আবেদনের জন্য।',
    },
    includes: [
      { en: 'Research, publications and awards laid out', bn: 'গবেষণা, প্রকাশনা ও পুরস্কার গুছিয়ে উপস্থাপন' },
      { en: 'Format that universities expect, Word and PDF', bn: 'বিশ্ববিদ্যালয়ের প্রত্যাশিত ফরম্যাট, Word ও PDF' },
      { en: '2 rounds of changes', bn: '২ বার সংশোধন' },
    ],
    price: 699,
    delivery: { en: 'Within 48 hours', bn: '৪৮ ঘণ্টার মধ্যে' },
  },
  {
    id: 'sop',
    kind: 'service',
    group: 'study',
    name: { en: 'SOP or motivation letter', bn: 'এসওপি বা মোটিভেশন লেটার' },
    summary: {
      en: 'A personal statement written around your story, for one university or scholarship.',
      bn: 'আপনার গল্প ঘিরে লেখা স্টেটমেন্ট, একটি বিশ্ববিদ্যালয় বা স্কলারশিপের জন্য।',
    },
    includes: [
      { en: 'Short call or questionnaire about your goals', bn: 'লক্ষ্য নিয়ে ছোট কল বা প্রশ্নপত্র' },
      { en: 'Original writing, no templates', bn: 'মৌলিক লেখা, কোনো টেমপ্লেট নয়' },
      { en: '2 rounds of changes', bn: '২ বার সংশোধন' },
    ],
    price: 999,
    delivery: { en: 'Within 4 days', bn: '৪ দিনের মধ্যে' },
  },

  // ── Template packs (editable Word files) ───────────────────────
  sectorPack('pack-fresher', 'fresher', { en: 'Fresher CV pack', bn: 'ফ্রেশার সিভি প্যাক' }, {
    en: 'Clean one- and two-page CVs for your first job.',
    bn: 'প্রথম চাকরির জন্য পরিচ্ছন্ন এক ও দুই পৃষ্ঠার সিভি।',
  }),
  sectorPack('pack-bank', 'banking', { en: 'Bank and finance CV pack', bn: 'ব্যাংক ও ফাইন্যান্স সিভি প্যাক' }, {
    en: 'Formats that fit Bangladeshi bank and accounts jobs.',
    bn: 'বাংলাদেশের ব্যাংক ও অ্যাকাউন্টস চাকরির উপযোগী ফরম্যাট।',
  }),
  sectorPack('pack-engineering', 'engineering', { en: 'Engineering and IT CV pack', bn: 'ইঞ্জিনিয়ারিং ও আইটি সিভি প্যাক' }, {
    en: 'Mechanical, civil and technical CVs that show your projects.',
    bn: 'মেকানিক্যাল, সিভিল ও টেকনিক্যাল সিভি, প্রজেক্ট দেখানোর জায়গাসহ।',
  }),
  sectorPack('pack-sales', 'sales', { en: 'Sales and marketing CV pack', bn: 'সেলস ও মার্কেটিং সিভি প্যাক' }, {
    en: 'For sales, marketing, content and customer service roles.',
    bn: 'সেলস, মার্কেটিং, কনটেন্ট ও কাস্টমার সার্ভিসের পদের জন্য।',
  }),
  {
    id: 'pack-best-40',
    kind: 'pack',
    name: { en: 'Best 40 collection', bn: 'সেরা ৪০ কালেকশন' },
    summary: { en: 'All 40 of our best CV templates, every sector.', bn: 'সব খাতের আমাদের সেরা ৪০টি সিভি টেমপ্লেট।' },
    includes: [
      { en: '40 editable Word templates', bn: '৪০টি এডিটযোগ্য Word টেমপ্লেট' },
      { en: 'ATS and designed styles, labelled', bn: 'ATS ও ডিজাইনড স্টাইল, আলাদা চিহ্নিত' },
    ],
    price: 249,
    delivery: instant,
    featured: true,
    files: ['pack-best-40.zip'],
    templates: TEMPLATES.map((t) => t.id),
  },
  {
    id: 'pack-library',
    kind: 'pack',
    name: { en: 'Full library', bn: 'পূর্ণ লাইব্রেরি' },
    summary: { en: 'Every template we have, with a year of new additions.', bn: 'আমাদের সব টেমপ্লেট, সাথে এক বছরের নতুন সংযোজন।' },
    includes: [
      { en: '300+ editable templates', bn: '৩০০+ এডিটযোগ্য টেমপ্লেট' },
      { en: 'New templates for 12 months', bn: '১২ মাস নতুন টেমপ্লেট' },
    ],
    price: 399,
    delivery: { en: 'Download link on WhatsApp within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপে ডাউনলোড লিংক' },
  },
  {
    id: 'pack-biodata',
    kind: 'pack',
    name: { en: 'Biodata templates', bn: 'বায়োডাটা টেমপ্লেট' },
    summary: { en: 'Fill-in marriage biodata designs, Bangla and English.', bn: 'বাংলা ও ইংরেজিতে পূরণযোগ্য বিয়ের বায়োডাটা ডিজাইন।' },
    includes: [{ en: 'Editable Word templates + PDF', bn: 'এডিটযোগ্য Word টেমপ্লেট + PDF' }],
    price: 49,
    delivery: { en: 'Files on WhatsApp within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপে ফাইল' },
  },

  // ── Single templates (one product per template) ─────────────────
  ...TEMPLATES.map(
    (t): Product => ({
      id: `tpl-${t.id}`,
      kind: 'template',
      name: t.title,
      summary: { en: 'One editable Word template.', bn: 'একটি এডিটযোগ্য Word টেমপ্লেট।' },
      includes: [{ en: 'Editable Word file (.docx)', bn: 'এডিটযোগ্য Word ফাইল (.docx)' }],
      price: SINGLE_TEMPLATE_PRICE,
      delivery: instant,
      files: [`${t.id}.docx`],
      templates: [t.id],
    }),
  ),
];

export const findProduct = (id: string): Product | undefined => PRODUCTS.find((p) => p.id === id);

export const SUPPORT_WHATSAPP = '8801981505759';
export const SUPPORT_WHATSAPP_DISPLAY = '01981-505759';
