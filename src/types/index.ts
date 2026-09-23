export type ViralToolId = 
  | 'tiktok-downloader'
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
  | 'linkedin';

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
