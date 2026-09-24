import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { SmmOrder } from '../types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SmmOrder | null;
  onNavigateToTracker: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onNavigateToTracker,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const receiptText = `🛍️ HereWeGrow.pro Order Receipt
--------------------------------
Order ID: ${order.id}
Service: ${order.serviceName}
Target Link: ${order.link}
Quantity: ${order.quantity.toLocaleString()} units
Paid Amount: ৳${order.chargeBDT.toFixed(2)} ($${order.chargeUSD.toFixed(2)})
Status: Payment Verified • Queued for Delivery
Date: ${order.createdAt}
Tracking URL: https://herewegrow.pro/#orders
--------------------------------
Thank you for growing with HereWeGrow!`;

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(`Hello HereWeGrow Support, I just placed order ${order.id} for "${order.serviceName}" (Link: ${order.link}). Please confirm fulfillment.`);
    window.open(`https://wa.me/8801700000000?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulsing Success Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs relative">
          <CheckCircle2 className="w-9 h-9 animate-bounce" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Payment Verified & Accepted
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 font-serif">
            Order Queued Successfully!
          </h3>
          <p className="text-xs text-slate-500">
            Your social growth delivery is scheduled in our automated server queue.
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Order ID</span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {order.id}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block">Service Package</span>
            <span className="font-bold text-slate-900 leading-tight block">
              {order.serviceName}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Quantity</span>
            <span className="font-mono font-extrabold text-slate-900">
              {order.quantity.toLocaleString()} units
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Target URL</span>
            <a
              href={order.link}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[180px]"
            >
              <span>{order.link}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-bold">Total Paid</span>
            <span className="text-base font-black text-slate-950 font-mono">
              ৳{order.chargeBDT.toFixed(2)} <span className="text-xs text-slate-400">(${order.chargeUSD.toFixed(2)})</span>
            </span>
          </div>
        </div>

        {/* Estimated Start Info */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-900 font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Estimated Start: <strong>15 - 30 Minutes</strong></span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Non-Drop</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onNavigateToTracker();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Track Order Live in Dashboard</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyReceipt}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Receipt!' : 'Copy Receipt'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Alert</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
