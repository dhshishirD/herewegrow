// Hard requirements in a job ad (years of experience, degree level, age) checked against a CV.
// These are estimates from plain text. The page always tells the person to check for themselves.

export type Level = 1 | 2 | 3 | 4 | 5; // SSC, HSC/diploma, bachelor, master, PhD
export type ReqStatus = 'meets' | 'short' | 'unknown' | 'info';

export type Requirement =
  | { kind: 'years'; status: ReqStatus; required: number; have: number; estimated: boolean; preferred: boolean }
  | { kind: 'degree'; status: ReqStatus; required: Level; have: Level | null }
  | { kind: 'age'; status: 'info'; min: number | null; max: number };

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const asciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const norm = (s: string) => asciiDigits(s).toLowerCase();

/** Years of experience the ad asks for. "At least 4 years of experience", "3-5 years", "৫ বছরের অভিজ্ঞতা". */
export function adYears(ad: string): { years: number; preferred: boolean } | null {
  const text = norm(ad);
  const re = /(\d{1,2})(?:\s*(?:\+|to|-|–|থেকে)\s*(\d{1,2}))?\s*\+?\s*(?:years?|yrs?|বছর)/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const before = text.slice(Math.max(0, m.index - 30), m.index);
    const around = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 70);
    if (/\bage\b|বয়স|aged/.test(before)) continue;
    if (!/experience|অভিজ্ঞতা/.test(around)) continue;
    const n = Number(m[1]);
    if (n > 0 && n <= 40) {
      const from = Math.max(text.lastIndexOf('\n', m.index), text.lastIndexOf('. ', m.index)) + 1;
      const stops = [text.indexOf('\n', m.index), text.indexOf('. ', m.index)].filter((i) => i >= 0);
      const sentence = text.slice(from, stops.length ? Math.min(...stops) : text.length);
      return { years: n, preferred: /prefer|advantage|plus|অগ্রাধিকার|সুবিধা/.test(sentence) };
    }
  }
  return null;
}

