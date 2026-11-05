// Search titles and descriptions, shared by the build-time pages (scripts/seo.ts)
// and the app (src/lib/seo.ts) so both always say the same thing.
// Bangla first, with the English terms people also search for.

import { PRODUCTS } from './catalog';
import { DESIGN_LIST, FREE_DESIGN_COUNT } from './designList';
import { findGuide } from './guides';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES, findTemplate } from './templates';

export interface RouteSeo {
  title: string;
  description: string;
}

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const price = (id: string) => PRODUCTS.find((p) => p.id === id)?.price ?? 0;

const STATIC: Record<string, RouteSeo> = {
  '/': {
    title: 'HereWeGrow | সিভি রাইটিং, সিভি ফরম্যাট ও ফ্রি জব টুলস | CV writing in Bangladesh',
    description:
      'বাংলাদেশের চাকরিপ্রার্থীদের জন্য বিশেষজ্ঞ সিভি রাইটিং, Word-এ এডিটযোগ্য সিভি ফরম্যাট ও ফ্রি টুলস। Expert CV writing, editable CV templates and free tools. বিকাশ, নগদ বা রকেটে পেমেন্ট।',
  },
  '/services': {
    title: 'সিভি রাইটিং, লিংকডইন ও বিডিজবস প্রোফাইল, SOP | CV writing service Bangladesh | HereWeGrow',
    description: `নির্দিষ্ট দামে সিভি রাইটিং (৳${price('cv-fresher')} থেকে), সিভি রিভিউ ৳${price('cv-review')}, লিংকডইন প্রোফাইল ৳${price('linkedin-profile')}, বিডিজবস প্রোফাইল ৳${price('bdjobs-profile')}, SOP ও একাডেমিক সিভি। CV writing, LinkedIn and SOP services in Bangladesh.`,
  },
  '/templates': {
    title: `সিভি ফরম্যাট ডাউনলোড (Word) | ${TEMPLATES.length}+ CV templates Bangladesh | HereWeGrow`,
    description: `ব্যাংক, কর্পোরেট, ফ্রেশার, ইঞ্জিনিয়ারিং, শিক্ষকতা ও মেডিকেল চাকরির জন্য Word-এ এডিটযোগ্য সিভি ফরম্যাট। প্রতিটি ৳${SINGLE_TEMPLATE_PRICE}, সব ৪০টি ৳${price('pack-best-40')}। Editable CV format for Bangladesh jobs, instant download.`,
  },
  '/about': {
    title: 'About HereWeGrow and Career Solutions | CV expert in Bangladesh',
    description: '৫ বছরের অভিজ্ঞ সিভি কনসালট্যান্ট দেলোয়ার হাসান শিশির (ইংরেজিতে বিএ, এমএ, শাবিপ্রবি)। হাজারো সিভি, লিংকডইন ও বিডিজবস প্রোফাইল। Meet the CV expert behind HereWeGrow.',
  },
  '/contact': {
    title: 'যোগাযোগ করুন | Contact HereWeGrow',
    description: 'সিভি, টেমপ্লেট বা অর্ডার নিয়ে প্রশ্ন? নাম, ফোন নম্বর ও ছোট একটি বার্তা দিন, আমরা যোগাযোগ করব। Contact HereWeGrow by message or WhatsApp.',
  },
  '/guides': {
    title: 'ক্যারিয়ার গাইড: সিভি ফরম্যাট, টেলিটক আবেদন ও চাকরির টিপস | HereWeGrow',
    description: 'বাংলায় চাকরির গাইড: ব্যাংক জবের সিভি ফরম্যাট, ফ্রেশারের সিভি, ATS-ফ্রেন্ডলি সিভি, টেলিটকে ছবি ও স্বাক্ষরের সাইজ এবং সিভির সাধারণ ভুল।',
  },
  '/tools': {
    title: 'চাকরিপ্রার্থীদের জন্য ফ্রি টুলস | Free job tools | HereWeGrow',
    description: 'ফ্রি সিভি চেকার ও টেলিটক সরকারি চাকরির ফর্মের জন্য ছবি-স্বাক্ষর রিসাইজার। Free CV checker and photo and signature resizer, no sign-up.',
  },
  '/builder': {
    title: 'ফ্রি সিভি বিল্ডার: অনলাইনে সিভি বানান, PDF ডাউনলোড | Free CV maker Bangladesh | HereWeGrow',
    description: `সহজ ফর্ম পূরণ করে ${bn(DESIGN_LIST.length)}টি পেশাদার ডিজাইনে সিভি বানান (${bn(FREE_DESIGN_COUNT)}টি ফ্রি), ATS-ফ্রেন্ডলি PDF ডাউনলোড করুন। বাংলাদেশি ফরম্যাটের ব্যক্তিগত তথ্যসহ। বিনামূল্যে, সাইন-আপ ছাড়া। Free online CV maker.`,
  },
  '/linkedin-profile-optimization': {
    title: `লিংকডইন প্রোফাইল অপটিমাইজেশন সার্ভিস (৳${price('linkedin-profile')}) | LinkedIn profile optimization Bangladesh | HereWeGrow`,
    description: `রিক্রুটার-রেডি লিংকডইন প্রোফাইল: হেডলাইন, About, অভিজ্ঞতা ও কী-ওয়ার্ড নতুন করে লেখা, ৪৮ ঘণ্টায়। মাত্র ৳${price('linkedin-profile')}, বিকাশ/নগদে পেমেন্ট। LinkedIn profile makeover by CV experts in Bangladesh.`,
  },
  '/bdjobs-profile-optimization': {
    title: `বিডিজবস প্রোফাইল আপডেট ও সেটআপ সার্ভিস (৳${price('bdjobs-profile')}) | BDJobs profile service | HereWeGrow`,
    description: `বিডিজবস প্রোফাইল ১০০% সম্পূর্ণ: ক্যারিয়ার সামারি, স্কিল, অভিজ্ঞতা ও জব ক্যাটাগরি, ২৪ ঘণ্টায়। মাত্র ৳${price('bdjobs-profile')}। BDJobs profile update and setup by CV experts, ready for 1-click apply.`,
  },
  '/pro': {
    title: 'HereWeGrow Pro: মার্কছাড়া সিভি ডাউনলোড ও প্রিমিয়াম ডিজাইন | Pro CV builder | HereWeGrow',
    description: '৳৪৯ থেকে প্রো পাস: মার্কছাড়া PDF ও Word, প্রিমিয়াম সিভি ডিজাইন, অনলাইনে সিভি সেভ ও টেমপ্লেটে ছাড়। বিকাশ বা নগদে একবার পেমেন্ট, নিজে থেকে নবায়ন নেই।',
  },
  '/tools/cv-checker': {
    title: 'ফ্রি সিভি চেকার: ATS স্কোর | Free CV checker and ATS score | HereWeGrow',
    description: 'আপনার সিভি PDF আপলোড করে ১০০-এর মধ্যে স্কোর ও সংশোধনের তালিকা পান। Free ATS CV checker for Bangladeshi job seekers. ফাইল আপনার ব্রাউজারেই থাকে।',
  },
  '/tools/photo-signature-resizer': {
    title: 'টেলিটক ছবি ও স্বাক্ষর রিসাইজ (300×300, 300×80) | Teletalk photo resizer | HereWeGrow',
    description: 'সরকারি চাকরির আবেদনে টেলিটকের মাপে ছবি 300×300 (১০০ KB) ও স্বাক্ষর 300×80 (৬০ KB) এক ক্লিকে। Free Teletalk photo and signature resizer.',
  },
};

