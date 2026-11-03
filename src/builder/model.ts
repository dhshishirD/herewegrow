// The CV builder's data: what the person fills in, kept on their own device.

export interface Experience {
  id: string;
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  /** One achievement per line. */
  bullets: string;
}

export interface Education {
  id: string;
  degree: string;
  /** Major, group or subject, e.g. "Finance" or "Science". */
  major: string;
  institution: string;
  result: string;
  year: string;
  /** Thesis, awards, relevant courses. Optional. */
  details: string;
}

export interface Training {
  id: string;
  name: string;
  org: string;
  year: string;
  duration: string;
  /** What was covered or achieved. Optional. */
  details: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  org: string;
  phone: string;
  email: string;
  relation: string;
}

/** A generic entry used by added sections (projects, awards, volunteering, …). */
export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  /** Free text; each line becomes a bullet when more than one line. */
  details: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export interface CvData {
  name: string;
  headline: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  website: string;
  /** Small JPEG data URL, optional. */
  photo: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  languages: string;
  training: Training[];
  custom: CustomSection[];
  /** Bangladesh-style personal details, shown only when turned on. */
  showPersonal: boolean;
  father: string;
  mother: string;
  dob: string;
  gender: string;
  marital: string;
  nationality: string;
  religion: string;
  nid: string;
  presentAddress: string;
  permanentAddress: string;
  references: Reference[];
  /** Order of sections on the CV. Keys: summary, experience, education, skills, training, personal, references, or custom:<id>. */
  order: string[];
  /** Built-in sections the person has hidden. */
  hidden: string[];
}

export type DesignId = 'classic' | 'modern' | 'executive' | 'elegant';
export type HeadingLang = 'en' | 'bn';

export interface BuilderState {
  data: CvData;
  design: DesignId;
  accent: string;
  /** Language of the section headings on the CV itself. */
  headings?: HeadingLang;
}

export const BUILT_IN = ['summary', 'experience', 'education', 'skills', 'training', 'personal', 'references'] as const;

/** Section headings on the CV, in English or Bangla. */
export const LABELS: Record<HeadingLang, Record<string, string>> = {
  en: {
    summary: 'Professional Summary', profile: 'Profile', experience: 'Work Experience', career: 'Career History', education: 'Education',
    skills: 'Skills', coreSkills: 'Core Skills', languages: 'Languages', training: 'Training and Certifications', trainingShort: 'Training',
    personal: 'Personal Details', references: 'References', contact: 'Contact', present: 'Present',
    father: "Father's name", mother: "Mother's name", dob: 'Date of birth', gender: 'Gender', marital: 'Marital status', nationality: 'Nationality',
    religion: 'Religion', nid: 'NID', present_address: 'Present address', permanent: 'Permanent address',
  },
  bn: {
    summary: 'পেশাগত সারসংক্ষেপ', profile: 'পরিচিতি', experience: 'কাজের অভিজ্ঞতা', career: 'কর্মজীবন', education: 'শিক্ষাগত যোগ্যতা',
    skills: 'দক্ষতা', coreSkills: 'মূল দক্ষতা', languages: 'ভাষা', training: 'প্রশিক্ষণ ও সার্টিফিকেট', trainingShort: 'প্রশিক্ষণ',
    personal: 'ব্যক্তিগত তথ্য', references: 'রেফারেন্স', contact: 'যোগাযোগ', present: 'বর্তমান',
    father: 'পিতার নাম', mother: 'মাতার নাম', dob: 'জন্মতারিখ', gender: 'লিঙ্গ', marital: 'বৈবাহিক অবস্থা', nationality: 'জাতীয়তা',
    religion: 'ধর্ম', nid: 'জাতীয় পরিচয়পত্র', present_address: 'বর্তমান ঠিকানা', permanent: 'স্থায়ী ঠিকানা',
  },
};

