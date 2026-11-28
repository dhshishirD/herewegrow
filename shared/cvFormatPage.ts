// /cv-format-bd: the pillar page for "CV format" searches in Bangladesh. General, practical advice (no invented rules).
// Used by the build (shared/cvFormatHtml.ts) and the React page (src/pages/CvFormatPage.tsx).
import { EUROPASS_AUTHOR } from './europassPages';
import { SINGLE_TEMPLATE_PRICE, findTemplate, type Template } from './templates';
import type { Block, Faq, Source } from './seoPage';

export const CV_FORMAT_PATH = '/cv-format-bd';
/** Day this page's content last changed. Bump by hand when the copy is edited. */
export const CV_FORMAT_UPDATED = '2026-11-29';
/** Day the outside sources below (ATS vendors, Microsoft) were opened and read. */
export const CV_FORMAT_CHECKED = '2026-11-29';
export const CV_FORMAT_AUTHOR = EUROPASS_AUTHOR;

const bn = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const P = bn(SINGLE_TEMPLATE_PRICE);

export const CV_FORMAT_SEO = {
  title: 'CV Format Bangladesh: সিভি ফরম্যাট ও লেখার নিয়ম | HWG',
  description: `বাংলাদেশে চাকরির সিভির সঠিক ফরম্যাট: সেকশনের ক্রম, দৈর্ঘ্য, ফন্ট, ছবি ও ATS টিপস। ফ্রেশার ও অভিজ্ঞদের জন্য। Word CV template ৳${P}।`,
  h1: 'CV Format (সিভি ফরম্যাট): বাংলাদেশে চাকরির সিভি লেখার নিয়ম',
} as const;

export const CV_FORMAT_ANSWER =
  'CV format মানে সিভির সেকশনগুলো কোন ক্রমে ও কী লেআউটে সাজানো হবে। বাংলাদেশে চাকরির আবেদনে সাধারণত নিরাপদ ফরম্যাট হলো: নাম ও যোগাযোগ, সংক্ষিপ্ত সারাংশ, অভিজ্ঞতা, শিক্ষা, দক্ষতা ও প্রশিক্ষণ। এক বা দুই পৃষ্ঠায়, সাদামাটা ফন্টে ও পরিষ্কার হেডিংসহ।';

