import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  Link as LinkIcon, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder } from '../services/growthService';
import type { SmmService, GrowthBundle, UserWallet, SmmOrder } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: SmmService | null;
  bundle: GrowthBundle | null;
  currency: 'BDT' | 'USD';
  wallet: UserWallet;
  onOrderPlaced: (order: SmmOrder, updatedWallet: UserWallet) => void;
  onOpenWallet: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  service,
  bundle,
  currency,
  wallet,
  onOrderPlaced,
  onOpenWallet,
}) => {
  if (!isOpen || (!service && !bundle)) return null;

  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(service ? service.minQty : 1000);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute pricing
  let totalCost = 0;
  if (bundle) {
    totalCost = currency === 'BDT' ? bundle.priceBDT : bundle.priceUSD;
  } else if (service) {
    const rate = currency === 'BDT' ? service.ratePer1kBDT : service.ratePer1kUSD;
    totalCost = Number(((quantity / 1000) * rate).toFixed(2));
  }

  const currentBalance = currency === 'BDT' ? wallet.balanceBDT : wallet.balanceUSD;
  const hasSufficientBalance = currentBalance >= totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!link.trim()) {
      setErrorMessage('Please enter your valid social media link or username.');
      return;
    }

    if (!hasSufficientBalance) {
      setErrorMessage(`Insufficient balance! Required: ${currency === 'BDT' ? `৳${totalCost}` : `$${totalCost}`}, Available: ${currency === 'BDT' ? `৳${currentBalance.toFixed(2)}` : `$${currentBalance.toFixed(2)}`}`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let targetService: SmmService;
      if (service) {
        targetService = service;
      } else {
        // Construct simulated bundle service
        targetService = {
          id: bundle!.id,
          name: bundle!.title,
          platform: bundle!.platform,
          category: 'Curated Growth Bundle',
          ratePer1kBDT: bundle!.priceBDT,
          ratePer1kUSD: bundle!.priceUSD,
          minQty: 1000,
          maxQty: 1000,
          speed: bundle!.deliveryTime,
          refillDays: 60,
          badges: ['best-seller', 'non-drop', 'auto-refill'],
          description: bundle!.subtitle
        };
      }

      const result = createOrder(targetService, link, quantity, currency);
      setIsSubmitting(false);

      if (result.success && result.order) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error(e);
        }

        const newWallet: UserWallet = {
          ...wallet,
          balanceBDT: currency === 'BDT' ? wallet.balanceBDT - totalCost : wallet.balanceBDT - (totalCost * 122),
          balanceUSD: currency === 'USD' ? wallet.balanceUSD - totalCost : wallet.balanceUSD - (totalCost / 122),
          totalSpentBDT: currency === 'BDT' ? wallet.totalSpentBDT + totalCost : wallet.totalSpentBDT,
          totalSpentUSD: currency === 'USD' ? wallet.totalSpentUSD + totalCost : wallet.totalSpentUSD
        };

        onOrderPlaced(result.order, newWallet);
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    }, 1000);
  };

  const title = bundle ? bundle.title : service?.name;
  const description = bundle ? bundle.subtitle : service?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1322] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              1-Click Instant Fulfillment
            </span>
            <h3 className="text-base font-bold text-white mt-1 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Link / URL or Username</span>
            </label>
            <input
              type="text"
              required
              placeholder="https://facebook.com/... or https://youtube.com/watch?v=..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ensure account / post privacy is set to <strong>Public</strong> before placing order.
            </span>
          </div>

          {/* Quantity Selector (Only if regular service, bundles are fixed) */}
          {service && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Quantity</span>
                <span className="text-indigo-400 font-extrabold">{quantity.toLocaleString()} units</span>
              </div>
              <input
                type="number"
                min={service.minQty}
                max={service.maxQty}
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(service.minQty, Math.min(service.maxQty, Number(e.target.value))))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 mb-2"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Min: {service.minQty.toLocaleString()}</span>
                <span>Max: {service.maxQty.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Cost & Balance Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Charge:</span>
              <span className="text-lg font-black text-emerald-400">
                {currency === 'BDT' ? `৳ ${totalCost.toFixed(2)}` : `$ ${totalCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className="text-slate-400">Your Wallet Balance:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${hasSufficientBalance ? 'text-slate-200' : 'text-rose-400'}`}>
                  {currency === 'BDT' ? `৳ ${currentBalance.toFixed(2)}` : `$ ${currentBalance.toFixed(2)}`}
                </span>
                {!hasSufficientBalance && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWallet();
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  >
                    + Top Up
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <span>Queueing Order to High-Speed Server...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Confirm & Place Order ({currency === 'BDT' ? `৳${totalCost}` : `$${totalCost}`})</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
