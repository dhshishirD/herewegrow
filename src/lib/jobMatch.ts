// CV vs job ad matcher. Finds the skills and tools an ad asks for (English and Bangla), checks which ones the CV shows,
// and checks the hard requirements (years of experience, degree). Plain rules, runs in the browser, nothing is sent anywhere.
// It is a guide for what to add if true. It cannot judge how good a candidate is.

import { checkRequirements, levelsIn, type Requirement } from './jobRequirements';
import { SKILLS } from './skillBank';

export type { Requirement } from './jobRequirements';

export interface Keyword {
  /** What to show and, for skills, what to add to the CV (English name). */
  term: string;
  weight: number;
  inCv: boolean;
  kind: 'skill' | 'word';
  /** The ad calls it a must-have (listed under requirements) rather than a plus. */
  must: boolean;
  /** How the ad wrote it, when that differs from `term` (Bangla ads). */
  seenAs?: string;
}

export interface MatchResult {
  score: number; // 0-100, weighted share of the ad's skills and key words found in the CV
  keywords: Keyword[];
  missing: Keyword[];
  found: Keyword[];
  requirements: Requirement[];
}

const STOP = new Set(`a an the and or of to in on at for with by from as is are be will can must should may we you your our their this that these those it its has have had was were been being not no
job jobs apply applicants applicant candidate candidates company vacancy position post posts required requirement requirements responsibilities responsibility
looking seeking join team work working years year experience experienced preferred plus including include etc also such well good strong ability able skill skills
before after until within january february march april may june july august september october november december proficiency proficient senior junior executive officer assistant associate manager head deputy
deadline salary benefits benefit age bangladesh bangladeshi dhaka location department educational education additional least equivalent willing relevant minimum maximum
develop developing execute achieve achieving monthly weekly daily annual yearly targets target prepare preparing ensure ensuring maintain maintaining support supporting provide providing
perform performing handle handling responsible duties duty tasks task key main role roles knowledge understanding excellent proven demonstrated solid hands-on hands on
other others similar related various multiple across between using use used new existing current following above below per both each every any all more most
ms candidate's company's organization organisation limited ltd plc bd office
bachelor bachelors master masters degree degrees graduate graduation honours honors pass diploma hsc ssc bsc msc mba bba pass
ভালো দক্ষ ইচ্ছুক করতে স্নাতক স্নাতকোত্তর পাস এইচএসসি এসএসসি
congratulations successful shortlisted selected called interview exam test written oral online application submit send email address mobile phone contact
এবং ও বা এর এই সেই যে যা জন্য থেকে করে করা হবে হয় হয়েছে একটি একজন সকল সব আছে থাকতে থাকবে পদ পদের পদে আবেদন আবেদনের প্রার্থী প্রার্থীর হলে হলেই কিংবা অথবা তবে
চাকরি নিয়োগ বিজ্ঞপ্তি প্রতিষ্ঠান প্রতিষ্ঠানের বেতন সুযোগ সুবিধা বছর বছরের অভিজ্ঞতা যোগ্যতা দক্ষতা কাজ কাজের ন্যূনতম সর্বোচ্চ অন্তত শিক্ষাগত সমমান আলোচনাসাপেক্ষ
সহকারী সহযোগী কর্মকর্তা নির্বাহী ব্যবস্থাপক প্রধান উপ থাকতে হবে প্রয়োজন প্রয়োজনীয় আবশ্যক অগ্রাধিকার`.split(/\s+/));

const BN_SUFFIX = ['গুলোর', 'গুলো', 'দের', 'েরা', 'ের', 'ায়', 'য়', 'কে', 'রা', 'তে', 'টি', 'টা', 'ে', 'া'];

export function stem(w: string): string {
  const s = w.toLowerCase();
  if (/[\u0980-\u09FF]/.test(s)) {
    for (const suf of BN_SUFFIX) if (s.length > suf.length + 3 && s.endsWith(suf)) return s.slice(0, -suf.length);
    return s;
  }
  return s.replace(/(ies|ing|ed|es|s)$/, (m) => (s.length - m.length >= 3 ? (m === 'ies' ? 'y' : '') : m));
}

