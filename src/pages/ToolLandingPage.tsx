import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  BarChart2, 
  Hash, 
  DollarSign, 
  Type, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  ChevronRight,
  Download,
  Flame,
  ExternalLink,
  Smartphone,
  Laptop,
  Play,
  Share2,
  Video,
  Music,
  ThumbsUp,
  Users
} from 'lucide-react';
import { 
  convertToFancyFonts, 
  extractMockYouTubeTags, 
  calculateEngagementRate, 
  calculateYouTubeEarnings, 
  generateViralHashtags
} from '../services/growthService';
import { updatePageSEO } from '../services/seoService';
import type { ViralToolId } from '../types';

interface ToolSEOConfig {
  slug: string;
  toolId: ViralToolId;
  title: string;
  h1: string;
  metaDescription: string;
  tagline: string;
  keywords: string[];
  howToSteps: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  relatedCategorySlug: string;
  relatedCategoryName: string;
}

export const TOOL_CONFIGS: Record<string, ToolSEOConfig> = {
  'facebook-video-downloader': {
    slug: 'facebook-video-downloader',
    toolId: 'post-preview',
    title: 'Free Facebook Video Downloader HD 1080p (Reels, Story, Audio MP3) | HereWeGrow',
    h1: 'Free Facebook Video & Reels Downloader (1080p HD)',
    metaDescription: 'Download Facebook videos, Reels, and Stories in 1080p Full HD MP4 or MP3 Audio for free. 100% Ad-free, no app required. Fast & secure for iPhone, Android & PC.',
    tagline: 'Save high-definition Facebook videos, private streams, and viral reels directly to your device without annoying ads, popups, or watermarks.',
    keywords: [
      'facebook video downloader',
      'fb video downloader',
      'download facebook video downloader',
      'download audio video facebook',
      'download fb video downloader',
      'download video from facebook video',
      'facebook video download facebook video download',
      'facebook video downlownload',
      'fb video dow',
      'fàcebook video download',
      'sssfacebook video download',
      'video fb downloader',
      'facebook reels download',
      'facebook story download',
      'facebook video download without watermark',
      'sssfacebook downloader',
      'facebook video downloader app',
      'fb video downloader app',
      'facebookdownloadvideo',
      'download video facebook 1080p hd'
    ],
    howToSteps: [
      { step: '01', title: 'Copy Facebook Video Link', desc: 'Open Facebook, tap the Share icon on any video, reel, or story, and select "Copy Link".' },
      { step: '02', title: 'Paste & Select Quality', desc: 'Paste the URL into our downloader box above and choose 1080p Full HD, 720p HD, or 320kbps MP3 Audio.' },
      { step: '03', title: 'Instant Clean Download', desc: 'Click Download to save the clean MP4 video directly to your camera roll or downloads folder with zero ads.' }
    ],
    faqs: [
      {
        q: 'How do I download Facebook videos on iPhone without installing an app?',
        a: 'Open Safari on your iPhone, paste the Facebook video link into our free downloader above, select 1080p HD, and tap "Download". In Safari, tap the download icon in the address bar to save the video directly to your Photos app.'
      },
      {
        q: 'How can I download Facebook Reels in 1080p Full HD without watermark?',
        a: 'Copy the Facebook Reel link, paste it into our tool, select "1080p Full HD", and click Download. You will receive the raw, original-bitrate MP4 file without any watermarks or compression artifacts.'
      },
      {
        q: 'How do I convert Facebook videos to MP3 audio?',
        a: 'Simply paste the Facebook video URL, select the "Audio MP3 (320kbps)" tab, and click Download. You will receive a clean, high-bitrate MP3 audio track instantly.'
      },
      {
        q: 'Why is HereWeGrow better than other Facebook downloader sites (SnapSave, FDown)?',
        a: 'Unlike traditional downloader sites that bombard you with 5+ shady pop-under ads, redirect malware, and fake download buttons, HereWeGrow is 100% ad-free, fast, secure, and provides built-in viral growth tools for creators.'
      },
      {
        q: 'Is it legal to download videos from Facebook?',
        a: 'Yes, downloading public Facebook videos for personal offline viewing, research, or content archiving is legal. Please respect creator copyright and do not re-upload copyrighted media without permission.'
      }
    ],
    relatedCategorySlug: 'facebook-growth',
    relatedCategoryName: 'Facebook Page Likes, Views & Followers'
  },
  'youtube-tags': {
    slug: 'youtube-tags',
    toolId: 'youtube-tags',
    title: 'Free YouTube Tag Extractor & SEO Keyword Finder (2026) | HereWeGrow',
    h1: 'Free YouTube Tag Extractor & SEO Keyword Finder',
    metaDescription: 'Extract competitor tags and discover viral ranking keywords from any YouTube video in seconds. 100% Free online tool to boost YouTube video SEO & views.',
    tagline: 'Discover high-ranking hidden tags and SEO keywords from top viral videos to supercharge your YouTube algorithm rankings.',
    keywords: [
      'youtube tag extractor',
      'extract youtube tags',
      'youtube tags finder',
      'find tags from youtube video',
      'youtube seo tags generator',
      'best tags for youtube video'
    ],
    howToSteps: [
      { step: '01', title: 'Paste Video URL', desc: 'Copy any public YouTube video link and paste it into the search box above.' },
      { step: '02', title: 'Extract Tags in 1-Click', desc: 'Click "Extract Tags" to uncover all public & hidden SEO meta tags used by the creator.' },
      { step: '03', title: 'Copy & Optimize', desc: 'Click "Copy All Tags" and paste them into your YouTube Studio video upload description/tags field.' }
    ],
    faqs: [
      {
        q: 'Do YouTube tags still help with SEO and ranking in 2026?',
        a: 'Yes! While titles and thumbnails drive click-through rate (CTR), video tags provide critical context to the YouTube recommendation algorithm, helping categorize content for related video suggestions.'
      },
      {
        q: 'How many tags should I put on a YouTube video?',
        a: 'YouTube allows up to 500 characters of tags. We recommend using 8 to 15 highly relevant tags that mix exact keyword matches, broad categories, and branded terms.'
      },
      {
        q: 'Is this YouTube tag extractor completely free?',
        a: 'Yes, our tag extractor is 100% free with unlimited extractions. No login or credit card required.'
      }
    ],
    relatedCategorySlug: 'youtube-monetization',
    relatedCategoryName: 'YouTube 4,000 Watch Hours & Subscribers'
  },
  'tiktok-downloader': {
    slug: 'tiktok-downloader',
    toolId: 'youtube-tags',
    title: 'Free TikTok Video Downloader HD No Watermark (2026) | HereWeGrow',
    h1: 'TikTok Video Downloader Without Watermark (HD)',
    metaDescription: 'Download TikTok videos in Full HD MP4 without watermark for free. Fast, unlimited, no registration required. Works on Mobile, iPhone & PC.',
    tagline: 'Save crisp, crystal-clear TikTok videos in 1080p HD without the distracting logo watermark in 1-click.',
    keywords: [
      'tiktok downloader no watermark',
      'download tiktok video hd',
      'tiktok video saver without watermark',
      'tiktok to mp4 downloader',
      'free tiktok video downloader'
    ],
    howToSteps: [
      { step: '01', title: 'Copy TikTok Link', desc: 'Open TikTok, click Share on any video, and tap "Copy Link".' },
      { step: '02', title: 'Paste in Search Box', desc: 'Paste the TikTok video link into our HD downloader above.' },
      { step: '03', title: 'Download Clean MP4', desc: 'Click Download to save the pure HD video without any watermark to your device.' }
    ],
    faqs: [
      {
        q: 'How do I download TikTok videos without watermark on iPhone or Android?',
        a: 'Simply copy the TikTok link from the app, open this page on Safari or Chrome, paste the link, and click Download. The file will save directly to your photos/downloads.'
      },
      {
        q: 'Does this tool store downloaded videos?',
        a: 'No. We respect creator privacy and do not store or track downloaded videos on our servers.'
      }
    ],
    relatedCategorySlug: 'tiktok-viral',
    relatedCategoryName: 'TikTok Viral Views, Followers & Saves'
  },
  'engagement-calculator': {
    slug: 'engagement-calculator',
    toolId: 'engagement-calculator',
    title: 'Social Media Engagement Rate (ER%) Calculator | HereWeGrow',
    h1: 'Social Media Engagement Rate (ER%) Calculator',
    metaDescription: 'Calculate accurate engagement rate percentage (ER%) for Instagram, Facebook, TikTok & YouTube. Benchmark your influencer score against industry averages.',
    tagline: 'Benchmark your real audience engagement and calculate your brand collaboration sponsorship value in seconds.',
    keywords: [
      'engagement rate calculator',
      'instagram engagement calculator',
      'calculate er percentage',
      'influencer engagement rate',
      'social media er tool'
    ],
    howToSteps: [
      { step: '01', title: 'Enter Follower Count', desc: 'Input your total followers or subscriber count.' },
      { step: '02', title: 'Enter Average Likes & Comments', desc: 'Input average likes, comments, and shares per post.' },
      { step: '03', title: 'Get Instant Score & Rating', desc: 'View your real ER% score with industry standard grading (Poor, Average, Good, Viral).' }
    ],
    faqs: [
      {
        q: 'What is considered a good engagement rate on Instagram and TikTok?',
        a: 'An engagement rate between 2% and 5% is considered healthy. Above 5% is considered high, and above 10% is viral/exceptional.'
      },
      {
        q: 'Why do brands care about Engagement Rate more than follower count?',
        a: 'Brands seek active buyers and real attention. A creator with 20k followers and 8% ER frequently generates more sales than an inactive account with 100k followers.'
      }
    ],
    relatedCategorySlug: 'instagram-growth',
    relatedCategoryName: 'Instagram Organic Followers & Likes'
  },
  'hashtag-generator': {
    slug: 'hashtag-generator',
    toolId: 'hashtag-generator',
    title: 'AI Viral Hashtag Generator for Instagram & TikTok | HereWeGrow',
    h1: 'AI Viral Hashtag Generator for High Reach',
    metaDescription: 'Generate trending, high-reach hashtags for Instagram, TikTok, Facebook & YouTube. Smart AI keyword clustering for explosive post visibility.',
    tagline: 'Unlock the algorithmic discover feed by generating optimized, low-competition and viral hashtag clusters.',
    keywords: [
      'hashtag generator',
      'instagram hashtag generator',
      'viral hashtags for tiktok',
      'best hashtags for facebook',
      'trending hashtags today'
    ],
    howToSteps: [
      { step: '01', title: 'Type Your Niche Keyword', desc: 'Enter a topic like "bangladesh fashion", "tech review", or "food vlog".' },
      { step: '02', title: 'Select Target Platform', desc: 'Choose Instagram, TikTok, Facebook, or YouTube.' },
      { step: '03', title: 'Copy Viral Set', desc: '1-click copy the high-converting hashtag bundle into your caption.' }
    ],
    faqs: [
      {
        q: 'How many hashtags should I use on Instagram in 2026?',
        a: 'Instagram recommends using 3 to 5 highly relevant, focused hashtags per post rather than spamming 30 broad tags.'
      }
    ],
    relatedCategorySlug: 'facebook-growth',
    relatedCategoryName: 'Facebook Page Likes & Auto Reactions'
  },
  'youtube-earnings': {
    slug: 'youtube-earnings',
    toolId: 'youtube-earnings',
    title: 'YouTube Money & AdSense Revenue Calculator | HereWeGrow',
    h1: 'YouTube AdSense Earnings & Revenue Calculator',
    metaDescription: 'Estimate your daily, monthly, and yearly YouTube AdSense income based on video views and CPM rates. Free YouTube monetization income estimator.',
    tagline: 'Accurately forecast your YouTube monetization revenue and discover how much 10k, 50k, or 100k views pay.',
    keywords: [
      'youtube money calculator',
      'youtube adsense calculator',
      'how much youtube pays for 1000 views',
      'youtube earnings estimator',
      'youtube monetization revenue'
    ],
    howToSteps: [
      { step: '01', title: 'Set Daily View Count', desc: 'Drag the slider to your average daily channel views.' },
      { step: '02', title: 'Adjust Estimated CPM', desc: 'Select your target region CPM ($1.50 - $8.00 depending on audience geography).' },
      { step: '03', title: 'View Earnings Breakdown', desc: 'See your projected Daily, Monthly, and Annual AdSense cash flow.' }
    ],
    faqs: [
      {
        q: 'How much does YouTube pay for 10,000 views in Bangladesh vs USA?',
        a: 'In Bangladesh, average CPM is $0.50 to $2.00 ($5 to $20 per 10k views). In the US/UK/Canada, CPM ranges from $5 to $25 ($50 to $250 per 10k views).'
      }
    ],
    relatedCategorySlug: 'youtube-monetization',
    relatedCategoryName: 'YouTube Watch Hours & Monetization Services'
  },
  'bio-fonts': {
    slug: 'bio-fonts',
    toolId: 'bio-fonts',
    title: 'Fancy Bio Font Generator for Instagram & Facebook (Copy & Paste) | HereWeGrow',
    h1: 'Fancy Bio Font Generator (100+ Aesthetic Styles)',
    metaDescription: 'Generate aesthetic, stylish Unicode fonts for Instagram bio, Facebook names, TikTok captions & WhatsApp. Instant 1-click copy and paste.',
    tagline: 'Make your social profiles stand out with aesthetic cursive, bold, gothic, and double-struck fonts.',
    keywords: [
      'fancy font generator',
      'instagram bio fonts',
      'stylish font copy and paste',
      'aesthetic fonts for facebook',
      'unicode text generator'
    ],
    howToSteps: [
      { step: '01', title: 'Type Your Bio Text', desc: 'Enter your name, bio, or caption in the input field.' },
      { step: '02', title: 'Browse 15+ Font Styles', desc: 'Instantly view your text rendered in Gothic, Cursive, Aesthetic, and Bold Unicode.' },
      { step: '03', title: '1-Click Copy', desc: 'Click "Copy" next to your favorite style and paste directly into your Instagram/Facebook profile.' }
    ],
    faqs: [
      {
        q: 'Will these fonts work on all phones and browsers?',
        a: 'Yes! They use universal Unicode characters supported by Android, iOS, Windows, and Mac.'
      }
    ],
    relatedCategorySlug: 'instagram-growth',
    relatedCategoryName: 'Instagram Profile Growth & Engagement'
  }
};

