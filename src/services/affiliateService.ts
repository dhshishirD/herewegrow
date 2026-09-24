import type { AffiliateProfile, AffiliatePayoutRequest, MotivationalQuote, AffiliateTier } from '../types';

/**
 * Dedicated Student Affiliate & Reseller Partner Engine for HereWeGrow
 */

const AFFILIATE_PROFILE_KEY = 'hwg_affiliate_current_user_v2';
const ALL_AFFILIATES_KEY = 'hwg_all_affiliates_master_v2';
const PAYOUT_REQUESTS_KEY = 'hwg_affiliate_payout_requests_v2';
const REFERRER_TRACKING_KEY = 'hwg_active_referrer_code';

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'q1',
    quoteEn: 'Small daily efforts compound into massive financial freedom. Keep pushing!',
    quoteBn: 'প্রতিদিনের ছোট ছোট চেষ্টা একদিন বিশাল সফলতায় রূপ নেয়। থেমে থেকো না!',
    author: 'Student Hustle Mantra',
    category: 'consistency'
  },
  {
    id: 'q2',
    quoteEn: 'Don’t wait for opportunities, create them with every link you share today.',
    quoteBn: 'সুযোগের অপেক্ষায় বসে না থেকে প্রতিটি সুযোগ নিজে তৈরি করে নাও।',
    author: 'Digital Entrepreneurship',
    category: 'hustle'
  },
  {
    id: 'q3',
    quoteEn: 'Your student years are not just for exams — they are the launchpad for your independent digital income.',
    quoteBn: 'ছাত্রজীবন শুধু পরীক্ষার জন্য নয় — এটি তোমার স্বাবলম্বী হওয়ার সেরা প্ল্যাটফর্ম।',
    author: 'Campus Leader Mindset',
    category: 'growth'
  },
  {
    id: 'q4',
    quoteEn: 'Every expert was once a beginner who refused to quit.',
    quoteBn: 'প্রত্যেক সফল ব্যক্তি একসময় একজন সাধারণ শিক্ষানবিস ছিলেন যিনি কখনো হাল ছাড়েননি।',
    author: 'Robin Sharma',
    category: 'mindset'
  },
  {
    id: 'q5',
    quoteEn: 'The secret to getting ahead is getting started. Today is your day!',
    quoteBn: 'এগিয়ে যাওয়ার গোপন রহস্য হলো এখনই শুরু করে দেয়া। আজকের দিনটি তোমার!',
    author: 'Mark Twain',
    category: 'hustle'
  },
  {
    id: 'q6',
    quoteEn: 'Earn while you learn. One satisfied client can bring you 10 more referrals.',
    quoteBn: 'পড়াশোনার পাশাপাশি আয় করো। একজন সন্তুষ্ট কাস্টমার তোমাকে আরও ১০ জন এনে দেবে।',
    author: 'Reseller Wisdom',
    category: 'growth'
  },
  {
    id: 'q7',
    quoteEn: 'Work hard in silence, let your bKash notifications make the noise.',
    quoteBn: 'নীরবে পরিশ্রম করে যাও, তোমার বিকাশ পেমেন্ট এসএমএস-ই তোমার সাফল্যের গল্প বলবে।',
    author: 'Bangladeshi Youth Hustle',
    category: 'hustle'
  },
  {
    id: 'q8',
    quoteEn: 'Success is the sum of small marketing efforts repeated day in and day out.',
    quoteBn: 'সাফল্য হলো প্রতিদিনের নিয়মিত ছোট ছোট প্রচার ও পরিশ্রমের সমষ্টি।',
    author: 'Robert Collier',
    category: 'consistency'
  }
];

export const getRandomMotivationalQuote = (): MotivationalQuote => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
};

export const getDailyMotivationalQuote = (): MotivationalQuote => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};

// Affiliates Storage

