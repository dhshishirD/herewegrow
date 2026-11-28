// Words for the professional CV photo maker page (src/pages/ProCvPhoto.tsx). Shared with the build-time SEO page
// (scripts/seo.ts) so the static HTML carries the same text. The tool's own button and error texts live in
// src/components/CvPhotoTool.tsx and shared/cvPhoto.ts.
// (The blog post cv-te-chobi-dewa-uchit-ki links here but is not linked back: it goes live on 2026-12-04, so a link now would be dead.)
// Nothing here states a rule of any employer, portal or office. Advice is written as advice.

import type { Bilingual } from './photoResizerContent';

export const CVPHOTO_PATH = '/tools/professional-cv-photo';
export const CVPHOTO_UPDATED_LABEL: Bilingual = { en: '28 November 2026', bn: '২৮ নভেম্বর ২০২৬' };
export const CVPHOTO_AUTHOR = { name: 'Daloyar Hassan Shishir', url: '/about' } as const;
export const CVPHOTO_MODEL = { id: 'Xenova/modnet', license: 'Apache-2.0', cardUrl: 'https://huggingface.co/Xenova/modnet' } as const;

export const CVPHOTO_H1: Bilingual = { en: 'Professional photo for your CV', bn: 'সিভির জন্য পেশাদার ছবি বানান' };

export const CVPHOTO_INTRO: Bilingual = {
  en: 'Choose a photo, remove the background in your browser, put it on white, light blue or light grey, and frame your head and shoulders. Free, with no limit, and your photo is never uploaded.',
  bn: 'ছবি বেছে নিন, ব্রাউজারেই ব্যাকগ্রাউন্ড সরান, সাদা, হালকা নীল বা হালকা ধূসর বসান এবং মাথা-কাঁধ ফ্রেমে সাজান। ফ্রি, কোনো সীমা নেই, আর আপনার ছবি আপলোড হয় না।',
};

/** The short answer, first thing under the tool. */
export const CVPHOTO_ANSWER: Bilingual = {
  en: 'A CV photo is usually a clear head-and-shoulders picture on a plain, light background. This tool takes your own photo, cuts out the background, puts a plain colour behind you and crops it to 4:5, 1:1 or 35×45 mm. White or a light neutral colour is the safe choice. It changes only the background, the framing and the light. It does not change your face or your clothes.',
  bn: 'সিভির ছবি সাধারণত পরিষ্কার মাথা-কাঁধের ছবি, সাদামাটা হালকা ব্যাকগ্রাউন্ডে। এই টুল আপনার নিজের ছবি নিয়ে ব্যাকগ্রাউন্ড কেটে সরায়, পেছনে একরঙা রং বসায় এবং ৪:৫, ১:১ বা ৩৫×৪৫ মিমি আকারে কেটে দেয়। সাদা বা হালকা নিরপেক্ষ রং নিরাপদ পছন্দ। টুলটি শুধু ব্যাকগ্রাউন্ড, ফ্রেমিং ও আলো বদলায়। আপনার মুখ বা পোশাক বদলায় না।',
};

export const CVPHOTO_STEPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: 'Choose your photo', bn: 'ছবি বেছে নিন' },
    body: { en: 'Pick a JPG, PNG or WebP photo of yourself, facing the camera in good light. A large camera photo is fine, the tool shrinks the copy it works on.', bn: 'নিজের একটি JPG, PNG বা WebP ছবি নিন, ভালো আলোয় ক্যামেরার দিকে তাকানো। ক্যামেরার বড় ছবিও চলবে, টুল কাজের কপিটি নিজে ছোট করে নেয়।' },
  },
  {
    title: { en: 'Press “Make my CV photo”', bn: '“আমার সিভি ছবি বানান” চাপুন' },
    body: { en: 'The first time, the tool downloads the background-removal files once. A progress bar shows how far it is. Then the cut-out takes a few seconds.', bn: 'প্রথমবার টুল ব্যাকগ্রাউন্ড সরানোর ফাইলগুলো একবার নামায়। কতদূর হলো তা প্রগ্রেস বারে দেখা যায়। তারপর কাটতে কয়েক সেকেন্ড লাগে।' },
  },
  {
    title: { en: 'Check the result', bn: 'ফলাফল দেখুন' },
    body: { en: 'The best settings are already applied: white background, head and shoulders framed, light evened out. Slide between before and after. Then change the colour, the shape, the zoom or the light if you like.', bn: 'সেরা সেটিং আগেই বসে যায়: সাদা ব্যাকগ্রাউন্ড, মাথা-কাঁধ ফ্রেমে, আলো সমান। আগে ও পরে স্লাইড করে মিলিয়ে দেখুন। চাইলে রং, আকার, জুম বা আলো বদলান।' },
  },
  {
    title: { en: 'Download', bn: 'ডাউনলোড করুন' },
    body: { en: 'Download cv-photo.jpg, or a PNG (with a transparent background if you choose). The size in pixels and in KB is shown. If a form needs an exact KB or pixel size, run the file through the photo and signature resizer afterwards.', bn: 'cv-photo.jpg ডাউনলোড করুন, অথবা PNG (চাইলে স্বচ্ছ ব্যাকগ্রাউন্ডসহ)। পিক্সেল ও KB সাইজ দেখানো হয়। কোনো ফর্মে নির্দিষ্ট KB বা পিক্সেল লাগলে পরে ফাইলটি ছবি ও স্বাক্ষর রিসাইজারে দিন।' },
  },
];

