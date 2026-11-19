// Language levels on the CEFR scale (the Common European Framework), used by the Europass-style layout.
// Plain data and small helpers, no React, so the preview, the Word file and the tests all share them.

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** The five skills of the CEFR grid, in the order Europass shows them. */
export const CEFR_SKILLS = ['listening', 'reading', 'interaction', 'production', 'writing'] as const;
export type CefrSkill = (typeof CEFR_SKILLS)[number];

export const CEFR_SKILL_LABEL: Record<CefrSkill, { en: string; bn: string }> = {
  listening: { en: 'Listening', bn: 'শোনা' },
  reading: { en: 'Reading', bn: 'পড়া' },
  interaction: { en: 'Spoken interaction', bn: 'কথোপকথন' },
  production: { en: 'Spoken production', bn: 'বক্তব্য উপস্থাপন' },
  writing: { en: 'Writing', bn: 'লেখা' },
};

/** One-line meaning of each level, in our own words. */
export const CEFR_LEVEL_INFO: Record<CefrLevel, { name: { en: string; bn: string }; text: { en: string; bn: string } }> = {
  A1: { name: { en: 'Basic user', bn: 'প্রাথমিক' }, text: { en: 'Can use very simple everyday phrases and introduce yourself.', bn: 'খুব সহজ দৈনন্দিন বাক্য বলতে ও নিজের পরিচয় দিতে পারেন।' } },
  A2: { name: { en: 'Basic user', bn: 'প্রাথমিক' }, text: { en: 'Can handle short, routine exchanges about familiar things.', bn: 'পরিচিত বিষয়ে ছোট ও নিয়মিত কথাবার্তা চালাতে পারেন।' } },
  B1: { name: { en: 'Independent user', bn: 'স্বাধীন ব্যবহারকারী' }, text: { en: 'Can manage most everyday situations and give short reasons for your views.', bn: 'বেশিরভাগ দৈনন্দিন পরিস্থিতি সামলাতে ও নিজের মত সংক্ষেপে বোঝাতে পারেন।' } },
  B2: { name: { en: 'Independent user', bn: 'স্বাধীন ব্যবহারকারী' }, text: { en: 'Can talk and write clearly on many topics and work in the language with ease.', bn: 'অনেক বিষয়ে স্পষ্টভাবে বলতে ও লিখতে এবং স্বচ্ছন্দে কাজ করতে পারেন।' } },
  C1: { name: { en: 'Proficient user', bn: 'দক্ষ ব্যবহারকারী' }, text: { en: 'Can use the language flexibly and fluently for work and study.', bn: 'কাজ ও পড়াশোনায় ভাষাটি নমনীয়ভাবে ও সাবলীলভাবে ব্যবহার করতে পারেন।' } },
  C2: { name: { en: 'Proficient user', bn: 'দক্ষ ব্যবহারকারী' }, text: { en: 'Can follow almost everything and express fine shades of meaning precisely.', bn: 'প্রায় সবকিছু বুঝতে এবং সূক্ষ্ম অর্থও নিখুঁতভাবে প্রকাশ করতে পারেন।' } },
};

export const CEFR_NOTE = {
  warn: { en: 'Do not overstate your level. Employers may test it in the interview.', bn: 'নিজের স্তর বাড়িয়ে লিখবেন না। ইন্টারভিউতে নিয়োগকর্তা পরীক্ষা করতে পারেন।' },
  certificate: { en: 'Certificate, e.g. IELTS 7.0, 2024 (optional)', bn: 'সার্টিফিকেট, যেমন IELTS 7.0, 2024 (ঐচ্ছিক)' },
  mother: { en: 'Mother tongue', bn: 'মাতৃভাষা' },
  other: { en: 'Other languages', bn: 'অন্যান্য ভাষা' },
  same: { en: 'Same level for all', bn: 'সব দক্ষতায় একই স্তর' },
};

export interface LanguageEntry {
  id: string;
  name: string;
  /** Mother tongue: listed first, with no grid. */
  mother: boolean;
  listening: CefrLevel | '';
  reading: CefrLevel | '';
  interaction: CefrLevel | '';
  production: CefrLevel | '';
  writing: CefrLevel | '';
  /** Optional proof, e.g. "IELTS 7.0, 2024". */
  certificate: string;
}

const rid = () => Math.random().toString(36).slice(2, 9);

export const isCefrLevel = (v: unknown): v is CefrLevel => typeof v === 'string' && (CEFR_LEVELS as readonly string[]).includes(v);
const lvl = (v: unknown): CefrLevel | '' => (isCefrLevel(v) ? v : '');

export const newLanguage = (p: Partial<LanguageEntry> = {}): LanguageEntry => ({
  id: rid(), name: '', mother: false, listening: '', reading: '', interaction: '', production: '', writing: '', certificate: '', ...p,
});

/** Cleans an entry that came from saved data: unknown levels become empty, missing fields get defaults. */
export function normaliseLanguage(raw: Partial<LanguageEntry>): LanguageEntry {
  const e = newLanguage(raw);
  return {
    ...e,
    id: typeof raw.id === 'string' && raw.id ? raw.id : e.id,
    name: typeof raw.name === 'string' ? raw.name : '',
    mother: !!raw.mother,
    certificate: typeof raw.certificate === 'string' ? raw.certificate : '',
    listening: lvl(raw.listening), reading: lvl(raw.reading), interaction: lvl(raw.interaction), production: lvl(raw.production), writing: lvl(raw.writing),
  };
}

/** "Same level for all": sets the five skills to one level (or clears them when level is empty). */
export const setSameLevel = (e: LanguageEntry, level: CefrLevel | ''): LanguageEntry => ({
  ...e, listening: level, reading: level, interaction: level, production: level, writing: level,
});

/** The level shared by all five skills, or '' when they differ or any is empty. */
export const sharedLevel = (e: LanguageEntry): CefrLevel | '' => (CEFR_SKILLS.every((s) => e[s] && e[s] === e.listening) ? e.listening : '');

/** Entries with a name, mother tongues first (stable otherwise). */
export const usableLanguages = (list: LanguageEntry[]): LanguageEntry[] => {
  const named = list.filter((x) => x.name.trim());
  return [...named.filter((x) => x.mother), ...named.filter((x) => !x.mother)];
};

/** "Listening C1, Reading C1, …" for the skills that have a level. */
export const levelText = (e: LanguageEntry, lang: 'en' | 'bn' = 'en'): string =>
  CEFR_SKILLS.filter((s) => e[s]).map((s) => `${CEFR_SKILL_LABEL[s][lang]} ${e[s]}`).join(', ');

/** Plain text lines for designs without a grid and for the Word export of other designs. */
export function languageLines(list: LanguageEntry[]): string[] {
  const out: string[] = [];
  const all = usableLanguages(list);
  const mother = all.filter((x) => x.mother);
  if (mother.length) out.push(`${CEFR_NOTE.mother.en}: ${mother.map((x) => x.name.trim()).join(', ')}`);
  for (const e of all.filter((x) => !x.mother)) {
    const lv = levelText(e);
    const cert = e.certificate.trim();
    out.push([`${e.name.trim()}${lv ? `: ${lv}` : ''}`, cert ? `(${cert})` : ''].filter(Boolean).join(' '));
  }
  return out;
}
