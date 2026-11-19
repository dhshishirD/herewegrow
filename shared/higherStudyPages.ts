// Copy and data for the higher study CV pages, shared by the app (src/pages/HigherStudyPages.tsx),
// the build-time prerender (shared/higherStudyHtml.ts, scripts/seo.ts) and the search titles (shared/seo.ts).
//   /academic-cv      pillar: academic CV format, template and free maker (PhD, research and lecturer posts)
//   /scholarship-cv   scholarship and masters CV, with a "which format does my programme want?" helper
//   /higher-study     light hub that sends people to the right page and to real tools
// Rules: the preset follows common norms, the programme's own form always comes first; no promise of admission, jobs, visas or scholarships.
// Only the facts in the *_SOURCES lists are stated as facts, each with its source link and a "last checked" date. Everything else is generic advice
// or says "check the official programme page". Re-check the sources and update HS_CHECKED before each edit goes live.
// Keyword separation: these pages never say the Europass keywords, except the one neutral link on /scholarship-cv (inside the helper) and one line in the hub chooser.

import { PRODUCTS, SUPPORT_WHATSAPP } from './catalog';
import {
  bdt, blockText, wordCount,
  type Block, type Choice, type Faq, type QuizAnswers, type QuizQuestion, type QuizResult, type Source,
} from './seoPage';
import { SINGLE_TEMPLATE_PRICE, TEMPLATES } from './templates';
import { isListed, isRetired, isVariant } from './templateTiers';

export { blockText, wordCount };
export type { Block, Choice, Faq, Source };

export const HS_UPDATED = '2026-11-19';
export const HS_CHECKED = '2026-11-19';

export const ACADEMIC_PATH = '/academic-cv';
export const SCHOLARSHIP_PATH = '/scholarship-cv';
export const HUB_PATH = '/higher-study';
export const HS_PATHS = [ACADEMIC_PATH, SCHOLARSHIP_PATH, HUB_PATH] as const;
export type HsPath = (typeof HS_PATHS)[number];

/** The builder presets belong to the builder team; these pages only link to them. */
export const ACADEMIC_BUILDER_HREF = '/builder?preset=academic';
export const SCHOLARSHIP_BUILDER_HREF = '/builder?preset=scholarship';
export const HS_PRESET_PAGES = { scholarship: SCHOLARSHIP_PATH, academic: ACADEMIC_PATH } as const;

export const HS_AUTHOR = { name: 'Daloyar Hassan Shishir', url: 'https://www.dhshishir.com' } as const;
export const HS_NOTE = 'The preset follows common norms. Always follow your programme’s own form and rules first. We do not promise admission, jobs or scholarships.';
export const HS_PRIVACY = 'Privacy: the CV form is filled in your browser and kept on your device. We do not send your CV details to a server.';

export const ACADEMIC_BN = 'একাডেমিক সিভি';
export const SCHOLARSHIP_BN = 'স্কলারশিপের সিভি';
export const HUB_BN = 'উচ্চশিক্ষার সিভি';
export const BN_KEYWORD: Record<HsPath, string> = { [ACADEMIC_PATH]: ACADEMIC_BN, [SCHOLARSHIP_PATH]: SCHOLARSHIP_BN, [HUB_PATH]: HUB_BN };
/** Visible Bangla line under the scholarship H1 (owner-approved wording). */
export const SCHOLARSHIP_BN_LINE = 'স্কলারশিপের সিভি: কীভাবে সাজাবেন';

export interface PageSeo { title: string; description: string; h1: string }

export const HS_SEO: Record<HsPath, PageSeo> = {
  [ACADEMIC_PATH]: {
    title: 'Academic CV Format and Template: Free Maker | HWG',
    description: 'Academic CV format for masters, PhD and research jobs: sections, publications, CGPA wording and a free maker. Bangla guide by HWG. Updated Nov 2026.',
    h1: 'Academic CV (একাডেমিক সিভি): Format, Template and Free Maker',
  },
  [SCHOLARSHIP_PATH]: {
    title: 'Scholarship CV: Format for Chevening, DAAD | HereWeGrow',
    description: 'Scholarship CV guide for Bangladeshi students: sections, GPA wording, referees and academic layout. Build free with the HWG builder.',
    h1: 'Scholarship CV Format for Bangladeshi Students',
  },
  [HUB_PATH]: {
    title: 'Higher Study CV Maker (উচ্চশিক্ষার সিভি): Free | HWG',
    description: 'Higher study CV maker for Bangladeshi students: pick a scholarship or academic CV, build free, or get help. Guides, Word templates and tools.',
    h1: 'Higher Study CV Maker (উচ্চশিক্ষার সিভি): Which CV Do You Need?',
  },
};

export function higherStudySeo(path: string): PageSeo | undefined {
  return (HS_SEO as Record<string, PageSeo>)[path];
}

// ---------- Sources (every fact stated on the pages comes from one of these) ----------
const SRC = {
  chevening: { title: 'Chevening: prepare your application (referees and degree certificate)', url: 'https://www.chevening.org/resource-hub/guidance/prepare-your-application/' },
  daad: { title: 'MyGermanUniversity: CV for a DAAD scholarship application (third party)', url: 'https://www.mygermanuniversity.com/articles/CV-for-DAAD-Scholarship-Application' },
  fulbright: { title: 'TBS Graduates: Fulbright Bangladesh 2026-27 notice (news site)', url: 'https://tbsgraduates.net/?p=31580' },
  dundee: { title: 'University of Dundee: CV writing guidance for international students', url: 'https://www.dundee.ac.uk/guides/cv-writing-guidance-international-students' },
  usc: { title: 'University of Southern California Careers: resume and CV format guidelines', url: 'https://careers.usc.edu/resources/resume-format-guidelines/' },
  tribune: { title: 'Dhaka Tribune: students from Bangladesh abroad (UNESCO data for 2023)', url: 'https://www.dhakatribune.com/business/390989/bd-students-spend-667.77m-in-fy25-to-study' },
} as const satisfies Record<string, Source>;
const checked = (s: Source) => ({ ...s, checked: HS_CHECKED });

