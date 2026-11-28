// Words under the photo and signature resizer: how to use it, formats, privacy, why uploads get rejected and the FAQ.
// Shared so the build-time SEO page (scripts/seo.ts) prints the same text the React page shows.
// Sizes in this copy come from shared/photoPresets.ts (print sizes are computed from millimetres) or from a source
// listed in PHOTO_SOURCES. Presets are tool options, not a claim that any portal requires them.

import { PRINT_DPI, findPreset, mmLabel } from './photoPresets';

export interface Bilingual { en: string; bn: string }

const bnDigits = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const px = (id: string) => { const p = findPreset(id)!; return { en: `${p.w}×${p.h}`, bn: bnDigits(`${p.w}×${p.h}`) }; };
const mm = (id: string) => mmLabel(findPreset(id)!.mm!);
export const PHOTO_DPI = PRINT_DPI;

export const PHOTO_UPDATED = '2026-11-28';
export const PHOTO_UPDATED_LABEL: Bilingual = { en: '28 November 2026', bn: '২৮ নভেম্বর ২০২৬' };
export const PHOTO_AUTHOR = { name: 'Daloyar Hassan Shishir', url: '/about' } as const;

export const PHOTO_STEPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: 'Pick photo or signature', bn: 'ছবি না স্বাক্ষর, বেছে নিন' },
    body: {
      en: 'Pick a size: “Photo” or “Signature” for job forms, a print size such as passport or stamp, or a KB target. Need something else? Tap “Other size” and type your own width, height and KB. Check your own circular first.',
      bn: 'মাপ বেছে নিন: চাকরির ফর্মের জন্য “ছবি” বা “স্বাক্ষর”, প্রিন্টের জন্য পাসপোর্ট বা স্ট্যাম্প সাইজ, অথবা KB লক্ষ্য। অন্য কিছু লাগলে “অন্য মাপ” চেপে নিজের প্রস্থ, উচ্চতা ও KB লিখুন। আগে নিজের বিজ্ঞপ্তি দেখে নিন।',
    },
  },
  {
    title: { en: 'Choose your image', bn: 'ছবি বেছে নিন' },
    body: {
      en: 'Select a file from your phone or computer. For a signature, sign on white paper with a dark pen and photograph it from above in good light.',
      bn: 'ফোন বা কম্পিউটার থেকে ফাইল নিন। স্বাক্ষরের জন্য সাদা কাগজে গাঢ় কলমে সই করে ভালো আলোয় ঠিক উপর থেকে ছবি তুলুন।',
    },
  },
  {
    title: { en: 'Zoom and drag to frame it', bn: 'জুম করে ও টেনে সাজান' },
    body: {
      en: 'Keep the face, or the whole signature, inside the frame. For a signature, leave “Clean the background to pure white” ticked.',
      bn: 'মুখ, বা পুরো স্বাক্ষর, ফ্রেমের ভেতরে রাখুন। স্বাক্ষরের বেলায় “ব্যাকগ্রাউন্ড পরিষ্কার সাদা করুন” টিক দেওয়া রাখুন।',
    },
  },
  {
    title: { en: 'Make the file and download', bn: 'ফাইল বানিয়ে ডাউনলোড করুন' },
    body: {
      en: 'Press “Make my file”. The tool finds the best JPG quality that fits your KB limit, then shows the final size. Download it and upload it to the form.',
      bn: '“ফাইল তৈরি করুন” চাপুন। টুল আপনার KB সীমার মধ্যে সবচেয়ে ভালো JPG মান খুঁজে নেয় ও চূড়ান্ত সাইজ দেখায়। ডাউনলোড করে ফর্মে আপলোড করুন।',
    },
  },
];

