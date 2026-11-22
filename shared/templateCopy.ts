// Real body copy for every template page. One builder feeds both the pre-rendered HTML (scripts/seo.ts)
// and the React page (src/pages/Templates.tsx), so crawlers and visitors read the same text.
// Everything here comes from template data or from short, general sentences. No invented facts.
import { TEMPLATES, SECTORS, SINGLE_TEMPLATE_PRICE, CATEGORIES, hubOf, type Template } from './templates';
import { isRetired, isVariant, shouldIndex } from './templateTiers';
import { categoryPath, liveCategoryFor } from './categoryCopy';

const DIGITS = '০১২৩৪৫৬৭৮৯';
export const bnNum = (n: number | string): string => String(n).replace(/\d/g, (d) => DIGITS[Number(d)]);
export const bnPrice = (): string => `৳${bnNum(SINGLE_TEMPLATE_PRICE)}`;

interface Copy {
  /** Two variants; one is chosen per template by hashing its id. */
  forWhom: [string, string];
  tips: [string, string];
  who: { q: string; a: string };
}

/** Sector copy. Keys are sector ids. */
const SECTOR_COPY: Record<string, Copy> = {
  fresher: {
    forWhom: [
      'নতুন গ্র্যাজুয়েট বা শিক্ষার্থী, যার চাকরির অভিজ্ঞতা কম বা নেই। পড়াশোনা, প্রজেক্ট, ইন্টার্নশিপ ও দক্ষতা সাজিয়ে দেখানোর জন্য ফরম্যাটটি সুবিধাজনক।',
      'প্রথম চাকরির আবেদন করছেন এমন প্রার্থীর জন্য। অভিজ্ঞতার ঘর ফাঁকা থাকলে শিক্ষা, কোর্স ও অ্যাক্টিভিটি দিয়ে সিভি ভরাট করা যায়।',
    ],
    tips: [
      'ফ্রেশারদের সিভি সাধারণত এক পৃষ্ঠায় গুছিয়ে রাখাই ভালো। শিক্ষা, প্রজেক্ট ও দক্ষতা আগে লিখুন।',
      'অভিজ্ঞতা না থাকলে ইন্টার্নশিপ, ক্লাব বা স্বেচ্ছাসেবার কাজ আলাদা সেকশনে যোগ করতে পারেন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'এটি মূলত ফ্রেশার ও নতুন প্রার্থীদের কথা ভেবে সাজানো। তবে ফরম্যাটটি Word-এ এডিট করা যায়, তাই প্রয়োজনে সেকশন বাড়িয়ে অভিজ্ঞ প্রার্থীও ব্যবহার করতে পারেন।',
    },
  },
  banking: {
    forWhom: [
      'ব্যাংক, এনবিএফআই বা ফাইন্যান্স-সংক্রান্ত পদে আবেদনকারীর জন্য। পরিচ্ছন্ন ও গোছানো লেআউটে শিক্ষা ও অভিজ্ঞতা স্পষ্টভাবে দেখানো যায়।',
      'অ্যাকাউন্টস, ফাইন্যান্স বা ব্যাংকিং ক্যারিয়ারে যাঁরা আছেন বা যেতে চান, তাঁদের জন্য। সংখ্যা ও অর্জন সাজিয়ে লেখার মতো জায়গা রাখা হয়েছে।',
    ],
    tips: [
      'দায়িত্বের বর্ণনার পাশাপাশি সম্ভব হলে অর্জনের সংখ্যা লিখুন, যেমন সামলানো কাজের পরিমাণ।',
      'শিক্ষাগত যোগ্যতা ও সার্টিফিকেশন আলাদা করে দেখালে নিয়োগকারীর চোখে পড়া সহজ হয়।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'ফ্রেশার ও অভিজ্ঞ, দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। অভিজ্ঞরা কাজের ইতিহাস বিস্তারিত লিখবেন, ফ্রেশাররা শিক্ষা ও দক্ষতা সামনে রাখবেন।',
    },
  },
  corporate: {
    forWhom: [
      'কর্পোরেট অফিসে প্রশাসন, এইচআর, অপারেশন বা ম্যানেজমেন্ট ধরনের পদে আবেদনকারীর জন্য। সাদামাটা ও পেশাদার চেহারার সিভি ফরম্যাট।',
      'বিভিন্ন কোম্পানির অফিস-ভিত্তিক চাকরিতে আবেদন করলে ফরম্যাটটি কাজে লাগবে। অভিজ্ঞতা ও দক্ষতা গুছিয়ে দেখানোর কাঠামো দেওয়া আছে।',
    ],
    tips: [
      'সাম্প্রতিক চাকরি আগে লিখুন এবং প্রতিটি পদে কী দায়িত্ব সামলেছেন তা সংক্ষেপে লিখুন।',
      'পদের বিজ্ঞপ্তিতে যে দক্ষতার কথা আছে, সেটি আপনার সিভির দক্ষতা অংশে মিলিয়ে নিন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। অভিজ্ঞরা কাজের ইতিহাস পূর্ণ করবেন, ফ্রেশাররা অভিজ্ঞতার অংশে ইন্টার্নশিপ বা প্রজেক্ট রাখতে পারেন।',
    },
  },
  teaching: {
    forWhom: [
      'স্কুল, কলেজ বা কোচিং-এ শিক্ষকতার পদে আবেদনকারীর জন্য। শিক্ষাগত যোগ্যতা, পড়ানোর অভিজ্ঞতা ও বিষয় সাজিয়ে লেখার জায়গা রাখা আছে।',
      'শিক্ষক বা শিক্ষকতায় আগ্রহী প্রার্থীর জন্য। যে বিষয় ও স্তরে পড়াতে পারেন, তা স্পষ্টভাবে দেখানো যায়।',
    ],
    tips: [
      'কোন বিষয় ও কোন শ্রেণিতে পড়িয়েছেন, তা আলাদা করে লিখুন।',
      'প্রশিক্ষণ বা শিক্ষাবিষয়ক কোর্স থাকলে শিক্ষা অংশের নিচে যোগ করুন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'নতুন শিক্ষক ও অভিজ্ঞ শিক্ষক দুজনেই ব্যবহার করতে পারেন। নতুনরা শিক্ষা ও প্রশিক্ষণ আগে রাখবেন, অভিজ্ঞরা পড়ানোর ইতিহাস বিস্তারিত লিখবেন।',
    },
  },
  engineering: {
    forWhom: [
      'ইঞ্জিনিয়ারিং বা আইটি পদে আবেদনকারীর জন্য। প্রযুক্তিগত দক্ষতা, প্রজেক্ট ও অভিজ্ঞতা গুছিয়ে দেখানোর কাঠামো আছে।',
      'সফটওয়্যার, নেটওয়ার্ক বা প্রকৌশল ক্ষেত্রে কাজ করেন বা করতে চান, এমন প্রার্থীর জন্য। টুল ও দক্ষতার তালিকা রাখার সুবিধা আছে।',
    ],
    tips: [
      'ব্যবহৃত টুল, ভাষা বা সফটওয়্যারের নাম দক্ষতা অংশে আলাদা করে লিখুন।',
      'প্রজেক্টে আপনার নিজের ভূমিকা কী ছিল, তা এক-দুই লাইনে লিখলে সিভি শক্তিশালী হয়।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'ফ্রেশার ও অভিজ্ঞ দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। ফ্রেশাররা একাডেমিক প্রজেক্ট দেখাবেন, অভিজ্ঞরা কাজের প্রজেক্ট ও দায়িত্ব দেখাবেন।',
    },
  },
  sales: {
    forWhom: [
      'সেলস, মার্কেটিং বা ব্যবসা-উন্নয়ন ধরনের পদে আবেদনকারীর জন্য। অর্জন ও ফলাফল তুলে ধরার জায়গা রাখা হয়েছে।',
      'গ্রাহক, বাজার বা বিক্রয় নিয়ে কাজ করেন বা করতে চান, এমন প্রার্থীর জন্য ফরম্যাটটি উপযোগী।',
    ],
    tips: [
      'টার্গেট, বিক্রয় বা প্রচারণার ফলাফল সংখ্যায় লেখা সম্ভব হলে অবশ্যই লিখুন।',
      'যোগাযোগ ও নেগোসিয়েশনের মতো দক্ষতা কাজের উদাহরণসহ লিখলে বিশ্বাসযোগ্য হয়।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। ফ্রেশাররা ইন্টার্নশিপ বা ক্যাম্পাসের কাজ উল্লেখ করবেন, অভিজ্ঞরা অর্জন ও ফলাফল দেখাবেন।',
    },
  },
  medical: {
    forWhom: [
      'নার্স, ডাক্তার বা স্বাস্থ্যসেবা-সংক্রান্ত পদে আবেদনকারীর জন্য। শিক্ষা, রেজিস্ট্রেশন ও কাজের অভিজ্ঞতা সাজিয়ে লেখার কাঠামো আছে।',
      'হাসপাতাল, ক্লিনিক বা স্বাস্থ্যখাতে চাকরির আবেদনের জন্য। প্রশিক্ষণ ও কর্মস্থলের তথ্য পরিষ্কারভাবে দেখানো যায়।',
    ],
    tips: [
      'কোন বিভাগে বা ওয়ার্ডে কাজ করেছেন এবং কত সময়, তা পরিষ্কার করে লিখুন।',
      'প্রশিক্ষণ, ডিগ্রি ও রেজিস্ট্রেশনের তথ্য শিক্ষা অংশে আলাদা লাইনে দিন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'নতুন ও অভিজ্ঞ দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। নতুনরা শিক্ষা ও প্রশিক্ষণ আগে রাখবেন, অভিজ্ঞরা কর্মস্থলের ইতিহাস বিস্তারিত লিখবেন।',
    },
  },
  other: {
    forWhom: [
      'বিভিন্ন পেশা ও চাকরির জন্য সাধারণ ব্যবহারের ফরম্যাট। নিজের পেশা অনুযায়ী লেখা বদলে নিলেই হবে।',
      'নির্দিষ্ট ক্ষেত্রে না পড়লেও যাঁরা একটি গোছানো সিভি চান, তাঁদের জন্য। সব অংশ Word-এ বদলানো যায়।',
    ],
    tips: [
      'পদের বিজ্ঞপ্তি দেখে সিভির দক্ষতা অংশ সেই অনুযায়ী মিলিয়ে নিন।',
      'যে তথ্য পদের সঙ্গে সম্পর্কহীন, তা বাদ দিয়ে সিভি ছোট ও পরিষ্কার রাখুন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'ফ্রেশার ও অভিজ্ঞ দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। নিজের অভিজ্ঞতা অনুযায়ী সেকশন বাড়ানো বা কমানো যাবে।',
    },
  },
};

