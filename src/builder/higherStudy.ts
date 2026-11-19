// Higher-study layouts (opened with /builder?preset=scholarship or ?preset=academic): education first, one column, serif, 11 pt.
// Our own layout following common scholarship and academic CV norms. It is not any programme's official form.

import { emptyCv, newCustomItem, newReference, uid, type BuilderState, type CvData } from './model';

export type HigherLayout = 'scholarship' | 'academic';
export const HIGHER_LAYOUTS: readonly HigherLayout[] = ['scholarship', 'academic'];
export const isHigherLayout = (l: string | null | undefined): l is HigherLayout => l === 'scholarship' || l === 'academic';

export const HIGHER_ACCENT = '#1e3a5f';
export const HIGHER_FONT = 'times';

export const HIGHER_NOTE = {
  en: "Preset follows common scholarship norms. Always follow the programme's own form first.",
  bn: 'প্রিসেটটি স্কলারশিপের সাধারণ নিয়ম অনুসরণ করে। সবসময় আগে প্রোগ্রামের নিজস্ব ফরম অনুসরণ করুন।',
};
export const HIGHER_PHOTO_NOTE = {
  en: 'Photo is off. Add one only if the programme asks. Date of birth, nationality, gender, marital status, religion and parents\' names are off too.',
  bn: 'ছবি বন্ধ আছে। প্রোগ্রাম চাইলে তবেই দিন। জন্মতারিখ, জাতীয়তা, লিঙ্গ, বৈবাহিক অবস্থা, ধর্ম ও বাবা-মায়ের নামও বন্ধ আছে।',
};
export const HIGHER_LENGTH: Record<HigherLayout, { en: string; bn: string }> = {
  scholarship: { en: 'Aim for 1 to 2 pages. Use up to 3 only if the programme allows it.', bn: '১ থেকে ২ পৃষ্ঠার মধ্যে রাখুন। প্রোগ্রাম অনুমতি দিলে তবেই ৩ পৃষ্ঠা পর্যন্ত।' },
  academic: { en: 'Academic CVs usually run 2 to 4 pages. Keep every line relevant.', bn: 'একাডেমিক সিভি সাধারণত ২ থেকে ৪ পৃষ্ঠার হয়। প্রতিটি লাইন প্রাসঙ্গিক রাখুন।' },
};

/** Section headings in this layout. */
export const HIGHER_LABELS_EN: Record<string, string> = {
  summary: 'Profile', education: 'Education', experience: 'Work experience', skills: 'Skills and languages', training: 'Training and certificates', references: 'Referees',
};
export const HIGHER_LABELS_BN: Record<string, string> = {
  summary: 'পরিচিতি', education: 'শিক্ষা', experience: 'কাজের অভিজ্ঞতা', skills: 'দক্ষতা ও ভাষা', training: 'প্রশিক্ষণ ও সার্টিফিকেট', references: 'রেফারি',
};
export const REFEREES_ON_REQUEST = { en: 'Referees available on request.', bn: 'রেফারি চাইলে দেওয়া হবে।' };

/** Preset titles of the added sections, in CV order, with the key that places each one. */
const SCHOLARSHIP_SECTIONS = {
  research: 'Research',
  publications: 'Publications and presentations',
  awards: 'Awards, scholarships and honours',
  volunteering: 'Volunteering and leadership',
};
const ACADEMIC_ONLY = {
  teaching: 'Teaching experience',
  conferences: 'Conferences',
  grants: 'Grants and fellowships',
  service: 'Academic service and memberships',
};

/** The custom sections each layout adds, by title. */
export const higherSectionTitles = (l: HigherLayout): string[] =>
  l === 'academic'
    ? [SCHOLARSHIP_SECTIONS.research, SCHOLARSHIP_SECTIONS.publications, ACADEMIC_ONLY.teaching, ACADEMIC_ONLY.conferences, ACADEMIC_ONLY.grants, SCHOLARSHIP_SECTIONS.awards, ACADEMIC_ONLY.service, SCHOLARSHIP_SECTIONS.volunteering]
    : [SCHOLARSHIP_SECTIONS.research, SCHOLARSHIP_SECTIONS.publications, SCHOLARSHIP_SECTIONS.awards, SCHOLARSHIP_SECTIONS.volunteering];

const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Section order. Scholarship: Profile, Education, Research, Publications, Awards, Work, Skills, Training, Volunteering, Referees.
 * Academic adds Teaching, Conferences and Grants after Publications and Academic service before Volunteering.
 * Custom sections the person added themselves go before Referees.
 */
