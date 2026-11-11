// Search titles and descriptions, shared by the build-time pages (scripts/seo.ts)
// and the app (src/lib/seo.ts) so both always say the same thing.
// Bangla first, with the English terms people also search for.

import { PRODUCTS } from './catalog';
import { DESIGN_LIST, FREE_DESIGN_COUNT } from './designList';
import { findGuide } from './guides';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES, findTemplate } from './templates';
import { ON_SALE_COUNT, isVariant, shouldIndex } from './templateTiers';

export interface RouteSeo {
  title: string;
  description: string;
}

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const price = (id: string) => PRODUCTS.find((p) => p.id === id)?.price ?? 0;

/** Search-result limits: longer titles and descriptions get cut off by Google. */
export const TITLE_MAX = 60;
export const DESC_MAX = 155;

/** The first wording that fits `max`, trying the fullest first; if none fits, the shortest one is cut with an ellipsis. */
export function fit(max: number, ...options: string[]): string {
  const ok = options.find((o) => o.length <= max);
  if (ok) return ok;
  const last = options[options.length - 1];
  return `${last.slice(0, max - 1).trimEnd()}…`;
}

const STATIC: Record<string, RouteSeo> = {
  '/': {
    title: 'সিভি রাইটিং ও ফ্রি জব টুলস | CV writing | HereWeGrow',
    description:
      'বাংলাদেশের চাকরিপ্রার্থীদের জন্য বিশেষজ্ঞ সিভি রাইটিং, Word-এ এডিটযোগ্য সিভি ফরম্যাট ও ফ্রি টুলস। বিকাশ, নগদ বা রকেটে পেমেন্ট। CV writing in Bangladesh.',
  },
  '/services': {
    title: 'সিভি রাইটিং সার্ভিস, লিংকডইন ও SOP | HereWeGrow',
    description: `সিভি রাইটিং ৳${price('cv-fresher')} থেকে, রিভিউ ৳${price('cv-review')}, লিংকডইন ৳${price('linkedin-profile')}, বিডিজবস প্রোফাইল ৳${price('bdjobs-profile')} ও SOP। CV writing service in Bangladesh.`,
  },
  '/templates': {
    title: `সিভি ফরম্যাট (Word) | ${ON_SALE_COUNT}+ CV templates | HereWeGrow`,
    description: `ব্যাংক, কর্পোরেট, ফ্রেশার, ইঞ্জিনিয়ারিং, শিক্ষকতা ও মেডিকেল চাকরির Word সিভি ফরম্যাট। প্রতিটি ৳${SINGLE_TEMPLATE_PRICE}, সব ৪০টি ৳${price('pack-best-40')}। Editable CV format.`,
  },
  '/about': {
    title: 'আমাদের সম্পর্কে | CV expert in Bangladesh | HereWeGrow',
    description: '৫ বছরের অভিজ্ঞ সিভি কনসালট্যান্ট দেলোয়ার হাসান শিশির (ইংরেজিতে বিএ, এমএ, শাবিপ্রবি)। হাজারো সিভি ও প্রোফাইল। Meet the CV expert.',
  },
  '/contact': {
    title: 'যোগাযোগ করুন | Contact HereWeGrow',
    description: 'সিভি, টেমপ্লেট বা অর্ডার নিয়ে প্রশ্ন? নাম, ফোন নম্বর ও ছোট একটি বার্তা দিন, আমরা যোগাযোগ করব। Contact HereWeGrow by message or WhatsApp.',
  },
  '/guides': {
    title: 'ক্যারিয়ার গাইড: সিভি ফরম্যাট ও চাকরির টিপস | HereWeGrow',
    description: 'বাংলায় চাকরির গাইড: ব্যাংক জবের সিভি ফরম্যাট, ফ্রেশারের সিভি, ATS-ফ্রেন্ডলি সিভি, টেলিটকে ছবি ও স্বাক্ষরের সাইজ এবং সিভির সাধারণ ভুল।',
  },
  '/blog': {
    title: 'ব্লগ: সিভি লেখার নিয়ম ও চাকরির গাইড | HereWeGrow',
    description: 'বাংলায় সিভি, দরখাস্ত, ইমেইলে আবেদন ও ইন্টারভিউয়ের গাইড, নমুনা ও চেকলিস্টসহ। বাংলাদেশের চাকরিপ্রার্থীদের জন্য।',
  },
  '/tools': {
    title: 'ফ্রি জব টুলস | Free job tools | HereWeGrow',
    description: 'ফ্রি সিভি চেকার ও টেলিটক সরকারি চাকরির ফর্মের জন্য ছবি-স্বাক্ষর রিসাইজার। Free CV checker and photo and signature resizer, no sign-up.',
  },
  '/builder': {
    title: 'ফ্রি সিভি বিল্ডার | Free CV maker Bangladesh | HereWeGrow',
    description: `সহজ ফর্মে ${bn(DESIGN_LIST.length)}টি পেশাদার ডিজাইনে সিভি বানান (${bn(FREE_DESIGN_COUNT)}টি ফ্রি), ATS-ফ্রেন্ডলি PDF ডাউনলোড। সাইন-আপ ছাড়া। Free online CV maker.`,
  },
  '/linkedin-profile-optimization': {
    title: `লিংকডইন প্রোফাইল অপটিমাইজেশন ৳${price('linkedin-profile')} | HereWeGrow`,
    description: `রিক্রুটার-রেডি লিংকডইন প্রোফাইল: হেডলাইন, About ও কী-ওয়ার্ড নতুন করে লেখা, ৪৮ ঘণ্টায়। মাত্র ৳${price('linkedin-profile')}। LinkedIn profile makeover.`,
  },
  '/bdjobs-profile-optimization': {
    title: `বিডিজবস প্রোফাইল সেটআপ সার্ভিস ৳${price('bdjobs-profile')} | HereWeGrow`,
    description: `বিডিজবস প্রোফাইল ১০০% সম্পূর্ণ: সামারি, স্কিল, অভিজ্ঞতা ও জব ক্যাটাগরি, ২৪ ঘণ্টায়। মাত্র ৳${price('bdjobs-profile')}। BDJobs profile update and setup.`,
  },
  '/cv-for-gulf-jobs': {
    title: 'গাল্ফ জবের সিভি ফরম্যাট | Gulf CV format | HereWeGrow',
    description: 'গাল্ফে চাকরির সিভি: ছবি, জাতীয়তা ও ব্যক্তিগত তথ্যসহ পরিষ্কার এক পাতা, ফোনেই বানান, শুরু ফ্রি। Free Gulf CV maker for Saudi, UAE, Qatar.',
  },
  '/pro': {
    title: 'HereWeGrow Pro: মার্কছাড়া সিভি ও প্রিমিয়াম ডিজাইন',
    description: '৳৪৯ থেকে প্রো পাস: মার্কছাড়া PDF ও Word, প্রিমিয়াম সিভি ডিজাইন, অনলাইনে সিভি সেভ ও টেমপ্লেটে ছাড়। বিকাশ বা নগদে একবার পেমেন্ট, নিজে থেকে নবায়ন নেই।',
  },
  '/tools/cv-checker': {
    title: 'ফ্রি সিভি চেকার (ATS স্কোর) | Free CV checker | HereWeGrow',
    description: 'আপনার সিভি PDF আপলোড করে ১০০-এর মধ্যে স্কোর ও সংশোধনের তালিকা পান। Free ATS CV checker for Bangladeshi job seekers. ফাইল আপনার ব্রাউজারেই থাকে।',
  },
  '/tools/application-letter': {
    title: 'ফ্রি আবেদনপত্র জেনারেটর | Application letter | HereWeGrow',
    description: 'সরকারি বা বেসরকারি চাকরির আবেদনপত্র মিনিটেই লিখুন, কপি করুন বা Word ফাইল নামান। Free job application letter generator in Bangla and English.',
  },
  '/tools/scam-shield': {
    title: 'ভুয়া চাকরির বিজ্ঞপ্তি চেকার | Fake job checker | HereWeGrow',
    description: 'চাকরির বিজ্ঞপ্তি বা মেসেজ পেস্ট করে লাল পতাকা দেখুন: আগে টাকা চাওয়া, বিকাশে পেমেন্ট, ইন্টারভিউ ছাড়া চাকরি। Free fake job checker.',
  },
  '/tools/job-match': {
    title: 'সিভি জব-ম্যাচ চেকার | Free CV job match | HereWeGrow',
    description: 'চাকরির বিজ্ঞাপন ও সিভি দিয়ে দেখুন কোন কীওয়ার্ড বাদ পড়েছে। Free tool to match your CV against a job ad, in your browser.',
  },
  '/tools/photo-signature-resizer': {
    title: 'টেলিটক ছবি ও স্বাক্ষর রিসাইজার | Photo resizer | HereWeGrow',
    description: 'সরকারি চাকরির আবেদনে টেলিটকের মাপে ছবি 300×300 (১০০ KB) ও স্বাক্ষর 300×80 (৬০ KB) এক ক্লিকে। Free Teletalk photo and signature resizer.',
  },
};

