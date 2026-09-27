import React from 'react';
import { 
  X, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Award, 
  Users, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Globe, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStore: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  onOpenStore,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {isBn ? 'হিয়ার উই গ্রো সম্পর্কে' : 'About HereWeGrow.pro'}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  EST. 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'বাংলাদেশের সেরা অল-ইন-ওয়ান সোশ্যাল ক্রিয়েটর স্টুডিও ও গ্রোথ ইঞ্জিন' 
                  : 'Empowering Digital Creators & E-Commerce Brands Across Bangladesh'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8 text-slate-700 leading-relaxed text-xs sm:text-sm bg-white">
          
          {/* Mission Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-md space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'আমাদের মূল লক্ষ্য' : 'Our Core Mission'}</span>
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {isBn 
                ? 'সোশ্যাল মিডিয়ায় প্রতিটি ক্রিয়েটর ও ব্র্যান্ডের সম্ভাবনাকে বাস্তবে রূপ দেওয়া।' 
                : 'Accelerating Organic Authority & Creator Growth with 0% Middleman Friction.'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn
                ? 'HereWeGrow হলো একটি নেক্সট-জেনারেশন ডিজিটাল গ্রোথ স্টুডিও। আমরা বিশ্বাস করি, সোশ্যাল মিডিয়া অ্যালগরিদমে বড় হতে কোনো কনটেন্ট ক্রিয়েটর বা উদ্যোক্তার বাজেট বা প্রযুক্তির প্রতিবন্ধকতা থাকা উচিত নয়। তাই আমরা ফ্রি ক্রিয়েটর টুলস ও নির্ভরযোগ্য নন-ড্রপ সার্ভিস এক প্ল্যাটফর্মে এনেছি।'
                : 'HereWeGrow is engineered for modern content creators, digital marketing agencies, and e-commerce entrepreneurs. We bridge the gap between high-tech wholesale server infrastructure and end creators, delivering 100% non-drop social proof at direct wholesale rates with instant bKash and Nagad payment.'}
            </p>
          </div>

          {/* 4 Pillars of Trust */}
          <div className="space-y-4">
            <h5 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              {isBn ? 'কেন ১২,০০০+ ক্রিয়েটর আমাদের বিশ্বাস করেন' : 'The 4 Pillars of HereWeGrow Trust'}
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {isBn ? '১০০% পাসওয়ার্ড-মুক্ত ও নিরাপদ' : '100% Zero-Password Security'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn 
                    ? 'আমাদের সার্ভিসে কখনোই আপনার কোনো আইডির পাসওয়ার্ড বা একাউন্ট লগইন লাগে না। শুধু পাবলিক পোস্ট বা পেজ লিংক দিয়ে নিরাপদে কাজ করুন।' 
                    : 'We only require your public post, channel, or profile link. Zero account access or credentials needed.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {isBn ? '৩৬৫ দিনের অটো-রিফিল গ্যারান্টি' : '365-Day Auto-Refill Warranty'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn 
                    ? 'প্রতিটি ফলোয়ার ও ভিউ প্যাকেজে রয়েছে অটোমেটিক রিফিল সুরক্ষার প্রতিশ্রুতি। ড্রপ হলে ১-ক্লিকে রিফিল রিকোয়েস্ট করুন।' 
                    : 'Every non-drop package is backed by an automated 30 to 365-day replacement warranty.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {isBn ? 'ইনস্ট্যান্ট ৪৫ সেকেন্ড সার্ভার কিউ' : 'Automated 45-Second Server Queue'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn 
                    ? 'অর্ডার প্লেস করার সাথে সাথে হাই-স্পিড স্বয়ংক্রিয় সার্ভার কিউতে চলে যায়। কোনো ম্যানুয়াল বিলম্ব নেই।' 
                    : 'Orders dispatch directly into high-capacity automated server queues within seconds.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-800 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {isBn ? 'বিকাশ ও নগদ ০% গেটওয়ে ফি' : '0% Fee bKash, Nagad & Crypto'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn 
                    ? 'বিকাশ, নগদ, রকেট, ব্যাংক কার্ড ও ক্রিপ্টো দিয়ে ঝামেলাহীন নিরাপদ চেকআউট।' 
                    : 'Instant BDT checkout with automated Paymently gateway verification and 0% surcharge.'}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Support & Contact Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {isBn ? 'সরাসরি যোগাযোগ ও সাপোর্ট' : 'Official Support & Contact Information'}
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <a 
                href="https://wa.me/8801981505759?text=Hello%20HereWeGrow%20Team%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services." 
                target="_blank" 
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-2.5 text-emerald-950 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">WhatsApp Business</div>
                  <div className="text-[11px] font-mono text-emerald-700">+880 1981-505759</div>
                </div>
              </a>

              <a 
                href="mailto:support@herewegrow.pro" 
                className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-2.5 text-indigo-950 transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Official Email</div>
                  <div className="text-[11px] text-indigo-700 truncate">support@herewegrow.pro</div>
                </div>
              </a>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2.5 text-slate-900">
                <Globe className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Headquarters</div>
                  <div className="text-[11px] text-slate-600">Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            © 2026 HereWeGrow.pro • Verified SMM Ecosystem
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenStore();
              }}
              className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{isBn ? 'সার্ভিস ব্রাউজ করুন' : 'Explore Services'}</span>
              <span>➔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
