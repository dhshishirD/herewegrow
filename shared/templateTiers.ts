// Tiers, variants and retired templates (decided 12 Nov 2026 from the template review).
// Pure data and helpers shared by the site (listing, detail page), the build (sitemap, canonical, noindex) and the Worker (301 redirects).
//
// - A = best templates: indexed, shown first.
// - B = everything else that is on sale as its own card.
// - Variants: a colour or layout option of a lead template. Still on sale and downloadable, but not a separate card and not a separate search result (canonical points at the lead).
// - Retired: no longer shown, no longer in the sitemap, the page answers with a 301. The template stays in TEMPLATES so past buyers can still re-download it.
//
// Nothing here deletes a Word file, a preview image or an order.

import { TEMPLATES } from './templates';

/** Flip to true when the /templates/category/<slug> pages exist. Until then retired templates redirect to /templates. */
export const CATEGORY_PAGES_LIVE = false;

export type Tier = 'A' | 'B';

export const TIER_A: ReadonlySet<string> = new Set([
  'ats-academic-teaching-2page',
  'ats-banking-senior-executive',
  'ats-banking-standard-bd',
  'ats-classic-professional-2page',
  'ats-graduate-detailed-2page',
  'ats-graduate-standard-single-page',
  'ats-minimalist-single-page',
  'ats-technical-specialist-2page',
  'creative-civil-engineering-2page',
  'creative-finance-accountant-2page',
  'creative-marketing-manager-2page',
  'creative-mechanical-entry-level',
  'creative-medical-assistant-bd',
  'creative-medical-doctor-2column',
  'creative-sales-standard-1page',
  'hwg-cv-job-biodata-general-worker-006',
  'hwg-cv-simple-classic-009',
  'hwg-cv-marriage-biodata-marriage-018',
  'hwg-cv-fresher-fresher-s-009',
  'hwg-cv-europass-europass-016',
  'hwg-cv-professional-banking-021',
  'hwg-cv-fresher-fresher-s-012',
  'hwg-cv-nurse-doctor-003',
  'hwg-cv-it-computer-engineer-003',
  'hwg-cv-marriage-biodata-marriage-017',
  'hwg-cv-europass-europass-015',
  'hwg-cv-nurse-care-assistent-001',
  'hwg-cv-student-higher-study-and-p-003',
  'hwg-cv-modern-classic-044',
  'hwg-cv-professional-community-mobiliza-026',
  'hwg-cv-simple-classic-008',
  'hwg-cv-marriage-biodata-marriage-015',
  'hwg-cv-modern-classic-004',
  'hwg-cv-teacher-teacher-005',
  'hwg-cv-professional-supervise-leadersh-045',
  'hwg-cv-fresher-fresher-s-004',
  'hwg-cv-professional-banking-022',
  'hwg-cv-it-it-executive-emgin-006',
  'creative-graduate-standard-bd',
  'hwg-cv-teacher-teacher-003',
]);

