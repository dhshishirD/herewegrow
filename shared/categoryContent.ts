// Bangla text for each category page, written by the site owner's team. Add a slug here (see shared/categoryPages.ts)
// and its page goes live on the next build, and retired templates of that category redirect to it.
// Rules (checked by a test): intro 150 to 250 words, 3 to 5 questions, plain text only.

export interface CategoryContent {
  /** Introduction paragraphs, Bangla. 150 to 250 words in all. */
  intro: string[];
  faq: { q: string; a: string }[];
  /** Optional search description (up to 155 characters). A default is built when left out. */
  metaDescription?: string;
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {};