export const ACADEMIC_SOURCES: Source[] = [SRC.usc, SRC.dundee];
export const SCHOLARSHIP_SOURCES: Source[] = [SRC.chevening, SRC.daad, SRC.fulbright, SRC.dundee, SRC.usc, SRC.tribune];
export const HUB_SOURCES: Source[] = [SRC.tribune];

// ---------- Prices, taken from the real constants (never typed by hand) ----------
const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;
const ACADEMIC_SERVICE = product('academic-cv');
const SOP_SERVICE = product('sop');
export const HS_PRICES = {
  single: bdt(SINGLE_TEMPLATE_PRICE),
  academic: bdt(ACADEMIC_SERVICE.price),
  sop: bdt(SOP_SERVICE.price),
};
export const HS_SOP = { name: SOP_SERVICE.name.en, summary: SOP_SERVICE.summary.en, delivery: SOP_SERVICE.delivery.en, price: HS_PRICES.sop };
export const HS_ACADEMIC_SERVICE = { name: ACADEMIC_SERVICE.name.en, summary: ACADEMIC_SERVICE.summary.en, delivery: ACADEMIC_SERVICE.delivery.en, price: HS_PRICES.academic };

// ---------- Images (our own previews, made from the real preset layouts with invented data) ----------
export interface HsPreview { src: string; w: number; h: number; thumb: string; tw: number; th: number; alt: string; caption: string; og: string }
export const HS_OG_SIZE = { w: 1200, h: 630 } as const;

export const ACADEMIC_PREVIEW: HsPreview = {
  src: '/higher-study/academic-cv-preview-a4.webp', w: 1588, h: 2246,
  thumb: '/higher-study/academic-cv-preview-a4-thumb.webp', tw: 360, th: 509,
  alt: 'একাডেমিক সিভি: academic CV made in the HereWeGrow builder, page 1 preview with education, research, publications and referees (sample data)',
  caption: 'Academic CV layout made in our builder. Sample data (invented).',
  og: '/higher-study/academic-cv-og-1200x630.jpg',
};
export const SCHOLARSHIP_PREVIEW: HsPreview = {
  src: '/higher-study/scholarship-cv-preview-a4.webp', w: 1588, h: 2246,
  thumb: '/higher-study/scholarship-cv-preview-a4-thumb.webp', tw: 360, th: 509,
  alt: 'স্কলারশিপের সিভি: scholarship CV made in the HereWeGrow builder, page 1 preview with education, research, awards and referees (sample data)',
  caption: 'Scholarship CV layout made in our builder. Sample data (invented).',
  og: '/higher-study/scholarship-cv-og-1200x630.jpg',
};
/** The hub shows both previews with its own alt text (its Bangla keyword), and shares the scholarship share image. */
export const HUB_PREVIEWS: HsPreview[] = [
  { ...SCHOLARSHIP_PREVIEW, alt: 'উচ্চশিক্ষার সিভি: scholarship CV layout, page 1 preview (sample data)', caption: 'Scholarship CV layout. Sample data (invented).' },
  { ...ACADEMIC_PREVIEW, alt: 'উচ্চশিক্ষার সিভি: academic CV layout, page 1 preview (sample data)', caption: 'Academic CV layout. Sample data (invented).' },
];
export const HS_PREVIEW: Record<HsPath, HsPreview> = { [ACADEMIC_PATH]: ACADEMIC_PREVIEW, [SCHOLARSHIP_PATH]: SCHOLARSHIP_PREVIEW, [HUB_PATH]: HUB_PREVIEWS[0] };

// ---------- Word templates (academic-leaning, real, on sale) ----------
export interface HsTemplate { id: string; path: string; name: string; note: string; pages: number; thumb: string; w: number; h: number }

/** Picked by eye on 2026-11-19: none of these thumbnails shows a Europass logo or EU flag. Dimensions are those of public/templates/<id>/thumb.webp (checked by the tests). */
const HS_TEMPLATE_PICKS: { id: string; name: string; note: string; w: number; h: number }[] = [
  { id: 'hwg-cv-student-higher-study-and-p-003', name: 'Higher study CV with research section, clean white', note: 'Research interest, academic credentials, skills and referees.', w: 360, h: 466 },
  { id: 'ats-academic-teaching-2page', name: 'Academic and teaching CV, plain layout', note: 'Two pages, single column, easy to edit.', w: 420, h: 544 },
  { id: 'creative-academic-teacher-2page', name: 'Academic teacher CV, two-column design', note: 'One page with a dark side panel for skills and contact.', w: 420, h: 594 },
];

/** Templates that may be listed: on sale, a lead (not a variant), not retired. Same rules as the Templates page (shared/templateTiers.ts). */
export function higherStudyTemplates(): HsTemplate[] {
  const out: HsTemplate[] = [];
  for (const pick of HS_TEMPLATE_PICKS) {
    const t = TEMPLATES.find((x) => x.id === pick.id);
    if (!t || isRetired(t.id) || isVariant(t.id) || !isListed(t.id)) continue;
    out.push({ id: t.id, path: `/templates/${t.id}`, name: pick.name, note: pick.note, pages: t.pages, thumb: `/templates/${t.id}/thumb.webp`, w: pick.w, h: pick.h });
  }
  return out;
}
export const templateAlt = (t: HsTemplate, bn: string) => `${bn}: ${t.name}, ${t.pages} ${t.pages === 1 ? 'page' : 'pages'}, page 1 preview (sample layout)`;

export const WORD_SECTION = {
  id: 'word-templates',
  h2: 'Editable Word templates',
  bn: 'এডিট করা যায় এমন Word টেমপ্লেট',
  intro: `Prefer Word? These three academic-leaning templates open in Microsoft Word. Preview each one free. One template costs ${HS_PRICES.single}, or use a Pro pass.`,
};

