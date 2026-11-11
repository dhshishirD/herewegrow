// Category pages: /templates/category/<slug>. One page per kind of CV or biodata, with a Bangla introduction,
// the templates of that kind and a few questions. Retired templates redirect to the matching page.
// A page exists only when its text is written (shared/categoryContent.ts) and it has at least one template,
// so a redirect never lands on an empty page.

import { CATEGORY_CONTENT } from './categoryContent';
import { TEMPLATES, SINGLE_TEMPLATE_PRICE, hubOf, type Template } from './templates';
import { isListed, tierOf } from './templateTiers';

export interface CategoryPage {
  slug: string;
  title: { bn: string; en: string };
  matches: (t: Template) => boolean;
}

export const CATEGORY_PAGES: readonly CategoryPage[] = [
  { slug: 'fresher-cv', title: { bn: 'ফ্রেশার সিভি ফরম্যাট', en: 'Fresher CV format' }, matches: (t) => hubOf(t) === 'fresher' },
  { slug: 'bank-job-cv', title: { bn: 'ব্যাংক জব সিভি ফরম্যাট', en: 'Bank job CV format' }, matches: (t) => t.sector === 'banking' },
  { slug: 'marriage-biodata', title: { bn: 'বিয়ের বায়োডাটা ফরম্যাট', en: 'Marriage biodata format' }, matches: (t) => hubOf(t) === 'marriage-biodata' },
  { slug: 'europass-cv', title: { bn: 'ইউরোপাস সিভি ফরম্যাট', en: 'Europass CV format' }, matches: (t) => hubOf(t) === 'europass' },
  { slug: 'nursing-doctor-cv', title: { bn: 'নার্স ও ডাক্তারের সিভি ফরম্যাট', en: 'Nursing and doctor CV format' }, matches: (t) => hubOf(t) === 'nurse' },
  { slug: 'teacher-cv', title: { bn: 'শিক্ষকের সিভি ফরম্যাট', en: 'Teacher CV format' }, matches: (t) => hubOf(t) === 'teacher' },
  { slug: 'it-engineering-cv', title: { bn: 'আইটি ও ইঞ্জিনিয়ারিং সিভি ফরম্যাট', en: 'IT and engineering CV format' }, matches: (t) => hubOf(t) === 'it' || t.sector === 'engineering' },
  { slug: 'sales-marketing-cv', title: { bn: 'সেলস ও মার্কেটিং সিভি ফরম্যাট', en: 'Sales and marketing CV format' }, matches: (t) => t.sector === 'sales' },
  { slug: 'simple-cv', title: { bn: 'সিম্পল সিভি ফরম্যাট', en: 'Simple CV format' }, matches: (t) => hubOf(t) === 'simple' },
  { slug: 'modern-cv', title: { bn: 'মডার্ন সিভি ফরম্যাট', en: 'Modern CV format' }, matches: (t) => hubOf(t) === 'modern' },
  { slug: 'professional-cv', title: { bn: 'প্রফেশনাল সিভি ফরম্যাট', en: 'Professional CV format' }, matches: (t) => hubOf(t) === 'professional' },
  { slug: 'job-biodata', title: { bn: 'চাকরির বায়োডাটা ফরম্যাট', en: 'Job biodata format' }, matches: (t) => hubOf(t) === 'job-biodata' },
  { slug: 'gulf-cv', title: { bn: 'গাল্ফ ও বিদেশের সিভি ফরম্যাট', en: 'Gulf and overseas CV format' }, matches: (t) => hubOf(t) === 'other' },
];

export const findCategoryPage = (slug: string) => CATEGORY_PAGES.find((c) => c.slug === slug);

/** Templates shown on a category page: own cards only (no variants, no retired), best tier first. */
export function templatesOfCategory(slug: string): Template[] {
  const c = findCategoryPage(slug);
  if (!c) return [];
  return TEMPLATES.filter((t) => isListed(t.id) && c.matches(t)).sort((a, b) => (tierOf(a.id) === tierOf(b.id) ? 0 : tierOf(a.id) === 'A' ? -1 : 1));
}

/** True when the page for this slug exists: its text is written and it has templates. */
export const categoryLive = (slug: string): boolean => !!CATEGORY_CONTENT[slug] && templatesOfCategory(slug).length > 0;

export const liveCategoryPages = (): CategoryPage[] => CATEGORY_PAGES.filter((c) => categoryLive(c.slug));

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/** Search description for a category page (the text writer may override it with `metaDescription`). */
export function categoryDescription(slug: string): string {
  const c = findCategoryPage(slug)!;
  return CATEGORY_CONTENT[slug]?.metaDescription ?? `${c.title.bn}: Word-এ এডিটযোগ্য ${bn(templatesOfCategory(slug).length)}টি টেমপ্লেট। প্রতিটি ৳${SINGLE_TEMPLATE_PRICE}, সাথে সাথে ডাউনলোড।`;
}