export const CVPHOTO_TAKE_HEADING: Bilingual = { en: 'How to take a better source photo', bn: 'ভালো মূল ছবি তোলার উপায়' };
export const CVPHOTO_TAKE_INTRO: Bilingual = {
  en: 'These are general photography tips, not rules of any employer. A better photo gives a cleaner cut-out.',
  bn: 'এগুলো সাধারণ ফটোগ্রাফির পরামর্শ, কোনো নিয়োগকর্তার নিয়ম নয়। মূল ছবি ভালো হলে কাটাও পরিষ্কার হয়।',
};
export const CVPHOTO_TAKE: Bilingual[] = [
  { en: 'Face a window so the light falls on your face from the front. Avoid a bright window behind you.', bn: 'জানালার দিকে মুখ করুন, যাতে সামনে থেকে মুখে আলো পড়ে। পেছনে উজ্জ্বল জানালা এড়ান।' },
  { en: 'Stand a little away from a plain wall. A plain, even wall behind you makes the edges of hair easier to cut.', bn: 'সাদামাটা দেয়াল থেকে একটু সরে দাঁড়ান। পেছনে সমান রঙের দেয়াল থাকলে চুলের কিনারা কাটা সহজ হয়।' },
  { en: 'Put the camera at eye level, with your head and shoulders in the middle and a little space above your head.', bn: 'ক্যামেরা চোখের সমান উচ্চতায় রাখুন; মাথা-কাঁধ মাঝখানে, মাথার ওপরে একটু জায়গা।' },
  { en: 'Wipe the lens and keep still so the photo is sharp. Turn filters and beauty mode off.', bn: 'লেন্স মুছে স্থির থাকুন, যাতে ছবি স্পষ্ট হয়। ফিল্টার ও বিউটি মোড বন্ধ রাখুন।' },
  { en: 'Wear something that does not match the wall colour. Clothes the same colour as the wall can be cut out by mistake.', bn: 'দেয়ালের রঙের সঙ্গে না মেলে এমন পোশাক পরুন। দেয়ালের একই রঙের পোশাক ভুল করে কেটে যেতে পারে।' },
];

export const CVPHOTO_COLOURS_HEADING: Bilingual = { en: 'Which background colour?', bn: 'কোন ব্যাকগ্রাউন্ড রং নেবেন?' };
export const CVPHOTO_COLOURS: Bilingual[] = [
  { en: 'White or a light neutral colour (light grey, light blue) is the safe choice. This is our advice, not a rule.', bn: 'সাদা বা হালকা নিরপেক্ষ রং (হালকা ধূসর, হালকা নীল) নিরাপদ পছন্দ। এটি আমাদের পরামর্শ, কোনো নিয়ম নয়।' },
  { en: 'Dark or bright colours pull the eye away from your face. Use “Your colour” only if you have a reason.', bn: 'গাঢ় বা ঝলমলে রং মুখ থেকে চোখ সরায়। বিশেষ কারণ থাকলেই “নিজের রং” নিন।' },
  { en: 'If a form or an employer names a background colour, use the colour it names.', bn: 'কোনো ফর্ম বা নিয়োগকর্তা নির্দিষ্ট রং বললে সেই রংই নিন।' },
];

