// The CV templates sold one by one and in packs.
// Preview images live in public/templates/<id>/ (thumb.webp, page-N.webp), made from the PDFs.
// The Word file is stored privately in the R2 bucket under its id, e.g. "<id>.docx".

import type { Bilingual } from './catalog';

export type TemplateStyle = 'ats' | 'designed';
export type Sector = 'fresher' | 'banking' | 'corporate' | 'teaching' | 'engineering' | 'sales' | 'medical' | 'other';

export interface Template {
  id: string;
  /** Original Word file name in the team's folder. */
  file: string;
  style: TemplateStyle;
  sector: Sector;
  pages: number;
  title: Bilingual;
}

export const SECTORS: { id: Sector; name: Bilingual }[] = [
  { id: 'fresher', name: { en: 'Fresher', bn: 'ফ্রেশার' } },
  { id: 'banking', name: { en: 'Bank and finance', bn: 'ব্যাংক ও ফাইন্যান্স' } },
  { id: 'corporate', name: { en: 'Corporate', bn: 'কর্পোরেট' } },
  { id: 'teaching', name: { en: 'Teaching', bn: 'শিক্ষকতা' } },
  { id: 'engineering', name: { en: 'Engineering and IT', bn: 'ইঞ্জিনিয়ারিং ও আইটি' } },
  { id: 'sales', name: { en: 'Sales and marketing', bn: 'সেলস ও মার্কেটিং' } },
  { id: 'medical', name: { en: 'Medical', bn: 'মেডিকেল' } },
  { id: 'other', name: { en: 'Other jobs', bn: 'অন্যান্য' } },
];

