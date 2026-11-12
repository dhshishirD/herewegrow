// The 20 new Designed CV templates (library import of 13 Nov 2026), one per profession.
// Word files live privately in R2 as "<id>.docx". Each purchase also gets its plain ATS twin and the how-to guide as free bonus files.
// Previews: public/templates/<id>/thumb.webp and page-1.webp. Tier A (indexed, shown first); see shared/templateTiers.ts.
import type { Sector, Template } from './templates';

/** Day these were added: drives the 30-day "New" badge and the sitemap lastmod. */
export const NEW_DESIGNED_ADDED = '2026-11-13';
/** Days the "New" badge is shown. */
export const NEW_BADGE_DAYS = 30;
/** General how-to guide, a free bonus file in every new Designed purchase. */
export const HOW_TO_GUIDE_FILE = 'HWG_How_To_Use_CV_Templates.pdf';

const N = (id: string, sector: Sector, hub: string, en: string, bn: string, ats: string, metaTitle: string, metaDescription: string): Template => ({
  id, file: `${id}.docx`, style: 'designed', sector, pages: 1,
  title: { en, bn },
  lib: true, shown: 1, hub, photo: true,
  added: NEW_DESIGNED_ADDED,
  bonus: [ats, HOW_TO_GUIDE_FILE],
  meta: { title: metaTitle, description: metaDescription },
});

export const NEW_DESIGNED_TEMPLATES: Template[] = [
  N("hwg-cv-designed-accountant-cv", "banking", "professional", "Accountant / Finance CV Template - Designed Word CV", "অ্যাকাউন্ট্যান্ট ও ফাইন্যান্স সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-accountant-cv.docx", "Accountant / Finance CV Template Word | HWG", "Editable one-page Accountant / Finance CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-admin-officer-cv", "corporate", "professional", "Admin & Office Executive CV Template - Designed Word CV", "অ্যাডমিন ও অফিস এক্সিকিউটিভ সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-admin-officer-cv.docx", "Admin & Office Executive CV Template Word | HWG", "Editable one-page Admin & Office Executive CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-civil-engineer-cv", "engineering", "professional", "Civil Engineer CV Template - Designed Word CV", "সিভিল ইঞ্জিনিয়ার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-civil-engineer-cv.docx", "Civil Engineer CV Template Word | HWG", "Editable one-page Civil Engineer CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-customer-service-cv", "sales", "professional", "Customer Service CV Template - Designed Word CV", "কাস্টমার সার্ভিস সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-customer-service-cv.docx", "Customer Service CV Template Word | HWG", "Editable one-page Customer Service CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-graphic-designer-cv", "other", "graphic-designer", "Graphic Designer CV Template - Designed Word CV", "গ্রাফিক ডিজাইনার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-graphic-designer-cv.docx", "Graphic Designer CV Template Word | HWG", "Editable one-page Graphic Designer CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-doctor-cv", "medical", "nurse", "Doctor / Medical CV Template - Designed Word CV", "ডাক্তার ও মেডিকেল সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-doctor-cv.docx", "Doctor / Medical CV Template Word | HWG", "Editable one-page Doctor / Medical CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-driver-cv", "other", "simple", "Driver CV Template - Designed Word CV", "ড্রাইভার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-driver-cv.docx", "Driver CV Template Word | HWG", "Editable one-page Driver CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-fresher-cv", "fresher", "fresher", "Fresher CV Template - Designed Word CV", "ফ্রেশার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-fresher-cv.docx", "Fresher CV Template Word | HWG", "Editable one-page Fresher CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-hotel-hospitality-cv", "corporate", "professional", "Hotel & Hospitality CV Template - Designed Word CV", "হোটেল ও হসপিটালিটি সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-hotel-hospitality-cv.docx", "Hotel & Hospitality CV Template Word | HWG", "Editable one-page Hotel & Hospitality CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-it-software-cv", "engineering", "it", "IT / Software CV Template - Designed Word CV", "আইটি ও সফটওয়্যার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-it-software-cv.docx", "IT / Software CV Template Word | HWG", "Editable one-page IT / Software CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-mechanical-engineer-cv", "engineering", "professional", "Mechanical Engineer CV Template - Designed Word CV", "মেকানিক্যাল ইঞ্জিনিয়ার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-mechanical-engineer-cv.docx", "Mechanical Engineer CV Template Word | HWG", "Editable one-page Mechanical Engineer CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-ngo-development-cv", "corporate", "professional", "NGO / Development CV Template - Designed Word CV", "এনজিও ও ডেভেলপমেন্ট সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-ngo-development-cv.docx", "NGO / Development CV Template Word | HWG", "Editable one-page NGO / Development CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-nurse-cv", "medical", "nurse", "Nurse CV Template - Designed Word CV", "নার্স সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-nurse-cv.docx", "Nurse CV Template Word | HWG", "Editable one-page Nurse CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-sales-marketing-cv", "sales", "professional", "Sales & Marketing CV Template - Designed Word CV", "সেলস ও মার্কেটিং সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-sales-marketing-cv.docx", "Sales & Marketing CV Template Word | HWG", "Editable one-page Sales & Marketing CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-student-higher-study-cv", "fresher", "fresher", "Student / Higher Study CV Template - Designed Word CV", "স্টুডেন্ট ও হায়ার স্টাডি সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-student-higher-study-cv.docx", "Student / Higher Study CV Template Word | HWG", "Editable one-page Student / Higher Study CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-teacher-cv", "teaching", "teacher", "Teacher CV Template - Designed Word CV", "শিক্ষক সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-teacher-cv.docx", "Teacher CV Template Word | HWG", "Editable one-page Teacher CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-writer-content-cv", "sales", "creative", "Writer / Content CV Template - Designed Word CV", "রাইটার ও কনটেন্ট সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-writer-content-cv.docx", "Writer / Content CV Template Word | HWG", "Editable one-page Writer / Content CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-merchandiser-cv", "corporate", "professional", "Merchandiser (Garments) CV Template - Designed Word CV", "মার্চেন্ডাইজার (গার্মেন্টস) সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-merchandiser-cv.docx", "Merchandiser (Garments) CV Template Word | HWG", "Editable one-page Merchandiser (Garments) CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-gulf-job-cv", "other", "gulf", "Gulf Job CV Template - Designed Word CV", "গালফ জব সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-gulf-job-cv.docx", "Gulf Job CV Template Word | HWG", "Editable one-page Gulf Job CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
  N("hwg-cv-designed-banker-cv", "banking", "professional", "Banker CV Template - Designed Word CV", "ব্যাংকার সিভি টেমপ্লেট (ওয়ার্ড)", "hwg-cv-ats-banker-cv.docx", "Banker CV Template Word | HWG", "Editable one-page Banker CV template for Bangladesh. Easy Word edit, photo slot, free ATS version included."),
];
