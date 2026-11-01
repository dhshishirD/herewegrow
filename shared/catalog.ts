// Single source of truth for everything HereWeGrow sells.
// The browser reads it to show prices; the server reads it to set the amount
// charged, so a price can never be changed from the browser.

export type Bilingual = { en: string; bn: string };

export type ProductKind = 'service' | 'pack';

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

  // ── Template packs (editable Word + PDF) ────────────────────────
  // TODO(owner): confirm the exact number of templates in each pack.
  {
    id: 'pack-fresher',
    kind: 'pack',
    name: { en: 'Fresher CV pack', bn: 'ফ্রেশার সিভি প্যাক' },
    summary: { en: 'Single-page ATS templates for your first job.', bn: 'প্রথম চাকরির জন্য এক পৃষ্ঠার ATS টেমপ্লেট।' },
    includes: [
      { en: '5 editable Word templates + PDF', bn: '৫টি এডিটযোগ্য Word টেমপ্লেট + PDF' },
      { en: 'Fill-in guide in Bangla', bn: 'বাংলায় পূরণ করার গাইড' },
    ],
    price: 99,
    delivery: { en: 'Files on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ফাইল' },
  },
  {
    id: 'pack-bank',
    kind: 'pack',
    name: { en: 'Bank job CV pack', bn: 'ব্যাংক জব সিভি প্যাক' },
    summary: { en: 'Formats that fit Bangladeshi bank applications.', bn: 'বাংলাদেশের ব্যাংক চাকরির আবেদনের উপযোগী ফরম্যাট।' },
    includes: [
      { en: '5 editable Word templates + PDF', bn: '৫টি এডিটযোগ্য Word টেমপ্লেট + PDF' },
      { en: 'Cover letter template', bn: 'কভার লেটার টেমপ্লেট' },
    ],
    price: 99,
    delivery: { en: 'Files on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ফাইল' },
  },
  {
    id: 'pack-teaching',
    kind: 'pack',
    name: { en: 'Teaching job CV pack', bn: 'শিক্ষকতা সিভি প্যাক' },
    summary: { en: 'For school, college and international school roles.', bn: 'স্কুল, কলেজ ও ইন্টারন্যাশনাল স্কুলের পদের জন্য।' },
    includes: [
      { en: '5 editable Word templates + PDF', bn: '৫টি এডিটযোগ্য Word টেমপ্লেট + PDF' },
      { en: 'Teaching philosophy sample', bn: 'টিচিং ফিলোসফির নমুনা' },
    ],
    price: 99,
    delivery: { en: 'Files on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ফাইল' },
  },
  {
    id: 'pack-best-40',
    kind: 'pack',
    name: { en: 'Best 40 collection', bn: 'সেরা ৪০ কালেকশন' },
    summary: { en: 'Our 40 most-used CV templates across sectors.', bn: 'বিভিন্ন খাতের সবচেয়ে বেশি ব্যবহৃত ৪০টি সিভি টেমপ্লেট।' },
    includes: [
      { en: '40 editable Word templates + PDF', bn: '৪০টি এডিটযোগ্য Word টেমপ্লেট + PDF' },
      { en: 'ATS and designed styles, labelled', bn: 'ATS ও ডিজাইনড স্টাইল, আলাদা চিহ্নিত' },
    ],
    price: 249,
    delivery: { en: 'Files on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ফাইল' },
    featured: true,
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
    delivery: { en: 'Download link on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ডাউনলোড লিংক' },
  },
  {
    id: 'pack-biodata',
    kind: 'pack',
    name: { en: 'Biodata templates', bn: 'বায়োডাটা টেমপ্লেট' },
    summary: { en: 'Fill-in marriage biodata designs, Bangla and English.', bn: 'বাংলা ও ইংরেজিতে পূরণযোগ্য বিয়ের বায়োডাটা ডিজাইন।' },
    includes: [
      { en: 'Editable Word templates + PDF', bn: 'এডিটযোগ্য Word টেমপ্লেট + PDF' },
    ],
    price: 49,
    delivery: { en: 'Files on WhatsApp or email within 2 hours', bn: '২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ বা ইমেইলে ফাইল' },
  },
];

export const findProduct = (id: string): Product | undefined => PRODUCTS.find((p) => p.id === id);

export const SUPPORT_WHATSAPP = '8801981505759';
export const SUPPORT_WHATSAPP_DISPLAY = '01981-505759';