export const CVPHOTO_MISTAKES: Bilingual[] = [
  { en: 'Starting from a dark, blurry or tilted photo. The tool cannot add detail that the photo does not have.', bn: 'অন্ধকার, ঝাপসা বা কাত ছবি দিয়ে শুরু করা। ছবিতে যে বিবরণ নেই, টুল তা যোগ করতে পারে না।' },
  { en: 'Cropping too tight, so the top of the head or the chin is cut off. Leave a little space around the head and shoulders.', bn: 'বেশি কাছ থেকে কাটা, ফলে মাথার উপরের বা থুতনির অংশ কেটে যায়। মাথা-কাঁধের চারপাশে একটু জায়গা রাখুন।' },
  { en: 'A colour that is too dark or too strong, or a custom colour that clashes with your clothes.', bn: 'খুব গাঢ় বা ঝলমলে রং, বা পোশাকের সঙ্গে না মেলা নিজের রং।' },
  { en: 'Pushing brightness and contrast too far, so skin looks washed out or orange.', bn: 'উজ্জ্বলতা ও কনট্রাস্ট বেশি বাড়ানো, ফলে ত্বক ফ্যাকাশে বা কমলা দেখায়।' },
  { en: 'Using the edited photo where the form asks for a genuine, unedited photo (see below).', bn: 'যেখানে ফর্মে আসল, অসম্পাদিত ছবি চাওয়া হয়েছে, সেখানে এই সম্পাদিত ছবি ব্যবহার করা (নিচে দেখুন)।' },
];

export const CVPHOTO_NOT_HEADING: Bilingual = { en: 'When not to use this tool', bn: 'কখন এই টুল ব্যবহার করবেন না' };
export const CVPHOTO_NOT: Bilingual[] = [
  { en: 'Do not use it for a government or official form, a passport or visa application, an exam form or a Teletalk job application if the form asks for a genuine, unedited photo. Replacing the background is an edit. Read what your own form says.', bn: 'সরকারি বা আনুষ্ঠানিক ফর্ম, পাসপোর্ট বা ভিসার আবেদন, পরীক্ষার ফর্ম বা টেলিটকের চাকরির আবেদনে যদি আসল, অসম্পাদিত ছবি চাওয়া হয়, তাহলে এটি ব্যবহার করবেন না। ব্যাকগ্রাউন্ড বদলানো মানে ছবি সম্পাদনা। আপনার নিজের ফর্মে কী লেখা আছে তা পড়ুন।' },
  { en: 'For those forms, use the photo and signature resizer. It only resizes and compresses, it does not remove the background.', bn: 'সেসব ফর্মে ছবি ও স্বাক্ষর রিসাইজার ব্যবহার করুন। সেটি শুধু মাপ ও সাইজ ঠিক করে, ব্যাকগ্রাউন্ড সরায় না।' },
  { en: 'The 35×45 mm shape only sets the crop and the pixel size. It does not make a photo valid for any passport office.', bn: '৩৫×৪৫ মিমি আকার শুধু ক্রপ ও পিক্সেল মাপ ঠিক করে। এতে ছবি কোনো পাসপোর্ট অফিসের জন্য গ্রহণযোগ্য হয়ে যায় না।' },
];

export const CVPHOTO_PASSPORTSTYLE: { h2: Bilingual; p: Bilingual } = {
  h2: { en: 'Passport-style white background for a CV or profile', bn: 'সিভি বা প্রোফাইলের জন্য পাসপোর্ট-ধাঁচের সাদা ব্যাকগ্রাউন্ড' },
  p: {
    en: 'Many people want the neat look of a passport-style photo (plain light background, head and shoulders) for a CV or a profile picture. This tool can give that look with a white background and the 35×45 mm shape. It is a look for CVs and profiles, not a photo for official use. For a printed passport size file with no edits, use the passport size photo maker.',
    bn: 'অনেকে সিভি বা প্রোফাইল ছবির জন্য পাসপোর্ট-ধাঁচের গোছানো লুক (সাদামাটা হালকা ব্যাকগ্রাউন্ড, মাথা-কাঁধ) চান। সাদা ব্যাকগ্রাউন্ড ও ৩৫×৪৫ মিমি আকারে এই টুল সেই লুক দিতে পারে। এটি সিভি ও প্রোফাইলের লুক, সরকারি কাজের ছবি নয়। কোনো সম্পাদনা ছাড়া ছাপার পাসপোর্ট সাইজ ফাইল লাগলে পাসপোর্ট সাইজ ছবি মেকার ব্যবহার করুন।',
  },
};

