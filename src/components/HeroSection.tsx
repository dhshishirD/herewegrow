import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle2,
  Flame,
  ArrowRight
} from 'lucide-react';

interface HeroSectionProps {
  onExploreTools: () => void;
  onExploreBundles: () => void;
  onExploreStore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreTools,
  onExploreBundles,
  onExploreStore,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-white/5">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/15 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-pink-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner shadow-indigo-500/10 animate-pulse">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>⚡ High-Speed Server 2026 Online • Auto-Refill Protected</span>
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Supercharge Your Reach with{' '}
          <span className="gradient-text">Creator Tools & Instant Social Growth</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          The ultimate creator ecosystem. Use our <span className="text-pink-400 font-semibold">100% Free SEO & Downloader Tools</span> to craft viral posts, or accelerate your audience with <span className="text-indigo-400 font-semibold">guaranteed non-drop SMM delivery</span>.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onExploreStore}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Explore Growth Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreBundles}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 text-sm font-bold border border-white/10 hover:border-indigo-500/40 transition-all"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>1-Click Monetization Packs</span>
          </button>

          <button
            onClick={onExploreTools}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-white/10 hover:border-pink-500/40 transition-all"
          >
            <Wrench className="w-4 h-4 text-pink-400" />
            <span>Free Creator Tools (7)</span>
          </button>
        </div>

        {/* Highlight Trust Badges */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          
          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Instant 15-Min Start</div>
              <div className="text-[11px] text-slate-400">Automated queue API</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">100% Non-Drop Refill</div>
              <div className="text-[11px] text-slate-400">Up to 365 days guarantee</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">bKash & Nagad Auto</div>
              <div className="text-[11px] text-slate-400">Instant BDT / USD credit</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black text-white">4.9 / 5 Rating</div>
              <div className="text-[11px] text-slate-400">12,400+ happy clients</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