export const CV_FORMAT_BLOCKS: Block[] = [
  {
    id: 'what-is-cv',
    h2: 'CV, resume ও biodata: তফাত কী',
    p: [
      'CV (curriculum vitae) হলো আপনার শিক্ষা, অভিজ্ঞতা ও দক্ষতার সংক্ষিপ্ত লিখিত বিবরণ। বাংলাদেশে চাকরির আবেদনে CV, resume ও biodata প্রায় একই অর্থে ব্যবহার হয়।',
      'তফাত মূলত গুরুত্বে। biodata-তে সাধারণত ব্যক্তিগত তথ্য (যেমন পিতার নাম, জন্মতারিখ) বেশি থাকে, আর CV-তে অভিজ্ঞতা ও দক্ষতা বেশি গুরুত্ব পায়। বিজ্ঞপ্তিতে কোনটি চাওয়া হয়েছে, আগে দেখে নিন।',
    ],
  },
  {
    id: 'section-order',
    h2: 'CV-তে কোন সেকশন কোন ক্রমে রাখবেন',
    p: ['নিচের ক্রমটি বেশিরভাগ চাকরির জন্য কাজ করে। যে অংশ আপনার সবচেয়ে শক্তিশালী, সেটি ওপরের দিকে রাখুন।'],
    ol: [
      'নাম, ফোন নম্বর, ইমেইল ও শহর। ইমেইল যেন পেশাদার হয়, যেমন নামের ওপর ভিত্তি করা।',
      'সংক্ষিপ্ত সারাংশ বা ক্যারিয়ার অবজেক্টিভ: দুই-তিন লাইনে আপনি কে ও কী পারেন।',
      'কাজের অভিজ্ঞতা: সাম্প্রতিক চাকরি আগে, প্রতিটিতে পদ, প্রতিষ্ঠান, সময়কাল ও মূল কাজ।',
      'শিক্ষাগত যোগ্যতা: সর্বোচ্চ ডিগ্রি আগে, সঙ্গে প্রতিষ্ঠান, সাল ও ফলাফল।',
      'দক্ষতা: টুল, সফটওয়্যার, ভাষা ও পেশাগত দক্ষতা আলাদা করে।',
      'প্রশিক্ষণ ও সার্টিফিকেট, যদি থাকে।',
      'রেফারেন্স: বিজ্ঞপ্তিতে চাইলে দিন, নইলে বাদ দিতে পারেন।',
    ],
  },
  {
    id: 'sample',
    h2: 'সিভির নমুনা কাঠামো (CV format sample)',
    p: ['নিচের টেবিলটি একটি সাধারণ কাঠামো। ডান কলামের লেখাগুলো শুধু উদাহরণ, নিজের তথ্য দিয়ে বদলে নিন।'],
    table: {
      head: ['সেকশন', 'কী লিখবেন', 'উদাহরণ'],
      rows: [
        ['যোগাযোগ', 'নাম, ফোন, ইমেইল, শহর', 'আপনার নাম | ০১XXXXXXXXX | নাম@ইমেইল | ঢাকা'],
        ['সারাংশ', '২-৩ লাইনে আপনার পরিচয় ও শক্তি', 'গ্রাহকসেবায় দুই বছরের অভিজ্ঞতাসম্পন্ন, দ্রুত সমস্যা সমাধানে দক্ষ।'],
        ['অভিজ্ঞতা', 'পদ, প্রতিষ্ঠান, সময়, মূল কাজ ও অর্জন', 'গ্রাহক প্রতিনিধি, ক প্রতিষ্ঠান, ২০২৩–২০২৫। প্রতিদিন গড়ে নির্দিষ্ট সংখ্যক গ্রাহকের অভিযোগ নিষ্পত্তি।'],
        ['শিক্ষা', 'ডিগ্রি, প্রতিষ্ঠান, সাল, ফলাফল', 'বিবিএ, খ বিশ্ববিদ্যালয়, ২০২২, সিজিপিএ ৩.৪০'],
        ['দক্ষতা', 'টুল, সফটওয়্যার, ভাষা', 'এমএস ওয়ার্ড, এক্সেল, বাংলা ও ইংরেজি'],
      ],
    },
  },
  {
    id: 'summary-examples',
    h2: 'সারাংশের উদাহরণ: ফ্রেশার ও অভিজ্ঞ',
    p: ['নিচের দুটি বাক্য শুধু ধরন বোঝানোর উদাহরণ। এগুলো হুবহু কপি না করে নিজের তথ্য দিয়ে লিখুন।'],
    ul: [
      'ফ্রেশার: নতুন গ্র্যাজুয়েট, হিসাববিজ্ঞানে পড়াশোনা শেষ করেছি। এক্সেলে দক্ষ এবং একটি ইন্টার্নশিপের অভিজ্ঞতা আছে। প্রথম চাকরিতে শেখা ও অবদান রাখতে আগ্রহী।',
      'অভিজ্ঞ: পাঁচ বছরের বিক্রয় অভিজ্ঞতাসম্পন্ন, নতুন গ্রাহক খুঁজে আনা ও দীর্ঘমেয়াদি সম্পর্ক তৈরিতে দক্ষ।',
    ],
  },
  {
    id: 'by-role',
    h2: 'পেশা অনুযায়ী কীসে জোর দেবেন',
    ul: [
      'ব্যাংক ও ফাইন্যান্স: শিক্ষা, সার্টিফিকেশন ও সংখ্যায় লেখা অর্জন।',
      'শিক্ষকতা: পড়ানোর বিষয় ও শ্রেণি, শিক্ষাগত যোগ্যতা ও প্রশিক্ষণ।',
      'নার্স ও মেডিকেল: ডিগ্রি, প্রশিক্ষণ, কোন বিভাগে কাজ করেছেন ও কত সময়।',
      'ইঞ্জিনিয়ারিং ও আইটি: টুল, প্রযুক্তি ও প্রজেক্টে আপনার নিজের ভূমিকা।',
      'সেলস ও মার্কেটিং: টার্গেট, ফলাফল ও যোগাযোগ দক্ষতা।',
      'বিদেশে চাকরি: ভাষা দক্ষতা, কাজের সময়কাল ও প্রশিক্ষণ পরিষ্কার করে।',
    ],
  },
  {
    id: 'fresher-vs-experienced',
    h2: 'ফ্রেশার ও অভিজ্ঞের ফরম্যাট কীভাবে আলাদা',
    table: {
      head: ['বিষয়', 'ফ্রেশার', 'অভিজ্ঞ'],
      rows: [
        ['সবচেয়ে আগে কী', 'শিক্ষা, প্রজেক্ট ও ইন্টার্নশিপ', 'সাম্প্রতিক চাকরির অভিজ্ঞতা'],
        ['দৈর্ঘ্য', 'সাধারণত এক পৃষ্ঠা', 'এক বা দুই পৃষ্ঠা'],
        ['সারাংশ', 'লক্ষ্য ও শক্তির দিক', 'অর্জন ও দায়িত্বের সারকথা'],
        ['দক্ষতা', 'পড়াশোনা ও কোর্স থেকে পাওয়া', 'কাজের উদাহরণসহ'],
      ],
    },
  },
  {
    id: 'layout',
    h2: 'ফন্ট, মার্জিন ও ছবি',
    ul: [
      'পরিষ্কার ফন্ট বেছে নিন, যেমন Arial, Calibri বা Times New Roman। সাধারণত ১০ থেকে ১২ সাইজ ঠিক থাকে।',
      'হেডিংগুলো একই স্টাইলে রাখুন, যাতে চোখ বুলিয়েই সেকশন চেনা যায়।',
      'চারপাশে যথেষ্ট ফাঁকা জায়গা রাখুন। ঠাসাঠাসি সিভি পড়া কঠিন।',
      'ছবির বিষয়ে বিজ্ঞপ্তি অনুসরণ করুন। ছবি চাইলে পরিষ্কার, পেশাদার ছবি দিন; না চাইলে না দেওয়াই ভালো।',
      'পুরো সিভিতে একই তারিখ-ফরম্যাট ও একই বুলেট স্টাইল ব্যবহার করুন।',
    ],
  },
  {
    id: 'design',
    h2: 'CV design: কেমন ডিজাইন বেছে নেবেন',
    p: [
      'ভালো CV design মানে রং বা ছবির সাজসজ্জা নয়, বরং পাঠকের চোখ দ্রুত নাম, পদ ও অভিজ্ঞতায় পৌঁছানো। দুই ধরনের ডিজাইন সাধারণত কাজে লাগে: সাদামাটা এক-কলামের ডিজাইন এবং রং ও সাইডবারওয়ালা ডিজাইনড লেআউট।',
      'অনলাইন পোর্টালে আপলোড করতে হলে সাদামাটা, এক-কলামের ডিজাইন নিরাপদ (ওপরের ATS অংশ দেখুন)। ইমেইলে বা সরাসরি যেখানে মানুষ সিভি পড়বেন, সেখানে পরিষ্কার ডিজাইনড লেআউটও চলে, তবে লেখা পড়া কঠিন হয়ে গেলে ডিজাইন বাদ দিন।',
      'নিচে আমাদের বাস্তব Word টেমপ্লেটের প্রিভিউ আছে। ছবিতে ক্লিক করলে টেমপ্লেটের পাতায় যাবেন। ডিজাইন বাছাইয়ের আগে বিল্ডারে ফ্রি ডিজাইনে নিজের তথ্য বসিয়ে দেখে নিতে পারেন।',
    ],
  },
  {
    id: 'ats',
    h2: 'ATS-ফ্রেন্ডলি ফরম্যাট কেন দরকার',
    p: [
      'অনেক নিয়োগ-পোর্টাল জমা পড়া সিভি ধরে রাখতে ATS (Applicant Tracking System) ব্যবহার করে। এই সফটওয়্যার সিভির লেখা পড়ে তথ্য আলাদা করে সাজায়, যাতে নিয়োগকারী প্রার্থী বাছাই করতে বা খুঁজে নিতে পারেন (SmartRecruiters-এর ব্যাখ্যা)। সব প্রতিষ্ঠান ATS ব্যবহার করে না, আর কোন বাংলাদেশি নিয়োগকর্তা কোন সফটওয়্যার ব্যবহার করেন, তার কোনো যাচাইকৃত তালিকা আমাদের কাছে নেই।',
      'Jobscan-এর লেখা (২৪ সেপ্টেম্বর ২০২৬) অনুযায়ী বেশিরভাগ ATS বহু-কলামের লেআউট ও জটিল নেস্টেড টেবিল পড়তে পারে না, যদিও কিছু আধুনিক ATS সাধারণ এক-সারির টেবিল সামলাতে পারে। SmartRecruiters-এর পার্সিং পাতায় টেবিল ও কলাম, হেডার ও ফুটার, এবং WordArt এড়াতে বলা হয়েছে (পাতায় তারিখ নেই; আমরা ২৯ নভেম্বর ২০২৬ পড়েছি)। Greenhouse-এর সহায়তা পাতা (১৯ আগস্ট ২০২৬-এ হালনাগাদ) বলে, তথ্য কম থাকলে, ফাইলের ধরন অপরিচিত হলে বা অচেনা অক্ষর থাকলে সিভি ঠিকমতো ইমপোর্ট না-ও হতে পারে।',
      'এই সূত্রগুলো বিদেশি সফটওয়্যার ও কর্মসংস্থান-সাইটের। এগুলো কোনো নির্দিষ্ট বাংলাদেশি নিয়োগকর্তার আচরণ প্রমাণ করে না, তবে অনলাইন পোর্টালে আপলোডের আগে এই সতর্কতা মেনে চলা নিরাপদ।',
      'তাই পোর্টালে আপলোড করলে সাদামাটা এক-কলাম লেআউট, স্পষ্ট হেডিং ও সাধারণ ফন্ট বেছে নিন। বিজ্ঞপ্তির দক্ষতার শব্দগুলো আপনার সিভিতে স্বাভাবিকভাবে ব্যবহার করুন।',
    ],
    source: { title: 'Jobscan: Can ATS read tables and columns? (Kelsey Purcell, 24 Sep 2026)', url: 'https://www.jobscan.co/blog/resume-tables-columns-ats/', checked: CV_FORMAT_CHECKED },
  },
  {
    id: 'word-or-pdf',
    h2: 'Word না PDF: কোনটি পাঠাবেন',
    ul: [
      'বিজ্ঞপ্তিতে যে ফরম্যাট চাওয়া হয়েছে, সেটিই পাঠান।',
      'কিছু না বলা থাকলে PDF নিরাপদ, কারণ ফোনে বা অন্য কম্পিউটারে খুললেও লেআউট বদলায় না।',
      'সিভি লেখা ও বদলানোর জন্য Word সবচেয়ে সুবিধাজনক। Word-এ লিখে PDF হিসেবে সেভ করে পাঠানো ভালো অভ্যাস।',
    ],
  },
  {
    id: 'pdf',
    h2: 'PDF সিভি: কীভাবে বানাবেন ও যাচাই করবেন',
    p: [
      'Word থেকে PDF বানানো সহজ। আগে ঠিক করুন কোন ফরম্যাট পাঠাতে হবে, কারণ পোর্টালভেদে পছন্দ আলাদা: SmartRecruiters সর্বোচ্চ পার্সিং-সুবিধার জন্য .docx পাঠাতে বলে, আর Greenhouse নেয় .doc, .docx, .pdf, .rtf ও .txt, অর্থাৎ PDF-ও চলে। তাই পোর্টাল বা বিজ্ঞপ্তিতে যে ফরম্যাট চাওয়া হয়েছে, সেটিই সবার আগে মানুন।',
      'আরেকটি সতর্কতা: SmartRecruiters স্পষ্ট বলেছে, PDF-কে ছবি হিসেবে স্ক্যান করবেন না। ছবি-বানানো PDF থেকে পোর্টাল লেখা পড়তে নাও পারে। PDF বানানোর ধাপ (Microsoft Word):',
    ],
    ol: [
      'Word-এ সিভি লিখে শেষ করুন।',
      'File > Save a Copy (বা Save As) বেছে নিন, তারপর Browse করে ফোল্ডার ঠিক করুন।',
      'ফাইলের ধরনের তালিকা থেকে PDF বেছে Save দিন।',
      'PDF খুলে সব পাতা দেখুন। লেখা মাউস দিয়ে সিলেক্ট করা যায় কি না পরীক্ষা করুন; না গেলে ফাইলটি আসলে ছবি।',
      'ফাইলের নাম রাখুন আপনার-নাম-পদ.pdf।',
    ],
    source: { title: 'Microsoft Support: Save or convert to PDF or XPS in Word (page updated 19 Nov 2026)', url: 'https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-word-d85416c5-7d77-4fd6-a216-6f4bf7c7c110', checked: CV_FORMAT_CHECKED },
  },
  {
    id: 'word',
    h2: 'Word সিভি: কোনটি ফ্রি, কোনটি পেইড',
    p: [
      'Word-এ সিভি রাখলে নিজে যখন-তখন বদলানো যায়। আমাদের এখানে বিকল্প তিনটি, সোজাসুজি।',
    ],
    ul: [
      'ফ্রি: সিভি বিল্ডারে ফর্ম পূরণ করে ফ্রি ডিজাইনে PDF নামানো যায়। প্রিমিয়াম ডিজাইনের জন্য Pro লাগে। বিল্ডারে সাধারণ, পরিষ্কার লেআউটের Word ডাউনলোডও আছে, তবে তাতে প্রতিটি ডিজাইনের পুরো আর্টওয়ার্ক থাকে না।',
      `পেইড: রেডি Word template, প্রতিটি ৳${P}। bKash বা Nagad-এ পেমেন্টের পর .docx ডাউনলোড করে নিজের তথ্য বসান। এগুলো আলাদা ডিজাইনের পূর্ণ টেমপ্লেট।`,
    ],
    // TODO(prompt-5): the free starter .docx goes here. Add a third bullet and a download link once the file is merged and served.
  },
  {
    id: 'language',
    h2: 'বাংলা না ইংরেজি সিভি',
    p: [
      'বিজ্ঞপ্তি যে ভাষায় সিভি চায়, সেই ভাষায় লিখুন। কোনো ভাষা উল্লেখ না থাকলে যে ভাষায় আপনি সবচেয়ে স্পষ্ট ও ভুলহীন লিখতে পারেন, সেটি বেছে নিন। বানান ও ব্যাকরণের ভুল সিভির ছাপ নষ্ট করে।',
    ],
  },
  {
    id: 'mistakes',
    h2: 'সিভির সাধারণ ভুল',
    ul: [
      'বানান বা তারিখের ভুল।',
      'অপ্রয়োজনীয় তথ্য, যা পদের সঙ্গে সম্পর্কহীন।',
      'দায়িত্ব লিখেছেন কিন্তু অর্জন লেখেননি।',
      'সিভির এক অংশে এক স্টাইল, অন্য অংশে আরেক স্টাইল।',
      'অতিরিক্ত দীর্ঘ সিভি, যেখানে মূল তথ্য হারিয়ে যায়।',
      'ভুল বা অসম্পূর্ণ যোগাযোগের তথ্য।',
    ],
  },
  {
    id: 'checklist',
    h2: 'জমা দেওয়ার আগে চেকলিস্ট',
    ol: [
      'বিজ্ঞপ্তি আবার পড়ে দেখুন, কোন তথ্য ও ফরম্যাট চাওয়া হয়েছে।',
      'নাম, ফোন নম্বর ও ইমেইল ঠিক আছে কি না যাচাই করুন।',
      'বানান ও তারিখ একবার পড়ে মিলিয়ে নিন।',
      'সব হেডিং ও বুলেটের স্টাইল একই আছে কি না দেখুন।',
      'ফাইলের নাম পরিষ্কার রাখুন, যেমন আপনার-নাম-CV।',
      'পাঠানোর আগে PDF খুলে লেআউট ঠিক আছে কি না নিশ্চিত হোন।',
    ],
  },
  {
    id: 'where',
    h2: 'রেডি ফরম্যাট কোথায় পাবেন',
    p: [
      `নিজে ফর্ম পূরণ করে সিভি বানাতে চাইলে HereWeGrow-এর ফ্রি সিভি বিল্ডার ব্যবহার করতে পারেন (ফ্রি ডিজাইন আছে, কিছু ডিজাইন Pro-তে)। Word-এ এডিট করার মতো তৈরি ফরম্যাট চাইলে প্রতিটি Word CV template ৳${P}। bKash বা Nagad-এ পেমেন্টের পর .docx ফাইল ডাউনলোড করে নিজের তথ্য বসান।`,
    ],
  },
];

