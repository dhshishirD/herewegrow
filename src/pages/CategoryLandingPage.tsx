import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Star, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  Calculator,
  Lock,
  TrendingUp,
  Clock,
  ExternalLink,
  Flame,
  Award,
  Users,
  Code2,
  Copy,
  Check,
  Smartphone,
  Coins,
  X
} from 'lucide-react';
import type { SmmService, UserWallet } from '../types';
import { SMM_SERVICES_CATALOG } from '../data/growthData';
import { updatePageSEO } from '../services/seoService';
import { FreeTrialBooster } from '../components/FreeTrialBooster';

interface CategorySEOConfig {
  slug: string;
  platformId: string;
  title: string;
  h1: string;
  tagline: string;
  heroBadge: string;
  targetKeywords: string[];
  metaDescription: string;
  introText: string;
  whyChooseUs: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  showCalculator?: 'youtube' | 'facebook' | 'instagram';
}

export const CATEGORY_CONFIGS: Record<string, CategorySEOConfig> = {
  'smm-panel': {
    slug: 'smm-panel',
    platformId: 'all',
    title: 'Best & Cheapest SMM Panel in Bangladesh (2026) — 100% Non-Drop bKash & Nagad | HereWeGrow',
    h1: 'Best & Cheapest SMM Panel in Bangladesh (2026)',
    tagline: 'The #1 wholesale SMM reseller panel in Bangladesh for Facebook, Instagram, YouTube, TikTok & Telegram. Automated instant delivery with bKash, Nagad, Crypto & Cards.',
    heroBadge: 'Wholesale Direct Engine • Starting at ৳2 / $0.02',
    targetKeywords: [
      'smm panel',
      'best smm panel',
      'cheapest smm panel',
      'free smm panel',
      'smm panel bangladesh',
      'smm panel instagram',
      'smm panel tiktok',
      'smm panel youtube',
      'smm reseller panel',
      'best smm panel for youtube watch time',
      'best smm panel for facebook',
      'telegram smm panel',
      'smm panel bkash',
      'smm panel nagad'
    ],
    metaDescription: 'Access the best and cheapest SMM panel in Bangladesh for Facebook, Instagram, TikTok, YouTube & Telegram. 100% Non-drop guaranteed with instant bKash, Nagad & Crypto.',
    introText: 'HereWeGrow is Bangladesh’s most reliable, next-generation SMM reseller panel engineered for digital creators, marketing agencies, and reseller businesses. Directly integrated with high-capacity wholesale servers, our system delivers high-retention followers, viral video views, auto reactions, and channel monetization watch hours with automated instant delivery and 0% gateway fee.',
    whyChooseUs: [
      { title: 'Cheapest Wholesale Rates', desc: 'Direct provider connection ensures the lowest prices on the market starting at just ৳2 / $0.02.' },
      { title: 'Zero Password Required', desc: 'We only need your public post or profile link. Your account security is 100% protected.' },
      { title: 'Instant Automated Delivery', desc: 'Orders dispatch to automated server queues within 30 to 60 seconds.' },
      { title: 'bKash & Nagad Auto Gateway', desc: 'Seamless 1-click BDT payment and global Binance Pay / Crypto processing.' }
    ],
    faqs: [
      {
        q: 'What is an SMM panel and how does it work in Bangladesh?',
        a: 'An SMM (Social Media Marketing) panel is an automated online platform where creators, brands, and resellers purchase social media services like followers, likes, video views, and watch hours to kick-start organic algorithm reach. HereWeGrow connects directly with wholesale server APIs and accepts bKash, Nagad, and Crypto.'
      },
      {
        q: 'Is HereWeGrow the best SMM panel for YouTube watch time and Facebook followers?',
        a: 'Yes! HereWeGrow specializes in policy-compliant YouTube 4,000 watch hours (YPP monetization safe) and authentic Bangladeshi Facebook page followers with 365-day refill protection.'
      },
      {
        q: 'Can I resell HereWeGrow services to my clients using API?',
        a: 'Yes! We provide a free REST API v2 that seamlessly connects with any SMM website or custom software for automated order fulfillment.'
      },
      {
        q: 'What is the minimum deposit and order amount on HereWeGrow?',
        a: 'Unlike foreign panels that require $10 to $25 minimum deposits, HereWeGrow allows micro-orders starting as low as ৳2 / $0.02 with zero deposit minimums.'
      }
    ]
  },
  'youtube-monetization': {
    slug: 'youtube-monetization',
    platformId: 'youtube',
    title: 'Buy YouTube 4000 Watch Hours & 1000 Subscribers (YPP Monetization) 2026 | HereWeGrow',
    h1: 'Buy 4,000 YouTube Watch Hours & 1,000 Subscribers',
    tagline: 'Fast-track your YouTube Partner Program (YPP) AdSense monetization with 100% policy-compliant, non-drop watch time, authentic high-retention desktop playback, and a 365-day auto-refill warranty.',
    heroBadge: 'Official YPP Safe • 240,000 Minutes Guaranteed • 365d Warranty',
    targetKeywords: [
      '4000 watch hours on youtube',
      'buy 4000 watch hours on youtube cheap',
      'youtube watch hours for monetization',
      'how to get 4000 watch hours on youtube',
      'buy youtube watch time bangladesh',
      'youtube 4000 watch hours bkash',
      'youtube monetization package 2026',
      'youtube views increase',
      'boost youtube views',
      'free youtube subscribers',
      'free youtube views',
      '1 million views on youtube money',
      'tool seo youtube',
      'youtube partner program eligibility'
    ],
    metaDescription: 'Buy 4000 watch hours and 1000 subscribers for YouTube monetization. 100% compliant with YouTube Partner Program (YPP) & Google AdSense. Instant bKash & Crypto payment.',
    introText: 'Achieving YouTube Partner Program (YPP) monetization requires 4,000 valid public watch hours (240,000 minutes) and 1,000 subscribers within the past 12 months. HereWeGrow delivers high-retention, steady drip-feed watch time from authentic desktop and mobile browser sessions that count permanently toward your YouTube Studio monetization progress meter.',
    showCalculator: 'youtube',
    whyChooseUs: [
      { title: '100% YPP Monetization Compliant', desc: 'Our natural drip-feed pacing mimics authentic human viewer behavior, safely passing YouTube Studio algorithmic and manual reviews.' },
      { title: '365-Day Unconditional Refill', desc: 'Every watch hour and subscriber package is backed by an automated 1-year replacement warranty if any count fluctuations occur.' },
      { title: 'Zero Channel Passwords Required', desc: 'We only require your public YouTube channel or video link. Your Google account credentials remain 100% private and secure.' },
      { title: 'Instant bKash, Nagad & Crypto Checkout', desc: 'Seamless 1-click checkout in Bangladeshi Taka (৳ BDT) with zero gateway fee, plus global Binance Pay and Card support.' }
    ],
    faqs: [
      {
        q: 'How many minutes is 4,000 watch hours on YouTube and how is it calculated?',
        a: '4,000 watch hours is exactly 240,000 minutes of valid public playback (4,000 hours × 60 minutes = 240,000 minutes). If your uploaded video is 15 minutes long and viewers watch with 80% average retention (12 minutes), you need approximately 20,000 full views to reach the 4,000 hours milestone.'
      },
      {
        q: 'Will my channel get approved for Google AdSense monetization after reaching 4,000 hours?',
        a: 'Yes! HereWeGrow watch hours are generated with real browser headers, unique residential IPs, and natural playback progression that register directly in YouTube Studio monetization analytics. As long as your channel content follows YouTube Community Guidelines (no copyright infringements or unedited reused content), your application will be approved smoothly.'
      },
      {
        q: 'What video length is recommended to order YouTube watch hours?',
        a: 'We strongly recommend uploading at least one long-form video of 15 to 60+ minutes (such as a podcast, tutorial, vlog, or relaxing background audio/visual). Longer videos allow watch hours to accumulate much faster and with maximum stability.'
      },
      {
        q: 'Do YouTube Shorts views count toward the 4,000 public watch hours requirement?',
        a: 'No. YouTube’s official policy separates Shorts from long-form watch time. Shorts views count toward the alternative 10 Million Shorts views requirement. For the classic 4,000 hours threshold, you must have public long-form video watch time, which HereWeGrow provides.'
      },
      {
        q: 'How fast will my 4,000 watch hours and 1,000 subscribers be delivered?',
        a: 'Delivery begins within 60 seconds of order placement and is delivered via an organic drip-feed over 3 to 7 days. This gradual delivery pacing protects your channel and ensures all 240,000 minutes lock into your YouTube Studio analytics permanently.'
      },
      {
        q: 'How much money does 1 Million views make on YouTube AdSense?',
        a: 'Earnings from 1 Million views typically range from $1,500 to $15,000+ USD (approx. ৳1,80,000 to ৳18,00,000 BDT) depending on your niche RPM. Finance, SaaS, and Tech niches earn the highest RPM ($10–$30), while lifestyle, entertainment, and vlog niches average $2–$6 RPM.'
      }
    ]
  },
  'facebook-growth': {
    slug: 'facebook-growth',
    platformId: 'facebook',
    title: 'Increase Facebook Followers & Page Growth Booster (2026) — 100% Non-Drop bKash & Nagad | HereWeGrow',
    h1: 'Increase Facebook Followers & Organic Page Growth Fast',
    tagline: 'Supercharge your Facebook Page authority, qualify for Meta In-Stream Ads & Stars monetization (5k Followers + 60k Minutes), and skyrocket F-Commerce trust with real Bangladeshi non-drop followers.',
    heroBadge: '100% Real Bangladeshi Profiles • 0% Passwords • 365d Warranty',
    targetKeywords: [
      'increase facebook followers',
      'facebook followers booster',
      'how to get 5000 followers on facebook page',
      'how to increase facebook followers fast',
      'facebook 60k minutes monetization',
      'buy facebook followers bangladesh',
      'facebook page followers bkash',
      'facebook page likes increase free',
      'facebook in stream ads monetization 2026',
      'facebook auto liker bangladesh',
      'facebook professional mode followers',
      'increase fb followers',
      'how to get more followers on facebook',
      'how to grow facebook page',
      'facebook page followers increase',
      'facebook followers free',
      'fb auto likes',
      'buy fb followers',
      'facebook likes purchase'
    ],
    metaDescription: 'Increase Facebook followers and page likes with instant bKash, Nagad & Crypto checkout. Real Bangladeshi profiles, Meta In-Stream Ads 60k minutes safe, 100% Non-Drop guarantee.',
    introText: 'Social proof and follower authority are the #1 drivers of algorithmic reach and customer trust on Facebook. In Bangladesh’s competitive 60M+ user ecosystem, pages with established follower counts convert inbox inquiries at up to 4.8x higher rates and qualify for Meta In-Stream Ads revenue sharing.',
    showCalculator: 'facebook',
    whyChooseUs: [
      { title: '100% Real Bangladeshi Profiles', desc: 'Active local accounts with profile photos, timelines, and organic activity from Dhaka, Chittagong, Sylhet & Rajshahi.' },
      { title: 'In-Stream Ads & Stars Compliant', desc: 'Our 5,000 followers and 60,000 video minutes packages fully satisfy Meta Monetization Partner Standards.' },
      { title: 'Zero Password Required', desc: 'We only need your public Facebook Page or Profile link. Your admin logins and Business Manager remain 100% secure.' },
      { title: '1-Click bKash, Nagad & Crypto', desc: 'Instant automated checkout with 0% gateway fee, 45-second server dispatch, and 365-day auto-refill warranty.' }
    ],
    faqs: [
      {
        q: 'How to get 5,000 followers and 60,000 minutes for Facebook In-Stream Ads monetization?',
        a: 'To unlock Facebook In-Stream Ads, Meta requires at least 5,000 followers and 60,000 total eligible minutes viewed on your public on-demand videos and live streams in the last 60 days. HereWeGrow provides safe, policy-compliant packages delivered via natural drip-feed to meet both requirements effortlessly.'
      },
      {
        q: 'Will buying Facebook followers or likes get my page restricted or shadowbanned?',
        a: 'No! HereWeGrow operates 100% externally via public page links. We never request passwords, admin roles, or access tokens. Our high-retention profiles are delivered naturally to protect your page health and prevent Meta algorithm flags.'
      },
      {
        q: 'What is the difference between Facebook Page Followers and Professional Mode Profile Followers?',
        a: 'Page followers attach directly to your Facebook Business/Creator Page, while Professional Mode followers attach to your personal Facebook profile enabled for monetization. HereWeGrow supports both URLs seamlessly.'
      },
      {
        q: 'Are the Facebook followers from Bangladesh or International?',
        a: 'We offer both targeted options! You can choose 100% Real Bangladeshi Profiles for local F-Commerce trust or Global Mixed Profiles for international reach and viral campaigns.'
      },
      {
        q: 'How fast do Facebook followers and post reactions start delivering?',
        a: 'Delivery initiates automatically within 30 to 60 seconds of payment confirmation and processes continuously at a natural, algorithm-safe velocity with 365-day auto-refill protection.'
      },
      {
        q: 'How can I pay for Facebook followers with bKash or Nagad in Bangladesh?',
        a: 'Select your desired quantity, enter your public Facebook page link, and click "Order Now". You can checkout instantly using bKash, Nagad, Rocket, Bank Cards, or Binance Pay / Crypto with 0% transaction fee.'
      }
    ]
  },
  'instagram-growth': {
    slug: 'instagram-growth',
    platformId: 'instagram',
    title: 'Increase Instagram Followers & Real Engagement Booster | HereWeGrow',
    h1: 'Increase Instagram Followers & Boost Real Engagement',
    tagline: 'Trigger the Instagram Explore and Reels algorithms with premium non-drop followers, instant likes within 60 seconds, and high-retention views.',
    heroBadge: 'Instant 60s Start • Non-Drop Auto-Refill',
    targetKeywords: [
      'increase instagram followers',
      'get instagram followers',
      'boost instagram followers',
      'gain instagram followers',
      'increase ig followers',
      'get insta followers',
      'instagram free followers increase',
      'grow instagram followers',
      'get real followers on instagram',
      'gain real followers instagram',
      'best way to grow instagram followers',
      'high quality instagram followers'
    ],
    metaDescription: 'Boost and increase Instagram followers, instant reels views, and post likes starting at ৳36. Fast delivery, 100% safe, no password needed.',
    introText: 'Instagram algorithms prioritize posts and reels with rapid early engagement velocity. Getting instant likes and high-retention followers signals the Explore page to feature your content to thousands of new viewers.',
    showCalculator: 'instagram',
    whyChooseUs: [
      { title: 'Instant 60s Delivery', desc: 'Likes and reels views start flowing immediately to push your content into viral recommendation loops.' },
      { title: 'Zero Password Needed', desc: 'We only require your public Instagram username or post link.' },
      { title: 'Non-Drop Guaranteed', desc: 'Every follower package is backed by a 30-day automated refill system.' }
    ],
    faqs: [
      {
        q: 'What is the fastest way to increase Instagram followers?',
        a: 'Combining aesthetic reels with HereWeGrow’s high-retention followers establishes instant social proof and boosts your profile ranking in Instagram search.'
      },
      {
        q: 'How fast do Instagram likes arrive?',
        a: 'Likes start delivering within 30 to 60 seconds after payment confirmation.'
      }
    ]
  },
  'tiktok-growth': {
    slug: 'tiktok-growth',
    platformId: 'tiktok',
    title: 'Buy TikTok Followers & FYP Algorithm Views | HereWeGrow',
    h1: 'Buy TikTok Followers & Viral FYP Views',
    tagline: 'Kick-start your TikTok videos into the For You Page (FYP) with ultra-speed video views, real followers, and engagement bundles.',
    heroBadge: 'FYP Algorithm Accelerator • 500k/Hour Speed',
    targetKeywords: [
      'buy tiktok followers',
      'tiktok fyp views',
      'tiktok auto likes',
      'buy tiktok views bangladesh',
      'tiktok smm panel',
      'tiktok followers panel'
    ],
    metaDescription: 'Boost your TikTok presence with instant FYP views, authentic followers to unlock Live streaming, and engagement packs. bKash accepted.',
    introText: 'TikTok’s algorithm is 100% velocity-driven. When a newly published video gets quick views, shares, and likes in its first hour, TikTok tests it on larger audiences across the FYP.',
    whyChooseUs: [
      { title: 'Ultra-Fast Servers', desc: 'Capable of delivering up to 500,000 views per hour safely.' },
      { title: 'Unlock TikTok Live', desc: 'Reach 1,000 followers quickly to enable mobile live streaming and gifts.' }
    ],
    faqs: [
      {
        q: 'Can I unlock TikTok Live streaming with this?',
        a: 'Yes! Reaching 1,000 TikTok followers qualifies your account for TikTok Live broadcast capabilities.'
      }
    ]
  },
  'telegram-growth': {
    slug: 'telegram-growth',
    platformId: 'telegram',
    title: 'Buy Telegram Channel Members & Post Views | HereWeGrow',
    h1: 'Buy Telegram Channel Members & Auto Views',
    tagline: 'Build immediate social proof for your crypto, trading, news, and business Telegram channels with permanent non-drop members.',
    heroBadge: '0% Drop Guaranteed • Auto-Views Included',
    targetKeywords: [
      'buy telegram channel members',
      'telegram post views',
      'telegram group members bd',
      'telegram smm panel'
    ],
    metaDescription: 'Scale your Telegram channel or group with permanent members and instant post views. 0% drop guaranteed with bKash and crypto payment.',
    introText: 'Telegram channels with thousands of members command instant authority for cryptocurrency traders, signal groups, and digital entrepreneurs.',
    whyChooseUs: [
      { title: '0% Drop Guarantee', desc: 'High-quality permanent members that do not leave your channel.' },
      { title: 'Multi-Post Auto Views', desc: 'Distribute views evenly across your last 20 posts for natural activity metrics.' }
    ],
    faqs: [
      {
        q: 'Will channel members drop after a few days?',
        a: 'No, we provide premium non-drop members backed by a 90-day replacement warranty.'
      }
    ]
  },
  'twitter-growth': {
    slug: 'twitter-growth',
    platformId: 'twitter',
    title: 'Buy Twitter Followers, Retweets & X Impressions (2026) | HereWeGrow',
    h1: 'Buy Twitter / X Followers, Retweets & Viral Views',
    tagline: 'Boost your crypto project, brand handle, or creator account with high-velocity Twitter impressions, active followers, and instant retweets.',
    heroBadge: 'Algorithm Impressions Trigger • Instant 60s Start',
    targetKeywords: [
      'twitter followers',
      'buy twitter followers',
      'grow twitter followers',
      'increase twitter followers',
      'twitter growth service',
      'free twitter followers',
      'boost twitter followers',
      'twitter auto follower'
    ],
    metaDescription: 'Scale your Twitter / X profile with real followers, high impressions, and retweets. Instant bKash & crypto checkout.',
    introText: 'Twitter/X algorithms prioritize tweets with rapid early engagement and quote retweets. High view velocity puts your post in the "For You" timeline.',
    whyChooseUs: [
      { title: 'Instant 60s Start', desc: 'Tweet views and impressions queue within seconds of ordering.' },
      { title: 'Crypto & Founder Ready', desc: 'Great for Web3 projects, founders, and political commentators.' }
    ],
    faqs: [
      {
        q: 'Do tweet impressions count for monetization?',
        a: 'Yes! High impressions help reach the 5M impressions threshold needed for X Ads Revenue Sharing.'
      }
    ]
  },
  'linkedin-growth': {
    slug: 'linkedin-growth',
    platformId: 'linkedin',
    title: 'Buy LinkedIn Company Followers & Connections | HereWeGrow',
    h1: 'Buy LinkedIn Company Page Followers & Connections',
    tagline: 'Elevate your agency, corporate brand, and founder profile with high-authority LinkedIn followers and engagement.',
    heroBadge: 'B2B Authority Booster • 100% Safe',
    targetKeywords: ['buy linkedin connections', 'buy linkedin followers', 'linkedin company page followers'],
    metaDescription: 'Enhance your B2B credibility with professional LinkedIn followers and connections. Perfect for tech startups, agencies, and executives.',
    introText: 'In B2B business and remote client acquisition, a strong LinkedIn presence establishes trust with foreign enterprise clients and recruiters.',
    whyChooseUs: [
      { title: 'Corporate Credibility', desc: 'Present your company page with thousands of established followers.' },
      { title: 'Safe Delivery Pacing', desc: 'Gradual, professional delivery matching LinkedIn usage patterns.' }
    ],
    faqs: [
      {
        q: 'Is it safe for company pages?',
        a: 'Yes, we only require public company page URLs. No admin access or logins needed.'
      }
    ]
  },
  'spotify-streams': {
    slug: 'spotify-streams',
    platformId: 'spotify',
    title: 'Buy Spotify Track Plays & Monthly Listeners | HereWeGrow',
    h1: 'Buy Spotify Track Plays & Monthly Listeners',
    tagline: 'Boost your Spotify artist profile with royalty-eligible streams, monthly listeners, and algorithm playlist placement signals.',
    heroBadge: 'Royalty Eligible • High Retention',
    targetKeywords: ['buy spotify plays', 'buy spotify monthly listeners', 'spotify playlist streams'],
    metaDescription: 'Get royalty-eligible Spotify plays and real monthly listeners to boost your music ranking on Release Radar and Discover Weekly.',
    introText: 'Streaming platforms look at track save rate and monthly listener stability to push independent musicians into official Spotify editorial playlists.',
    whyChooseUs: [
      { title: 'Royalty Eligible', desc: 'Plays generated with authentic user headers compliant with Spotify algorithms.' },
      { title: 'Monthly Listener Pacing', desc: 'Naturally increases your artist profile monthly listener metrics.' }
    ],
    faqs: [
      {
        q: 'Are the streams royalty eligible?',
        a: 'Yes, streams meet minimum duration thresholds for stream count registration.'
      }
    ]
  }
};

