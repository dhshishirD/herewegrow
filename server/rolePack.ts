// Career Hub role packs: one validated JSON per job role (Phase 2 spec, section 5).
// validateRolePack checks an import; saveRolePack writes it to D1 as a draft.

import type { D1Like } from './cf';

export interface RolePack {
  slug: string;
  title_en: string;
  title_bn: string | null;
  field: string;
  summary: string;
  seo_title: string | null;
  seo_desc: string | null;
  salary: { entry: string; mid: string; senior: string; note: string; checked: string };
  benefits: string[];
  companies: string[];
  season: string[];
  skills: { name: string; level: string; tag: string }[];
  gaps_checklist: string[];
  courses: { title: string; provider: string; url: string; is_affiliate: boolean; skill_tag: string }[];
  faq: { q: string; a: string }[];
  body_md: string;
  growth_plan: { y1: string; y2: string; y3: string };
  goal_sheet: string[];
  test: { skill_tag: string; q: string; options: string[]; answer_idx: number; explain: string }[];
  cv_template_notes: string;
  cover_letter_md: string;
  interview_qs: string[];
}

export const MAX_PACK_BYTES = 256 * 1024;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UNSAFE_MD = /<\s*\/?\s*script|javascript:/i;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export type ValidateResult = { ok: true; pack: RolePack } | { ok: false; errors: string[] };

export function validateRolePack(input: unknown): ValidateResult {
  if (!isObj(input)) return { ok: false, errors: ['pack must be a JSON object'] };
  if (JSON.stringify(input).length > MAX_PACK_BYTES) return { ok: false, errors: [`pack is larger than ${MAX_PACK_BYTES / 1024} KB`] };

  const errors: string[] = [];
  const text = (key: string, max: number, required = true): string => {
    const v = input[key];
    if (v === undefined || v === null || v === '') {
      if (required) errors.push(`${key} is required`);
      return '';
    }
    if (typeof v !== 'string' || v.length > max) {
      errors.push(`${key} must be text up to ${max} characters`);
      return '';
    }
    return v;
  };
  const md = (key: string, max: number): string => {
    const v = text(key, max);
    if (UNSAFE_MD.test(v)) errors.push(`${key} contains a script tag or javascript: link`);
    return v;
  };
  const strings = (key: string, max = 50, itemMax = 500, required = true): string[] => {
    const v = input[key];
    if (!Array.isArray(v) || (required && v.length === 0) || v.length > max || v.some((s) => typeof s !== 'string' || !s || s.length > itemMax)) {
      errors.push(`${key} must be a ${required ? 'non-empty ' : ''}list of up to ${max} text items`);
      return [];
    }
    return v as string[];
  };
  const objects = <T>(key: string, max: number, min: number, check: (o: Record<string, unknown>) => string | null): T[] => {
    const v = input[key];
    if (!Array.isArray(v) || v.length < min || v.length > max) {
      errors.push(`${key} must be a list of ${min} to ${max} items`);
      return [];
    }
    v.forEach((o, i) => {
      const bad = isObj(o) ? check(o) : 'must be an object';
      if (bad) errors.push(`${key}[${i}] ${bad}`);
    });
    return v as T[];
  };
  const str = (o: Record<string, unknown>, k: string, max = 500) => typeof o[k] === 'string' && !!o[k] && (o[k] as string).length <= max;

  const slug = text('slug', 80);
  if (slug && !SLUG.test(slug)) errors.push('slug must be lowercase letters, numbers and hyphens (for example bank-officer)');
  const title_en = text('title_en', 120);
  const title_bn = text('title_bn', 120, false) || null;
  const field = text('field', 80);
  const summary = text('summary', 1000);
  const seo_title = text('seo_title', 120, false) || null;
  const seo_desc = text('seo_desc', 300, false) || null;

  const sal = input.salary;
  const salary = (isObj(sal) ? sal : {}) as RolePack['salary'];
  if (!isObj(sal) || !['entry', 'mid', 'senior', 'note', 'checked'].every((k) => str(sal, k, 200))) {
    errors.push('salary needs entry, mid, senior, note and checked (the date it was last checked)');
  }

  const benefits = strings('benefits');
  const companies = strings('companies');
  const season = strings('season', 20, 300, false);
  const skills = objects<RolePack['skills'][number]>('skills', 40, 1, (o) => (str(o, 'name', 120) && str(o, 'level', 40) && str(o, 'tag', 60) ? null : 'needs name, level and tag'));
  const gaps_checklist = strings('gaps_checklist', 40, 300);
  const courses = objects<RolePack['courses'][number]>('courses', 30, 0, (o) => {
    if (!str(o, 'title', 200) || !str(o, 'provider', 120) || !str(o, 'skill_tag', 60) || typeof o.is_affiliate !== 'boolean') return 'needs title, provider, skill_tag and is_affiliate';
    return typeof o.url === 'string' && /^https?:\/\/[^\s]+$/i.test(o.url) && o.url.length <= 500 ? null : 'url must start with http:// or https://';
  });
  const faq = objects<RolePack['faq'][number]>('faq', 20, 0, (o) => (str(o, 'q', 300) && str(o, 'a', 2000) ? null : 'needs q and a'));
  const body_md = md('body_md', 60_000);
  const gp = input.growth_plan;
  const growth_plan = (isObj(gp) ? gp : {}) as RolePack['growth_plan'];
  if (!isObj(gp) || !['y1', 'y2', 'y3'].every((k) => str(gp, k, 3000))) errors.push('growth_plan needs y1, y2 and y3');
  else if (['y1', 'y2', 'y3'].some((k) => UNSAFE_MD.test(gp[k] as string))) errors.push('growth_plan contains a script tag or javascript: link');
  const goal_sheet = strings('goal_sheet', 40, 300);
  const test = objects<RolePack['test'][number]>('test', 30, 1, (o) => {
    if (!str(o, 'skill_tag', 60) || !str(o, 'q', 500) || !str(o, 'explain', 1000)) return 'needs skill_tag, q and explain';
    const opts = o.options;
    if (!Array.isArray(opts) || opts.length < 2 || opts.length > 6 || opts.some((x) => typeof x !== 'string' || !x || x.length > 300)) return 'needs 2 to 6 text options';
    return Number.isInteger(o.answer_idx) && (o.answer_idx as number) >= 0 && (o.answer_idx as number) < opts.length ? null : 'answer_idx must point at one of the options';
  });
  const cv_template_notes = md('cv_template_notes', 5000);
  const cover_letter_md = md('cover_letter_md', 10_000);
  const interview_qs = strings('interview_qs', 60, 500);

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    pack: {
      slug, title_en, title_bn, field, summary, seo_title, seo_desc, salary, benefits, companies, season, skills,
      gaps_checklist, courses, faq, body_md, growth_plan, goal_sheet, test, cv_template_notes, cover_letter_md, interview_qs,
    },
  };
}

