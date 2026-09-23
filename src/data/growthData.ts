import type { SmmService, GrowthBundle } from '../types';

export const PLATFORMS_META = [
  { id: 'all', name: 'All Services', icon: 'Sparkles', color: 'from-cyan-500 to-indigo-500' },
  { id: 'facebook', name: 'Facebook', icon: 'Users', color: 'from-blue-600 to-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: 'Play', color: 'from-red-600 to-red-700' },
  { id: 'instagram', name: 'Instagram', icon: 'Camera', color: 'from-pink-600 to-purple-600' },
  { id: 'tiktok', name: 'TikTok', icon: 'Video', color: 'from-cyan-400 to-pink-500' },
  { id: 'telegram', name: 'Telegram', icon: 'Send', color: 'from-sky-500 to-blue-600' },
  { id: 'twitter', name: 'Twitter / X', icon: 'Twitter', color: 'from-slate-700 to-slate-900' },
  { id: 'spotify', name: 'Spotify', icon: 'Music', color: 'from-emerald-500 to-green-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Briefcase', color: 'from-blue-700 to-cyan-700' },
] as const;

export const VIRAL_TOOLS_META = [
  {
    id: 'tiktok-downloader',
    title: 'TikTok & Reels Downloader',
    badge: '100% Free & No Watermark',
    description: 'Download clean HD TikTok videos & Instagram Reels without watermarks directly to your phone or PC.',
    icon: 'Video',
    category: 'Media Tools'
  },
  {
    id: 'youtube-tags',
    title: 'YouTube Tag & SEO Extractor',
    badge: 'Boost Video Rankings',
    description: 'Extract top-ranking competitor tags, keywords, and SEO metadata from any public YouTube URL.',
    icon: 'Tag',
    category: 'SEO Tools'
  },
  {
    id: 'engagement-calculator',
    title: 'Social Engagement Calculator',
    badge: 'Audit Influencer Worth',
    description: 'Calculate real Engagement Rate (ER%), average interaction quality, and viral score benchmarks.',
    icon: 'BarChart2',
    category: 'Analytics'
  },
  {
    id: 'hashtag-generator',
    title: 'AI Viral Hashtag Generator',
    badge: 'Explore Page Trigger',
    description: 'Generate niche-targeted hashtags with low, medium, and viral reach metrics for TikTok & Instagram.',
    icon: 'Hash',
    category: 'AI Growth'
  },
  {
    id: 'youtube-earnings',
    title: 'YouTube Earnings & AdSense Calculator',
    badge: 'Revenue Estimator',
    description: 'Estimate daily, monthly, and annual YouTube ad income based on views and niche CPM rates.',
    icon: 'DollarSign',
    category: 'Monetization'
  },
  {
    id: 'bio-fonts',
    title: 'Instagram Bio & Fancy Font Generator',
    badge: '12+ Aesthetic Styles',
    description: 'Transform regular text into aesthetic cursive, gothic, bold, and bubble Unicode fonts for bios.',
    icon: 'Type',
    category: 'Creative'
  },
  {
    id: 'post-preview',
    title: 'Social Post Feed Previewer',
    badge: 'Visualizer',
    description: 'Preview exactly how your thumbnail, title, and caption will appear in Facebook & Instagram feeds.',
    icon: 'Eye',
    category: 'Design'
  }
] as const;

export const CURATED_GROWTH_BUNDLES: GrowthBundle[] = [
  {
    id: 'f-commerce-trust-pack',
    title: 'F-Commerce Trust & Sales Booster Pack',
    platform: 'facebook',
    subtitle: 'Designed specifically for Bangladeshi online shops to establish instant customer trust.',
    iconName: 'ShoppingBag',
    priceBDT: 1150,
    priceUSD: 9.50,
    originalPriceBDT: 2200,
    originalPriceUSD: 18.00,
    savingsPercent: 48,
    features: [
      '3,000 Real & Active Bangladeshi Page Likes / Followers',
      '500 Post Reactions (Like, Love, Care mix on recent posts)',
      '20 Custom Positive Bengali Review Comments',
      '⭐ 100% Non-Drop Guaranteed with 60-Day Auto-Refill',
      '⚡ Starts within 15 Minutes after bKash payment'
    ],
    isPopular: true,
    deliveryTime: '24 - 48 Hours'
  },
  {
    id: 'youtube-monetization-pack',
    title: 'YouTube Partner Monetization Fast-Track',
    platform: 'youtube',
    subtitle: 'Complete watch-time and subscriber package to qualify for YouTube YPP AdSense monetization.',
    iconName: 'Youtube',
    priceBDT: 6800,
    priceUSD: 55.00,
    originalPriceBDT: 11500,
    originalPriceUSD: 94.00,
    savingsPercent: 41,
    features: [
      '1,000 High-Quality Permanent YouTube Subscribers',
      '4,000 High-Retention Watch Hours (Long-form video compliant)',
      'Safe for Channel Monetization & Ads (Organic drip-speed)',
      '🛡️ Lifetime Refill Protection Guarantee',
      '📊 Live Progress Tracking Dashboard'
    ],
    isPopular: true,
    deliveryTime: '3 - 6 Days (Safe Drip)'
  },
  {
    id: 'tiktok-viral-launch',
    title: 'TikTok Viral Algorithm Kick-Starter',
    platform: 'tiktok',
    subtitle: 'Trigger the TikTok FYP (For You Page) recommendation algorithm with high early velocity.',
    iconName: 'Flame',
    priceBDT: 450,
    priceUSD: 3.80,
    originalPriceBDT: 900,
    originalPriceUSD: 7.50,
    savingsPercent: 50,
    features: [
      '25,000 Ultra-Fast TikTok Video Views',
      '1,000 Authentic TikTok Video Likes',
      '200 Video Shares & Bookmarks (Key viral metric)',
      '⚡ Instant Start within 60 Seconds',
      '📈 Boosts FYP recommendation score'
    ],
    deliveryTime: '1 - 3 Hours'
  },
  {
    id: 'instagram-influencer-starter',
    title: 'Instagram Influencer Credibility Pack',
    platform: 'instagram',
    subtitle: 'Elevate your personal brand or agency profile to secure high-paying sponsorships.',
    iconName: 'Instagram',
    priceBDT: 850,
    priceUSD: 7.00,
    originalPriceBDT: 1600,
    originalPriceUSD: 13.00,
    savingsPercent: 46,
    features: [
      '2,500 Premium High-Quality Instagram Followers',
      '500 Reel Likes + 5,000 Reel Views',
      '100 Saves and Profile Visits',
      '🛡️ 30-Day Auto-Refill Button Active',
      '✨ Clean profile aesthetics with zero bot drop'
    ],
    deliveryTime: '6 - 12 Hours'
  }
];

export const SMM_SERVICES_CATALOG: SmmService[] = [
  // FACEBOOK
  {
    id: 'fb-001',
    name: 'Facebook Page Likes & Followers [100% BD Bengali Real Targeted]',
    platform: 'facebook',
    category: 'Facebook Page Growth',
    ratePer1kBDT: 320,
    ratePer1kUSD: 2.65,
    minQty: 100,
    maxQty: 50000,
    speed: '2k - 5k / Day',
    refillDays: 60,
    badges: ['bengali-target', 'non-drop', 'best-seller', 'auto-refill'],
    description: 'High-quality real Bangladeshi user profiles with authentic profile photos. Ideal for local F-commerce pages, brands, and public figures.',
    guaranteeText: '60 Days Non-Drop Refill Guarantee'
  },
  {
    id: 'fb-002',
    name: 'Facebook Post Reactions [Like + Love + Care Mix] - Instant',
    platform: 'facebook',
    category: 'Facebook Engagement',
    ratePer1kBDT: 85,
    ratePer1kUSD: 0.70,
    minQty: 50,
    maxQty: 100000,
    speed: 'Instant (10k/Hour)',
    refillDays: 30,
    badges: ['instant', 'non-drop'],
    description: 'Natural blend of Facebook post reactions. Works on public photos, videos, and statuses.'
  },
  {
    id: 'fb-003',
    name: 'Facebook Video Views / Reels Views [High Watch Time]',
    platform: 'facebook',
    category: 'Facebook Video',
    ratePer1kBDT: 40,
    ratePer1kUSD: 0.33,
    minQty: 500,
    maxQty: 500000,
    speed: '50k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention'],
    description: 'Monetization-safe video views with 60-second+ watch duration. Helps boost Facebook in-stream ad eligibility.'
  },
  
  // YOUTUBE
  {
    id: 'yt-001',
    name: 'YouTube Monetization Watch Hours [4000 Hours Package or Custom]',
    platform: 'youtube',
    category: 'YouTube Monetization',
    ratePer1kBDT: 1550,
    ratePer1kUSD: 12.80,
    minQty: 500,
    maxQty: 4000,
    speed: '500 - 1000 Hours / Day',
    refillDays: 365,
    badges: ['high-retention', 'non-drop', 'best-seller', 'auto-refill'],
    description: 'Tested and 100% compliant with YouTube Partner Program (YPP) requirements. Requires video length of 15+ minutes.',
    guaranteeText: '1 Year 100% Replacement Guarantee'
  },
  {
    id: 'yt-002',
    name: 'YouTube Permanent Subscribers [Non-Drop & Real Channel Profiles]',
    platform: 'youtube',
    category: 'YouTube Growth',
    ratePer1kBDT: 950,
    ratePer1kUSD: 7.80,
    minQty: 100,
    maxQty: 20000,
    speed: '200 - 500 / Day (Safe Speed)',
    refillDays: 90,
    badges: ['non-drop', 'best-seller', 'auto-refill'],
    description: 'Steady, organic-looking subscriber delivery that sticks permanently on YouTube Studio analytics.'
  },
  {
    id: 'yt-003',
    name: 'YouTube High-Retention Views [Google Ads & Suggested Video Source]',
    platform: 'youtube',
    category: 'YouTube Video Views',
    ratePer1kBDT: 190,
    ratePer1kUSD: 1.55,
    minQty: 500,
    maxQty: 1000000,
    speed: '10k - 50k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention'],
    description: 'High watch duration (3–5 minutes) views derived from suggested video algorithms. Safe for AdSense.'
  },

  // INSTAGRAM
  {
    id: 'ig-001',
    name: 'Instagram Premium Followers [Guaranteed Non-Drop with Refill]',
    platform: 'instagram',
    category: 'Instagram Followers',
    ratePer1kBDT: 140,
    ratePer1kUSD: 1.15,
    minQty: 100,
    maxQty: 200000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['instant', 'non-drop', 'best-seller', 'auto-refill'],
    description: 'High-quality Instagram followers with bio and posts. 1-Click auto-refill enabled.'
  },
  {
    id: 'ig-002',
    name: 'Instagram Reels Views + Reach & Impressions Boost',
    platform: 'instagram',
    category: 'Instagram Reels',
    ratePer1kBDT: 25,
    ratePer1kUSD: 0.20,
    minQty: 1000,
    maxQty: 10000000,
    speed: '100k / Hour',
    refillDays: 0,
    badges: ['instant', 'high-retention'],
    description: 'Ultra-fast delivery for viral Instagram Reels. Triggers the Instagram algorithm.'
  },
  {
    id: 'ig-003',
    name: 'Instagram Post Likes [Real Active Profiles + Instant Delivery]',
    platform: 'instagram',
    category: 'Instagram Likes',
    ratePer1kBDT: 50,
    ratePer1kUSD: 0.40,
    minQty: 50,
    maxQty: 50000,
    speed: 'Instant (20k/Hour)',
    refillDays: 30,
    badges: ['instant', 'best-seller'],
    description: 'Immediate like injection within 30 seconds of posting.'
  },

  // TIKTOK
  {
    id: 'tt-001',
    name: 'TikTok Video Views [Ultra-Speed Instant Server]',
    platform: 'tiktok',
    category: 'TikTok Views',
    ratePer1kBDT: 8,
    ratePer1kUSD: 0.07,
    minQty: 1000,
    maxQty: 50000000,
    speed: '500k / Hour',
    refillDays: 0,
    badges: ['instant', 'best-seller'],
    description: 'Instant delivery for TikTok videos. High volume at the lowest wholesale rate.'
  },
  {
    id: 'tt-002',
    name: 'TikTok Real Followers [Organic Profile Feed]',
    platform: 'tiktok',
    category: 'TikTok Followers',
    ratePer1kBDT: 280,
    ratePer1kUSD: 2.30,
    minQty: 100,
    maxQty: 50000,
    speed: '5k / Day',
    refillDays: 30,
    badges: ['non-drop', 'auto-refill'],
    description: 'Quality TikTok followers to unlock live streaming requirements (1k followers required).'
  },
  {
    id: 'tt-003',
    name: 'TikTok Likes + Shares + Saves [Viral FYP Booster]',
    platform: 'tiktok',
    category: 'TikTok Engagement',
    ratePer1kBDT: 110,
    ratePer1kUSD: 0.90,
    minQty: 100,
    maxQty: 100000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention'],
    description: 'Comprehensive interaction package to boost video retention signals.'
  },

  // TELEGRAM
  {
    id: 'tg-001',
    name: 'Telegram Channel / Group Members [0% Drop Guaranteed]',
    platform: 'telegram',
    category: 'Telegram Growth',
    ratePer1kBDT: 160,
    ratePer1kUSD: 1.30,
    minQty: 100,
    maxQty: 100000,
    speed: '20k / Day',
    refillDays: 90,
    badges: ['non-drop', 'auto-refill'],
    description: 'Permanent Telegram channel members with genuine usernames.'
  },
  {
    id: 'tg-002',
    name: 'Telegram Post Views [Last 10 Posts Auto-Sync]',
    platform: 'telegram',
    category: 'Telegram Views',
    ratePer1kBDT: 15,
    ratePer1kUSD: 0.12,
    minQty: 500,
    maxQty: 1000000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant'],
    description: 'Instant post views for crypto channels, signals, and news broadcasts.'
  },

  // TWITTER / X
  {
    id: 'tw-001',
    name: 'Twitter / X Real Followers [Crypto & Tech Niche Profiles]',
    platform: 'twitter',
    category: 'Twitter Followers',
    ratePer1kBDT: 420,
    ratePer1kUSD: 3.45,
    minQty: 100,
    maxQty: 50000,
    speed: '2k / Day',
    refillDays: 30,
    badges: ['non-drop', 'auto-refill'],
    description: 'High-trust Twitter/X profiles with avatars, bios, and tweets.'
  },

  // SPOTIFY
  {
    id: 'sp-001',
    name: 'Spotify Track Plays [Royalty Eligible & High Retention]',
    platform: 'spotify',
    category: 'Spotify Music',
    ratePer1kBDT: 140,
    ratePer1kUSD: 1.15,
    minQty: 1000,
    maxQty: 1000000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['high-retention', 'non-drop'],
    description: '100% royalty-eligible stream plays with premium user agent headers.'
  }
];