/** Hub copy for pages whose sector is "other" but whose purpose is narrower. Wins over the sector copy. */
const HUB_COPY: Record<string, Copy & { noun: string }> = {
  'marriage-biodata': {
    noun: 'বায়োডাটা',
    forWhom: [
      'বিয়ের প্রস্তাবের জন্য নিজের বা পরিবারের সদস্যের বায়োডাটা তৈরি করতে চাইলে। ব্যক্তিগত, পারিবারিক ও শিক্ষাগত তথ্য সাজিয়ে লেখার কাঠামো আছে।',
      'বিয়ের বায়োডাটা গুছিয়ে পাঠাতে চাইলে এই ফরম্যাট ব্যবহার করতে পারেন। সব তথ্য Word-এ নিজের মতো বসানো যায়।',
    ],
    tips: [
      'শুধু সেই তথ্যই দিন, যা আপনি প্রকাশ করতে স্বচ্ছন্দ। প্রয়োজন নেই এমন ঘর মুছে ফেলা যায়।',
      'শিক্ষা, পেশা ও পরিবারের তথ্য আলাদা ভাগে লিখলে পড়তে সুবিধা হয়।',
    ],
    who: {
      q: 'এটি কি চাকরির সিভি হিসেবে ব্যবহার করা যাবে?',
      a: 'না, এটি বিয়ের বায়োডাটার জন্য সাজানো। চাকরির আবেদনের জন্য সিভি ফরম্যাট বা চাকরির বায়োডাটা ফরম্যাট বেছে নিন।',
    },
  },
  'job-biodata': {
    noun: 'বায়োডাটা',
    forWhom: [
      'চাকরির আবেদনে বায়োডাটা চাওয়া হলে। ব্যক্তিগত তথ্য, শিক্ষা ও অভিজ্ঞতা সারণির মতো গুছিয়ে লেখা যায়।',
      'যে প্রতিষ্ঠান সিভির বদলে বায়োডাটা চায়, সেখানে আবেদনের জন্য ফরম্যাটটি কাজে লাগবে।',
    ],
    tips: [
      'বিজ্ঞপ্তিতে যে তথ্য চাওয়া হয়েছে, শুধু সেগুলো ঠিকমতো পূরণ করুন।',
      'শিক্ষাগত যোগ্যতার সাল ও ফলাফল ভুল ছাড়া লিখুন, কারণ বায়োডাটায় এগুলো সরাসরি যাচাই হয়।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। অভিজ্ঞতার ঘর প্রয়োজন না হলে ফাঁকা না রেখে মুছে দিতে পারেন।',
    },
  },
  gulf: {
    noun: 'সিভি',
    forWhom: [
      'বিদেশে, বিশেষ করে গালফ অঞ্চলের চাকরির আবেদনের জন্য সিভি তৈরি করতে চাইলে। বিদেশি নিয়োগকারীর পড়ার উপযোগী সরল কাঠামো রাখা হয়েছে।',
      'গালফ জবের জন্য আবেদন করছেন এমন প্রার্থীর জন্য। কাজের অভিজ্ঞতা ও দক্ষতা সংক্ষেপে সাজিয়ে লেখা যায়।',
    ],
    tips: [
      'প্রতিটি কাজের সময়কাল ও কাজের ধরন পরিষ্কার লিখুন।',
      'ভাষা দক্ষতা ও প্রয়োজনীয় প্রশিক্ষণ থাকলে আলাদা করে দেখান।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। অভিজ্ঞরা কাজের ইতিহাস বিস্তারিত লিখবেন, নতুনরা প্রশিক্ষণ ও দক্ষতা সামনে রাখবেন।',
    },
  },
  'graphic-designer': {
    noun: 'সিভি',
    forWhom: [
      'গ্রাফিক ডিজাইনার বা ক্রিয়েটিভ পদে আবেদনকারীর জন্য। ডিজাইন-নির্ভর লেআউটে নিজের দক্ষতা ও কাজ তুলে ধরা যায়।',
      'ডিজাইনের কাজে আগ্রহী প্রার্থীর জন্য। সিভিতে চেহারাও যে একটি বার্তা দেয়, তা মাথায় রেখে সাজানো।',
    ],
    tips: [
      'ব্যবহৃত ডিজাইন সফটওয়্যারের নাম দক্ষতা অংশে লিখুন।',
      'সম্ভব হলে পোর্টফোলিওর লিংক যোগ করুন।',
    ],
    who: {
      q: 'ফ্রেশার না অভিজ্ঞ, কে এই ফরম্যাট ব্যবহার করবেন?',
      a: 'দুই ধরনের প্রার্থীই ব্যবহার করতে পারেন। ফ্রেশাররা শেখার প্রজেক্ট ও দক্ষতা দেখাবেন, অভিজ্ঞরা কাজের ইতিহাস দেখাবেন।',
    },
  },
};