// ---------- Choice cards ----------
export const HS_WHATSAPP_HREF = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hello HereWeGrow, I need help with my academic CV or SOP for a study application.')}`;
export const HS_EXPERT_PATH = '/services';
export const CHOICES_HEADING = { en: 'What do you want to do?', bn: 'আপনি কী করতে চান?' };

/** The three things a visitor can do. On the hub the free builder opens the scholarship layout, with the academic one as a second link. */
export function higherStudyChoices(page: HsPath): Choice[] {
  const build = page === ACADEMIC_PATH ? ACADEMIC_BUILDER_HREF : SCHOLARSHIP_BUILDER_HREF;
  return [
    {
      id: 'build', title: 'Build it free now', bn: 'এখনই ফ্রিতে বানান', micro: 'Free, no sign-up, PDF is free. About 15 minutes on your phone.', cta: 'Build free', href: build,
      ...(page === HUB_PATH ? { alt: { label: 'PhD, research or lecturer post? Open the academic layout', href: ACADEMIC_BUILDER_HREF } } : {}),
    },
    { id: 'word', title: 'Get an editable Word template', bn: 'এডিট করা যায় এমন Word টেমপ্লেট', micro: `Preview first. One template is ${HS_PRICES.single}, or use a Pro pass.`, cta: 'See Word templates', href: `#${WORD_SECTION.id}` },
    {
      id: 'expert', title: 'Want an expert to write it for you?', bn: 'বিশেষজ্ঞ দিয়ে লিখিয়ে নিতে চান?',
      micro: `Our team writes it. Academic CV ${HS_PRICES.academic}, SOP or motivation letter ${HS_PRICES.sop}, fixed price.`, cta: 'See academic CV and SOP services', href: HS_EXPERT_PATH,
    },
  ];
}

/** Id of the "how it works" block, drawn as a three-step strip. */
export const HOW_STEP_ID = 'how';
export const HOW_HEADING = { en: 'How it works', bn: 'কীভাবে কাজ করে' };
export const HOW_LABELS = ['Fill the form', 'Check the preview', 'Download'] as const;
const HOW_STEP_3 = 'Check the preview for gaps, spelling and dates, then download the PDF. It is free with a small footer mark; Pro removes the mark and adds Word export.';

// ---------- Academic pillar: /academic-cv ----------
export const ACADEMIC_ANSWER =
  'An academic CV (একাডেমিক সিভি), or academic curriculum vitae, is a longer CV for masters and PhD applications, research assistant posts and lecturer jobs. It leads with education and research, then lists publications, conferences, teaching, grants, awards, skills and referees. Two to four pages is normal. Write every grade with its scale, such as CGPA 3.60 out of 4.00.';

export const ACADEMIC_INTRO = [
  'Applying for a masters, a PhD, a research assistant post or a lecturer job? This guide shows what goes in each section, how to write publications and your thesis, how to write Bangladeshi grades honestly, and who to ask as referees. Build a clean academic CV free on your phone, or open an editable Word file. Your programme’s own form always comes first.',
];

