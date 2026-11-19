// Generic building blocks for the long, action-first SEO pages (Europass pages, higher study pages).
// Types and tiny helpers only: the copy for each page set lives in its own file (shared/europassPages.ts, shared/higherStudyPages.ts).

export interface Source { title: string; url: string }

export interface Block {
  id: string;
  h2: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  table?: { head: string[]; rows: string[][] };
  /** Where a fact in this section comes from. Rendered as "Source: ... Last checked ..." at the end of the section. */
  source?: { title: string; url: string; checked: string };
}
export interface Faq { q: string; a: string }

/** One of the three big choice cards. `alt` is an optional second link under the main button. */
export interface Choice {
  id: 'build' | 'word' | 'expert';
  title: string;
  bn: string;
  micro: string;
  cta: string;
  href: string;
  external?: boolean;
  alt?: { label: string; href: string };
}

export interface QuizOption { id: string; label: string }
export interface QuizQuestion { id: string; q: string; bn: string; options: QuizOption[] }
export type QuizAnswers = Partial<Record<string, string>>;
export interface QuizResult {
  id: string;
  title: string;
  bn: string;
  body: string;
  actions: { label: string; href: string; primary?: boolean }[];
}

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function blockText(b: Block): string {
  return [b.h2, ...(b.p ?? []), ...(b.ul ?? []), ...(b.ol ?? []), ...(b.table ? [b.table.head.join(' '), ...b.table.rows.map((r) => r.join(' '))] : [])].join(' ');
}

export const bdt = (n: number) => `৳${n}`;
