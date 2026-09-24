import type { PromoCode, PromoDiscountResult } from '../types';

const PROMO_STORAGE_KEY = 'herewegrow_promo_codes_v1';

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'GROW10',
    type: 'percentage',
    value: 10,
    isActive: true,
    usedCount: 0,
    description: '10% Discount on any social growth package'
  },
  {
    id: 'promo-2',
    code: 'WELCOME50',
    type: 'fixed_bdt',
    value: 50,
    minOrderBDT: 150,
    isActive: true,
    usedCount: 0,
    description: '৳50 Off on orders above ৳150'
  },
  {
    id: 'promo-3',
    code: 'VIPCREATOR',
    type: 'percentage',
    value: 20,
    minOrderBDT: 500,
    isActive: true,
    usedCount: 0,
    description: '20% VIP Creator Discount'
  },
  {
    id: 'promo-4',
    code: 'FREETEST',
    type: 'fixed_bdt',
    value: 100,
    isActive: true,
    usedCount: 0,
    description: '৳100 Free Trial Credit Voucher'
  }
];

export const getPromoCodes = (): PromoCode[] => {
  try {
    const saved = localStorage.getItem(PROMO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading promo codes:', e);
  }
  return DEFAULT_PROMO_CODES;
};

export const savePromoCodes = (codes: PromoCode[]): void => {
  try {
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(codes));
  } catch (e) {
    console.error('Error saving promo codes:', e);
  }
};

/**
 * Validate and calculate discount for a given promo code
 */
export const validateAndApplyPromo = (
  codeStr: string,
  rawCost: number,
  currency: 'BDT' | 'USD'
): PromoDiscountResult => {
  const cleanCode = codeStr.trim().toUpperCase();
  if (!cleanCode) {
    return {
      valid: false,
      message: 'Please enter a coupon or promo code.',
      discountBDT: 0,
      discountUSD: 0,
      finalCostBDT: currency === 'BDT' ? rawCost : rawCost * 122,
      finalCostUSD: currency === 'USD' ? rawCost : rawCost / 122
    };
  }

  const allPromos = getPromoCodes();
  const promo = allPromos.find(p => p && p.code && p.code.toUpperCase() === cleanCode);

  if (!promo) {
    return {
      valid: false,
      message: `Invalid promo code "${cleanCode}". Please check spelling.`,
      discountBDT: 0,
      discountUSD: 0,
      finalCostBDT: currency === 'BDT' ? rawCost : rawCost * 122,
      finalCostUSD: currency === 'USD' ? rawCost : rawCost / 122
    };
  }

  if (!promo.isActive) {
    return {
      valid: false,
      message: `Promo code "${cleanCode}" is currently inactive or expired.`,
      discountBDT: 0,
      discountUSD: 0,
      finalCostBDT: currency === 'BDT' ? rawCost : rawCost * 122,
      finalCostUSD: currency === 'USD' ? rawCost : rawCost / 122
    };
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return {
      valid: false,
      message: `Promo code "${cleanCode}" has reached its maximum usage limit.`,
      discountBDT: 0,
      discountUSD: 0,
      finalCostBDT: currency === 'BDT' ? rawCost : rawCost * 122,
      finalCostUSD: currency === 'USD' ? rawCost : rawCost / 122
    };
  }

  // Convert rawCost to BDT for consistent comparison
  const costBDT = currency === 'BDT' ? rawCost : rawCost * 122;

  if (promo.minOrderBDT && costBDT < promo.minOrderBDT) {
    return {
      valid: false,
      message: `Code "${cleanCode}" requires a minimum order of ৳${promo.minOrderBDT}.`,
      discountBDT: 0,
      discountUSD: 0,
      finalCostBDT: costBDT,
      finalCostUSD: costBDT / 122
    };
  }

  let discountBDT = 0;

  if (promo.type === 'percentage') {
    discountBDT = (costBDT * promo.value) / 100;
    if (promo.maxDiscountBDT && discountBDT > promo.maxDiscountBDT) {
      discountBDT = promo.maxDiscountBDT;
    }
  } else if (promo.type === 'fixed_bdt') {
    discountBDT = promo.value;
  } else if (promo.type === 'fixed_usd') {
    discountBDT = promo.value * 122;
  }

  // Ensure discount does not exceed total cost
  discountBDT = Math.min(discountBDT, costBDT);
  const discountUSD = Number((discountBDT / 122).toFixed(2));
  const finalCostBDT = Number(Math.max(0, costBDT - discountBDT).toFixed(2));
  const finalCostUSD = Number(Math.max(0, (costBDT - discountBDT) / 122).toFixed(2));

  return {
    valid: true,
    message: `✓ Promo Code "${cleanCode}" applied successfully! You saved ৳${discountBDT.toFixed(0)} ($${discountUSD.toFixed(2)})`,
    discountBDT,
    discountUSD,
    finalCostBDT,
    finalCostUSD,
    promo
  };
};

/**
 * Record single usage of promo code
 */
export const recordPromoUsage = (promoId: string): void => {
  const codes = getPromoCodes();
  const target = codes.find(c => c.id === promoId);
  if (target) {
    target.usedCount += 1;
    savePromoCodes(codes);
  }
};

/**
 * Admin: Add new Promo Code
 */
export const adminCreatePromoCode = (
  newCode: Omit<PromoCode, 'id' | 'usedCount'>
): PromoCode => {
  const codes = getPromoCodes();
  const created: PromoCode = {
    ...newCode,
    id: 'promo-' + Date.now(),
    code: newCode.code.trim().toUpperCase(),
    usedCount: 0
  };
  savePromoCodes([created, ...codes]);
  return created;
};

/**
 * Admin: Delete Promo Code
 */
export const adminDeletePromoCode = (promoId: string): void => {
  const codes = getPromoCodes();
  const filtered = codes.filter(c => c.id !== promoId);
  savePromoCodes(filtered);
};

/**
 * Admin: Toggle Promo Active Status
 */
export const adminTogglePromoActive = (promoId: string): boolean => {
  const codes = getPromoCodes();
  const target = codes.find(c => c.id === promoId);
  if (!target) return false;
  target.isActive = !target.isActive;
  savePromoCodes(codes);
  return target.isActive;
};
