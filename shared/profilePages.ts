// Copy for the LinkedIn and BDJobs landing pages, shared by the app and the
// build-time SEO pages (scripts/seo.ts) so both always say the same thing.

import type { Bilingual } from './catalog';

export type ProfileKind = 'linkedin' | 'bdjobs';

export interface ProfilePage {
  kind: ProfileKind;
  path: string;
  productId: string;
  eyebrow: Bilingual;
  title: Bilingual;
  lead: Bilingual;
  pains: { title: Bilingual; body: Bilingual }[];
  changes: { area: Bilingual; before: string; after: string }[];
  steps: { title: Bilingual; body: Bilingual }[];
  faq: { q: Bilingual; a: Bilingual }[];
}

export const PROFILE_PAGES: Record<ProfileKind, ProfilePage> = {
  linkedin: {
    kind: 'linkedin',
    path: '/linkedin-profile-optimization',
    productId: 'linkedin-profile',
    eyebrow: { en: 'LinkedIn profile optimization', bn: 'লিংকডইন প্রোফাইল অপটিমাইজেশন' },
    title: {
      en: 'Turn a profile recruiters scroll past into one they message',
      bn: 'রিক্রুটার যে প্রোফাইল এড়িয়ে যান, সেটিকে বানান এমন প্রোফাইল যেখানে তাঁরা মেসেজ দেন',
    },
    lead: {
      en: 'Our CV experts rewrite your headline, About and experience around the job you want, with the keywords recruiters actually search for.',
      bn: 'আমাদের সিভি বিশেষজ্ঞরা আপনার কাঙ্ক্ষিত চাকরি অনুযায়ী হেডলাইন, About ও অভিজ্ঞতা নতুন করে লেখেন, রিক্রুটাররা আসলে যে কী-ওয়ার্ডে সার্চ করেন সেগুলোসহ।',
    },
    pains: [
      {
        title: { en: 'Invisible in search', bn: 'সার্চে চোখে পড়ে না' },
        body: { en: 'Recruiters search by job title and skills. A headline like "Student" or "Looking for a job" never shows up.', bn: 'রিক্রুটাররা পদের নাম ও স্কিল দিয়ে সার্চ করেন। "Student" বা "Looking for a job" হেডলাইন কখনো সামনে আসে না।' },
      },
      {
        title: { en: 'Empty About section', bn: 'ফাঁকা About অংশ' },
        body: { en: 'A blank or copied About tells nothing about what you can do for an employer.', bn: 'ফাঁকা বা কপি করা About নিয়োগকর্তাকে আপনার সক্ষমতা সম্পর্কে কিছুই বলে না।' },
      },
      {
        title: { en: 'Duties, not results', bn: 'দায়িত্বের তালিকা, ফলাফল নেই' },
        body: { en: 'Experience written as a list of duties reads like every other profile. Results are what get the message.', bn: 'শুধু দায়িত্বের তালিকা সব প্রোফাইলের মতোই লাগে। ফলাফলই মেসেজ এনে দেয়।' },
      },
    ],
    changes: [
      { area: { en: 'Headline', bn: 'হেডলাইন' }, before: 'Student at XYZ University | Looking for a job', after: 'Management Trainee Candidate · Banking & Finance | Credit Analysis · Excel · Power BI' },
      { area: { en: 'About', bn: 'About' }, before: 'Hardworking and honest person. Want to build career.', after: 'Finance graduate who built a loan-risk model in Excel cutting review time by 40%. Ready for credit and MTO roles in Bangladeshi banks.' },
      { area: { en: 'Experience', bn: 'অভিজ্ঞতা' }, before: 'Responsible for data entry and office work.', after: 'Cleaned and reconciled 2,000+ customer records a month with zero audit flags.' },
      { area: { en: 'Skills', bn: 'স্কিল' }, before: 'MS Word, Hardworking, Teamwork', after: 'Credit Analysis, Financial Modelling, Excel, Power BI, KYC/AML' },
    ],
    steps: [
      { title: { en: 'Order and pay', bn: 'অর্ডার ও পেমেন্ট' }, body: { en: 'bKash, Nagad or Rocket. Confirmed instantly.', bn: 'বিকাশ, নগদ বা রকেট। সাথে সাথে নিশ্চিত।' } },
      { title: { en: 'Share your profile link and target job', bn: 'প্রোফাইল লিংক ও লক্ষ্য পদ পাঠান' }, body: { en: 'On WhatsApp, with your CV if you have one.', bn: 'হোয়াটসঅ্যাপে, সিভি থাকলে সেটিসহ।' } },
      { title: { en: 'Get your new profile text', bn: 'নতুন প্রোফাইল টেক্সট বুঝে নিন' }, body: { en: 'Ready to paste in 48 hours, plus one round of changes.', bn: '৪৮ ঘণ্টায় বসানোর জন্য প্রস্তুত, সাথে ১ বার সংশোধন।' } },
    ],
    faq: [
      { q: { en: 'Do you need my LinkedIn password?', bn: 'আমার লিংকডইন পাসওয়ার্ড লাগবে?' }, a: { en: 'No. We send you the finished text and you paste it in. Your account stays fully yours.', bn: 'না। আমরা তৈরি টেক্সট পাঠাই, আপনি বসিয়ে দেন। অ্যাকাউন্ট পুরোপুরি আপনার হাতেই থাকে।' } },
      { q: { en: 'I have no work experience. Is it still worth it?', bn: 'আমার কোনো অভিজ্ঞতা নেই। তবুও কি কাজে লাগবে?' }, a: { en: 'Yes. For freshers we build the profile around projects, internships, thesis work and skills, so you still appear in recruiter searches.', bn: 'হ্যাঁ। ফ্রেশারদের জন্য প্রজেক্ট, ইন্টার্নশিপ, থিসিস ও স্কিল দিয়ে প্রোফাইল সাজাই, যাতে রিক্রুটারের সার্চে আসেন।' } },
      { q: { en: 'Will you write it in English?', bn: 'ইংরেজিতে লিখে দেবেন?' }, a: { en: 'Yes, in clear professional English that recruiters in Bangladesh and abroad expect.', bn: 'হ্যাঁ, দেশ-বিদেশের রিক্রুটাররা যেমন চান তেমন পরিষ্কার পেশাদার ইংরেজিতে।' } },
      { q: { en: 'Can I get my CV done at the same time?', bn: 'একসাথে সিভিও করাতে পারব?' }, a: { en: 'Yes. The Job-ready combo covers CV, LinkedIn and BDJobs together for less than buying them separately.', bn: 'হ্যাঁ। জব-রেডি কম্বোতে সিভি, লিংকডইন ও বিডিজবস একসাথে, আলাদা কেনার চেয়ে কম দামে।' } },
    ],
  },
  bdjobs: {
    kind: 'bdjobs',
    path: '/bdjobs-profile-optimization',
    productId: 'bdjobs-profile',
    eyebrow: { en: 'BDJobs profile setup', bn: 'বিডিজবস প্রোফাইল সেটআপ' },
    title: {
      en: 'A complete BDJobs profile, ready to apply in one click',
      bn: 'সম্পূর্ণ বিডিজবস প্রোফাইল, এক ক্লিকে আবেদনের জন্য প্রস্তুত',
    },
    lead: {
      en: 'Employers filter BDJobs candidates by how complete and relevant the profile is. We fill every section from your CV, written the way HR reads it.',
      bn: 'নিয়োগকর্তারা বিডিজবসে প্রোফাইল কতটা সম্পূর্ণ ও প্রাসঙ্গিক তা দেখে প্রার্থী বাছাই করেন। আমরা আপনার সিভি থেকে প্রতিটি অংশ পূরণ করি, এইচআর যেভাবে পড়েন সেভাবে লিখে।',
    },
    pains: [
      {
        title: { en: 'Half-filled sections', bn: 'অর্ধেক পূরণ করা অংশ' },
        body: { en: 'Missing career summary, skills or experience details push your profile down the employer’s list.', bn: 'ক্যারিয়ার সামারি, স্কিল বা অভিজ্ঞতার তথ্য না থাকলে নিয়োগকর্তার তালিকায় প্রোফাইল নিচে নেমে যায়।' },
      },
      {
        title: { en: 'Wrong job categories', bn: 'ভুল জব ক্যাটাগরি' },
        body: { en: 'Choose the wrong categories and the right jobs never reach you, or your applications go to the wrong desk.', bn: 'ভুল ক্যাটাগরি বাছলে সঠিক চাকরির খবর আসে না, আবেদনও ভুল জায়গায় যায়।' },
      },
      {
        title: { en: 'Generic summary', bn: 'গতানুগতিক সামারি' },
        body: { en: '"Seeking a challenging position" is in thousands of profiles. HR skips it in seconds.', bn: '"Seeking a challenging position" হাজারো প্রোফাইলে আছে। এইচআর কয়েক সেকেন্ডেই এড়িয়ে যান।' },
      },
    ],
    changes: [
      { area: { en: 'Career summary', bn: 'ক্যারিয়ার সামারি' }, before: 'Seeking a challenging position in a reputed organization.', after: 'Accounts graduate with 2 years in VAT and payroll at a garments group. Targeting Accounts Executive roles in Dhaka.' },
      { area: { en: 'Job categories', bn: 'জব ক্যাটাগরি' }, before: 'Others', after: 'Accounting/Finance · Bank/Non-Bank Fin. Institution' },
      { area: { en: 'Skills', bn: 'স্কিল' }, before: 'Computer, MS Office', after: 'VAT return, Payroll, Tally, Excel (Pivot, VLOOKUP), Reconciliation' },
      { area: { en: 'Experience', bn: 'অভিজ্ঞতা' }, before: 'Worked in accounts department.', after: 'Prepared monthly VAT returns for 3 units; closed payroll for 450 staff on time every month.' },
    ],
    steps: [
      { title: { en: 'Order and pay', bn: 'অর্ডার ও পেমেন্ট' }, body: { en: 'bKash, Nagad or Rocket. Confirmed instantly.', bn: 'বিকাশ, নগদ বা রকেট। সাথে সাথে নিশ্চিত।' } },
      { title: { en: 'Send your CV and target roles', bn: 'সিভি ও লক্ষ্য পদ পাঠান' }, body: { en: 'On WhatsApp. No CV? Answer a short form instead.', bn: 'হোয়াটসঅ্যাপে। সিভি নেই? একটি ছোট ফর্মের উত্তর দিন।' } },
      { title: { en: 'Your profile goes live', bn: 'প্রোফাইল চালু' }, body: { en: 'Every section completed and job alerts set within 24 hours.', bn: '২৪ ঘণ্টার মধ্যে প্রতিটি অংশ পূরণ ও জব অ্যালার্ট সেট।' } },
    ],
    faq: [
      { q: { en: 'Do you need my BDJobs password?', bn: 'আমার বিডিজবস পাসওয়ার্ড লাগবে?' }, a: { en: 'Only if you want us to fill it in for you, and you can change it right after. Prefer not to share it? We send the text and guide you section by section.', bn: 'শুধু আপনি চাইলে আমরা পূরণ করে দিই, পরে সাথে সাথে পাসওয়ার্ড বদলে নিতে পারেন। শেয়ার করতে না চাইলে টেক্সট পাঠিয়ে প্রতিটি অংশ ধাপে ধাপে দেখিয়ে দিই।' } },
      { q: { en: 'Do I need a BDJobs account already?', bn: 'আগে থেকে বিডিজবস অ্যাকাউন্ট লাগবে?' }, a: { en: 'No. We can help you create it and set it up from the start.', bn: 'না। শুরু থেকে অ্যাকাউন্ট খুলে সেটআপ করতে সাহায্য করি।' } },
      { q: { en: 'Is this an official BDJobs service?', bn: 'এটি কি বিডিজবসের অফিসিয়াল সার্ভিস?' }, a: { en: 'No. HereWeGrow is independent. We help you present your profile at its best on the platform.', bn: 'না। HereWeGrow একটি স্বাধীন প্রতিষ্ঠান। আমরা প্ল্যাটফর্মে আপনার প্রোফাইল সবচেয়ে ভালোভাবে উপস্থাপনে সাহায্য করি।' } },
      { q: { en: 'Can I get LinkedIn and my CV done too?', bn: 'লিংকডইন ও সিভিও করাতে পারব?' }, a: { en: 'Yes. The Job-ready combo covers CV, LinkedIn and BDJobs together for less than buying them separately.', bn: 'হ্যাঁ। জব-রেডি কম্বোতে সিভি, লিংকডইন ও বিডিজবস একসাথে, আলাদা কেনার চেয়ে কম দামে।' } },
    ],
  },
};