export function higherOrder(d: Pick<CvData, 'custom'>, layout: HigherLayout): string[] {
  const key = (title: string) => d.custom.filter((c) => sameTitle(c.title, title)).map((c) => `custom:${c.id}`);
  const t = SCHOLARSHIP_SECTIONS;
  const a = ACADEMIC_ONLY;
  const pre = layout === 'academic' ? [t.research, t.publications, a.teaching, a.conferences, a.grants, t.awards] : [t.research, t.publications, t.awards];
  const post = layout === 'academic' ? [a.service, t.volunteering] : [t.volunteering];
  const placed = [...pre, ...post].flatMap(key);
  const rest = d.custom.map((c) => `custom:${c.id}`).filter((k) => !placed.includes(k));
  return ['summary', 'education', ...pre.flatMap(key), 'experience', 'skills', 'training', ...post.flatMap(key), ...rest, 'personal', 'references'];
}

/**
 * Turns on a higher-study layout for a draft. Existing content is kept. A draft already in this layout keeps the order the person chose;
 * only missing sections are added. Personal details turn off the first time; the photo is never added.
 */
export function withHigherStudy(base: BuilderState, layout: HigherLayout): BuilderState {
  const already = base.layout === layout;
  let custom = base.data.custom;
  for (const title of higherSectionTitles(layout))
    if (!custom.some((c) => sameTitle(c.title, title))) custom = [...custom, { id: uid(), title, items: [newCustomItem()] }];
  // Two referee slots to fill in
  let references = base.data.references;
  while (references.length < 2) references = [...references, newReference()];
  const data: CvData = { ...base.data, custom, references, showPersonal: already ? base.data.showPersonal : false };
  const wanted = higherOrder(data, layout);
  data.order = already ? [...data.order, ...wanted.filter((k) => !data.order.includes(k))] : wanted;
  return {
    ...base,
    layout,
    design: 'classic',
    accent: already ? base.accent : HIGHER_ACCENT,
    font: already || base.font ? base.font : HIGHER_FONT,
    data,
  };
}

