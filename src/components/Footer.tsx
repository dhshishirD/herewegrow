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
  onNavigateTool?: (toolSlug: string) => void;
  onOpenAbout?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateTab, 
  onNavigateCategory, 
  onNavigateTool, 
  onOpenAbout,
  onOpenAdmin 
}) => {
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

  const handleToolClick = (slug: string) => {
    if (onNavigateTool) {
      onNavigateTool(slug);
    } else {
      onNavigateTab('tools');
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
              <div className="w-8 h-8 rounded-xl bg-slate-900 p-0.5 flex items-center justify-center">
                <img src="/favicon.svg" alt="HereWeGrow Logo" className="w-full h-full object-contain" />
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

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                SSL 256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">24/7 Automated Queue</span>
            </div>

            {/* Direct WhatsApp Quick Contact in Brand box */}
            <div className="pt-1">
              <a
                href="https://wa.me/8801981505759?text=Hello%20HereWeGrow%20Team%2C%20I%20have%20an%20inquiry%20regarding%20your%20services."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition-colors"
              >
                <span>💬 WhatsApp Support:</span>
                <span className="font-mono font-black">+880 1981-505759</span>
              </a>
            </div>
          </div>

          {/* Column 1: Growth Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('nav_store')}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleServiceCategoryClick('facebook')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ফেসবুক পেজ লাইক ও ফলোয়ার' : 'Facebook Page Likes & Followers'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('youtube-monetization')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ইউটিউব মনিটাইজেশন ওয়াচ টাইম' : 'YouTube Monetization Watch Hours'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('instagram')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ইনস্টাগ্রাম অর্গানিক ফলোয়ার' : 'Instagram Real Followers'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('tiktok')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'টিকটক ভাইরাল ভিউ ও সেভ' : 'TikTok Viral Views & Saves'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('telegram')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'টেলিগ্রাম চ্যানেল মেম্বার্স' : 'Telegram Channel Members'}
                </button>
              </li>
              <li>
                <button onClick={() => handleServiceCategoryClick('linkedin')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
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
                <button onClick={() => handleToolClick('facebook-video-downloader')} className="hover:text-slate-900 transition-colors text-left cursor-pointer font-bold text-slate-900">
                  {isBn ? 'ফেসবুক ভিডিও ও রিলস ডাউনলোডার' : 'Facebook Video Downloader HD'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('facebook-stylish-name')} className="hover:text-slate-900 transition-colors text-left cursor-pointer font-bold text-slate-900">
                  {isBn ? 'ফেসবুক স্টাইলিশ নাম ও ভিআইপি বায়ো' : 'Facebook Stylish Name Maker'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('tiktok-downloader')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'টিকটক নো-ওয়াটারমার্ক ডাউনলোডার' : 'TikTok Video Downloader HD'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('youtube-tags')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ইউটিউব এসইও ট্যাগ এক্সট্র্যাক্টর' : 'YouTube SEO Tag Extractor'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('engagement-calculator')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'এনগেজমেন্ট রেট (ER%) ক্যালকুলেটর' : 'Engagement Rate Calculator'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('youtube-earnings')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ইউটিউব আর্নিংস ও অ্যাডসেন্স হিসাব' : 'YouTube Earnings Calculator'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('hashtag-generator')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'এআই ভাইরাল হ্যাশট্যাগ জেনারেটর' : 'AI Viral Hashtag Generator'}
                </button>
              </li>
              <li>
                <button onClick={() => handleToolClick('bio-fonts')} className="hover:text-slate-900 transition-colors text-left cursor-pointer">
                  {isBn ? 'ফ্যান্সি বায়ো ফন্ট জেনারেটর' : 'Fancy Bio Font Generator'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform, Reseller API & About Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{isBn ? 'কোম্পানি ও রিসেলার' : 'Company & Resellers'}</h4>
            <ul className="space-y-2">
              {onOpenAbout && (
                <li>
                  <button onClick={onOpenAbout} className="hover:text-slate-900 transition-colors font-bold text-indigo-700 flex items-center gap-1 cursor-pointer">
                    <span>🏢 {isBn ? 'আমাদের সম্পর্কে (About Us)' : 'About HereWeGrow'}</span>
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigateTab('api')} className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-slate-900 cursor-pointer">
                  <span>⚡ {isBn ? 'রিসেলার API v2 ডকুমেন্টস' : 'Reseller API v2 Docs'}</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-600" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('orders')} className="hover:text-slate-900 transition-colors cursor-pointer">
                  {t('nav_orders')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('affiliate')} className="hover:text-slate-900 transition-colors text-emerald-700 font-bold flex items-center gap-1 cursor-pointer">
                  <span>🤝 {isBn ? 'অ্যাফিলিয়েট ইনকাম প্রোগ্রাম' : 'Partner & Affiliate Program'}</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">15-25%</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('bundles')} className="hover:text-slate-900 transition-colors cursor-pointer">
                  {t('nav_bundles')}
                </button>
              </li>
              <li>
                <a 
                  href="https://wa.me/8801981505759?text=Hello%20HereWeGrow%20Support%2C%20I%20need%20assistance." 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-slate-900 transition-colors text-emerald-700 font-bold flex items-center gap-1"
                >
                  <span>💬 24/7 WhatsApp: 01981-505759</span>
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
