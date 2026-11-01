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
  institution: string;
  result: string;
  year: string;
}

export interface Training {
  id: string;
  name: string;
  org: string;
  year: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  contact: string;
}

export interface CvData {
  name: string;
  headline: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  /** Small JPEG data URL, optional. */
  photo: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  languages: string;
  training: Training[];
  /** Bangladesh-style personal details, shown only when turned on. */
  showPersonal: boolean;
  father: string;
  mother: string;
  dob: string;
  nationality: string;
  religion: string;
  permanentAddress: string;
  references: Reference[];
}

export type DesignId = 'classic' | 'modern' | 'executive';

export interface BuilderState {
  data: CvData;
  design: DesignId;
  accent: string;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyCv = (): CvData => ({
  name: '',
  headline: '',
  phone: '',
  email: '',
  location: '',
  linkedin: '',
  photo: '',
  summary: '',
  experience: [],
  education: [],
  skills: '',
  languages: '',
  training: [],
  showPersonal: false,
  father: '',
  mother: '',
  dob: '',
  nationality: 'Bangladeshi',
  religion: '',
  permanentAddress: '',
  references: [],
});

/** An invented example person, so a first-time visitor sees how a good CV reads. */
export const sampleCv = (): CvData => ({
  name: 'Nusrat Jahan',
  headline: 'Junior Officer, Retail Banking',
  phone: '+880 1700-000000',
  email: 'nusrat.jahan@email.com',
  location: 'Mirpur, Dhaka',
  linkedin: 'linkedin.com/in/nusratjahan',
  photo: '',
  summary:
    'Finance graduate (CGPA 3.62) with 2 years of front-desk banking experience. Opened 300+ accounts, kept KYC files audit-ready, and trained 4 new colleagues. Looking to grow in retail and SME banking.',
  experience: [
    {
      id: uid(),
      role: 'Junior Officer, Customer Service',
      org: 'A Private Commercial Bank',
      location: 'Dhaka',
      start: 'Jan 2024',
      end: '',
      current: true,
      bullets:
        'Served 60–80 walk-in customers a day with zero complaints escalated in 2025\nOpened 300+ savings and DPS accounts, meeting the branch target every quarter\nKept KYC and AML files complete for 2 internal audits with no findings',
    },
    {
      id: uid(),
      role: 'Intern, Credit Division',
      org: 'A State-owned Bank',
      location: 'Dhaka',
      start: 'Jul 2023',
      end: 'Dec 2023',
      current: false,
      bullets: 'Prepared credit summaries for 25 SME loan files\nBuilt an Excel tracker that cut weekly reporting time by half',
    },
  ],
  education: [
    { id: uid(), degree: 'MBA in Finance', institution: 'University of Dhaka', result: 'CGPA 3.62/4.00', year: '2023' },
    { id: uid(), degree: 'BBA in Finance', institution: 'University of Dhaka', result: 'CGPA 3.48/4.00', year: '2021' },
    { id: uid(), degree: 'HSC (Business Studies)', institution: 'Government College, Dhaka', result: 'GPA 5.00', year: '2016' },
  ],
  skills: 'Customer service, KYC and AML, Account opening, MS Excel (pivot tables, VLOOKUP), Credit analysis, Teamwork',
  languages: 'Bangla (native), English (fluent)',
  training: [{ id: uid(), name: 'AML and CFT Compliance', org: 'Bangladesh Institute of Bank Management', year: '2024' }],
  showPersonal: false,
  father: 'Md. Abdul Karim',
  mother: 'Rokeya Begum',
  dob: '12 March 1999',
  nationality: 'Bangladeshi',
  religion: '',
  permanentAddress: 'Tangail',
  references: [{ id: uid(), name: 'Dr. Farhana Rahman', title: 'Professor, Department of Finance', contact: 'farhana@email.com' }],
});

export const ACCENTS = ['#0e3b2e', '#12805c', '#1d4ed8', '#7c2d12', '#334155', '#6d28d9'];

const KEY = 'hwg_builder_v1';

export function loadState(): BuilderState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as BuilderState;
    return s && s.data ? { ...s, data: { ...emptyCv(), ...s.data } } : null;
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

export const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
export const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
