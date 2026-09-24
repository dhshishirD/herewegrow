import React, { useRef } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight,
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onNavigateCategory?: (categorySlug: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onNavigateCategory, onOpenAdmin }) => {
  const lastTapRef = useRef<number>(0);
  const { language, t } = useLanguage();

  const handleSecretDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      if (onOpenAdmin) onOpenAdmin();
    }
    lastTapRef.current = now;
  };

  const handleServiceCategoryClick = (slug: string) => {
    if (onNavigateCategory) {
      onNavigateCategory(slug);
    } else {
      onNavigateTab('store');
    }
  };

  const isBn = language === 'bn';

  return (
    <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-10 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={handleSecretDoubleTap}
              onDoubleClick={onOpenAdmin}
              className="flex items-center gap-2.5 cursor-pointer select-none"
              title="HereWeGrow.pro"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                HereWeGrow<span className="text-indigo-600">.pro</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {isBn 
                ? 'বাংলাদেশের সেরা অল-ইন-ওয়ান সোশ্যাল ক্রিয়েটর টুলস ও গ্রোথ প্ল্যাটফর্ম। বিশ্বমানের অটোমেটেড সার্ভার কিউ ও নন-ড্রপ গ্যারান্টি।'
                : 'The #1 All-in-One Social Creator Tools & Growth Studio. Combining free viral utilities with high-velocity, non-drop SMM fulfillment.'}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                SSL 256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">24/7 Automated Queue</span>
            </div>
          </div>

          {/* Column 1: Growth Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('nav_store')}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleServiceCategoryClick('facebook')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ফেসবুক পেজ লাইক ও ফলোয়ার' : 'Facebook Page Likes & Followers'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('youtube')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ইউটিউব মনিটাইজেশন ওয়াচ টাইম' : 'YouTube Monetization Watch Hours'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('instagram')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ইনস্টাগ্রাম অর্গানিক ফলোয়ার' : 'Instagram Real Followers'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('tiktok')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'টিকটক ভাইরাল ভিউ ও সেভ' : 'TikTok Viral Views & Saves'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('telegram')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'টেলিগ্রাম চ্যানেল মেম্বার্স' : 'Telegram Channel Members'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('linkedin')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'লিঙ্কডইন কোম্পানি গ্রোথ' : 'LinkedIn Company Growth'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Free Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('nav_tools')}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ইউটিউব আর্নিংস ও অ্যাডসেন্স ক্যালকুলেটর' : 'YouTube Earnings & AdSense Calculator'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ইউটিউব এসইও ট্যাগ এক্সট্র্যাক্টর' : 'YouTube SEO Tag Extractor'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'এনগেজমেন্ট রেট ক্যালকুলেটর' : 'Engagement Rate Calculator'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'এআই ভাইরাল হ্যাশট্যাগ জেনারেটর' : 'AI Viral Hashtag Generator'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  {isBn ? 'ফ্যান্সি বায়ো ফন্ট জেনারেটর' : 'Fancy Bio Font Generator'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{isBn ? 'ডেভেলপার ও সাপোর্ট' : 'Developers & Support'}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('api')} className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-indigo-700">
                  <span>{isBn ? 'রিসেলার API v2' : 'Reseller API v2'}</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-600" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('orders')} className="hover:text-slate-900 transition-colors">
                  {t('nav_orders')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('affiliate')} className="hover:text-slate-900 transition-colors text-emerald-700 font-bold flex items-center gap-1">
                  <span>🤝 {isBn ? 'অ্যাফিলিয়েট ইনকাম প্রোগ্রাম' : 'Partner & Affiliate Program'}</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">15-25%</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('bundles')} className="hover:text-slate-900 transition-colors">
                  {t('nav_bundles')}
                </button>
              </li>
              <li>
                <a href="https://t.me/" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors text-indigo-600 font-bold flex items-center gap-1">
                  <span>24/7 Telegram Support</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment Gateways Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Supported Gateways:</span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-pink-700 shadow-xs">
              bKash Auto
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-amber-700 shadow-xs">
              Nagad MFS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-indigo-700 shadow-xs">
              Binance USDT
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-emerald-700 shadow-xs">
              Visa / Mastercard
            </span>
          </div>

          <div 
            onClick={handleSecretDoubleTap}
            onDoubleClick={onOpenAdmin}
            className="text-[11px] text-slate-500 cursor-pointer select-none transition-colors hover:text-slate-700"
            title="HereWeGrow Social Engine"
          >
            © 2026 HereWeGrow.pro • {t('footer_rights')}
          </div>

        </div>

      </div>
    </footer>
  );
};