export const CV_FORMAT_FAQ_HEADING = 'সচরাচর প্রশ্ন';
export const CV_FORMAT_FAQ: Faq[] = [
  { q: 'সিভির সঠিক ফরম্যাট কোনটি?', a: 'একটিমাত্র সঠিক ফরম্যাট নেই। তবে যোগাযোগ, সারাংশ, অভিজ্ঞতা, শিক্ষা ও দক্ষতার ক্রম, পরিষ্কার হেডিং ও সাধারণ ফন্ট বেশিরভাগ চাকরির জন্য নিরাপদ।' },
  { q: 'সিভি কত পৃষ্ঠার হওয়া উচিত?', a: 'ফ্রেশারদের জন্য সাধারণত এক পৃষ্ঠা যথেষ্ট। অনেক বছরের অভিজ্ঞতা থাকলে দুই পৃষ্ঠা চলে। জরুরি তথ্য আগে রাখুন, যাতে প্রথম পৃষ্ঠাতেই বোঝা যায় আপনি কে।' },
  { q: 'সিভিতে কি ছবি দেব?', a: 'বিজ্ঞপ্তিতে যা চাওয়া হয়েছে, সেটি অনুসরণ করুন। ছবি চাইলে পরিষ্কার, পেশাদার ছবি দিন। কিছু না বলা থাকলে ছবি ছাড়া ফরম্যাটও গ্রহণযোগ্য।' },
  { q: 'Curriculum vitae format ফ্রিতে পাওয়া যাবে?', a: `ফ্রি সিভি বিল্ডারে ফর্ম পূরণ করে ফ্রি ডিজাইনে PDF বানাতে পারেন। Word-এ এডিটযোগ্য তৈরি ফরম্যাট প্রতিটি ৳${P}।` },
  { q: 'Curriculum vitae sample PDF কোথায় পাব?', a: 'এই পেজে ফ্রেশার ও অভিজ্ঞ প্রার্থীর দুটি পূর্ণ নমুনা সিভি আছে, সব তথ্য কাল্পনিক। আলাদা PDF নমুনা ফাইল ডাউনলোডের জন্য এখনো দেওয়া হয়নি। নমুনা দেখে নিজের তথ্য বসিয়ে সিভি বিল্ডারে PDF বানিয়ে নিতে পারেন।' },
  { q: 'CV design কেমন হওয়া উচিত?', a: 'অনলাইন পোর্টালের জন্য সাদামাটা, এক-কলামের লেআউট নিরাপদ। যেখানে মানুষ সরাসরি সিভি পড়বেন, সেখানে পরিষ্কার ডিজাইনড লেআউটও চলে। শর্ত একটাই: লেখা যেন সহজে পড়া যায়।' },
  { q: 'Word থেকে PDF করব কীভাবে?', a: 'Word-এ ফাইলটি খুলে "Save as" বা "Export" থেকে PDF বেছে নিন। পাঠানোর আগে PDF খুলে লেআউট ঠিক আছে কি না দেখে নিন।' },
];