HUB_COPY.europass = {
  noun: 'সিভি',
  forWhom: [
    'ইউরোপাস-ধাঁচের (Europass-style) সিভি ফরম্যাট চাইলে। এটি অফিসিয়াল Europass পোর্টালের ফাইল নয়, সেই ধরনের গোছানো কাঠামোর একটি Word ফরম্যাট।',
    'বিদেশে পড়াশোনা বা চাকরির আবেদনে ইউরোপাস-ধাঁচের গোছানো সিভি লাগলে। শিক্ষা, অভিজ্ঞতা ও ভাষা-দক্ষতা সারিবদ্ধভাবে দেখানোর জায়গা আছে।',
  ],
  tips: [
    'ভাষা-দক্ষতা ও আপনার শিক্ষা-অভিজ্ঞতার সময়কাল পরিষ্কার লিখুন।',
    'আবেদনের দেশ বা প্রতিষ্ঠান যে তথ্য চায়, শুধু সেটুকু রাখলে সিভি ছোট থাকে।',
  ],
  who: {
    q: 'এটি কি অফিসিয়াল Europass ফাইল?',
    a: 'না। এটি Europass-ধাঁচে সাজানো আমাদের নিজস্ব Word ফরম্যাট, তাই নিজের মতো এডিট করা যায়।',
  },
} as Copy & { noun: string };