export const ACADEMIC_BLOCKS: Block[] = [
  {
    id: 'what-is',
    h2: 'What is an academic CV (একাডেমিক সিভি)?',
    p: [
      'An academic CV is the CV that universities and research groups expect. It is longer and more detailed than a job CV, because it has to show your research and not only your jobs. Admissions committees and hiring panels read it to see what you studied, what you found out, what you have written and who can speak for you.',
      'You need one for a masters or PhD application, a research assistant post, a fellowship, and a lecturer or teaching job at a university. This page is about the layout and the habits that make it work. Our builder makes an academic CV with these sections already in place. It follows common norms, so always follow the programme’s own form first.',
    ],
  },
  {
    id: 'how',
    h2: 'How to make one in about fifteen minutes',
    ol: [
      'Open the free builder with the academic layout already chosen.',
      'Add your education, thesis, research, publications, teaching and referees. Write every grade with its scale.',
      HOW_STEP_3,
    ],
    p: ['Want a second look at your wording? Run the text through the free CV checker.'],
  },
  {
    id: 'sections',
    h2: 'Sections of an academic CV, in the usual order',
    p: ['The order changes by field and country, but an academic CV normally runs like this:'],
    ol: [
      'Personal details: name, email, phone with country code (+880) and city. Add a Google Scholar, ORCID or LinkedIn link only if the page is up to date. Leave out family details and ID numbers.',
      'Research interests or short profile: two or three lines naming your field, your main topic or method, and what you are applying for.',
      'Education: newest first, with dates, degree, university, country, the grading scale, and your thesis title and supervisor.',
      'Research experience: projects, lab work or fieldwork, with the question, the method and your own role in short lines.',
      'Publications: papers, chapters, reports and preprints in one consistent citation style, with the status of each.',
      'Conferences and presentations: title, event, place and year, marked as a talk or a poster.',
      'Teaching and work: teaching assistant roles, tutoring, lecturing and relevant jobs, newest first.',
      'Grants, awards and scholarships: name, giver and year, and the amount if it helps.',
      'Skills: research methods, software, lab techniques and languages, each tied to something you did.',
      'Referees: two or three people, with title, department, university and email.',
    ],
  },
  {
    id: 'vs-job',
    h2: 'How an academic CV differs from a job CV',
    p: ['The two CVs share facts but not weight. The same person gets a different emphasis.'],
    table: {
      head: ['Topic', 'Job CV', 'Academic CV'],
      rows: [
        ['Length', 'One or two pages', 'Two to four pages, longer later in a career'],
        ['First section', 'Profile and work experience', 'Education and research'],
        ['Detail', 'Short achievements', 'Full publication and conference lists'],
        ['Proof', 'Results, numbers, tools', 'Papers, a thesis, grants, supervisors'],
        ['Photo', 'Depends on the country and the advert', 'Often left out; check the programme'],
        ['Referees', 'Often “on request”', 'Names and contacts, usually professors'],
      ],
    },
  },
  {
    id: 'length',
    h2: 'How long should it be? Two to four pages',
    p: [
      'A masters applicant with a BSc and a thesis usually fits two pages. Someone with a masters thesis, a paper or two and teaching experience often needs three. A PhD applicant, researcher or lecturer with a longer record can reach four. Beyond that is for senior academics.',
      'Never pad. A short, true page beats a long list of every course. If the programme sets a page limit, obey it and put the strongest items first. Add your name and page numbers in the header or footer so loose pages stay together.',
      'University career guidance in the US says academic and research positions use a CV that can run longer than one page, and that US applications leave out the photo and the birthdate. UK university guidance for international students says one or two pages and no photo for ordinary job CVs.',
    ],
    source: checked(SRC.usc),
  },
  {
    id: 'publications',
    h2: 'How to write publications and your thesis',
    p: ['Use one citation style from start to finish, the one your field uses. Put your own name in bold so the reader finds it, and give each item a status: published, accepted, under review or in preparation. Never move an item up a status. Committees check.'],
    ul: [
      'Published: author list, year, title, journal, volume and pages, with the DOI link if you have one.',
      'Under review or in preparation: say so in brackets, and list it only if you can send a draft when asked.',
      'Thesis: title, degree, university, year and supervisor on one line, then one short line on the method and the main finding.',
      'No publications yet: that is normal for a first masters. Show the thesis, a class project, a poster or a research assistant role instead.',
    ],
  },
  {
    id: 'thesis-example',
    h2: 'A thesis line (Sample data (invented))',
    p: [
      'Sample data (invented). The thesis, the supervisor and the university below are made up.',
      '“MSc thesis: Effect of bank lending rates on small business growth in Bangladesh, 2010 to 2022. Supervisor: Dr A. Rahman, Department of Economics, Example University, 2025. Used panel data from 64 districts and found a weak link.”',
    ],
  },
  {
    id: 'cgpa',
    h2: 'CGPA and grades: always write the scale',
    p: [
      'In Bangladesh, school and college boards mark SSC and HSC results out of 5.00, and most universities mark the BSc and MSc out of 4.00. Some institutions differ, so copy the scale from your own transcript.',
      'Write the number and the scale together, every time. “CGPA 3.62” alone is unclear, because a reader abroad may not know whether it is out of 4.00 or 5.00. Do not convert your grade to a US or UK grade yourself. The receiving university decides how to read it. Add a class position or merit rank only if it is printed on your transcript.',
    ],
    table: {
      head: ['Level', 'How to write it (invented numbers)'],
      rows: [
        ['SSC', 'GPA 5.00 out of 5.00 (2016)'],
        ['HSC', 'GPA 4.92 out of 5.00 (2018)'],
        ['BSc', 'CGPA 3.62 out of 4.00 (2023)'],
        ['MSc', 'CGPA 3.80 out of 4.00 (2025)'],
      ],
    },
  },
  {
    id: 'referees',
    h2: 'Referees: choose professors who know your work',
    p: ['Two or three referees is normal. Choose people who taught or supervised you and can describe your work in detail: your thesis supervisor first, then a course teacher or a manager from a research job. A famous name who barely knows you is weaker than a lecturer who watched you work for a year.'],
    ul: [
      'Ask permission first, and send each referee your CV and the programme details.',
      'Write name, title, department, university, email and phone, as the form asks.',
      'Do not list relatives, friends or classmates.',
      'Some programmes want names on the CV and others ask for letters later. Check the programme page before you decide.',
    ],
  },
  {
    id: 'sample',
    h2: 'Before and after (Sample data (invented))',
    p: [
      'Sample data (invented). The person below is made up, to show how the same facts read better.',
      'Before: “Objective: To study in a reputed university for higher study. Education: MSc in Physics, CGPA 3.6. Research: thesis done. Publications: one paper.”',
      'After: “Physics graduate (condensed matter) applying for a masters in materials science. MSc in Physics, Example University, 2025, CGPA 3.60 out of 4.00. Thesis: simulation of heat flow in thin films, supervised by Dr S. Akter, using Python on 120 runs. Poster at a national physics conference, 2024. Paper under review (2025). Teaching assistant for first-year labs, two semesters.”',
      'The second version names the field, the scale, the supervisor, the method and the status of each item.',
    ],
  },
  {
    id: 'bangladesh',
    h2: 'What to change from a usual Bangladeshi CV',
    ul: [
      'Leave out father’s and mother’s names, siblings, religion, NID or passport number and blood group, unless the form asks. A committee judges your work, not your family.',
      'Replace the general objective line with a short profile that names your field and the programme.',
      'Photo and date of birth: US applications leave them out and UK guidance says no photo, but some countries expect them. Check the programme page.',
      'Write the scale for every grade, as in the table above.',
      'Explain gaps in one honest line, for example “full-time exam preparation”.',
      'Name the file like Name_Academic_CV.pdf and keep the Word file for edits.',
    ],
  },
  {
    id: 'mistakes',
    h2: 'Common mistakes to avoid',
    ul: [
      'Listing every course, training and certificate. Keep what supports this application.',
      'Writing a grade with no scale.',
      'Moving a paper from “under review” to “published” in your head. Committees check.',
      'Sending one CV to every programme. Reorder the sections and change the profile for each one.',
      'Copying a sample line by line. Use your own words, numbers and supervisor names.',
      'Expecting a CV to decide the result. A tidy CV helps people read your story; it does not decide admission, a job or a scholarship.',
    ],
  },
];