// Aliases for clean URL paths & keywords
CATEGORY_CONFIGS['facebook'] = CATEGORY_CONFIGS['facebook-growth'];
CATEGORY_CONFIGS['facebook-followers'] = CATEGORY_CONFIGS['facebook-growth'];
CATEGORY_CONFIGS['instagram'] = CATEGORY_CONFIGS['instagram-growth'];
CATEGORY_CONFIGS['instagram-followers'] = CATEGORY_CONFIGS['instagram-growth'];
CATEGORY_CONFIGS['youtube'] = CATEGORY_CONFIGS['youtube-monetization'];
CATEGORY_CONFIGS['youtube-views'] = CATEGORY_CONFIGS['youtube-monetization'];
CATEGORY_CONFIGS['tiktok'] = CATEGORY_CONFIGS['tiktok-growth'];
CATEGORY_CONFIGS['tiktok-views'] = CATEGORY_CONFIGS['tiktok-growth'];
CATEGORY_CONFIGS['telegram'] = CATEGORY_CONFIGS['telegram-growth'];
CATEGORY_CONFIGS['linkedin'] = CATEGORY_CONFIGS['linkedin-growth'];
CATEGORY_CONFIGS['twitter'] = CATEGORY_CONFIGS['twitter-growth'];
CATEGORY_CONFIGS['twitter-followers'] = CATEGORY_CONFIGS['twitter-growth'];
CATEGORY_CONFIGS['spotify'] = CATEGORY_CONFIGS['spotify-streams'];

