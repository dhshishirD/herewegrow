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
  Layers,
  Radio,
  X,
  SlidersHorizontal,
  ChevronDown,
  Copy,
  Check,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { PLATFORMS_META, SMM_SERVICES_CATALOG } from '../data/growthData';
import type { SmmService, SocialPlatform } from '../types';

interface GrowthCatalogSectionProps {
  currency: 'BDT' | 'USD';
  onSelectServiceForOrder: (service: SmmService) => void;
  initialPlatform?: SocialPlatform;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Categories' },
  { id: 'followers', label: 'Followers & Members' },
  { id: 'views', label: 'Views & Watch Time' },
  { id: 'likes', label: 'Likes & Reactions' },
  { id: 'monetization', label: 'Monetization & YPP' },
  { id: 'live', label: 'Live Stream Viewers' },
  { id: 'comments', label: 'Custom Comments & Reviews' },
] as const;

export const GrowthCatalogSection: React.FC<GrowthCatalogSectionProps> = ({
  currency,
  onSelectServiceForOrder,
  initialPlatform = 'all',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(initialPlatform);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'speed'>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    traffic: Globe,
    discord: Radio,
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredServices = useMemo(() => {
    return SMM_SERVICES_CATALOG.filter((service) => {
      // Platform filter
      const matchesPlatform = selectedPlatform === 'all' || service.platform === selectedPlatform;
      
      // Category sub-filter
      let matchesCategory = true;
      if (selectedCategoryTab === 'followers') {
        matchesCategory = service.category.toLowerCase().includes('follower') || 
                          service.category.toLowerCase().includes('growth') ||
                          service.category.toLowerCase().includes('member') ||
                          service.name.toLowerCase().includes('follower') ||
                          service.name.toLowerCase().includes('member');
      } else if (selectedCategoryTab === 'views') {
        matchesCategory = service.category.toLowerCase().includes('view') || 
                          service.category.toLowerCase().includes('watch') ||
                          service.category.toLowerCase().includes('video') ||
                          service.name.toLowerCase().includes('view') ||
                          service.name.toLowerCase().includes('watch');
      } else if (selectedCategoryTab === 'likes') {
        matchesCategory = service.category.toLowerCase().includes('like') || 
                          service.category.toLowerCase().includes('reaction') ||
                          service.category.toLowerCase().includes('engagement') ||
                          service.name.toLowerCase().includes('like') ||
                          service.name.toLowerCase().includes('reaction');
      } else if (selectedCategoryTab === 'monetization') {
        matchesCategory = service.category.toLowerCase().includes('monetization') ||
                          service.name.toLowerCase().includes('monetization') ||
                          service.name.toLowerCase().includes('4,000 hours') ||
                          service.name.toLowerCase().includes('60,000 minutes') ||
                          service.name.toLowerCase().includes('in-stream');
      } else if (selectedCategoryTab === 'live') {
        matchesCategory = service.category.toLowerCase().includes('live') ||
                          service.name.toLowerCase().includes('live');
      } else if (selectedCategoryTab === 'comments') {
        matchesCategory = service.category.toLowerCase().includes('comment') ||
                          service.category.toLowerCase().includes('review') ||
                          service.name.toLowerCase().includes('comment') ||
                          service.name.toLowerCase().includes('review');
      }

      // Search keyword filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.id.toLowerCase().includes(query) ||
        (service.providerServiceId && String(service.providerServiceId).includes(query));

      return matchesPlatform && matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        const rateA = currency === 'BDT' ? a.ratePer1kBDT : a.ratePer1kUSD;
        const rateB = currency === 'BDT' ? b.ratePer1kBDT : b.ratePer1kUSD;
        return rateA - rateB;
      }
      if (sortBy === 'price-desc') {
        const rateA = currency === 'BDT' ? a.ratePer1kBDT : a.ratePer1kUSD;
        const rateB = currency === 'BDT' ? b.ratePer1kBDT : b.ratePer1kUSD;
        return rateB - rateA;
      }
      if (sortBy === 'speed') {
        const aInstant = a.badges.includes('instant') ? 1 : 0;
        const bInstant = b.badges.includes('instant') ? 1 : 0;
        return bInstant - aInstant;
      }
      // Default: popular / best seller first
      const aScore = (a.badges.includes('best-seller') ? 2 : 0) + (a.badges.includes('bengali-target') ? 1 : 0);
      const bScore = (b.badges.includes('best-seller') ? 2 : 0) + (b.badges.includes('bengali-target') ? 1 : 0);
      return bScore - aScore;
    });
  }, [selectedPlatform, selectedCategoryTab, searchQuery, sortBy, currency]);

  const visibleServices = filteredServices.slice(0, visibleCount);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>High-Velocity Wholesale SMM Fulfillment Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-serif">
            Verified Growth Services
          </h2>
          <p className="mt-1 text-slate-600 text-sm max-w-2xl">
            Over 110+ enterprise-grade wholesale servers with guaranteed non-drop protection, real audience targeting, and automated queue delivery.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search services, likes, views, BD..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-xs"
            >
              <option value="popular">⭐ Most Popular / Best Sellers</option>
              <option value="price-asc">💰 Price: Low to High</option>
              <option value="price-desc">💎 Price: High to Low</option>
              <option value="speed">⚡ Fastest Instant Start</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {PLATFORMS_META.map((plat) => {
          const Icon = platformIcons[plat.id] || Layers;
          const isSelected = selectedPlatform === plat.id;
          return (
            <button
              key={plat.id}
              onClick={() => {
                setSelectedPlatform(plat.id as SocialPlatform);
                setVisibleCount(24);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-950 text-white shadow-md scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{plat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Sub-Tabs & Active Results Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategoryTab(tab.id);
                  setVisibleCount(24);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-900 font-bold border border-indigo-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Showing <strong className="text-slate-900 font-bold">{filteredServices.length}</strong> verified services</span>
          {(searchQuery || selectedPlatform !== 'all' || selectedCategoryTab !== 'all') && (
            <button
              onClick={() => {
                setSelectedPlatform('all');
                setSelectedCategoryTab('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:underline font-bold ml-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-16 rounded-3xl text-center border border-dashed border-slate-300 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching services found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword, resetting category filters, or selecting a different platform.
          </p>
          <button
            onClick={() => {
              setSelectedPlatform('all');
              setSelectedCategoryTab('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleServices.map((service) => {
            const price = currency === 'BDT' ? `৳${service.ratePer1kBDT.toLocaleString()}` : `$${service.ratePer1kUSD.toFixed(2)}`;
            const isCopied = copiedId === service.id;

            return (
              <div
                key={service.id}
                className="group relative bg-white border border-slate-200/90 hover:border-indigo-300/80 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar: Category Pill & Service ID */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                      {service.category}
                    </span>
                    
                    <button
                      onClick={(e) => handleCopyId(service.id, e)}
                      title="Copy Service ID"
                      className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>#{service.id}</span>
                    </button>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug font-serif">
                    {service.name}
                  </h3>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {service.badges.includes('bengali-target') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                        <span>🇧🇩</span> BD Targeted
                      </span>
                    )}
                    {service.badges.includes('non-drop') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        Non-Drop
                      </span>
                    )}
                    {service.badges.includes('best-seller') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Best Seller
                      </span>
                    )}
                    {service.badges.includes('instant') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-600" />
                        Instant
                      </span>
                    )}
                    {service.badges.includes('auto-refill') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80">
                        🔄 Auto-Refill
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                    {service.description}
                  </p>

                  {/* Specs & Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{service.speed}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{service.refillDays > 0 ? `${service.refillDays}d Refill` : 'Guaranteed'}</span>
                    </div>
                  </div>

                  {/* Quantity Limits */}
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Min: {service.minQty.toLocaleString()}</span>
                    <span>Max: {service.maxQty.toLocaleString()}</span>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none font-medium">Rate per 1,000</span>
                    <span className="text-base sm:text-lg font-black text-slate-950 font-mono tracking-tight leading-tight">
                      {price}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectServiceForOrder(service)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button if more services available */}
      {filteredServices.length > visibleCount && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 font-bold text-xs shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Load More Services ({filteredServices.length - visibleCount} remaining)</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

    </section>
  );
};
