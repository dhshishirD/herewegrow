import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  CheckCircle2,
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
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-3 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>High-Velocity SMM Fulfillment Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore Growth Services
          </h2>
          <p className="mt-1 text-slate-300 text-sm">
            Handpicked servers with guaranteed 0% drop protection and instant delivery start.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search likes, views, followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/5 hover:border-indigo-500/30 hover:text-white'
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
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10">
          <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No services found</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or selected platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const price = currency === 'BDT' ? `৳ ${service.ratePer1kBDT.toLocaleString()}` : `$ ${service.ratePer1kUSD.toFixed(2)}`;

            return (
              <div
                key={service.id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      {service.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      ID: #{service.id}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    {service.name}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {service.badges.includes('bengali-target') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        🇧🇩 BD Targeted
                      </span>
                    )}
                    {service.badges.includes('non-drop') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        🛡️ Non-Drop
                      </span>
                    )}
                    {service.badges.includes('best-seller') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
                        ⭐ Best Seller
                      </span>
                    )}
                    {service.badges.includes('instant') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        ⚡ Instant
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-2 font-normal">
                    {service.description}
                  </p>

                  {/* Service Metrics Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Speed: {service.speed}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Refill: {service.refillDays > 0 ? `${service.refillDays} Days` : 'No Refill'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Section */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Rate per 1,000</span>
                    <span className="text-lg font-black text-emerald-400 leading-tight">
                      {price}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectServiceForOrder(service)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
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
