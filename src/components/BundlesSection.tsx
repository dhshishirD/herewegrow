import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame, 
  ArrowRight,
  ShoppingBag,
  Play,
  Camera
} from 'lucide-react';
import { CURATED_GROWTH_BUNDLES } from '../data/growthData';
import type { GrowthBundle } from '../types';

interface BundlesSectionProps {
  currency: 'BDT' | 'USD';
  onOrderBundle: (bundle: GrowthBundle) => void;
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({
  currency,
  onOrderBundle,
}) => {
  const iconMap: Record<string, React.ElementType> = {
    ShoppingBag,
    Youtube: Play,
    Flame,
    Instagram: Camera,
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold mb-3 border border-pink-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Complete Growth Kits</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          1-Click High-Converting Growth Bundles
        </h2>
        <p className="mt-2 text-slate-300 text-sm sm:text-base">
          All-inclusive packages engineered to unlock monetization, boost social proof, and maximize sales conversions.
        </p>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CURATED_GROWTH_BUNDLES.map((bundle) => {
          const Icon = iconMap[bundle.iconName] || Sparkles;
          const currentPrice = currency === 'BDT' ? `৳ ${bundle.priceBDT.toLocaleString()}` : `$ ${bundle.priceUSD.toFixed(2)}`;
          const originalPrice = currency === 'BDT' ? `৳ ${bundle.originalPriceBDT.toLocaleString()}` : `$ ${bundle.originalPriceUSD.toFixed(2)}`;

          return (
            <div
              key={bundle.id}
              className={`glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col justify-between relative ${
                bundle.isPopular ? 'border-pink-500/50 shadow-xl shadow-pink-500/10' : 'border-white/10'
              }`}
            >
              {/* Popular Badge */}
              {bundle.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  🔥 Best Seller Choice
                </div>
              )}

              <div>
                {/* Bundle Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SAVE {bundle.savingsPercent}%
                  </span>
                </div>

                <h3 className="text-base font-black text-white leading-snug">
                  {bundle.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  {bundle.subtitle}
                </p>

                {/* Price Display */}
                <div className="my-5 p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 line-through mr-2 font-medium">{originalPrice}</span>
                    <span className="text-2xl font-black text-emerald-400">{currentPrice}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">One-Time Fee</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 my-4">
                  {bundle.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Est. Delivery: {bundle.deliveryTime}</span>
                </div>
              </div>

              {/* Order Button */}
              <div className="mt-6">
                <button
                  onClick={() => onOrderBundle(bundle)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    bundle.isPopular
                      ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-pink-500/25'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  <span>Claim Bundle Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