interface CategoryLandingPageProps {
  categorySlug: string;
  currency: 'BDT' | 'USD';
  onSelectService: (service: SmmService) => void;
  onOpenWallet: () => void;
  onNavigateHome: () => void;
  onNavigateCategory: (slug: string) => void;
}

export const CategoryLandingPage: React.FC<CategoryLandingPageProps> = ({
  categorySlug,
  currency,
  onSelectService,
  onOpenWallet,
  onNavigateHome,
  onNavigateCategory
}) => {
  const config = CATEGORY_CONFIGS[categorySlug] || CATEGORY_CONFIGS['smm-panel'];
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>(config.platformId === 'all' ? 'all' : config.platformId);
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredServices = activePlatformFilter === 'all' 
    ? SMM_SERVICES_CATALOG.slice(0, 20)
    : SMM_SERVICES_CATALOG.filter(s => s.platform === activePlatformFilter);

  // YouTube Calculator State
  const [videoMinutes, setVideoMinutes] = useState<number>(15);
  const [targetHours, setTargetHours] = useState<number>(4000);

  const totalMinutesNeeded = targetHours * 60;
  const estimatedViewsNeeded = Math.ceil(totalMinutesNeeded / Math.max(videoMinutes * 0.75, 1));

  // Structured Data Schema Injection for Google Rich Snippets & Featured Snippets
  useEffect(() => {
    updatePageSEO({
      title: config.title,
      description: config.metaDescription,
      keywords: config.targetKeywords,
      canonicalUrl: `https://herewegrow.pro/services/${config.slug}`,
      faqs: config.faqs,
      breadcrumbs: [
        { name: 'Home', url: 'https://herewegrow.pro/' },
        { name: 'Growth Services', url: 'https://herewegrow.pro/#store' },
        { name: config.h1, url: `https://herewegrow.pro/services/${config.slug}` }
      ],
      howTo: {
        name: `How to Order on ${config.h1}`,
        description: `Step-by-step guide to ordering ${config.h1} with instant automated delivery.`,
        steps: [
          { title: 'Select Service Package', desc: 'Browse verified high-retention packages with non-drop auto refill guarantee.' },
          { title: 'Enter Public URL', desc: 'Provide your public profile, post, or channel link. No passwords required.' },
          { title: 'Instant 60s Start', desc: 'Pay with bKash, Nagad, Crypto, or account balance. Orders queue immediately.' }
        ]
      },
      schema: {
        '@type': 'Product',
        name: config.h1,
        description: config.metaDescription,
        brand: {
          '@type': 'Brand',
          name: 'HereWeGrow'
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: currency,
          lowPrice: currency === 'BDT' ? '2.00' : '0.02',
          highPrice: currency === 'BDT' ? '4500.00' : '38.00',
          offerCount: String(filteredServices.length || 10)
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.98',
          reviewCount: '12450',
          bestRating: '5',
          worstRating: '1'
        }
      }
    });
  }, [config, currency, filteredServices.length]);

  const handleCopyApi = () => {
    const apiCode = `curl -X POST "https://herewegrow.pro/api/v2" \\
  -d "key=YOUR_HEREWEGROW_API_KEY" \\
  -d "action=add" \\
  -d "service=fb-001" \\
  -d "link=https://facebook.com/your-page" \\
  -d "quantity=1000"`;
    navigator.clipboard.writeText(apiCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isSmmPanel = config.slug === 'smm-panel';
  const isYouTubeMonetization = config.slug === 'youtube-monetization' || config.platformId === 'youtube' || categorySlug === 'youtube' || categorySlug === 'youtube-views';
  const isFacebookGrowth = config.slug === 'facebook-growth' || config.slug === 'facebook-followers' || config.platformId === 'facebook' || categorySlug === 'facebook' || categorySlug === 'facebook-growth' || categorySlug === 'facebook-followers';

  // Enhanced YouTube Calculator State
  const [currentWatchHours, setCurrentWatchHours] = useState<number>(500);
  const [customVideoLength, setCustomVideoLength] = useState<number>(15);
  const [retentionPct, setRetentionPct] = useState<number>(80);

  const neededHours = Math.max(0, 4000 - currentWatchHours);
  const neededMinutes = neededHours * 60;
  const effectiveWatchMinutesPerView = Math.max(1, customVideoLength * (retentionPct / 100));
  const calcEstimatedViews = Math.ceil(neededMinutes / effectiveWatchMinutesPerView);
  const recommendedDripDays = Math.max(3, Math.min(14, Math.ceil(neededHours / 450)));

  // Enhanced Facebook Monetization & Page Authority Calculator State
  const [currentFbFollowers, setCurrentFbFollowers] = useState<number>(1200);
  const [currentFbMinutes, setCurrentFbMinutes] = useState<number>(18000);
  const [avgFbPostViews, setAvgFbPostViews] = useState<number>(25000);
  const [fbAudienceType, setFbAudienceType] = useState<'bd' | 'global'>('bd');

  const neededFbFollowers = Math.max(0, 5000 - currentFbFollowers);
  const neededFbMinutes = Math.max(0, 60000 - currentFbMinutes);
  const fbProgressPct = Math.min(100, Math.round(((currentFbFollowers / 5000) * 0.5 + (currentFbMinutes / 60000) * 0.5) * 100));

  const estMonthlyFbViews = avgFbPostViews * 12;
  const fbRpmRate = fbAudienceType === 'bd' ? 1.80 : 5.20;
  const estFbMonthlyEarningsUSD = Math.round((estMonthlyFbViews / 1000) * fbRpmRate);
  const estFbMonthlyEarningsBDT = Math.round(estFbMonthlyEarningsUSD * 122);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-8">
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors cursor-pointer">
          Growth Services
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{config.h1}</span>
      </nav>

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold mb-4 border border-slate-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{config.heroBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {config.h1}
        </h1>

        <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          {config.tagline}
        </p>

        {/* 4 Live System Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto mt-8">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Start</div>
            <div className="text-base font-black text-slate-950 font-mono mt-0.5">⚡ 45 Seconds</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Auto Refill</div>
            <div className="text-base font-black text-emerald-600 font-mono mt-0.5">🛡️ 365 Days</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Payment</div>
            <div className="text-base font-black text-indigo-600 font-mono mt-0.5">🇧🇩 bKash 0%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Completed</div>
            <div className="text-base font-black text-slate-950 font-mono mt-0.5">📦 124,800+</div>
          </div>
        </div>
      </div>

      {/* YouTube Monetization Exclusive: Interactive Watch Time Calculator & YPP Blueprint */}
      {isYouTubeMonetization && (
        <div className="max-w-5xl mx-auto mb-16 space-y-12">
          
          {/* 1. Interactive Watch Time Calculator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Interactive Monetization Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  YouTube 4,000 Watch Hours & Views Calculator
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Calculate exactly how many high-retention views and minutes your channel needs to unlock Google AdSense.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 text-right flex-shrink-0">
                <div className="text-[10px] text-indigo-300 font-bold uppercase">YPP Milestone</div>
                <div className="text-xl font-black text-white font-mono">240,000 Minutes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders Column */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Your Current Watch Hours:</span>
                    <span className="text-emerald-400 font-mono font-black">{currentWatchHours.toLocaleString()} / 4,000 Hours</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4000"
                    step="50"
                    value={currentWatchHours}
                    onChange={(e) => setCurrentWatchHours(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0h (Brand New)</span>
                    <span>1,000h</span>
                    <span>2,000h</span>
                    <span>3,000h</span>
                    <span>4,000h (Monetized)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Video Duration</label>
                    <select
                      value={customVideoLength}
                      onChange={(e) => setCustomVideoLength(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-400"
                    >
                      <option value="5">5 Minutes (Short Video)</option>
                      <option value="10">10 Minutes (Standard)</option>
                      <option value="15">15 Minutes (Recommended)</option>
                      <option value="30">30 Minutes (Fast Accumulation)</option>
                      <option value="60">60 Minutes (Maximum Speed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Retention Rate</label>
                    <select
                      value={retentionPct}
                      onChange={(e) => setRetentionPct(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-400"
                    >
                      <option value="60">60% Average Retention</option>
                      <option value="80">80% High Retention (HereWeGrow Standard)</option>
                      <option value="95">95% Ultra Retention</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Real-time Math Output Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Hours Needed:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">{neededHours.toLocaleString()} Hours</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Minutes to Complete:</span>
                    <span className="font-mono font-bold text-slate-200">{neededMinutes.toLocaleString()} mins</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Est. Views Required:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">{calcEstimatedViews.toLocaleString()} views</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Safe Drip-Feed Pace:</span>
                    <span className="font-mono font-bold text-indigo-300">{recommendedDripDays} to {recommendedDripDays + 3} Days</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const ytService = filteredServices.find(s => s.id === 'yt-002') || filteredServices[0];
                    if (ytService) onSelectService(ytService);
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Get Watch Hours Package (bKash/Nagad)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Official 2026 YouTube Partner Program (YPP) Checklist */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Official Policy Guide</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                2026 YouTube Partner Program (YPP) Eligibility Checklist
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ensure your channel checks off all 5 criteria before submitting your Google AdSense application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">4,000 Watch Hours</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Must be generated from valid public long-form videos within the preceding 365 days.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">1,000 Subscribers</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Real, non-drop subscribers to establish your channel base and community engagement.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">2-Step Verification</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Active 2-Factor Authentication enabled on your linked Google account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">0 Community Strikes</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Channel must have zero active community guideline strikes at the time of review.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Linked AdSense Account</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  An approved Google AdSense profile linked to receive monthly bank deposits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-indigo-950">HereWeGrow Warranty</span>
                </div>
                <p className="text-[11px] text-indigo-900">
                  100% money-back and 365-day auto-refill guarantee on watch time and subscribers.
                </p>
              </div>
            </div>
          </div>

          {/* 3. YouTube AdSense RPM & 1 Million Views Earnings Matrix */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Revenue Breakdown</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                How Much Money Does 1 Million Views Make on YouTube?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Estimated AdSense revenue breakdown based on real RPM (Revenue Per Mille) across high-traffic niches.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white font-bold border-b border-slate-800">
                    <th className="p-4">Content Category / Niche</th>
                    <th className="p-4">Average RPM</th>
                    <th className="p-4">100,000 Views Earnings</th>
                    <th className="p-4 bg-emerald-900/90 text-white font-black">1,000,000 Views Earnings (USD & BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Finance, Crypto & Stock Market</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">$15.00 – $30.00</td>
                    <td className="p-4 font-mono">$1,500 – $3,000</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">$15,000 – $30,000 (৳18,00,000+)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Tech Reviews, AI & Software</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">$8.00 – $18.00</td>
                    <td className="p-4 font-mono">$800 – $1,800</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">$8,000 – $18,000 (৳9,60,000+)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Educational, Tutorials & Coding</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">$5.00 – $12.00</td>
                    <td className="p-4 font-mono">$500 – $1,200</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">$5,000 – $12,000 (৳6,00,000+)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Lifestyle, Travel & Daily Vlogs</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">$3.00 – $7.00</td>
                    <td className="p-4 font-mono">$300 – $700</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">$3,000 – $7,000 (৳3,60,000+)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">Gaming & Entertainment Comedy</td>
                    <td className="p-4 font-mono font-bold text-indigo-700">$2.00 – $5.00</td>
                    <td className="p-4 font-mono">$200 – $500</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">$2,000 – $5,000 (৳2,40,000+)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Long-Form Editorial Authority Guide (Position #0 Target) */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              The Complete Blueprint to Unlocking YouTube Partner Program (YPP) Monetization
            </h2>

            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                1. Understanding the 240,000 Minutes Mathematics
              </h3>
              <p>
                To qualify for ad revenue monetization, YouTube requires <strong>4,000 valid public watch hours</strong> accumulated over the rolling last 365 days. 
                In strict mathematical terms, 4,000 hours equals <strong>240,000 total minutes</strong> (4,000 × 60 = 240,000). 
                If your channel only uploads 2-minute videos, you would need over 120,000 full-length views. 
                However, by uploading 15 to 30-minute videos, you can achieve the entire 4,000 hours with just 8,000 to 16,000 dedicated views.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                2. Why Drip-Feed High Retention Matters (Avoiding Bot Detection)
              </h3>
              <p>
                YouTube’s algorithms utilize sophisticated 48-hour statistical verification windows. 
                Cheap bot traffic that delivers instant 10-second drops is immediately filtered out and discarded by YouTube Studio analytics. 
                HereWeGrow utilizes natural residential playback signatures with authentic browser headers and realistic human playback pacing (drip-feed over 3 to 7 days). 
                This ensures every single minute locks permanently into your monetization progress bar.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                3. How to Prevent "Reused Content" Rejections during YPP Review
              </h3>
              <p>
                When you hit 4,000 hours and submit your channel for review, a human YouTube reviewer assesses your channel. 
                To guarantee approval on your first attempt:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Ensure you have your own original voiceover, camera commentary, or creative value added.</li>
                <li>Write clear, unique descriptions and customize your channel banner and profile icon.</li>
                <li>Do not re-upload unedited clips from movies, viral TikToks, or television shows.</li>
                <li>Upload at least 4 to 8 original long-form videos to showcase an active creator presence.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Facebook Followers & Growth Exclusive: Interactive In-Stream Ads Calculator & Authority Guide */}
      {isFacebookGrowth && (
        <div className="max-w-5xl mx-auto mb-16 space-y-12">
          
          {/* 1. Interactive In-Stream Ads & Monetization Calculator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Meta Monetization Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Facebook In-Stream Ads & Page Growth Calculator
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Calculate remaining requirements for Meta In-Stream Ads (5,000 Followers &amp; 60,000 Minutes) and estimate monthly earnings.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-900/40 border border-blue-700/50 text-right flex-shrink-0">
                <div className="text-[10px] text-blue-300 font-bold uppercase">Meta Milestone Progress</div>
                <div className="text-xl font-black text-emerald-400 font-mono">{fbProgressPct}% Ready</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Followers Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Current Page / Profile Followers:</span>
                    <span className="text-blue-400 font-mono font-black">{currentFbFollowers.toLocaleString()} / 5,000 Followers</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={currentFbFollowers}
                    onChange={(e) => setCurrentFbFollowers(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0 (New Page)</span>
                    <span>2,500</span>
                    <span className="text-emerald-400 font-bold">5,000 (Meta Target)</span>
                    <span>10,000+</span>
                  </div>
                </div>

                {/* 60-Day Watch Time Minutes Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>60-Day Video Watch Time:</span>
                    <span className="text-emerald-400 font-mono font-black">{currentFbMinutes.toLocaleString()} / 60,000 Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="1000"
                    value={currentFbMinutes}
                    onChange={(e) => setCurrentFbMinutes(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0 Mins</span>
                    <span>20,000</span>
                    <span>40,000</span>
                    <span className="text-emerald-400 font-bold">60,000 (In-Stream Ready)</span>
                  </div>
                </div>

                {/* Views & Audience Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Average Video / Reel Views</label>
                    <select
                      value={avgFbPostViews}
                      onChange={(e) => setAvgFbPostViews(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-blue-400"
                    >
                      <option value="5000">5,000 Views / Video</option>
                      <option value="15000">15,000 Views / Video</option>
                      <option value="25000">25,000 Views / Video (Active)</option>
                      <option value="50000">50,000 Views / Video (Viral)</option>
                      <option value="150000">150,000 Views / Video (Mega)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Primary Audience Region</label>
                    <select
                      value={fbAudienceType}
                      onChange={(e) => setFbAudienceType(e.target.value as 'bd' | 'global')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-blue-400"
                    >
                      <option value="bd">🇧🇩 Bangladesh &amp; South Asia ($1.80 RPM)</option>
                      <option value="global">🌐 USA / UK / Global Tier-1 ($5.20 RPM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Math Output Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Followers Needed:</span>
                    <span className="font-mono font-black text-blue-400 text-sm">
                      {neededFbFollowers === 0 ? '✅ Target Reached' : `${neededFbFollowers.toLocaleString()} Followers`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Minutes Needed:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {neededFbMinutes === 0 ? '✅ 60k Complete' : `${neededFbMinutes.toLocaleString()} mins`}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <div className="text-[11px] text-slate-400">Est. Monthly In-Stream Revenue:</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      ${estFbMonthlyEarningsUSD.toLocaleString()} USD
                    </div>
                    <div className="text-xs font-bold text-slate-300 font-mono">
                      (Approx. ৳{estFbMonthlyEarningsBDT.toLocaleString()} BDT)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const fbService = filteredServices.find(s => s.id === 'fb-001') || filteredServices[0];
                    if (fbService) onSelectService(fbService);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Boost Facebook Followers (bKash/Nagad)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Meta In-Stream Ads 2026 Checklist */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Meta Monetization Standards</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                2026 Facebook In-Stream Ads &amp; Stars Checklist
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete these 5 criteria to unlock automated ad revenue sharing directly to your Bangladeshi bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">5,000 Page Followers</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Must have a minimum of 5,000 authentic followers on your page or professional profile.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">60,000 Eligible Minutes</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Total views across on-demand videos and live streams within the rolling last 60 days.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">5 Active Videos</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  At least 5 original public videos published on your page within the last 30 days.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Partner Monetization Policy</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Zero intellectual property flags, unoriginal content warnings, or community violations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Bangladesh Bank Setup</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Direct monthly wire transfer to any Bangladeshi bank (Islami Bank, BRAC, City Bank, etc.).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-950">HereWeGrow 365d Shield</span>
                </div>
                <p className="text-[11px] text-blue-900">
                  Zero password required, non-drop natural delivery, and 365-day automated refill protection.
                </p>
              </div>
            </div>
          </div>

          {/* 3. F-Commerce Social Proof & Conversion Lift Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">F-Commerce Psychology</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                How Follower Authority Multiplies Sales &amp; Trust
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Bangladeshi online shopping conversion rates based on customer trust and page size benchmarks.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white font-bold border-b border-slate-800">
                    <th className="p-4">Page Follower Size</th>
                    <th className="p-4">Customer Trust Level</th>
                    <th className="p-4">Inbox-to-Order Conversion Rate</th>
                    <th className="p-4 bg-blue-900/90 text-white font-black">Algorithm Viral Multiplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">0 – 500 Followers (New Page)</td>
                    <td className="p-4 text-rose-600 font-bold">Low (Customer Hesitation)</td>
                    <td className="p-4 font-mono">1.2% – 1.8%</td>
                    <td className="p-4 bg-slate-50 font-mono text-slate-500">1.0x (Standard Feed)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">2,500 – 5,000 Followers</td>
                    <td className="p-4 text-amber-600 font-bold">Moderate (Established Shop)</td>
                    <td className="p-4 font-mono">3.4% – 4.5%</td>
                    <td className="p-4 bg-slate-50 font-mono text-slate-700">2.2x Reach Lift</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">10,000 – 25,000 Followers</td>
                    <td className="p-4 text-emerald-600 font-bold">High (Trusted Brand)</td>
                    <td className="p-4 font-mono">5.8% – 7.2%</td>
                    <td className="p-4 bg-emerald-50/50 font-mono font-black text-emerald-800">3.8x (Reels Viral Feed)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">50,000+ Followers (Authority)</td>
                    <td className="p-4 text-indigo-700 font-bold">Elite (Market Leader)</td>
                    <td className="p-4 font-mono">8.5% – 11.4%</td>
                    <td className="p-4 bg-blue-50/50 font-mono font-black text-blue-800">5.5x (Priority Distribution)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Long-Form Editorial Authority Guide (Google Position #0 Blueprint) */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              The Definitive 2026 Guide to Growing a High-Converting Facebook Page in Bangladesh
            </h2>

            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                1. The First 60 Minutes Velocity Rule (Cracking Meta's Recommendation AI)
              </h3>
              <p>
                Facebook’s algorithmic feed operates on immediate <strong>engagement velocity</strong>. 
                When you publish a new post, video, or reel, Meta initially serves it to a tiny test sample (roughly 2% to 5% of your audience). 
                If that post accumulates rapid reactions (Likes, Loves, Cares) and comments within the first 60 minutes, the algorithm immediately promotes your content to the wider newsfeed and Facebook Reels recommendation engine. 
                Using HereWeGrow’s instant automated auto-liker and post reaction packages gives your content the early velocity signal required to trigger exponential organic reach.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                2. F-Commerce Conversion Psychology in Bangladesh
              </h3>
              <p>
                In the Bangladeshi F-Commerce landscape, prospective customers are wary of cash-on-delivery fraud and unreliable vendors. 
                Studies indicate that over <strong>82% of shoppers check a page’s follower count, reviews, and post likes</strong> before sending an inbox inquiry or making a purchasing decision. 
                A business page with 10,000+ authentic followers eliminates psychological friction, drastically lowers your advertising Cost-Per-Message (CPM), and increases order conversion rates by up to 340%.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                3. Facebook Professional Mode vs. Classic Business Pages
              </h3>
              <p>
                Meta now allows individual creators to monetize their personal profiles using <strong>Professional Mode</strong>. 
                Whether you operate a creator profile in Professional Mode or a Classic Business Page, HereWeGrow’s followers seamlessly integrate into your account without requiring any administrator invitations or login credentials.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                4. Why Zero Password &amp; 365-Day Refill Guarantee Protects Your Assets
              </h3>
              <p>
                Never share your Facebook password, two-factor authentication codes, or business manager access with any service. 
                HereWeGrow strictly operates on public profile and page URLs. All follower deliveries are backed by our automated <strong>365-Day Refill Protection</strong>, ensuring your follower counts remain permanently stable.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Embedded 1-Click Free Trial Speed Tester */}
      <div className="max-w-5xl mx-auto mb-16">
        <FreeTrialBooster currency={currency} onSelectServiceForOrder={onSelectService} />
      </div>

      {/* SMM-Panel Exclusive: Data-Backed Comparison Table (Position #0 Target) */}
      {isSmmPanel && (
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Why We Beat The Market</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
              HereWeGrow vs. Foreign Panels vs. Local Middlemen
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              See why over 12,000+ creators and agencies in Bangladesh switched to HereWeGrow.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white font-bold border-b border-slate-800">
                    <th className="p-4 sm:p-5">Feature & Capabilities</th>
                    <th className="p-4 sm:p-5 text-slate-400">Foreign SMM Panels</th>
                    <th className="p-4 sm:p-5 text-slate-400">Facebook Page Middlemen</th>
                    <th className="p-4 sm:p-5 bg-indigo-900/90 text-white font-black">💎 HereWeGrow.pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Payment Methods</td>
                    <td className="p-4 sm:p-5 text-slate-600">Crypto / PerfectMoney Only</td>
                    <td className="p-4 sm:p-5 text-slate-600">Manual Send-Money (Scam Risk)</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-emerald-700">✅ Instant bKash, Nagad, Crypto & Cards</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Minimum Order Size</td>
                    <td className="p-4 sm:p-5 text-slate-600">$10 – $25 Minimum Deposit</td>
                    <td className="p-4 sm:p-5 text-slate-600">৳500 – ৳1,000</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-slate-950">✅ ৳2 / $0.02 (Zero Risk Micro-Orders)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Free Live Speed Test</td>
                    <td className="p-4 sm:p-5 text-rose-600">❌ No Free Trial</td>
                    <td className="p-4 sm:p-5 text-rose-600">❌ No Free Trial</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-emerald-700">✅ 100 Free Views in 60 Seconds</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Delivery Velocity</td>
                    <td className="p-4 sm:p-5 text-slate-600">2 – 24 Hours Wait</td>
                    <td className="p-4 sm:p-5 text-slate-600">Unpredictable (Manual)</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-slate-950">⚡ Automated Instant 45s Server Queue</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Refill Warranty</td>
                    <td className="p-4 sm:p-5 text-slate-600">0 – 7 Days</td>
                    <td className="p-4 sm:p-5 text-slate-600">No Guarantee</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-emerald-700">🛡️ 30 to 365 Days Auto-Refill Guarantee</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">Built-in Creator Tools</td>
                    <td className="p-4 sm:p-5 text-rose-600">❌ None</td>
                    <td className="p-4 sm:p-5 text-rose-600">❌ None</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/50 font-bold text-slate-950">✅ 6+ Free Tools (Downloader, Tags, ER%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Platform Filter Tabs (For SMM Panel & All Views) */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              {isSmmPanel ? 'Wholesale SMM Services Catalog' : 'Available Verified Packages'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live server connection • Filter by platform to inspect rates
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {['all', 'facebook', 'instagram', 'youtube', 'tiktok', 'telegram', 'twitter'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePlatformFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePlatformFilter === p
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Services List Cards */}
        <div className="space-y-3 mt-6">
          {filteredServices.map((s) => (
            <div 
              key={s.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    ID: {s.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Non-Drop Refill
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    {s.platform}
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">{s.name}</div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.description || 'High-retention social signal service with automated dispatch.'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                  <span>⚡ Speed: <strong>{s.speed}</strong></span>
                  <span>•</span>
                  <span>Min: <strong>{s.minQty.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Max: <strong>{s.maxQty.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Per 1,000</div>
                  <div className="text-base font-black text-slate-950 font-mono">
                    {currency === 'BDT' ? `৳${s.ratePer1kBDT.toFixed(2)}` : `$${s.ratePer1kUSD.toFixed(3)}`}
                  </div>
                </div>
                <button
                  onClick={() => onSelectService(s)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Step Ordering Walkthrough Guide (`HowTo` Schema) */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 text-center mb-8">
          How to Place an Order in 60 Seconds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <span className="text-2xl font-black text-indigo-600 font-mono">01</span>
            <h3 className="text-sm font-bold text-slate-900">Select Service Package</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose your targeted social platform and review guaranteed non-drop pricing.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <span className="text-2xl font-black text-indigo-600 font-mono">02</span>
            <h3 className="text-sm font-bold text-slate-900">Enter Public Link</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste your public post, video, or channel link. Zero passwords or account access required.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <span className="text-2xl font-black text-indigo-600 font-mono">03</span>
            <h3 className="text-sm font-bold text-slate-900">Instant 60s Start</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay via bKash, Nagad, Crypto, or Wallet. Your order queues into automated servers immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Reseller REST API v2 Integration Code Box */}
      {isSmmPanel && (
        <div className="max-w-5xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-slate-950 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base sm:text-lg">Reseller REST API v2 (Standard SMM Format)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Compatible with RentAPanel, SmartPanel, PerfectPanel, and custom applications.
              </p>
            </div>
            <button
              onClick={handleCopyApi}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy cURL Snippet'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
{`curl -X POST "https://peakerr.com/api/v2" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=add" \\
  -d "service=102" \\
  -d "link=https://facebook.com/your-page" \\
  -d "quantity=1000"`}
          </pre>
        </div>
      )}

      {/* Why Choose Us 4 Pillars */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 text-center mb-8">
          Why Top Creators Choose HereWeGrow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.whyChooseUs.map((w, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">{w.title}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      {config.faqs && config.faqs.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {config.faqs.map((faq, idx) => (
              <details key={idx} className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer">
                <summary className="font-bold text-xs sm:text-sm text-slate-900 list-none flex items-center justify-between">
                  <span>{faq.q}</span>
                  <span className="text-indigo-600 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