/** English search phrase for the page topic, by hub first and then by sector. Phrases come from the keyword research. */
const TOPIC_HUB: Record<string, string> = {
  'marriage-biodata': 'marriage biodata format',
  'job-biodata': 'job biodata format',
  gulf: 'Gulf job CV format',
  'graphic-designer': 'graphic designer CV format',
  europass: 'Europass CV template',
  simple: 'simple CV format',
  modern: 'modern CV template',
  it: 'CV format for IT jobs',
  nurse: 'CV format for nurses',
  teacher: 'CV format for teaching jobs',
  fresher: 'CV format for freshers',
};
const TOPIC_SECTOR: Record<string, string> = {
  fresher: 'CV format for freshers',
  banking: 'professional CV format for bank and finance jobs',
  corporate: 'professional CV format for corporate jobs',
  teaching: 'CV format for teaching jobs',
  engineering: 'CV format for engineering and IT jobs',
  sales: 'professional CV format for sales and marketing jobs',
  medical: 'CV format for nurses and doctors',
  other: 'professional CV format for job',
};

const COLOR_BN: Record<string, string> = {
  Blue: 'নীল',
  'Clean White': 'সাদা',
  'Black & White': 'সাদা-কালো',
  Yellow: 'হলুদ',
};

/** Stable string hash so the same template always gets the same variant. */
export function hashId(id: string): number {
  // FNV-1a with a final mix, so every bit depends on the whole id.
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export interface GuideLink {
  href: string;
  text: string;
}
export interface TemplateGuide {
  summary: string;
  forWhomHeading: string;
  forWhom: string;
  contentsHeading: string;
  contents: string[];
  editHeading: string;
  steps: string[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  moreHeading: string;
  more: GuideLink[];
}

/** A template that has its own indexable page and may be linked to. */
const linkable = (t: Template): boolean => !isRetired(t.id) && shouldIndex(t) && !isVariant(t.id);

export function templateGuide(t: Template, all: readonly Template[] = TEMPLATES): TemplateGuide {
  const sector = SECTORS.find((s) => s.id === t.sector)!;
  const hub = hubOf(t);
  const hubCopy = HUB_COPY[hub];
  const copy: Copy = hubCopy ?? SECTOR_COPY[t.sector];
  const noun = hubCopy?.noun ?? 'সিভি';
  const h = hashId(t.id);
  /** Independent 0/1 choice for a named slot of this template. */
  const pick = (slot: string): 0 | 1 => (hashId(`${t.id}#${slot}`) % 2) as 0 | 1;
  const price = bnPrice();
  const styleBn = t.style === 'ats' ? 'ATS-ফ্রেন্ডলি' : 'ডিজাইনড';
  const field = hubCopy ? (CATEGORIES.find((c) => c.id === hub)?.name.bn ?? sector.name.bn) : sector.name.bn;

  const topic = TOPIC_HUB[hub] ?? TOPIC_SECTOR[t.sector];
  const summary = `${t.title.bn}: ${bnNum(t.pages)} পৃষ্ঠার ${styleBn} Word ${noun} ফরম্যাট (${topic}), ${field} ক্ষেত্রের জন্য। মূল্য ${price}।`;
  const pageNote =
    t.pages === 1
      ? 'এক পৃষ্ঠার ফরম্যাট, তাই সিভি সংক্ষিপ্ত ও এক নজরে পড়ার মতো রাখা সহজ।'
      : t.pages === 2
        ? 'দুই পৃষ্ঠায় অভিজ্ঞতা ও দক্ষতা তুলনামূলক বিস্তারিত লেখার জায়গা আছে।'
        : `${bnNum(t.pages)} পৃষ্ঠার এই ফরম্যাটে বিস্তারিত তথ্য, প্রজেক্ট বা প্রকাশনার জন্য বাড়তি জায়গা মেলে।`;
  const photoNote =
    t.photo === true
      ? 'ছবি বসানোর জায়গা আছে, দরকার না হলে মুছে দেওয়া যায়।'
      : t.photo === false
        ? 'এতে ছবির জায়গা নেই, তাই ছবি ছাড়া আবেদনের জন্য সুবিধা।'
        : '';
  const kwLine = [
    `${topic} খুঁজছেন? বাংলাদেশের চাকরির আবেদনের জন্য সাজানো এই Word CV template কিনে সরাসরি নিজের তথ্য বসাতে পারবেন।`,
    `বাংলাদেশে চাকরির আবেদনে ${topic} হিসেবে ব্যবহার করার মতো একটি ${styleBn} Word ফাইল। কেনার পর নিজের মতো এডিট করা যায়।`,
  ][pick('kw')];
  const styleNote =
    t.style === 'ats'
      ? [
          'ATS-ফ্রেন্ডলি লেআউটে জটিল গ্রাফিক কম থাকে, তাই অনলাইন পোর্টালে আপলোড করলেও লেখা সাধারণত সহজে পড়া যায়।',
          'সাদামাটা ATS-ফ্রেন্ডলি কাঠামো, যা পোর্টালে আপলোড ও প্রিন্ট দুই কাজেই সুবিধাজনক।',
        ][pick('style')]
      : [
          'ডিজাইনড লেআউট প্রথম দেখাতেই চোখে পড়ে। অনলাইন পোর্টালে আপলোডের আগে ATS-ফ্রেন্ডলি ভার্সন লাগবে কি না ভেবে দেখুন।',
          'এই ডিজাইনড ফরম্যাট প্রিন্ট করা বা সরাসরি ইমেইলে পাঠানো সিভির জন্য ভালো মানায়।',
        ][pick('style')];

  const contents: string[] = [`${t.title.bn}: ${bnNum(t.pages)} পৃষ্ঠার ${noun} ফরম্যাট, Word (.docx) ফাইল হিসেবে`];
  if (t.photo === true) contents.push('ছবি বসানোর জায়গা আছে');
  else if (t.photo === false) contents.push('ছবি ছাড়া ফরম্যাট');
  if (t.color && COLOR_BN[t.color]) contents.push(`প্রধান রং: ${COLOR_BN[t.color]}`);
  contents.push(
    t.style === 'ats'
      ? ['ATS-ফ্রেন্ডলি সাদামাটা লেআউট, সহজ হেডিং ও পরিষ্কার সেকশন', 'সহজ হেডিংসহ ATS-ফ্রেন্ডলি লেআউট, যেখানে সেকশনগুলো আলাদা করে চেনা যায়'][pick('c1')]
      : ['ডিজাইনড লেআউট, যেখানে সেকশনগুলো আলাদা ব্লকে সাজানো', 'রঙ ও ব্লক ব্যবহার করা ডিজাইনড লেআউট, তবুও সব লেখা এডিট করা যায়'][pick('c1')],
  );
  contents.push('Word-এ লেখা, ফন্ট ও সেকশন নিজের মতো এডিট করা যায়');
  if (t.bonus?.length) contents.push('কেনার সঙ্গে বোনাস ফাইল যুক্ত থাকে');
  else contents.push('PDF হিসেবে সেভ করে সরাসরি আবেদনে পাঠানো যায়');

  const steps = [
    [`bKash বা Nagad-এ ${price} পরিশোধ করুন।`, `প্রথমে bKash বা Nagad দিয়ে ${price} পেমেন্ট সম্পন্ন করুন।`][pick('s1')],
    ['পরিশোধের পর .docx ফাইলটি ডাউনলোড করুন।', 'পেমেন্টের পরেই .docx ফাইলটি নিজের ডিভাইসে ডাউনলোড করে নিন।'][pick('s2')],
    ['ফাইলটি Word-এ খুলে নমুনা লেখার জায়গায় নিজের তথ্য বসান।', 'Word-এ ফাইলটি খুলুন এবং নমুনা লেখাগুলো মুছে নিজের নাম, শিক্ষা ও অভিজ্ঞতা লিখুন।'][pick('s3')],
    ['শেষে Word থেকেই PDF হিসেবে সেভ করে আবেদনে ব্যবহার করুন।', 'সবশেষে "Save as" দিয়ে PDF করে নিন, তারপর আবেদনে বা ইমেইলে পাঠান।'][pick('s4')],
  ];

  const faq = [
    [
      {
        q: 'Word-এ এডিট করা যাবে?',
        a: `হ্যাঁ। ${t.title.bn} ফাইলটি .docx ফরম্যাটে পাবেন, যা Microsoft Word ও Google Docs-এ খোলে। নমুনা লেখা মুছে নিজের তথ্য বসাতে পারবেন।`,
      },
      {
        q: 'এই CV template কি নিজের মতো বদলানো যায়?',
        a: `হ্যাঁ। ${t.title.bn} একটি .docx ফাইল, তাই Word বা Google Docs-এ লেখা, ফন্ট ও সেকশন নিজের মতো বদলে নিতে পারবেন।`,
      },
    ][pick('faq1')],
    [
      {
        q: 'পেমেন্টের পর কখন ডাউনলোড করতে পারব?',
        a: `bKash বা Nagad-এ ${price} পরিশোধের পরেই ডাউনলোড করা যায়।`,
      },
      {
        q: `${price} দিলে কী পাব, কীভাবে পাব?`,
        a: `bKash বা Nagad-এ ${price} পরিশোধ করলে ${t.pages > 1 ? `${bnNum(t.pages)} পৃষ্ঠার ` : ''}Word ফাইলটি ডাউনলোডের জন্য পাবেন।`,
      },
    ][pick('faq2')],
    copy.who,
  ];

  const more: GuideLink[] = [];
  const liveCat = liveCategoryFor(hub);
  if (liveCat) more.push({ href: categoryPath(liveCat.slug), text: liveCat.h1 });
  more.push({ href: '/templates', text: 'সব সিভি টেমপ্লেট' });
  const siblings = all.filter((s) => s.id !== t.id && s.sector === t.sector && linkable(s));
  const start = siblings.length ? h % siblings.length : 0;
  for (let i = 0; i < Math.min(4, siblings.length); i++) {
    const s = siblings[(start + i) % siblings.length];
    more.push({ href: `/templates/${s.id}`, text: s.title.bn });
  }

  return {
    summary,
    forWhomHeading: 'এই ফরম্যাট কার জন্য',
    forWhom: `${copy.forWhom[pick('who')]} ${kwLine} ${styleNote} ${pageNote} ${photoNote} ${copy.tips[pick('tip')]}`.replace(/\s+/g, ' '),
    contentsHeading: 'ফরম্যাটের ভেতরে কী আছে',
    contents,
    editHeading: 'Word-এ কীভাবে এডিট করবেন',
    steps,
    faqHeading: 'সচরাচর প্রশ্ন',
    faq,
    moreHeading: 'আরও সিভি ফরম্যাট',
    more,
  };
}