export const getAllAffiliates = (): AffiliateProfile[] => {
  try {
    const saved = localStorage.getItem(ALL_AFFILIATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveAllAffiliates = (affiliates: AffiliateProfile[]): void => {
  try {
    localStorage.setItem(ALL_AFFILIATES_KEY, JSON.stringify(affiliates));
  } catch (e) {
    console.error(e);
  }
};

export const isAffiliateRegistered = (): boolean => {
  try {
    const saved = localStorage.getItem(AFFILIATE_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Boolean(parsed && typeof parsed === 'object' && parsed.name && parsed.code && parsed.phoneOrBkash);
    }
  } catch {}
  return false;
};

export const registerAffiliateAccount = (params: {
  name: string;
  phoneOrBkash: string;
  institution?: string;
  customCode?: string;
  email?: string;
}): AffiliateProfile => {
  const cleanCode = (params.customCode && params.customCode.trim().length >= 3)
    ? params.customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    : 'HWG-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const newProfile: AffiliateProfile = {
    id: 'AFF-' + Math.floor(1000 + Math.random() * 9000),
    code: cleanCode,
    name: params.name.trim(),
    email: params.email?.trim() || '',
    phoneOrBkash: params.phoneOrBkash.trim(),
    institution: params.institution?.trim() || 'Student Ambassador',
    tier: 'bronze',
    commissionRate: 0.15, // 15% starting rate
    totalClicks: 0,
    totalSales: 0,
    grossSalesBDT: 0,
    totalEarningsBDT: 0,
    pendingPayoutBDT: 0,
    withdrawnBDT: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };

  saveCurrentAffiliateProfile(newProfile);
  return newProfile;
};

export const getCurrentAffiliateProfile = (): AffiliateProfile | null => {
  try {
    const saved = localStorage.getItem(AFFILIATE_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.code && parsed.phoneOrBkash) {
        return {
          id: parsed.id || 'AFF-USER',
          code: parsed.code || 'HWG-PARTNER',
          name: parsed.name || 'Partner',
          email: parsed.email || '',
          phoneOrBkash: parsed.phoneOrBkash || '',
          institution: parsed.institution || 'Campus Ambassador',
          tier: parsed.tier || 'bronze',
          commissionRate: parsed.commissionRate || 0.15,
          totalClicks: Number(parsed.totalClicks) || 0,
          totalSales: Number(parsed.totalSales) || 0,
          grossSalesBDT: Number(parsed.grossSalesBDT) || 0,
          totalEarningsBDT: Number(parsed.totalEarningsBDT) || 0,
          pendingPayoutBDT: Number(parsed.pendingPayoutBDT) || 0,
          withdrawnBDT: Number(parsed.withdrawnBDT) || 0,
          createdAt: parsed.createdAt || new Date().toISOString().split('T')[0]
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
  
  return null;
};

export const saveCurrentAffiliateProfile = (profile: AffiliateProfile): void => {
  try {
    localStorage.setItem(AFFILIATE_PROFILE_KEY, JSON.stringify(profile));
    
    // Also sync in master affiliates list
    const all = getAllAffiliates();
    const index = all.findIndex(a => a && (a.id === profile.id || a.code === profile.code));
    if (index !== -1) {
      all[index] = profile;
    } else {
      all.unshift(profile);
    }
    saveAllAffiliates(all);
  } catch (e) {
    console.error(e);
  }
};

/**
 * Capture referral visit from URL (e.g. ?ref=CODE)
 */
export const captureReferralCodeFromUrl = (): string | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('aff') || params.get('referrer');
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase();
      localStorage.setItem(REFERRER_TRACKING_KEY, cleanRef);
      
      // Increment clicks on affiliate profile
      const all = getAllAffiliates();
      const aff = all.find(a => a && a.code && a.code.toUpperCase() === cleanRef);
      if (aff) {
        aff.totalClicks = (aff.totalClicks || 0) + 1;
        saveAllAffiliates(all);
        
        const current = getCurrentAffiliateProfile();
        if (current && current.code && current.code.toUpperCase() === cleanRef) {
          current.totalClicks = (current.totalClicks || 0) + 1;
          saveCurrentAffiliateProfile(current);
        }
      }
      return cleanRef;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const getActiveReferrerCode = (): string | null => {
  try {
    return localStorage.getItem(REFERRER_TRACKING_KEY);
  } catch {
    return null;
  }
};

/**
 * Record a sale and credit affiliate commission instantly
 */
export const creditAffiliateOnOrder = (amountBDT: number): { credited: boolean; commissionBDT: number; affiliateCode?: string } => {
  const refCode = getActiveReferrerCode();
  if (!refCode || amountBDT <= 0) {
    return { credited: false, commissionBDT: 0 };
  }

  const all = getAllAffiliates();
  const aff = all.find(a => a && a.code && a.code.toUpperCase() === refCode.toUpperCase());
  if (!aff) {
    return { credited: false, commissionBDT: 0 };
  }

  const commissionRate = aff.commissionRate || 0.15;
  const commissionBDT = Math.round(amountBDT * commissionRate * 100) / 100;

  aff.totalSales = (aff.totalSales || 0) + 1;
  aff.grossSalesBDT = (aff.grossSalesBDT || 0) + amountBDT;
  aff.totalEarningsBDT = (aff.totalEarningsBDT || 0) + commissionBDT;
  aff.pendingPayoutBDT = (aff.pendingPayoutBDT || 0) + commissionBDT;

  // Tier Auto-Progression
  if (aff.totalSales >= 50) {
    aff.tier = 'diamond';
    aff.commissionRate = 0.25; // 25%
  } else if (aff.totalSales >= 20) {
    aff.tier = 'gold';
    aff.commissionRate = 0.20; // 20%
  } else if (aff.totalSales >= 5) {
    aff.tier = 'silver';
    aff.commissionRate = 0.15; // 15%
  }

  saveAllAffiliates(all);

  const current = getCurrentAffiliateProfile();
  if (current && current.code && aff.code && current.code.toUpperCase() === aff.code.toUpperCase()) {
    saveCurrentAffiliateProfile(aff);
  }

  return {
    credited: true,
    commissionBDT,
    affiliateCode: aff.code
  };
};

/**
 * Payout Requests Management
 */
export const getPayoutRequests = (): AffiliatePayoutRequest[] => {
  try {
    const saved = localStorage.getItem(PAYOUT_REQUESTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const savePayoutRequests = (reqs: AffiliatePayoutRequest[]): void => {
  try {
    localStorage.setItem(PAYOUT_REQUESTS_KEY, JSON.stringify(reqs));
  } catch (e) {
    console.error(e);
  }
};

export const submitPayoutRequest = (
  amountBDT: number,
  method: 'bkash' | 'nagad' | 'rocket' | 'binance',
  accountNumber: string
): { success: boolean; message: string; request?: AffiliatePayoutRequest } => {
  const current = getCurrentAffiliateProfile();
  if (!current) {
    return { success: false, message: 'Please register your affiliate profile first.' };
  }

  if (amountBDT < 100) {
    return { success: false, message: 'Minimum payout withdrawal is ৳100 BDT.' };
  }

  if (amountBDT > current.pendingPayoutBDT) {
    return { success: false, message: `Insufficient pending balance. You have ৳${current.pendingPayoutBDT.toFixed(2)} available.` };
  }

  const newReq: AffiliatePayoutRequest = {
    id: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
    affiliateCode: current.code,
    affiliateName: current.name,
    amountBDT,
    method,
    accountNumber,
    status: 'pending',
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  current.pendingPayoutBDT -= amountBDT;
  saveCurrentAffiliateProfile(current);

  const reqs = getPayoutRequests();
  savePayoutRequests([newReq, ...reqs]);

  return {
    success: true,
    message: `✓ Payout request of ৳${amountBDT} submitted! Funds will be sent to your ${method.toUpperCase()} (${accountNumber}) shortly.`,
    request: newReq
  };
};

/**
 * Super Admin: 1-Click Approve Payout Request
 */
export const adminApprovePayout = (requestId: string, adminTrxId: string = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase()): { success: boolean; message: string } => {
  const reqs = getPayoutRequests();
  const req = reqs.find(r => r.id === requestId);
  if (!req) return { success: false, message: 'Request not found.' };

  req.status = 'completed';
  req.processedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  req.adminTrxId = adminTrxId;
  savePayoutRequests(reqs);

  // Update affiliate profile's withdrawn counter
  const all = getAllAffiliates();
  const aff = all.find(a => a && a.code === req.affiliateCode);
  if (aff) {
    aff.withdrawnBDT = (aff.withdrawnBDT || 0) + req.amountBDT;
    saveAllAffiliates(all);
    const current = getCurrentAffiliateProfile();
    if (current && current.code === aff.code) {
      current.withdrawnBDT = (current.withdrawnBDT || 0) + req.amountBDT;
      saveCurrentAffiliateProfile(current);
    }
  }

  return {
    success: true,
    message: `✓ Payout #${requestId} (৳${req.amountBDT}) marked as COMPLETED via TrxID: ${adminTrxId}!`
  };
};

/**
 * Super Admin: Send Performance Bonus / Reward to Affiliate
 */
export const adminSendBonusReward = (affiliateCode: string, bonusAmountBDT: number, note: string = 'Top Performer Bonus'): { success: boolean; message: string } => {
  const all = getAllAffiliates();
  const aff = all.find(a => a && a.code && a.code.toUpperCase() === affiliateCode.toUpperCase());
  if (!aff) return { success: false, message: 'Affiliate not found.' };

  aff.totalEarningsBDT = (aff.totalEarningsBDT || 0) + bonusAmountBDT;
  aff.pendingPayoutBDT = (aff.pendingPayoutBDT || 0) + bonusAmountBDT;
  aff.customNotes = (aff.customNotes ? aff.customNotes + ' | ' : '') + `Bonus +৳${bonusAmountBDT} (${note})`;
  saveAllAffiliates(all);

  const current = getCurrentAffiliateProfile();
  if (current && current.code && aff.code && current.code.toUpperCase() === aff.code.toUpperCase()) {
    current.totalEarningsBDT = (current.totalEarningsBDT || 0) + bonusAmountBDT;
    current.pendingPayoutBDT = (current.pendingPayoutBDT || 0) + bonusAmountBDT;
    saveCurrentAffiliateProfile(current);
  }

  return {
    success: true,
    message: `✓ Reward of +৳${bonusAmountBDT} injected for Affiliate "${aff.name}" (${aff.code})!`
  };
};

/**
 * Super Admin: Update Affiliate Commission Rate & Tier
 */
export const adminUpdateAffiliateTier = (affiliateCode: string, tier: AffiliateTier, rate: number): { success: boolean; message: string } => {
  const all = getAllAffiliates();
  const aff = all.find(a => a && a.code && a.code.toUpperCase() === affiliateCode.toUpperCase());
  if (!aff) return { success: false, message: 'Affiliate not found.' };

  aff.tier = tier;
  aff.commissionRate = rate;
  saveAllAffiliates(all);

  const current = getCurrentAffiliateProfile();
  if (current && current.code && aff.code && current.code.toUpperCase() === aff.code.toUpperCase()) {
    current.tier = tier;
    current.commissionRate = rate;
    saveCurrentAffiliateProfile(current);
  }

  return {
    success: true,
    message: `✓ Updated "${aff.name}" to ${tier.toUpperCase()} Tier with ${(rate * 100).toFixed(0)}% Commission!`
  };
};