export const ACADEMIC_FAQ: Faq[] = [
  { q: 'Is an academic CV the same as a resume?', a: 'No. A resume is a short, one- or two-page summary for jobs. An academic CV is longer and covers education, research, publications, teaching and referees. Some countries use the two words loosely, so follow what the programme asks for.' },
  { q: 'How long should an academic CV be?', a: 'Two to four pages. Two pages are enough for many masters applicants. A PhD applicant or lecturer with papers and teaching often needs three or four. If the programme sets a page limit, follow it.' },
  { q: 'Should I put my CGPA on it?', a: 'Yes, with its scale, for example “CGPA 3.62 out of 4.00”. Do the same for SSC and HSC, which are usually out of 5.00. Do not convert it to another grading system yourself.' },
  { q: 'What if I have no publications?', a: 'Leave the section out or call it “Research output”. Show your thesis, a class project, a poster or research assistant work instead. Never list a paper that does not exist.' },
  { q: 'Do I need a photo?', a: 'Usually not for applications to the US or the UK. Some countries and programmes ask for one, so check the programme page. If you add one, keep it plain and professional.' },
  { q: 'Is the free builder really free?', a: `You can build the CV and download a PDF without signing up, with a small footer mark. A Pro pass removes the mark and adds Word export. An editable Word template costs ${HS_PRICES.single}.` },
];
export const ACADEMIC_FAQ_HEADING = 'Questions about the academic CV';
/** Long reference parts shown as accordions (their text stays in the HTML). */
export const ACADEMIC_FOLDED: readonly string[] = ['sections', 'vs-job', 'cgpa', 'bangladesh'];

// ---------- Scholarship page: /scholarship-cv ----------
export const SCHOLARSHIP_ANSWER =
  'A scholarship CV (স্কলারশিপের সিভি) is a clear, honest CV for a scholarship or masters application. It puts education, research, awards and referees first, writes every grade with its scale, and keeps to the page limit the programme sets. If the programme gives its own form, use that form first. Our preset follows common norms.';

export const SCHOLARSHIP_INTRO = [
  'Filling in a scholarship or masters application from Bangladesh? This guide shows which format to use, what Chevening, DAAD and Fulbright applicants should check, what Bangladeshi applicants often get wrong, and how to write grades and referees. Build a scholarship CV free on your phone, or open an editable Word file.',
];

export const SCHOLARSHIP_BLOCKS: Block[] = [
  {
    id: 'how',
    h2: 'How to make one in about fifteen minutes',
    ol: [
      'Open the free builder with the scholarship layout already chosen.',
      'Add your education, thesis or research, awards, work and referees. Write every grade with its scale.',
      HOW_STEP_3,
    ],
  },
  {
    id: 'sections',
    h2: 'What goes in a scholarship CV',
    p: ['A scholarship CV is shorter than an academic CV, and it leads with what selectors weigh most. A usual order:'],
    ol: [
      'Personal details: name, email, phone with country code (+880) and city. A photo only if the programme page asks for one.',
      'Short profile: two or three lines on your field, your goal and the programme.',
      'Education: newest first, with dates, university, country, the grading scale and your thesis or final project.',
      'Research or projects: what you studied, the method and your own role.',
      'Awards, scholarships and activities: name, giver and year. Add leadership and volunteering only when it shows something real.',
      'Work or internships: short lines with a number where you have one.',
      'Skills, languages and test scores, such as IELTS, with the date.',
      'Referees: two or three people, with title, department, university and email.',
    ],
  },
  {
    id: 'length',
    h2: 'How long should a scholarship CV be?',
    p: ['Follow the programme first. If it gives no limit, one or two pages is a safe choice for a first masters, and a third page is fine only when every line earns its place. A CV for scholarship applications or a CV for masters application should stay in that range, while a CV for PhD application or a research post usually uses the longer academic CV instead. Put your name and page numbers in the header, and save the file as a PDF named like Name_Scholarship_CV.pdf.'],
  },
  {
    id: 'chevening',
    h2: 'Chevening: referees and degree certificate',
    p: ['Chevening’s application guidance does not set a CV format. It does cover two things you can prepare now.'],
    ul: [
      'Referees: two, with their names and contact details. Reference letters are requested at the interview stage.',
      'Degree certificate: the guidance asks for the official degree certificate (originals) and says transcripts are not accepted in its place.',
    ],
    source: checked(SRC.chevening),
  },
  {
    id: 'daad',
    h2: 'DAAD: check each programme page',
    p: ['DAAD itself does not publish general CV guidelines, according to a third-party guide, so the page of your own programme matters most.'],
    ul: [
      'Some programmes ask for a tabular CV, with dates in one column and details in the other.',
      'One or two pages is usual. Some programmes accept up to three.',
      'A photo is usually included in Germany, but check the programme page.',
    ],
    source: checked(SRC.daad),
  },
  {
    id: 'fulbright',
    h2: 'Fulbright Bangladesh: read the form',
    p: ['A Bangladeshi news site’s page on the Fulbright Bangladesh 2026-27 round listed transcripts, three recommendation letters and TOEFL or IELTS. It did not list a CV. The deadline for that round was 3 October 2026, so watch for the next notice and read the official application form to see what it asks for.'],
    source: checked(SRC.fulbright),
  },
  {
    id: 'other-programmes',
    h2: 'CSC, Commonwealth, Erasmus and other programmes',
    p: ['For the China Scholarship Council (CSC), Commonwealth, Erasmus and other programmes, check the official programme page for the CV rules. We have not verified their current rules, so we do not state them here.'],
  },
  {
    id: 'countries',
    h2: 'Study abroad CV habits by country',
    p: ['UNESCO figures for 2023, reported by Dhaka Tribune, counted 52,799 students from Bangladesh studying abroad. The largest groups were in the US (8,524), the UK (6,586), Canada (5,835), Malaysia (5,714) and Germany (5,046). Each country has its own CV habits:'],
    table: {
      head: ['Country', 'What the sources say'],
      rows: [
        ['US', 'University career guidance: academic and research positions use a CV that can run longer than one page, and US applications leave out the photo and the birthdate.'],
        ['UK', 'University guidance for international students: one or two pages, no photo.'],
        ['Germany', 'Third-party DAAD guide: usually one or two pages, photo usually included. Check the programme.'],
        ['Canada, Malaysia', 'We have not checked a source for these. Follow the programme page.'],
      ],
    },
    source: checked(SRC.tribune),
  },
  {
    id: 'wrong',
    h2: 'What Bangladeshi applicants often get wrong',
    ol: [
      'Family and ID details. Father’s name, mother’s name, NID number and religion are not needed on a scholarship CV unless the form asks for them.',
      'Grades without a scale. “CGPA 3.5” could be out of 4.00 or 5.00. Write the scale every time.',
      'A general objective line. “To study in a reputed university” says nothing. Name your field and the programme.',
      'Padding. Every short course and certificate is listed, while the thesis gets one word. Lead with research and results.',
      'Weak referees. “References on request”, a relative, or a teacher who was never asked. Name two real referees who agreed.',
      'One CV for every programme. Reorder the sections and change the profile line for each application.',
    ],
  },
  {
    id: 'sample',
    h2: 'Before and after (Sample data (invented))',
    p: [
      'Sample data (invented). The person below is made up, to show how the same facts read better.',
      'Before: “Objective: To pursue masters in a reputed foreign university with scholarship. Education: BSc in CSE, CGPA 3.4. Experience: internship. Skills: MS Office, teamwork.”',
      'After: “Computer science graduate applying for a masters in data science. BSc in CSE, Example University, 2025, CGPA 3.40 out of 4.00. Final-year project: a bus-arrival predictor for Dhaka, built on six months of GPS data, supervised by Dr M. Hasan. Intern at a software company in Dhaka for three months: wrote tests for a payment module. Volunteer coding trainer for 30 school students. Referees: two lecturers, with names and emails below.”',
    ],
  },
  {
    id: 'gpa',
    h2: 'Grades and GPA wording',
    p: [
      'Write the number and the scale together: “CGPA 3.40 out of 4.00 (BSc)” and “GPA 5.00 out of 5.00 (HSC)”. School and college boards usually mark SSC and HSC out of 5.00, and most universities mark degrees out of 4.00, but copy the scale from your own transcript. Do not convert it to a foreign grade. The programme decides how to read it.',
      'Some programmes also want the transcript or the certificate as a separate file, as Chevening does for the degree certificate. The academic CV guide has a fuller table of examples.',
    ],
  },
  {
    id: 'referees',
    h2: 'Referees for a scholarship CV',
    p: ['Choose two or three people who know your work, such as your thesis supervisor and a course teacher. Ask permission first and send them your CV and the programme details. Write their name, title, department, university and email. Programmes differ: Chevening asks for two referees, and the Fulbright notice listed three recommendation letters. Check how many your programme wants, and whether they are named on the CV or asked later.'],
  },
];

