import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Link as LinkIcon, 
  Zap, 
  AlertCircle,
  CreditCard,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder } from '../services/growthService';
import { initiateAutomatedPayment } from '../services/paymentService';
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
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGatewayLoading, setIsGatewayLoading] = useState(false);

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

  // Direct 1-Click Pay with bKash / Nagad / Gateway
  const handleDirectGatewayCheckout = async () => {
    if (!link.trim()) {
      setErrorMessage('Please enter your valid social media link or username before proceeding.');
      return;
    }

    setIsGatewayLoading(true);
    setErrorMessage('');

    try {
      // Calculate BDT amount for Paymently gateway
      const bdtAmount = currency === 'BDT' ? totalCost : Math.ceil(totalCost * 122);
      
      const res = await initiateAutomatedPayment(
        bdtAmount,
        customerName || 'HereWeGrow Customer',
        customerEmail || 'customer@herewegrow.pro'
      );

      setIsGatewayLoading(false);

      if (res.success && res.paymentUrl) {
        // Save pending order metadata in localStorage so it can be resumed after return
        localStorage.setItem('hwg_pending_order', JSON.stringify({
          serviceId: service?.id || bundle?.id,
          link,
          quantity,
          cost: totalCost,
          currency,
          time: new Date().toISOString()
        }));

        window.location.href = res.paymentUrl;
      } else {
        setErrorMessage(res.message || 'Payment gateway connection timeout. Please try again.');
      }
    } catch (err: any) {
      setIsGatewayLoading(false);
      setErrorMessage(err.message || 'Could not initiate instant payment session.');
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!link.trim()) {
      setErrorMessage('Please enter your valid social media link or username.');
      return;
    }

    if (!hasSufficientBalance) {
      setErrorMessage(`Insufficient wallet balance! Required: ${currency === 'BDT' ? `৳${totalCost}` : `$${totalCost}`}`);
      return;
    }

    setIsSubmitting(true);

    try {
      let targetService: SmmService;
      if (service) {
        targetService = service;
      } else {
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

      const result = await createOrder(targetService, link, quantity, currency);
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
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error processing order');
    }
  };

  const title = bundle ? bundle.title : service?.name;
  const description = bundle ? bundle.subtitle : service?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
              1-Click Instant Fulfillment
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1 leading-snug font-serif">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-900 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleWalletSubmit} className="space-y-4">
          
          {/* Target Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Link / URL or Username <strong className="text-rose-600">*</strong></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://facebook.com/yourpage or https://youtube.com/watch?v=..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-950 font-medium"
            />
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              Ensure account / post privacy is set to <strong className="text-slate-900">Public</strong> before ordering.
            </span>
          </div>

          {/* Quantity Selector */}
          {service && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Quantity</span>
                <span className="text-indigo-700 font-extrabold font-mono text-sm">{quantity.toLocaleString()} units</span>
              </div>
              <input
                type="number"
                min={service.minQty}
                max={service.maxQty}
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(service.minQty, Math.min(service.maxQty, Number(e.target.value))))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-950 font-mono font-bold"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>Min: {service.minQty.toLocaleString()}</span>
                <span>Max: {service.maxQty.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Cost Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">Total Order Charge:</span>
              <span className="text-xl font-black text-slate-950 font-mono">
                {currency === 'BDT' ? `৳ ${totalCost.toFixed(2)}` : `$ ${totalCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-600 font-medium">Your Wallet Balance:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold font-mono ${hasSufficientBalance ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {currency === 'BDT' ? `৳ ${currentBalance.toFixed(2)}` : `$ ${currentBalance.toFixed(2)}`}
                </span>
                {!hasSufficientBalance && (
                  <span className="text-[10px] font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                    Low Balance
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct Payment Action Buttons (High-Converting 1-Click Gateway) */}
          <div className="space-y-2 pt-1">
            
            {/* OPTION 1: Direct 1-Click Pay with bKash/Nagad/Cards */}
            <button
              type="button"
              onClick={handleDirectGatewayCheckout}
              disabled={isGatewayLoading || isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              {isGatewayLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Opening Instant Paymently Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>1-Click Pay with bKash / Nagad / Cards (৳{currency === 'BDT' ? totalCost : Math.ceil(totalCost * 122)})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-0.5" />
                </>
              )}
            </button>

            {/* OPTION 2: Pay from Wallet (if balance is sufficient) */}
            {hasSufficientBalance && (
              <button
                type="submit"
                disabled={isSubmitting || isGatewayLoading}
                className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Queueing Order to Server...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Deduct from Wallet Balance & Place Order</span>
                  </>
                )}
              </button>
            )}

          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium pt-2">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Non-Drop Guaranteed</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant Server Queue</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