/** English titles shared by more than one indexable template page. Only those pages get the page count added, so titles stay short and no two match. */
let sharedTitles: Set<string> | undefined;
function isSharedTitle(en: string): boolean {
  if (!sharedTitles) {
    const seen = new Set<string>();
    sharedTitles = new Set();
    for (const t of TEMPLATES) {
      if (!shouldIndex(t) || isVariant(t.id)) continue;
      if (seen.has(t.title.en)) sharedTitles.add(t.title.en);
      seen.add(t.title.en);
    }
  }
  return sharedTitles.has(en);
}

export function routeSeo(path: string): RouteSeo | undefined {
  if (STATIC[path]) return STATIC[path];
  const gm = path.match(/^\/guides\/([a-z0-9-]+)$/);
  const guide = gm ? findGuide(gm[1]) : undefined;
  if (guide) return { title: fit(TITLE_MAX, `${guide.seoTitle ?? guide.title.bn} | HereWeGrow`, guide.seoTitle ?? guide.title.bn), description: fit(DESC_MAX, guide.summary) };
  const m = path.match(/^\/templates\/([a-z0-9-]+)$/);
  const t = m ? findTemplate(m[1]) : undefined;
  if (!t) return undefined;
  const sector = SECTORS.find((s) => s.id === t.sector)!;
  const style = t.style === 'ats' ? 'ATS-ফ্রেন্ডলি' : 'ডিজাইনড';
  const shared = isSharedTitle(t.title.en);
  const name = `${t.title.bn}${shared ? ` (${bn(t.pages)} পৃষ্ঠা)` : ''}`;
  // Long library titles: shorten the colour name first, so the colour and photo words that tell two templates apart survive.
  const compact = name.replace('পরিচ্ছন্ন সাদা', 'সাদা');
  const shortest = compact.replace(' ফরম্যাট', '');
  const sold = `মাত্র ৳${SINGLE_TEMPLATE_PRICE}, সাথে সাথে ডাউনলোড`;
  return {
    title: fit(TITLE_MAX, `${name} | Word CV | HereWeGrow`, `${name} | HereWeGrow`, `${compact} | HereWeGrow`, compact, `${shortest} | HereWeGrow`, shortest),
    description: fit(
      DESC_MAX,
      `${name}: ${bn(t.pages)} পৃষ্ঠার ${style} সিভি, Word-এ এডিট করুন। ${sector.name.bn} চাকরির জন্য। ${sold}। ${t.title.en}, editable Word CV.`,
      `${name}: ${bn(t.pages)} পৃষ্ঠার ${style} সিভি, Word-এ এডিট করুন। ${sold}।`,
      `${name}: Word-এ এডিটযোগ্য সিভি। ${sold}।`,
    ),
  };
}
