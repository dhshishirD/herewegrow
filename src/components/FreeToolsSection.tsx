import React, { useState } from 'react';
import { 
  Video, 
  Tag, 
  BarChart2, 
  Hash, 
  DollarSign, 
  Type, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  TrendingUp,
  Globe
} from 'lucide-react';
import { VIRAL_TOOLS_META } from '../data/growthData';
import { 
  convertToFancyFonts, 
  extractMockYouTubeTags, 
  calculateEngagementRate, 
  calculateYouTubeEarnings, 
  generateViralHashtags,
  fetchLiveVideoDownload,
  type VideoDownloadResult
} from '../services/growthService';
import type { ViralToolId } from '../types';

interface FreeToolsSectionProps {
  onSelectServiceTab: (platformId?: string) => void;
  currency: 'BDT' | 'USD';
}

export const FreeToolsSection: React.FC<FreeToolsSectionProps> = ({
  onSelectServiceTab,
  currency,
}) => {
  const [activeTool, setActiveTool] = useState<ViralToolId>('tiktok-downloader');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool 1: TikTok & Reels Downloader State
  const [ttUrl, setTtUrl] = useState('https://www.tiktok.com/@creator/video/739281928391');
  const [isProcessingTt, setIsProcessingTt] = useState(false);
  const [ttResult, setTtResult] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoDownloadResult | null>(null);

  // Tool 2: YouTube Tag Extractor State
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=vlog-bangladesh-tour');
  const [ytData, setYtData] = useState(() => extractMockYouTubeTags('https://www.youtube.com/watch?v=vlog-bangladesh-tour'));

  // Tool 3: ER% Calculator State
  const [erFollowers, setErFollowers] = useState<number>(25000);
  const [erLikes, setErLikes] = useState<number>(1200);
  const [erComments, setErComments] = useState<number>(180);
  const [erShares, setErShares] = useState<number>(95);

  // Tool 4: Hashtag Generator State
  const [tagKeyword, setTagKeyword] = useState('ecommerce bd');
  const [tagPlatform, setTagPlatform] = useState<'tiktok' | 'instagram' | 'youtube' | 'facebook'>('instagram');
  const [generatedTags, setGeneratedTags] = useState(() => generateViralHashtags('ecommerce bd', 'instagram'));

  // Tool 5: YouTube Earnings State
  const [ytDailyViews, setYtDailyViews] = useState<number>(15000);
  const [ytCpm, setYtCpm] = useState<number>(2.50);

  // Tool 6: Bio Font Generator State
  const [bioInput, setBioInput] = useState('Digital Creator • Dhaka');
  const fancyFonts = convertToFancyFonts(bioInput);

  // Tool 7: Post Previewer State
  const [prevUsername, setPrevUsername] = useState('brand_bangladesh');
  const [prevCaption, setPrevCaption] = useState('Exciting new product launch! Grab yours now with free home delivery all over BD. 🛍️✨ #ecommerce #bangladesh');
  const [prevLikes, setPrevLikes] = useState(1450);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFetchTt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttUrl) return;
    setIsProcessingTt(true);
    setTtResult(false);
    try {
      const data = await fetchLiveVideoDownload(ttUrl);
      setVideoData(data);
      setTtResult(true);
    } catch (err) {
      console.error(err);
      setTtResult(true);
    } finally {
      setIsProcessingTt(false);
    }
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

  const erResult = calculateEngagementRate(erFollowers, erLikes, erComments, erShares);
  const ytEarnings = calculateYouTubeEarnings(ytDailyViews, ytCpm);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Free Creator Suite (No Account Needed)</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Viral Social Media Creator Tools
        </h2>
        <p className="mt-2 text-slate-600 text-sm sm:text-base">
          Drive organic traffic, analyze competitor tags, and optimize your reach with zero sign-up friction.
        </p>
      </div>

      {/* Tools Nav Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {VIRAL_TOOLS_META.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ViralToolId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{tool.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Clean White Card */}
      <div className="white-card p-6 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* TOOL 1: TIKTOK & REELS DOWNLOADER */}
        {/* ======================================================== */}
        {activeTool === 'tiktok-downloader' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" />
                  TikTok & Instagram Reels No-Watermark Downloader
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Save high-definition MP4 videos without platform logos or watermarks directly to your phone or PC.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 self-start md:self-auto">
                ⚡ HD Fast CDN
              </span>
            </div>

            <form onSubmit={handleFetchTt} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                placeholder="Paste TikTok or Instagram Reel URL here (e.g. https://www.instagram.com/reel/...)"
                value={ttUrl}
                onChange={(e) => setTtUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
              <button
                type="submit"
                disabled={isProcessingTt}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50"
              >
                {isProcessingTt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Clean MP4...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Fetch Video</span>
                  </>
                )}
              </button>
            </form>

            {/* Video Preview & Download Result */}
            {ttResult && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                <div className="w-full md:w-56 h-72 bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300 flex items-center justify-center shadow-xs">
                  {videoData?.coverUrl ? (
                    <img 
                      src={videoData.coverUrl} 
                      alt="Video Cover" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Video className="w-12 h-12 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 flex flex-col justify-end p-3">
                    <span className="text-xs font-bold text-white">{videoData?.author || '@creator'}</span>
                    <span className="text-[10px] text-slate-200">Clean HD Audio + Video</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-left w-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Clean Watermark Removed
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
                      {videoData?.title || 'Social Video Clip — Full HD 1080p [No Logo]'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      File Size: {videoData?.sizeMB || '~14.8 MB'} • Duration: {videoData?.duration || '00:38'} • Format: MP4 HD
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {/* Primary Direct Download */}
                    {videoData?.videoUrl && videoData.videoUrl.startsWith('http') && videoData.source === 'tiktok' ? (
                      <a
                        href={videoData.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        download="HereWeGrow_HD_Video.mp4"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download HD MP4 (Direct Stream)</span>
                      </a>
                    ) : (
                      <a
                        href={`https://snapinsta.app/?url=${encodeURIComponent(ttUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Instagram Reel HD</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}

                    {/* Audio MP3 Download */}
                    {videoData?.audioUrl && (
                      <a
                        href={videoData.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        download="audio.mp3"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download MP3 Audio</span>
                      </a>
                    )}

                    {/* Fast CDN Backup Mirror */}
                    <a
                      href={`https://fastdl.app/en?url=${encodeURIComponent(ttUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold text-xs border border-slate-200 transition-all"
                    >
                      <span>HD Server 2</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Contextual Growth Upsell */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-indigo-600" />
                        Want 10,000+ Views on this Video?
                      </div>
                      <p className="text-[11px] text-indigo-700">
                        Boost your TikTok & Reels FYP algorithm score from only ৳8 per 1k views!
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectServiceTab('tiktok')}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0"
                    >
                      <span>Boost Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 2: YOUTUBE TAGS & SEO EXTRACTOR */}
        {/* ======================================================== */}
        {activeTool === 'youtube-tags' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-red-600" />
                  YouTube Video Tag & Competitor SEO Extractor
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Extract hidden search tags and keywords used by top-ranking YouTube creators.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                SEO Score: {ytData.seoScore}/100
              </span>
            </div>

            <form onSubmit={handleFetchYt} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                placeholder="Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-600"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Extract Tags</span>
              </button>
            </form>

            {/* Extracted Tags Display */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  Extracted {ytData.tags.length} High-Volume Tags ({ytData.characterCount} chars)
                </div>
                <button
                  onClick={() => handleCopy(ytData.tags.join(', '), 'all-tags')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all"
                >
                  {copiedKey === 'all-tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'all-tags' ? 'Copied to Clipboard!' : 'Copy All Tags'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {ytData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleCopy(tag, `tag-${idx}`)}
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 hover:border-red-300 border border-slate-200 text-xs text-slate-800 transition-all group"
                  >
                    <span>{tag}</span>
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-red-600" />
                  </span>
                ))}
              </div>

              {/* Upsell Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                    Fast-Track Your 4,000 Watch Hours & 1,000 Subscribers
                  </div>
                  <p className="text-[11px] text-red-700">
                    Get monetized with permanent YouTube high-retention watch hours & subscribers.
                  </p>
                </div>
                <button
                  onClick={() => onSelectServiceTab('youtube')}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0"
                >
                  <span>Explore YouTube</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 3: ENGAGEMENT RATE CALCULATOR */}
        {/* ======================================================== */}
        {activeTool === 'engagement-calculator' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  Social Media Engagement Rate (ER%) Calculator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Audit influencer health and calculate post interaction quality against global industry standards.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Industry Standard Formula
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Followers</label>
                <input
                  type="number"
                  min="1"
                  value={erFollowers}
                  onChange={(e) => setErFollowers(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Likes per Post</label>
                <input
                  type="number"
                  min="0"
                  value={erLikes}
                  onChange={(e) => setErLikes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Comments per Post</label>
                <input
                  type="number"
                  min="0"
                  value={erComments}
                  onChange={(e) => setErComments(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Shares / Saves</label>
                <input
                  type="number"
                  min="0"
                  value={erShares}
                  onChange={(e) => setErShares(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Engagement Score Results */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:border-r border-slate-200 md:pr-6">
                <div className="text-xs text-slate-500 font-bold uppercase">Engagement Rate</div>
                <div className="text-4xl font-black text-slate-900 mt-1">
                  {erResult.rate}%
                </div>
                <div className="text-xs font-bold mt-1 text-indigo-700">
                  Rating: {erResult.rating}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="text-xs font-bold text-slate-800">AI Growth Benchmark & Recommendation:</div>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {erResult.recommendation}
                </p>
                <button
                  onClick={() => onSelectServiceTab('instagram')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                >
                  <span>Boost Instagram Reactions & Real Comments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 4: AI VIRAL HASHTAG GENERATOR */}
        {/* ======================================================== */}
        {activeTool === 'hashtag-generator' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-emerald-600" />
                  AI Viral Hashtag Generator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate low-competition, high-reach, and trending hashtags customized for your niche.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {(['instagram', 'tiktok', 'youtube', 'facebook'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => {
                      setTagPlatform(plat);
                      setGeneratedTags(generateViralHashtags(tagKeyword, plat));
                    }}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      tagPlatform === plat
                        ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateTags} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Enter topic or niche keyword (e.g. streetwear, photography, freelancing)"
                value={tagKeyword}
                onChange={(e) => setTagKeyword(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Hashtags</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-pink-700">🔥 High-Reach / Explore</span>
                  <button
                    onClick={() => handleCopy(generatedTags.highReach.join(' '), 'high-reach')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'high-reach' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.highReach.map((tag, i) => (
                    <span key={i} className="text-xs bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700">🎯 Medium Competition</span>
                  <button
                    onClick={() => handleCopy(generatedTags.mediumCompetition.join(' '), 'med-reach')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'med-reach' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.mediumCompetition.map((tag, i) => (
                    <span key={i} className="text-xs bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700">⚡ Viral Bangladesh / Niche</span>
                  <button
                    onClick={() => handleCopy(generatedTags.viralNiche.join(' '), 'niche-reach')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'niche-reach' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.viralNiche.map((tag, i) => (
                    <span key={i} className="text-xs bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 5: YOUTUBE EARNINGS CALCULATOR */}
        {/* ======================================================== */}
        {activeTool === 'youtube-earnings' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  YouTube AdSense & Creator Earnings Calculator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Project your channel revenue based on daily views and niche CPM rates.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                1 USD = ৳122 BDT Rate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Estimated Daily Views:</span>
                    <span className="text-indigo-600 font-extrabold">{ytDailyViews.toLocaleString()} views/day</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="500000"
                    step="1000"
                    value={ytDailyViews}
                    onChange={(e) => setYtDailyViews(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1K views</span>
                    <span>100K views</span>
                    <span>500K views</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Target Niche CPM:</span>
                    <span className="text-emerald-700 font-extrabold">${ytCpm.toFixed(2)} USD</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="15.00"
                    step="0.25"
                    value={ytCpm}
                    onChange={(e) => setYtCpm(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>$0.50 (Vlogs/Gaming)</span>
                    <span>$3.50 (Tech/Education)</span>
                    <span>$15.00 (Finance/Crypto)</span>
                  </div>
                </div>
              </div>

              {/* Earnings Table Projection */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Daily Income</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">${ytEarnings.dailyUSD}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">৳{ytEarnings.dailyBDT.toLocaleString()}</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Monthly Income</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">${ytEarnings.monthlyUSD}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">৳{ytEarnings.monthlyBDT.toLocaleString()}</div>
                </div>

                <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 flex flex-col justify-center">
                  <div className="text-[11px] text-indigo-800 font-bold uppercase">Yearly Gross</div>
                  <div className="text-xl font-extrabold text-indigo-900 mt-1">${ytEarnings.yearlyUSD}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">৳{ytEarnings.yearlyBDT.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 6: BIO FONT GENERATOR */}
        {/* ======================================================== */}
        {activeTool === 'bio-fonts' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Type className="w-5 h-5 text-indigo-600" />
                  Instagram Bio & Fancy Unicode Font Generator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transform regular text into aesthetic fonts for Instagram bios, TikTok usernames, and Facebook status updates.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                100% Social Media Compatible
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Type your text here:</label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Type your bio, name, or message..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fancyFonts.map((font, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{font.name}</span>
                    <span className="text-sm font-semibold text-slate-900 truncate block select-all">{font.text}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(font.text, `font-${idx}`)}
                    className="p-2 rounded-lg bg-white hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200 hover:border-transparent transition-all flex-shrink-0"
                    title="Copy Font"
                  >
                    {copiedKey === `font-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOL 7: POST PREVIEWER */}
        {/* ======================================================== */}
        {activeTool === 'post-preview' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Social Post Feed Mockup & Previewer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Preview how your post caption, handles, and media look inside mobile feeds before publishing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Handle</label>
                  <input
                    type="text"
                    value={prevUsername}
                    onChange={(e) => setPrevUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Status</label>
                  <textarea
                    rows={4}
                    value={prevCaption}
                    onChange={(e) => setPrevCaption(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Likes Count</label>
                  <input
                    type="number"
                    value={prevLikes}
                    onChange={(e) => setPrevLikes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Feed Mockup Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 max-w-sm mx-auto w-full shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {prevUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{prevUsername}</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Dhaka, Bangladesh • Just now</div>
                  </div>
                </div>

                <div className="w-full h-52 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold mb-3">
                  <div className="text-center p-4">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <span>Your Post Media Preview</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="text-xs font-bold text-slate-900">
                    {prevLikes.toLocaleString()} likes
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 mr-1">{prevUsername}</span>
                    {prevCaption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
