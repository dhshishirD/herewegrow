// Copy for the "CV for abroad" landing pages, shared by the app and the build-time SEO pages
// (scripts/seo.ts) so both always say the same thing.
// Country norms change: re-check them against current sources and update `lastChecked` before each edit goes live.

import type { Bilingual } from './catalog';

export type AbroadKind = 'gulf';

export interface AbroadPage {
  kind: AbroadKind;
  path: string;
  presetId: string;
  /** ISO date the country norms below were last checked against current sources. */
  lastChecked: string;
  eyebrow: Bilingual;
  title: Bilingual;
  lead: Bilingual;
  expect: { title: Bilingual; body: Bilingual }[];
  steps: { title: Bilingual; body: Bilingual }[];
  safety: Bilingual[];
  faq: { q: Bilingual; a: Bilingual }[];
}

export const ABROAD_PAGES: Record<AbroadKind, AbroadPage> = {
  gulf: {
    kind: 'gulf',
    path: '/cv-for-gulf-jobs',
    presetId: 'gulf',
    lastChecked: '2026-11-08',
    eyebrow: { en: 'Gulf job CV', bn: 'গাল্ফ চাকরির সিভি' },
    title: {
      en: 'Gulf job CV format for Bangladeshi applicants, built on your phone',
      bn: 'বাংলাদেশি আবেদনকারীর জন্য গাল্ফ চাকরির সিভি ফরম্যাট, ফোনেই বানান',
    },
    lead: {
      en: 'Applying to Saudi Arabia, UAE, Qatar, Kuwait or Oman? Fill one form, get a clean one-page CV with photo and the personal details Gulf employers usually look for. Free to start.',
      bn: 'সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার, কুয়েত বা ওমানে আবেদন করছেন? একটি ফর্ম পূরণ করুন, ছবি ও গাল্ফের নিয়োগকর্তারা সাধারণত যে ব্যক্তিগত তথ্য দেখতে চান সেগুলোসহ পরিষ্কার এক পাতার সিভি পান। শুরু বিনামূল্যে।',
    },
    expect: [
      { title: { en: 'A passport-style photo', bn: 'পাসপোর্ট-স্টাইল ছবি' }, body: { en: 'Many Gulf employers and job boards expect one, neutral background, business-like. Some online systems prefer none, so follow the job ad.', bn: 'গাল্ফের অনেক নিয়োগকর্তা ও জব বোর্ড ছবি আশা করে: সাদামাটা ব্যাকগ্রাউন্ড, ভদ্র পোশাক। কিছু অনলাইন সিস্টেমে ছবি না দেওয়াই ভালো, তাই বিজ্ঞাপনের নির্দেশ মেনে চলুন।' } },
      { title: { en: 'Nationality and personal details', bn: 'জাতীয়তা ও ব্যক্তিগত তথ্য' }, body: { en: 'Nationality, date of birth and marital status are commonly listed near the top. Passport number and visa status are often asked for too, add them only if the job asks.', bn: 'জাতীয়তা, জন্মতারিখ ও বৈবাহিক অবস্থা সাধারণত উপরের দিকে থাকে। পাসপোর্ট নম্বর ও ভিসার অবস্থাও অনেক সময় চায়, চাকরির বিজ্ঞাপনে চাইলে তবেই দিন।' } },
      { title: { en: 'Short and clear', bn: 'ছোট ও পরিষ্কার' }, body: { en: 'One page for most roles, recent jobs first, with employer, country and dates. Recruiters read in seconds.', bn: 'বেশিরভাগ পদের জন্য এক পাতা, সাম্প্রতিক চাকরি আগে, নিয়োগকর্তা, দেশ ও তারিখসহ। রিক্রুটাররা কয়েক সেকেন্ডে পড়েন।' } },
      { title: { en: 'Skills, trade and licences', bn: 'স্কিল, ট্রেড ও লাইসেন্স' }, body: { en: 'Trade certificates, driving licence, languages (Arabic, English, Hindi/Urdu) and Gulf experience belong in plain sight.', bn: 'ট্রেড সনদ, ড্রাইভিং লাইসেন্স, ভাষা (আরবি, ইংরেজি, হিন্দি/উর্দু) ও গাল্ফের অভিজ্ঞতা সহজে চোখে পড়ার মতো রাখুন।' } },
      { title: { en: 'PDF with a clean file name', bn: 'পরিষ্কার নামে PDF' }, body: { en: 'Send a PDF named like Name_CV.pdf, unless the employer asks for Word. Your name must match your passport.', bn: 'নিয়োগকর্তা Word না চাইলে Name_CV.pdf নামে PDF পাঠান। নাম অবশ্যই পাসপোর্টের সঙ্গে মিলতে হবে।' } },
    ],
    steps: [
      { title: { en: 'Open the Gulf CV', bn: 'গাল্ফ সিভি খুলুন' }, body: { en: 'One tap sets a photo design, one page and the personal-details block.', bn: 'এক ট্যাপে ছবিসহ ডিজাইন, এক পাতা ও ব্যক্তিগত তথ্যের অংশ সেট হয়ে যায়।' } },
      { title: { en: 'Fill the form on your phone', bn: 'ফোনেই ফর্ম পূরণ করুন' }, body: { en: 'Add photo, jobs, skills and languages. Your CV stays on your device.', bn: 'ছবি, কাজের অভিজ্ঞতা, স্কিল ও ভাষা যোগ করুন। সিভি আপনার ডিভাইসেই থাকে।' } },
      { title: { en: 'Download the PDF', bn: 'PDF নামান' }, body: { en: 'Free with a small footer mark. Pro removes it and adds Word export.', bn: 'ছোট ফুটার চিহ্নসহ বিনামূল্যে। Pro-তে চিহ্ন থাকে না, Word এক্সপোর্টও পান।' } },
    ],
    safety: [
      { en: 'HereWeGrow only helps with your CV. We are not a recruiting agency and we do not sell visas or jobs.', bn: 'HereWeGrow শুধু আপনার সিভিতে সাহায্য করে। আমরা রিক্রুটিং এজেন্সি নই, ভিসা বা চাকরি বিক্রি করি না।' },
      { en: 'Before you pay any agency, check its RL licence number in the BMET public agent list, and never pay for a job you have not seen a contract for.', bn: 'কোনো এজেন্সিকে টাকা দেওয়ার আগে BMET-এর প্রকাশ্য এজেন্ট তালিকায় তাদের RL লাইসেন্স নম্বর মিলিয়ে নিন, আর চুক্তি না দেখে কোনো চাকরির জন্য টাকা দেবেন না।' },
    ],
    faq: [
      { q: { en: 'Should my Gulf CV have a photo?', bn: 'গাল্ফ সিভিতে ছবি থাকবে কি?' }, a: { en: 'Often yes for emailed CVs and Gulf job boards, usually a passport-style photo. If an online form or the job ad says no photo, remove it in the builder.', bn: 'ইমেইলে পাঠানো সিভি ও গাল্ফের জব বোর্ডে সাধারণত হ্যাঁ, পাসপোর্ট-স্টাইল ছবি। অনলাইন ফর্ম বা বিজ্ঞাপনে ছবি না চাইলে বিল্ডারে ছবি সরিয়ে ফেলুন।' } },
      { q: { en: 'Do I write my passport number on the CV?', bn: 'সিভিতে পাসপোর্ট নম্বর লিখব কি?' }, a: { en: 'Only if the employer or agent asks. Never post it publicly. Keep a copy ready to share when you are shortlisted.', bn: 'নিয়োগকর্তা বা এজেন্ট চাইলে তবেই লিখুন। কখনো প্রকাশ্যে দেবেন না। শর্টলিস্ট হলে দেওয়ার জন্য একটি কপি তৈরি রাখুন।' } },
      { q: { en: 'Is this CV for Saudi, UAE and Qatar all?', bn: 'এই সিভি কি সৌদি, আমিরাত ও কাতারের জন্য একই?' }, a: { en: 'The core is the same across the Gulf. Match the job ad for details like salary, visa status and licences.', bn: 'গাল্ফের দেশগুলোতে মূল কাঠামো একই। বেতন, ভিসার অবস্থা ও লাইসেন্সের মতো তথ্য বিজ্ঞাপন অনুযায়ী মিলিয়ে নিন।' } },
      { q: { en: 'Is it really free?', bn: 'সত্যিই কি বিনামূল্যে?' }, a: { en: 'Building and PDF download are free with a small footer mark and no sign-up. Pro passes start at ৳49 for 7 days and remove the mark, add Word export and premium designs.', bn: 'বানানো ও PDF ডাউনলোড বিনামূল্যে, ছোট ফুটার চিহ্নসহ, সাইন-আপ ছাড়া। ৭ দিনের Pro পাস ৳৪৯ থেকে, তাতে চিহ্ন থাকে না, Word এক্সপোর্ট ও প্রিমিয়াম ডিজাইন মেলে।' } },
      { q: { en: 'Can you write my CV for me?', bn: 'আপনারা কি আমার সিভি লিখে দেবেন?' }, a: { en: 'Yes. Our CV experts write and review CVs at fixed prices, see the services page. We never promise a job or a visa.', bn: 'হ্যাঁ। আমাদের সিভি বিশেষজ্ঞরা নির্দিষ্ট দামে সিভি লেখেন ও রিভিউ করেন, সার্ভিস পেজ দেখুন। আমরা কখনো চাকরি বা ভিসার প্রতিশ্রুতি দিই না।' } },
    ],
  },
};
