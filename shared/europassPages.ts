// Copy and data for the Europass-style CV pages (Phase 1a), shared by the app (src/pages/EuropassPages.tsx),
// the build-time prerender (scripts/seo.ts) and the search titles (shared/seo.ts) so all three always say the same thing.
//   /europass-cv                      pillar guide + free builder
//   /templates/category/europass-cv   hub listing the Europass-style Word templates
//   /europass-cv-template-word        Word template page
// Rules: say "Europass-style", never "official"; no Europass logo or EU flag; no promises of jobs, visas, admission or scholarships.
// Europass is run by the European Union. Re-check the sources below and update EUROPASS_CHECKED before each edit goes live.

import { PRODUCTS, SUPPORT_WHATSAPP } from './catalog';
import { PLANS, templatePrice } from './plans';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES, type Template } from './templates';
import { isListed, isRetired, isVariant } from './templateTiers';

export const EUROPASS_UPDATED = '2026-11-19';
export const EUROPASS_CHECKED = '2026-11-19';

export const EUROPASS_PILLAR_PATH = '/europass-cv';
export const EUROPASS_HUB_PATH = '/templates/category/europass-cv';
export const EUROPASS_WORD_PATH = '/europass-cv-template-word';
export const EUROPASS_PATHS = [EUROPASS_PILLAR_PATH, EUROPASS_HUB_PATH, EUROPASS_WORD_PATH] as const;
/** The builder preset belongs to the builder team; this page only links to it. */
export const EUROPASS_BUILDER_HREF = '/builder?preset=europass';
export const EUROPASS_PRESET_ID = 'europass';

export const EUROPASS_AUTHOR = { name: 'Daloyar Hassan Shishir', url: 'https://www.dhshishir.com' } as const;
export const EUROPASS_UNOFFICIAL = 'Unofficial: not affiliated with Europass or the European Union.';
export const EUROPASS_PRIVACY = 'Privacy: the CV form is filled in your browser and kept on your device. We do not send your CV details to a server.';
export const EUROPASS_BN_KEYWORD = 'ইউরোপাস সিভি';

/** The one template left out of the download list (owner decision). Its variants stay on sale, but are not listed either. */
export const EUROPASS_EXCLUDED_IDS: readonly string[] = ['hwg-cv-europass-europass-003'];

/**
 * Library thumbnails (thumb.webp and page-1.webp) that show the Europass logo and EU flag in the top corner.
 * Checked by eye on 2026-11-19. Rule: no Europass logo or EU flag on these pages, so these are listed only when no clean template exists.
 */
export const EUROPASS_LOGO_FLAGGED_IDS: readonly string[] = [
  'hwg-cv-europass-europass-010', 'hwg-cv-europass-europass-015', 'hwg-cv-europass-europass-016',
  'hwg-cv-europass-europass-001', 'hwg-cv-europass-europass-002', 'hwg-cv-europass-europass-003', 'hwg-cv-europass-europass-009', 'hwg-cv-europass-europass-011',
  'hwg-cv-europass-europass-004', 'hwg-cv-europass-europass-007',
];

/** Our own preview of the builder preset (sample data, no logo, no flag). Rendered from the real layout; see public/europass. */
/** Social share image for all three pages: 1200 x 630, our own layout, no logo or flag. */
export const EUROPASS_OG = { src: '/europass/europass-style-cv-og-1200x630.jpg', w: 1200, h: 630 } as const;

/** Our own preview of the builder preset (sample data, no logo, no flag). Rendered from the real layout; see public/europass. */
export const EUROPASS_PREVIEW = {
  src: '/europass/europass-style-cv-preview-a4.webp', w: 1588, h: 2246,
  thumb: '/europass/europass-style-cv-preview-a4-thumb.webp', tw: 360, th: 509,
  alt: 'ইউরোপাস সিভি: Europass-style CV made in the HereWeGrow builder, page 1 preview with profile, work, education and a CEFR language grid (sample data)',
  caption: 'Europass-style layout made in our builder. Sample data (invented).',
} as const;

export interface PageSeo { title: string; description: string; h1: string }

