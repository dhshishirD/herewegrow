// Picks up to 3 CV templates to show on a Career Hub role page.
// Pure and deterministic: the same role always gets the same templates, in the same order.

import { EUROPASS_EXCLUDED_IDS } from './europassPages';
import { TEMPLATES, type Sector, type Template } from './templates';
import { TIER_A, isRetired, isVariant } from './templateTiers';

export const MAX_RELATED = 3;

/** Browse categories that are not CVs for a job role. */
const NOT_A_ROLE_CV = new Set(['europass', 'marriage-biodata', 'job-biodata']);

/** Words in the role title or field that point at a template sector, checked in order. */
const SECTOR_HINTS: [Sector, RegExp][] = [
  ['medical', /\b(nurs\w*|doctor|medical|health\w*|pharma\w*|clinic\w*|midwi\w*|dental)\b/],
  ['teaching', /\b(teach\w*|tutor|lecturer|educat\w*|academic|school|instructor|professor)\b/],
  ['banking', /\b(bank\w*|financ\w*|account\w*|audit\w*|insurance|microfinance|tax|cashier)\b/],
  ['engineering', /\b(engineer\w*|it|software|developer|programmer|technical|technician|data|network\w*|civil|mechanical|electrical|computer)\b/],
  ['sales', /\b(sales|marketing|brand|retail|customer|content|social media|business development|merchandis\w*|seo)\b/],
  ['corporate', /\b(hr|human resource\w*|admin\w*|office|manager|management|operations?|executive|ngo|program\w*|project|supply chain|logistics|commercial|corporate)\b/],
  ['fresher', /\b(fresher|graduate|entry|intern\w*|trainee|student)\b/],
];

const FALLBACK: Sector[] = ['fresher', 'corporate'];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ');

/** Sectors that suit a role, best first, always ending with the fallbacks. Field hints rank above title hints. */
export function sectorsForRole(title: string, field: string | null | undefined): Sector[] {
  const out: Sector[] = [];
  for (const text of [norm(field ?? ''), norm(title)]) {
    for (const [sector, re] of SECTOR_HINTS) if (re.test(text) && !out.includes(sector)) out.push(sector);
  }
  for (const s of FALLBACK) if (!out.includes(s)) out.push(s);
  return out;
}

const eligible = (t: Template): boolean =>
  !isRetired(t.id) && !isVariant(t.id) && !EUROPASS_EXCLUDED_IDS.includes(t.id) && !(t.hub && NOT_A_ROLE_CV.has(t.hub)) && t.sector !== 'other';

const words = (s: string) => norm(s).split(' ').filter((w) => w.length > 3);

/** Up to 3 templates for a role: sector match first, then title words, best tier first, then catalogue order. */
export function relatedTemplates(title: string, field: string | null | undefined, max: number = MAX_RELATED): Template[] {
  const limit = Math.min(Math.max(max, 0), MAX_RELATED);
  const titleWords = words(title);
  const order = new Map(TEMPLATES.map((t, i) => [t.id, i]));
  const pool = TEMPLATES.filter(eligible);
  const picked: Template[] = [];
  for (const sector of sectorsForRole(title, field)) {
    const score = (t: Template) => {
      const tw = norm(t.title.en);
      return (TIER_A.has(t.id) ? 2 : 0) + titleWords.filter((w) => tw.includes(w)).length * 3;
    };
    const batch = pool
      .filter((t) => t.sector === sector && !picked.includes(t))
      .sort((a, b) => score(b) - score(a) || order.get(a.id)! - order.get(b.id)!);
    for (const t of batch) {
      if (picked.length >= limit) return picked;
      picked.push(t);
    }
    if (picked.length >= limit) break;
  }
  return picked.slice(0, limit);
}