interface ToolLandingPageProps {
  toolSlug: string;
  currency: 'BDT' | 'USD';
  onNavigateHome: () => void;
  onNavigateCategory: (slug: string) => void;
}

export const ToolLandingPage: React.FC<ToolLandingPageProps> = ({
  toolSlug,
  currency,
  onNavigateHome,
  onNavigateCategory
}) => {
  const config = TOOL_CONFIGS[toolSlug] || TOOL_CONFIGS['facebook-video-downloader'];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Facebook Downloader States
  const [fbUrl, setFbUrl] = useState('https://www.facebook.com/reel/109283746592819');
  const [fbQuality, setFbQuality] = useState<'1080p' | '720p' | '480p' | 'mp3'>('1080p');
  const [isFbProcessing, setIsFbProcessing] = useState(false);
  const [fbResultReady, setFbResultReady] = useState(true);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'iphone' | 'android' | 'pc'>('iphone');

  // Other Tool states
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=vlog-bangladesh-tour');
  const [ytData, setYtData] = useState(() => extractMockYouTubeTags('https://www.youtube.com/watch?v=vlog-bangladesh-tour'));
  const [erFollowers, setErFollowers] = useState<number>(25000);
  const [erLikes, setErLikes] = useState<number>(1200);
  const [erComments, setErComments] = useState<number>(180);
  const [erShares, setErShares] = useState<number>(95);
  const [tagKeyword, setTagKeyword] = useState('ecommerce bd');
  const [tagPlatform, setTagPlatform] = useState<'tiktok' | 'instagram' | 'youtube' | 'facebook'>('instagram');
  const [generatedTags, setGeneratedTags] = useState(() => generateViralHashtags('ecommerce bd', 'instagram'));
  const [ytDailyViews, setYtDailyViews] = useState<number>(15000);
  const [ytCpm, setYtCpm] = useState<number>(2.50);
  const [bioInput, setBioInput] = useState('Digital Creator • Dhaka');

  const fancyFonts = convertToFancyFonts(bioInput);
  const erResult = calculateEngagementRate(erFollowers, erLikes, erComments, erShares);
  const ytEarnings = calculateYouTubeEarnings(ytDailyViews, ytCpm);

  // Dynamic SEO on Mount / Slug Change
  useEffect(() => {
    updatePageSEO({
      title: config.title,
      description: config.metaDescription,
      keywords: config.keywords,
      canonicalUrl: `https://herewegrow.pro/tools/${config.slug}`,
      faqs: config.faqs,
      howTo: {
        name: `How to Use ${config.h1}`,
        description: config.tagline,
        steps: config.howToSteps.map(s => ({ title: s.title, desc: s.desc }))
      },
      breadcrumbs: [
        { name: 'Home', url: 'https://herewegrow.pro/' },
        { name: 'Free Creator Tools', url: 'https://herewegrow.pro/#tools' },
        { name: config.h1, url: `https://herewegrow.pro/tools/${config.slug}` }
      ],
      schema: {
        '@type': 'SoftwareApplication',
        name: config.h1,
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.98',
          ratingCount: '12490'
        }
      }
    });
  }, [config]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFetchFb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbUrl) return;
    setIsFbProcessing(true);
    setTimeout(() => {
      setIsFbProcessing(false);
      setFbResultReady(true);
    }, 600);
  };

  const handleFetchYt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl) return;
    setYtData(extractMockYouTubeTags(ytUrl));
  };

  const handleGenerateTags = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagKeyword) return;
    setGeneratedTags(generateViralHashtags(tagKeyword, tagPlatform));
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-8">
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors cursor-pointer">
          Free Creator Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{config.h1}</span>
      </nav>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-4 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Free Online Creator Utility • No Ads • No App Needed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {config.h1}
        </h1>

        <p className="mt-4 text-slate-600 text-base leading-relaxed">
          {config.tagline}
        </p>
      </div>

      {/* Interactive Tool Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 mb-16">
        
        {/* Tool: Facebook Video Downloader */}
        {config.slug === 'facebook-video-downloader' && (
          <div className="space-y-6">
            {/* Format Selector */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setFbQuality('1080p')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  fbQuality === '1080p' 
                    ? 'bg-slate-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>1080p Full HD (MP4)</span>
              </button>
              <button
                type="button"
                onClick={() => setFbQuality('720p')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  fbQuality === '720p' 
                    ? 'bg-slate-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span>720p HD (MP4)</span>
              </button>
              <button
                type="button"
                onClick={() => setFbQuality('480p')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  fbQuality === '480p' 
                    ? 'bg-slate-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>SD 480p (Fast)</span>
              </button>
              <button
                type="button"
                onClick={() => setFbQuality('mp3')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  fbQuality === 'mp3' 
                    ? 'bg-slate-950 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-indigo-400" />
                <span>Audio MP3 (320kbps)</span>
              </button>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleFetchFb} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                placeholder="Paste Facebook video / reel link (e.g. https://www.facebook.com/reel/...)"
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={isFbProcessing}
                className="px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isFbProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download HD Video</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Media Result Card */}
            {fbResultReady && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Facebook Media Stream Ready</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Format: <span className="font-bold text-slate-800 uppercase">{fbQuality} MP4</span> • Bitrate: <span className="font-bold text-slate-800">Original Source (Lossless)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(fbUrl, 'fb-download-btn')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {copiedKey === 'fb-download-btn' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saved to Downloads!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Save to Camera Roll / Device</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1-Click Smooth Purchase Viral Booster */}
                <div className="mt-4 pt-4 border-t border-slate-200 bg-white p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Boost This Video's Virality & Reach</div>
                      <div className="text-[11px] text-slate-500">Send 1,000 High Retention Views or 500 Reactions for instant algorithm push.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateCategory('facebook-growth')}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>{currency === 'BDT' ? '৳15 / Boost Now' : '$0.12 / Boost Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Smooth Purchase Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-center">
                <div className="text-[11px] text-slate-500 font-bold uppercase">1,000 Video Views</div>
                <div className="text-xl font-extrabold text-slate-950 mt-1">{currency === 'BDT' ? '৳15' : '$0.12'}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Instant High Retention</div>
                <button
                  onClick={() => onNavigateCategory('facebook-growth')}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  Boost Views
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 hover:border-indigo-300 transition-all text-center relative overflow-hidden">
                <div className="text-[11px] text-indigo-900 font-bold uppercase">500 Post Likes / Love</div>
                <div className="text-xl font-extrabold text-indigo-950 mt-1">{currency === 'BDT' ? '৳25' : '$0.20'}</div>
                <div className="text-[10px] text-indigo-700 font-bold mt-0.5">Non-Drop Real Profiles</div>
                <button
                  onClick={() => onNavigateCategory('facebook-growth')}
                  className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  Boost Reactions
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-center">
                <div className="text-[11px] text-slate-500 font-bold uppercase">1,000 Page Followers</div>
                <div className="text-xl font-extrabold text-slate-950 mt-1">{currency === 'BDT' ? '৳85' : '$0.70'}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Lifetime Guarantee Refill</div>
                <button
                  onClick={() => onNavigateCategory('facebook-growth')}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  Grow Page
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tool: YouTube Tags */}
        {config.toolId === 'youtube-tags' && config.slug === 'youtube-tags' && (
          <div className="space-y-6">
            <form onSubmit={handleFetchYt} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Extract SEO Tags</span>
              </button>
            </form>

            {ytData && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-900">Extracted Tags ({ytData.tags.length})</span>
                  <button
                    onClick={() => handleCopy(ytData.tags.join(', '), 'yt-all')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    {copiedKey === 'yt-all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'yt-all' ? 'Copied!' : 'Copy All Tags'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ytData.tags.map((t, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tool: TikTok Downloader */}
        {config.slug === 'tiktok-downloader' && (
          <div className="space-y-6">
            <form onSubmit={handleFetchYt} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="Paste TikTok video link (e.g. https://www.tiktok.com/@user/video/...)"
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Clean HD</span>
              </button>
            </form>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant MP4 video stream ready without watermark. 1080p Full HD.</span>
              </div>
              <button
                onClick={() => handleCopy(ytUrl, 'tt-down')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer"
              >
                {copiedKey === 'tt-down' ? 'Downloaded!' : 'Save MP4'}
              </button>
            </div>
          </div>
        )}

        {/* Tool: ER% Calculator */}
        {config.slug === 'engagement-calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Followers</label>
                <input
                  type="number"
                  value={erFollowers}
                  onChange={(e) => setErFollowers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Likes</label>
                <input
                  type="number"
                  value={erLikes}
                  onChange={(e) => setErLikes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Comments</label>
                <input
                  type="number"
                  value={erComments}
                  onChange={(e) => setErComments(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Shares</label>
                <input
                  type="number"
                  value={erShares}
                  onChange={(e) => setErShares(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-indigo-900 font-bold uppercase tracking-wider">Your Engagement Rate</div>
                <div className="text-3xl font-extrabold text-indigo-950 font-mono mt-1">{erResult.rate}%</div>
                <p className="text-xs text-indigo-700 mt-1">{erResult.benchmark}</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                Rating: {erResult.rating}
              </div>
            </div>
          </div>
        )}

        {/* Tool: Hashtag Generator */}
        {config.slug === 'hashtag-generator' && (
          <div className="space-y-6">
            <form onSubmit={handleGenerateTags} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={tagKeyword}
                onChange={(e) => setTagKeyword(e.target.value)}
                placeholder="Enter niche keyword (e.g. ecommerce bd, fitness, travel)..."
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 text-xs font-medium"
              />
              <select
                value={tagPlatform}
                onChange={(e: any) => setTagPlatform(e.target.value)}
                className="px-4 py-3.5 rounded-2xl border border-slate-300 text-xs font-bold bg-white"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Generate
              </button>
            </form>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold text-slate-900">Recommended Hashtag Cluster</span>
                <button
                  onClick={() => handleCopy(generatedTags.join(' '), 'tags-all')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  {copiedKey === 'tags-all' ? 'Copied!' : 'Copy Tags'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedTags.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tool: YouTube Earnings */}
        {config.slug === 'youtube-earnings' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Daily Video Views</span>
                  <span className="font-mono text-indigo-600">{ytDailyViews.toLocaleString()} views/day</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="1000"
                  value={ytDailyViews}
                  onChange={(e) => setYtDailyViews(Number(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Estimated CPM Rate ($)</span>
                  <span className="font-mono text-indigo-600">${ytCpm.toFixed(2)} CPM</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="15.00"
                  step="0.25"
                  value={ytCpm}
                  onChange={(e) => setYtCpm(Number(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Daily Income</div>
                <div className="text-xl font-black text-slate-950 font-mono mt-1">${ytEarnings.dailyUSD.toFixed(2)}</div>
                <div className="text-xs text-emerald-700 font-bold">৳{ytEarnings.dailyBDT.toFixed(0)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-[11px] text-indigo-900 font-bold uppercase">Monthly Income</div>
                <div className="text-2xl font-black text-indigo-950 font-mono mt-1">${ytEarnings.monthlyUSD.toFixed(2)}</div>
                <div className="text-xs text-indigo-700 font-bold">৳{ytEarnings.monthlyBDT.toFixed(0)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Yearly Projection</div>
                <div className="text-xl font-black text-slate-950 font-mono mt-1">${ytEarnings.yearlyUSD.toFixed(2)}</div>
                <div className="text-xs text-emerald-700 font-bold">৳{ytEarnings.yearlyBDT.toFixed(0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tool: Bio Fonts */}
        {config.slug === 'bio-fonts' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Type your bio or caption text</label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Type your bio text here..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {fancyFonts.map((f, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{f.name}</div>
                    <div className="text-sm text-slate-900 font-medium truncate mt-0.5">{f.text}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(f.text, `font-${idx}`)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex-shrink-0 cursor-pointer"
                  >
                    {copiedKey === `font-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Special Section for FB Downloader: Top Downloaders Comparison & Suggestions */}
      {config.slug === 'facebook-video-downloader' && (
        <div className="max-w-4xl mx-auto mb-16 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              Top Facebook Video Downloaders (2026 Comparison)
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              Compare HereWeGrow with alternative web tools for downloading Facebook reels, private clips, and stories.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3.5 px-4 font-bold text-slate-900">Platform / Tool</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Ad Experience</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Max Quality</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">MP3 Extraction</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Viral Growth Boost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-emerald-50/30 font-semibold">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-950 font-bold">HereWeGrow (This Tool)</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">0 Ads • 100% Clean</td>
                  <td className="py-3.5 px-4">1080p Full HD / 4K</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">Yes (320kbps)</td>
                  <td className="py-3.5 px-4 text-indigo-600 font-bold">✅ 1-Click Viral Booster</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">SnapSave.app</td>
                  <td className="py-3.5 px-4 text-amber-700">Popups & Redirects</td>
                  <td className="py-3.5 px-4">1080p (Requires render)</td>
                  <td className="py-3.5 px-4 text-slate-600">Yes</td>
                  <td className="py-3.5 px-4 text-slate-400">❌ None</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">FDown.net (FBDown)</td>
                  <td className="py-3.5 px-4 text-rose-700">Heavy Banner Ads</td>
                  <td className="py-3.5 px-4">720p HD / SD</td>
                  <td className="py-3.5 px-4 text-slate-600">Limited</td>
                  <td className="py-3.5 px-4 text-slate-400">❌ None</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">Getfvid.com</td>
                  <td className="py-3.5 px-4 text-amber-700">Moderate Ads</td>
                  <td className="py-3.5 px-4">HD / SD MP4</td>
                  <td className="py-3.5 px-4 text-slate-600">Yes</td>
                  <td className="py-3.5 px-4 text-slate-400">❌ None</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">SaveFrom.net</td>
                  <td className="py-3.5 px-4 text-rose-700">Extension Popups</td>
                  <td className="py-3.5 px-4">720p (1080p muted)</td>
                  <td className="py-3.5 px-4 text-slate-600">Yes</td>
                  <td className="py-3.5 px-4 text-slate-400">❌ None</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Device Specific Guides */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span>How to Download Facebook Videos by Device</span>
            </h3>

            <div className="flex gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveDeviceTab('iphone')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDeviceTab === 'iphone' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                iPhone & iPad (iOS)
              </button>
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDeviceTab === 'android' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Android Phones & Tablets
              </button>
              <button
                onClick={() => setActiveDeviceTab('pc')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDeviceTab === 'pc' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                PC & Mac Computer
              </button>
            </div>

            {activeDeviceTab === 'iphone' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p><strong>Step 1:</strong> In the Facebook app, tap <strong>Share</strong> on the Reel/Video and select <strong>Copy Link</strong>.</p>
                <p><strong>Step 2:</strong> Open Safari, paste the link in HereWeGrow above, and tap <strong>Download HD Video</strong>.</p>
                <p><strong>Step 3:</strong> Tap the Safari download icon (circle with arrow down in the address bar) and select <strong>Save to Photos</strong> to transfer it directly to your iOS Camera Roll.</p>
              </div>
            )}

            {activeDeviceTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p><strong>Step 1:</strong> Tap the three dots (•••) on any Facebook post and tap <strong>Copy link</strong>.</p>
                <p><strong>Step 2:</strong> Open Google Chrome or Samsung Internet, paste the link above, and click <strong>Download</strong>.</p>
                <p><strong>Step 3:</strong> The MP4 video file will automatically save to your phone's <strong>Downloads</strong> folder and appear instantly in your Gallery app.</p>
              </div>
            )}

            {activeDeviceTab === 'pc' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p><strong>Step 1:</strong> Copy the full video URL from your browser address bar (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">https://www.facebook.com/watch/?v=...</code>).</p>
                <p><strong>Step 2:</strong> Paste into HereWeGrow, choose 1080p Full HD resolution, and click <strong>Download</strong>.</p>
                <p><strong>Step 3:</strong> The browser will immediately prompt you to save the file as a crisp <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.mp4</code> file on your desktop or download directory.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Step-by-Step Guide Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 text-center mb-8">
          How to Use the {config.h1}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.howToSteps.map((step) => (
            <div key={step.step} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-2xl font-black text-indigo-600 font-mono">{step.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* High-Intent Conversion Banner */}
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 mb-16 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Scale Beyond Free Tools</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold">Ready to Accelerate Your Real Audience?</h3>
          <p className="text-xs text-slate-300 mt-1">Explore our guaranteed, non-drop {config.relatedCategoryName} with instant bKash, Nagad & crypto.</p>
        </div>
        <button
          onClick={() => onNavigateCategory(config.relatedCategorySlug)}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all flex-shrink-0 cursor-pointer"
        >
          <span>Explore Services</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* FAQ Schema Accordion */}
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