export function routeSeo(path: string): RouteSeo | undefined {
  if (STATIC[path]) return STATIC[path];
  const gm = path.match(/^\/guides\/([a-z0-9-]+)$/);
  const guide = gm ? findGuide(gm[1]) : undefined;
  if (guide) return { title: `${guide.title.bn} | HereWeGrow`, description: guide.summary };
  const m = path.match(/^\/templates\/([a-z0-9-]+)$/);
  const t = m ? findTemplate(m[1]) : undefined;
  if (!t) return undefined;
  const sector = SECTORS.find((s) => s.id === t.sector)!;
  const style = t.style === 'ats' ? 'ATS-ফ্রেন্ডলি' : 'ডিজাইনড';
  return {
    title: `${t.title.bn}: Word ফরম্যাট ডাউনলোড | ${t.title.en}, Word template | HereWeGrow`,
    description: `${t.title.bn}: ${bn(t.pages)} পৃষ্ঠার ${style} সিভি ফরম্যাট, Word-এ এডিট করুন। ${sector.name.bn} চাকরির জন্য। মাত্র ৳${SINGLE_TEMPLATE_PRICE}, বিকাশ/নগদে পেমেন্ট করে সাথে সাথে ডাউনলোড। ${t.title.en}, ${t.pages}-page editable Word CV format for Bangladesh.`,
  };
}
