// Application-letter generator: pure text builder, no network. Used by /tools/application-letter.

export type LetterKind = 'govt' | 'private';
export type LetterLang = 'bn' | 'en';

export interface LetterInput {
  kind: LetterKind;
  lang: LetterLang;
  name: string;
  address: string;
  phone: string;
  email: string;
  date: string;
  post: string;
  org: string;
  orgAddress: string;
  source: string; // where the circular was seen
  education: string;
  experience: string;
  strengths: string;
}

const clean = (s: string) => s.trim().replace(/[ \t]+/g, ' ');

export function emptyLetter(lang: LetterLang): LetterInput {
  return {
    kind: 'private', lang, name: '', address: '', phone: '', email: '',
    date: '', post: '', org: '', orgAddress: '', source: '', education: '', experience: '', strengths: '',
  };
}

export const missingFields = (i: LetterInput): string[] =>
  (['name', 'post', 'org'] as const).filter((k) => !clean(i[k]));

export function buildLetter(input: LetterInput): string {
  const i = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, typeof v === 'string' ? clean(v) : v])) as unknown as LetterInput;
  return i.lang === 'bn' ? bangla(i) : english(i);
}

function contact(i: LetterInput, bn: boolean): string[] {
  return [
    i.address,
    i.phone && `${bn ? 'মোবাইল' : 'Mobile'}: ${i.phone}`,
    i.email && `${bn ? 'ইমেইল' : 'Email'}: ${i.email}`,
  ].filter(Boolean) as string[];
}

function bangla(i: LetterInput): string {
  const org = i.org || '[প্রতিষ্ঠানের নাম]';
  const post = i.post || '[পদের নাম]';
  const to = ['বরাবর,', 'মানব সম্পদ বিভাগ / নিয়োগ কর্তৃপক্ষ', org, i.orgAddress].filter(Boolean);
  const via = i.source ? `${i.source}-এ প্রকাশিত নিয়োগ বিজ্ঞপ্তি দেখে` : 'নিয়োগ বিজ্ঞপ্তি দেখে';
  const lines: string[] = [];
  if (i.date) lines.push(`তারিখ: ${i.date}`, '');
  lines.push(...to, '');
  lines.push(`বিষয়: "${post}" পদে আবেদন।`, '');
  lines.push('জনাব,', '');
  if (i.kind === 'govt') {
    lines.push(
      `যথাবিহিত সম্মানপূর্বক বিনীত নিবেদন এই যে, ${via} আমি "${post}" পদে আবেদন করছি। আমি উক্ত পদের সকল শর্ত পূরণ করি এবং আবেদনের সাথে প্রয়োজনীয় সনদ ও কাগজপত্র সংযুক্ত করেছি।`,
      '',
    );
    if (i.education) lines.push(`আমার শিক্ষাগত যোগ্যতা: ${i.education}`, '');
    if (i.experience) lines.push(`অভিজ্ঞতা: ${i.experience}`, '');
    lines.push(
      `অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমাকে উক্ত পদে নিয়োগ দান করে বাধিত করবেন। নিয়োগ লাভ করলে আমি সততা ও নিষ্ঠার সাথে দায়িত্ব পালন করব।`,
      '',
      'বিনীত নিবেদক,',
    );
  } else {
    lines.push(`${via} আমি "${post}" পদে আবেদন করছি। আমার যোগ্যতা ও অভিজ্ঞতা এই পদের সাথে মানানসই বলে আমি বিশ্বাস করি।`, '');
    if (i.education) lines.push(`শিক্ষাগত যোগ্যতা: ${i.education}`, '');
    if (i.experience) lines.push(`অভিজ্ঞতা: ${i.experience}`, '');
    if (i.strengths) lines.push(`আমার শক্তির জায়গা: ${i.strengths}`, '');
    lines.push(
      `আমার সিভি সংযুক্ত করা হলো। সাক্ষাৎকারের জন্য ডাকলে আমি আপনাদের সুবিধামতো সময়ে উপস্থিত হতে প্রস্তুত। আমার আবেদনটি বিবেচনার জন্য ধন্যবাদ।`,
      '',
      'বিনীত,',
    );
  }
  lines.push(i.name || '[আপনার নাম]', ...contact(i, true), '', 'সংযুক্তি: সিভি ও প্রয়োজনীয় সনদের কপি');
  return lines.join('\n');
}

function english(i: LetterInput): string {
  const org = i.org || '[Organisation]';
  const post = i.post || '[Position]';
  const lines: string[] = [];
  if (i.date) lines.push(i.date, '');
  lines.push('The Hiring Manager', org);
  if (i.orgAddress) lines.push(i.orgAddress);
  lines.push('', `Subject: Application for the post of ${post}`, '');
  lines.push(i.kind === 'govt' ? 'Dear Sir,' : 'Dear Hiring Manager,', '');
  const via = i.source ? `advertised in ${i.source}` : 'advertised';
  if (i.kind === 'govt') {
    lines.push(
      `With due respect, I would like to apply for the post of ${post}, as ${via}. I meet the requirements of the post and have enclosed my certificates and documents.`,
      '',
    );
    if (i.education) lines.push(`Educational qualifications: ${i.education}`, '');
    if (i.experience) lines.push(`Experience: ${i.experience}`, '');
    lines.push(
      'I therefore request you to kindly consider my application and appoint me to the post. If selected, I will carry out my duties with honesty and dedication.',
      '',
      'Yours faithfully,',
    );
  } else {
    lines.push(`I am writing to apply for the position of ${post} at ${org}, ${via}. I believe my background fits this role well.`, '');
    if (i.education) lines.push(`Education: ${i.education}`, '');
    if (i.experience) lines.push(`Experience: ${i.experience}`, '');
    if (i.strengths) lines.push(`What I bring: ${i.strengths}`, '');
    lines.push(
      'My CV is attached. I would welcome the chance to discuss the role in an interview at a time that suits you. Thank you for considering my application.',
      '',
      'Sincerely,',
    );
  }
  lines.push(i.name || '[Your name]', ...contact(i, false), '', 'Enclosure: CV and copies of certificates');
  return lines.join('\n');
}
