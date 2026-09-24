import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { VIRAL_TOOLS_META } from '../data/growthData';
import { 
  convertToFancyFonts, 
  extractMockYouTubeTags, 
  calculateEngagementRate, 
  calculateYouTubeEarnings, 
  generateViralHashtags
} from '../services/growthService';
import type { ViralToolId } from '../types';

interface FreeToolsSectionProps {
  onSelectServiceTab: (platformId?: string) => void;
  currency: 'BDT' | 'USD';
  initialPrefilledUrl?: string;
}

export const FreeToolsSection: React.FC<FreeToolsSectionProps> = ({
  onSelectServiceTab,
  currency
}) => {
  const [activeTool, setActiveTool] = useState<ViralToolId>('youtube-tags');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool 1: YouTube Tag Extractor State
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=vlog-bangladesh-tour');
  const [ytData, setYtData] = useState(() => extractMockYouTubeTags('https://www.youtube.com/watch?v=vlog-bangladesh-tour'));

  // Tool 2: ER% Calculator State
  const [erFollowers, setErFollowers] = useState<number>(25000);
  const [erLikes, setErLikes] = useState<number>(1200);
  const [erComments, setErComments] = useState<number>(180);
  const [erShares, setErShares] = useState<number>(95);

  // Tool 3: Hashtag Generator State
  const [tagKeyword, setTagKeyword] = useState('ecommerce bd');
  const [tagPlatform, setTagPlatform] = useState<'tiktok' | 'instagram' | 'youtube' | 'facebook'>('instagram');
  const [generatedTags, setGeneratedTags] = useState(() => generateViralHashtags('ecommerce bd', 'instagram'));

  // Tool 4: YouTube Earnings State
  const [ytDailyViews, setYtDailyViews] = useState<number>(15000);
  const [ytCpm, setYtCpm] = useState<number>(2.50);

  // Tool 5: Bio Font Generator State
  const [bioInput, setBioInput] = useState('Digital Creator • Dhaka');
  const fancyFonts = convertToFancyFonts(bioInput);

  // Tool 6: Post Previewer State
  const [prevUsername, setPrevUsername] = useState('brand_bangladesh');
  const [prevCaption, setPrevCaption] = useState('Exciting new product launch! Grab yours now with free home delivery all over BD. 🛍️✨ #ecommerce #bangladesh');
  const [prevLikes, setPrevLikes] = useState(1450);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  const toolIcons: Record<string, React.ElementType> = {
    'youtube-tags': Tag,
    'engagement-calculator': BarChart2,
    'hashtag-generator': Hash,
    'youtube-earnings': DollarSign,
    'bio-fonts': Type,
    'post-preview': Eye
  };

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Editorial Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-3.5 border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>100% Free Creator Suite • Zero Sign-Up Required</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-serif">
          Viral Social Media Creator Tools
        </h2>
        <p className="mt-3 text-slate-600 text-sm sm:text-base font-normal">
          Drive organic reach, extract high-converting SEO tags, and download high-resolution social media streams in-place.
        </p>
      </div>

      {/* Sleek Tool Navigation Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {VIRAL_TOOLS_META.map((tool) => {
          const Icon = toolIcons[tool.id] || Sparkles;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tool.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Tool Container */}
      <div className="luxury-card rounded-3xl p-6 sm:p-10 transition-all">
        
        {/* ============================================================ */}
        {/* TOOL 1: YOUTUBE TAG EXTRACTOR */}
        {/* ============================================================ */}
        {activeTool === 'youtube-tags' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">YouTube & TikTok SEO Tag Extractor</h3>
              <p className="text-xs sm:text-sm text-slate-500">Uncover hidden viral keyword tags used by top trending videos.</p>
            </div>

            <form onSubmit={handleFetchYt} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="url"
                required
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="Paste YouTube Video URL (e.g. https://youtube.com/watch?v=...)"
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-slate-900 transition-all font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Extract Tags</span>
              </button>
            </form>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Extracted High-Ranking Tags ({ytData.tags.length})</span>
                <button
                  onClick={() => handleCopy(ytData.tags.join(', '), 'yt-all-tags')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
                >
                  {copiedKey === 'yt-all-tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedKey === 'yt-all-tags' ? 'Copied All!' : 'Copy All Tags'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {ytData.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag, `tag-${idx}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>{tag}</span>
                    {copiedKey === `tag-${idx}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOOL 3: ENGAGEMENT RATE (ER%) CALCULATOR */}
        {/* ============================================================ */}
        {activeTool === 'engagement-calculator' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">Social Media Engagement Rate (ER%) Calculator</h3>
              <p className="text-xs sm:text-sm text-slate-500">Calculate authentic engagement benchmarks for brand sponsorships.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Followers</label>
                <input
                  type="number"
                  value={erFollowers}
                  onChange={(e) => setErFollowers(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Avg Likes</label>
                <input
                  type="number"
                  value={erLikes}
                  onChange={(e) => setErLikes(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Avg Comments</label>
                <input
                  type="number"
                  value={erComments}
                  onChange={(e) => setErComments(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Avg Shares</label>
                <input
                  type="number"
                  value={erShares}
                  onChange={(e) => setErShares(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  Calculated Score
                </span>
                <div className="text-4xl font-extrabold text-slate-950 mt-2 font-mono">
                  {erResult.rate}%
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-md">
                  {erResult.recommendation}
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => onSelectServiceTab('instagram')}
                  className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Boost Engagement ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOOL 4: VIRAL HASHTAG & HOOK GENERATOR */}
        {/* ============================================================ */}
        {activeTool === 'hashtag-generator' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">AI Viral Hashtag & Hook Engine</h3>
              <p className="text-xs sm:text-sm text-slate-500">Generate targeted tags organized by reach and competition.</p>
            </div>

            <form onSubmit={handleGenerateTags} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={tagKeyword}
                onChange={(e) => setTagKeyword(e.target.value)}
                placeholder="Enter niche keyword (e.g. fashion, tech, vlog, fitness)..."
                className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-slate-900 font-medium"
              />
              <select
                value={tagPlatform}
                onChange={(e) => setTagPlatform(e.target.value as any)}
                className="px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex-shrink-0"
              >
                Generate
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800">🔥 High Reach (Millions)</span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.highReach.map((t, i) => (
                    <span key={i} className="text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-indigo-800">🎯 Medium Competition</span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.mediumCompetition.map((t, i) => (
                    <span key={i} className="text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-purple-800">⚡ Viral Niche / Local</span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.viralNiche.map((t, i) => (
                    <span key={i} className="text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOOL 5: YOUTUBE EARNINGS & ADSENSE CALCULATOR */}
        {/* ============================================================ */}
        {activeTool === 'youtube-earnings' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">YouTube Creator AdSense & Revenue Projector</h3>
              <p className="text-xs sm:text-sm text-slate-500">Estimate potential monthly & yearly creator earnings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Daily Video Views: {ytDailyViews.toLocaleString()}</label>
                <input
                  type="range"
                  min={1000}
                  max={200000}
                  step={1000}
                  value={ytDailyViews}
                  onChange={(e) => setYtDailyViews(Number(e.target.value))}
                  className="w-full accent-slate-950"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Estimated CPM Rate: ${ytCpm.toFixed(2)}</label>
                <input
                  type="range"
                  min={0.50}
                  max={10.00}
                  step={0.25}
                  value={ytCpm}
                  onChange={(e) => setYtCpm(Number(e.target.value))}
                  className="w-full accent-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500">Estimated Daily</span>
                <div className="text-2xl font-extrabold text-slate-950 mt-1 font-mono">
                  {currency === 'BDT' ? `৳${ytEarnings.dailyBDT.toLocaleString()}` : `$${ytEarnings.dailyUSD.toFixed(2)}`}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800">Estimated Monthly</span>
                <div className="text-2xl font-extrabold text-emerald-950 mt-1 font-mono">
                  {currency === 'BDT' ? `৳${ytEarnings.monthlyBDT.toLocaleString()}` : `$${ytEarnings.monthlyUSD.toFixed(2)}`}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800">Estimated Yearly</span>
                <div className="text-2xl font-extrabold text-indigo-950 mt-1 font-mono">
                  {currency === 'BDT' ? `৳${ytEarnings.yearlyBDT.toLocaleString()}` : `$${ytEarnings.yearlyUSD.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOOL 6: UNICODE BIO FONT STYLER */}
        {/* ============================================================ */}
        {activeTool === 'bio-fonts' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">Unicode Bio Font Generator</h3>
              <p className="text-xs sm:text-sm text-slate-500">Convert standard text into stylish Unicode fonts for your Instagram & TikTok bios.</p>
            </div>

            <input
              type="text"
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Type your bio or caption here..."
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-hidden focus:border-slate-900"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {fancyFonts.map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{f.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{f.text}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(f.text, `font-${i}`)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === `font-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOOL 7: POST PREVIEWER */}
        {/* ============================================================ */}
        {activeTool === 'post-preview' && (
          <div className="max-w-xl mx-auto space-y-6 text-left">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-950">Visual Post & Feed Mockup</h3>
              <p className="text-xs sm:text-sm text-slate-500">Preview how your post caption and branding will look in the real mobile feed.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  value={prevUsername}
                  onChange={(e) => setPrevUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Caption</label>
                <textarea
                  rows={3}
                  value={prevCaption}
                  onChange={(e) => setPrevCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            {/* Mobile Feed Card Mockup */}
            <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-md space-y-3 max-w-sm mx-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {prevUsername.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{prevUsername}</span>
                  <span className="text-[10px] text-slate-400 block">Sponsored • Dhaka, Bangladesh</span>
                </div>
              </div>

              <div className="h-44 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">[ Media Image / Video ]</span>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed">
                <strong className="font-bold mr-1.5">{prevUsername}</strong>
                {prevCaption}
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
