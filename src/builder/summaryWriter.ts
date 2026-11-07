// Writes a plain, specific CV summary from a few facts the person gives. It never adds numbers or claims of its own.

export type SummaryKind = 'fresher' | 'experienced' | 'switcher';

export interface SummaryInput {
  kind: SummaryKind;
  target: string; // role wanted
  degree: string;
  major: string;
  years: string; // experienced, switcher
  fromField: string; // switcher: the field they come from
  skills: string; // comma or line separated
  achievement: string; // optional, one real result
}

export const emptySummaryInput = (kind: SummaryKind = 'fresher'): SummaryInput => ({
  kind, target: '', degree: '', major: '', years: '', fromField: '', skills: '', achievement: '',
});

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** "a" or "an", with acronyms read letter by letter (an MBA, a BBA is wrong: "a BBA" since B says "bee"). */
export function article(word: string): 'a' | 'an' {
  const w = clean(word);
  if (!w) return 'a';
  if (/^[A-Z]{2,}\b/.test(w)) return 'AEFHILMNORSX'.includes(w[0]) ? 'an' : 'a';
  return /^[aeiou]/i.test(w) ? 'an' : 'a';
}

const upFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const sentence = (s: string) => {
  const t = clean(s);
  if (!t) return '';
  const body = upFirst(t);
  return /[.!?]$/.test(body) ? body : `${body}.`;
};

export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const skillList = (raw: string, max = 4) =>
  raw.split(/[\n,;]/).map(clean).filter(Boolean).slice(0, max);

const yearsText = (y: string) => {
  const n = clean(y);
  if (!n) return '';
  return /^\d+(\.\d+)?$/.test(n) ? `${n} ${n === '1' ? 'year' : 'years'}` : n;
};

export const summaryReady = (i: SummaryInput) => !!clean(i.target) && skillList(i.skills).length > 0;

export function writeSummaries(input: SummaryInput): string[] {
  const target = clean(input.target);
  const major = clean(input.major);
  const degree = clean(input.degree);
  const skills = skillList(input.skills);
  const skillText = joinList(skills);
  const ach = sentence(input.achievement);
  const yrs = yearsText(input.years);
  const from = clean(input.fromField);
  if (!target || !skills.length) return [];

  const out: string[] = [];
  const add = (...parts: string[]) => {
    const text = parts.filter(Boolean).join(' ');
    if (text && !out.includes(text)) out.push(text);
  };
  const roleWanted = `${article(target)} ${target}`;

  if (input.kind === 'fresher') {
    const grad = major ? `${degree ? `${degree} ` : ''}graduate in ${major}`.trim() : degree ? `${degree} graduate` : 'Recent graduate';
    add(sentence(`${upFirst(grad)} seeking ${roleWanted} role`), sentence(`Skilled in ${skillText}`), ach);
    add(sentence(`Aspiring ${target} with working knowledge of ${skillText}`), degree || major ? sentence(`Holds ${degree ? `${article(degree)} ${degree}` : 'a degree'}${major ? ` in ${major}` : ''}`) : '', ach);
    add(sentence(`${upFirst(grad)} looking to start a career as ${roleWanted}`), ach || sentence(`Strengths: ${skillText}`));
  } else if (input.kind === 'experienced') {
    const exp = yrs ? ` with ${yrs} of experience` : '';
    add(sentence(`${upFirst(target)}${exp} in ${skillText}`), ach, sentence(`Seeking ${roleWanted} role`));
    add(sentence(`${yrs ? `Professional with ${yrs} of` : 'Professional with hands-on'} experience in ${skillText}`), ach, sentence(`Looking for ${roleWanted} position`));
    add(sentence(`${upFirst(target)}${exp}`), sentence(`Strengths: ${skillText}`), ach);
  } else {
    const was = from ? `${upFirst(from)} professional` : 'Professional';
    const exp = yrs ? ` with ${yrs} of experience` : '';
    add(sentence(`${was}${exp} moving into ${target}`), sentence(`Brings ${skillText}`), ach);
    add(sentence(`Moving from ${from || 'my current field'} to ${target}`), sentence(`Skills carried over: ${skillText}`), ach);
  }
  return out.slice(0, 3);
}
