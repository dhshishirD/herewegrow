import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Copy, 
  Check, 
  Share2, 
  DollarSign, 
  Send, 
  Flame, 
  ChevronRight, 
  BookOpen, 
  RefreshCw, 
  MessageCircle, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Users,
  Target
} from 'lucide-react';
import { 
  getCurrentAffiliateProfile, 
  saveCurrentAffiliateProfile, 
  getDailyMotivationalQuote, 
  getRandomMotivationalQuote,
  getPayoutRequests, 
  submitPayoutRequest,
  MOTIVATIONAL_QUOTES
} from '../services/affiliateService';
import type { AffiliateProfile, AffiliatePayoutRequest, MotivationalQuote } from '../types';

interface AffiliatePortalProps {
  currency: 'BDT' | 'USD';
  onNavigateStore?: () => void;
}

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ currency, onNavigateStore }) => {
  const [profile, setProfile] = useState<AffiliateProfile>(() => getCurrentAffiliateProfile());
  const [quote, setQuote] = useState<MotivationalQuote>(() => getDailyMotivationalQuote());
  const [payouts, setPayouts] = useState<AffiliatePayoutRequest[]>(() => getPayoutRequests());
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'binance'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutStatusMsg, setPayoutStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editCampus, setEditCampus] = useState(profile.institution || '');
  const [editBkash, setEditBkash] = useState(profile.phoneOrBkash);

  useEffect(() => {
    setProfile(getCurrentAffiliateProfile());
    setPayouts(getPayoutRequests());
  }, []);

  const referralUrl = `${window.location.origin}/?ref=${profile.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShuffleQuote = () => {
    setQuote(getRandomMotivationalQuote());
  };

  const handleCopyQuote = () => {
    const text = `"${quote.quoteBn}" — ${quote.quoteEn} (${quote.author})`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AffiliateProfile = {
      ...profile,
      name: editName.trim() || profile.name,
      institution: editCampus.trim() || profile.institution,
      phoneOrBkash: editBkash.trim() || profile.phoneOrBkash
    };
    saveCurrentAffiliateProfile(updated);
    setProfile(updated);
    setIsEditingProfile(false);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAccount.trim()) {
      setPayoutStatusMsg({ type: 'error', text: 'Please enter your account / bKash number.' });
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutStatusMsg(null);

    try {
      const res = submitPayoutRequest(Number(payoutAmount), payoutMethod, payoutAccount.trim());
      if (res.success) {
        setProfile(getCurrentAffiliateProfile());
        setPayouts(getPayoutRequests());
        setPayoutStatusMsg({ type: 'success', text: res.message });
        setPayoutAccount('');
      } else {
        setPayoutStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setPayoutStatusMsg({ type: 'error', text: err?.message || 'Error requesting payout.' });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Ready-Made Student Marketing Captions
  const marketingCaptions = [
    {
      title: '🔥 High Converting Facebook / WhatsApp Status (Bengali)',
      category: 'Bangla Social Post',
      text: `🚀 নিজের ফেসবুক পেজ, টিকটক বা ইউটিউব চ্যানেল গ্রো করতে চান? মাত্র ৳১০ থেকে শুরু!\n\n✅ ইনস্ট্যান্ট ফলোয়ার, ভিউস, লাইক ও ওয়াচটাইম\n✅ বিকাশ/নগদ দিয়ে সরাসরি ইনস্ট্যান্ট পেমেন্ট\n✅ ১০০% রিয়েল ও নন-ড্রপ গ্যারান্টি\n\nঅর্ডার করতে ভিজিট করুন: ${referralUrl}`
    },
    {
      title: '⚡ Student Freelancer / Agency Pitch (English & Bengali)',
      category: 'Agency Pitch',
      text: `Need social proof for your business or personal brand? 📈 Get 2,000 TikTok views or 100 Facebook followers starting at just ৳8 BDT!\n\n⚡ Instant Server Delivery | 🛡️ 30-Day Guarantee\n👉 Order directly here: ${referralUrl}`
    },
    {
      title: '🎯 Ultra-Cheap Budget Package Alert (<৳50)',
      category: 'Budget Deal',
      text: `🔥 অবিশ্বাস্য অফার! মাত্র ৳১০ টাকায় ২০০০ টিকটক ভিউ এবং ৳১৫ টাকায় ১০০ লাইক!\n\nপেমেন্ট করুন বিকাশ অথবা নগদে। কোনো পাসওয়ার্ড দরকার নেই।\nএখনই বুস্ট করুন: ${referralUrl}`
    }
  ];

  const handleCopyCaption = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostIndex(index);
    setTimeout(() => setCopiedPostIndex(null), 2000);
  };

  // Tier Progress Calculation
  const nextTierTarget = profile.tier === 'bronze' ? 5 : profile.tier === 'silver' ? 20 : profile.tier === 'gold' ? 50 : 100;
  const currentTierRate = (profile.commissionRate * 100).toFixed(0);
  const tierProgressPercent = Math.min(100, Math.round((profile.totalSales / nextTierTarget) * 100));

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 pt-6 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================== */}
        {/* 1. DYNAMIC DAILY MOTIVATIONAL BANNER */}
        {/* ========================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>Daily Hustle Motivation</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">#{quote.category}</span>
              </div>

              <blockquote className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{quote.quoteBn}"
              </blockquote>

              <p className="text-xs sm:text-sm text-indigo-200/80 italic">
                "{quote.quoteEn}" — <span className="font-semibold text-slate-300 not-italic">{quote.author}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={handleShuffleQuote}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Shuffle Quote"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>New Quote</span>
              </button>

              <button
                onClick={handleCopyQuote}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuote ? 'Copied!' : 'Share Quote'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. PARTNER HEADER & TIER BADGE */}
        {/* ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-xl shadow-md">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-950">{profile.name}</h2>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  profile.tier === 'diamond' 
                    ? 'bg-purple-100 text-purple-900 border-purple-300' 
                    : profile.tier === 'gold' 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : profile.tier === 'silver' 
                    ? 'bg-slate-200 text-slate-900 border-slate-300' 
                    : 'bg-orange-100 text-orange-900 border-orange-300'
                }`}>
                  ★ {profile.tier} Partner ({currentTierRate}% Rate)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {profile.institution || 'Student Campus Ambassador'} • bKash/Phone: <span className="font-mono text-slate-700">{profile.phoneOrBkash}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {isEditingProfile ? 'Close Edit' : 'Edit Profile'}
            </button>
            {onNavigateStore && (
              <button
                onClick={onNavigateStore}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Browse Catalog ➔
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Drawer */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-md animate-fadeIn space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Update Student Partner Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Tanvir Ahmed"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Campus / College / University</label>
                <input
                  type="text"
                  value={editCampus}
                  onChange={e => setEditCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Dhaka University"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">bKash / Nagad Number (For Payouts)</label>
                <input
                  type="text"
                  value={editBkash}
                  onChange={e => setEditBkash(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Save Details
            </button>
          </form>
        )}

        {/* ========================================== */}
        {/* 3. KPI STAT CARDS */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Link Visits</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              {profile.totalClicks}
            </div>
            <p className="text-[11px] text-slate-500">Total clicks on your link</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Sales Generated</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              {profile.totalSales}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Gross: ৳{profile.grossSalesBDT.toFixed(0)} BDT</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Lifetime Earnings</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              ৳{profile.totalEarningsBDT.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">${(profile.totalEarningsBDT / 122).toFixed(2)} USD</p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-xs font-bold">Ready to Withdraw</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
              ৳{profile.pendingPayoutBDT.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">Min payout: ৳100 BDT</p>
          </div>

        </div>

        {/* ========================================== */}
        {/* 4. 1-CLICK REFERRAL LINK GENERATOR */}
        {/* ========================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <span>Your Exclusive Partner Link</span>
              </h3>
              <p className="text-xs text-slate-500">
                Share this link on Facebook, WhatsApp, Telegram, or your bio. Every purchase automatically earns you <span className="text-indigo-700 font-bold">{currentTierRate}% commission</span>!
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
              Code: <strong className="text-indigo-700">{profile.code}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 font-mono text-xs text-slate-800 select-all truncate">
              {referralUrl}
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Partner Link'}</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚀 Grow your social media with HereWeGrow! Get TikTok views, Facebook followers, YouTube subscribers starting at just ৳8 BDT!\n\nOrder here: ${referralUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Share</span>
            </a>
          </div>

          {/* Tier Progression Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Next Tier Unlock: {profile.tier === 'bronze' ? 'Silver (15%)' : profile.tier === 'silver' ? 'Gold (20%)' : 'Diamond (25%)'}</span>
              </span>
              <span>{profile.totalSales} / {nextTierTarget} Sales</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${tierProgressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {nextTierTarget - profile.totalSales > 0 
                ? `Only ${nextTierTarget - profile.totalSales} more sales needed to upgrade your commission rate!` 
                : 'Congratulations! You have achieved elite partner status.'}
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* 5. PAYOUT WITHDRAWAL & HISTORY */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Withdrawal Request Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Request Instant bKash / Nagad Payout</span>
              </h3>
              <p className="text-xs text-slate-500">
                Withdraw earnings directly to your mobile wallet. Minimum payout is ৳100 BDT.
              </p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Withdrawal Amount (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="100"
                    max={Math.max(100, Math.floor(profile.pendingPayoutBDT))}
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  {[100, 250, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPayoutAmount(amt)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${payoutAmount === amt ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                  {profile.pendingPayoutBDT >= 100 && (
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(Math.floor(profile.pendingPayoutBDT))}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-800 cursor-pointer"
                    >
                      All (৳{Math.floor(profile.pendingPayoutBDT)})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Method</label>
                  <select
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="bkash">bKash Personal</option>
                    <option value="nagad">Nagad Personal</option>
                    <option value="rocket">Rocket Personal</option>
                    <option value="binance">Binance Pay (USDT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {payoutMethod === 'binance' ? 'Binance Pay ID' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={e => setPayoutAccount(e.target.value)}
                    placeholder={payoutMethod === 'binance' ? '123456789' : '01XXXXXXXXX'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {payoutStatusMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  payoutStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {payoutStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{payoutStatusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPayout || profile.pendingPayoutBDT < 100}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingPayout ? 'Submitting Request...' : `Submit Payout Request (৳${payoutAmount})`}</span>
              </button>
            </form>
          </div>

          {/* Payout History Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Withdrawal History & Trx Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Total Withdrawn: <span className="font-bold text-slate-900 font-mono">৳{profile.withdrawnBDT.toFixed(2)} BDT</span>
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {payouts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  No payout requests submitted yet.
                </div>
              ) : (
                payouts.map(p => (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">৳{p.amountBDT.toFixed(2)}</span>
                        <span className="uppercase font-bold text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border">
                          {p.method}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {p.accountNumber} • {p.requestedAt}
                      </div>
                      {p.adminTrxId && (
                        <div className="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">
                          TrxID: {p.adminTrxId}
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : p.status === 'pending' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Payouts are processed daily to student bKash/Nagad accounts within 1–4 hours.</span>
            </div>
          </div>

        </div>

        {/* ========================================== */}
        {/* 6. READY-MADE MARKETING PROMOTION KITS */}
        {/* ========================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                Marketing Toolkit
              </span>
              <h3 className="text-base font-extrabold text-slate-950">
                Ready-Made Copy-Paste Promotion Posts
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Copy and post these proven high-converting captions directly on Facebook groups, WhatsApp Statuses, and Messenger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketingCaptions.map((kit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">
                      {kit.category}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">{kit.title}</h5>
                  <p className="text-[11px] text-slate-600 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200 font-sans leading-relaxed select-all">
                    {kit.text}
                  </p>
                </div>

                <button
                  onClick={() => handleCopyCaption(idx, kit.text)}
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200"
                >
                  {copiedPostIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPostIndex === idx ? 'Copied Post!' : 'Copy Caption'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
