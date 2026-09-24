export type ViralToolId = 
  | 'youtube-tags'
  | 'engagement-calculator'
  | 'hashtag-generator'
  | 'youtube-earnings'
  | 'bio-fonts'
  | 'post-preview';

export type SocialPlatform = 
  | 'all'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'telegram'
  | 'twitter'
  | 'spotify'
  | 'linkedin'
  | 'traffic'
  | 'discord'
  | 'pinterest'
  | 'soundcloud'
  | 'reddit'
  | 'reviews';

export type ServiceBadge = 
  | 'instant'
  | 'non-drop'
  | 'auto-refill'
  | 'best-seller'
  | 'high-retention'
  | 'bengali-target';

export interface SmmService {
  id: string;
  name: string;
  platform: SocialPlatform;
  category: string;
  ratePer1kBDT: number;
  ratePer1kUSD: number;
  minQty: number;
  maxQty: number;
  speed: string; // e.g. "10k - 50k / Day"
  refillDays: number; // e.g. 30, 60, 365, or 0
  badges: ServiceBadge[];
  description: string;
  guaranteeText?: string;
  providerServiceId?: number | string;
}

export interface GrowthBundle {
  id: string;
  title: string;
  platform: SocialPlatform;
  subtitle: string;
  iconName: string;
  priceBDT: number;
  priceUSD: number;
  originalPriceBDT: number;
  originalPriceUSD: number;
  savingsPercent: number;
  features: string[];
  isPopular?: boolean;
  deliveryTime: string;
}

export type OrderStatus = 'pending' | 'processing' | 'in_progress' | 'completed' | 'partial' | 'canceled';

export interface SmmOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  platform: SocialPlatform;
  link: string;
  quantity: number;
  chargeBDT: number;
  chargeUSD: number;
  currency: 'BDT' | 'USD';
  status: OrderStatus;
  startCount: number;
  currentCount: number;
  remains: number;
  createdAt: string;
  refillEligible: boolean;
  lastRefillDate?: string;
  providerOrderId?: string;
}

export interface PromoCode {
  id: string;
  code: string; // e.g. "WELCOME50", "GROW10"
  type: 'percentage' | 'fixed_bdt' | 'fixed_usd';
  value: number; // e.g. 10 for 10%, or 50 for ৳50
  minOrderBDT?: number;
  maxDiscountBDT?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiryDate?: string;
  description?: string;
}

export interface PromoDiscountResult {
  valid: boolean;
  message: string;
  discountBDT: number;
  discountUSD: number;
  finalCostBDT: number;
  finalCostUSD: number;
  promo?: PromoCode;
}

export interface UserWallet {
  balanceBDT: number;
  balanceUSD: number;
  totalSpentBDT: number;
  totalSpentUSD: number;
  currencyPreference: 'BDT' | 'USD';
  affiliateCode: string;
  affiliateEarningsBDT: number;
  referralsCount: number;
}

export type AffiliateTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AffiliateProfile {
  id: string;
  code: string;
  name: string;
  email?: string;
  phoneOrBkash: string;
  institution?: string; // Student campus / university
  tier: AffiliateTier;
  commissionRate: number; // e.g. 0.15 = 15%
  totalClicks: number;
  totalSales: number;
  grossSalesBDT: number;
  totalEarningsBDT: number;
  pendingPayoutBDT: number;
  withdrawnBDT: number;
  createdAt: string;
  customNotes?: string;
}

export interface AffiliatePayoutRequest {
  id: string;
  affiliateCode: string;
  affiliateName: string;
  amountBDT: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'binance';
  accountNumber: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  adminTrxId?: string;
}

export interface MotivationalQuote {
  id: string;
  quoteEn: string;
  quoteBn: string;
  author: string;
  category: 'hustle' | 'mindset' | 'growth' | 'consistency';
}
