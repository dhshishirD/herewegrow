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
  CheckCircle2,
  DollarSign,
  Tag,
  Filter
} from 'lucide-react';
import { PLATFORMS_META, SMM_SERVICES_CATALOG } from '../data/growthData';
import type { SmmService, SocialPlatform, ServiceBadge } from '../types';

interface GrowthCatalogSectionProps {
  currency: 'BDT' | 'USD';
  onSelectServiceForOrder: (service: SmmService) => void;
  initialPlatform?: SocialPlatform;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Services', icon: Layers },
  { id: 'followers', label: 'Followers & Members', icon: Users },
  { id: 'views', label: 'Views & Watch Time', icon: Play },
  { id: 'likes', label: 'Likes & Reactions', icon: Zap },
  { id: 'monetization', label: 'Monetization & YPP', icon: Flame },
  { id: 'live', label: 'Live Stream Viewers', icon: Radio },
  { id: 'comments', label: 'Comments & Reviews', icon: Sparkles },
] as const;

const PRICE_TIERS = [
  { id: 'all', label: 'All Prices' },
  { id: 'budget', label: '💰 Budget / Cheap (<৳100)', maxBDT: 100 },
  { id: 'standard', label: '⚡ Standard (৳100 - ৳300)', minBDT: 100, maxBDT: 300 },
  { id: 'premium', label: '👑 High Quality (৳300 - ৳800)', minBDT: 300, maxBDT: 800 },
  { id: 'vip', label: '💎 VIP / Enterprise (৳800+)', minBDT: 800 },
] as const;

const QUALITY_BADGES: { id: ServiceBadge | 'all'; label: string; icon?: string }[] = [
  { id: 'all', label: 'All Qualities' },
  { id: 'bengali-target', label: '🇧🇩 BD Targeted' },
  { id: 'non-drop', label: '🛡️ Non-Drop' },
  { id: 'auto-refill', label: '🔄 Auto-Refill' },
  { id: 'instant', label: '⚡ Instant 60s' },
  { id: 'best-seller', label: '⭐ Best Seller' },
];