export const SCHOLARSHIP_FAQ: Faq[] = [
  { q: 'What is a scholarship CV?', a: 'It is the CV you attach to a scholarship or masters application. It is the same truthful record as any CV, arranged to show education, research, awards and referees first, and kept within the programme’s page limit.' },
  { q: 'How many pages should a scholarship CV be?', a: 'Follow the programme. If it says nothing, one or two pages is a safe choice for a first masters. UK university guidance says one or two pages, and a third-party DAAD guide says one or two, sometimes three. PhD and research posts usually use a longer academic CV.' },
  { q: 'Should I add a photo?', a: 'Check the programme page. US applications leave photos out, UK guidance says no photo, and a third-party DAAD guide says a photo is usually included in Germany.' },
  { q: 'Does the preset follow Chevening or DAAD rules?', a: 'No preset can. Chevening’s guidance does not set a CV format, and DAAD publishes no general CV rules, so our preset follows common norms. Always follow the programme’s own form first.' },
  { q: 'Which referees should I choose?', a: 'Two or three people who know your work, such as your thesis supervisor and a course teacher. Ask permission first and send them your CV. Chevening asks for two referees, and the Fulbright notice listed three recommendation letters.' },
  { q: 'Will a good CV decide the result?', a: 'No. A tidy CV helps readers see your record. We do not promise admission or scholarships, and selection depends on the programme.' },
];
export const SCHOLARSHIP_FAQ_HEADING = 'Questions about the scholarship CV';
export const SCHOLARSHIP_FOLDED: readonly string[] = ['sections', 'chevening', 'daad', 'fulbright', 'other-programmes', 'countries', 'gpa', 'referees'];

// ----- "Which format does my programme want?" helper (scholarship page) -----
export const SCHOLARSHIP_QUIZ_HEADING = { en: 'Which format does my programme want?', bn: 'আমার প্রোগ্রাম কোন ফরম্যাট চায়?' };
export const SCHOLARSHIP_QUIZ_INTRO = 'Answer two quick questions. No sign-up, nothing is sent anywhere.';
export const SCHOLARSHIP_QUIZ: QuizQuestion[] = [
  {
    id: 'level', q: 'What are you applying for?', bn: 'কীসের জন্য আবেদন করছেন?',
    options: [{ id: 'masters', label: 'Masters or a scholarship' }, { id: 'research', label: 'PhD, research assistant or lecturer post' }, { id: 'unsure', label: 'Not sure' }],
  },
  {
    id: 'form', q: 'What does the programme say about the CV?', bn: 'প্রোগ্রাম সিভি নিয়ে কী বলেছে?',
    options: [{ id: 'own', label: 'It gives its own form or template' }, { id: 'named', label: 'It names a specific CV format' }, { id: 'plain', label: 'It just says “CV”, or says nothing' }],
  },
];
export const SCHOLARSHIP_QUIZ_RESULTS: Record<'theirs' | 'named' | 'academic' | 'scholarship', QuizResult> = {
  theirs: {
    id: 'theirs', title: 'Follow the programme’s own form', bn: 'প্রোগ্রামের নিজস্ব ফর্ম অনুসরণ করুন',
    body: 'When a programme gives its own form or template, use that, even if it looks plain. Our builder can still help you prepare clean wording for each section first.',
    actions: [{ label: 'Check my CV text free', href: '/tools/cv-checker', primary: true }, { label: 'Ask for CV writing help', href: HS_EXPERT_PATH }],
  },
  named: {
    id: 'named', title: 'Follow the format it names', bn: 'যে ফরম্যাটের নাম দিয়েছে সেটি অনুসরণ করুন',
    body: 'Use exactly the format the programme names. If that format is Europass, our separate guide explains the layout.',
    actions: [{ label: 'Europass-style CV guide', href: '/europass-cv', primary: true }, { label: 'Scholarship CV preset', href: SCHOLARSHIP_BUILDER_HREF }],
  },
  academic: {
    id: 'academic', title: 'Use the academic CV', bn: 'একাডেমিক সিভি ব্যবহার করুন',
    body: 'For a PhD, a research assistant post or a lecturer job, a longer academic CV with publications, teaching and referees is the usual choice. If the programme sets a page limit, follow it.',
    actions: [{ label: 'Build an academic CV free', href: ACADEMIC_BUILDER_HREF, primary: true }, { label: 'Read the academic CV guide', href: ACADEMIC_PATH }],
  },
  scholarship: {
    id: 'scholarship', title: 'Use the scholarship preset', bn: 'স্কলারশিপ প্রিসেট ব্যবহার করুন',
    body: 'When the programme just says “CV”, a clear one or two pages with education, research, awards and referees first is a safe choice. The preset follows common norms, so check the programme page for its limits.',
    actions: [{ label: 'Build a scholarship CV free', href: SCHOLARSHIP_BUILDER_HREF, primary: true }, { label: 'Word templates', href: `#${WORD_SECTION.id}` }],
  },
};

