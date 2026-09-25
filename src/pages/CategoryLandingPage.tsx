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
  Users
} from 'lucide-react';
import type { SmmService, UserWallet } from '../types';
import { SMM_SERVICES_CATALOG } from '../data/growthData';
import { updatePageSEO } from '../services/seoService';

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
    title: 'Best & Cheapest SMM Panel (2026) — Fast Social Growth & Reseller API | HereWeGrow',
    h1: 'Best & Cheapest SMM Panel for Social Media Growth',
    tagline: 'The #1 wholesale SMM reseller panel for Facebook, Instagram, YouTube, TikTok & Telegram. Automated instant delivery with bKash, Nagad, Crypto & Cards.',
    heroBadge: 'Wholesale Direct API • Starting at ৳2 / $0.02',
    targetKeywords: [
      'smm panel',
      'best smm panel',
      'cheapest smm panel',
      'free smm panel',
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
    metaDescription: 'Access the best and cheapest SMM panel for Facebook, Instagram, TikTok, YouTube & Telegram. 100% Non-drop guaranteed with instant bKash, Nagad & Crypto.',
    introText: 'HereWeGrow is a next-generation SMM reseller panel engineered for digital creators, marketing agencies, and reseller businesses. Directly integrated with high-capacity wholesale servers, our system delivers high-retention followers, viral video views, auto likes, and channel monetization watch hours with automated instant delivery.',
    whyChooseUs: [
      { title: 'Cheapest Wholesale Rates', desc: 'Direct provider connection ensures the lowest prices on the market starting at just ৳2 / $0.02.' },
      { title: 'Zero Password Required', desc: 'We only need your public post or profile link. Your account security is 100% protected.' },
      { title: 'Instant Automated Delivery', desc: 'Orders dispatch to automated server queues within 30 to 60 seconds.' },
      { title: 'bKash & Nagad Auto Gateway', desc: 'Seamless 1-click BDT payment and global Binance Pay / Crypto processing.' }
    ],
    faqs: [
      {
        q: 'What is an SMM panel and how does it work?',
        a: 'An SMM (Social Media Marketing) panel is an automated online platform where creators, brands, and resellers purchase social media services like followers, likes, video views, and watch hours to kick-start organic algorithm reach.'
      },
      {
        q: 'Is HereWeGrow the best SMM panel for YouTube watch time and Facebook?',
        a: 'Yes! HereWeGrow specializes in policy-compliant YouTube 4,000 watch hours (YPP monetization safe) and authentic Bangladeshi Facebook page followers with 365-day refill protection.'
      },
      {
        q: 'Can I resell HereWeGrow services using API?',
        a: 'Yes! We provide a free REST API v2 that seamlessly connects with any SMM website or custom software for automated order fulfillment.'
      }
    ]
  },
  'youtube-monetization': {
    slug: 'youtube-monetization',
    platformId: 'youtube',
    title: 'Buy YouTube 4000 Watch Hours & Subscribers (YPP Monetization) | HereWeGrow',
    h1: 'Buy 4,000 YouTube Watch Hours & Subscribers',
    tagline: 'Fast-track your YouTube Partner Program (YPP) AdSense monetization with 100% policy-compliant, non-drop watch time and high-retention views.',
    heroBadge: 'Verified YPP AdSense Safe • 1-Year Refill Guarantee',
    targetKeywords: [
      '4000 watch hours on youtube',
      'buy 4000 watch hours on youtube cheap',
      'youtube watch hours for monetization',
      'youtube views increase',
      'boost youtube views',
      'free youtube subscribers',
      'free youtube views',
      '1 million views on youtube money',
      'tool seo youtube'
    ],
    metaDescription: 'Buy 4000 watch hours and 1000 subscribers for YouTube monetization. 100% compliant with YouTube Partner Program (YPP). Instant bKash & Crypto payment.',
    introText: 'Unlocking the YouTube Partner Program requires 4,000 valid public watch hours (240,000 minutes) and 1,000 subscribers within the last 12 months. HereWeGrow provides high-retention, steady drip-feed watch duration from authentic user sessions that stick permanently in your YouTube Studio analytics.',
    showCalculator: 'youtube',
    whyChooseUs: [
      { title: '100% YPP Monetization Safe', desc: 'Our drip-speed delivery mimics organic viewers, ensuring full compliance with YouTube community guidelines.' },
      { title: '365-Day Refill Protection', desc: 'Every watch time and subscriber order comes with an unconditional 1-year auto-refill warranty.' },
      { title: 'No Passwords Required', desc: 'Only your public channel or video link is needed. Your account remains 100% secure.' }
    ],
    faqs: [
      {
        q: 'How many minutes is 4,000 watch hours on YouTube?',
        a: '4,000 watch hours is exactly 240,000 minutes (4,000 × 60 = 240,000 minutes). If your average video length is 15 minutes, you need 16,000 full views to achieve monetization.'
      },
      {
        q: 'Will my channel get monetized and approved for AdSense?',
        a: 'Yes! Our watch hours are generated from real desktop and mobile user agents with natural playback pacing, passing YouTube Studio review without policy strikes.'
      },
      {
        q: 'What video length is recommended for watch hours?',
        a: 'We recommend uploading at least one long-form video of 15 to 60 minutes for the fastest and most stable watch-hour accumulation.'
      }
    ]
  },
  'facebook-growth': {
    slug: 'facebook-growth',
    platformId: 'facebook',
    title: 'Increase Facebook Followers & Boost Page Likes (bKash/Nagad) | HereWeGrow',
    h1: 'How to Increase Facebook Followers & Page Growth Fast',
    tagline: 'Boost your F-Commerce page credibility, increase post reach with instant auto reactions, and qualify for Facebook In-Stream Ads monetization.',
    heroBadge: '100% Real Bangladeshi Profiles • Instant Delivery',
    targetKeywords: [
      'increase facebook followers',
      'facebook followers booster',
      'increase fb followers',
      'how to get more followers on facebook',
      'how to grow facebook page',
      'facebook page followers increase',
      'facebook followers free',
      'fb auto likes',
      'buy fb followers',
      'facebook likes purchase',
      'facebook monetization 60k minutes'
    ],
    metaDescription: 'Increase Facebook followers and page likes with instant bKash, Nagad & Crypto checkout. Real Bangladeshi profiles, 100% Non-Drop guarantee.',
    introText: 'Social proof is the ultimate conversion trigger for Bangladeshi online shops and content creators. With over 60M active Facebook users in Bangladesh, building instant page authority with active followers and high post engagement directly increases sales and unlocks Facebook monetization.',
    showCalculator: 'facebook',
    whyChooseUs: [
      { title: 'Real Bangladeshi Profiles', desc: 'High-quality authentic local profiles with photos and active timelines for maximum trust.' },
      { title: 'Instant 60-Second Start', desc: 'Our automated server triggers within minutes of placing an order.' },
      { title: 'In-Stream Ads Ready', desc: 'Our 60,000 video watch minutes and 5,000 follower packages meet Meta monetization requirements.' }
    ],
    faqs: [
      {
        q: 'How to increase Facebook page followers quickly?',
        a: 'You can increase followers organically by posting reels, or accelerate your authority instantly with HereWeGrow’s non-drop Bangladeshi followers package starting at only ৳45.'
      },
      {
        q: 'Are these Facebook followers real and permanent?',
        a: 'Yes! We deliver high-retention profiles backed by a 60-day auto-refill guarantee so your follower count never drops.'
      },
      {
        q: 'Can I pay with bKash, Nagad, and Crypto?',
        a: 'Yes! We support automated instant checkout via bKash, Nagad, Rocket, Bank Cards, and Binance Pay with 0% fee.'
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
  const services = config.platformId === 'all' 
    ? SMM_SERVICES_CATALOG.slice(0, 15)
    : SMM_SERVICES_CATALOG.filter(s => s.platform === config.platformId);

  // YouTube Calculator State
  const [videoMinutes, setVideoMinutes] = useState<number>(15);
  const [targetHours, setTargetHours] = useState<number>(4000);

  const totalMinutesNeeded = targetHours * 60;
  const estimatedViewsNeeded = Math.ceil(totalMinutesNeeded / Math.max(videoMinutes * 0.75, 1));

  // Structured Data Schema Injection for Google Rich Snippets
  useEffect(() => {
    updatePageSEO({
      title: config.title,
      description: config.metaDescription,
      keywords: config.targetKeywords,
      canonicalUrl: `https://herewegrow.pro/services/${config.slug}`,
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
          offerCount: String(services.length || 10)
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
  }, [config, currency, services.length]);

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
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold mb-4 border border-slate-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{config.heroBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {config.h1}
        </h1>

        <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
          {config.tagline}
        </p>

        {/* Quick Keyword Pills for Organic Context */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {config.targetKeywords.slice(0, 6).map((kw, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Intro Editorial Box */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 mb-14 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="font-bold text-slate-950 text-base mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Why Organic Authority Matters</span>
        </div>
        <p>{config.introText}</p>
      </div>

      {/* Interactive YouTube Watch Hours Calculator if applicable */}
      {config.showCalculator === 'youtube' && (
        <div className="max-w-3xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-indigo-50/70 border border-indigo-200">
          <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm mb-4">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Interactive 4,000 Watch Hours Duration Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Video Length (Minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={videoMinutes}
                onChange={(e) => setVideoMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Watch Hours</label>
              <input
                type="number"
                value={targetHours}
                onChange={(e) => setTargetHours(Math.max(100, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Estimated High-Retention Views Needed:</div>
              <div className="text-2xl font-black text-indigo-950 font-mono mt-0.5">~{estimatedViewsNeeded.toLocaleString()} Views</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Total Minutes:</div>
              <div className="text-base font-bold text-emerald-700 font-mono">{totalMinutesNeeded.toLocaleString()} Mins</div>
            </div>
          </div>
        </div>
      )}

      {/* Services List Table / Cards */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
            Available Verified Packages
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {services.length} services ready
          </span>
        </div>

        <div className="space-y-3">
          {services.map((s) => (
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
