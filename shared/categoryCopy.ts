// Category buying-guide pages: /templates/category/<slug>. Typed data for the prerendered HTML (shared/categoryHtml.ts)
// and the React page (src/pages/CategoryPage.tsx). The pages stay noindex and out of the sitemap while CATEGORY_PAGES_LIVE is false.
// Copy here is general advice and facts from the template data. Owner: replace with the final copy when ready; keep titles <= 60 and descriptions <= 155 characters.
import { SINGLE_TEMPLATE_PRICE, findTemplate } from './templates';
import { CATEGORY_PAGES_LIVE } from './templateTiers';

export interface CategoryFaq {
  q: string;
  a: string;
}
export interface CategoryPage {
  /** Last path segment: /templates/category/<slug>. */
  slug: string;
  /** Template hub (hubOf) this page covers. */
  hub: string;
  /** When set, the page covers this sector instead of the hub (a sector can span hubs). */
  sector?: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  chooseHeading: string;
  choose: string[];
  /** Ordered template ids shown as cards. All must be indexable. */
  templateIds: string[];
  faqHeading: string;
  faq: CategoryFaq[];
  /** Short English name used in the breadcrumb and ItemList. */
  crumb: string;
}

export const CATEGORY_BASE = '/templates/category';
export const categoryPath = (slug: string): string => `${CATEGORY_BASE}/${slug}`;