export const EUROPASS_SEO: Record<(typeof EUROPASS_PATHS)[number], PageSeo> = {
  [EUROPASS_PILLAR_PATH]: {
    title: 'Europass CV (ইউরোপাস সিভি): Free Online Maker - HWG',
    description: 'Make a free Europass-style CV online in Word and PDF. Bangla guide, CEFR language grid, samples. Unofficial HWG tool. Last updated Nov 2026.',
    h1: 'Europass CV (ইউরোপাস সিভি): Free Europass-Style CV Maker',
  },
  [EUROPASS_HUB_PATH]: {
    title: 'Europass Style CV Templates: Word + PDF - HereWeGrow',
    description: 'Browse Europass-style CV templates. Pick a layout, edit free in the builder, export PDF or Word with Pro. Made for students and job seekers in Bangladesh.',
    h1: 'Europass Style CV Templates',
  },
  [EUROPASS_WORD_PATH]: {
    title: 'Europass CV Template Word: Free Style Download - HWG',
    description: 'Europass-style CV templates in editable Word and PDF. Clean European layout, no logo, easy to edit. Preview before download. Not official Europass.',
    h1: 'Europass CV Template Word (ইউরোপাস সিভি টেমপ্লেট)',
  },
};

export function europassSeo(path: string): PageSeo | undefined {
  return (EUROPASS_SEO as Record<string, PageSeo>)[path];
}