/** Where this page sends readers: related guides, role pages and tools. Plain internal links. */
export const CV_FORMAT_LINKS_HEADING = 'আরও পড়ুন ও ফরম্যাট বেছে নিন';
export const CV_FORMAT_LINKS: { href: string; text: string }[] = [
  { href: '/templates', text: `সব Word CV template (প্রতিটি ৳${P})` },
  { href: '/builder', text: 'ফ্রি সিভি বিল্ডার' },
  { href: '/guides/ats-friendly-cv', text: 'ATS-ফ্রেন্ডলি সিভি কী, আর কেন দরকার' },
  { href: '/guides/common-cv-mistakes', text: 'সিভির ১০টি সাধারণ ভুল' },
  { href: '/guides/fresher-cv-guide', text: 'ফ্রেশারের সিভি কীভাবে লিখবেন' },
  { href: '/guides/bank-job-cv-format', text: 'ব্যাংক জবের সিভি ফরম্যাট' },
  { href: '/cv-for-gulf-jobs', text: 'গাল্ফ চাকরির সিভি ফরম্যাট' },
  { href: '/europass-cv', text: 'Europass-ধাঁচের সিভি' },
  { href: '/biodata', text: 'বায়োডাটা বানান' },
  { href: '/tools/cv-checker', text: 'সিভি চেকার' },
  { href: '/tools/professional-cv-photo', text: 'সিভির জন্য পেশাদার ছবি বানান (ফ্রি টুল)' },
];