export const CVPHOTO_LIMITS: Bilingual[] = [
  { en: 'Fine hair, frizzy hair and the gaps between hair strands are the hardest part. Check the edges by zooming in before you download.', bn: 'সূক্ষ্ম বা উসকোখুসকো চুল ও চুলের ফাঁক সবচেয়ে কঠিন অংশ। ডাউনলোডের আগে জুম করে কিনারা দেখে নিন।' },
  { en: 'A busy background, or a background close to the colour of your hair or clothes, can cause mistakes.', bn: 'ভিড়ের ব্যাকগ্রাউন্ড, বা চুল ও পোশাকের কাছাকাছি রঙের ব্যাকগ্রাউন্ডে ভুল হতে পারে।' },
  { en: 'The tool is made for one person in the photo.', bn: 'টুলটি ছবিতে একজন মানুষের জন্য তৈরি।' },
];

export const CVPHOTO_PRIVACY: Bilingual[] = [
  { en: 'Your photo stays on your device. It is opened in your browser, a shrunk copy is passed to a background process (a Web Worker) in the same browser, and the cut-out is made there. The photo, the cut-out and the file you download are never uploaded or saved by us.', bn: 'আপনার ছবি আপনার ডিভাইসেই থাকে। ছবি ব্রাউজারে খোলে, ছোট করা একটি কপি একই ব্রাউজারের ব্যাকগ্রাউন্ড প্রসেসে (Web Worker) যায়, আর কাটা সেখানেই হয়। ছবি, কাটা অংশ ও ডাউনলোড করা ফাইল আমরা কখনও আপলোড বা সেভ করি না।' },
  { en: 'What does get downloaded: when you press the button for the first time, your browser downloads the model file from Hugging Face (huggingface.co) and the runtime engine files from the jsDelivr CDN (cdn.jsdelivr.net). These are downloads only, they carry no part of your photo, and your browser keeps them for next time. Like any download, those servers can see your internet address.', bn: 'যা নামানো হয়: প্রথমবার বাটন চাপলে আপনার ব্রাউজার মডেল ফাইল Hugging Face (huggingface.co) থেকে এবং রানটাইম ইঞ্জিনের ফাইল jsDelivr CDN (cdn.jsdelivr.net) থেকে নামায়। এগুলো শুধু ডাউনলোড, এতে আপনার ছবির কোনো অংশ যায় না, আর ব্রাউজার পরের বার ব্যবহারের জন্য রেখে দেয়। যেকোনো ডাউনলোডের মতো ওই সার্ভার আপনার ইন্টারনেট ঠিকানা দেখতে পায়।' },
  { en: 'Nothing is needed to sign in, and there is no limit on how many photos you make.', bn: 'সাইন-ইন লাগে না, কতগুলো ছবি বানাবেন তারও সীমা নেই।' },
];

export const CVPHOTO_DOWNLOAD_NOTE: Bilingual = {
  en: 'The model file (a few tens of MB) and the runtime engine files (the main one is about 27 MB before compression) are downloaded once on first use. The exact model size is shown on your screen while it downloads. Use Wi-Fi if you are on a small data pack.',
  bn: 'মডেল ফাইল (কয়েক দশ MB) ও রানটাইম ইঞ্জিনের ফাইল (প্রধানটি কম্প্রেসের আগে প্রায় ২৭ MB) প্রথমবার ব্যবহারে একবার নামে। মডেলের সঠিক সাইজ নামার সময় আপনার স্ক্রিনেই দেখানো হয়। ডেটা প্যাকেজ ছোট হলে Wi-Fi ব্যবহার করুন।',
};