export interface Source { title: string; url: string }
export const EUROPASS_SOURCES: Source[] = [
  { title: 'Europass portal (European Union): CV, cover letter and profile tools', url: 'https://europass.europa.eu/en' },
  { title: 'Europass: CEFR language self-assessment grid (PDF)', url: 'https://europass.europa.eu/system/files/2020-05/CEFR%20self-assessment%20grid%20EN.pdf' },
  { title: 'Council of Europe: the CEFR levels (A1 to C2)', url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions' },
  { title: 'EEAS: Europass CV instructions (older guide, structure only)', url: 'https://www.eeas.europa.eu/sites/default/files/europass_cv_instructions.pdf' },
  { title: 'GradPilot: Europass CV for masters applications (third party)', url: 'https://gradpilot.com/news/europass-cv-masters-application' },
  { title: 'ENIC-NARIC networks: recognition of foreign qualifications', url: 'https://www.enic-naric.net/' },
];

export interface Block {
  id: string;
  h2: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  table?: { head: string[]; rows: string[][] };
}
export interface Faq { q: string; a: string }

// ---------- Prices, taken from the real constants (never typed by hand) ----------
const bdt = (n: number) => `৳${n}`;
const PRO_YEAR = PLANS.find((p) => p.id === 'pro-365')!;
const PRO_SHORT = PLANS.filter((p) => p.templateOff < 100 && p.templateOff > 0);
const PRO_FROM = Math.min(...PLANS.map((p) => p.price));
export const EUROPASS_PRICES = {
  single: bdt(SINGLE_TEMPLATE_PRICE),
  proFrom: bdt(PRO_FROM),
  proShortTemplate: bdt(templatePrice(SINGLE_TEMPLATE_PRICE, PRO_SHORT[0]?.id ?? null)),
  proYear: bdt(PRO_YEAR.price),
  /** True when a 1-year Pro pass makes templates free. */
  proYearFree: PRO_YEAR.templateOff >= 100,
};

// ---------- Hub: the templates ----------
export interface HubTemplate {
  id: string;
  path: string;
  name: string;
  pages: number;
  color: string;
  thumb: string;
  full: string;
  w: number;
  h: number;
  fullW: number;
  fullH: number;
}

/** Europass templates that may be listed: on sale, a lead (not a variant), and not the excluded one. Same rules as the Templates page (shared/templateTiers.ts). */
export function europassHubTemplates(): HubTemplate[] {
  const all = europassHubCandidates();
  const clean = all.filter((t) => !EUROPASS_LOGO_FLAGGED_IDS.includes(t.id));
  return clean.length > 0 ? clean : all;
}

function europassHubCandidates(): HubTemplate[] {
  return TEMPLATES.filter((t: Template) => t.hub === 'europass' && !isRetired(t.id) && !isVariant(t.id) && isListed(t.id) && !EUROPASS_EXCLUDED_IDS.includes(t.id))
    .sort((a, b) => a.pages - b.pages || a.id.localeCompare(b.id))
    .map((t) => ({
      id: t.id,
      path: `/templates/${t.id}`,
      name: `Europass-style CV, ${(t.color ?? 'blue').toLowerCase()}, ${t.pages} ${t.pages === 1 ? 'page' : 'pages'}${t.photo ? ', with photo' : ''}`,
      pages: t.pages,
      color: t.color ?? 'Blue',
      thumb: `/templates/${t.id}/thumb.webp`,
      full: `/templates/${t.id}/page-1.webp`,
      w: 360,
      h: 466,
      fullW: 640,
      fullH: 829,
    }));
}

export const imageAlt = (t: HubTemplate) => `ইউরোপাস সিভি: ${t.name}, page 1 preview (sample layout)`;

// ---------- Pillar: /europass-cv ----------
export const PILLAR_ANSWER =
  'A Europass CV (ইউরোপাস সিভি) is a standard CV layout from the European Union’s Europass service. It lists your details, work, education and skills in a fixed order, with languages rated on the CEFR scale from A1 to C2. It suits many European applications, but it is optional unless the employer or programme asks for it.';

export const PILLAR_INTRO = [
  'Applying for a job, internship or course in Europe, and the advert says “send a Europass CV”? This guide explains what that means, what goes in each section, how to rate your languages honestly, and what to change if you are applying from Bangladesh. You can build a Europass-style CV free on your phone, or open an editable Word file.',
];

export const PILLAR_BLOCKS: Block[] = [
  {
    id: 'what-is',
    h2: 'What is a Europass CV (ইউরোপাস সিভি)?',
    p: [
      'Europass is a set of free online tools run by the European Union to help people present their skills and qualifications in a way that is easy to compare across countries. The best-known tool is the Europass CV: one clean layout, the same sections in the same order, so a recruiter in Spain and a university in Poland can find your details quickly.',
      'This page is about the layout and the habits that make it work. Our builder makes a Europass-style CV: it follows the same section order and the same language-level scale, but it is our own design, not a file made by the EU. If an employer insists on the EU’s own editor, use that at europass.europa.eu. Everything you learn here carries over.',
    ],
  },
  {
    id: 'sections',
    h2: 'Europass CV sections, in the usual order',
    p: ['The exact boxes change when the EU updates its editor, but a Europass-style CV normally runs like this:'],
    ol: [
      'Personal information: full name as in your passport, phone with country code (+880), email, city and country. Date of birth, nationality and photo are optional.',
      'Short profile: two or three lines on who you are and what you are applying for. Write it for the job in front of you.',
      'Work experience: newest first, with month and year, job title, employer, city and country, then the main tasks and results in short lines.',
      'Education and training: newest first, with dates, qualification, institution, country and the grading scale you were marked on.',
      'Language skills: your mother tongue first, then other languages rated A1 to C2 for understanding, speaking and writing.',
      'Digital skills: the tools you really use, such as Excel, Word, Canva, accounting software or coding languages, with a level for each.',
      'Other skills: communication, teamwork, organisation and any job-related skills, each tied to something you did.',
      'Additional information: volunteering, projects, publications, certificates, driving licence and references on request.',
    ],
  },
  {
    id: 'cefr',
    h2: 'CEFR language levels explained',
    p: [
      'The Common European Framework of Reference for Languages, or CEFR, gives every language the same six levels. Europass asks you to rate yourself for listening, reading, spoken interaction, spoken production and writing, because many people read well but speak less confidently. Be honest: interviews and tests often follow the CV.',
    ],
    table: {
      head: ['Level', 'Name', 'What it means in plain words'],
      rows: [
        ['A1', 'Beginner', 'You can use familiar everyday phrases and introduce yourself.'],
        ['A2', 'Elementary', 'You can handle simple, routine exchanges and describe your background in basic terms.'],
        ['B1', 'Intermediate', 'You can follow the main points on familiar topics and write simple connected text.'],
        ['B2', 'Upper intermediate', 'You can understand complex texts, talk with native speakers without strain and explain your views.'],
        ['C1', 'Advanced', 'You can use the language flexibly for work and study, with fluent, well-organised speech and writing.'],
        ['C2', 'Proficient', 'You can understand almost everything and express yourself precisely, even in complex situations.'],
      ],
    },
  },
  {
    id: 'cefr-tests',
    h2: 'Tests are not levels',
    p: [
      'IELTS, TOEFL, PTE and Duolingo scores are not CEFR levels. Test providers publish their own comparison tables, and they change, so check the current one. On the CV, write the level you judge yourself to be and add the test result next to it, for example “English: B2, IELTS 6.5 (2025)”. Bangla is your mother tongue, so list it first. Hindi, Urdu, Arabic or any other language you really use belongs in the list too.',
    ],
  },
  {
    id: 'vs-bd',
    h2: 'Europass-style CV vs a usual Bangladeshi CV',
    p: ['Most Bangladeshi CVs follow a local habit that does not travel well. The differences are small but they show.'],
    table: {
      head: ['Topic', 'Usual Bangladeshi CV', 'Europass-style CV'],
      rows: [
        ['Family details', 'Father’s name, mother’s name, siblings', 'Left out. Employers do not need them to judge your work.'],
        ['Identity numbers', 'NID or passport number', 'Left out. Share only when you are asked, later.'],
        ['Religion, marital status, blood group', 'Often listed', 'Left out unless the job needs it.'],
        ['Objective line', 'General line about a “reputed organisation”', 'A short, specific profile for this job.'],
        ['Order', 'Education first', 'Newest first. Work first if you have experience, education first if you are a fresher.'],
        ['Languages', '“Bangla, English: good”', 'Levels A1 to C2 for each skill.'],
        ['Photo', 'Passport-size photo is usual', 'Optional. Depends on the country and the advert.'],
      ],
    },
  },
  {
    id: 'bangladesh',
    h2: 'Bangladesh specifics: what to change before you send',
    ul: [
      'Write your name exactly as in your passport, with a phone number in +880 format and an email address that sounds professional.',
      'Photo: common in some European countries and unusual in others. Follow the advert. If you add one, use a plain background, a clear face and business clothes.',
      'Grades: write the scale as you were marked, for example “CGPA 3.45 out of 4.00” or “GPA 5.00 out of 5.00 (HSC)”. Do not convert it to a European grade yourself. The receiving school or employer decides how to read it.',
      'Qualification recognition is a separate step. The ENIC-NARIC networks explain how each country treats foreign qualifications. A CV does not replace it.',
      'Employer names: a recruiter abroad may not know your company. Add a short line such as “garment exporter, Gazipur” or “private commercial bank, Dhaka”.',
      'Dates: month and year for every job and course. Explain any gap in one honest line, for example “family care” or “full-time exam preparation”.',
      'Salary: leave out expected salary unless the advert asks for it.',
      'File: send a PDF named like Name_CV.pdf, and keep your Word file for edits.',
    ],
  },
  {
    id: 'sample',
    h2: 'Before and after (Sample data (invented))',
    p: [
      'Sample data (invented). The person below is made up, to show how the same facts read better.',
      'Before: “Objective: To work in a reputed company where I can use my skills. Experience: Customer service. Languages: Bangla, English good.”',
      'After: “Customer support officer with three years in telecom retail in Dhaka. Handled about 40 customer visits a day, solved SIM and billing problems, and trained two new colleagues. Languages: Bangla (mother tongue); English B2 (listening C1, reading B2, speaking B2, writing B1). Digital skills: Excel (good), CRM software (good).”',
      'The second version says what the person did, how much, and where. It also rates each language skill instead of writing “good”.',
    ],
  },
  {
    id: 'how',
    h2: 'How to make one in about ten minutes',
    ol: [
      'Open the free builder with the Europass-style layout already chosen.',
      'Fill in your details, jobs, education and languages. Pick levels from the CEFR list.',
      'Check the preview for gaps, spelling and dates, then download the PDF. It is free with a small footer mark; Pro removes the mark and adds Word export.',
    ],
    p: ['Not sure about your CV? Run it through the free CV checker before you send it.'],
  },
  {
    id: 'not-needed',
    h2: 'When you do NOT need a Europass CV',
    p: ['Honest answer: often. A Europass-style CV is a good default for Europe, but it is not a rule.'],
    ul: [
      'The employer or programme gives its own form or template. Use theirs.',
      'The advert asks for a “resume” in a different style, which is common for jobs in North America. Follow that style.',
      'You are applying for a research or academic post, where a longer academic CV is normal.',
      'You are applying for a job in Bangladesh. Local employers and job portals use their own formats.',
      'The advert says nothing. Then any clear, honest, well-organised CV works. Europass-style is one good option.',
    ],
  },
  {
    id: 'mistakes',
    h2: 'Common mistakes to avoid',
    ul: [
      'Rating every language C2. Recruiters notice, and an interview can show it.',
      'Listing every course you ever took. Keep what supports this application.',
      'Leaving unexplained gaps in dates.',
      'Sending one CV to every employer. Change the profile line and the order of skills for each job.',
      'Copying paragraphs from a sample. Use your own words and numbers.',
      'Expecting a CV to decide the result. A tidy CV helps people read your story; it does not decide a job, a place or a scholarship.',
    ],
  },
];

export const PILLAR_FAQ: Faq[] = [
  { q: 'Is a Europass CV free?', a: 'The EU’s own Europass editor is free. Our builder is free to start too: you can build the CV and download a PDF without signing up, with a small footer mark. A Pro pass removes the mark and adds Word export.' },
  { q: 'Do I need a Europass CV to apply in Europe?', a: 'Usually not. Most employers accept any clear CV. Use the Europass layout when the advert asks for it, or when you want a familiar structure. If the advert names a different format, follow the advert.' },
  { q: 'Should I add a photo?', a: 'It is optional. Photos are common in some countries and unusual in others, so check the advert and the country. If you add one, keep it plain and professional.' },
  { q: 'How do I rate my languages if I have no certificate?', a: 'Use the CEFR self-assessment grid and rate each skill honestly: listening, reading, spoken interaction, spoken production and writing. If you have a test score, write it next to the level.' },
  { q: 'Is the HereWeGrow CV the same as the EU’s file?', a: 'No. It is a Europass-style CV: the same section order and language scale in our own design. We are not connected to Europass or the European Union. If an employer needs the file from the EU’s editor, make it there.' },
  { q: 'How long should a Europass-style CV be?', a: 'Two pages are common. One page is enough for a fresher with little experience. Cut anything that does not help this application.' },
];

// ---------- Hub: /templates/category/europass-cv ----------
export const HUB_INTRO =
  'These are editable Europass-style CV templates (ইউরোপাস সিভি) in Word: a clear header with photo, a language table that uses the A1 to C2 scale, and room for digital and other skills. Pick a layout, then edit it in Word or build the same style free online. They are our own designs, not files from the EU.';

export const HUB_CHOOSE: string[] = [
  'One page suits a fresher or someone changing jobs. Two pages suit several years of experience.',
  'Blue is the classic look. Clean white prints well in black and white.',
  'Every template here has a photo space. Remove it if the advert does not want a photo.',
  'The Word file opens in Microsoft Word. You can also use Google Docs or LibreOffice Writer, but check the page breaks.',
];

export const HUB_FAQ: Faq[] = [
  { q: 'Are these the EU’s own Europass files?', a: 'No. They are Europass-style templates made by our CV team, with the same section order and language scale. We are not connected to Europass or the European Union.' },
  { q: 'How much is one template?', a: `One Word template costs ${EUROPASS_PRICES.single}. Pro passes start at ${EUROPASS_PRICES.proFrom} and give a discount on templates.` },
  { q: 'Can I build one online instead?', a: 'Yes. The free builder has a Europass-style layout. You fill in a form on your phone and download a PDF.' },
];

// ---------- Word page: /europass-cv-template-word ----------
export const WORD_ANSWER =
  'A Europass CV template for Word (ইউরোপাস সিভি) is an editable .docx file that follows the Europass section order: personal details, profile, work, education, languages and skills. You type over the sample text, rate your languages from A1 to C2, and save as PDF. Ours are Europass-style designs, not EU files.';

export const WORD_BLOCKS: Block[] = [
  {
    id: 'get',
    h2: 'What you get with a Europass-style Word template',
    ul: [
      'An editable .docx file with the sections in the usual Europass order.',
      'A photo space, a header for contact details and a clear language table for the A1 to C2 scale.',
      'Placeholder text that you replace with your own. It holds no real person’s details.',
      'The same file works on a laptop in Microsoft Word. You export your own PDF when you are done.',
    ],
  },
  {
    id: 'who',
    h2: 'Who these templates suit',
    p: [
      'A Europass-style layout works well when the reader wants to scan quickly: recruiters in Europe, universities and training programmes that ask for a standard CV, and employers who deal with many applicants from different countries. It also suits Bangladeshi graduates who want a cleaner alternative to the long local format, with the family details and ID numbers removed.',
      'If you are a fresher, use the one-page file and put education first. If you have several years of work, use the two-page file and put work experience first. In both cases, keep every line short and specific.',
    ],
  },
  {
    id: 'fill',
    h2: 'What to write in each part of the file',
    ul: [
      'Header: your name, +880 phone number, email, city and country. Add a LinkedIn link only if the profile is up to date.',
      'Profile: two or three lines naming your job title, your strongest experience and the kind of role you want.',
      'Work experience: month and year, job title, employer, then three or four short lines that start with a verb and carry a number when you have one.',
      'Education: qualification, institution, country and the grading scale. Do not convert your grade.',
      'Languages: Bangla as mother tongue, then each other language rated for listening, reading, speaking and writing.',
      'Skills: only tools and abilities you can show or explain in an interview.',
    ],
  },
  {
    id: 'edit',
    h2: 'How to edit it without breaking the layout',
    ol: [
      'Save a copy first and name it with your name, for example Rahim_CV.docx.',
      'Replace the sample text line by line. Keep the same length of lines so the page breaks stay where they are.',
      'Use the language table for your levels. Add a row for each language, with mother tongue first.',
      'Delete sections you do not need rather than leaving empty headings.',
      'Change the photo by right-clicking the picture and choosing Change Picture, or delete it if the advert does not want one.',
      'Export to PDF from File, Save As, before you send. A PDF keeps fonts and spacing the same on every phone.',
    ],
  },
  {
    id: 'word-vs-pdf',
    h2: 'Word or PDF: which one to send?',
    p: [
      'Send a PDF unless the employer asks for Word. A PDF looks the same everywhere. Keep the Word file for your own edits, because you will update it for every new application. Some recruiters ask for Word so they can copy details into their system, and in that case send exactly what they ask for.',
    ],
  },
  {
    id: 'price',
    h2: 'Price and download',
    p: [
      `One Word template costs ${EUROPASS_PRICES.single}. You pay by bKash, Nagad or Rocket and download at once. ${EUROPASS_PRICES.proYearFree ? `A 1-year Pro pass (${EUROPASS_PRICES.proYear}) includes all templates, and shorter Pro passes (from ${EUROPASS_PRICES.proFrom}) take half off, so a template costs about ${EUROPASS_PRICES.proShortTemplate}.` : `Pro passes start at ${EUROPASS_PRICES.proFrom} and give a discount on templates.`} Pro also adds Word export in the online builder and removes the footer mark from PDFs.`,
      'Prefer not to pay? The online builder makes a Europass-style PDF free, with a small footer mark and no sign-up.',
    ],
  },
  {
    id: 'compat',
    h2: 'Compatibility',
    p: [
      'The template is a standard .docx file made for Microsoft Word. Google Docs and LibreOffice Writer can open it, but fonts and spacing may shift a little, so look at every page before you export. A phone Word app can open it, though editing is easier on a computer.',
    ],
  },
  {
    id: 'print',
    h2: 'Fonts, photo and printing',
    p: [
      'Keep the fonts that come with the template. If your computer does not have one, Word swaps in another font and the spacing can change, so look at the preview after you open the file. For the photo, use a recent head-and-shoulders picture with a plain background, cropped to the size of the frame. Printing in black and white works well on the clean white layout.',
    ],
  },
  {
    id: 'check',
    h2: 'Check before you send',
    ul: [
      'Names, dates and phone number are right.',
      'Every language has a level, and your test scores are next to them.',
      'No father’s name, NID number or religion unless the advert asks for it.',
      'The file name is clear and the PDF opens on your phone.',
    ],
    p: ['Run the PDF through the free CV checker for a quick review.'],
  },
];

export const WORD_FAQ: Faq[] = [
  { q: 'Is this the EU’s Europass template?', a: 'No. It is a Europass-style template made by our CV team. It follows the same section order and language scale, but it is not made by or connected to Europass or the European Union.' },
  { q: 'Can I edit it on my phone?', a: 'You can open and change text in a phone Word app, but a computer is easier. If you only have a phone, use the online builder instead.' },
  { q: 'Does it include a photo?', a: 'The templates have a photo space. Remove it if the job advert does not want a photo.' },
  { q: 'Do I need to pay to try it?', a: 'You can preview every template here free. The online builder makes a PDF free. A Word download costs one template price or comes with a Pro pass, as shown above.' },
  { q: 'How many languages can I add?', a: 'Add as many as you really use. Copy a row in the language table for each one, mother tongue first.' },
];

// ---------- Choice cards, helper quiz and layout helpers (shared by the app and the prerender) ----------
export interface Choice { id: 'build' | 'word' | 'expert'; title: string; bn: string; micro: string; cta: string; href: string; external?: boolean }

const CV_WRITING_FROM = Math.min(...PRODUCTS.filter((p) => p.kind === 'service' && p.id.startsWith('cv-') && p.id !== 'cv-review').map((p) => p.price));
export const EUROPASS_EXPERT_PATH = '/services';
export const EUROPASS_WHATSAPP_HREF = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hello HereWeGrow, I need help writing my CV.')}`;

/** The three things a visitor can do. `wordHref` differs by page: the Word page scrolls to its own template list. */
export function europassChoices(wordHref: string): Choice[] {
  return [
    { id: 'build', title: 'Build it free now', bn: 'এখনই ফ্রিতে বানান', micro: 'Free, no sign-up, PDF is free. About 10 minutes on your phone.', cta: 'Build free', href: EUROPASS_BUILDER_HREF },
    { id: 'word', title: 'Get an editable Word template', bn: 'এডিট করা যায় এমন Word টেমপ্লেট', micro: `Preview first. One template is ${EUROPASS_PRICES.single}, or use a Pro pass.`, cta: 'See Word templates', href: wordHref },
    { id: 'expert', title: 'Want an expert to write it for you?', bn: 'বিশেষজ্ঞ দিয়ে লিখিয়ে নিতে চান?', micro: `Our CV team writes it. CV writing from ${bdt(CV_WRITING_FROM)}, fixed price.`, cta: 'See CV writing service', href: EUROPASS_EXPERT_PATH },
  ];
}

export const CHOICES_HEADING = { en: 'What do you want to do?', bn: 'আপনি কী করতে চান?' };

export interface QuizOption { id: string; label: string }
export interface QuizQuestion { id: 'where' | 'own' | 'asked'; q: string; bn: string; options: QuizOption[] }
export const QUIZ_HEADING = { en: 'Do I need a Europass CV?', bn: 'আমার কি ইউরোপাস সিভি লাগবে?' };
export const QUIZ_INTRO = 'Answer three quick questions. No sign-up, nothing is sent anywhere.';
export const QUIZ: QuizQuestion[] = [
  { id: 'where', q: 'Where is the job, internship or course?', bn: 'চাকরি, ইন্টার্নশিপ বা কোর্স কোথায়?', options: [{ id: 'europe', label: 'In Europe' }, { id: 'other', label: 'In another country' }, { id: 'bd', label: 'In Bangladesh' }] },
  { id: 'own', q: 'Does the employer or programme give its own CV form or template?', bn: 'নিয়োগকর্তা বা প্রোগ্রাম কি নিজস্ব সিভি ফর্ম বা টেমপ্লেট দিয়েছে?', options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'unsure', label: 'Not sure' }] },
  { id: 'asked', q: 'Does the advert ask for a “Europass CV” or a “European CV”?', bn: 'বিজ্ঞপ্তিতে কি “Europass CV” চাওয়া হয়েছে?', options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'unsure', label: 'Not sure' }] },
];

