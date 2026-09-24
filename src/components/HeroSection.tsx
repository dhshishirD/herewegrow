import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Wrench, 
  TrendingUp, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

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
          <span>{t('hero_badge')}</span>
        </div>

        {/* Hero Editorial Heading with Playfair Display Accent */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          {t('hero_title_1')}{' '}
          <span className="font-serif-title italic font-normal text-slate-900 block sm:inline">
            {t('hero_title_2')}
          </span>
        </h1>

        {/* Refined Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Primary Pathway Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => onExploreStore()}
            className="px-7 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>{t('hero_cta_store')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreBundles}
            className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-xs hover:shadow-md text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{t('hero_cta_bundles')}</span>
          </button>

          <button
            onClick={() => onExploreTools()}
            className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer active:scale-98 border border-slate-200"
          >
            <Wrench className="w-4 h-4 text-slate-700" />
            <span>{t('hero_cta_tools')}</span>
          </button>
        </div>

        {/* 4 Trust & High-Impact Metric Cards */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
          
          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">{t('hero_metric_1_title')}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t('hero_metric_1_sub')}</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">{t('hero_metric_2_title')}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t('hero_metric_2_sub')}</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">{t('hero_metric_3_title')}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t('hero_metric_3_sub')}</div>
            </div>
          </div>

          <div className="luxury-card luxury-card-hover p-4 rounded-2xl text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-950">{t('hero_metric_4_title')}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t('hero_metric_4_sub')}</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
