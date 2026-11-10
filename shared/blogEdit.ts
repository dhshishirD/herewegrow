// Rules for editing and scheduling a blog post: what an edit may contain, when a post may go live,
// and which days the plan publishes on. No Node or browser imports, so the Worker, the admin page
// and the tests share it.

import { draftMarkers, publishProblems } from './blogAdmin';

export interface EditableFields {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  author: string;
  cta: string;
  body: string;
}

export const LIMITS = { title: 200, slug: 100, metaTitle: 120, metaDescription: 320, primaryKeyword: 120, keyword: 120, keywords: 12, author: 120, cta: 60, body: 200_000 } as const;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Default publish time in Bangladesh time. */
export const DEFAULT_TIME = '09:00';

/** Plan days: Sunday, Tuesday, Thursday, Saturday (0 = Sunday). */
export const PLAN_DAYS = [0, 2, 4, 6];

export type ParsedEdit = { ok: true; value: EditableFields } | { ok: false; error: string };

const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max ? v : null);

/** Checks the edit form. Every field must be present; text is trimmed except the body. */
export function parseEdit(input: unknown): ParsedEdit {
  if (!input || typeof input !== 'object') return { ok: false, error: 'bad_input' };
  const o = input as Record<string, unknown>;
  const title = str(o.title, LIMITS.title)?.trim();
  const slug = str(o.slug, LIMITS.slug)?.trim();
  const metaTitle = str(o.metaTitle, LIMITS.metaTitle)?.trim();
  const metaDescription = str(o.metaDescription, LIMITS.metaDescription)?.trim();
  const primaryKeyword = str(o.primaryKeyword, LIMITS.primaryKeyword)?.trim();
  const author = str(o.author, LIMITS.author)?.trim();
  const cta = str(o.cta, LIMITS.cta)?.trim();
  const body = str(o.body, LIMITS.body);
  if ([title, slug, metaTitle, metaDescription, primaryKeyword, author, cta, body].some((v) => v === null || v === undefined)) return { ok: false, error: 'bad_input' };
  const kw = o.secondaryKeywords;
  if (!Array.isArray(kw) || kw.length > LIMITS.keywords || kw.some((k) => typeof k !== 'string' || k.length > LIMITS.keyword)) return { ok: false, error: 'bad_input' };
  if (!title) return { ok: false, error: 'title_required' };
  if (!SLUG_RE.test(slug!)) return { ok: false, error: 'bad_slug' };
  if (!body!.trim()) return { ok: false, error: 'body_required' };
  return {
    ok: true,
    value: {
      title: title!, slug: slug!, metaTitle: metaTitle!, metaDescription: metaDescription!, primaryKeyword: primaryKeyword!,
      secondaryKeywords: (kw as string[]).map((k) => k.trim()).filter(Boolean), author: author!, cta: cta!, body: body!,
    },
  };
}

/** Problems for an edit form's fields. */
export const problemsOf = (p: Pick<EditableFields, 'body' | 'author' | 'primaryKeyword' | 'metaTitle' | 'metaDescription'>): string[] => publishProblems({ ...p, draftMarkers: draftMarkers(p.body) });

/** Bangladesh date (YYYY-MM-DD) and time (HH:MM) to a moment in ms, or null if either is not real. */
export function parseWhen(date: unknown, time: unknown = DEFAULT_TIME): number | null {
  if (typeof date !== 'string' || typeof time !== 'string') return null;
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!d || !t) return null;
  const [y, m, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const probe = new Date(Date.UTC(y, m - 1, day));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== day) return null;
  return Date.UTC(y, m - 1, day, Number(t[1]) - 6, Number(t[2]));
}

const dhakaDay = (ms: number) => new Date(ms + 6 * 3600 * 1000).toISOString().slice(0, 10);
const WEEKDAY = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

/** Heads-ups about a chosen time; none of them blocks. */
export function slotNotes(publishAt: number, others: Array<{ id: string; publishAt: number | null }>): string[] {
  const notes: string[] = [];
  const wd = new Date(publishAt + 6 * 3600 * 1000).getUTCDay();
  if (!PLAN_DAYS.includes(wd)) notes.push(`${WEEKDAY[wd]} পরিকল্পনার দিন নয় (রবি, মঙ্গল, বৃহ, শনি)`);
  const day = dhakaDay(publishAt);
  const same = others.filter((o) => o.publishAt !== null && dhakaDay(o.publishAt) === day).map((o) => o.id);
  if (same.length) notes.push(`ওই দিনে আরও পোস্ট আছে: ${same.join(', ')}`);
  return notes;
}