export const CVPHOTO_FAQ: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { en: 'Is the professional CV photo maker free?', bn: 'প্রফেশনাল সিভি ছবি মেকার কি ফ্রি?' },
    a: { en: 'Yes. It is free, there is no sign-in and no limit on how many photos you make.', bn: 'হ্যাঁ। এটি ফ্রি, সাইন-ইন লাগে না, আর কতগুলো ছবি বানাবেন তার সীমা নেই।' },
  },
  {
    q: { en: 'Is my photo uploaded?', bn: 'আমার ছবি কি আপলোড হয়?' },
    a: { en: 'No. The photo is processed inside your browser. Only the model and engine files are downloaded to your device, and they contain no part of your photo.', bn: 'না। ছবি আপনার ব্রাউজারের ভেতরেই প্রসেস হয়। শুধু মডেল ও ইঞ্জিনের ফাইল আপনার ডিভাইসে নামে, আর তাতে আপনার ছবির কোনো অংশ থাকে না।' },
  },
  {
    q: { en: 'Why does it take longer the first time?', bn: 'প্রথমবার বেশি সময় লাগে কেন?' },
    a: { en: 'The first time, the browser downloads the model and engine files. They are cached, so the next time only the cut-out itself takes time. A phone can be slower than a computer.', bn: 'প্রথমবার ব্রাউজার মডেল ও ইঞ্জিনের ফাইল নামায়। সেগুলো ক্যাশে থাকে, তাই পরের বার শুধু কাটার সময়টুকু লাগে। ফোনে কম্পিউটারের চেয়ে বেশি সময় লাগতে পারে।' },
  },
  {
    q: { en: 'Which background colour is best for a CV photo?', bn: 'সিভির ছবির জন্য কোন ব্যাকগ্রাউন্ড রং ভালো?' },
    a: { en: 'White or a light neutral colour such as light grey or light blue is the safe choice. That is advice, not a rule. If a form or employer names a colour, use that one.', bn: 'সাদা বা হালকা নিরপেক্ষ রং, যেমন হালকা ধূসর বা হালকা নীল, নিরাপদ পছন্দ। এটি পরামর্শ, নিয়ম নয়। কোনো ফর্ম বা নিয়োগকর্তা রং বললে সেটিই নিন।' },
  },
  {
    q: { en: 'Can I use this photo for a government form, passport or exam application?', bn: 'সরকারি ফর্ম, পাসপোর্ট বা পরীক্ষার আবেদনে কি এই ছবি চলবে?' },
    a: { en: 'Only if that form accepts an edited photo. Many ask for a genuine, unedited photo, and changing the background is an edit. Check your form. To only resize a photo, use the photo and signature resizer.', bn: 'শুধু যদি সেই ফর্ম সম্পাদিত ছবি নেয়। অনেক ফর্মে আসল, অসম্পাদিত ছবি চাওয়া হয়, আর ব্যাকগ্রাউন্ড বদলানো মানে সম্পাদনা। নিজের ফর্ম দেখুন। শুধু মাপ বদলাতে চাইলে ছবি ও স্বাক্ষর রিসাইজার ব্যবহার করুন।' },
  },
  {
    q: { en: 'Does it change my face, skin or clothes?', bn: 'এটি কি আমার মুখ, ত্বক বা পোশাক বদলায়?' },
    a: { en: 'No. It does not smooth skin, change your face or change your clothes. It only changes the background, the framing and the overall light (brightness, contrast and an automatic levels step).', bn: 'না। এটি ত্বক মসৃণ করে না, মুখ বা পোশাক বদলায় না। শুধু ব্যাকগ্রাউন্ড, ফ্রেমিং ও সার্বিক আলো (উজ্জ্বলতা, কনট্রাস্ট ও অটো লেভেল) বদলায়।' },
  },
];

export const CVPHOTO_SOURCES: { label: Bilingual; url: string; note: Bilingual }[] = [
  {
    label: { en: 'Hugging Face model card: Xenova/modnet', bn: 'Hugging Face মডেল কার্ড: Xenova/modnet' },
    url: CVPHOTO_MODEL.cardUrl,
    note: { en: 'The background-removal model this tool uses. The card lists the license as Apache-2.0. Checked 28 November 2026.', bn: 'এই টুল যে ব্যাকগ্রাউন্ড সরানোর মডেল ব্যবহার করে। কার্ডে লাইসেন্স Apache-2.0 লেখা। ২৮ নভেম্বর ২০২৬ তারিখে দেখা।' },
  },
  {
    label: { en: 'Transformers.js (Hugging Face)', bn: 'Transformers.js (Hugging Face)' },
    url: 'https://github.com/huggingface/transformers.js',
    note: { en: 'The library that runs the model in the browser. The package license is Apache-2.0 (from its package.json, checked 28 November 2026).', bn: 'যে লাইব্রেরি ব্রাউজারে মডেল চালায়। প্যাকেজের লাইসেন্স Apache-2.0 (package.json থেকে, ২৮ নভেম্বর ২০২৬ তারিখে দেখা)।' },
  },
];

export const CVPHOTO_RELATED: { href: string; label: Bilingual }[] = [
  { href: '/tools/photo-signature-resizer', label: { en: 'Photo and signature resizer (exact pixels and KB)', bn: 'ছবি ও স্বাক্ষর রিসাইজার (নির্দিষ্ট পিক্সেল ও KB)' } },
  { href: '/tools/passport-size-photo-maker', label: { en: 'Passport size photo maker (no background change)', bn: 'পাসপোর্ট সাইজ ছবি মেকার (ব্যাকগ্রাউন্ড বদল ছাড়া)' } },
  { href: '/cv-format-bd', label: { en: 'CV format in Bangladesh (guide)', bn: 'বাংলাদেশে সিভি ফরম্যাট (গাইড)' } },
  { href: '/builder', label: { en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' } },
];