/** The decision rule. The programme's own form comes first, then a named format, then the kind of post. */
export function scholarshipQuizResult(a: QuizAnswers): QuizResult | null {
  if (!a.level || !a.form) return null;
  if (a.form === 'own') return SCHOLARSHIP_QUIZ_RESULTS.theirs;
  if (a.form === 'named') return SCHOLARSHIP_QUIZ_RESULTS.named;
  if (a.level === 'research') return SCHOLARSHIP_QUIZ_RESULTS.academic;
  return SCHOLARSHIP_QUIZ_RESULTS.scholarship;
}

// ---------- Hub: /higher-study ----------
export const HUB_ANSWER =
  'A higher study CV (উচ্চশিক্ষার সিভি), also called a CV for higher studies, is the CV you send with a masters, PhD or scholarship application. Use the scholarship CV for most masters and scholarship forms, and the academic CV for PhD, research and lecturer posts. Your programme’s own form always comes first.';

export const HUB_INTRO = [
  'Not sure which CV to build? Pick the line below that matches your application. Both builders are free, work on a phone and download a PDF without sign-up.',
  'The scholarship CV is shorter and suits a first masters. The academic CV is longer and suits applicants with a thesis, papers or teaching to show. If you are unsure, start with the scholarship CV and add the research items that fit the page limit.',
];

export interface HubPick { situation: string; label: string; href: string; note: string }
export const HUB_PICKS_HEADING = 'Which CV do I need?';
export const HUB_PICKS: HubPick[] = [
  { situation: 'A masters or scholarship application, and the programme just says “CV”', label: 'Scholarship CV', href: SCHOLARSHIP_PATH, note: 'Education, research, awards and referees first, usually one or two pages.' },
  { situation: 'A PhD, research assistant, fellowship or lecturer post', label: 'Academic CV', href: ACADEMIC_PATH, note: 'Two to four pages with publications, conferences, teaching and grants.' },
  { situation: 'The programme gives its own form', label: 'Check your wording first', href: '/tools/cv-checker', note: 'Fill in that form, and use our guides to prepare the text for each box.' },
  { situation: 'The programme asks for a Europass CV', label: 'Europass-style CV guide', href: '/europass-cv', note: 'Our separate guide to that layout.' },
];

export interface HubTool { label: string; href: string; note: string }
export const HUB_TOOLS_HEADING = 'Tools and services for a study application';
export const HUB_TOOLS: HubTool[] = [
  { label: 'Free CV checker', href: '/tools/cv-checker', note: 'Upload a PDF to get a score out of 100 and a list of fixes. The file stays in your browser.' },
  { label: 'Application letter generator', href: '/tools/application-letter', note: 'Draft a letter in Bangla or English and edit it. It is built for job applications, so rewrite it for your programme.' },
  { label: `${HS_SOP.name} (${HS_SOP.price})`, href: HS_EXPERT_PATH, note: `${HS_SOP.summary} Delivery ${HS_SOP.delivery.toLowerCase()}.` },
  { label: `${HS_ACADEMIC_SERVICE.name} (${HS_ACADEMIC_SERVICE.price})`, href: HS_EXPERT_PATH, note: `${HS_ACADEMIC_SERVICE.summary} Delivery ${HS_ACADEMIC_SERVICE.delivery.toLowerCase()}.` },
  { label: 'Word CV templates', href: '/templates', note: `Editable files for every kind of job. One template is ${HS_PRICES.single}.` },
];

export const HUB_BLOCKS: Block[] = [
  {
    id: 'checklist',
    h2: 'Before you apply: a short checklist',
    ol: [
      'Open the programme’s own page and copy the deadline, the list of documents and any CV rule.',
      'Gather transcripts, certificates and test scores. Write every grade with its scale.',
      'Ask two or three referees, such as your thesis supervisor, and send them your CV.',
      'Build the CV, then read it once as a stranger would. Cut what does not help this application.',
      'Check names, dates and file names, and submit before the deadline, not on it.',
    ],
  },
  {
    id: 'where',
    h2: 'Where Bangladeshi students apply',
    p: ['UNESCO figures for 2023, reported by Dhaka Tribune, counted 52,799 students from Bangladesh studying abroad. The largest groups were in the US (8,524), the UK (6,586), Canada (5,835), Malaysia (5,714) and Germany (5,046). Each country and programme has its own habits, so the programme page always wins.'],
    source: checked(SRC.tribune),
  },
];

