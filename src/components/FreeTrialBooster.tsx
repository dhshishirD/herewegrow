import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Send, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Layers, 
  Check, 
  ExternalLink,
  Gift,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  FREE_TRIAL_OPTIONS, 
  getFreeTrialUsageCount, 
  claimFreeTrialBoost, 
  type FreeTrialOption 
} from '../services/growthService';
import type { SmmService, SmmOrder, UserWallet } from '../types';

interface FreeTrialBoosterProps {
  currency: 'BDT' | 'USD';
  onSelectServiceForOrder: (service: SmmService) => void;
  onOrderPlaced?: (order: SmmOrder, updatedWallet: UserWallet) => void;
}

export const FreeTrialBooster: React.FC<FreeTrialBoosterProps> = ({
  currency,
  onSelectServiceForOrder,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(FREE_TRIAL_OPTIONS[0].id);
  const [targetLink, setTargetLink] = useState('');
  const [usageCount, setUsageCount] = useState<number>(() => getFreeTrialUsageCount());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error' | 'exhausted'; text: string } | null>(null);
  const [claimedOrder, setClaimedOrder] = useState<SmmOrder | null>(null);

  useEffect(() => {
    setUsageCount(getFreeTrialUsageCount());
  }, []);

  const selectedOption = FREE_TRIAL_OPTIONS.find(o => o.id === selectedOptionId) || FREE_TRIAL_OPTIONS[0];
  const remainingSamples = Math.max(0, 4 - usageCount);

  const handleClaimFreeTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLink.trim()) {
      setResultMsg({ type: 'error', text: 'Please paste your video or post link above.' });
      return;
    }

    setIsSubmitting(true);
    setResultMsg(null);

    try {
      const res = await claimFreeTrialBoost(selectedOptionId, targetLink.trim());
      if (res.success) {
        setUsageCount(getFreeTrialUsageCount());
        setResultMsg({ type: 'success', text: res.message });
        if (res.order) setClaimedOrder(res.order);
        setTargetLink('');
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch {}
      } else {
        if (res.remainingTries === 0) {
          setResultMsg({ type: 'exhausted', text: res.message });
        } else {
          setResultMsg({ type: 'error', text: res.message });
        }
      }
    } catch (err: any) {
      setResultMsg({ type: 'error', text: err?.message || 'Error processing free sample.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-indigo-900/50 mb-10">
      
      {/* Background Glows */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Trust Pitch & Bengali Headline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>100% Free Live Speed Test</span>
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
              {remainingSamples} of 4 Free Samples Left
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight leading-snug">
            Don’t Trust Words — <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">Test Our Live Speed for FREE!</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            বিশ্বাস করার আগে নিজে পরীক্ষা করে দেখুন! কোনো টাকা বা বিকাশ পেমেন্ট লাগবে না। আপনার যেকোনো পোস্ট বা ভিডিওর লিংক দিন এবং <strong className="text-amber-400">৬০ সেকেন্ডের মধ্যে ১০০ ভিউস বা ২০ লাইক</strong> সরাসরি আপনার একাউন্টে রিসিভ করুন।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>0 ৳ Payment Needed</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No Password Required</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant 60s Start</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Free Sample Dispatch Box */}
        <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 text-slate-900 shadow-2xl border border-white/20">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Select Your Free Sample</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Free Trial Active
            </span>
          </div>

          <form onSubmit={handleClaimFreeTrial} className="space-y-4">
            
            {/* Sample Type Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FREE_TRIAL_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setResultMsg(null);
                  }}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedOptionId === opt.id
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-base mb-1">{opt.icon}</div>
                  <div className="text-[11px] font-bold leading-tight line-clamp-2">
                    {opt.name.replace('Free ', '')}
                  </div>
                  <span className={`text-[9px] font-mono mt-1 block font-bold ${
                    selectedOptionId === opt.id ? 'text-amber-300' : 'text-slate-500'
                  }`}>
                    {opt.sampleBadge}
                  </span>
                </button>
              ))}
            </div>

            {/* Target Link Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your {selectedOption.platform.toUpperCase()} Video / Post URL
              </label>
              <input
                type="url"
                required
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                placeholder={selectedOption.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs font-medium text-slate-900 bg-white shadow-2xs"
              />
            </div>

            {/* Status / Error Message */}
            {resultMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : resultMsg.type === 'exhausted'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                <span className="leading-relaxed">{resultMsg.text}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || remainingSamples === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                remainingSamples > 0
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 active:scale-[0.99] shadow-amber-500/25'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Queueing to Server...</span>
                </>
              ) : remainingSamples > 0 ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send My Free Sample (60s Delivery) ➔</span>
                </>
              ) : (
                <span>4/4 Samples Claimed • Try ৳2 Starters Below</span>
              )}
            </button>

          </form>

        </div>

      </div>

    </section>
  );
};