export const CV_FORMAT_NOTE = 'এই পেজের পরামর্শ সাধারণ নির্দেশনা। নির্দিষ্ট চাকরির বিজ্ঞপ্তিতে যা চাওয়া হয়েছে, সেটিই সবার আগে অনুসরণ করুন।';

// ---------------------------------------------------------------------------------------------
// Worked samples, template gallery, table of contents and sources (added 2026-11-29).
// ---------------------------------------------------------------------------------------------

export interface SampleEntry { head?: string; lines?: string[]; bullets?: string[] }
export interface SampleCv {
  id: string;
  /** The section this sample is shown after. */
  after: string;
  h2: string;
  intro: string;
  /** Visible label: every name, number and date in a sample is invented. */
  label: string;
  name: string;
  contact: string;
  sections: { h: string; entries: SampleEntry[] }[];
}

const SAMPLE_LABEL = 'নমুনা সিভি: নাম, নম্বর, প্রতিষ্ঠান ও সংখ্যা সবই কাল্পনিক। হুবহু কপি না করে নিজের সত্যি তথ্য বসান।';

export const CV_FORMAT_SAMPLES: SampleCv[] = [
  {
    id: 'sample-fresher',
    after: 'sample',
    h2: 'পূর্ণ নমুনা ১: ফ্রেশারের এক পৃষ্ঠার সিভি',
    intro: 'অভিজ্ঞতা কম থাকলে শিক্ষা আগে আসে, তারপর ইন্টার্নশিপ, প্রজেক্ট ও দক্ষতা। নিচের নমুনাটি এক পৃষ্ঠায় ধরে এমন আকারের।',
    label: SAMPLE_LABEL,
    name: 'তানভীর আহমেদ (নমুনা নাম)',
    contact: '০১XXXXXXXXX | tanvir.sample@example.com | ঢাকা',
    sections: [
      { h: 'সারাংশ', entries: [{ lines: ['বিবিএ (মার্কেটিং) গ্র্যাজুয়েট। দুই মাসের সেলস ইন্টার্নশিপ ও একটি ক্লাব-ক্যাম্পেইনের অভিজ্ঞতা আছে। এক্সেলে ডেটা গুছিয়ে রিপোর্ট বানাতে পারি। সেলস এক্সিকিউটিভ পদে আবেদন করছি।'] }] },
      { h: 'শিক্ষা', entries: [
        { head: 'বিবিএ (মার্কেটিং), নমুনা বিশ্ববিদ্যালয়, ২০২৫', lines: ['সিজিপিএ ৩.৪২ (৪.০০-এর মধ্যে)'] },
        { head: 'এইচএসসি (ব্যবসায় শিক্ষা), নমুনা কলেজ, ২০২০', lines: ['জিপিএ ৪.৮০ (৫.০০-এর মধ্যে)'] },
      ] },
      { h: 'ইন্টার্নশিপ ও প্রজেক্ট', entries: [
        { head: 'সেলস ইন্টার্ন, ক নমুনা ট্রেডার্স, জুন–জুলাই ২০২৫', bullets: ['গ্রাহকদের ফোন করে পণ্যের তথ্য জানিয়েছি ও ফলোআপ নোট রেখেছি।', 'সপ্তাহের বিক্রির হিসাব এক্সেলে তুলে ম্যানেজারকে সারসংক্ষেপ দিয়েছি।'] },
        { head: 'ক্যাম্পেইন প্রজেক্ট, বিশ্ববিদ্যালয় মার্কেটিং ক্লাব, ২০২৪', bullets: ['পাঁচজনের দলে একটি ফেসবুক পেজের পোস্ট-পরিকল্পনা সামলেছি।', 'শেষে ফলাফল নিয়ে পাঁচ মিনিটের উপস্থাপনা দিয়েছি।'] },
      ] },
      { h: 'দক্ষতা', entries: [{ bullets: ['এমএস ওয়ার্ড, এক্সেল (ফিল্টার, পিভট টেবিল), পাওয়ারপয়েন্ট', 'গ্রাহকের সঙ্গে ফোন ও মেসেজে যোগাযোগ', 'ভাষা: বাংলা (মাতৃভাষা), ইংরেজি (কর্মক্ষম)'] }] },
      { h: 'প্রশিক্ষণ', entries: [{ lines: ['এক্সেল বেসিক কোর্স, নমুনা প্রশিক্ষণ কেন্দ্র, ২০২৪ (৩০ ঘণ্টা)'] }] },
    ],
  },
  {
    id: 'sample-experienced',
    after: 'fresher-vs-experienced',
    h2: 'পূর্ণ নমুনা ২: অভিজ্ঞ প্রার্থীর সিভি',
    intro: 'অভিজ্ঞতা থাকলে সাম্প্রতিক চাকরি আগে আসে, আর প্রতিটি বুলেটে কাজের সঙ্গে ফল থাকে। এই নমুনাটি এক বা দুই পৃষ্ঠায় ধরে।',
    label: SAMPLE_LABEL,
    name: 'ফারহানা ইসলাম (নমুনা নাম)',
    contact: '০১XXXXXXXXX | farhana.sample@example.com | চট্টগ্রাম',
    sections: [
      { h: 'সারাংশ', entries: [{ lines: ['হিসাব ও আর্থিক প্রতিবেদনে ছয় বছরের অভিজ্ঞতাসম্পন্ন অ্যাকাউন্টস কর্মকর্তা। মাসিক ক্লোজিং, ব্যাংক রিকনসিলিয়েশন ও ভ্যাট রিটার্নে দক্ষ। সিনিয়র অ্যাকাউন্টস এক্সিকিউটিভ পদে আবেদন করছি।'] }] },
      { h: 'কাজের অভিজ্ঞতা', entries: [
        { head: 'অ্যাকাউন্টস অফিসার, খ নমুনা লিমিটেড, ঢাকা (জানুয়ারি ২০২২ থেকে বর্তমান)', bullets: ['মাসিক হিসাব ক্লোজিং পাঁচ কার্যদিবসের মধ্যে শেষ করার দায়িত্বে ছিলাম।', 'ব্যাংক রিকনসিলিয়েশন নিয়মিত করে অমিল এন্ট্রি দ্রুত ধরেছি।', 'দুইজন জুনিয়র সহকর্মীকে এন্ট্রি যাচাইয়ের নিয়ম শিখিয়েছি।'] },
        { head: 'অ্যাকাউন্টস এক্সিকিউটিভ, গ নমুনা ট্রেডিং, চট্টগ্রাম (মার্চ ২০১৯ থেকে ডিসেম্বর ২০২১)', bullets: ['সরবরাহকারীর বিল যাচাই ও পেমেন্টের তালিকা তৈরি করেছি।', 'স্টক ও বিক্রির তথ্য মিলিয়ে ত্রৈমাসিক প্রতিবেদন বানিয়েছি।'] },
      ] },
      { h: 'শিক্ষা', entries: [
        { head: 'এমবিএস (হিসাববিজ্ঞান), নমুনা বিশ্ববিদ্যালয়, ২০১৮', lines: ['প্রথম শ্রেণি'] },
        { head: 'বিবিএস (হিসাববিজ্ঞান), নমুনা কলেজ, ২০১৬', lines: ['দ্বিতীয় শ্রেণি'] },
      ] },
      { h: 'দক্ষতা', entries: [{ bullets: ['Tally ও এক্সেল (VLOOKUP, পিভট টেবিল)', 'ভ্যাট ও আয়করের মাসিক রিটার্ন প্রস্তুতি', 'ভাষা: বাংলা (মাতৃভাষা), ইংরেজি (ভালো)'] }] },
      { h: 'প্রশিক্ষণ', entries: [{ lines: ['ভ্যাট আইন ও রিটার্ন প্রশিক্ষণ, নমুনা ইনস্টিটিউট, ২০২৩ (দুই দিন)'] }] },
    ],
  },
];

