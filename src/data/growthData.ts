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
    priceBDT: 960,
    priceUSD: 7.90,
    originalPriceBDT: 1920,
    originalPriceUSD: 15.80,
    savingsPercent: 50,
    features: [
      '3,000 Real & Active Bangladeshi Page Likes / Followers',
      '500 Post Reactions (Like, Love, Care mix on recent posts)',
      '20 Custom Positive Bengali Review Comments',
      '⭐ 100% Non-Drop Guaranteed with 60-Day Auto-Refill',
      '⚡ Starts within 15 Minutes after payment'
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
    priceBDT: 6400,
    priceUSD: 52.00,
    originalPriceBDT: 12800,
    originalPriceUSD: 104.00,
    savingsPercent: 50,
    features: [
      '1,000 High-Quality Permanent YouTube Subscribers',
      '4,000 High-Retention Watch Hours (Long-form compliant)',
      'Safe for Channel Monetization & Ads (Organic drip-speed)',
      '🛡️ 365-Day Refill Protection Guarantee',
      '📊 Live Progress Tracking Dashboard'
    ],
    isPopular: true,
    deliveryTime: '3 - 6 Days (Safe Drip)'
  },
  {
    id: 'fb-monetization-pack',
    title: 'Facebook In-Stream Ads 60k Monetization Pack',
    platform: 'facebook',
    subtitle: 'Complete watch-time and follower package to unlock Facebook In-Stream Ads monetization.',
    iconName: 'Users',
    priceBDT: 1900,
    priceUSD: 15.50,
    originalPriceBDT: 3800,
    originalPriceUSD: 31.00,
    savingsPercent: 50,
    features: [
      '60,000 Eligible Video Watch Minutes',
      '5,000 Real Bangladeshi Page Followers',
      'Policy Compliant for In-Stream & Stars Monetization',
      '🛡️ 60-Day Non-Drop Refill Guarantee',
      '⚡ Fast automated start within 1 hour'
    ],
    isPopular: true,
    deliveryTime: '2 - 4 Days'
  },
  {
    id: 'tiktok-viral-launch',
    title: 'TikTok Viral Algorithm Kick-Starter',
    platform: 'tiktok',
    subtitle: 'Trigger the TikTok FYP (For You Page) recommendation algorithm with high early velocity.',
    iconName: 'Flame',
    priceBDT: 300,
    priceUSD: 2.50,
    originalPriceBDT: 600,
    originalPriceUSD: 5.00,
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
    priceBDT: 700,
    priceUSD: 5.75,
    originalPriceBDT: 1400,
    originalPriceUSD: 11.50,
    savingsPercent: 50,
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
  // ============================================================
  // FACEBOOK SERVICES (Exact 100% Profit Margin - Target Keywords: fb auto likes, facebook page followers, fb followers)
  // ============================================================
  {
    id: 'fb-001',
    name: 'Facebook Page Likes & Followers [100% BD Bengali Real Targeted]',
    platform: 'facebook',
    category: 'Facebook Page Growth',
    ratePer1kBDT: 280,
    ratePer1kUSD: 2.30,
    minQty: 100,
    maxQty: 100000,
    speed: '2k - 5k / Day',
    refillDays: 60,
    badges: ['bengali-target', 'non-drop', 'best-seller', 'auto-refill'],
    description: 'High-quality real Bangladeshi user profiles with authentic profile photos. Ideal for local F-commerce pages, brands, and public figures.',
    guaranteeText: '60 Days Non-Drop Refill Guarantee'
  },
  {
    id: 'fb-002',
    name: 'Facebook Profile Followers [Real Bangladesh Profiles]',
    platform: 'facebook',
    category: 'Facebook Profile Growth',
    ratePer1kBDT: 240,
    ratePer1kUSD: 1.95,
    minQty: 100,
    maxQty: 100000,
    speed: '3k / Day',
    refillDays: 30,
    badges: ['bengali-target', 'non-drop', 'best-seller'],
    description: 'Real personal profile followers from Bangladesh. Great for influencers, public figures, and creators.'
  },
  {
    id: 'fb-003',
    name: 'Facebook Post Reactions [Like + Love + Care Mix] - Instant Auto',
    platform: 'facebook',
    category: 'Facebook Engagement',
    ratePer1kBDT: 70,
    ratePer1kUSD: 0.58,
    minQty: 50,
    maxQty: 100000,
    speed: 'Instant (10k/Hour)',
    refillDays: 30,
    badges: ['instant', 'non-drop', 'best-seller'],
    description: 'Natural blend of Facebook post reactions. Instant delivery within 60 seconds on public photos, videos, and statuses.'
  },
  {
    id: 'fb-004',
    name: 'Facebook Love Reactions ❤️ [Instant Delivery 0-5 Mins]',
    platform: 'facebook',
    category: 'Facebook Engagement',
    ratePer1kBDT: 75,
    ratePer1kUSD: 0.62,
    minQty: 50,
    maxQty: 50000,
    speed: 'Instant',
    refillDays: 30,
    badges: ['instant'],
    description: 'Pure Love (❤️) reactions for personal posts, brand announcements, and creative photos.'
  },
  {
    id: 'fb-005',
    name: 'Facebook Video Views / Reels Views [High Watch Time Monetization]',
    platform: 'facebook',
    category: 'Facebook Video',
    ratePer1kBDT: 40,
    ratePer1kUSD: 0.33,
    minQty: 500,
    maxQty: 1000000,
    speed: '50k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention'],
    description: 'Monetization-safe video views with 60-second+ watch duration. Helps boost Facebook in-stream ad eligibility.'
  },
  {
    id: 'fb-006',
    name: 'Facebook In-Stream Ads 60,000 Minutes Watch Time Package',
    platform: 'facebook',
    category: 'Facebook Monetization',
    ratePer1kBDT: 1200,
    ratePer1kUSD: 9.80,
    minQty: 1,
    maxQty: 10,
    speed: '2 - 3 Days',
    refillDays: 60,
    badges: ['best-seller', 'high-retention', 'auto-refill'],
    description: 'Complete 60k minutes video watch time eligible for Facebook In-Stream Ads monetization checklist.'
  },
  {
    id: 'fb-007',
    name: 'Facebook Group Members [Real Public & Private Groups]',
    platform: 'facebook',
    category: 'Facebook Community',
    ratePer1kBDT: 320,
    ratePer1kUSD: 2.60,
    minQty: 100,
    maxQty: 50000,
    speed: '2k / Day',
    refillDays: 30,
    badges: ['non-drop', 'bengali-target'],
    description: 'Grow your Facebook group authority with active Bangladeshi member profiles.'
  },
  {
    id: 'fb-008',
    name: 'Facebook Custom Bengali Comments [5-Star F-Commerce Reviews]',
    platform: 'facebook',
    category: 'Facebook Engagement',
    ratePer1kBDT: 850,
    ratePer1kUSD: 6.90,
    minQty: 10,
    maxQty: 1000,
    speed: 'Gradual Drip',
    refillDays: 30,
    badges: ['bengali-target', 'high-retention'],
    description: 'Custom positive feedback and comments in Bengali written specifically for your business or product posts.'
  },

  // ============================================================
  // YOUTUBE SERVICES (Target Keywords: 4000 watch hours, youtube monetization, 1000 subscribers)
  // ============================================================
  {
    id: 'yt-001',
    name: 'YouTube 4,000 Hours Monetization Watch Time [YPP AdSense Safe]',
    platform: 'youtube',
    category: 'YouTube Monetization',
    ratePer1kBDT: 1500,
    ratePer1kUSD: 12.30,
    minQty: 500,
    maxQty: 4000,
    speed: '500 - 1000 Hours / Day',
    refillDays: 365,
    badges: ['high-retention', 'non-drop', 'best-seller', 'auto-refill'],
    description: '100% compliant with YouTube Partner Program (YPP) requirements. Requires video length of 15+ minutes.',
    guaranteeText: '1 Year 100% Replacement Guarantee'
  },
  {
    id: 'yt-002',
    name: 'YouTube Permanent Subscribers [Non-Drop & Real Channel Profiles]',
    platform: 'youtube',
    category: 'YouTube Growth',
    ratePer1kBDT: 900,
    ratePer1kUSD: 7.40,
    minQty: 100,
    maxQty: 50000,
    speed: '200 - 500 / Day (Safe Speed)',
    refillDays: 90,
    badges: ['non-drop', 'best-seller', 'auto-refill'],
    description: 'Steady, organic-looking subscriber delivery that sticks permanently on YouTube Studio analytics.'
  },
  {
    id: 'yt-003',
    name: 'YouTube High-Retention Organic Views [Suggested Video Algorithm]',
    platform: 'youtube',
    category: 'YouTube Video Views',
    ratePer1kBDT: 150,
    ratePer1kUSD: 1.25,
    minQty: 500,
    maxQty: 5000000,
    speed: '10k - 50k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention', 'best-seller'],
    description: 'High watch duration (3–5 minutes) views derived from suggested video algorithms. Safe for AdSense.'
  },
  {
    id: 'yt-004',
    name: 'YouTube Shorts Views [Viral Algorithm Shelf Booster]',
    platform: 'youtube',
    category: 'YouTube Shorts',
    ratePer1kBDT: 80,
    ratePer1kUSD: 0.65,
    minQty: 500,
    maxQty: 10000000,
    speed: '100k / Day',
    refillDays: 30,
    badges: ['instant', 'best-seller'],
    description: 'High velocity views tailored for YouTube Shorts shelf recommendations.'
  },
  {
    id: 'yt-005',
    name: 'YouTube Video Likes [Instant Delivery & Non-Drop]',
    platform: 'youtube',
    category: 'YouTube Engagement',
    ratePer1kBDT: 95,
    ratePer1kUSD: 0.78,
    minQty: 50,
    maxQty: 100000,
    speed: 'Instant (5k/Day)',
    refillDays: 30,
    badges: ['instant', 'non-drop'],
    description: 'Real YouTube likes to elevate like-to-view ratio and trigger video search rankings.'
  },
  {
    id: 'yt-006',
    name: 'YouTube Custom Positive Comments [English & Bengali]',
    platform: 'youtube',
    category: 'YouTube Engagement',
    ratePer1kBDT: 900,
    ratePer1kUSD: 7.50,
    minQty: 10,
    maxQty: 1000,
    speed: 'Natural Drip',
    refillDays: 30,
    badges: ['high-retention'],
    description: 'Custom relevant comments to boost audience interaction and video authority.'
  },
  {
    id: 'yt-007',
    name: 'YouTube Live Stream Concurrent Viewers [1 Hour Duration]',
    platform: 'youtube',
    category: 'YouTube Live',
    ratePer1kBDT: 650,
    ratePer1kUSD: 5.30,
    minQty: 50,
    maxQty: 5000,
    speed: 'Instant Connect',
    refillDays: 0,
    badges: ['instant'],
    description: 'Real-time live stream viewers to push gaming, podcasts, or webinars to YouTube Live Trending.'
  },

  // ============================================================
  // INSTAGRAM SERVICES (Target Keywords: buy ig likes instant, instagram likes instant delivery, buy ig followers)
  // ============================================================
  {
    id: 'ig-001',
    name: 'Instagram Premium Followers [Guaranteed Non-Drop with Auto-Refill]',
    platform: 'instagram',
    category: 'Instagram Followers',
    ratePer1kBDT: 120,
    ratePer1kUSD: 1.00,
    minQty: 100,
    maxQty: 500000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['instant', 'non-drop', 'best-seller', 'auto-refill'],
    description: 'High-quality Instagram followers with bio and posts. 1-Click auto-refill enabled.'
  },
  {
    id: 'ig-002',
    name: 'Instagram Post Likes [Instant Delivery within 60 Seconds]',
    platform: 'instagram',
    category: 'Instagram Likes',
    ratePer1kBDT: 36,
    ratePer1kUSD: 0.30,
    minQty: 50,
    maxQty: 100000,
    speed: 'Instant (20k/Hour)',
    refillDays: 30,
    badges: ['instant', 'best-seller', 'non-drop'],
    description: 'Lightning-fast like delivery. Helps push posts into user feed recommendations.'
  },
  {
    id: 'ig-003',
    name: 'Instagram Reels Views + Reach & Impressions Boost',
    platform: 'instagram',
    category: 'Instagram Reels',
    ratePer1kBDT: 16,
    ratePer1kUSD: 0.13,
    minQty: 1000,
    maxQty: 50000000,
    speed: '100k / Hour',
    refillDays: 0,
    badges: ['instant', 'high-retention', 'best-seller'],
    description: 'Ultra-fast delivery for viral Instagram Reels. Triggers the Instagram algorithm Explore shelf.'
  },
  {
    id: 'ig-004',
    name: 'Instagram Saves & Shares Mix [Explore Page Trigger]',
    platform: 'instagram',
    category: 'Instagram Engagement',
    ratePer1kBDT: 45,
    ratePer1kUSD: 0.38,
    minQty: 100,
    maxQty: 50000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant', 'high-retention'],
    description: 'Saves and shares are the #1 algorithm ranking signal on modern Instagram.'
  },
  {
    id: 'ig-005',
    name: 'Instagram Custom Comments [Real Looking Verified Style]',
    platform: 'instagram',
    category: 'Instagram Engagement',
    ratePer1kBDT: 750,
    ratePer1kUSD: 6.20,
    minQty: 10,
    maxQty: 1000,
    speed: 'Natural Drip',
    refillDays: 30,
    badges: ['high-retention'],
    description: 'High-quality comments matching your post niche.'
  },
  {
    id: 'ig-006',
    name: 'Instagram Story Views [All Active Stories]',
    platform: 'instagram',
    category: 'Instagram Stories',
    ratePer1kBDT: 25,
    ratePer1kUSD: 0.20,
    minQty: 100,
    maxQty: 100000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant'],
    description: 'Instant story views for all active 24h stories.'
  },

  // ============================================================
  // TIKTOK SERVICES (Target Keywords: buy tiktok followers, tiktok fyp views, tiktok auto likes)
  // ============================================================
  {
    id: 'tt-001',
    name: 'TikTok Video Views [Ultra-Speed Instant Server]',
    platform: 'tiktok',
    category: 'TikTok Views',
    ratePer1kBDT: 6,
    ratePer1kUSD: 0.05,
    minQty: 1000,
    maxQty: 100000000,
    speed: '500k / Hour',
    refillDays: 0,
    badges: ['instant', 'best-seller'],
    description: 'Instant delivery for TikTok videos. High volume at the lowest wholesale rate.'
  },
  {
    id: 'tt-002',
    name: 'TikTok Real Followers [Live Stream & Creator Fund Eligible]',
    platform: 'tiktok',
    category: 'TikTok Followers',
    ratePer1kBDT: 220,
    ratePer1kUSD: 1.80,
    minQty: 100,
    maxQty: 100000,
    speed: '5k / Day',
    refillDays: 30,
    badges: ['non-drop', 'auto-refill', 'best-seller'],
    description: 'Quality TikTok followers to unlock live streaming requirements (1k followers required).'
  },
  {
    id: 'tt-003',
    name: 'TikTok Likes + Shares + Saves [Viral FYP Booster]',
    platform: 'tiktok',
    category: 'TikTok Engagement',
    ratePer1kBDT: 90,
    ratePer1kUSD: 0.75,
    minQty: 100,
    maxQty: 100000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['instant', 'high-retention'],
    description: 'Comprehensive interaction package to boost video retention signals.'
  },
  {
    id: 'tt-004',
    name: 'TikTok Video Shares & Bookmarks [Key Viral Signal]',
    platform: 'tiktok',
    category: 'TikTok Engagement',
    ratePer1kBDT: 30,
    ratePer1kUSD: 0.25,
    minQty: 100,
    maxQty: 500000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant'],
    description: 'Triggers the TikTok algorithm to serve your video to wider global audiences.'
  },

  // ============================================================
  // TELEGRAM SERVICES (Target Keywords: buy telegram channel members, telegram post views)
  // ============================================================
  {
    id: 'tg-001',
    name: 'Telegram Channel / Group Members [0% Drop Guaranteed]',
    platform: 'telegram',
    category: 'Telegram Growth',
    ratePer1kBDT: 130,
    ratePer1kUSD: 1.05,
    minQty: 100,
    maxQty: 200000,
    speed: '20k / Day',
    refillDays: 90,
    badges: ['non-drop', 'auto-refill', 'best-seller'],
    description: 'Permanent Telegram channel members with genuine usernames.'
  },
  {
    id: 'tg-002',
    name: 'Telegram Post Views [Instant Auto-Delivery on 1 Post]',
    platform: 'telegram',
    category: 'Telegram Views',
    ratePer1kBDT: 12,
    ratePer1kUSD: 0.10,
    minQty: 500,
    maxQty: 5000000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant', 'best-seller'],
    description: 'Instant post views for crypto channels, signals, and news broadcasts.'
  },
  {
    id: 'tg-003',
    name: 'Telegram Auto-Views [Last 20 Posts Multi-View]',
    platform: 'telegram',
    category: 'Telegram Views',
    ratePer1kBDT: 45,
    ratePer1kUSD: 0.38,
    minQty: 100,
    maxQty: 100000,
    speed: 'Instant',
    refillDays: 0,
    badges: ['instant'],
    description: 'Simultaneously adds equal views across your last 20 channel posts for authentic activity.'
  },

  // ============================================================
  // TWITTER / X SERVICES
  // ============================================================
  {
    id: 'tw-001',
    name: 'Twitter / X Real Followers [Crypto & Tech Niche Profiles]',
    platform: 'twitter',
    category: 'Twitter Followers',
    ratePer1kBDT: 380,
    ratePer1kUSD: 3.10,
    minQty: 100,
    maxQty: 50000,
    speed: '2k / Day',
    refillDays: 30,
    badges: ['non-drop', 'auto-refill', 'best-seller'],
    description: 'High-trust Twitter/X profiles with avatars, bios, and tweets.'
  },
  {
    id: 'tw-002',
    name: 'Twitter / X Retweets & Likes [Instant Algorithm Boost]',
    platform: 'twitter',
    category: 'Twitter Engagement',
    ratePer1kBDT: 140,
    ratePer1kUSD: 1.15,
    minQty: 50,
    maxQty: 25000,
    speed: 'Instant',
    refillDays: 30,
    badges: ['instant', 'non-drop'],
    description: 'Instant retweets and likes to trend crypto, tech, and startup announcements.'
  },

  // ============================================================
  // SPOTIFY SERVICES (Target Keywords: buy spotify plays, spotify monthly listeners)
  // ============================================================
  {
    id: 'sp-001',
    name: 'Spotify Track Plays [Royalty Eligible & High Retention]',
    platform: 'spotify',
    category: 'Spotify Music',
    ratePer1kBDT: 110,
    ratePer1kUSD: 0.90,
    minQty: 1000,
    maxQty: 5000000,
    speed: '10k / Day',
    refillDays: 30,
    badges: ['high-retention', 'non-drop', 'best-seller'],
    description: '100% royalty-eligible stream plays with premium user agent headers.'
  },
  {
    id: 'sp-002',
    name: 'Spotify Monthly Listeners [Global Algorithm Distribution]',
    platform: 'spotify',
    category: 'Spotify Music',
    ratePer1kBDT: 130,
    ratePer1kUSD: 1.05,
    minQty: 500,
    maxQty: 1000000,
    speed: '5k / Day',
    refillDays: 30,
    badges: ['non-drop', 'best-seller'],
    description: 'Elevates your artist profile monthly listener count on Spotify search.'
  },
  {
    id: 'sp-003',
    name: 'Spotify Artist Followers [Permanent Non-Drop]',
    platform: 'spotify',
    category: 'Spotify Followers',
    ratePer1kBDT: 90,
    ratePer1kUSD: 0.75,
    minQty: 100,
    maxQty: 100000,
    speed: '2k / Day',
    refillDays: 30,
    badges: ['non-drop'],
    description: 'Permanent followers for artist and curator profiles.'
  },

  // ============================================================
  // LINKEDIN SERVICES (Target Keywords: buy linkedin connections, linkedin followers)
  // ============================================================
  {
    id: 'li-001',
    name: 'LinkedIn Company Page Followers [B2B High Authority]',
    platform: 'linkedin',
    category: 'LinkedIn Growth',
    ratePer1kBDT: 600,
    ratePer1kUSD: 4.90,
    minQty: 100,
    maxQty: 50000,
    speed: '1k / Day',
    refillDays: 30,
    badges: ['non-drop', 'auto-refill', 'best-seller'],
    description: 'Professional LinkedIn connections and followers for agency & corporate credibility.'
  },
  {
    id: 'li-002',
    name: 'LinkedIn Post Likes & Celebrates Mix',
    platform: 'linkedin',
    category: 'LinkedIn Engagement',
    ratePer1kBDT: 450,
    ratePer1kUSD: 3.70,
    minQty: 50,
    maxQty: 10000,
    speed: 'Instant (500/Hour)',
    refillDays: 30,
    badges: ['instant', 'non-drop'],
    description: 'Boost executive and company posts into the LinkedIn algorithmic feed.'
  }
];