export const HUB_FAQ: Faq[] = [
  { q: 'What is a higher study CV?', a: 'It is the CV used for a masters, PhD or scholarship application. It usually puts education and research before work, and writes every grade with its scale.' },
  { q: 'Scholarship CV or academic CV: which one?', a: 'Use the scholarship CV for most masters and scholarship forms. Use the academic CV for PhD, research assistant and lecturer posts, where publications and teaching matter.' },
  { q: 'Is the builder free?', a: 'Yes. Building and downloading a PDF is free without sign-up, with a small footer mark. Pro removes the mark and adds Word export.' },
  { q: 'Do I need a Word template?', a: `Only if you prefer editing in Word. Each template here costs ${HS_PRICES.single}, and you can preview it free first.` },
  { q: 'Can you write my SOP or academic CV?', a: `Yes. Our team writes an SOP or motivation letter for ${HS_PRICES.sop} and an academic CV for ${HS_PRICES.academic}. Prices are fixed, and the services page has the details.` },
  { q: 'Does a CV decide admission?', a: 'No. A clear CV helps readers see your record, but selection depends on the programme. We do not promise admission or scholarships.' },
];
export const HUB_FAQ_HEADING = 'Questions about the higher study CV';
export const HUB_FOLDED: readonly string[] = ['checklist'];

// ---------- Layout helpers shared by the app, the prerender and the tests ----------
export interface PageContent {
  seo: PageSeo;
  answer: string;
  intro: string[];
  blocks: Block[];
  faq: Faq[];
  faqHeading: string;
  folded: readonly string[];
  sources: Source[];
  bn: string;
}
export const HS_CONTENT: Record<HsPath, PageContent> = {
  [ACADEMIC_PATH]: { seo: HS_SEO[ACADEMIC_PATH], answer: ACADEMIC_ANSWER, intro: ACADEMIC_INTRO, blocks: ACADEMIC_BLOCKS, faq: ACADEMIC_FAQ, faqHeading: ACADEMIC_FAQ_HEADING, folded: ACADEMIC_FOLDED, sources: ACADEMIC_SOURCES, bn: ACADEMIC_BN },
  [SCHOLARSHIP_PATH]: { seo: HS_SEO[SCHOLARSHIP_PATH], answer: SCHOLARSHIP_ANSWER, intro: SCHOLARSHIP_INTRO, blocks: SCHOLARSHIP_BLOCKS, faq: SCHOLARSHIP_FAQ, faqHeading: SCHOLARSHIP_FAQ_HEADING, folded: SCHOLARSHIP_FOLDED, sources: SCHOLARSHIP_SOURCES, bn: SCHOLARSHIP_BN },
  [HUB_PATH]: { seo: HS_SEO[HUB_PATH], answer: HUB_ANSWER, intro: HUB_INTRO, blocks: HUB_BLOCKS, faq: HUB_FAQ, faqHeading: HUB_FAQ_HEADING, folded: HUB_FOLDED, sources: HUB_SOURCES, bn: HUB_BN },
};

/** Visible words in the page body (no navigation, no footer): used by the tests to keep within the planned lengths. */
export function pageWords(path: HsPath): number {
  const c = HS_CONTENT[path];
  const extra = path === HUB_PATH
    ? [HUB_PICKS_HEADING, ...HUB_PICKS.map((p) => `${p.situation} ${p.label} ${p.note}`), HUB_TOOLS_HEADING, ...HUB_TOOLS.map((t) => `${t.label} ${t.note}`)]
    : [];
  return wordCount([c.answer, ...c.intro, ...c.blocks.map(blockText), ...c.faq.map((f) => `${f.q} ${f.a}`), ...extra].join(' '));
}

/** All page text, for the banned-phrase and keyword-separation tests. */
export function allHigherStudyText(path?: HsPath): string {
  const paths = path ? [path] : [...HS_PATHS];
  const parts: string[] = [];
  for (const p of paths) {
    const c = HS_CONTENT[p];
    parts.push(c.seo.title, c.seo.description, c.seo.h1, c.answer, ...c.intro, ...c.blocks.map(blockText), ...c.faq.map((f) => `${f.q} ${f.a}`), c.faqHeading);
    parts.push(...higherStudyChoices(p).flatMap((x) => [x.title, x.micro, x.cta, x.alt?.label ?? '']));
    if (p === SCHOLARSHIP_PATH) {
      parts.push(SCHOLARSHIP_BN_LINE, SCHOLARSHIP_QUIZ_INTRO, SCHOLARSHIP_QUIZ_HEADING.en, ...SCHOLARSHIP_QUIZ.flatMap((q) => [q.q, ...q.options.map((o) => o.label)]), ...Object.values(SCHOLARSHIP_QUIZ_RESULTS).flatMap((r) => [r.title, r.body, ...r.actions.map((a) => a.label)]));
    }
    if (p === HUB_PATH) parts.push(HUB_PICKS_HEADING, ...HUB_PICKS.map((x) => `${x.situation} ${x.label} ${x.note}`), HUB_TOOLS_HEADING, ...HUB_TOOLS.map((t) => `${t.label} ${t.note}`));
  }
  parts.push(WORD_SECTION.h2, WORD_SECTION.intro, ...higherStudyTemplates().flatMap((t) => [t.name, t.note]), HS_NOTE, HS_PRIVACY);
  return parts.join('\n');
}

/** Internal links on each page (targets must exist: checked by the tests). */
export const HS_LINKS: Record<HsPath, string[]> = {
  [ACADEMIC_PATH]: [HUB_PATH, SCHOLARSHIP_PATH, ACADEMIC_BUILDER_HREF, '/tools/cv-checker', '/templates', '/pro', '/services'],
  [SCHOLARSHIP_PATH]: [HUB_PATH, ACADEMIC_PATH, SCHOLARSHIP_BUILDER_HREF, ACADEMIC_BUILDER_HREF, '/europass-cv', '/tools/cv-checker', '/templates', '/pro', '/services'],
  [HUB_PATH]: [SCHOLARSHIP_PATH, ACADEMIC_PATH, SCHOLARSHIP_BUILDER_HREF, ACADEMIC_BUILDER_HREF, '/europass-cv', '/tools/cv-checker', '/tools/application-letter', '/templates', '/pro', '/services'],
};