const LEVELS: [Level, RegExp][] = [
  [5, /\bph\.?\s?d\b|doctorate|পিএইচডি|ডক্টরেট/],
  [4, /\bmaster'?s?\b|\bm\.?\s?sc\b|\bm\.?\s?a\b|\bm\.?\s?b\.?\s?a\b|\bm\.?\s?s\.?\s?s\b|\bm\.?\s?com\b|\bllm\b|\bm\.?\s?phil\b|স্নাতকোত্তর|মাস্টার্স|এমবিএ|এমএসসি|এমএসএস|এমকম|এমএ(?![ঀ-৿])/],
  [3, /\bbachelor'?s?\b|\bb\.?\s?sc\b|\bb\.?\s?a\b|\bbba\b|\bb\.?\s?com\b|\bb\.?\s?s\.?\s?s\b|\bllb\b|\bhonou?rs\b|\bgraduat(?:e|ion)\b|স্নাতক(?!োত্তর)|অনার্স|বিবিএ|বিএসসি|বিএসএস|বিকম|বিএ(?![ঀ-৿])|ডিগ্রি/],
  [2, /\bhsc\b|\bdiploma\b|\bintermediate\b|\ba[- ]level\b|এইচএসসি|ডিপ্লোমা|উচ্চ মাধ্যমিক/],
  [1, /\bssc\b|\bo[- ]level\b|\bdakhil\b|এসএসসি|মাধ্যমিক|দাখিল/],
];

/** Every degree level mentioned in a piece of text. */
export function levelsIn(text: string): Level[] {
  const t = norm(text);
  return LEVELS.filter(([, re]) => re.test(t)).map(([l]) => l);
}

/** Lowest degree level the ad asks for: "Bachelor or Master" needs a bachelor, "MBA" needs a master. */
export function adDegree(ad: string): Level | null {
  const lines = ad.split(/\n+/).filter((l) => /education|qualification|degree|graduat|bachelor|master|যোগ্যতা|শিক্ষাগত|ডিগ্রি|স্নাতক|এমবিএ|diploma|hsc|ডিপ্লোমা/i.test(l));
  const found = lines.flatMap(levelsIn);
  return found.length ? (Math.min(...found) as Level) : null;
}

export const cvDegree = (cv: string): Level | null => {
  const l = levelsIn(cv).filter((x) => x >= 2); // "graduate" or "ssc" appear in many other ways; need a real degree line
  return l.length ? (Math.max(...l) as Level) : null;
};

export function adAge(ad: string): { min: number | null; max: number } | null {
  const t = norm(ad);
  const m = t.match(/(?:\bage\b|aged|বয়স)[^0-9\n]{0,25}(\d{2})\s*(?:to|-|–|থেকে|and)\s*(\d{2})/) ?? t.match(/(?:maximum|max\.?|not more than|up to|সর্বোচ্চ)\s*(?:age)?\s*(\d{2})\s*(?:years|বছর)/);
  if (!m) return null;
  return m[2] ? { min: Number(m[1]), max: Number(m[2]) } : { min: null, max: Number(m[1]) };
}

const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const EDU_LINE = /university|college of|cgpa|gpa|bachelor|master|\bhsc\b|\bssc\b|\bb\.?sc\b|\bbba\b|\bmba\b|diploma|বিশ্ববিদ্যালয়|স্নাতক|এইচএসসি|এসএসসি|ফলাফল/i;
const SECTION = /^\s*(education|academic|শিক্ষাগত|শিক্ষা)/i;
const OTHER_SECTION = /^\s*(work|experience|employment|career|professional|skills|training|projects?|references?|languages?|personal|কাজের|অভিজ্ঞতা|দক্ষতা|প্রশিক্ষণ|রেফারেন্স)/i;

/** Years of work in the CV, from "N years" statements or date ranges outside the education section. */
export function cvYears(cv: string, now = new Date()): { years: number; estimated: boolean } {
  const text = norm(cv);
  const said = [...text.matchAll(/(\d{1,2})(?:\.\d)?\s*\+?\s*(?:years?|yrs?|বছর)(?:\s+of)?[^.\n]{0,30}(?:experience|অভিজ্ঞতা|কাজ|worked|working|teaching|পড়িয়ে)|(?:experience|অভিজ্ঞতা)[^.\n]{0,30}?(\d{1,2})\s*\+?\s*(?:years?|yrs?|বছর)/g)]
    .map((m) => Number(m[1] ?? m[2]))
    .filter((n) => n > 0 && n <= 45);
  const spans: [number, number][] = [];
  const re = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+)?((?:19|20)\d{2})\s*(?:-|–|—|to|till|until)\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+)?((?:19|20)\d{2}|present|current|now|date|বর্তমান)/g;
  let inEdu = false;
  for (const line of text.split('\n')) {
    if (SECTION.test(line)) inEdu = true;
    else if (OTHER_SECTION.test(line)) inEdu = false;
    if (inEdu || EDU_LINE.test(line)) continue;
    for (let m = re.exec(line); m; m = re.exec(line)) {
      const start = Number(m[2]) + (m[1] ? MONTHS.indexOf(m[1]) / 12 : 0);
      const endWord = m[4];
      const end = /^\d/.test(endWord) ? Number(endWord) + (m[3] ? (MONTHS.indexOf(m[3]) + 1) / 12 : 1) : now.getFullYear() + now.getMonth() / 12;
      if (end > start && end - start < 45) spans.push([start, end]);
    }
  }
  spans.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cur: [number, number] | null = null;
  for (const s of spans) {
    if (cur && s[0] <= cur[1]) cur[1] = Math.max(cur[1], s[1]);
    else {
      if (cur) total += cur[1] - cur[0];
      cur = [...s];
    }
  }
  if (cur) total += cur[1] - cur[0];
  const dated = Math.round(total * 10) / 10;
  const stated = said.length ? Math.max(...said) : 0;
  return stated >= dated ? { years: stated, estimated: false } : { years: dated, estimated: true };
}

export function checkRequirements(cv: string, ad: string, now = new Date()): Requirement[] {
  const out: Requirement[] = [];
  const need = adYears(ad);
  if (need) {
    const h = cvYears(cv, now);
    out.push({ kind: 'years', required: need.years, preferred: need.preferred, have: h.years, estimated: h.estimated, status: h.years <= 0 ? 'unknown' : h.years + 0.4 >= need.years ? 'meets' : 'short' });
  }
  const deg = adDegree(ad);
  if (deg) {
    const h = cvDegree(cv);
    out.push({ kind: 'degree', required: deg, have: h, status: h === null ? 'unknown' : h >= deg ? 'meets' : 'short' });
  }
  const age = adAge(ad);
  if (age) out.push({ kind: 'age', status: 'info', min: age.min, max: age.max });
  return out;
}