export const GrowthCatalogSection: React.FC<GrowthCatalogSectionProps> = ({
  currency,
  onSelectServiceForOrder,
  initialPlatform = 'all',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(initialPlatform);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all');
  const [selectedQualityBadge, setSelectedQualityBadge] = useState<ServiceBadge | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'speed' | 'refill'>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

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

  // Count services per platform
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SMM_SERVICES_CATALOG.length };
    SMM_SERVICES_CATALOG.forEach(s => {
      counts[s.platform] = (counts[s.platform] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredServices = useMemo(() => {
    return SMM_SERVICES_CATALOG.filter((service) => {
      // 1. Platform filter
      const matchesPlatform = selectedPlatform === 'all' || service.platform === selectedPlatform;
      
      // 2. Category sub-filter
      let matchesCategory = true;
      if (selectedCategoryTab === 'followers') {
        matchesCategory = service.category.toLowerCase().includes('follower') || 
                          service.category.toLowerCase().includes('growth') ||
                          service.category.toLowerCase().includes('member') ||
                          service.category.toLowerCase().includes('connection') ||
                          service.name.toLowerCase().includes('follower') ||
                          service.name.toLowerCase().includes('subscriber') ||
                          service.name.toLowerCase().includes('member');
      } else if (selectedCategoryTab === 'views') {
        matchesCategory = service.category.toLowerCase().includes('view') || 
                          service.category.toLowerCase().includes('watch') ||
                          service.category.toLowerCase().includes('video') ||
                          service.category.toLowerCase().includes('traffic') ||
                          service.category.toLowerCase().includes('music') ||
                          service.name.toLowerCase().includes('view') ||
                          service.name.toLowerCase().includes('play') ||
                          service.name.toLowerCase().includes('stream') ||
                          service.name.toLowerCase().includes('watch');
      } else if (selectedCategoryTab === 'likes') {
        matchesCategory = service.category.toLowerCase().includes('like') || 
                          service.category.toLowerCase().includes('reaction') ||
                          service.category.toLowerCase().includes('engagement') ||
                          service.name.toLowerCase().includes('like') ||
                          service.name.toLowerCase().includes('reaction') ||
                          service.name.toLowerCase().includes('retweet') ||
                          service.name.toLowerCase().includes('upvote');
      } else if (selectedCategoryTab === 'monetization') {
        matchesCategory = service.category.toLowerCase().includes('monetization') ||
                          service.name.toLowerCase().includes('monetization') ||
                          service.name.toLowerCase().includes('4,000 hours') ||
                          service.name.toLowerCase().includes('60,000 minutes') ||
                          service.name.toLowerCase().includes('in-stream') ||
                          service.name.toLowerCase().includes('ypp');
      } else if (selectedCategoryTab === 'live') {
        matchesCategory = service.category.toLowerCase().includes('live') ||
                          service.name.toLowerCase().includes('live') ||
                          service.name.toLowerCase().includes('spaces');
      } else if (selectedCategoryTab === 'comments') {
        matchesCategory = service.category.toLowerCase().includes('comment') ||
                          service.category.toLowerCase().includes('review') ||
                          service.name.toLowerCase().includes('comment') ||
                          service.name.toLowerCase().includes('review');
      }

      // 3. Price Tier Filter
      let matchesPrice = true;
      const bdtRate = service.ratePer1kBDT;
      if (selectedPriceTier === 'budget') {
        matchesPrice = bdtRate < 100;
      } else if (selectedPriceTier === 'standard') {
        matchesPrice = bdtRate >= 100 && bdtRate <= 300;
      } else if (selectedPriceTier === 'premium') {
        matchesPrice = bdtRate > 300 && bdtRate <= 800;
      } else if (selectedPriceTier === 'vip') {
        matchesPrice = bdtRate > 800;
      }

      // 4. Quality Badge Filter
      let matchesQuality = true;
      if (selectedQualityBadge !== 'all') {
        matchesQuality = service.badges.includes(selectedQualityBadge);
      }

      // 5. Search keyword filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.id.toLowerCase().includes(query) ||
        (service.providerServiceId && String(service.providerServiceId).includes(query));

      return matchesPlatform && matchesCategory && matchesPrice && matchesQuality && matchesSearch;
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
      if (sortBy === 'refill') {
        return b.refillDays - a.refillDays;
      }
      // Default: popular / best seller first
      const aScore = (a.badges.includes('best-seller') ? 3 : 0) + (a.badges.includes('bengali-target') ? 2 : 0) + (a.badges.includes('auto-refill') ? 1 : 0);
      const bScore = (b.badges.includes('best-seller') ? 3 : 0) + (b.badges.includes('bengali-target') ? 2 : 0) + (b.badges.includes('auto-refill') ? 1 : 0);
      return bScore - aScore;
    });
  }, [selectedPlatform, selectedCategoryTab, selectedPriceTier, selectedQualityBadge, searchQuery, sortBy, currency]);

  const visibleServices = filteredServices.slice(0, visibleCount);

  const hasActiveFilters = 
    selectedPlatform !== 'all' || 
    selectedCategoryTab !== 'all' || 
    selectedPriceTier !== 'all' || 
    selectedQualityBadge !== 'all' || 
    Boolean(searchQuery.trim());

  const resetAllFilters = () => {
    setSelectedPlatform('all');
    setSelectedCategoryTab('all');
    setSelectedPriceTier('all');
    setSelectedQualityBadge('all');
    setSearchQuery('');
    setSortBy('popular');
    setVisibleCount(24);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200/60 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>High-Velocity Wholesale SMM Marketplace</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-serif">
            Verified Growth Services
          </h2>
          <p className="mt-1 text-slate-600 text-sm max-w-2xl">
            Choose from <strong className="text-slate-900 font-bold">{SMM_SERVICES_CATALOG.length}+</strong> wholesale services with granular filtering across price tiers (budget to VIP), guarantees, delivery speeds, and audience targeting.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search followers, cheap, views, BD..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
              className="w-full appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-xs"
            >
              <option value="popular">⭐ Most Popular</option>
              <option value="price-asc">💰 Price: Low to High (Cheapest)</option>
              <option value="price-desc">💎 Price: High to Low (Premium)</option>
              <option value="speed">⚡ Fastest Instant Start</option>
              <option value="refill">🛡️ Longest Refill Guarantee</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle More Filters Button (Mobile) */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`sm:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              isFilterPanelOpen || selectedPriceTier !== 'all' || selectedQualityBadge !== 'all'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Tiers</span>
          </button>
        </div>
      </div>

      {/* Primary Platform Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {PLATFORMS_META.map((plat) => {
          const Icon = platformIcons[plat.id] || Layers;
          const isSelected = selectedPlatform === plat.id;
          const count = platformCounts[plat.id] || 0;
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
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Sub-Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-4">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategoryTab(tab.id);
                setVisibleCount(24);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-Tier Filter Bar: Price Bracket + Quality Badge */}
      <div className={`p-4 rounded-2xl bg-slate-50/90 border border-slate-200 mb-6 space-y-3 ${isFilterPanelOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Price Range Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>Price Bracket:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRICE_TIERS.map((tier) => {
                const isSelected = selectedPriceTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedPriceTier(tier.id);
                      setVisibleCount(24);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              <span>Guarantee & Quality:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {QUALITY_BADGES.map((badge) => {
                const isSelected = selectedQualityBadge === badge.id;
                return (
                  <button
                    key={badge.id}
                    onClick={() => {
                      setSelectedQualityBadge(badge.id);
                      setVisibleCount(24);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {badge.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Active Results & Quick Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Showing <strong className="text-slate-950 font-bold">{filteredServices.length}</strong> matching growth services</span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Filters active:</span>
            <button
              onClick={resetAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200"
            >
              <X className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-16 rounded-3xl text-center border border-dashed border-slate-300 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-serif">No services match your active filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your price bracket, picking a different category, or resetting all filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            Reset Filters & Show All {SMM_SERVICES_CATALOG.length} Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleServices.map((service) => {
            const price = currency === 'BDT' ? `৳${service.ratePer1kBDT.toLocaleString()}` : `$${service.ratePer1kUSD.toFixed(2)}`;
            const isCopied = copiedId === service.id;
            const isBudget = service.ratePer1kBDT < 100;

            return (
              <div
                key={service.id}
                className="group relative bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar: Category Pill & Service ID */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                        {service.category}
                      </span>
                      {isBudget && (
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                          ⚡ Budget Tier
                        </span>
                      )}
                    </div>
                    
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
