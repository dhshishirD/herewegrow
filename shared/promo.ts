// Promo code rules shared by the server (which charges the price) and the browser (which only shows it).

import { CART_PRODUCT_ID } from './cart';
import { findProduct } from './catalog';
import { findPlan } from './plans';

/** Nobody pays less than this many taka for a paid item, however big the discount. */
export const MIN_PRICE = 10;

export type PromoType = 'percent' | 'fixed' | 'trial_days';
export type PromoScope = 'all' | 'pro' | 'template' | 'service';

export interface PriceRule {
  type: PromoType;
  value: number;
}

/** Price after a discount code: rounded up to whole taka, never below MIN_PRICE, never above the list price. */
export function discountedPrice(list: number, rule: PriceRule): number {
  if (rule.type === 'trial_days') return list;
  const off = rule.type === 'percent' ? Math.ceil((list * (100 - rule.value)) / 100) : list - rule.value;
  return Math.min(list, Math.max(MIN_PRICE, off));
}

/** Which kind of product a code is being used on. */
export function scopeFor(productId: string): Exclude<PromoScope, 'all'> {
  if (findPlan(productId)) return 'pro';
  if (productId === CART_PRODUCT_ID) return 'template';
  return findProduct(productId)?.kind === 'service' ? 'service' : 'template';
}