/** Ready-made sections people commonly add, with English and Bangla titles. */
export const SECTION_PRESETS: { en: string; bn: string; hint: { en: string; bn: string } }[] = [
  { en: 'Projects', bn: 'প্রজেক্ট', hint: { en: 'Thesis, academic or work projects', bn: 'থিসিস, একাডেমিক বা কাজের প্রজেক্ট' } },
  { en: 'Achievements and Awards', bn: 'অর্জন ও পুরস্কার', hint: { en: 'Scholarships, prizes, recognitions', bn: 'বৃত্তি, পুরস্কার, স্বীকৃতি' } },
  { en: 'Volunteering', bn: 'স্বেচ্ছাসেবা', hint: { en: 'Clubs, NGOs, community work', bn: 'ক্লাব, এনজিও, সামাজিক কাজ' } },
  { en: 'Extracurricular Activities', bn: 'সহশিক্ষা কার্যক্রম', hint: { en: 'Debate, sports, BNCC, Rover', bn: 'ডিবেট, খেলাধুলা, বিএনসিসি, রোভার' } },
  { en: 'Publications', bn: 'প্রকাশনা', hint: { en: 'Papers, articles, books', bn: 'গবেষণাপত্র, প্রবন্ধ, বই' } },
  { en: 'Computer Skills', bn: 'কম্পিউটার দক্ষতা', hint: { en: 'Software and level', bn: 'সফটওয়্যার ও দক্ষতার মাত্রা' } },
  { en: 'Interests', bn: 'আগ্রহ', hint: { en: 'Only if relevant to the job', bn: 'চাকরির সাথে সম্পর্কিত হলে' } },
];

export const uid = () => Math.random().toString(36).slice(2, 9);

export const newExperience = (p: Partial<Experience> = {}): Experience => ({ id: uid(), role: '', org: '', location: '', start: '', end: '', current: false, bullets: '', ...p });
export const newEducation = (p: Partial<Education> = {}): Education => ({ id: uid(), degree: '', major: '', institution: '', result: '', year: '', details: '', ...p });
export const newTraining = (p: Partial<Training> = {}): Training => ({ id: uid(), name: '', org: '', year: '', duration: '', details: '', ...p });
export const newReference = (p: Partial<Reference> = {}): Reference => ({ id: uid(), name: '', title: '', org: '', phone: '', email: '', relation: '', ...p });
export const newCustomItem = (p: Partial<CustomItem> = {}): CustomItem => ({ id: uid(), title: '', subtitle: '', date: '', details: '', ...p });

export const emptyCv = (): CvData => ({
  name: '',
  headline: '',
  phone: '',
  email: '',
  location: '',
  linkedin: '',
  website: '',
  photo: '',
  summary: '',
  experience: [],
  education: [],
  skills: '',
  languages: '',
  training: [],
  custom: [],
  showPersonal: false,
  father: '',
  mother: '',
  dob: '',
  gender: '',
  marital: '',
  nationality: 'Bangladeshi',
  religion: '',
  nid: '',
  presentAddress: '',
  permanentAddress: '',
  references: [],
  order: [...BUILT_IN],
  hidden: [],
});

