import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Copy, 
  Check, 
  Search, 
  AlertCircle, 
  Wallet, 
  CreditCard, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SMM_SERVICES_CATALOG } from '../data/growthData';
import { createOrder } from '../services/growthService';
import { initiateAutomatedPayment } from '../services/paymentService';
import type { SmmService, UserWallet, SmmOrder, SocialPlatform } from '../types';

interface QuickWholesaleTerminalProps {
  currency: 'BDT' | 'USD';
  wallet: UserWallet;
  onOrderPlaced: (order: SmmOrder, updatedWallet: UserWallet) => void;
  onOpenWallet: () => void;
  defaultPlatform?: SocialPlatform;
}

export const QuickWholesaleTerminal: React.FC<QuickWholesaleTerminalProps> = ({
  currency,
  wallet,
  onOrderPlaced,
  onOpenWallet,
  defaultPlatform = 'all'
}) => {
  // Extract unique categories across all services
  const categoriesList = useMemo(() => {
    const map = new Map<string, { platform: SocialPlatform; count: number }>();
    SMM_SERVICES_CATALOG.forEach(s => {
      if (!map.has(s.category)) {
        map.set(s.category, { platform: s.platform, count: 1 });
      } else {
        const item = map.get(s.category)!;
        item.count += 1;
      }
    });

    return Array.from(map.entries()).map(([name, meta]) => ({
      name,
      platform: meta.platform,
      count: meta.count
    }));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (defaultPlatform !== 'all') {
      const match = categoriesList.find(c => c.platform === defaultPlatform);
      if (match) return match.name;
    }
    return categoriesList[0]?.name || 'Facebook Page Growth';
  });

  const [categorySearch, setCategorySearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // Filter services by selected category
  const servicesInCategory = useMemo(() => {
    return SMM_SERVICES_CATALOG.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    return servicesInCategory[0]?.id || SMM_SERVICES_CATALOG[0]?.id || '';
  });

  // Keep selected service in sync when category changes
  useEffect(() => {
    if (servicesInCategory.length > 0) {
      // If current service isn't in new category, pick first
      const exists = servicesInCategory.some(s => s.id === selectedServiceId);
      if (!exists) {
        setSelectedServiceId(servicesInCategory[0].id);
      }
    }
  }, [servicesInCategory, selectedServiceId]);

  const currentService = useMemo(() => {
    return SMM_SERVICES_CATALOG.find(s => s.id === selectedServiceId) || servicesInCategory[0] || SMM_SERVICES_CATALOG[0];
  }, [selectedServiceId, servicesInCategory]);

  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(() => currentService?.minQty || 1000);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGatewayLoading, setIsGatewayLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Update quantity default when service changes
  useEffect(() => {
    if (currentService) {
      if (quantity < currentService.minQty || quantity > currentService.maxQty) {
        setQuantity(currentService.minQty);
      }
    }
  }, [currentService?.id]);

  // Compute calculated charge
  const rawCost = useMemo(() => {
    if (!currentService) return 0;
    const rate = currency === 'BDT' ? currentService.ratePer1kBDT : currentService.ratePer1kUSD;
    return Number(((quantity / 1000) * rate).toFixed(2));
  }, [currentService, quantity, currency]);

  const currentBalance = currency === 'BDT' ? wallet.balanceBDT : wallet.balanceUSD;
  const hasSufficientBalance = currentBalance >= rawCost && rawCost > 0;

  // Paste link helper
  const handlePasteLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setLink(text.trim());
          setErrorMessage('');
        }
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleCopyServiceId = () => {
    if (!currentService) return;
    navigator.clipboard.writeText(currentService.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  // 1-Click Submit Order from Wallet Balance
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentService) {
      setErrorMessage('Please select a valid wholesale service.');
      return;
    }

    if (!link.trim()) {
      setErrorMessage('Please enter the target public profile, post, or channel link.');
      return;
    }

    if (quantity < currentService.minQty) {
      setErrorMessage(`Minimum order quantity for this service is ${currentService.minQty.toLocaleString()}.`);
      return;
    }

    if (quantity > currentService.maxQty) {
      setErrorMessage(`Maximum order quantity for this service is ${currentService.maxQty.toLocaleString()}.`);
      return;
    }

    if (!hasSufficientBalance) {
      setErrorMessage(`Insufficient wallet balance. You need ${currency === 'BDT' ? `৳${rawCost.toFixed(2)}` : `$${rawCost.toFixed(2)}`}. Please Top-Up or use Direct bKash/Nagad Checkout.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder(currentService, link.trim(), quantity, currency);

      if (result.success && result.order) {
        // Calculate updated wallet
        const updatedWallet: UserWallet = {
          ...wallet,
          balanceBDT: currency === 'BDT' ? Math.max(0, wallet.balanceBDT - rawCost) : wallet.balanceBDT,
          balanceUSD: currency === 'USD' ? Math.max(0, wallet.balanceUSD - rawCost) : wallet.balanceUSD,
          totalSpentBDT: currency === 'BDT' ? wallet.totalSpentBDT + rawCost : wallet.totalSpentBDT,
          totalSpentUSD: currency === 'USD' ? wallet.totalSpentUSD + rawCost : wallet.totalSpentUSD,
        };

        onOrderPlaced(result.order, updatedWallet);
        setSuccessMessage(`Order #${result.order.id} placed successfully! Live delivery server queued.`);
        setLink('');
        
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {
          // confetti fallback
        }
      } else {
        setErrorMessage(result.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct 1-Click Pay via bKash / Nagad / Gateway
  const handleDirectGatewayCheckout = async () => {
    if (!currentService) return;
    if (!link.trim()) {
      setErrorMessage('Please enter your target link before proceeding to payment.');
      return;
    }

    setIsGatewayLoading(true);
    setErrorMessage('');

    try {
      const bdtAmount = currency === 'BDT' ? rawCost : Math.ceil(rawCost * 122);
      
      const res = await initiateAutomatedPayment(
        bdtAmount,
        customerName.trim() || 'Wholesale Client',
        customerEmail.trim() || 'customer@herewegrow.pro',
        {
          orderType: 'smm_service',
          serviceId: currentService.id,
          serviceName: currentService.name,
          link: link.trim(),
          quantity,
          currency,
          cost: rawCost
        }
      );

      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setErrorMessage(res.message || 'Payment gateway initiation failed. Please try again.');
        setIsGatewayLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Payment initialization error.');
      setIsGatewayLoading(false);
    }
  };

  // Filtered categories for search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoriesList;
    return categoriesList.filter(c => 
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) || 
      c.platform.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categoriesList, categorySearch]);

  // Filtered services in category for search
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return servicesInCategory;
    return servicesInCategory.filter(s => 
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [servicesInCategory, serviceSearch]);

  // Placeholder recommendation based on platform
  const linkPlaceholder = useMemo(() => {
    if (!currentService) return 'https://...';
    switch (currentService.platform) {
      case 'facebook':
        return 'https://www.facebook.com/yourpagename or post link';
      case 'instagram':
        return 'https://www.instagram.com/username or reel link';
      case 'youtube':
        return 'https://www.youtube.com/watch?v=... or channel link';
      case 'tiktok':
        return 'https://www.tiktok.com/@username/video/...';
      case 'telegram':
        return 'https://t.me/yourchannelname';
      case 'twitter':
        return 'https://twitter.com/username/status/...';
      case 'spotify':
        return 'https://open.spotify.com/track/... or artist link';
      case 'linkedin':
        return 'https://www.linkedin.com/in/... or company link';
      case 'traffic':
        return 'https://yourwebsite.com';
      default:
        return 'https://your-public-social-link.com';
    }
  }, [currentService?.platform]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Reseller Terminal Header Card */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden mb-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard SMM Reseller API v2 Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
              Quick Wholesale Order Terminal
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-light">
              High-speed 2-step ordering terminal for marketing agencies, bulk buyers & wholesale resellers.
            </p>
          </div>

          {/* Current Wallet Balance Card */}
          <div className="flex-shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Available Balance</span>
              <span className="text-lg sm:text-xl font-mono font-black text-white">
                {currency === 'BDT' ? `৳${wallet.balanceBDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$${wallet.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <button
              onClick={onOpenWallet}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>+ Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90">
        
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Order Validation Note</p>
              <p className="mt-0.5 font-normal text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Order Successfully Placed!</p>
              <p className="mt-0.5 font-normal text-emerald-700">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-6">

          {/* 1. Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-mono flex items-center justify-center">1</span>
                <span>Select Category</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {categoriesList.length} Categories Available
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setServiceSearch('');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-950 font-medium text-sm rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all p-3.5 appearance-none cursor-pointer pr-10 shadow-xs"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.name} value={cat.name} className="py-2 text-slate-900">
                    {cat.name} ({cat.count} servers)
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Service Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-mono flex items-center justify-center">2</span>
                <span>Select Wholesale Service / Server</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {servicesInCategory.length} Options in Category
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-950 font-medium text-xs sm:text-sm rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all p-3.5 appearance-none cursor-pointer pr-10 shadow-xs leading-relaxed"
              >
                {filteredServices.map((srv) => {
                  const rateText = currency === 'BDT' ? `৳${srv.ratePer1kBDT}/1k` : `$${srv.ratePer1kUSD}/1k`;
                  return (
                    <option key={srv.id} value={srv.id} className="py-2 text-slate-900">
                      [#{srv.id}] {srv.name} — {rateText} (Min: {srv.minQty})
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 3. Live Server Specs & Guarantee Details Box */}
          {currentService && (
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                    Service #{currentService.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyServiceId}
                    className="text-[10px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer font-medium"
                    title="Copy Service ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {currentService.badges.includes('bengali-target') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🇧🇩 BD Targeted
                    </span>
                  )}
                  {currentService.badges.includes('non-drop') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> Non-Drop
                    </span>
                  )}
                  {currentService.badges.includes('auto-refill') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      🔄 {currentService.refillDays > 0 ? `${currentService.refillDays}d Auto-Refill` : 'Auto-Refill'}
                    </span>
                  )}
                  {currentService.badges.includes('instant') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> Instant 60s
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {currentService.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Rate / 1k</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                    {currency === 'BDT' ? `৳${currentService.ratePer1kBDT}` : `$${currentService.ratePer1kUSD}`}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Delivery Speed</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {currentService.speed}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Min Limit</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                    {currentService.minQty.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Max Limit</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                    {currentService.maxQty.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Target Link Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-mono flex items-center justify-center">3</span>
                <span>Target Link / URL</span>
              </label>
              <button
                type="button"
                onClick={handlePasteLink}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>📋 Paste Link</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={linkPlaceholder}
              className="w-full bg-white text-slate-950 font-mono text-xs sm:text-sm rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all p-3.5 shadow-xs"
            />
            <p className="mt-1.5 text-[11px] text-slate-500 font-normal">
              Ensure the target profile or post is set to <strong>Public</strong> (not private) before ordering.
            </p>
          </div>

          {/* 5. Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-mono flex items-center justify-center">4</span>
                <span>Order Quantity</span>
              </label>
              {currentService && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Min: {currentService.minQty.toLocaleString()} — Max: {currentService.maxQty.toLocaleString()}
                </span>
              )}
            </div>

            <input
              type="number"
              required
              min={currentService?.minQty || 10}
              max={currentService?.maxQty || 1000000}
              step={10}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="w-full bg-white text-slate-950 font-mono text-base font-bold rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all p-3.5 shadow-xs"
            />

            {/* Quick Quantity Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                { label: 'Min', qty: currentService?.minQty || 100 },
                { label: '+500', qty: 500 },
                { label: '+1,000', qty: 1000 },
                { label: '+2,500', qty: 2500 },
                { label: '+5,000', qty: 5000 },
                { label: '+10,000', qty: 10000 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuantity(preset.label === 'Min' ? preset.qty : Math.min(currentService?.maxQty || 100000, quantity + preset.qty))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-mono text-xs font-semibold transition-all border border-slate-200 hover:border-indigo-200 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Live Cost Calculation Bar */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">
                Total Wholesale Charge
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {currency === 'BDT' ? `৳${rawCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$${rawCost.toFixed(2)}`}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({currency === 'BDT' ? `$${(rawCost / 122).toFixed(2)} USD` : `~৳${(rawCost * 122).toFixed(0)} BDT`})
                </span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="text-[11px] text-slate-400 block font-medium">Your Balance Status</span>
              <span className={`text-xs font-bold ${hasSufficientBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasSufficientBalance ? '✓ Sufficient Funds' : '⚠️ Top-up Required'}
              </span>
            </div>
          </div>

          {/* 7. Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Wallet Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientBalance}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasSufficientBalance
                  ? 'bg-slate-950 hover:bg-indigo-600 text-white hover:shadow-indigo-500/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Wholesale Order...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Place Order (Wallet Balance)</span>
                </>
              )}
            </button>

            {/* Direct Gateway Checkout */}
            <button
              type="button"
              onClick={handleDirectGatewayCheckout}
              disabled={isGatewayLoading}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-md hover:shadow-rose-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGatewayLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting bKash / Nagad Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Pay Directly (bKash / Nagad / Card)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Security & Server Guarantee Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>100% Safe Social Growth Protocols</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Automated 24/7 Server Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Auto-Refill Protection Guaranteed</span>
          </div>
        </div>

      </div>
    </div>
  );
};