export type QuizAnswers = Partial<Record<QuizQuestion['id'], string>>;
export interface QuizResult {
  id: 'europass' | 'theirs' | 'local';
  title: string;
  bn: string;
  body: string;
  actions: { label: string; href: string; primary?: boolean }[];
}
export const QUIZ_RESULTS: Record<QuizResult['id'], QuizResult> = {
  europass: {
    id: 'europass', title: 'Use a Europass-style CV', bn: 'ইউরোপাস স্টাইল সিভি ব্যবহার করুন',
    body: 'It is a good fit: a familiar order, languages rated A1 to C2. It does not decide the result, it only makes your CV easy to read. If the advert needs the file from the EU’s own editor, make it at europass.europa.eu.',
    actions: [{ label: 'Build free now', href: EUROPASS_BUILDER_HREF, primary: true }, { label: 'Word template', href: EUROPASS_WORD_PATH }],
  },
  theirs: {
    id: 'theirs', title: 'Follow the programme’s own format', bn: 'প্রোগ্রামের নিজস্ব ফরম্যাট অনুসরণ করুন',
    body: 'When an employer or programme gives its own form, use theirs, even if it looks plain. Our builder can still help you prepare clean wording for each section first.',
    actions: [{ label: 'Check my CV text free', href: '/tools/cv-checker', primary: true }, { label: 'Ask for CV writing help', href: EUROPASS_EXPERT_PATH }],
  },
  local: {
    id: 'local', title: 'Use a normal Bangladeshi-style CV', bn: 'সাধারণ বাংলাদেশি স্টাইলের সিভি ব্যবহার করুন',
    body: 'Local employers and other countries often use their own style, and the advert decides. Keep it short, specific and honest. A Europass-style CV is not needed here.',
    actions: [{ label: 'Build a CV free', href: '/builder', primary: true }, { label: 'Check my CV free', href: '/tools/cv-checker' }],
  },
};