const tokens = (text: string): string[] =>
  text.match(/[A-Za-z][A-Za-z+#.\-/]*[A-Za-z+#]|[\u0980-\u09FF]+/g)?.map((x) => x.replace(/^[-./]+|[-./]+$/g, '')).filter(Boolean) ?? [];

// --- skill patterns, built once ---------------------------------------------------------
// ASCII letter classes and no "u" flag: compiles in milliseconds even on a cheap phone, and no look-behind (older iPhones).
const EN_L = 'A-Za-z0-9';
const BN_L = '\\u0980-\\u09FF';
const enRegex = (alias: string) =>
  new RegExp(`(?:^|[^${EN_L}])(${alias.replace(/\*/g, '[A-Za-z0-9]*').replace(/ /g, '[\\s\\-/]+')})(?![${EN_L}])`, 'i');
const bnRegex = (alias: string) => new RegExp(`(?:^|[^${BN_L}])(${alias.replace(/ /g, '\\s+')})[${BN_L}]*`);

interface Pattern { label: string; en: RegExp[]; bn: RegExp[] }
const PATTERNS: Pattern[] = SKILLS.map(([label, en, bn]) => ({
  label,
  en: en.split('|').filter(Boolean).map(enRegex),
  bn: bn.split('|').filter(Boolean).map(bnRegex),
}));

const GENERIC = new Set(['Management', 'Reporting']);

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const normalise = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
/** "Tally ERP" is one product: read it as Tally so ERP is not asked for separately. */
const adLine = (s: string) => normalise(s).replace(/tally[\s-]*erp(?:\s*9)?/gi, 'Tally');

/** First place a skill appears in the text: how it was written, or null. */
interface Hit { en: boolean; text: string; start: number; end: number }

function seen(p: Pattern, text: string): Hit | null {
  for (const [list, en] of [[p.en, true], [p.bn, false]] as const) {
    for (const r of list) {
      const m = r.exec(text);
      if (m) {
        const start = m.index + m[0].indexOf(m[1]);
        return { en, text: m[1], start, end: start + m[1].length };
      }
    }
  }
  return null;
}

// --- reading the ad's sections ----------------------------------------------------------
type Part = 'resp' | 'req' | 'pref' | 'other';
const PART_WEIGHT: Record<Part, number> = { req: 3, resp: 2, other: 2, pref: 1 };

const headerPart = (h: string): Part | null => {
  const s = h.toLowerCase();
  if (/prefer|nice to have|good to have|advantage|desirable|অগ্রাধিকার|সুবিধা/.test(s)) return 'pref';
  if (/responsibilit|duties|duty|key tasks|what you|দায়িত্ব/.test(s)) return 'resp';
  if (/requirement|qualification|must have|what we|skills|যোগ্যতা|চাহিদা|প্রয়োজনীয়|শর্ত/.test(s)) return 'req';
  return null;
};

interface AdLine { text: string; part: Part }

function readAd(ad: string): AdLine[] {
  const out: AdLine[] = [];
  let part: Part = 'other';
  for (const raw of ad.split(/\n+/)) {
    const line = raw.replace(/^[\s•\-–*#·▪●]+/, '').trim();
    if (!line) continue;
    let text = line;
    const colon = line.indexOf(':');
    const head = colon > 0 && colon < 45 ? line.slice(0, colon) : line.length < 45 && !/[.]$/.test(line) ? line : '';
    const hp = head ? headerPart(head) : null;
    if (hp) {
      part = hp;
      text = colon > 0 && colon < 45 ? line.slice(colon + 1).trim() : '';
    }
    if (!text) continue;
    // Judge each sentence on its own: "Master's required. B.Ed preferred." is one must and one plus
    for (const piece of text.split(/\s*[।;]\s*|\.\s+/)) {
      const t = piece.trim();
      if (!t) continue;
      const nice = /prefer|plus point|advantage|desirable|added advantage|will be a plus|অগ্রাধিকার|সুবিধাজনক|ভালো হয়|বাঞ্ছনীয়/i.test(t);
      out.push({ text: t, part: nice ? 'pref' : part });
    }
  }
  return out;
}

export function matchCv(cv: string, ad: string, limit = 24, now = new Date()): MatchResult {
  const lines = readAd(ad);
  const cvText = normalise(cv);

  // Skills the ad asks for, weighted by where they appear and how often
  const skills: Keyword[] = [];
  const lineSets = new Map<string, Set<number>>();
  const alternatives: string[][] = []; // "Canva or Photoshop": one of them is enough
  const hitsByLine: { label: string; start: number; end: number }[][] = lines.map(() => []);
  for (const p of PATTERNS) {
    let weight = 0;
    let first: Hit | null = null;
    let must = false;
    const at = new Set<number>();
    for (const [i, l] of lines.entries()) {
      if (i === 0 && lines.length > 1 && GENERIC.has(p.label)) continue; // a job title like "Sales Manager" is not a skill
      const hit = seen(p, adLine(l.text));
      if (!hit) continue;
      at.add(i);
      hitsByLine[i].push({ label: p.label, start: hit.start, end: hit.end });
      first ??= hit;
      weight += PART_WEIGHT[l.part];
      if (l.part === 'req') must = true;
    }
    if (!first) continue;
    lineSets.set(p.label, at);
    const inCv = !!seen(p, cvText);
    skills.push({ term: p.label, weight: Math.min(weight, 6), inCv, kind: 'skill', must, seenAs: first.text.toLowerCase() === p.label.toLowerCase() ? undefined : first.text });
  }

  for (const [i, hits] of hitsByLine.entries()) {
    const sorted = [...hits].sort((a, b) => a.start - b.start);
    const text = adLine(lines[i].text);
    let group: string[] = [];
    for (let k = 1; k < sorted.length; k++) {
      if (/^\s*(?:or|\/|বা)\s*$/i.test(text.slice(sorted[k - 1].end, sorted[k].start))) group = group.length ? [...group, sorted[k].label] : [sorted[k - 1].label, sorted[k].label];
      else if (group.length) { alternatives.push(group); group = []; }
    }
    if (group.length) alternatives.push(group);
  }

  // "Management" or "Reporting" alone add nothing when "Classroom management" or "MIS reporting" already covers the same lines
  for (let i = skills.length - 1; i >= 0; i--) {
    const g = skills[i];
    if (!GENERIC.has(g.term)) continue;
    const mine = lineSets.get(g.term)!;
    const covered = [...mine].every((n) => skills.some((o) => o !== g && o.term.toLowerCase().includes(g.term.toLowerCase()) && lineSets.get(o.term)!.has(n)));
    if (covered) skills.splice(i, 1);
  }

  // Other words that matter but are not in the skill bank (a tool or subject we do not list)
  const wordW = new Map<string, { term: string; weight: number; must: boolean }>();
  for (const [i, l] of lines.entries()) {
    if (i === 0 && lines.length > 1) continue; // the job title
    if (levelsIn(l.text).length) continue; // degree lines are checked as a requirement, not as words
    let text = normalise(l.text);
    for (const p of PATTERNS) for (const r of [...p.en, ...p.bn]) if (r.test(text)) text = text.replace(new RegExp(r.source, r.flags + 'g'), ' ');
    for (const raw of tokens(text)) {
      const lower = raw.toLowerCase();
      const shortCaps = raw.length === 2 && raw === raw.toUpperCase();
      if ((raw.length < 3 && !shortCaps) || STOP.has(lower) || /^\d/.test(raw)) continue;
      const key = stem(raw);
      const add = PART_WEIGHT[l.part] / 2;
      const cur = wordW.get(key);
      if (cur) {
        cur.weight += add;
        cur.must ||= l.part === 'req';
      } else wordW.set(key, { term: raw, weight: add, must: l.part === 'req' });
    }
  }
  const cvStems = new Set(tokens(cvText).map(stem));
  const words: Keyword[] = [...wordW.entries()]
    .filter(([, v]) => v.weight >= 1.5)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 8)
    .map(([k, v]) => ({ term: v.term, weight: v.weight, inCv: cvStems.has(k), kind: 'word' as const, must: v.must }));

  for (const g of alternatives) {
    if (!g.some((l) => skills.find((k) => k.term === l)?.inCv)) continue;
    for (const l of g) {
      const i = skills.findIndex((k) => k.term === l);
      if (i >= 0 && !skills[i].inCv) skills.splice(i, 1);
    }
  }

  const keywords = [...skills, ...words].sort((a, b) => b.weight - a.weight).slice(0, limit);
  const total = keywords.reduce((s, k) => s + k.weight, 0);
  const got = keywords.filter((k) => k.inCv).reduce((s, k) => s + k.weight, 0);
  return {
    score: total ? Math.round((got / total) * 100) : 0,
    keywords,
    found: keywords.filter((k) => k.inCv),
    missing: keywords.filter((k) => !k.inCv),
    requirements: ad.trim() ? checkRequirements(cv, ad, now) : [],
  };
}
