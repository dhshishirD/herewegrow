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
  Target,
  UserPlus,
  ArrowRight,
  Smartphone,
  GraduationCap,
  Briefcase,
  Zap,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getCurrentAffiliateProfile, 
  saveCurrentAffiliateProfile, 
  registerAffiliateAccount,
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
  const [profile, setProfile] = useState<AffiliateProfile | null>(() => getCurrentAffiliateProfile());
  const [quote, setQuote] = useState<MotivationalQuote>(() => getDailyMotivationalQuote());
  const [payouts, setPayouts] = useState<AffiliatePayoutRequest[]>(() => getPayoutRequests());
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCampus, setRegCampus] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'binance'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutStatusMsg, setPayoutStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCampus, setEditCampus] = useState('');
  const [editBkash, setEditBkash] = useState('');

  useEffect(() => {
    const current = getCurrentAffiliateProfile();
    setProfile(current);
    if (current) {
      setEditName(current.name);
      setEditCampus(current.institution || '');
      setEditBkash(current.phoneOrBkash);
      setPayoutAccount(current.phoneOrBkash);
    }
    setPayouts(getPayoutRequests());
  }, []);

  const referralUrl = profile ? `${window.location.origin}/?ref=${profile.code}` : '';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 10) {
      setRegError('Please enter a valid bKash / Nagad number (at least 11 digits).');
      return;
    }

    const created = registerAffiliateAccount({
      name: regName.trim(),
      phoneOrBkash: regPhone.trim(),
      institution: regCampus.trim() || 'Student Ambassador',
      customCode: regCode.trim() || undefined,
      email: regEmail.trim() || undefined
    });

    setProfile(created);
    setEditName(created.name);
    setEditCampus(created.institution || '');
    setEditBkash(created.phoneOrBkash);
    setPayoutAccount(created.phoneOrBkash);
    setRegError(null);

    try {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    } catch {}
  };

  const handleCopyLink = () => {
    if (!referralUrl) return;
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
    if (!profile) return;
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
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        setPayoutStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setPayoutStatusMsg({ type: 'error', text: err?.message || 'Error requesting payout.' });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // High Converting Ready-to-Use Marketing Captions
  const marketingCaptions = [
    {
      title: '🇧🇩 1. Facebook Student & Buy-Sell Groups Post',
      category: 'Facebook Post',
      tag: 'Best for Groups',
      text: `🚀 নিজের ফেসবুক পেজ, টিকটক বা ইউটিউব চ্যানেল গ্রো করতে চান? মাত্র ৳১০ থেকে শুরু!\n\n✅ ইনস্ট্যান্ট ফলোয়ার, ভিউস, লাইক ও ওয়াচটাইম\n✅ বিকাশ/নগদ দিয়ে সরাসরি পেমেন্ট\n✅ ১০০% নন-ড্রপ ও লাইফটাইম গ্যারান্টি\n\nঅর্ডার করতে বা ফ্রি টুলস ব্যবহার করতে এখনই ভিজিট করুন: ${referralUrl}`
    },
    {
      title: '💬 2. WhatsApp & Messenger Personal Chat / Status',
      category: 'Chat & Status',
      tag: 'Direct DM',
      text: `Hey! 👋 তুমিতো কনটেন্ট বানাচ্ছো/পেজ চালাচ্ছো। সোশ্যাল মিডিয়া পেজ বা চ্যানেলের রিচ বাড়াতে চাইলে "HereWeGrow" ট্রাই করতে পারো।\n\nবিকাশ/নগদে অটোমেটেড ইনস্ট্যান্ট বুস্টিং শুরু হয় মাত্র ৳১০ থেকে। আর ফ্রি হ্যাশট্যাগ ও ট্যাগ জেনারেটর টুলসও আছে!\n\nচেক করে দেখো: ${referralUrl}`
    },
    {
      title: '🛍️ 3. F-Commerce & Online Shop Trust Pitch',
      category: 'Online Business',
      tag: 'High Conversion',
      text: `আপনার অনলাইন শপের কাস্টমার ট্রাস্ট বাড়াতে চান? 🛍️\n\nফেসবুক পেজ লাইক, ফলোয়ার ও রিভিউ বুস্ট করুন সরাসরি পাইকারি রেটে। বিকাশ ও নগদ ইনস্ট্যান্ট চেকআউট।\n\n👉 অর্ডার করুন: ${referralUrl}`
    },
    {
      title: '🎥 4. TikTok & Reels Viral Boost Script',
      category: 'Short Video',
      tag: 'TikTok / Reels',
      text: `🔥 টিকটকে ভিডিও ভাইরাল হচ্ছে না? মাত্র ৳১০ টাকায় পেয়ে যান ২০০০ ইনস্ট্যান্ট রিয়েল ভিউস এবং এক্সপ্লোর পুশ!\n\n১০০% সেফ ও ইনস্ট্যান্ট ডেলিভারি। বিকাশ পেমেন্ট।\nভিজিট করুন: ${referralUrl}`
    },
    {
      title: '💼 5. SMM Reseller & Freelancer Money-Making Pitch',
      category: 'Freelancing',
      tag: 'B2B Reselling',
      text: `ফ্রিল্যান্সিং বা ডিজিটাল মার্কেটিং ক্লায়েন্টদের জন্য সোশ্যাল মিডিয়া সার্ভিস প্রোভাইড করুন কোনো ইনভেস্টমেন্ট ছাড়াই! 📈\n\nWholesale API, Instant SMM Services & BD Gateway.\nStart now: ${referralUrl}`
    },
    {
      title: '⚡ 6. Flash Discount & Free Trial Offer',
      category: 'Flash Deal',
      tag: 'Instant Clicks',
      text: `🎉 লিমিটেড টাইম অফার! HereWeGrow-তে প্রথম অর্ডারে পেয়ে যান স্পেশাল ছাড়। সাথে আনলিমিটেড ফ্রি ক্রিয়েটর টুলস।\n\nলিংক: ${referralUrl}`
    }
  ];

  const handleCopyCaption = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostIndex(index);
    setTimeout(() => setCopiedPostIndex(null), 2000);
  };

  // If visitor is NOT yet registered as an affiliate, show clean registration onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50/70 pb-24 pt-8 animate-fadeIn font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/50">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Student Hustle & Affiliate Army</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight">
                Turn Your Social Network Into <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">Daily Income</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Join hundreds of student campus ambassadors across Bangladesh. Earn <strong className="text-amber-400">15% to 25% instant cash commission</strong> on every social growth order placed through your referral link!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="block text-amber-400 font-extrabold text-lg">15–25%</span>
                  <span className="text-[11px] text-slate-300 font-medium">Profit Sharing</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="block text-emerald-400 font-extrabold text-lg">৳100</span>
                  <span className="text-[11px] text-slate-300 font-medium">Min bKash Payout</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="block text-indigo-400 font-extrabold text-lg">30 Days</span>
                  <span className="text-[11px] text-slate-300 font-medium">Cookie Tracking</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="block text-pink-400 font-extrabold text-lg">0 ৳</span>
                  <span className="text-[11px] text-slate-300 font-medium">Zero Investment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Create Your Partner Account
                  </h2>
                  <p className="text-xs text-slate-500">
                    Takes 30 seconds. Your referral link will be generated instantly.
                  </p>
                </div>
              </div>
            </div>

            {regError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed / Shishir"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    bKash / Nagad / Rocket Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX or 018XXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-sm font-mono font-medium transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Your commission payouts will be sent to this number.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    College / University / Organization <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka University / Freelancer / Campus"
                    value={regCampus}
                    onChange={(e) => setRegCampus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Custom Referral Code <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GROW-SHISHIR or HUSTLE-DU"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-sm font-mono font-bold tracking-wider uppercase transition-all"
                  />
                  <span className="text-[11px] text-indigo-600 mt-1 block font-mono">
                    Link: herewegrow.pro/?ref={regCode.trim() || 'YOUR-CODE'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email or WhatsApp <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="For payout notices and updates"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-sm font-medium transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-700 hover:to-black text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>🚀 Activate My Partner Account & Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // Tier Progress Calculation
  const nextTierTarget = profile.tier === 'bronze' ? 5 : profile.tier === 'silver' ? 20 : profile.tier === 'gold' ? 50 : 100;
  const currentTierRate = (profile.commissionRate * 100).toFixed(0);
  const tierProgressPercent = Math.min(100, Math.round((profile.totalSales / nextTierTarget) * 100));

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 pt-6 animate-fadeIn font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================== */}
        {/* 1. DYNAMIC DAILY MOTIVATIONAL BANNER */}
        {/* ========================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wide uppercase border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Daily Hustler Mantra</span>
                </span>
                <span className="text-xs text-slate-400">
                  Welcome back, <strong className="text-white">{profile.name}</strong> ({profile.institution})
                </span>
              </div>

              {/* Bengali Primary Quote */}
              <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-amber-200 leading-snug">
                "{quote.quoteBn}"
              </h2>

              {/* English Sub-Quote & Author */}
              <p className="text-xs sm:text-sm text-slate-300 font-sans italic flex items-center gap-2">
                <span>— {quote.quoteEn}</span>
                <span className="text-indigo-400 font-semibold not-italic">({quote.author})</span>
              </p>
            </div>

            {/* Quick Actions for Quote & Profile */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                onClick={handleShuffleQuote}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
                title="Shuffle Quote"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Quote</span>
              </button>

              <button
                onClick={handleCopyQuote}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {copiedQuote ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuote ? 'Copied!' : 'Copy Quote'}</span>
              </button>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-1 underline transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
            </div>

          </div>
        </div>

        {/* Edit Profile Panel */}
        {isEditingProfile && (
          <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-lg animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Update Profile & Payout Number</span>
            </h3>
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus / Organization</label>
                <input
                  type="text"
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">bKash / Nagad Number</label>
                <input
                  type="tel"
                  value={editBkash}
                  onChange={(e) => setEditBkash(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. REFERRAL LINK & EARNINGS FUNNEL HERO */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Referral Link Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Active Affiliate Partner • {currentTierRate}% Commission</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Your Unique Referral Link
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Share this link anywhere. Every visitor is tracked for 30 days — you earn {currentTierRate}% on every package they order!
                </p>
              </div>

              {/* Tier Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="uppercase">{profile.tier} TIER</span>
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono font-bold text-indigo-700 focus:outline-hidden select-all"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out HereWeGrow for 100% verified social growth packages & free tools! Order here: ${referralUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Next Tier Ladder Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Next Level: {profile.tier === 'bronze' ? 'Silver (15%)' : profile.tier === 'silver' ? 'Gold (20%)' : 'Diamond (25%)'}</span>
                </span>
                <span className="text-indigo-600">{profile.totalSales} / {nextTierTarget} Orders Completed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" 
                  style={{ width: `${tierProgressPercent}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Hit {nextTierTarget} total sales to automatically unlock {profile.tier === 'bronze' ? '15%' : profile.tier === 'silver' ? '20%' : '25%'} lifetime commission!
              </p>
            </div>

          </div>

          {/* Wallet & Quick Payout Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Withdrawable Balance</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Instant Payout</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                  ৳{profile.pendingPayoutBDT.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  BDT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total Lifetime Earned: <strong className="text-emerald-700">৳{profile.totalEarningsBDT.toFixed(2)}</strong> (Withdrawn: ৳{profile.withdrawnBDT.toFixed(2)})
              </p>
            </div>

            {/* Payout Request Form */}
            <form onSubmit={handlePayoutSubmit} className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    min={100}
                    step={10}
                    max={profile.pendingPayoutBDT > 100 ? profile.pendingPayoutBDT : 1000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e: any) => setPayoutMethod(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="bkash">bKash (Personal)</option>
                    <option value="nagad">Nagad (Personal)</option>
                    <option value="rocket">Rocket</option>
                    <option value="binance">USDT (Binance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number / Address</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX or Binance Pay ID"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {payoutStatusMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 ${
                  payoutStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{payoutStatusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPayout || profile.pendingPayoutBDT < 100}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  profile.pendingPayoutBDT >= 100
                    ? 'bg-slate-900 hover:bg-black text-white active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{profile.pendingPayoutBDT >= 100 ? `Withdraw ৳${payoutAmount} Now` : 'Min ৳100 Needed to Withdraw'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* ========================================== */}
        {/* 3. KPI METRICS & EFFORT BREAKDOWN */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Link Clicks</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {profile.totalClicks}
            </div>
            <p className="text-[11px] text-slate-500">Unique visitor clicks</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Orders Generated</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {profile.totalSales}
            </div>
            <p className="text-[11px] text-slate-500">Completed purchases</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              ৳{profile.grossSalesBDT.toFixed(0)}
            </div>
            <p className="text-[11px] text-slate-500">Customer spending</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2 bg-gradient-to-br from-emerald-50/50 to-white">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-bold uppercase tracking-wider">Your Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono">
              ৳{profile.totalEarningsBDT.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">{currentTierRate}% Commission Cut</p>
          </div>

        </div>

        {/* ========================================== */}
        {/* 4. READY-MADE VIRAL POST TEMPLATES & IDEAS */}
        {/* ========================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Ready-to-Post Captions</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Copy-Paste Marketing Templates (With Your Link)
              </h3>
              <p className="text-xs text-slate-500">
                Click "Copy Template" on any post below and paste it on Facebook groups, WhatsApp status, or messenger!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {marketingCaptions.map((caption, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {caption.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {caption.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {caption.title}
                  </h4>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {caption.text}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCaption(idx, caption.text)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    copiedPostIndex === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-black text-white shadow-xs'
                  }`}
                >
                  {copiedPostIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPostIndex === idx ? 'Copied with Your Link!' : 'Copy Template'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* 5. 5 PRO STRATEGIES TO STAND OUT AS AN AFFILIATE */}
        {/* ========================================== */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 rounded-3xl border border-indigo-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                5 Pro Strategies to Earn ৳3,000–৳10,000 / Month
              </h3>
              <p className="text-xs text-slate-600">
                Proven blueprint for students, campus ambassadors, and content creators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">1</span>
                <span>University & College Groups</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post our Free Creator Tools (Tag Extractor, Engagement Calculator) in campus Facebook groups. Students love free tools and immediately explore the store!
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">2</span>
                <span>Pitch F-Commerce Shop Owners</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search new Facebook clothing & jewelry shops. Message them: <em>"Increase customer trust with 500 real likes starting at ৳50!"</em> Send your link.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">3</span>
                <span>TikTok / Reels Bio Link</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a 15-second video explaining <em>"How to get 2,000 TikTok views for ৳10"</em>. Put your referral link in bio. Every click tracks for 30 days!
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">4</span>
                <span>Direct WhatsApp Status</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Put your referral link on WhatsApp status once every 3 days highlighting bKash auto checkout and 24/7 automated delivery.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">5</span>
                <span>Offline SMM Agency Reselling</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take orders offline from friends/local shops at 2x rate, and place the order through your own link to collect both client payment and affiliate cuts!
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 bg-gradient-to-br from-amber-50 to-white">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Super Admin Cash Bonuses</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Top weekly affiliates receive automated cash bonuses (৳100–৳500) injected directly into their bKash withdrawable balance!
              </p>
            </div>

          </div>
        </div>

        {/* ========================================== */}
        {/* 6. PAYOUT HISTORY LOG */}
        {/* ========================================== */}
        {payouts.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Your Withdrawal & Payout History</span>
            </h3>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {payouts.map((pay) => (
                <div key={pay.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 font-mono">#{pay.id} • ৳{pay.amountBDT} BDT</div>
                    <div className="text-slate-400 text-[11px]">
                      {pay.method.toUpperCase()} ({pay.accountNumber}) • Requested: {pay.requestedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pay.status === 'completed' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid (TrxID: {pay.adminTrxId})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Processing (1-3 hrs)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
