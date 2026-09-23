import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Wrench, 
  TrendingUp, 
  ArrowRight,
  Flame,
  Search,
  Download,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react';

interface HeroSectionProps {
  onExploreTools: (prefilledUrl?: string) => void;
  onExploreBundles: () => void;
  onExploreStore: (searchQuery?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreTools,
  onExploreBundles,
  onExploreStore,
}) => {
  const [heroInput, setHeroInput] = useState('');

  const handleOmniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) {
      onExploreStore();
      return;
    }

    const val = heroInput.trim().toLowerCase();
    // If it's a URL, open the Free Tools downloader tab
    if (val.startsWith('http') || val.includes('.com') || val.includes('tiktok') || val.includes('instagram') || val.includes('youtu')) {
      onExploreTools(heroInput.trim());
    } else {
      // If it's a text search term (e.g. "followers", "monetization", "facebook"), search in the Growth Store
      onExploreStore(heroInput.trim());
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 md:pb-24 bg-white border-b border-slate-200/80 ambient-hero-glow">
      
      {/* Subtle Background Glow Tint */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-50/50 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Floating Live Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs text-slate-800 text-xs font-bold mb-6 sm:mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Verified Social Growth Infrastructure • 2026 Engine Active</span>
        </div>

        {/* Hero Editorial Heading with Playfair Display Accent */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Scale Your Social Authority with{' '}
          <span className="font-serif-title italic font-normal text-slate-900 block sm:inline">
            Verified Growth & Free Creator Tools
          </span>
        </h1>

        {/* Refined Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          The all-in-one studio for digital creators and brands. Utilize our <strong className="text-slate-900 font-semibold">100% Free SEO & Video Tools</strong> to craft viral content, or accelerate your reach with <strong className="text-slate-900 font-semibold">non-drop guaranteed social delivery</strong> with instant bKash, Nagad & Crypto.
        </p>

        {/* Hero Omni-Action Bar (Interactive Link Resolver & Service Search) */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form 
            onSubmit={handleOmniSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-300 shadow-[0_4px_25px_rgba(15,23,42,0.06)] hover:border-slate-400 transition-all focus-within:ring-2 focus-within:ring-slate-900/10"
          >
            <div className="flex items-center gap-2.5 px-3 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder="Paste video link (TikTok / IG / FB) or search services..."
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden font-medium py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Launch</span>
            </button>
          </form>
          <p className="text-[11px] text-slate-400 mt-2">
            Tip: Paste a TikTok/Reels link to download in HD, or type any keyword (e.g. <em>"monetization"</em>, <em>"facebook likes"</em>).
          </p>
        </div>

        {/* Primary Pathway Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onExploreStore()}
            className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Explore Growth Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreBundles}
            className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>1-Click Monetization Packs</span>
          </button>

          <button
            onClick={() => onExploreTools()}
            className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-slate-700" />
            <span>7 Free Creator Tools</span>
          </button>
        </div>

        {/* 4 Trust & High-Impact Metric Cards */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
          
          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">Instant 15-Min Start</div>
              <div className="text-[11px] text-slate-500 font-medium">Automated queue API</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">Non-Drop Protected</div>
              <div className="text-[11px] text-slate-500 font-medium">Auto refill guarantee</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">bKash & Nagad Auto</div>
              <div className="text-[11px] text-slate-500 font-medium">Instant BDT checkout</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">120,000+ Completed</div>
              <div className="text-[11px] text-slate-500 font-medium">Verified creator orders</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
