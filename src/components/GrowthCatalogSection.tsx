import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Users,
  Play,
  Camera,
  Video,
  Send,
  Globe,
  Music,
  Briefcase,
  Layers
} from 'lucide-react';
import { PLATFORMS_META, SMM_SERVICES_CATALOG } from '../data/growthData';
import type { SmmService, SocialPlatform } from '../types';

interface GrowthCatalogSectionProps {
  currency: 'BDT' | 'USD';
  onSelectServiceForOrder: (service: SmmService) => void;
  initialPlatform?: SocialPlatform;
}

export const GrowthCatalogSection: React.FC<GrowthCatalogSectionProps> = ({
  currency,
  onSelectServiceForOrder,
  initialPlatform = 'all',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(initialPlatform);
  const [searchQuery, setSearchQuery] = useState('');

  const platformIcons: Record<string, React.ElementType> = {
    all: Sparkles,
    facebook: Users,
    youtube: Play,
    instagram: Camera,
    tiktok: Video,
    telegram: Send,
    twitter: Globe,
    spotify: Music,
    linkedin: Briefcase,
  };

  const filteredServices = useMemo(() => {
    return SMM_SERVICES_CATALOG.filter((service) => {
      const matchesPlatform = selectedPlatform === 'all' || service.platform === selectedPlatform;
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [selectedPlatform, searchQuery]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60">
            <Zap className="w-3.5 h-3.5" />
            <span>High-Velocity SMM Fulfillment Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Growth Services
          </h2>
          <p className="mt-1 text-slate-600 text-sm">
            Handpicked servers with guaranteed 0% drop protection and instant automated start.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search likes, views, followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {PLATFORMS_META.map((plat) => {
          const Icon = platformIcons[plat.id] || Layers;
          const isSelected = selectedPlatform === plat.id;
          return (
            <button
              key={plat.id}
              onClick={() => setSelectedPlatform(plat.id as SocialPlatform)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{plat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="white-card p-12 rounded-3xl text-center border border-slate-200">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No services found</h3>
          <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or selected platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const price = currency === 'BDT' ? `৳ ${service.ratePer1kBDT.toLocaleString()}` : `$ ${service.ratePer1kUSD.toFixed(2)}`;

            return (
              <div
                key={service.id}
                className="white-card white-card-hover p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Category & ID */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                      {service.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      #{service.id}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {service.name}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {service.badges.includes('bengali-target') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        🇧🇩 BD Targeted
                      </span>
                    )}
                    {service.badges.includes('non-drop') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                        🛡️ Non-Drop
                      </span>
                    )}
                    {service.badges.includes('best-seller') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        ⭐ Best Seller
                      </span>
                    )}
                    {service.badges.includes('instant') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                        ⚡ Instant
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                    {service.description}
                  </p>

                  {/* Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Speed: {service.speed}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Refill: {service.refillDays > 0 ? `${service.refillDays} Days` : 'No Refill'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none font-medium">Rate per 1,000</span>
                    <span className="text-lg font-black text-slate-900 leading-tight">
                      {price}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectServiceForOrder(service)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
