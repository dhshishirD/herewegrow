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
  ExternalLink
} from 'lucide-react';
import type { SmmService, UserWallet } from '../types';
import { SMM_SERVICES_CATALOG } from '../data/growthData';

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
      '4000 watch hours in minutes',
      'buy 1000 subscribers and 4000 watch hours',
      'youtube monetization watch hours'
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
        a: '4,000 watch hours is exactly 240,000 minutes (4,000 × 60 = 240,000 minutes). If your average video length is 10 minutes, you need 24,000 full views to achieve monetization.'
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
    title: 'Buy Facebook Followers, Page Likes & Auto Reactions BD | HereWeGrow',
    h1: 'Buy Facebook Followers, Page Likes & Auto Reactions',
    tagline: 'Boost your F-Commerce page credibility, increase post reach with instant auto reactions, and qualify for Facebook In-Stream Ads monetization.',
    heroBadge: '100% Real Bangladeshi Profiles • Instant Delivery',
    targetKeywords: [
      'fb auto likes',
      'facebook followers free',
      'facebook page followers',
      'buy fb followers',
      'facebook likes purchase',
      'facebook followers booster',
      'facebook monetization 60k minutes'
    ],
    metaDescription: 'Buy real Bangladeshi Facebook page likes, profile followers, and post reactions with instant bKash & crypto checkout. 100% Non-Drop guarantee.',
    introText: 'Social proof is the ultimate conversion trigger for Bangladeshi online shops and content creators. With over 60M active Facebook users in Bangladesh, building instant page authority with active followers and high post engagement directly increases sales and unlocks Facebook monetization.',
    showCalculator: 'facebook',
    whyChooseUs: [
      { title: 'Real Bangladeshi Profiles', desc: 'High-quality authentic local profiles with photos and active timelines for maximum trust.' },
      { title: 'Instant 60-Second Start', desc: 'Our automated server triggers within minutes of placing an order.' },
      { title: 'In-Stream Ads Ready', desc: 'Our 60,000 video watch minutes and 5,000 follower packages meet Meta monetization requirements.' }
    ],
    faqs: [
      {
        q: 'Are these Facebook followers real and permanent?',
        a: 'Yes! We deliver high-retention profiles backed by a 60-day auto-refill guarantee so your follower count never drops.'
      },
      {
        q: 'Can I pay with bKash, Nagad, and Crypto?',
        a: 'Yes! We support automated instant checkout via bKash, Nagad, Rocket, Bank Cards, and Binance Pay with 0% fee.'
      },
      {
        q: 'How fast do Facebook post reactions start?',
        a: 'Reactions (Like, Love, Care mix) begin delivering within 30 to 60 seconds of submitting your public post URL.'
      }
    ]
  },
  'instagram-growth': {
    slug: 'instagram-growth',
    platformId: 'instagram',
    title: 'Buy Instagram Followers & Instant Likes BD | HereWeGrow',
    h1: 'Buy Instagram Followers & Instant Likes Delivery',
    tagline: 'Trigger the Instagram Explore and Reels algorithms with premium non-drop followers, instant likes within 60 seconds, and high-retention views.',
    heroBadge: 'Instant 60s Start • Non-Drop Auto-Refill',
    targetKeywords: [
      'buy ig likes instant',
      'instagram likes instant delivery',
      'buy instagram comments instant delivery',
      'cheap instagram likes instant delivery',
      'free instagram followers instant delivery',
      'buy ig followers bangladesh'
    ],
    metaDescription: 'Buy high-quality Instagram followers, instant reels views, and post likes starting at ৳36. Fast delivery, 100% safe, no password needed.',
    introText: 'Instagram algorithms prioritize posts and reels with rapid early engagement velocity. Getting instant likes and high-retention followers signals the Explore page to feature your content to thousands of new viewers.',
    showCalculator: 'instagram',
    whyChooseUs: [
      { title: 'Instant 60s Delivery', desc: 'Likes and reels views start flowing immediately to push your content into viral recommendation loops.' },
      { title: 'Zero Password Needed', desc: 'We only require your public Instagram username or post link.' },
      { title: 'Non-Drop Guaranteed', desc: 'Every follower package is backed by a 30-day automated refill system.' }
    ],
    faqs: [
      {
        q: 'How fast do Instagram likes arrive?',
        a: 'Likes start delivering within 30 to 60 seconds after payment confirmation.'
      },
      {
        q: 'Does buying reels views help trigger the Explore page?',
        a: 'Yes! High initial view volume and watch duration signal high relevance to Instagram’s recommendation engine.'
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
    targetKeywords: ['buy tiktok followers', 'tiktok fyp views', 'tiktok auto likes', 'buy tiktok views bangladesh'],
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
    targetKeywords: ['buy telegram channel members', 'telegram post views', 'telegram group members bd'],
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
  },
  'twitter-growth': {
    slug: 'twitter-growth',
    platformId: 'twitter',
    title: 'Buy Twitter Followers, Retweets & Impressions | HereWeGrow',
    h1: 'Buy Twitter / X Followers, Retweets & Viral Views',
    tagline: 'Boost your crypto project, brand handle, or creator account with high-velocity Twitter impressions, active followers, and instant retweets.',
    heroBadge: 'Algorithm Impressions Trigger • Instant 60s Start',
    targetKeywords: ['buy twitter followers', 'twitter retweets', 'buy x impressions bangladesh'],
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
  }
};

// Aliases for clean URL paths: /services/facebook, /services/instagram, etc.
CATEGORY_CONFIGS['facebook'] = CATEGORY_CONFIGS['facebook-growth'];
CATEGORY_CONFIGS['instagram'] = CATEGORY_CONFIGS['instagram-growth'];
CATEGORY_CONFIGS['youtube'] = CATEGORY_CONFIGS['youtube-monetization'];
CATEGORY_CONFIGS['tiktok'] = CATEGORY_CONFIGS['tiktok-growth'];
CATEGORY_CONFIGS['telegram'] = CATEGORY_CONFIGS['telegram-growth'];
CATEGORY_CONFIGS['linkedin'] = CATEGORY_CONFIGS['linkedin-growth'];
CATEGORY_CONFIGS['twitter'] = CATEGORY_CONFIGS['twitter-growth'];
CATEGORY_CONFIGS['spotify'] = CATEGORY_CONFIGS['spotify-streams'];

interface CategoryLandingPageProps {
  categoryKey: string;
  currency: 'BDT' | 'USD';
  wallet: UserWallet;
  onSelectService: (service: SmmService) => void;
  onOpenWallet: () => void;
}

export const CategoryLandingPage: React.FC<CategoryLandingPageProps> = ({
  categoryKey,
  currency,
  onSelectService,
  onOpenWallet,
}) => {
  const config = CATEGORY_CONFIGS[categoryKey] || CATEGORY_CONFIGS['youtube-monetization'];
  const services = SMM_SERVICES_CATALOG.filter(s => s.platform === config.platformId);

  // YouTube Calculator State
  const [videoMinutes, setVideoMinutes] = useState<number>(15);
  const [targetHours, setTargetHours] = useState<number>(4000);

  // Calculate views & minutes needed
  const totalMinutesNeeded = targetHours * 60;
  const estimatedViewsNeeded = Math.ceil(totalMinutesNeeded / Math.max(videoMinutes * 0.75, 1));

  // Structured Data Schema Injection for Google Rich Snippets
  useEffect(() => {
    document.title = config.title;
    
    // Inject Schema.org JSON-LD for Product & FAQ
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": config.h1,
          "description": config.metaDescription,
          "brand": { "@type": "Brand", "name": "HereWeGrow" },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": currency === 'BDT' ? 'BDT' : 'USD',
            "lowPrice": currency === 'BDT' ? "36.00" : "0.30",
            "highPrice": currency === 'BDT' ? "6400.00" : "52.00",
            "offerCount": services.length
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.98",
            "reviewCount": "1280",
            "bestRating": "5"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": config.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.a
            }
          }))
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config, currency, services]);

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      
      {/* Breadcrumbs Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-slate-500">
          <a href="/" className="hover:text-slate-900 font-medium">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/#growth-catalog" className="hover:text-slate-900 font-medium">Services</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-950 font-bold capitalize">{config.platformId} Growth</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-14 sm:py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{config.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-serif leading-tight">
            {config.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {config.tagline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#service-pricing-table"
              className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>View Packages & Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onOpenWallet}
              className="px-6 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Instant bKash & Crypto Top-up</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>No Password Needed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Fast Automated Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.98 / 5</span> (1,280+ Creators)
            </div>
          </div>

        </div>
      </section>

      {/* Main Content & Interactive Calculator */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* YouTube Watch Time Calculator Widget */}
        {config.showCalculator === 'youtube' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">YouTube Watch Time & Minutes Calculator</h3>
                <p className="text-xs text-slate-400">Calculate exact views and minutes needed to pass the 4,000 hours YPP milestone</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs text-slate-400">Target Hours</div>
                <div className="text-2xl font-black text-white font-mono">{targetHours} Hours</div>
                <div className="text-[11px] text-emerald-400 font-bold">= {totalMinutesNeeded.toLocaleString()} Minutes</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs text-slate-400">Your Video Duration</div>
                <select 
                  value={videoMinutes} 
                  onChange={(e) => setVideoMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                >
                  <option value={10}>10 Minutes Video</option>
                  <option value={15}>15 Minutes (Recommended)</option>
                  <option value={30}>30 Minutes Video</option>
                  <option value={60}>60 Minutes Video (Fastest)</option>
                </select>
                <div className="text-[11px] text-slate-400">Longer video = fewer views needed</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs text-slate-400">Estimated Views Required</div>
                <div className="text-2xl font-black text-amber-400 font-mono">~{estimatedViewsNeeded.toLocaleString()} Views</div>
                <div className="text-[11px] text-emerald-400 font-bold">100% YPP Compliant</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Service Pricing Grid */}
        <div id="service-pricing-table" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
                Available {config.h1} Packages
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Instant delivery • 100% Non-Drop guarantee with automated refill
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => {
              const rate = currency === 'BDT' ? `৳${service.ratePer1kBDT}` : `$${service.ratePer1kUSD.toFixed(2)}`;
              return (
                <div
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {service.category}
                      </span>
                      {service.badges?.includes('best-seller') && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Popular</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-950 leading-snug">
                      {service.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <strong className="text-slate-900">{service.speed}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Refill Guarantee:</span>
                        <strong className="text-emerald-700">{service.refillDays > 0 ? `${service.refillDays} Days Auto-Refill` : 'Lifetime Non-Drop'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Min / Max Quantity:</span>
                        <strong className="text-slate-900">{service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Rate per 1,000:</div>
                      <div className="text-lg font-extrabold text-slate-950 font-mono">{rate}</div>
                    </div>
                    <button
                      onClick={() => onSelectService(service)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Editorial & Why Choose Us (Eliminates Thin Content) */}
        <div className="space-y-8 pt-8 border-t border-slate-100">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-2xl font-extrabold text-slate-950 font-serif">
              Why Creators Trust HereWeGrow for {config.platformId.toUpperCase()} Growth
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {config.introText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {config.whyChooseUs.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Schema Section */}
        <div className="space-y-6 pt-8 border-t border-slate-100 max-w-4xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-950">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-sm font-bold text-slate-950">{faq.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
};
