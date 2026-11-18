// Marriage biodata: what the person fills in (kept on their own device), the rows that
// get printed, and the page split. Empty rows and sections are never printed.

export interface EduRow { id: string; degree: string; institution: string; year: string }

export interface BiodataData {
  name: string;
  photo: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  complexion: string;
  bloodGroup: string;
  religion: string;
  maritalStatus: string;
  education: EduRow[];
  occupation: string;
  employer: string;
  father: string;
  fatherOcc: string;
  mother: string;
  motherOcc: string;
  brothers: string;
  sisters: string;
  familyType: string;
  presentAddress: string;
  permanentAddress: string;
  about: string;
  expectations: string;
  guardianName: string;
  guardianRelation: string;
  phone: string;
  email: string;
}

export function emptyBiodata(): BiodataData {
  return {
    name: '', photo: '', dob: '', age: '', height: '', weight: '', complexion: '', bloodGroup: '', religion: '', maritalStatus: '',
    education: [{ id: 'e1', degree: '', institution: '', year: '' }],
    occupation: '', employer: '', father: '', fatherOcc: '', mother: '', motherOcc: '', brothers: '', sisters: '', familyType: '',
    presentAddress: '', permanentAddress: '', about: '', expectations: '',
    guardianName: '', guardianRelation: '', phone: '', email: '',
  };
}

export interface Section {
  id: string;
  title: string;
  rows: [string, string][];
  /** Free text sections (about, expectations). */
  text?: string;
}

const clean = (s: string) => s.trim();
const rows = (pairs: [string, string][]): [string, string][] => pairs.map(([l, v]) => [l, clean(v)] as [string, string]).filter(([, v]) => v);
const join = (...p: string[]) => p.map(clean).filter(Boolean).join(', ');

export function buildSections(d: BiodataData): Section[] {
  const out: Section[] = [
    { id: 'personal', title: 'Personal Details', rows: rows([
      ['Date of birth', d.dob], ['Age', d.age], ['Height', d.height], ['Weight', d.weight], ['Complexion', d.complexion],
      ['Blood group', d.bloodGroup], ['Religion', d.religion], ['Marital status', d.maritalStatus],
    ]) },
    { id: 'education', title: 'Education', rows: d.education.filter((e) => clean(e.degree)).map((e) => [clean(e.degree), join(e.institution, e.year)] as [string, string]) },
    { id: 'profession', title: 'Profession', rows: rows([['Occupation', d.occupation], ['Workplace', d.employer]]) },
    { id: 'family', title: 'Family Details', rows: rows([
      ["Father", join(d.father, d.fatherOcc)], ["Mother", join(d.mother, d.motherOcc)], ['Brothers', d.brothers], ['Sisters', d.sisters], ['Family type', d.familyType],
    ]) },
    { id: 'address', title: 'Address', rows: rows([['Present', d.presentAddress], ['Permanent', d.permanentAddress]]) },
    { id: 'about', title: 'About Me', rows: [], text: clean(d.about) },
    { id: 'expectations', title: 'Partner Expectations', rows: [], text: clean(d.expectations) },
    { id: 'contact', title: 'Contact (Guardian)', rows: rows([
      ['Name', d.guardianName], ['Relation', d.guardianRelation], ['Phone', d.phone], ['Email', d.email],
    ]) },
  ];
  return out.filter((s) => s.rows.length > 0 || s.text);
}

// Heights in px on an A4 page (794x1123). Estimates are on the safe side so nothing is cut.
export const PAGE_H = 1123;
const PAD = 56;
const HEADER_H = 200; // name + photo block on page 1
const FOOTER_H = 30;

export interface PageOpts {
  /** Height used on page 1 before the first section (default: the standard header). */
  headerH?: number;
  /** Characters per line of free text; smaller for narrow columns. */
  charsPerLine?: number;
}

const sectionH = (s: Section, cpl: number) => 44 + s.rows.length * 28 + (s.text ? Math.ceil(s.text.length / cpl) * 24 + 8 : 0);

export function paginate(sections: Section[], maxPages: number, o: PageOpts = {}): { pages: Section[][]; overflow: boolean } {
  const cpl = o.charsPerLine ?? 85;
  const pages: Section[][] = [[]];
  let used = o.headerH ?? HEADER_H;
  let overflow = false;
  for (const s of sections) {
    const h = sectionH(s, cpl);
    const room = PAGE_H - PAD * 2 - FOOTER_H;
    if (used + h > room && pages[pages.length - 1].length > 0) {
      if (pages.length >= maxPages) { overflow = true; continue; }
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push(s);
    used += h;
  }
  return { pages, overflow };
}
