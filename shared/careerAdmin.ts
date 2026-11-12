// Career Hub admin: the pre-publish checks and the numbers shown for each role in the admin table.
// Pure functions, shared by the server (list route) and its tests.

export interface PackLike {
  slug: string;
  title_en: string;
  summary: string;
  seo_title: string | null;
  seo_desc: string | null;
  salary: { checked: string };
  courses: unknown[];
  faq: { q: string; a: string }[];
  body_md: string;
  test: unknown[];
}

export interface RoleCheck {
  words: number;
  faq: number;
  questions: number;
  courses: number;
  checked: string;
  /** Must be fixed before publishing. */
  problems: string[];
  /** Worth a look, never blocks. */
  notes: string[];
}

export const MIN_BODY_WORDS = 300;
const PLACEHOLDER = /write the free article here|one or two sentences on the role|^question\?$|^answer\.$/i;

export function checkRole(pack: PackLike): RoleCheck {
  const words = pack.body_md.split(/\s+/).filter(Boolean).length;
  const problems: string[] = [];
  const notes: string[] = [];
  if (PLACEHOLDER.test(pack.body_md) || PLACEHOLDER.test(pack.summary) || pack.faq.some((f) => PLACEHOLDER.test(f.q) || PLACEHOLDER.test(f.a))) problems.push('নমুনা (placeholder) লেখা রয়ে গেছে');
  if (words < MIN_BODY_WORDS) problems.push(`আর্টিকেল ছোট (${words} শব্দ, কমপক্ষে ${MIN_BODY_WORDS})`);
  if (pack.faq.length < 4) problems.push(`FAQ কম (${pack.faq.length}টি, কমপক্ষে ৪)`);
  if (pack.courses.length < 3) notes.push(`কোর্স ${pack.courses.length}টি (লক্ষ্য ৩+)`);
  if (pack.test.length < 10) notes.push(`টেস্টে ${pack.test.length}টি প্রশ্ন (লক্ষ্য ১০+)`);
  if (!pack.seo_title) notes.push('SEO টাইটেল নেই');
  else if (pack.seo_title.length > 60) notes.push(`SEO টাইটেল লম্বা (${pack.seo_title.length}/60)`);
  if (!pack.seo_desc) notes.push('SEO বর্ণনা নেই');
  else if (pack.seo_desc.length > 155) notes.push(`SEO বর্ণনা লম্বা (${pack.seo_desc.length}/155)`);
  return { words, faq: pack.faq.length, questions: pack.test.length, courses: pack.courses.length, checked: pack.salary.checked, problems, notes };
}
