// Words under the photo and signature resizer: how to use it, formats, privacy, why uploads get rejected and the FAQ.
// Shared so the build-time SEO page (scripts/seo.ts) prints the same text the React page shows.
// No pixel or KB figures are written here on purpose: they are not tied to an official notice yet.
// The tool's own presets (src/pages/PhotoResizer.tsx) carry the sizes.

export interface Bilingual { en: string; bn: string }

export const PHOTO_UPDATED = '2026-11-28';
export const PHOTO_UPDATED_LABEL: Bilingual = { en: '28 November 2026', bn: '২৮ নভেম্বর ২০২৬' };
export const PHOTO_AUTHOR = { name: 'Daloyar Hassan Shishir', url: '/about' } as const;

export const PHOTO_STEPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: 'Pick photo or signature', bn: 'ছবি না স্বাক্ষর, বেছে নিন' },
    body: {
      en: 'Tap “Photo” or “Signature” to load the size and file limit. Need something else? Tap “Other size” and type your own width, height and KB.',
      bn: '“ছবি” বা “স্বাক্ষর” চাপলে মাপ ও ফাইল সাইজের সীমা নিজে থেকে বসে যায়। অন্য কিছু লাগলে “অন্য মাপ” চেপে নিজের প্রস্থ, উচ্চতা ও KB লিখুন।',
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
];

/** Links that exist in the app (checked against ROUTES in src/App.tsx and shared/guides.ts). */
export const PHOTO_RELATED: { href: string; label: Bilingual }[] = [
  { href: '/guides/teletalk-photo-signature-size', label: { en: 'Guide: Teletalk photo and signature rules (Bangla)', bn: 'গাইড: টেলিটকের ছবি ও স্বাক্ষরের নিয়ম' } },
  { href: '/builder', label: { en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' } },
  { href: '/tools/cv-checker', label: { en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' } },
  { href: '/tools/application-letter', label: { en: 'Application letter generator', bn: 'আবেদনপত্র জেনারেটর' } },
];