/** Templates shown in the preview gallery. Every id must be a real, listed, indexable template with a thumb.webp (tested). */
export const CV_FORMAT_GALLERY_IDS: readonly string[] = [
  'ats-minimalist-single-page',
  'ats-graduate-standard-single-page',
  'ats-classic-professional-2page',
  'ats-banking-standard-bd',
  'creative-graduate-standard-bd',
  'creative-corporate-bd-standard',
  'creative-minimal-modern-1page',
  'creative-academic-teacher-2page',
];

export interface GalleryItem { id: string; href: string; img: string; alt: string; label: string; kind: string }

const pagesBn = (n: number) => `${bn(n)} পৃষ্ঠা`;
export function cvFormatGallery(): GalleryItem[] {
  return CV_FORMAT_GALLERY_IDS.map((id) => {
    const t = findTemplate(id) as Template;
    return {
      id,
      href: `/templates/${id}`,
      img: `/templates/${id}/thumb.webp`,
      alt: `${t.title.en}: Word CV template preview`,
      label: t.title.bn,
      kind: `${t.style === 'ats' ? 'সাদামাটা (ATS ধাঁচ)' : 'ডিজাইনড'}, ${pagesBn(t.pages)}`,
    };
  });
}

export const CV_FORMAT_GALLERY_HEADING = 'টেমপ্লেট প্রিভিউ';
export const CV_FORMAT_GALLERY_NOTE = `প্রতিটি Word template ৳${P}। ছবিতে ক্লিক করে পুরো প্রিভিউ ও বিস্তারিত দেখুন।`;
export const CV_FORMAT_GALLERY_LINKS: { href: string; text: string }[] = [
  { href: '/templates', text: 'সব Word CV template দেখুন' },
  { href: '/templates/category/fresher-cv', text: 'ফ্রেশার সিভি টেমপ্লেট' },
  { href: '/templates/category/bank-job-cv', text: 'ব্যাংক জব সিভি টেমপ্লেট' },
  { href: '/templates/category/teacher-cv', text: 'শিক্ষক সিভি টেমপ্লেট' },
  { href: '/builder', text: 'ফ্রি বিল্ডারে ডিজাইন চেষ্টা করুন' },
];

