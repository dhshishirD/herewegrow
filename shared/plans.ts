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

export interface Plan {
  id: PlanId;
  /** Price in BDT. */
  price: number;
  days: number;
  name: Bilingual;
  /** Template discount in percent (100 = all templates included). */
  templateOff: number;
  /** Free templates per month. */
  freeTemplatesPerMonth: number;
}

export const PLANS: Plan[] = [
  { id: 'pro-7', price: 49, days: 7, name: { en: 'Pro 7 days', bn: 'প্রো ৭ দিন' }, templateOff: 50, freeTemplatesPerMonth: 0 },
  { id: 'pro-30', price: 149, days: 30, name: { en: 'Pro 30 days', bn: 'প্রো ৩০ দিন' }, templateOff: 50, freeTemplatesPerMonth: 1 },
  { id: 'pro-365', price: 499, days: 365, name: { en: 'Pro 1 year', bn: 'প্রো ১ বছর' }, templateOff: 100, freeTemplatesPerMonth: 0 },
];

/** Limits that apply to every active Pro user. */
export const PRO_LIMITS = { savedCvs: 20, aiActionsPerDay: 30, templateDownloadsPerDay: 10 } as const;
export const FREE_LIMITS = { savedCvs: 1 } as const;

export const findPlan = (id: string): Plan | undefined => PLANS.find((p) => p.id === id);

/** New "Pro until" after buying `days`: added on top of any time left, else from now. */
export const extendPro = (proUntil: number | null, days: number, now = Date.now()): number =>
  Math.max(now, proUntil ?? 0) + days * DAY_MS;

export const isProActive = (proUntil: number | null, now = Date.now()): boolean => proUntil != null && proUntil > now;

/** Template price for a buyer on `planId` (null = not Pro). Rounded up to whole taka. */
export function templatePrice(listPrice: number, planId: PlanId | null): number {
  const plan = planId ? findPlan(planId) : undefined;
  if (!plan) return listPrice;
  return Math.ceil((listPrice * (100 - plan.templateOff)) / 100);
}
