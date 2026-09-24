import React, { useState } from 'react';
import { 
  Activity, 
  RotateCw, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Gift
} from 'lucide-react';
import { triggerRefill, adminApproveAndDispatchOrder, adminUpdateOrderStatus, syncAllActiveOrdersWithProvider } from '../services/growthService';
import type { SmmOrder, UserWallet } from '../types';

interface OrdersTrackerProps {
  orders: SmmOrder[];
  onRefreshOrders: () => void;
  wallet: UserWallet;
  currency: 'BDT' | 'USD';
  onExploreServices?: () => void;
  onTopUpClick?: () => void;
  onOpenProviderSettings?: () => void;
}

export const OrdersTracker: React.FC<OrdersTrackerProps> = ({
  orders,
  onRefreshOrders,
  wallet,
  currency,
  onExploreServices,
  onOpenProviderSettings,
}) => {
  const [refillStatusMessage, setRefillStatusMessage] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  const handleSyncWithProvider = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllActiveOrdersWithProvider();
      onRefreshOrders();
      if (res.updatedCount > 0) {
        setRefillStatusMessage(`✓ Synced with Peakerr: ${res.updatedCount} order status update(s) applied!`);
      } else {
        setRefillStatusMessage('✓ All orders are up to date with server status.');
      }
    } catch (err: any) {
      onRefreshOrders();
    } finally {
      setIsSyncing(false);
      setTimeout(() => setRefillStatusMessage(null), 3500);
    }
  };

  const handleRefill = async (orderId: string) => {
    const res = await triggerRefill(orderId);
    setRefillStatusMessage(res.message);
    onRefreshOrders();
    setTimeout(() => setRefillStatusMessage(null), 4000);
  };

  const handleApproveAndDispatch = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      const res = await adminApproveAndDispatchOrder(orderId);
      setRefillStatusMessage(res.message);
      onRefreshOrders();
    } catch (e: any) {
      setRefillStatusMessage(e.message || 'Error dispatching order to Peakerr.');
    } finally {
      setDispatchingId(null);
      setTimeout(() => setRefillStatusMessage(null), 5000);
    }
  };

  const handleMarkCompleted = (orderId: string) => {
    adminUpdateOrderStatus(orderId, 'completed');
    onRefreshOrders();
    setRefillStatusMessage(`Order #${orderId} marked as completed.`);
    setTimeout(() => setRefillStatusMessage(null), 3000);
  };

  const handleCopyAffiliate = () => {
    const link = `https://herewegrow.pro/?ref=${wallet.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2000);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Server Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Order Status & Real-Time Fulfillment
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenProviderSettings && (
            <button
              onClick={onOpenProviderSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>🛡️ Admin Command Center & Promos</span>
            </button>
          )}

          <button
            onClick={handleSyncWithProvider}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isSyncing ? 'Syncing with Peakerr...' : 'Sync Live Status'}</span>
          </button>
        </div>
      </div>

      {/* Refill Notification Toast */}
      {refillStatusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{refillStatusMessage}</span>
        </div>
      )}

      {/* Orders Table & Cards */}
      {orders.length === 0 ? (
        <div className="luxury-card p-12 sm:p-16 rounded-3xl text-center border border-slate-200/90 max-w-2xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Activity className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-950 font-serif">No Active Orders Yet</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Your real-time order history, start counts, and automated server fulfillment will appear here immediately after checkout with bKash, Nagad, or Crypto.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onExploreServices}
              className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              Explore Growth Services ➔
            </button>
          </div>
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
                className="white-card white-card-hover p-6 rounded-3xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {order.id}
                    </span>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                    }`}>
                      {order.status === 'pending' ? '⏳ Awaiting Admin Dispatch' : order.status.replace('_', ' ')}
                    </span>
                    {order.providerOrderId && (
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        Peakerr #{order.providerOrderId}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">{order.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {order.serviceName}
                  </h4>

                  <a
                    href={order.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-md"
                  >
                    <span>{order.link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Progress Metric */}
                <div className="w-full lg:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Delivered: {order.quantity - order.remains} / {order.quantity}</span>
                    <span className="text-emerald-700 font-extrabold">{progressPercent}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Start Count: {order.startCount}</span>
                    <span>Remains: {order.remains}</span>
                  </div>
                </div>

                {/* Action Column: Dispatch / Refill & Charge */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none font-medium">Customer Paid</span>
                    <span className="text-sm font-black text-slate-900">
                      {currency === 'BDT' ? `৳${order.chargeBDT.toFixed(2)}` : `$${order.chargeUSD.toFixed(2)}`}
                    </span>
                  </div>

                  {/* 1-Click Approve & Dispatch to Peakerr Button */}
                  {order.status === 'pending' && !order.providerOrderId && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveAndDispatch(order.id)}
                        disabled={dispatchingId === order.id}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Deducts wholesale cost from Peakerr ($2.50 balance) and fulfills order"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${dispatchingId === order.id ? 'animate-spin' : ''}`} />
                        <span>{dispatchingId === order.id ? 'Dispatching...' : '⚡ Approve & Dispatch to Peakerr'}</span>
                      </button>

                      <button
                        onClick={() => handleMarkCompleted(order.id)}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        title="Mark as fulfilled without calling Peakerr API"
                      >
                        ✓ Done
                      </button>
                    </div>
                  )}

                  {order.refillEligible && order.status !== 'pending' && (
                    <button
                      onClick={() => handleRefill(order.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
                      title="Request Automated Refill if count drops"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>⚡ Refill</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Affiliate / Referral Card */}
      <div className="white-card p-6 sm:p-8 rounded-3xl border border-indigo-200/80 relative overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>Earn 10% Lifetime Affiliate Commission</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Share HereWeGrow & Earn Automated Passive Income
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Invite creators and business owners with your unique link. Earn 10% instant bKash/Nagad credit on every top-up they make forever!
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Your Referral Code:</span>
              <span className="font-mono font-bold text-slate-900">{wallet.affiliateCode}</span>
            </div>
            <button
              onClick={handleCopyAffiliate}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              {copiedAffiliate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAffiliate ? 'Affiliate Link Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};
