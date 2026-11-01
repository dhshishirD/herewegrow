// Volume pricing for templates bought together.
// The browser uses this to show prices; the server uses the same function to set the amount charged.
//
// Rules, in order:
// 1. Each template is ৳39. The more you pick, the bigger the discount on every one (TIERS).
// 2. If every template picked is in one sector pack and that pack is cheaper, you get the whole pack.
// 3. You never pay more than the Best 40 price; at that point you get all 40.
// The total never goes down when a template is added.

import { findProduct, type Bilingual, type Product } from './catalog';
import { SINGLE_TEMPLATE_PRICE, findTemplate } from './templates';

export const CART_PRODUCT_ID = 'cart';

/** Discount on every template, by how many are in the cart. */
export const TIERS: { min: number; off: number }[] = [
  { min: 1, off: 0 },
  { min: 2, off: 10 },
  { min: 3, off: 20 },
  { min: 5, off: 30 },
  { min: 8, off: 35 },
];

const SECTOR_PACKS = ['pack-fresher', 'pack-bank', 'pack-engineering', 'pack-sales'];
const ALL_PACK = 'pack-best-40';

export const tierFor = (n: number) => [...TIERS].reverse().find((t) => n >= t.min) ?? TIERS[0];
export const nextTier = (n: number) => TIERS.find((t) => t.min > n);

/** Price for n templates at the tier rate, before any pack upgrade. */
export const tierTotal = (n: number) => (n <= 0 ? 0 : Math.round(n * SINGLE_TEMPLATE_PRICE * (1 - tierFor(n).off / 100)));

export interface CartQuote {
  /** Template ids, cleaned: known templates only, no repeats. */
  ids: string[];
  count: number;
  /** What the same templates cost one by one. */
  listTotal: number;
  /** What the buyer pays. */
  total: number;
  savings: number;
  /** Savings as a whole percentage of listTotal. */
  percent: number;
  /** Set when the cart is better bought as a pack (sector pack or Best 40). */
  upgrade?: Product;
}

export function quoteCart(rawIds: string[]): CartQuote {
  const ids = [...new Set(rawIds)].filter((id) => !!findTemplate(id));
  const count = ids.length;
  const listTotal = count * SINGLE_TEMPLATE_PRICE;
  let total = tierTotal(count);
  let upgrade: Product | undefined;

  if (count > 1) {
    for (const packId of SECTOR_PACKS) {
      const pack = findProduct(packId);
      if (pack?.templates && ids.every((id) => pack.templates!.includes(id)) && pack.price < total) {
        total = pack.price;
        upgrade = pack;
      }
    }
  }
  const all = findProduct(ALL_PACK);
  if (all && count > 0 && all.price <= total) {
    total = all.price;
    upgrade = all;
  }

  const savings = Math.max(0, listTotal - total);
  return { ids, count, listTotal, total, savings, percent: listTotal ? Math.round((savings / listTotal) * 100) : 0, upgrade };
}

/** The product a cart is charged and delivered as. */
export function cartProduct(q: CartQuote): Product {
  if (q.upgrade) return q.upgrade;
  if (q.count === 1) return findProduct(`tpl-${q.ids[0]}`)!;
  const name: Bilingual = { en: `${q.count} CV templates`, bn: `${q.count.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])}টি সিভি টেমপ্লেট` };
  return {
    id: CART_PRODUCT_ID,
    kind: 'template',
    name,
    summary: { en: 'Your chosen templates.', bn: 'আপনার বেছে নেওয়া টেমপ্লেট।' },
    includes: [],
    price: q.total,
    delivery: { en: 'Instant download after payment', bn: 'পেমেন্টের পরই সাথে সাথে ডাউনলোড' },
    files: q.ids.map((id) => `${id}.docx`),
    templates: q.ids,
  };
}
