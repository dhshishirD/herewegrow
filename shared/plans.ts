// Builder Pro passes. One all-access membership with a single "Pro until" date.
// The browser uses this to show prices; the server uses it to set the amount charged
// and to grant time. Never take a price or length from the request.

import type { Bilingual } from './catalog';

export const DAY_MS = 86_400_000;

/**
 * Show Pro in the menu and on the account page. Keep false until the Pro features
 * (clean downloads, saved CVs, AI) are live, so nobody pays for something not there yet.
 * The /pro page and checkout work either way, for testing.
 */
export const PRO_PUBLIC = false;

export type PlanId = 'pro-7' | 'pro-30' | 'pro-365';
export type PartnerPlanId = 'partner-30' | 'partner-90' | 'partner-365';

/** Extra rules of a CV Partner pass (null/absent on ordinary Pro passes). */
export interface PartnerRules {
  /** Most client folders that can be created inside one period. */
  clientCap: number;
  /** Length in days of the period the cap is counted over. */
  periodDays: number;
  /** The partner may switch off the small "Made with HWG" line. */
  brandingRemovable: boolean;
  /** Shows the Partner badge. */
  badge: boolean;
}

export interface Plan {
  id: PlanId | PartnerPlanId;
  partner?: PartnerRules;
  /** Price in BDT. */
  price: number;
  days: number;
  name: Bilingual;
  /** Template discount in percent (100 = all templates included). */
  templateOff: number;
  /** Free templates per month. */
  freeTemplatesPerMonth: number;
}

export type ProPlan = Plan & { id: PlanId };

export const PLANS: ProPlan[] = [
  { id: 'pro-7', price: 49, days: 7, name: { en: 'Pro 7 days', bn: 'প্রো ৭ দিন' }, templateOff: 50, freeTemplatesPerMonth: 0 },
  { id: 'pro-30', price: 149, days: 30, name: { en: 'Pro 30 days', bn: 'প্রো ৩০ দিন' }, templateOff: 50, freeTemplatesPerMonth: 1 },
  { id: 'pro-365', price: 499, days: 365, name: { en: 'Pro 1 year', bn: 'প্রো ১ বছর' }, templateOff: 100, freeTemplatesPerMonth: 0 },
];

/**
 * CV Partner passes: for people who make CVs for clients. They grant every Pro perk and all templates while active
 * (templateOff 100), and add the Partner Workspace. Time stacks with Pro in the same "Pro until" date.
 * Prices are server-side only, like Pro. Promo codes work on these too (never below the minimum payable).
 */
export const PARTNER_PLANS: Plan[] = [
  { id: 'partner-30', price: 299, days: 30, name: { en: 'CV Partner Starter 30 days', bn: 'সিভি পার্টনার স্টার্টার ৩০ দিন' }, templateOff: 100, freeTemplatesPerMonth: 0, partner: { clientCap: 30, periodDays: 30, brandingRemovable: false, badge: false } },
  { id: 'partner-90', price: 699, days: 90, name: { en: 'CV Partner 90 days', bn: 'সিভি পার্টনার ৯০ দিন' }, templateOff: 100, freeTemplatesPerMonth: 0, partner: { clientCap: 100, periodDays: 90, brandingRemovable: true, badge: false } },
  { id: 'partner-365', price: 1999, days: 365, name: { en: 'CV Partner Year', bn: 'সিভি পার্টনার ১ বছর' }, templateOff: 100, freeTemplatesPerMonth: 0, partner: { clientCap: 500, periodDays: 90, brandingRemovable: true, badge: true } },
];

/** Limits that apply to every active Pro user. */
export const PRO_LIMITS = { savedCvs: 20, aiActionsPerDay: 30, templateDownloadsPerDay: 10 } as const;
export const FREE_LIMITS = { savedCvs: 1 } as const;

export const findPlan = (id: string): Plan | undefined => PLANS.find((p) => p.id === id) ?? PARTNER_PLANS.find((p) => p.id === id);
export const isPartnerPlan = (id: string): boolean => PARTNER_PLANS.some((p) => p.id === id);

/** New "Pro until" after buying `days`: added on top of any time left, else from now. */
export const extendPro = (proUntil: number | null, days: number, now = Date.now()): number =>
  Math.max(now, proUntil ?? 0) + days * DAY_MS;

export const isProActive = (proUntil: number | null, now = Date.now()): boolean => proUntil != null && proUntil > now;

/** Template price for a buyer on `planId` (null = not Pro). Rounded up to whole taka. */
export function templatePrice(listPrice: number, planId: string | null): number {
  const plan = planId ? findPlan(planId) : undefined;
  if (!plan) return listPrice;
  return Math.ceil((listPrice * (100 - plan.templateOff)) / 100);
}