/** Retired template id -> the category page it should land on once category pages exist. */
export const RETIRED: Readonly<Record<string, string>> = {
  'hwg-cv-job-biodata-driver-005': 'job-biodata',
  'hwg-cv-fresher-fresher-s-011': 'fresher-cv',
  'hwg-cv-professional-supervisor-044': 'professional-cv',
  'hwg-cv-modern-classic-015': 'it-engineering-cv',
  'hwg-cv-fresher-fresher-s-001': 'fresher-cv',
  'hwg-cv-europass-europass-017': 'europass-cv',
  'hwg-cv-nurse-doctor-005': 'nursing-doctor-cv',
  'hwg-cv-modern-100-052': 'sales-marketing-cv',
  'hwg-cv-europass-europass-022': 'europass-cv',
  'hwg-cv-job-biodata-driver-004': 'job-biodata',
  'hwg-cv-fresher-fresher-s-008': 'fresher-cv',
  'hwg-cv-europass-europass-024': 'europass-cv',
  'hwg-cv-europass-europass-021': 'europass-cv',
  'hwg-cv-job-biodata-chef-002': 'job-biodata',
  'hwg-cv-modern-100-050': 'modern-cv',
  'hwg-cv-europass-europass-019': 'europass-cv',
  'hwg-cv-professional-manager-or-cashier-033': 'professional-cv',
  'hwg-cv-professional-senior-executive-040': 'professional-cv',
  'hwg-cv-europass-europass-004': 'europass-cv',
  'hwg-cv-europass-europass-026': 'europass-cv',
  'hwg-cv-other-countrywise-003': 'modern-cv',
  'hwg-cv-modern-100-053': 'sales-marketing-cv',
  'hwg-cv-europass-europass-007': 'europass-cv',
  'hwg-cv-europass-europass-012': 'europass-cv',
  'hwg-cv-it-automation-enginee-002': 'it-engineering-cv',
  'hwg-cv-job-biodata-chef-001': 'job-biodata',
  'hwg-cv-nurse-doctor-004': 'nursing-doctor-cv',
  'hwg-cv-modern-classic-006': 'it-engineering-cv',
  'hwg-cv-professional-ngo-034': 'professional-cv',
  'hwg-cv-professional-consultant-027': 'bank-job-cv',
  'hwg-cv-professional-engineering-010': 'it-engineering-cv',
  'hwg-cv-professional-manager-or-cashier-032': 'professional-cv',
  'hwg-cv-professional-senior-executive-039': 'professional-cv',
  'hwg-cv-professional-electrical-enginee-003': 'it-engineering-cv',
  'hwg-cv-europass-europass-008': 'europass-cv',
  'hwg-cv-modern-classic-028': 'bank-job-cv',
  'hwg-cv-modern-classic-045': 'nursing-doctor-cv',
  'hwg-cv-modern-100-074': 'nursing-doctor-cv',
  'hwg-cv-modern-modern-001': 'sales-marketing-cv',
};

