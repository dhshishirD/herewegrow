// Search titles and descriptions, shared by the build-time pages (scripts/seo.ts)
// and the app (src/lib/seo.ts) so both always say the same thing.
// Bangla first, with the English terms people also search for.

import { PRODUCTS } from './catalog';
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
    title: 'সিভি রাইটিং সার্ভিস বাংলাদেশ | CV writing and review | HereWeGrow',
    description: `ফ্রেশার থেকে এক্সিকিউটিভ, নির্দিষ্ট দামে সিভি রাইটিং ও রিভিউ। Professional CV writing in Bangladesh from ৳${price('cv-fresher')}, CV review ৳${price('cv-review')}.`,
  },
  '/templates': {
    title: `সিভি ফরম্যাট ডাউনলোড (Word) | ${TEMPLATES.length}+ CV templates Bangladesh | HereWeGrow`,
    description: `ব্যাংক, কর্পোরেট, ফ্রেশার, ইঞ্জিনিয়ারিং, শিক্ষকতা ও মেডিকেল চাকরির জন্য Word-এ এডিটযোগ্য সিভি ফরম্যাট। প্রতিটি ৳${SINGLE_TEMPLATE_PRICE}, সব ৪০টি ৳${price('pack-best-40')}। Editable CV format for Bangladesh jobs, instant download.`,
  },
  '/tools': {
    title: 'চাকরিপ্রার্থীদের জন্য ফ্রি টুলস | Free job tools | HereWeGrow',
    description: 'ফ্রি সিভি চেকার ও টেলিটক সরকারি চাকরির ফর্মের জন্য ছবি-স্বাক্ষর রিসাইজার। Free CV checker and photo and signature resizer, no sign-up.',
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