/** Pointer to the how-to-write article (section-by-section writing lives there, not here). */
export const CV_FORMAT_WRITE_LINK = {
  lead: 'প্রতিটি সেকশন ধাপে ধাপে কীভাবে লিখবেন, তা আছে আলাদা গাইডে:',
  href: '/blog/cv-lekhar-niyom',
  text: 'সিভি লেখার নিয়ম: ৮ ধাপের গাইড',
};

export const CV_FORMAT_TOC_HEADING = 'এই পেজে যা আছে';

/** Outside pages the ATS and PDF statements rest on. The date is the page's own date when it shows one. */
export const CV_FORMAT_SOURCES: Source[] = [
  { title: 'Jobscan: Can ATS read tables and columns? (24 Sep 2026)', url: 'https://www.jobscan.co/blog/resume-tables-columns-ats/' },
  { title: 'SmartRecruiters: Resume parsing (page shows no date; read 29 Nov 2026)', url: 'https://prod-syd.smartrecruiters.com/resources/glossary/resume-parsing' },
  { title: 'Greenhouse Support: Why didn’t the candidate’s resume import correctly? (updated 19 Aug 2026)', url: 'https://support.greenhouse.io/hc/en-us/articles/200721684-Why-didn-t-the-candidate-s-resume-import-correctly' },
  { title: 'Greenhouse Support: Supported formats for resumes and cover letters (updated 19 Aug 2026)', url: 'https://support.greenhouse.io/hc/en-us/articles/360052218132-Supported-file-types-for-resumes-and-cover-letters' },
  { title: 'Microsoft Support: Save or convert to PDF or XPS in Word (updated 19 Nov 2026)', url: 'https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-word-d85416c5-7d77-4fd6-a216-6f4bf7c7c110' },
];

export type CvFormatSection =
  | { kind: 'block'; b: Block; gallery: boolean }
  | { kind: 'sample'; s: SampleCv };

/** The page body in display order: blocks, each followed by the samples that go after it. The gallery sits inside #design. */
export function cvFormatSections(): CvFormatSection[] {
  return CV_FORMAT_BLOCKS.flatMap((b): CvFormatSection[] => [
    { kind: 'block', b, gallery: b.id === 'design' },
    ...CV_FORMAT_SAMPLES.filter((s) => s.after === b.id).map((s): CvFormatSection => ({ kind: 'sample', s })),
  ]);
}

/** Table of contents entries: every section, then the FAQ and the links. */
export function cvFormatToc(): { id: string; text: string }[] {
  return [
    ...cvFormatSections().map((x) => (x.kind === 'block' ? { id: x.b.id, text: x.b.h2 } : { id: x.s.id, text: x.s.h2 })),
    { id: 'faq', text: CV_FORMAT_FAQ_HEADING },
    { id: 'more', text: CV_FORMAT_LINKS_HEADING },
  ];
}