export const TEMPLATES: Template[] = [
  { id: 'ats-academic-teaching-2page', file: 'ATS_Academic_Teaching_2Page.docx', style: 'ats', sector: 'teaching', pages: 2, title: { en: 'Academic and teaching CV', bn: 'শিক্ষকতা ও একাডেমিক সিভি' } },
  { id: 'ats-banking-senior-executive', file: 'ATS_Banking_Senior_Executive.docx', style: 'ats', sector: 'banking', pages: 2, title: { en: 'Senior bank officer CV', bn: 'সিনিয়র ব্যাংক কর্মকর্তা সিভি' } },
  { id: 'ats-banking-standard-bd', file: 'ATS_Banking_Standard_BD.docx', style: 'ats', sector: 'banking', pages: 2, title: { en: 'Bank job CV, Bangladesh format', bn: 'ব্যাংক জব সিভি, বাংলাদেশি ফরম্যাট' } },
  { id: 'ats-classic-professional-2page', file: 'ATS_Classic_Professional_2Page.docx', style: 'ats', sector: 'corporate', pages: 2, title: { en: 'Classic professional CV', bn: 'ক্লাসিক প্রফেশনাল সিভি' } },
  { id: 'ats-corporate-standard-2page', file: 'ATS_Corporate_Standard_2Page.docx', style: 'ats', sector: 'corporate', pages: 2, title: { en: 'Corporate standard CV', bn: 'কর্পোরেট স্ট্যান্ডার্ড সিভি' } },
  { id: 'ats-executive-extended-3page', file: 'ATS_Executive_Extended_3Page.docx', style: 'ats', sector: 'corporate', pages: 3, title: { en: 'Executive CV, detailed', bn: 'এক্সিকিউটিভ সিভি, বিস্তারিত' } },
  { id: 'ats-graduate-detailed-2page', file: 'ATS_Graduate_Detailed_2Page.docx', style: 'ats', sector: 'fresher', pages: 2, title: { en: 'Graduate CV, detailed', bn: 'গ্র্যাজুয়েট সিভি, বিস্তারিত' } },
  { id: 'ats-graduate-standard-single-page', file: 'ATS_Graduate_Standard_SinglePage.docx', style: 'ats', sector: 'fresher', pages: 2, title: { en: 'Graduate CV, standard', bn: 'গ্র্যাজুয়েট সিভি, স্ট্যান্ডার্ড' } },
  { id: 'ats-minimalist-single-page', file: 'ATS_Minimalist_SinglePage.docx', style: 'ats', sector: 'fresher', pages: 1, title: { en: 'Minimal one-page CV', bn: 'মিনিমাল এক পৃষ্ঠার সিভি' } },
  { id: 'ats-modern-corporate-2page', file: 'ATS_Modern_Corporate_2Page.docx', style: 'ats', sector: 'corporate', pages: 2, title: { en: 'Modern corporate CV', bn: 'মডার্ন কর্পোরেট সিভি' } },
  { id: 'ats-technical-specialist-2page', file: 'ATS_Technical_Specialist_2Page.docx', style: 'ats', sector: 'engineering', pages: 2, title: { en: 'IT and technical specialist CV', bn: 'আইটি ও টেকনিক্যাল স্পেশালিস্ট সিভি' } },
  { id: 'creative-academic-teacher-2page', file: 'Creative_Academic_Teacher_2Page.docx', style: 'designed', sector: 'teaching', pages: 1, title: { en: 'Teacher CV, designed', bn: 'শিক্ষক সিভি, ডিজাইনড' } },
  { id: 'creative-banking-two-column-2page', file: 'Creative_Banking_TwoColumn_2Page.docx', style: 'designed', sector: 'banking', pages: 2, title: { en: 'Banking CV, two columns', bn: 'ব্যাংকিং সিভি, দুই কলাম' } },
  { id: 'creative-business-analyst-2page', file: 'Creative_Business_Analyst_2Page.docx', style: 'designed', sector: 'corporate', pages: 1, title: { en: 'Business analyst CV', bn: 'বিজনেস অ্যানালিস্ট সিভি' } },
  { id: 'creative-civil-engineering-2page', file: 'Creative_Civil_Engineering_2Page.docx', style: 'designed', sector: 'engineering', pages: 1, title: { en: 'Civil engineer CV', bn: 'সিভিল ইঞ্জিনিয়ার সিভি' } },
  { id: 'creative-classic-standard-style1', file: 'Creative_Classic_Standard_Style1.docx', style: 'designed', sector: 'fresher', pages: 1, title: { en: 'Classic standard CV', bn: 'ক্লাসিক স্ট্যান্ডার্ড সিভি' } },
  { id: 'creative-content-writer-2page', file: 'Creative_Content_Writer_2Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Content writer CV', bn: 'কনটেন্ট রাইটার সিভি' } },
  { id: 'creative-corporate-bd-standard', file: 'Creative_Corporate_BD_Standard.docx', style: 'designed', sector: 'corporate', pages: 1, title: { en: 'Corporate CV, Bangladesh format', bn: 'কর্পোরেট সিভি, বাংলাদেশি ফরম্যাট' } },
  { id: 'creative-corporate-modern-1page', file: 'Creative_Corporate_Modern_1Page.docx', style: 'designed', sector: 'corporate', pages: 1, title: { en: 'Modern corporate one-page CV', bn: 'মডার্ন কর্পোরেট এক পৃষ্ঠার সিভি' } },
  { id: 'creative-customer-service-2page', file: 'Creative_Customer_Service_2Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Customer service CV', bn: 'কাস্টমার সার্ভিস সিভি' } },
  { id: 'creative-driving-standard', file: 'Creative_Driving_Standard.docx', style: 'designed', sector: 'other', pages: 1, title: { en: 'Driver CV', bn: 'ড্রাইভার সিভি' } },
  { id: 'creative-finance-accountant-2page', file: 'Creative_Finance_Accountant_2Page.docx', style: 'designed', sector: 'banking', pages: 1, title: { en: 'Accountant and finance CV', bn: 'অ্যাকাউন্টেন্ট ও ফাইন্যান্স সিভি' } },
  { id: 'creative-graduate-standard-bd', file: 'Creative_Graduate_Standard_BD.docx', style: 'designed', sector: 'fresher', pages: 1, title: { en: 'Graduate CV, Bangladesh format', bn: 'গ্র্যাজুয়েট সিভি, বাংলাদেশি ফরম্যাট' } },
  { id: 'creative-maritime-shipping-3page', file: 'Creative_Maritime_Shipping_3Page.docx', style: 'designed', sector: 'other', pages: 3, title: { en: 'Maritime and shipping CV', bn: 'মেরিটাইম ও শিপিং সিভি' } },
  { id: 'creative-marketing-manager-2page', file: 'Creative_Marketing_Manager_2Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Marketing manager CV', bn: 'মার্কেটিং ম্যানেজার সিভি' } },
  { id: 'creative-marketing-specialist-2page', file: 'Creative_Marketing_Specialist_2Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Marketing specialist CV', bn: 'মার্কেটিং স্পেশালিস্ট সিভি' } },
  { id: 'creative-mechanical-design-centric', file: 'Creative_Mechanical_DesignCentric.docx', style: 'designed', sector: 'engineering', pages: 1, title: { en: 'Mechanical engineer CV, design', bn: 'মেকানিক্যাল ইঞ্জিনিয়ার সিভি, ডিজাইন' } },
  { id: 'creative-mechanical-entry-level', file: 'Creative_Mechanical_EntryLevel.docx', style: 'designed', sector: 'engineering', pages: 1, title: { en: 'Mechanical engineer CV, entry level', bn: 'মেকানিক্যাল ইঞ্জিনিয়ার সিভি, এন্ট্রি লেভেল' } },
  { id: 'creative-mechanical-project-focused', file: 'Creative_Mechanical_ProjectFocused.docx', style: 'designed', sector: 'engineering', pages: 1, title: { en: 'Mechanical engineer CV, projects', bn: 'মেকানিক্যাল ইঞ্জিনিয়ার সিভি, প্রজেক্ট' } },
  { id: 'creative-mechanical-technical-showcase', file: 'Creative_Mechanical_TechnicalShowcase.docx', style: 'designed', sector: 'engineering', pages: 1, title: { en: 'Mechanical engineer CV, technical', bn: 'মেকানিক্যাল ইঞ্জিনিয়ার সিভি, টেকনিক্যাল' } },
  { id: 'creative-medical-assistant-bd', file: 'Creative_Medical_Assistant_BD.docx', style: 'designed', sector: 'medical', pages: 1, title: { en: 'Medical assistant CV', bn: 'মেডিকেল অ্যাসিস্ট্যান্ট সিভি' } },
  { id: 'creative-medical-doctor-2column', file: 'Creative_Medical_Doctor_2Column.docx', style: 'designed', sector: 'medical', pages: 2, title: { en: 'Doctor CV', bn: 'ডাক্তার সিভি' } },
  { id: 'creative-minimal-modern-1page', file: 'Creative_Minimal_Modern_1Page.docx', style: 'designed', sector: 'fresher', pages: 1, title: { en: 'Minimal modern CV', bn: 'মিনিমাল মডার্ন সিভি' } },
  { id: 'creative-modern-executive-2page', file: 'Creative_Modern_Executive_2Page.docx', style: 'designed', sector: 'corporate', pages: 3, title: { en: 'Modern executive CV', bn: 'মডার্ন এক্সিকিউটিভ সিভি' } },
  { id: 'creative-modern-professional-2column-1page', file: 'Creative_Modern_Professional_2Column_1Page.docx', style: 'designed', sector: 'corporate', pages: 1, title: { en: 'Modern professional CV, two columns', bn: 'মডার্ন প্রফেশনাল সিভি, দুই কলাম' } },
  { id: 'creative-sales-executive-1page', file: 'Creative_Sales_Executive_1Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Sales executive one-page CV', bn: 'সেলস এক্সিকিউটিভ এক পৃষ্ঠার সিভি' } },
  { id: 'creative-sales-executive-2page', file: 'Creative_Sales_Executive_2Page.docx', style: 'designed', sector: 'sales', pages: 2, title: { en: 'Sales executive CV', bn: 'সেলস এক্সিকিউটিভ সিভি' } },
  { id: 'creative-sales-standard-1page', file: 'Creative_Sales_Standard_1Page.docx', style: 'designed', sector: 'sales', pages: 1, title: { en: 'Sales one-page CV', bn: 'সেলস এক পৃষ্ঠার সিভি' } },
  { id: 'creative-sales-standard-2page', file: 'Creative_Sales_Standard_2Page.docx', style: 'designed', sector: 'sales', pages: 2, title: { en: 'Sales CV', bn: 'সেলস সিভি' } },
];

/** Price of one template, in BDT. */
export const SINGLE_TEMPLATE_PRICE = 39;

export const findTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