/** An invented example person, so a first-time visitor sees how a good CV reads. */
export const sampleCv = (): CvData => {
  const projects = uid();
  return {
    ...emptyCv(),
    name: 'Nusrat Jahan',
    headline: 'Junior Officer, Retail Banking',
    phone: '+880 1700-000000',
    email: 'nusrat.jahan@email.com',
    location: 'Mirpur, Dhaka',
    linkedin: 'linkedin.com/in/nusratjahan',
    summary:
      'Finance graduate (CGPA 3.62) with 2 years of front-desk banking experience. Opened 300+ accounts, kept KYC files audit-ready, and trained 4 new colleagues. Looking to grow in retail and SME banking.',
    experience: [
      newExperience({
        role: 'Junior Officer, Customer Service', org: 'A Private Commercial Bank', location: 'Dhaka', start: 'Jan 2024', current: true,
        bullets: 'Served 60–80 walk-in customers a day with zero complaints escalated in 2025\nOpened 300+ savings and DPS accounts, meeting the branch target every quarter\nKept KYC and AML files complete for 2 internal audits with no findings',
      }),
      newExperience({
        role: 'Intern, Credit Division', org: 'A State-owned Bank', location: 'Dhaka', start: 'Jul 2023', end: 'Dec 2023',
        bullets: 'Prepared credit summaries for 25 SME loan files\nBuilt an Excel tracker that cut weekly reporting time by half',
      }),
    ],
    education: [
      newEducation({ degree: 'MBA', major: 'Finance', institution: 'University of Dhaka', result: 'CGPA 3.62/4.00', year: '2023', details: 'Thesis: Digital banking adoption among SMEs in Dhaka' }),
      newEducation({ degree: 'BBA', major: 'Finance', institution: 'University of Dhaka', result: 'CGPA 3.48/4.00', year: '2021' }),
      newEducation({ degree: 'HSC', major: 'Business Studies', institution: 'Government College, Dhaka', result: 'GPA 5.00', year: '2016' }),
    ],
    skills: 'Customer service, KYC and AML, Account opening, MS Excel (pivot tables, VLOOKUP), Credit analysis, Teamwork',
    languages: 'Bangla (native), English (fluent)',
    training: [
      newTraining({ name: 'AML and CFT Compliance', org: 'Bangladesh Institute of Bank Management', year: '2024', duration: '5 days', details: 'Customer due diligence, suspicious transaction reporting and record keeping' }),
    ],
    custom: [
      { id: projects, title: 'Projects', items: [newCustomItem({ title: 'Branch customer survey', subtitle: 'Internship project', date: '2023', details: 'Surveyed 120 customers on service quality\nPresented 5 changes to the branch manager; 3 were adopted' })] },
    ],
    father: 'Md. Abdul Karim',
    mother: 'Rokeya Begum',
    dob: '12 March 1999',
    permanentAddress: 'Tangail',
    references: [newReference({ name: 'Dr. Farhana Rahman', title: 'Professor, Department of Finance', org: 'A Public University', email: 'farhana@email.com', relation: 'Thesis supervisor' })],
    order: ['summary', 'experience', 'education', 'skills', 'training', `custom:${projects}`, 'personal', 'references'],
  };
};

export const ACCENTS = ['#0e3b2e', '#12805c', '#1d4ed8', '#7c2d12', '#334155', '#6d28d9'];

const KEY = 'hwg_builder_v1';

/** Brings data saved by an older version of the builder up to date. */
export function normalise(raw: Partial<CvData>): CvData {
  const base = emptyCv();
  const d = { ...base, ...raw } as CvData;
  d.education = (d.education ?? []).map((e) => newEducation(e));
  d.training = (d.training ?? []).map((e) => newTraining(e));
  d.references = (d.references ?? []).map((r) => {
    const old = r as Reference & { contact?: string };
    return newReference({ ...r, email: r.email ?? (old.contact?.includes('@') ? old.contact : ''), phone: r.phone ?? (old.contact && !old.contact.includes('@') ? old.contact : '') });
  });
  d.experience = (d.experience ?? []).map((e) => newExperience(e));
  d.custom = (d.custom ?? []).map((c) => ({ ...c, items: c.items.map((i) => newCustomItem(i)) }));
  const keys = new Set([...BUILT_IN, ...d.custom.map((c) => `custom:${c.id}`)]);
  const order = (d.order ?? []).filter((k) => keys.has(k));
  for (const k of keys) if (!order.includes(k)) order.push(k);
  d.order = order;
  d.hidden = (d.hidden ?? []).filter((k) => keys.has(k));
  return d;
}

export function loadState(): BuilderState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as BuilderState;
    return s && s.data ? { ...s, data: normalise(s.data) } : null;
  } catch {
    return null;
  }
}

export function saveState(s: BuilderState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage full or unavailable: the CV still works for this visit
  }
}

export const lines = (s: string) => s.split('\n').map((x) => x.replace(/^[•\-–*]\s*/, '').trim()).filter(Boolean);
/** Skills: one per line if written that way, otherwise separated by commas. */
export const list = (s: string) => (s.includes('\n') ? s.split('\n') : s.split(/[,;]/)).map((x) => x.replace(/^[•\-–*]\s*/, '').trim()).filter(Boolean);
