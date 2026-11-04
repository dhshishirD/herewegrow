// Browser side of promo codes. The server decides every price; this only asks, shows and remembers.

export type PromoCheck =
  | { ok: true; kind: 'discount'; code: string; type: 'percent' | 'fixed'; value: number; list: number; price: number; discount: number }
  | { ok: true; kind: 'trial'; code: string; days: number }
  | { ok: false; error: string };

const post = async <T,>(path: string, body: unknown): Promise<T> => {
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: 'network' } as T;
  }
};

export const checkPromo = (code: string, productId: string, templateIds?: string[]) =>
  post<PromoCheck>('/api/promo/check', { code, productId, templateIds });

export const redeemTrial = (code: string) => post<{ ok: true; days: number; proUntil: number | null } | { ok: false; error: string }>('/api/promo/redeem', { code });

type B = { en: string; bn: string };

/** Plain messages for the error codes the server returns. */
export const PROMO_ERRORS: Record<string, B> = {
  invalid: { en: 'This code is not valid.', bn: 'এই কোডটি সঠিক নয়।' },
  expired: { en: 'This code has expired.', bn: 'এই কোডের মেয়াদ শেষ।' },
  scope: { en: 'This code does not work for this item.', bn: 'এই কোডটি এই পণ্যে চলবে না।' },
  used_up: { en: 'This code has been fully used.', bn: 'এই কোডটি আর ব্যবহার করা যাবে না।' },
  already_used: { en: 'You have already used this code.', bn: 'আপনি এই কোডটি আগেই ব্যবহার করেছেন।' },
  type: { en: 'This code cannot be used here.', bn: 'এই কোডটি এখানে ব্যবহার করা যাবে না।' },
  trial_used: { en: 'You have already had your free trial.', bn: 'আপনি আগেই ফ্রি ট্রায়াল নিয়েছেন।' },
  not_better: { en: 'Your current price is already lower than this code gives.', bn: 'আপনার বর্তমান মূল্য এই কোডের চেয়ে কম।' },
  rate: { en: 'Too many tries. Please wait a little and try again.', bn: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।' },
  login: { en: 'Please log in first.', bn: 'আগে লগইন করুন।' },
  network: { en: 'No connection. Please try again.', bn: 'সংযোগ নেই। আবার চেষ্টা করুন।' },
  generic: { en: 'Could not check the code. Please try again.', bn: 'কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।' },
};

const KEY = 'hwg_promo';

/** A link like /pro?promo=EID30 saves the code for this visit, so the Pro page and checkout can fill it in. */
export function capturePromoParam() {
  try {
    const code = new URLSearchParams(window.location.search).get('promo')?.trim().toUpperCase();
    if (code && /^[A-Z0-9][A-Z0-9-]{2,23}$/.test(code)) sessionStorage.setItem(KEY, code);
  } catch {
    // storage blocked: the link still works if the code is typed
  }
}

export const savedPromo = (): string => {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};