/** Variant template id -> the lead template it is an option of. */
export const VARIANT_OF: Readonly<Record<string, string>> = {
  'creative-mechanical-project-focused': 'hwg-cv-other-countrywise-007',
  'creative-mechanical-technical-showcase': 'hwg-cv-other-countrywise-007',
  'creative-sales-executive-2page': 'creative-sales-standard-1page',
  'creative-sales-standard-2page': 'creative-sales-standard-1page',
  'hwg-cv-simple-classic-012': 'hwg-cv-simple-classic-009',
  'hwg-cv-job-biodata-general-worker-007': 'hwg-cv-job-biodata-general-worker-006',
  'hwg-cv-professional-banking-023': 'creative-banking-two-column-2page',
  'hwg-cv-professional-engineering-015': 'hwg-cv-other-countrywise-007',
  'hwg-cv-professional-sales-representati-037': 'hwg-cv-professional-business-partner-025',
  'hwg-cv-modern-100-059': 'hwg-cv-nurse-doctor-003',
  'hwg-cv-other-countrywise-002': 'creative-corporate-modern-1page',
  'hwg-cv-modern-classic-009': 'hwg-cv-modern-100-054',
  'hwg-cv-simple-classic-006': 'hwg-cv-professional-engineering-012',
  'hwg-cv-fresher-fresher-s-002': 'hwg-cv-fresher-fresher-s-009',
  'hwg-cv-europass-europass-018': 'hwg-cv-europass-europass-016',
  'hwg-cv-marriage-biodata-marriage-012': 'hwg-cv-marriage-biodata-marriage-011',
  'hwg-cv-marriage-biodata-marriage-014': 'hwg-cv-marriage-biodata-marriage-009',
  'hwg-cv-europass-europass-014': 'hwg-cv-europass-europass-010',
  'hwg-cv-modern-classic-012': 'hwg-cv-nurse-care-assistent-001',
  'hwg-cv-modern-100-057': 'hwg-cv-nurse-care-assistent-001',
  'hwg-cv-marriage-biodata-marriage-013': 'hwg-cv-marriage-biodata-marriage-009',
  'hwg-cv-europass-europass-006': 'hwg-cv-europass-europass-015',
  'hwg-cv-europass-europass-011': 'hwg-cv-europass-europass-010',
  'hwg-cv-graphic-designer-ux-designer-003': 'hwg-cv-modern-classic-047',
  'hwg-cv-modern-100-073': 'hwg-cv-modern-classic-044',
  'hwg-cv-fresher-fresher-s-003': 'hwg-cv-fresher-fresher-s-012',
  'hwg-cv-europass-europass-023': 'hwg-cv-europass-europass-003',
  'hwg-cv-europass-europass-025': 'hwg-cv-europass-europass-003',
  'hwg-cv-europass-europass-001': 'hwg-cv-europass-europass-003',
  'hwg-cv-europass-europass-013': 'hwg-cv-europass-europass-003',
  'hwg-cv-modern-100-068': 'hwg-cv-modern-classic-037',
  'hwg-cv-professional-sales-representati-038': 'creative-sales-standard-1page',
  'hwg-cv-europass-europass-002': 'hwg-cv-europass-europass-003',
  'hwg-cv-other-countrywise-008': 'hwg-cv-professional-community-mobiliza-026',
  'hwg-cv-professional-banking-020': 'creative-banking-two-column-2page',
  'hwg-cv-marriage-biodata-marriage-004': 'hwg-cv-marriage-biodata-marriage-017',
  'hwg-cv-marriage-biodata-marriage-020': 'hwg-cv-marriage-biodata-marriage-019',
  'hwg-cv-modern-classic-003': 'creative-medical-assistant-bd',
  'hwg-cv-modern-100-049': 'creative-medical-assistant-bd',
  'hwg-cv-nurse-doctor-002': 'creative-medical-assistant-bd',
  'hwg-cv-professional-accounting-profess-019': 'hwg-cv-professional-accounting-profess-018',
  'hwg-cv-simple-classic-001': 'hwg-cv-simple-classic-008',
  'hwg-cv-modern-classic-039': 'hwg-cv-modern-classic-004',
  'hwg-cv-modern-100-070': 'hwg-cv-modern-classic-004',
  'hwg-cv-europass-europass-009': 'hwg-cv-europass-europass-003',
  'hwg-cv-modern-classic-042': 'hwg-cv-professional-engineering-012',
  'hwg-cv-professional-engineering-017': 'hwg-cv-professional-engineering-012',
  'hwg-cv-other-countrywise-009': 'creative-modern-professional-2column-1page',
  'hwg-cv-modern-100-056': 'hwg-cv-modern-classic-011',
  'hwg-cv-marriage-biodata-marriage-007': 'hwg-cv-marriage-biodata-marriage-006',
  'hwg-cv-marriage-biodata-marriage-008': 'hwg-cv-marriage-biodata-marriage-006',
  'hwg-cv-marriage-biodata-marriage-005': 'hwg-cv-marriage-biodata-marriage-006',
  'hwg-cv-other-countrywise-006': 'hwg-cv-teacher-teacher-002',
  'hwg-cv-teacher-teacher-004': 'ats-academic-teaching-2page',
  'hwg-cv-simple-classic-004': 'hwg-cv-simple-classic-008',
  'hwg-cv-modern-classic-034': 'hwg-cv-modern-classic-027',
  'hwg-cv-modern-100-064': 'hwg-cv-modern-classic-027',
  'hwg-cv-modern-100-065': 'hwg-cv-modern-classic-035',
  'hwg-cv-modern-100-066': 'hwg-cv-modern-classic-035',
  'hwg-cv-modern-classic-033': 'hwg-cv-modern-100-063',
  'hwg-cv-modern-classic-013': 'creative-medical-doctor-2column',
  'hwg-cv-modern-100-058': 'creative-medical-doctor-2column',
  'hwg-cv-modern-100-061': 'hwg-cv-modern-classic-027',
  'hwg-cv-professional-sales-representati-036': 'creative-sales-standard-1page',
  'hwg-cv-modern-classic-029': 'hwg-cv-professional-engineering-012',
  'hwg-cv-professional-electrical-enginee-006': 'hwg-cv-professional-engineering-014',
  'hwg-cv-other-countrywise-005': 'hwg-cv-professional-supervisor-043',
  'hwg-cv-modern-classic-021': 'hwg-cv-professional-engineering-014',
  'hwg-cv-modern-classic-018': 'hwg-cv-professional-engineering-012',
  'hwg-cv-marriage-biodata-marriage-001': 'hwg-cv-marriage-biodata-marriage-003',
  'hwg-cv-marriage-biodata-marriage-002': 'hwg-cv-marriage-biodata-marriage-003',
  'hwg-cv-modern-classic-041': 'hwg-cv-graphic-designer-architect-001',
  'hwg-cv-modern-100-072': 'hwg-cv-graphic-designer-architect-001',
  'hwg-cv-modern-100-071': 'hwg-cv-modern-classic-008',
  'hwg-cv-modern-classic-024': 'hwg-cv-other-countrywise-007',
  'hwg-cv-modern-classic-005': 'hwg-cv-modern-classic-019',
  'hwg-cv-creative-content-writer-001': 'hwg-cv-modern-classic-007',
  'hwg-cv-professional-electrical-enginee-004': 'hwg-cv-modern-classic-019',
  'hwg-cv-other-countrywise-004': 'hwg-cv-professional-banking-021',
  'hwg-cv-fresher-fresher-s-007': 'hwg-cv-fresher-fresher-s-012',
  'hwg-cv-professional-crisis-and-issues--029': 'hwg-cv-modern-classic-008',
  'hwg-cv-professional-electrical-enginee-001': 'hwg-cv-modern-classic-016',
  'hwg-cv-modern-classic-014': 'hwg-cv-nurse-doctor-003',
  'hwg-cv-it-data-engineer-004': 'hwg-cv-modern-100-054',
  'creative-sales-executive-1page': 'creative-sales-standard-1page',
  'creative-driving-standard': 'creative-sales-standard-1page',
  'hwg-cv-professional-engineering-008': 'creative-modern-professional-2column-1page',
  'hwg-cv-fresher-fresher-s-005': 'creative-graduate-standard-bd',
  'creative-marketing-specialist-2page': 'creative-mechanical-entry-level',
  'hwg-cv-fresher-fresher-s-010': 'creative-civil-engineering-2page',
  'hwg-cv-teacher-teacher-001': 'hwg-cv-teacher-teacher-003',
  'hwg-cv-teacher-teacher-006': 'hwg-cv-fresher-fresher-s-009',
};

