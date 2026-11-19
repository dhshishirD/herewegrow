// The Europass-style layout (opened with /builder?preset=europass): section order, date format and the unofficial note.
// This is our own layout in a similar structure. It uses no Europass logo or EU flag.

import { newCustomItem, uid, type BuilderState, type CvData } from './model';

export const EUROPASS_PRESET_ID = 'europass';
export const EUROPASS_ACCENT = '#1d5bd8';

export const EUROPASS_NOTE = {
  en: 'Europass-style layout. Unofficial: not affiliated with Europass or the European Union.',
  bn: 'Europass-স্টাইল লেআউট। অনানুষ্ঠানিক: Europass বা ইউরোপীয় ইউনিয়নের সাথে যুক্ত নয়।',
};

/** Sections the Europass-style layout adds to the usual ones. */
export const EUROPASS_KEYS = ['cefr', 'digital', 'driving'] as const;

/** Section headings used in this layout (the usual labels stay for every other design). */
export const EUROPASS_LABELS_EN: Record<string, string> = {
  summary: 'Profile', experience: 'Work experience', education: 'Education and training', skills: 'Other skills', training: 'Certificates',
};
export const EUROPASS_LABELS_BN: Record<string, string> = {
  summary: 'পরিচিতি', experience: 'কাজের অভিজ্ঞতা', education: 'শিক্ষা ও প্রশিক্ষণ', skills: 'অন্যান্য দক্ষতা', training: 'সার্টিফিকেট',
};

/** Section order of the layout: Profile, Work, Education, Languages, Digital, Other skills, Projects, Volunteering, Certificates, Driving, References. */
export function europassOrder(d: Pick<CvData, 'custom' | 'educationFirst'>): string[] {
  const find = (re: RegExp) => d.custom.filter((c) => re.test(c.title)).map((c) => `custom:${c.id}`);
  const projects = find(/^(projects?|প্রজেক্ট)/i);
  const volunteering = find(/^(volunteer|স্বেচ্ছাসেবা)/i);
  const used = new Set([...projects, ...volunteering]);
  const rest = d.custom.map((c) => `custom:${c.id}`).filter((k) => !used.has(k));
  const order = ['summary', 'experience', 'education', 'cefr', 'digital', 'skills', ...projects, ...volunteering, ...rest, 'training', 'driving', 'personal', 'references'];
  return applyEducationFirst(order, !!d.educationFirst);
}

/** Moves Education above Work experience (for freshers) or puts it back below. Other sections keep their place. */
export function applyEducationFirst(order: string[], first: boolean): string[] {
  const e = order.indexOf('education');
  const w = order.indexOf('experience');
  if (e < 0 || w < 0) return order;
  if (first === e < w) return order;
  const next = [...order];
  next[e] = 'experience';
  next[w] = 'education';
  return next;
}

/**
 * Turns on the layout for a draft. Existing content is kept. A draft that is already Europass-style keeps the order the person chose;
 * only missing sections are added. Photo, date of birth, nationality and gender stay off unless the person turns them on.
 */
export function withEuropass(base: BuilderState): BuilderState {
  const already = base.layout === 'europass';
  let custom = base.data.custom;
  for (const title of ['Projects', 'Volunteering']) {
    if (!custom.some((c) => c.title.toLowerCase().startsWith(title.toLowerCase())))
      custom = [...custom, { id: uid(), title, items: [newCustomItem()] }];
  }
  const data: CvData = { ...base.data, custom, showPersonal: already ? base.data.showPersonal : false };
  const wanted = europassOrder(data);
  data.order = already ? [...data.order, ...wanted.filter((k) => !data.order.includes(k))] : wanted;
  return { ...base, layout: 'europass', design: 'classic', accent: already ? base.accent : EUROPASS_ACCENT, data };
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const mm = (n: number) => String(n).padStart(2, '0');

/** International date format MM/YYYY. "Jan 2024", "2024-01" and "1/2024" all become "01/2024"; a bare year or other text is left as written. */
export function euDate(s: string): string {
  const v = (s ?? '').trim();
  if (!v) return '';
  let m = v.match(/^(\d{1,2})\s*[/.-]\s*(\d{4})$/);
  if (m && +m[1] >= 1 && +m[1] <= 12) return `${mm(+m[1])}/${m[2]}`;
  m = v.match(/^(\d{4})\s*[/.-]\s*(\d{1,2})$/);
  if (m && +m[2] >= 1 && +m[2] <= 12) return `${mm(+m[2])}/${m[1]}`;
  m = v.match(/^([A-Za-z]{3,9})\.?,?\s+(\d{4})$/);
  if (m) {
    const i = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (i >= 0) return `${mm(i + 1)}/${m[2]}`;
  }
  return v;
}

/** "MM/YYYY – MM/YYYY", or "– Present" while the job is current. */
export const euDates = (start: string, end: string, current: boolean, present: string) =>
  [euDate(start), current ? present : euDate(end)].filter(Boolean).join(' – ');
