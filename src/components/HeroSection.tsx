import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Wrench, 
  TrendingUp, 
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
    <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200/80">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-slate-700 text-xs font-bold mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>⚡ High-Speed Server 2026 Online • 100% Non-Drop Refill Protected</span>
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          Scale Your Social Reach with{' '}
          <span className="gradient-indigo-text">Free Creator Tools & Verified Growth</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          The all-in-one creator studio. Use our <strong className="text-slate-900 font-bold">100% Free SEO & Downloader Tools</strong> to craft viral content, or accelerate your audience with <strong className="text-indigo-600 font-bold">guaranteed non-drop SMM delivery</strong> with instant bKash and Nagad checkout.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onExploreStore}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Explore Growth Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreBundles}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>1-Click Monetization Packs</span>
          </button>

          <button
            onClick={onExploreTools}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold border border-indigo-200/80 transition-all"
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>Free Creator Tools (7)</span>
          </button>
        </div>

        {/* Highlight Trust Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          
          <div className="white-card white-card-hover p-4 rounded-2xl flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Instant 15-Min Start</div>
              <div className="text-[11px] text-slate-500">Automated queue API</div>
            </div>
          </div>

          <div className="white-card white-card-hover p-4 rounded-2xl flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">100% Non-Drop Refill</div>
              <div className="text-[11px] text-slate-500">Up to 365 days guarantee</div>
            </div>
          </div>

          <div className="white-card white-card-hover p-4 rounded-2xl flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">bKash & Nagad Auto</div>
              <div className="text-[11px] text-slate-500">Instant BDT / USD credit</div>
            </div>
          </div>

          <div className="white-card white-card-hover p-4 rounded-2xl flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">4.9 / 5 Rating</div>
              <div className="text-[11px] text-slate-500">12,480+ happy clients</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