export const tierOf = (id: string): Tier => (TIER_A.has(id) ? 'A' : 'B');
export const isRetired = (id: string): boolean => id in RETIRED;
export const leadOf = (id: string): string | undefined => VARIANT_OF[id];
export const isVariant = (id: string): boolean => id in VARIANT_OF;

/** The variants of one lead, in catalogue order. */
export function variantsOf(leadId: string): string[] {
  return TEMPLATES.filter((t) => VARIANT_OF[t.id] === leadId && !isRetired(t.id)).map((t) => t.id);
}

/** Templates shown as their own card: on sale and not a variant. */
export const isListed = (id: string): boolean => !isRetired(id) && !isVariant(id);

/** How many templates are on sale (cards plus variants). */
export const ON_SALE_COUNT = TEMPLATES.filter((t) => !isRetired(t.id)).length;

/** Where a retired template's page redirects. */
export function retiredTarget(id: string): string | null {
  const cat = RETIRED[id];
  if (!cat) return null;
  return CATEGORY_PAGES_LIVE ? `/templates/category/${cat}` : '/templates';
}

/** 301 target for a request path, or null when the path is not a retired template page. */
export function redirectForPath(pathname: string): string | null {
  const m = pathname.match(/^\/templates\/([a-z0-9-]+)\/?$/);
  return m ? retiredTarget(m[1]) : null;
}

/** Cloudflare `_redirects` rules for every retired template page (with and without a trailing slash). Static assets answer before the Worker runs, so these must be rules, not Worker code. */
export function redirectsFile(): string {
  const lines: string[] = [];
  for (const id of Object.keys(RETIRED)) {
    const to = retiredTarget(id);
    if (!to) continue;
    lines.push(`/templates/${id} ${to} 301`, `/templates/${id}/ ${to} 301`);
  }
  return `${lines.join('\n')}\n`;
}

/** The page search engines should treat as the original: a variant points at its lead. */
export const canonicalPathFor = (id: string): string => `/templates/${VARIANT_OF[id] ?? id}`;

/**
 * Should this template page be indexable?
 * Core templates were already indexed, so they stay indexable (a core variant gets a canonical to its lead instead of noindex).
 * Library templates are indexed only when they are tier A and not a variant or retired (wave 1); B follows in wave 2.
 */
export function shouldIndex(t: { id: string; lib?: boolean }): boolean {
  if (isRetired(t.id)) return false;
  if (!t.lib) return true;
  return !isVariant(t.id) && tierOf(t.id) === 'A';
}