export const PHOTO_FORMATS: Bilingual[] = [
  {
    en: 'In: any image your browser can open, usually JPG and PNG. If a file will not open, save or screenshot it as JPG first.',
    bn: 'ইনপুট: আপনার ব্রাউজার যে ছবি খুলতে পারে, সাধারণত JPG ও PNG। কোনো ফাইল না খুললে আগে JPG হিসেবে সেভ করুন বা স্ক্রিনশট নিন।',
  },
  {
    en: 'iPhone HEIC photos open in Safari, but most other browsers cannot read them. The tool then tells you so. Set the iPhone camera to “Most Compatible” to save JPG, or convert the photo first.',
    bn: 'আইফোনের HEIC ছবি Safari-তে খোলে, কিন্তু অন্য বেশিরভাগ ব্রাউজারে খোলে না; তখন টুল সেটা জানিয়ে দেয়। আইফোনের ক্যামেরা “Most Compatible”-এ রাখলে JPG সেভ হয়, অথবা আগে ছবিটি কনভার্ট করুন।',
  },
  {
    en: 'Out: always a JPG file, so it works on forms that ask for JPG.',
    bn: 'আউটপুট: সবসময় JPG ফাইল, তাই যে ফর্মে JPG চাওয়া হয় সেখানে চলে।',
  },
  {
    en: 'A PNG with a see-through background gets a white background.',
    bn: 'স্বচ্ছ ব্যাকগ্রাউন্ডের PNG-তে সাদা ব্যাকগ্রাউন্ড বসে যায়।',
  },
];

export const PHOTO_PRIVACY: Bilingual = {
  en: 'Your photo and signature are resized inside your browser. The file is not uploaded to our server or anyone else’s, and nothing is saved. Close the page and it is gone.',
  bn: 'আপনার ছবি ও স্বাক্ষর আপনার ব্রাউজারের ভেতরেই রিসাইজ হয়। ফাইল আমাদের বা অন্য কারও সার্ভারে আপলোড হয় না, কিছু সেভও হয় না। পেজ বন্ধ করলেই সব মুছে যায়।',
};

export const PHOTO_REJECTIONS: Bilingual[] = [
  {
    en: 'The file is bigger than the KB limit. A straight phone photo is often several MB, so resize it first.',
    bn: 'ফাইল সাইজ KB সীমার চেয়ে বড়। সরাসরি ফোনের ছবি প্রায়ই কয়েক MB হয়, তাই আগে রিসাইজ করুন।',
  },
  {
    en: 'The pixel size is wrong, or the image was stretched. A tall or wide photo squeezed into a square makes the face look distorted. Zoom and drag instead.',
    bn: 'পিক্সেল মাপ ভুল, অথবা ছবি টেনে বিকৃত করা হয়েছে। লম্বাটে বা চওড়া ছবি জোর করে চৌকো করলে মুখ বিকৃত দেখায়। বরং জুম করে ও টেনে সাজান।',
  },
  {
    en: 'An iPhone HEIC photo or another format the portal does not accept. Upload the JPG this tool makes.',
    bn: 'আইফোনের HEIC ছবি বা পোর্টাল যে ফরম্যাট নেয় না তা। এই টুলের বানানো JPG আপলোড করুন।',
  },
  {
    en: 'The wrong file type, such as PDF, Word, or a screenshot saved in another format. Upload the JPG this tool makes.',
    bn: 'ভুল ফাইলের ধরন, যেমন PDF, Word বা অন্য ফরম্যাটে সেভ করা স্ক্রিনশট। এই টুলের বানানো JPG আপলোড করুন।',
  },
  {
    en: 'A signature with shadows, paper folds or a grey background. Use white paper, even light, and keep the background-clean option on.',
    bn: 'স্বাক্ষরে ছায়া, কাগজের ভাঁজ বা ধূসর ব্যাকগ্রাউন্ড। সাদা কাগজ ও সমান আলো ব্যবহার করুন এবং ব্যাকগ্রাউন্ড পরিষ্কার করার অপশন চালু রাখুন।',
  },
  {
    en: 'A blurry, dark, old or cropped photo, such as a face cut off at the edge. Retake it in daylight, facing the camera.',
    bn: 'ঝাপসা, অন্ধকার, পুরনো বা কাটা ছবি, যেমন কিনারায় মুখের অংশ কেটে গেছে। দিনের আলোয় ক্যামেরার দিকে তাকিয়ে আবার তুলুন।',
  },
  {
    en: 'The limits on your circular are different from what you used. Always check the size in your own circular first.',
    bn: 'আপনার বিজ্ঞপ্তির সীমা আর আপনি যে সীমায় বানিয়েছেন তা আলাদা। আগে নিজের বিজ্ঞপ্তিতে মাপ মিলিয়ে নিন।',
  },
];