/** The decision rule. The advert and the programme come first; Europe is the default for Europass-style. */
export function quizResult(a: QuizAnswers): QuizResult | null {
  if (!a.where || !a.own || !a.asked) return null;
  if (a.own === 'yes') return QUIZ_RESULTS.theirs;
  if (a.asked === 'yes') return QUIZ_RESULTS.europass;
  if (a.where === 'bd') return QUIZ_RESULTS.local;
  if (a.where === 'europe') return QUIZ_RESULTS.europass;
  return QUIZ_RESULTS.local;
}

/** Long reference parts shown as accordions (content stays in the HTML). */
export const PILLAR_FOLDED: readonly string[] = ['sections', 'cefr', 'vs-bd', 'bangladesh'];
export const WORD_FOLDED: readonly string[] = ['fill', 'edit', 'compat', 'print', 'check'];

export const HOW_HEADING = { en: 'How it works', bn: 'কীভাবে কাজ করে' };
export const HOW_LABELS = ['Fill the form', 'Check the preview', 'Download'] as const;

// ---------- JSON-LD / HTML helpers shared by scripts/seo.ts ----------
export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function blockText(b: Block): string {
  return [b.h2, ...(b.p ?? []), ...(b.ul ?? []), ...(b.ol ?? []), ...(b.table ? [b.table.head.join(' '), ...b.table.rows.map((r) => r.join(' '))] : [])].join(' ');
}

