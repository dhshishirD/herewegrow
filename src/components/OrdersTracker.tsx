import React, { useState } from 'react';
import { 
  Activity, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Users, 
  Gift,
  ArrowRight
} from 'lucide-react';
import { triggerRefill } from '../services/growthService';
import type { SmmOrder, UserWallet } from '../types';

interface OrdersTrackerProps {
  orders: SmmOrder[];
  onRefreshOrders: () => void;
  wallet: UserWallet;
  currency: 'BDT' | 'USD';
  onExploreServices: () => void;
}

export const OrdersTracker: React.FC<OrdersTrackerProps> = ({
  orders,
  onRefreshOrders,
  wallet,
  currency,
  onExploreServices,
}) => {
  const [refillStatusMessage, setRefillStatusMessage] = useState<string | null>(null);
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  const handleRefill = (orderId: string) => {
    const res = triggerRefill(orderId);
    setRefillStatusMessage(res.message);
    onRefreshOrders();
    setTimeout(() => setRefillStatusMessage(null), 4000);
  };

  const handleCopyAffiliate = () => {
    const link = `https://herewegrow.pro/?ref=${wallet.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2000);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Server Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Order Status & Real-Time Fulfillment
          </h2>
        </div>

        <button
          onClick={onRefreshOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all self-start md:self-auto"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Live Status</span>
        </button>
      </div>

      {/* Refill Notification Toast */}
      {refillStatusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{refillStatusMessage}</span>
        </div>
      )}

      {/* Orders Table & Cards */}
      {orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/10">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No active orders yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Place your first order from our Growth Store or 1-Click Bundles to track real-time delivery progress.
          </p>
          <button
            onClick={onExploreServices}
            className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCompleted = order.status === 'completed';
            const progressPercent = order.quantity > 0 
              ? Math.min(100, Math.round(((order.quantity - order.remains) / order.quantity) * 100))
              : 100;

            return (
              <div
                key={order.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                      {order.id}
                    </span>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{order.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {order.serviceName}
                  </h4>

                  <a
                    href={order.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline truncate max-w-md"
                  >
                    <span>{order.link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Progress Metric */}
                <div className="w-full lg:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Delivered: {order.quantity - order.remains} / {order.quantity}</span>
                    <span className="text-emerald-400">{progressPercent}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Start Count: {order.startCount}</span>
                    <span>Remains: {order.remains}</span>
                  </div>
                </div>

                {/* Refill Button & Charge */}
                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Charge</span>
                    <span className="text-sm font-black text-emerald-400">
                      {currency === 'BDT' ? `৳${order.chargeBDT.toFixed(2)}` : `$${order.chargeUSD.toFixed(2)}`}
                    </span>
                  </div>

                  {order.refillEligible && (
                    <button
                      onClick={() => handleRefill(order.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600/90 text-slate-200 hover:text-white text-xs font-bold border border-white/10 hover:border-transparent transition-all"
                      title="Request Automated Refill if count drops"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>⚡ Refill</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Affiliate / Referral Engine Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden bg-gradient-to-br from-[#0D1322] to-indigo-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>Earn 10% Lifetime Affiliate Commission</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Share HereWeGrow & Earn Automated Passive Income
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Invite creators and business owners with your unique link. Earn 10% instant bKash/Nagad credit on every top-up they make forever!
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Your Referral Code:</span>
              <span className="font-mono font-bold text-emerald-400">{wallet.affiliateCode}</span>
            </div>
            <button
              onClick={handleCopyAffiliate}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {copiedAffiliate ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAffiliate ? 'Affiliate Link Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