export const PHOTO_FAQ: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { en: 'Is this tool free, and do I need to sign up?', bn: 'টুলটি কি ফ্রি, সাইন-আপ লাগে?' },
    a: {
      en: 'It is free and needs no sign-up, no watermark and no account.',
      bn: 'টুলটি ফ্রি। সাইন-আপ, অ্যাকাউন্ট বা ওয়াটারমার্ক কিছুই লাগে না।',
    },
  },
  {
    q: { en: 'Is my photo uploaded anywhere?', bn: 'আমার ছবি কি কোথাও আপলোড হয়?' },
    a: { en: PHOTO_PRIVACY.en, bn: PHOTO_PRIVACY.bn },
  },
  {
    q: { en: 'My circular asks for a different size. What do I do?', bn: 'আমার বিজ্ঞপ্তিতে অন্য মাপ চাওয়া হয়েছে, কী করব?' },
    a: {
      en: 'Tap “Other size”, type the width, height and maximum KB from your circular, and make the file as usual. The size in your own circular is the one that counts.',
      bn: '“অন্য মাপ” চেপে আপনার বিজ্ঞপ্তির প্রস্থ, উচ্চতা ও সর্বোচ্চ KB লিখুন, তারপর আগের মতোই ফাইল বানান। আপনার নিজের বিজ্ঞপ্তির মাপই চূড়ান্ত।',
    },
  },
  {
    q: { en: 'The tool says it cannot get under the size limit. Why?', bn: 'টুল বলছে সাইজ সীমার নিচে আনা যায়নি, কেন?' },
    a: {
      en: 'A very small KB limit on a detailed image can be too low for a JPG at that pixel size. Zoom in on the face or signature so the frame has less detail, or raise the KB limit if your form allows it.',
      bn: 'ছবিতে বেশি খুঁটিনাটি থাকলে ও KB সীমা খুব কম হলে ওই পিক্সেল মাপে JPG আঁটে না। মুখ বা স্বাক্ষরে জুম করে ফ্রেমের খুঁটিনাটি কমান, অথবা ফর্মে অনুমতি থাকলে KB সীমা বাড়ান।',
    },
  },
  {
    q: { en: 'Which file do I upload to the form?', bn: 'ফর্মে কোন ফাইল আপলোড করব?' },
    a: {
      en: 'The JPG you download from this tool. Upload the photo file in the photo box and the signature file in the signature box, and check the preview on the form before you submit.',
      bn: 'এই টুল থেকে ডাউনলোড করা JPG। ছবির ঘরে ছবির ফাইল ও স্বাক্ষরের ঘরে স্বাক্ষরের ফাইল দিন, আর সাবমিটের আগে ফর্মের প্রিভিউ দেখে নিন।',
    },
  },
  {
    q: { en: 'Which size should I pick for a passport size photo?', bn: 'পাসপোর্ট সাইজ ছবির জন্য কোন মাপ বেছে নেব?' },
    a: {
      en: `The “Passport size” preset is ${mm('passport')}, which is ${px('passport').en} px at ${PRINT_DPI} DPI. It is a common size, not a rule for every form. If your form or embassy names a different size, use “Other size” and type it.`,
      bn: `“পাসপোর্ট সাইজ” প্রিসেট ${bnDigits(mm('passport')).replace('mm', 'মিমি')}, যা ${bnDigits(PRINT_DPI)} DPI-তে ${px('passport').bn} পিক্সেল। এটি প্রচলিত একটি মাপ, সব ফর্মের নিয়ম নয়। আপনার ফর্ম বা দূতাবাস অন্য মাপ বললে “অন্য মাপ” চেপে সেটি লিখুন।`,
    },
  },
  {
    q: { en: 'How many pixels is a 2×2 inch or 1×1 inch photo?', bn: '২×২ ইঞ্চি বা ১×১ ইঞ্চি ছবি কত পিক্সেল?' },
    a: {
      en: `At ${PRINT_DPI} DPI a 2×2 inch photo is ${px('inch2').en} px and a 1×1 inch photo is ${px('inch1').en} px. The tool works this out from the size in millimetres.`,
      bn: `৩০০ DPI-তে ২×২ ইঞ্চি ছবি ${px('inch2').bn} পিক্সেল ও ১×১ ইঞ্চি ছবি ${px('inch1').bn} পিক্সেল। টুল মিলিমিটারের মাপ থেকে হিসাব করে নেয়।`,
    },
  },
  {
    q: { en: 'Does making a file smaller blur my photo?', bn: 'ফাইল ছোট করলে কি ছবি ঝাপসা হয়?' },
    a: {
      en: 'A little, yes. The tool keeps the highest JPG quality that fits your KB target. For a very small target it also shrinks the pixel size step by step, and it tells you the final size. If even that is not enough, it shows the smallest file it could make.',
      bn: 'কিছুটা হয়। KB লক্ষ্যের মধ্যে টুল সর্বোচ্চ JPG মান রাখে। খুব ছোট লক্ষ্য হলে ধাপে ধাপে পিক্সেলও কমায় এবং চূড়ান্ত মাপ জানিয়ে দেয়। তাতেও না হলে সবচেয়ে ছোট যে ফাইল বানানো গেছে তার সাইজ দেখায়।',
    },
  },
  {
    q: { en: 'My iPhone photo will not open. Why?', bn: 'আইফোনের ছবি খুলছে না কেন?' },
    a: { en: 'It is probably a HEIC photo, which most browsers other than Safari cannot read. Open this page in Safari, or set the camera to “Most Compatible” (Settings > Camera > Formats), or save the photo as JPG first.', bn: 'সম্ভবত এটি HEIC ছবি, যা Safari ছাড়া বেশিরভাগ ব্রাউজার পড়তে পারে না। পেজটি Safari-তে খুলুন, অথবা ক্যামেরা “Most Compatible”-এ দিন (Settings > Camera > Formats), অথবা ছবিটি আগে JPG হিসেবে সেভ করুন।' },
  },
];