/** Visible words on each page body (without navigation and footer), used by the tests to keep within the planned lengths. */
export function pillarWords(): number {
  return wordCount([PILLAR_ANSWER, ...PILLAR_INTRO, ...PILLAR_BLOCKS.map(blockText), ...PILLAR_FAQ.map((f) => `${f.q} ${f.a}`)].join(' '));
}
export function wordPageWords(): number {
  return wordCount([WORD_ANSWER, ...WORD_BLOCKS.map(blockText), ...WORD_FAQ.map((f) => `${f.q} ${f.a}`)].join(' '));
}

/** Page text used by the tests for banned-phrase checks. */
export function allEuropassText(): string {
  return [
    ...Object.values(EUROPASS_SEO).flatMap((s) => [s.title, s.description, s.h1]),
    PILLAR_ANSWER, ...PILLAR_INTRO, ...PILLAR_BLOCKS.map(blockText), ...PILLAR_FAQ.map((f) => `${f.q} ${f.a}`),
    QUIZ_INTRO, ...QUIZ.flatMap((q) => [q.q, ...q.options.map((o) => o.label)]), ...Object.values(QUIZ_RESULTS).map((r) => `${r.title} ${r.body}`),
    ...europassChoices('#').map((c) => `${c.title} ${c.micro}`),
    HUB_INTRO, ...HUB_CHOOSE, ...HUB_FAQ.map((f) => `${f.q} ${f.a}`),
    WORD_ANSWER, ...WORD_BLOCKS.map(blockText), ...WORD_FAQ.map((f) => `${f.q} ${f.a}`),
  ].join('\n');
}

/** Internal links on each page (targets must exist: checked by the tests). */
export const EUROPASS_LINKS = {
  pillar: [EUROPASS_WORD_PATH, EUROPASS_HUB_PATH, EUROPASS_BUILDER_HREF, '/tools/cv-checker', '/templates', '/pro', '/services'],
  hub: [EUROPASS_PILLAR_PATH, EUROPASS_WORD_PATH, EUROPASS_BUILDER_HREF, '/templates', '/pro', '/tools/cv-checker'],
  word: [EUROPASS_PILLAR_PATH, EUROPASS_HUB_PATH, EUROPASS_BUILDER_HREF, '/templates', '/pro', '/tools/cv-checker'],
} as const;
