import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight,
  Lock
} from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-10 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                HereWeGrow<span className="text-indigo-600">.pro</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              The #1 All-in-One Social Creator Tools & Growth Studio in Bangladesh. Combining free viral utilities with high-velocity, non-drop SMM fulfillment.
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
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Growth Store</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-slate-900 transition-colors">
                  Facebook Page Likes & Followers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-slate-900 transition-colors">
                  YouTube Monetization Watch Hours
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-slate-900 transition-colors">
                  Instagram Real Followers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-slate-900 transition-colors">
                  TikTok Viral Views & Saves
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-slate-900 transition-colors">
                  Telegram Channel Members
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Free Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Free Creator Tools</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  TikTok & Reels Video Downloader
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  YouTube SEO Tag Extractor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  Engagement Rate Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  AI Viral Hashtag Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-slate-900 transition-colors">
                  Fancy Bio Font Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Developers & Support</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('api')} className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-indigo-700">
                  <span>Reseller API v2</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-600" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('orders')} className="hover:text-slate-900 transition-colors">
                  Track Live Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('bundles')} className="hover:text-slate-900 transition-colors">
                  1-Click Monetization Packs
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

          <div className="text-[11px] text-slate-500">
            © 2026 HereWeGrow.pro • All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  );
};