/** Links that exist in the app (checked against ROUTES in src/App.tsx and shared/guides.ts). */
export const PHOTO_RELATED: { href: string; label: Bilingual }[] = [
  { href: '/guides/teletalk-photo-signature-size', label: { en: 'Guide: Teletalk photo and signature rules (Bangla)', bn: 'গাইড: টেলিটকের ছবি ও স্বাক্ষরের নিয়ম' } },
  { href: '/tools/passport-size-photo-maker', label: { en: 'Passport size photo maker (35×45 mm and more)', bn: 'পাসপোর্ট সাইজ ছবি মেকার' } },
  { href: '/tools/professional-cv-photo', label: { en: 'Professional photo for your CV (white background, framing)', bn: 'সিভির জন্য পেশাদার ছবি (সাদা ব্যাকগ্রাউন্ড, ফ্রেমিং)' } },
  { href: '/builder', label: { en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' } },
  { href: '/tools/cv-checker', label: { en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' } },
  { href: '/tools/application-letter', label: { en: 'Application letter generator', bn: 'আবেদনপত্র জেনারেটর' } },
];

export const PHOTO_VERIFIED: Bilingual = { en: '28 November 2026', bn: '২৮ নভেম্বর ২০২৬' };

/** The direct answer at the top of the hub page (2 to 3 sentences). */
export const PHOTO_INTRO: Bilingual = {
  en: 'Many government job circulars ask for a colour photo of 300×300 px and a signature of 300×80 px, but the file-size limit and even the pixel size differ from portal to portal, so check your own circular first. Pick that size, a passport or stamp size, or a KB target below, and download a JPG. Your picture is processed in your browser and never uploaded.',
  bn: 'অনেক সরকারি চাকরির সার্কুলারে ৩০০×৩০০ পিক্সেলের রঙিন ছবি ও ৩০০×৮০ পিক্সেলের স্বাক্ষর চাওয়া হয়, তবে ফাইল সাইজের সীমা এমনকি পিক্সেল মাপও পোর্টালভেদে আলাদা, তাই আগে নিজের বিজ্ঞপ্তি দেখুন। নিচে ওই মাপ, পাসপোর্ট বা স্ট্যাম্প সাইজ, অথবা KB লক্ষ্য বেছে JPG ডাউনলোড করুন। ছবি আপনার ব্রাউজারেই প্রসেস হয়, আপলোড হয় না।',
};

export interface SizeSection {
  id: string;
  /** Preset the “use this size” button selects. */
  preset: string;
  h2: Bilingual;
  p: Bilingual[];
  /** Link to a dedicated page, when there is one. */
  more?: { href: string; label: Bilingual };
}

/** Anchored sections of the hub: one per size group. Each id is a #fragment people can link to. */
export const PHOTO_SECTIONS: SizeSection[] = [
  {
    id: 'teletalk-300x300',
    preset: 'photo',
    h2: { en: 'Photo 300×300 px for government job applications', bn: 'সরকারি চাকরির আবেদনের ছবি ৩০০×৩০০ পিক্সেল' },
    p: [
      {
        en: `${px('photo').en} px with up to 100 KB is the colour photo size quoted in many government job circulars, but limits differ by circular and portal: the CUET admission FAQ, for example, allows up to 300 KB. A file under 100 KB fits both. The “Photo” preset makes ${px('photo').en} px under 100 KB. Follow the limits in your own circular.`,
        bn: `৩০০×৩০০ পিক্সেল, ১০০ KB পর্যন্ত: অনেক সরকারি চাকরির সার্কুলারে রঙিন ছবির জন্য এই মাপই উদ্ধৃত হয়, তবে সার্কুলার ও পোর্টালভেদে সীমা আলাদা; যেমন CUET ভর্তি FAQ-তে সর্বোচ্চ ৩০০ KB। ১০০ KB-এর নিচে হলে দুটোই মেটে। “ছবি” প্রিসেট ${px('photo').bn} পিক্সেলে ১০০ KB-এর নিচে ফাইল বানায়। আপনার নিজের সার্কুলারের সীমাই মানুন।`,
      },
    ],
  },
  {
    id: 'signature-300x80',
    preset: 'signature',
    h2: { en: 'Signature 300×80 px', bn: 'স্বাক্ষর ৩০০×৮০ পিক্সেল' },
    p: [
      {
        en: `${px('signature').en} px with up to 60 KB is the signature size quoted in many government job circulars. Limits differ by circular and portal: CUET allows up to 100 KB, and the limits for some other circulars are reported differently in different places. The “Signature” preset makes ${px('signature').en} px under 60 KB and cleans the background to white. Follow the limits in your own circular.`,
        bn: `৩০০×৮০ পিক্সেল, ৬০ KB পর্যন্ত: অনেক সরকারি চাকরির সার্কুলারে স্বাক্ষরের জন্য এই মাপই উদ্ধৃত হয়। সার্কুলার ও পোর্টালভেদে সীমা আলাদা: CUET-এ সর্বোচ্চ ১০০ KB, আর অন্য কিছু সার্কুলারের সীমা বিভিন্ন জায়গায় বিভিন্নভাবে বলা হয়েছে। “স্বাক্ষর” প্রিসেট ${px('signature').bn} পিক্সেলে ৬০ KB-এর নিচে ফাইল বানায় ও ব্যাকগ্রাউন্ড সাদা করে। আপনার নিজের সার্কুলারের সীমাই মানুন।`,
      },
    ],
  },
  {
    id: 'passport-size',
    preset: 'passport',
    h2: { en: 'Passport size photo', bn: 'পাসপোর্ট সাইজ ছবি' },
    p: [
      {
        en: `“Passport size” is a printed size in millimetres, not a pixel size. ${mm('passport')} is a common passport-photo size and is the size listed by the Bangladesh Embassy in The Hague for e-passport applications (see the sources, checked 29 November 2026). That is ${px('passport').en} px at ${PRINT_DPI} DPI. Other offices or forms may ask for a different size (for example 45×55 mm printed or 25×30 mm online), so always follow the instruction of the office or form you are applying to.`,
        bn: `“পাসপোর্ট সাইজ” মানে ছাপা ছবির মাপ (মিলিমিটারে), পিক্সেল নয়। ${bnDigits(mm('passport')).replace('mm', 'মিমি')} পাসপোর্ট ছবির একটি প্রচলিত মাপ, এবং ই-পাসপোর্টের আবেদনে হেগে বাংলাদেশ দূতাবাসও এই মাপ উল্লেখ করেছে (সূত্র দেখুন, ২৯ নভেম্বর ২০২৬ তারিখে দেখা)। ${bnDigits(PRINT_DPI)} DPI-তে এটি ${px('passport').bn} পিক্সেল। অন্য অফিস বা ফর্মে ভিন্ন মাপ চাওয়া হতে পারে (যেমন ছাপা ছবিতে ৪৫×৫৫ মিমি বা অনলাইনে ২৫×৩০ মিমি), তাই যে অফিস বা ফর্মে আবেদন করছেন তার নির্দেশনাই মানুন।`,
      },
    ],
    more: { href: '/tools/passport-size-photo-maker', label: { en: 'How to take and make a passport size photo', bn: 'পাসপোর্ট সাইজ ছবি তোলা ও বানানোর নিয়ম' } },
  },
  {
    id: 'stamp-size',
    preset: 'stamp',
    h2: { en: 'Stamp size photo', bn: 'স্ট্যাম্প সাইজ ছবি' },
    p: [
      {
        en: `A stamp size photo is smaller than a passport photo. ${mm('stamp')} is often quoted, which is ${px('stamp').en} px at ${PRINT_DPI} DPI, but other stamp sizes exist. Check the size your form asks for.`,
        bn: `স্ট্যাম্প সাইজ ছবি পাসপোর্ট সাইজের চেয়ে ছোট। প্রায়ই ${bnDigits(mm('stamp')).replace('mm', 'মিমি')} বলা হয়, যা ${bnDigits(PRINT_DPI)} DPI-তে ${px('stamp').bn} পিক্সেল; তবে অন্য স্ট্যাম্প মাপও আছে। আপনার ফর্মে কোন মাপ চাওয়া হয়েছে দেখে নিন।`,
      },
    ],
  },
  {
    id: 'compress-kb',
    preset: 'kb-100',
    h2: { en: 'Make a photo smaller in KB', bn: 'ছবির ফাইল সাইজ KB-তে কমানো' },
    p: [
      {
        en: 'If a form only limits the file size, pick about 20, 50, 100 or 200 KB. The picture keeps its own shape and is not cropped. The tool keeps the best JPG quality under the target (1 KB is counted as 1,024 bytes), shrinks the pixels step by step if it must, and shows the smallest size it reached if the target is too low.',
        bn: 'ফর্মে শুধু ফাইল সাইজের সীমা থাকলে প্রায় ২০, ৫০, ১০০ বা ২০০ KB বেছে নিন। ছবির আকৃতি অপরিবর্তিত থাকে, কাটা হয় না। টুল KB লক্ষ্যের মধ্যে সবচেয়ে ভালো JPG মান রাখে (১ KB = ১,০২৪ বাইট ধরা হয়), দরকার হলে ধাপে ধাপে পিক্সেল কমায়, আর লক্ষ্য খুব কম হলে সবচেয়ে ছোট যে সাইজে পৌঁছেছে তা দেখায়।',
      },
    ],
  },
];

export interface PhotoSource { label: Bilingual; url: string; note: Bilingual; official: boolean }

export const PHOTO_SOURCES: PhotoSource[] = [
  {
    label: { en: 'CUET admission FAQ', bn: 'CUET ভর্তি FAQ' },
    url: 'https://admissioncuet.ac.bd/faq',
    note: { en: 'Photo 300×300 px up to 300 KB; signature 300×80 px up to 100 KB. Opened and checked on 28 November 2026. This is an admission portal, not a job circular.', bn: 'ছবি ৩০০×৩০০ px, সর্বোচ্চ ৩০০ KB; স্বাক্ষর ৩০০×৮০ px, সর্বোচ্চ ১০০ KB। ২৮ নভেম্বর ২০২৬ তারিখে খুলে যাচাই করা। এটি ভর্তি পোর্টাল, চাকরির সার্কুলার নয়।' },
    official: true,
  },
  {
    label: { en: 'Bangladesh Embassy in The Hague, e-passport page (mofa.gov.bd)', bn: 'হেগে বাংলাদেশ দূতাবাস, ই-পাসপোর্ট পেজ (mofa.gov.bd)' },
    url: 'https://hague.mofa.gov.bd/pages/static-pages/e-passport-69595bcb2b767a2ae71c42e3',
    note: { en: 'Lists “Three (03) passport-size photographs (Size: 35 mm x 45 mm)” for e-passport applications. A government page, but for that mission only. Checked 29 November 2026.', bn: 'ই-পাসপোর্ট আবেদনে “Three (03) passport-size photographs (Size: 35 mm x 45 mm)” লেখা আছে। এটি সরকারি পেজ, তবে শুধু ওই মিশনের জন্য। ২৯ নভেম্বর ২০২৬ তারিখে দেখা।' },
    official: true,
  },
  {
    label: { en: 'passport-photo.online stamp size page (commercial)', bn: 'passport-photo.online স্ট্যাম্প সাইজ পেজ (বাণিজ্যিক সাইট)' },
    url: 'https://passport-photo.online/en-in/stamp-size-photo',
    note: { en: `Lists ${mm('stamp')} as the base stamp size and mentions other variants. Not an official source. Checked on 28 November 2026.`, bn: `${bnDigits(mm('stamp')).replace('mm', 'মিমি')}-কে মূল স্ট্যাম্প সাইজ বলে এবং অন্য মাপের কথাও বলে। সরকারি সূত্র নয়। ২৮ নভেম্বর ২০২৬ তারিখে দেখা।` },
    official: false,
  },
];

/** Shown under the sources: how far the Teletalk-style figures are checked. */
export const PHOTO_FIGURES_NOTE: Bilingual = {
  en: 'We have not opened the original circular PDFs; figures are as quoted in circular texts republished by job sites and may change. Limits differ by circular and portal, and some are reported differently across sources.',
  bn: 'আমরা মূল সার্কুলার PDF খুলে দেখিনি; সংখ্যাগুলো চাকরির সাইটে পুনঃপ্রকাশিত সার্কুলারের লেখা থেকে নেওয়া এবং বদলাতে পারে। সার্কুলার ও পোর্টালভেদে সীমা আলাদা, আর কিছু সীমা বিভিন্ন সূত্রে বিভিন্নভাবে বলা হয়েছে।',
};