/**
 * Writes the pack as a draft role, or updates the role with the same slug in place.
 * Courses and questions are replaced by the new pack; status and published_at are kept.
 */
export async function saveRolePack(db: D1Like, pack: RolePack, now = Date.now()): Promise<{ id: string; created: boolean }> {
  const existing = await db.prepare('SELECT id FROM roles WHERE slug = ?').bind(pack.slug).first<{ id: string }>();
  const id = existing?.id ?? crypto.randomUUID();
  const fields = [pack.title_en, pack.title_bn, pack.field, pack.summary, pack.seo_title, pack.seo_desc, JSON.stringify(pack)];
  const write = existing
    ? db
        .prepare('UPDATE roles SET title_en = ?, title_bn = ?, field = ?, summary = ?, seo_title = ?, seo_desc = ?, pack_json = ?, updated_at = ? WHERE id = ?')
        .bind(...fields, now, id)
    : db
        .prepare("INSERT INTO roles (title_en, title_bn, field, summary, seo_title, seo_desc, pack_json, updated_at, id, slug, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')")
        .bind(...fields, now, id, pack.slug);
  await db.batch([
    write,
    db.prepare('DELETE FROM role_courses WHERE role_id = ?').bind(id),
    db.prepare('DELETE FROM skill_questions WHERE role_id = ?').bind(id),
    ...pack.courses.map((c, i) =>
      db
        .prepare('INSERT INTO role_courses (id, role_id, title, provider, url, is_affiliate, skill_tag, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), id, c.title, c.provider, c.url, c.is_affiliate ? 1 : 0, c.skill_tag, i),
    ),
    ...pack.test.map((t, i) =>
      db
        .prepare('INSERT INTO skill_questions (id, role_id, skill_tag, q, options_json, answer_idx, explain, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), id, t.skill_tag, t.q, JSON.stringify(t.options), t.answer_idx, t.explain, i),
    ),
  ]);
  return { id, created: !existing };
}