/** An invented, plausible sample (no real person) for previews, the Word export test and the page images. */
export function higherStudySample(layout: HigherLayout): BuilderState {
  const s = withHigherStudy({ data: { ...emptyCv(), name: 'Tahmina Akter', headline: layout === 'academic' ? 'Lecturer in Economics, PhD applicant' : 'MSc applicant, Environmental Science', email: 'tahmina.akter@example.com', phone: '+880 1700-000000', location: 'Dhaka, Bangladesh' }, design: 'classic', accent: HIGHER_ACCENT }, layout);
  const find = (title: string) => s.data.custom.find((c) => sameTitle(c.title, title))!;
  const fill = (title: string, items: Partial<ReturnType<typeof newCustomItem>>[]) => {
    find(title).items = items.map((i) => newCustomItem(i));
  };
  const d = s.data;
  d.summary =
    layout === 'academic'
      ? 'Economics lecturer with 3 years of teaching and a published study on mobile payments in rural Bangladesh. Seeking a PhD in development economics to study household finance.'
      : 'BSc and MSc graduate in Environmental Science (CGPA 3.80/4.00) with a thesis on river water quality. Applying for a funded masters in water resource management.';
  if (layout === 'academic') {
    d.education = [
      { id: uid(), degree: 'MSS', major: 'Economics', institution: 'University of Dhaka', result: 'CGPA 3.85/4.00', year: '2019 – 2020', details: 'Thesis: Mobile financial services and household savings in rural Bangladesh\nSupervisor: Prof. Nasrin Sultana' },
      { id: uid(), degree: 'BSS', major: 'Economics', institution: 'University of Dhaka', result: 'CGPA 3.74/4.00 (first class, 3rd of 120)', year: '2015 – 2019', details: "Dean's List, 2017 and 2018" },
    ];
    fill('Research', [
      { title: 'MSS thesis: mobile financial services and household savings', subtitle: 'University of Dhaka', date: '2020', details: 'Surveyed 480 households in three upazilas\nEstimated savings effects with fixed-effects regression in Stata' },
      { title: 'Research assistant, rural credit survey', subtitle: 'Department of Economics, University of Dhaka', date: '2019', details: 'Cleaned and coded survey data for a team of four researchers' },
    ]);
    fill('Publications and presentations', [
      { title: 'Akter, T. and Sultana, N. (2024). Mobile payments and rural savings. Bangladesh Development Studies, 47(1), 55-78.', date: '2024' },
      { title: 'Working paper: Remittances and school enrolment', date: '2025' },
    ]);
    fill('Awards, scholarships and honours', [
      { title: 'University Merit Scholarship', subtitle: 'University of Dhaka', date: '2015 – 2019' },
      { title: "Dean's Award for Best Thesis", subtitle: 'Faculty of Social Sciences', date: '2020' },
    ]);
  } else {
    d.education = [
      { id: uid(), degree: 'MSc', major: 'Environmental Science', institution: 'University of Dhaka', result: 'CGPA 3.80/4.00', year: '2022 – 2023', details: 'Thesis: Seasonal variation of heavy metals in the Buriganga River\nSupervisor: Prof. Nasrin Sultana' },
      { id: uid(), degree: 'BSc', major: 'Environmental Science', institution: 'University of Dhaka', result: 'CGPA 3.72/4.00 (first class, 4th of 60)', year: '2018 – 2022', details: "Dean's List, 2020 and 2021" },
    ];
    fill('Research', [
      { title: 'MSc thesis: heavy metals in the Buriganga River', subtitle: 'University of Dhaka', date: '2023', details: 'Collected and analysed 96 water samples over three seasons\nUsed ICP-MS and SPSS; results shared with the Department of Environment' },
      { title: 'Undergraduate project: household waste sorting', subtitle: 'Mirpur, Dhaka', date: '2021', details: 'Surveyed 150 households and presented findings to the ward office' },
    ]);
    fill('Publications and presentations', [
      { title: 'Akter, T. and Sultana, N. (2024). Heavy metals in an urban river. Journal of Environmental Studies, 12(2), 45-58.', date: '2024' },
      { title: 'Poster: Water quality of the Buriganga, National Science Fair', date: '2023' },
    ]);
    fill('Awards, scholarships and honours', [
      { title: 'University Merit Scholarship', subtitle: 'University of Dhaka', date: '2019 – 2022' },
      { title: "Dean's Award for Best Thesis", subtitle: 'Faculty of Science', date: '2023' },
    ]);
  }
  fill('Volunteering and leadership', [layout === 'academic' ? { title: 'Coordinator, Economics Study Circle', subtitle: 'University of Dhaka', date: '2018 – 2019', details: 'Ran a weekly reading group of 30 students' } : { title: 'President, Environment Club', subtitle: 'University of Dhaka', date: '2021 – 2022', details: 'Led 40 members; organised a river clean-up with 120 volunteers' }]);
  if (layout === 'academic') {
    fill('Teaching experience', [{ title: 'Lecturer, Department of Economics', subtitle: 'A Private University, Dhaka', date: '2023 – present', details: 'Taught Microeconomics and Econometrics to 120 students a term\nRated 4.6/5 in student evaluations' }]);
    fill('Conferences', [{ title: 'Mobile payments and rural households', subtitle: 'Bangladesh Economic Association Annual Conference, Dhaka', date: '2024', details: 'Oral presentation' }]);
    fill('Grants and fellowships', [{ title: 'University Research Grant (BDT 150,000)', subtitle: 'Research Cell', date: '2024' }]);
    fill('Academic service and memberships', [{ title: 'Member, Bangladesh Economic Association', date: '2022 – present' }, { title: 'Reviewer for student journal', date: '2024' }]);
  }
  d.experience = [layout === 'academic'
    ? { id: uid(), role: 'Research Associate', org: 'A Policy Research Institute', location: 'Dhaka', start: 'Jul 2020', end: 'Jun 2023', current: false, bullets: 'Analysed household survey data for 4 policy briefs\nCo-authored 2 working papers' }
    : { id: uid(), role: 'Research Assistant', org: 'Department of Environmental Science', location: 'University of Dhaka', start: 'Jan 2023', end: 'Dec 2023', current: false, bullets: 'Ran water sampling and lab analysis for 3 faculty projects\nPrepared data tables and figures for two reports' }];
  d.skills = layout === 'academic' ? 'Stata, R, Python (basic), Survey design, Econometrics, Academic writing' : 'ICP-MS and water analysis, SPSS, R (basic), ArcGIS, Academic writing';
  d.languages = 'Bangla (native); English: IELTS Academic 7.5 (Mar 2025)';
  d.references = [
    newReference({ name: 'Prof. Nasrin Sultana', title: 'Professor', org: layout === 'academic' ? 'Department of Economics, University of Dhaka' : 'Department of Environmental Science, University of Dhaka', email: 'nasrin.sultana@example.edu' }),
    newReference({ name: 'Dr. Imran Hossain', title: 'Associate Professor', org: layout === 'academic' ? 'Department of Economics, University of Dhaka' : 'Department of Geography, University of Dhaka', email: 'imran.hossain@example.edu' }),
  ];
  return s;
}