const bn = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const P = bn(SINGLE_TEMPLATE_PRICE);

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    slug: 'teacher-cv',
    hub: 'teacher',
    crumb: 'Teacher CV',
    title: 'শিক্ষকের সিভি ফরম্যাট (Word) | Teacher CV | HereWeGrow',
    description: `স্কুল, কলেজ বা কোচিংয়ে শিক্ষকতার আবেদনের জন্য ৫টি Word CV format। ATS-ফ্রেন্ডলি ও ডিজাইনড, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট।`,
    h1: 'শিক্ষকের সিভি ফরম্যাট (Word)',
    intro: [
      `শিক্ষকতার চাকরিতে আবেদন করছেন? এখানে শিক্ষক ও একাডেমিক পদের জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'নিয়োগকারী সাধারণত দেখতে চান আপনি কোন বিষয়ে, কোন শ্রেণিতে পড়িয়েছেন এবং আপনার শিক্ষাগত যোগ্যতা কী। নিচের ফরম্যাটগুলোতে এই তথ্য সাজিয়ে লেখার জায়গা আছে। কোনটা আপনার জন্য মানানসই, তা বেছে নেওয়ার কয়েকটি সহজ পরামর্শ নিচে দিলাম।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'অনলাইন পোর্টালে আপলোড করলে ATS-ফ্রেন্ডলি ফরম্যাট বেছে নিন, কারণ এতে সাদামাটা লেআউট থাকে এবং লেখা সহজে পড়া যায়।',
      'ইমেইলে বা সরাসরি জমা দিলে ডিজাইনড ফরম্যাট ভালো মানায়, কারণ প্রথম দেখাতেই চোখে পড়ে।',
      'অভিজ্ঞতা কম হলে এক পৃষ্ঠার ফরম্যাট যথেষ্ট। অনেক বছরের পড়ানোর অভিজ্ঞতা ও প্রশিক্ষণ থাকলে দুই পৃষ্ঠার ফরম্যাটে বিস্তারিত লেখা যায়।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট, না চাইলে ছবি ছাড়া ফরম্যাট বেছে নিন। প্রতিটি কার্ডে ছবির তথ্য দেওয়া আছে।',
      'শিক্ষাগত যোগ্যতা, পড়ানোর অভিজ্ঞতা, বিষয় ও শ্রেণি এবং প্রশিক্ষণ আলাদা আলাদা সেকশনে লিখলে সিভি পরিষ্কার দেখায়।',
    ],
    templateIds: ['hwg-cv-designed-teacher-cv', 'ats-academic-teaching-2page', 'creative-academic-teacher-2page', 'hwg-cv-teacher-teacher-003', 'hwg-cv-teacher-teacher-005'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'নতুন শিক্ষক বা ফ্রেশার কি এগুলো ব্যবহার করতে পারবেন?', a: 'পারবেন। অভিজ্ঞতার অংশ ছোট রেখে শিক্ষা, প্রশিক্ষণ ও দক্ষতা সামনে রাখুন। এক পৃষ্ঠার ফরম্যাট সাধারণত বেশি মানায়।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
  {
    slug: 'nursing-doctor-cv',
    hub: 'nurse',
    crumb: 'Nursing and doctor CV',
    title: 'নার্স ও ডাক্তারের সিভি ফরম্যাট (Word) | HereWeGrow',
    description: `নার্স, ডাক্তার ও মেডিকেল সহকারীর চাকরির জন্য ৬টি Word CV format। ছবিসহ ও ছবি ছাড়া, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট, সঙ্গে সঙ্গে ডাউনলোড।`,
    h1: 'নার্স ও ডাক্তারের সিভি ফরম্যাট (Word)',
    intro: [
      `হাসপাতাল, ক্লিনিক বা স্বাস্থ্যখাতের চাকরিতে আবেদন করছেন? এখানে নার্স, ডাক্তার ও মেডিকেল সহকারীর জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'স্বাস্থ্যখাতের সিভিতে সাধারণত শিক্ষা, প্রশিক্ষণ, কোন বিভাগে কাজ করেছেন এবং কত সময়ের অভিজ্ঞতা, এই তথ্যগুলো পরিষ্কারভাবে দেখাতে হয়। নিচের ফরম্যাটগুলোতে এগুলো সাজিয়ে লেখার জায়গা আছে। কোনটা আপনার জন্য মানানসই, তা বেছে নেওয়ার কয়েকটি পরামর্শ নিচে দিলাম।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'নার্সিং বা মেডিকেল সহকারীর পদে সাধারণত এক পৃষ্ঠার সংক্ষিপ্ত ফরম্যাটই যথেষ্ট। ডাক্তারের জন্য প্রশিক্ষণ ও অভিজ্ঞতা বেশি হলে দুই পৃষ্ঠার ফরম্যাট বেছে নিতে পারেন।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট বেছে নিন। প্রতিটি কার্ডে ছবির জায়গা আছে কি না, তা লেখা আছে।',
      'রঙের ক্ষেত্রে নীল বা পরিচ্ছন্ন সাদা ফরম্যাট বেছে নিলে সিভি পেশাদার দেখায়। এই তালিকায় দুটি রংই আছে।',
      'কোন বিভাগ বা ওয়ার্ডে কাজ করেছেন এবং কত সময়, তা আলাদা লাইনে লিখুন।',
      'ডিগ্রি, প্রশিক্ষণ ও প্রযোজ্য হলে রেজিস্ট্রেশনের তথ্য শিক্ষা অংশে আলাদা করে দিন।',
    ],
    templateIds: ['hwg-cv-designed-nurse-cv', 'hwg-cv-designed-doctor-cv', 'creative-medical-assistant-bd', 'creative-medical-doctor-2column', 'hwg-cv-nurse-doctor-003', 'hwg-cv-nurse-care-assistent-001'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'নতুন নার্স বা ফ্রেশার কি এগুলো ব্যবহার করতে পারবেন?', a: 'পারবেন। অভিজ্ঞতা কম হলে শিক্ষা, প্রশিক্ষণ ও ইন্টার্নশিপ সামনে রাখুন। এক পৃষ্ঠার ফরম্যাট সাধারণত বেশি মানায়।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
  {
    slug: 'fresher-cv',
    hub: 'fresher',
    crumb: 'Fresher CV',
    title: 'ফ্রেশার সিভি ফরম্যাট (Word) | Fresher CV | HereWeGrow',
    description: `অভিজ্ঞতা ছাড়া প্রথম চাকরির আবেদনের জন্য ১২টি Word CV format। ছবিসহ ও ছবি ছাড়া, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট, সঙ্গে সঙ্গে ডাউনলোড।`,
    h1: 'ফ্রেশার সিভি ফরম্যাট (Word)',
    intro: [
      `প্রথম চাকরির জন্য আবেদন করছেন? এখানে ফ্রেশার, গ্র্যাজুয়েট ও শিক্ষার্থীদের জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'অভিজ্ঞতা কম থাকলে সিভিতে শিক্ষা, প্রজেক্ট, ইন্টার্নশিপ, প্রশিক্ষণ ও দক্ষতাকে সামনে রাখতে হয়। নিচের ফরম্যাটগুলোতে এই অংশগুলো সাজিয়ে লেখার জায়গা আছে। সিভি কীভাবে লিখবেন, তা বিস্তারিত জানতে ফ্রেশার সিভি গাইড পড়তে পারেন।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'প্রথম চাকরিতে এক পৃষ্ঠার ফরম্যাটই সাধারণত যথেষ্ট। বেশি জায়গা ফাঁকা রেখে পাতা বাড়ানোর দরকার নেই।',
      'অনলাইন পোর্টালে আপলোড করলে ATS-ফ্রেন্ডলি ফরম্যাট বেছে নিন, কারণ এতে সাদামাটা লেআউট থাকে এবং লেখা সহজে পড়া যায়।',
      'ইমেইলে বা সরাসরি জমা দিলে ডিজাইনড ফরম্যাট ভালো মানায়, কারণ প্রথম দেখাতেই চোখে পড়ে।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট, না চাইলে ছবি ছাড়া ফরম্যাট বেছে নিন। প্রতিটি কার্ডে ছবির তথ্য দেওয়া আছে।',
      'অভিজ্ঞতা না থাকলে শিক্ষা, প্রজেক্ট ও দক্ষতা অংশ আগে রাখুন, আর কাজের অংশে ইন্টার্নশিপ বা স্বেচ্ছাসেবার কাজ লিখুন।',
    ],
    templateIds: ['hwg-cv-designed-fresher-cv', 'hwg-cv-designed-student-higher-study-cv', 'ats-graduate-detailed-2page', 'ats-graduate-standard-single-page', 'ats-minimalist-single-page', 'creative-classic-standard-style1', 'creative-graduate-standard-bd', 'creative-minimal-modern-1page', 'hwg-cv-fresher-fresher-s-009', 'hwg-cv-fresher-fresher-s-012', 'hwg-cv-student-higher-study-and-p-003', 'hwg-cv-fresher-fresher-s-004'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'কোনো কাজের অভিজ্ঞতা না থাকলেও কি এগুলো ব্যবহার করা যাবে?', a: 'যাবে। শিক্ষা, প্রজেক্ট, প্রশিক্ষণ ও দক্ষতা সামনে রেখে লিখুন। এক পৃষ্ঠার ফরম্যাট সাধারণত বেশি মানায়।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
  {
    slug: 'bank-job-cv',
    hub: 'professional',
    sector: 'banking',
    crumb: 'Bank job CV',
    title: 'ব্যাংক জবের সিভি ফরম্যাট (Word) | HereWeGrow',
    description: `ব্যাংক, ফাইন্যান্স ও অ্যাকাউন্টিংয়ের চাকরির জন্য ৮টি Word CV format। ATS-ফ্রেন্ডলি ও ডিজাইনড, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট।`,
    h1: 'ব্যাংক জবের সিভি ফরম্যাট (Word)',
    intro: [
      `ব্যাংক বা আর্থিক প্রতিষ্ঠানের চাকরিতে আবেদন করছেন? এখানে ব্যাংকার, অ্যাকাউন্ট্যান্ট ও ফাইন্যান্স পদের জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'ব্যাংকের সিভিতে সাধারণত শিক্ষাগত যোগ্যতা, ফলাফল, কাজের অভিজ্ঞতা ও দক্ষতা পরিষ্কারভাবে দেখাতে হয়। নিচের ফরম্যাটগুলোতে এগুলো গুছিয়ে লেখার জায়গা আছে। লেখার নিয়ম জানতে ব্যাংক জবের সিভি ফরম্যাট গাইড পড়তে পারেন।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'ব্যাংকের অনলাইন আবেদনে ATS-ফ্রেন্ডলি ফরম্যাট বেছে নিন, কারণ এতে সাদামাটা লেআউট থাকে এবং লেখা সহজে পড়া যায়।',
      'সিনিয়র পদে অভিজ্ঞতা বেশি থাকলে দুই পৃষ্ঠার ফরম্যাট বেছে নিন। প্রবেশ পর্যায়ে এক পৃষ্ঠাই যথেষ্ট।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট, না চাইলে ছবি ছাড়া ফরম্যাট বেছে নিন। প্রতিটি কার্ডে ছবির তথ্য দেওয়া আছে।',
      'অ্যাকাউন্টিং বা ফাইন্যান্স পদের জন্য অ্যাকাউন্ট্যান্ট ও ফাইন্যান্স ফরম্যাটগুলো দেখুন।',
      'শিক্ষা, ফলাফল ও কাজের অভিজ্ঞতা আলাদা সেকশনে, সংখ্যা ও সময়সহ লিখলে সিভি পরিষ্কার দেখায়।',
    ],
    templateIds: ['hwg-cv-designed-accountant-cv', 'hwg-cv-designed-banker-cv', 'ats-banking-senior-executive', 'ats-banking-standard-bd', 'creative-banking-two-column-2page', 'creative-finance-accountant-2page', 'hwg-cv-professional-banking-021', 'hwg-cv-professional-banking-022'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'ব্যাংকের সিভি কত পৃষ্ঠার হওয়া ভালো?', a: 'প্রবেশ পর্যায়ে এক পৃষ্ঠাই যথেষ্ট। অনেক বছরের অভিজ্ঞতা থাকলে দুই পৃষ্ঠা রাখতে পারেন।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
  {
    slug: 'it-engineering-cv',
    hub: 'it',
    sector: 'engineering',
    crumb: 'IT and engineering CV',
    title: 'আইটি ও ইঞ্জিনিয়ারের সিভি ফরম্যাট (Word) | HereWeGrow',
    description: `সিভিল, মেকানিক্যাল, আইটি ও সফটওয়্যার পদের জন্য ৯টি Word CV format। ছবিসহ ও ছবি ছাড়া, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট।`,
    h1: 'আইটি ও ইঞ্জিনিয়ারের সিভি ফরম্যাট (Word)',
    intro: [
      `ইঞ্জিনিয়ারিং বা আইটি খাতের চাকরিতে আবেদন করছেন? এখানে সিভিল, মেকানিক্যাল, সফটওয়্যার ও টেকনিক্যাল পদের জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'এই খাতের সিভিতে সাধারণত প্রজেক্ট, টেকনিক্যাল দক্ষতা, সফটওয়্যার বা টুলের নাম এবং শিক্ষাগত যোগ্যতা পরিষ্কারভাবে দেখাতে হয়। নিচের ফরম্যাটগুলোতে এগুলো সাজিয়ে লেখার জায়গা আছে।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'অনলাইন পোর্টালে আপলোড করলে ATS-ফ্রেন্ডলি ফরম্যাট বেছে নিন, কারণ এতে সাদামাটা লেআউট থাকে এবং লেখা সহজে পড়া যায়।',
      'এন্ট্রি লেভেলে এক পৃষ্ঠার ফরম্যাট যথেষ্ট। অনেক প্রজেক্টের অভিজ্ঞতা থাকলে দুই পৃষ্ঠার ফরম্যাটে বিস্তারিত লেখা যায়।',
      'নিজের শাখা অনুযায়ী ফরম্যাট বেছে নিন। সিভিল, মেকানিক্যাল ও আইটির জন্য আলাদা ফরম্যাট আছে।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট, না চাইলে ছবি ছাড়া ফরম্যাট বেছে নিন।',
      'প্রজেক্টের নাম, আপনার ভূমিকা ও ব্যবহৃত টুল আলাদা লাইনে লিখলে নিয়োগকারী সহজে বুঝতে পারেন।',
    ],
    templateIds: ['hwg-cv-designed-civil-engineer-cv', 'hwg-cv-designed-it-software-cv', 'hwg-cv-designed-mechanical-engineer-cv', 'ats-technical-specialist-2page', 'creative-civil-engineering-2page', 'creative-mechanical-design-centric', 'creative-mechanical-entry-level', 'hwg-cv-it-computer-engineer-003', 'hwg-cv-it-it-executive-emgin-006'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'সদ্য পাস করা ইঞ্জিনিয়ার কি এগুলো ব্যবহার করতে পারবেন?', a: 'পারবেন। এন্ট্রি লেভেলের ফরম্যাট বেছে একাডেমিক প্রজেক্ট, ইন্টার্নশিপ ও দক্ষতা সামনে রাখুন।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
  {
    slug: 'sales-marketing-cv',
    hub: 'professional',
    sector: 'sales',
    crumb: 'Sales and marketing CV',
    title: 'সেলস ও মার্কেটিং সিভি ফরম্যাট (Word) | HereWeGrow',
    description: `সেলস, মার্কেটিং, কাস্টমার সার্ভিস ও কনটেন্ট রাইটিং পদের জন্য ৭টি Word CV format। প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্ট।`,
    h1: 'সেলস ও মার্কেটিং সিভি ফরম্যাট (Word)',
    intro: [
      `সেলস, মার্কেটিং বা কাস্টমার সার্ভিসের চাকরিতে আবেদন করছেন? এখানে এসব পদের জন্য সাজানো Word CV template আছে। প্রতিটি ফরম্যাট ৳${P}, bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসাতে পারবেন।`,
      'এই খাতের সিভিতে কাজের ফলাফল, যেমন টার্গেট, বিক্রি বা ক্যাম্পেইনের তথ্য, নিয়োগকারীর নজর কাড়ে। নিচের ফরম্যাটগুলোতে অভিজ্ঞতা ও অর্জন আলাদা করে লেখার জায়গা আছে।',
      'আবেদনের আগে বিজ্ঞপ্তিটি ভালো করে পড়ে নিন। প্রতিষ্ঠান কোন কোন তথ্য ও কাগজ চায়, তা সিভির সঙ্গে মিলিয়ে নিন। অপ্রয়োজনীয় তথ্য বাদ দিলে সিভি ছোট ও গোছানো থাকে, আর নিয়োগকারী দ্রুত দরকারি অংশ খুঁজে পান।',
    ],
    chooseHeading: 'কোনটা বেছে নেবেন',
    choose: [
      'সেলস বা কাস্টমার সার্ভিসে এক পৃষ্ঠার ফরম্যাট সাধারণত যথেষ্ট। মার্কেটিং ম্যানেজার পদে বিস্তারিত অভিজ্ঞতার জন্য দুই পৃষ্ঠার ফরম্যাট দেখুন।',
      'কনটেন্ট রাইটিং বা সৃজনশীল পদে ডিজাইনড ফরম্যাট ভালো মানায়।',
      'প্রতিষ্ঠান ছবি চাইলে ছবিসহ ফরম্যাট বেছে নিন। প্রতিটি কার্ডে ছবির তথ্য দেওয়া আছে।',
      'প্রতিটি কাজের নিচে একটি করে মাপার মতো অর্জন লিখুন, যেমন কত গ্রাহক সামলেছেন বা কত বিক্রি করেছেন।',
      'নিজের পদের সঙ্গে মেলে এমন দক্ষতা সামনে রাখুন এবং অপ্রাসঙ্গিক তথ্য বাদ দিন।',
    ],
    templateIds: ['hwg-cv-designed-customer-service-cv', 'hwg-cv-designed-sales-marketing-cv', 'hwg-cv-designed-writer-content-cv', 'creative-content-writer-2page', 'creative-customer-service-2page', 'creative-marketing-manager-2page', 'creative-sales-standard-1page'],
    faqHeading: 'সচরাচর প্রশ্ন',
    faq: [
      { q: 'ফরম্যাটগুলো কি Word-এ এডিট করা যাবে?', a: 'হ্যাঁ। প্রতিটি ফাইল .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে।' },
      { q: 'অভিজ্ঞতা কম হলে কোন ফরম্যাট ভালো?', a: 'এক পৃষ্ঠার ফরম্যাট বেছে শিক্ষা, দক্ষতা ও ছোট অর্জন সামনে রাখুন। প্রতিটি কার্ডে পৃষ্ঠার সংখ্যা লেখা আছে।' },
      { q: 'পেমেন্টের পর কখন ডাউনলোড করা যায়?', a: `bKash বা Nagad-এ ৳${P} পরিশোধের পরেই ডাউনলোড করা যায়।` },
    ],
  },
];

export const findCategory = (slug: string): CategoryPage | undefined => CATEGORY_PAGES.find((c) => c.slug === slug);
export const categoryForHub = (hub: string): CategoryPage | undefined => CATEGORY_PAGES.find((c) => !c.sector && c.hub === hub);

/** Link target for a template's "more formats" block: the category page, only when that category is live. */
export const liveCategoryFor = (hub: string): CategoryPage | undefined => (CATEGORY_PAGES_LIVE ? categoryForHub(hub) : undefined);

export interface CategoryCard {
  id: string;
  href: string;
  title: string;
  pages: number;
  style: 'ats' | 'designed';
  styleBn: string;
  photo: boolean | undefined;
}
/** Cards for a category page, in the order of templateIds. Missing ids are skipped (a test fails on them). */
export function categoryCards(c: CategoryPage): CategoryCard[] {
  return c.templateIds.flatMap((id) => {
    const t = findTemplate(id);
    if (!t) return [];
    return [{ id, href: `/templates/${id}`, title: t.title.bn, pages: t.pages, style: t.style, styleBn: t.style === 'ats' ? 'ATS-ফ্রেন্ডলি' : 'ডিজাইনড', photo: t.photo }];
  });
}
export const cardLine = (k: CategoryCard): string =>
  `${bn(k.pages)} পৃষ্ঠা, ${k.styleBn}${k.photo === true ? ', ছবিসহ' : k.photo === false ? ', ছবি ছাড়া' : ''}। Word ফাইল ৳${P}।`;
