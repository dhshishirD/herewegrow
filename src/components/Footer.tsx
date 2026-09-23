import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Heart, 
  ArrowUpRight,
  Lock
} from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="border-t border-white/10 bg-[#060911] pt-14 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5">
                <div className="w-full h-full bg-[#060911] rounded-[10px] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                HereWeGrow<span className="text-indigo-400">.pro</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The #1 All-in-One Social Creator Tools & Growth Studio in Bangladesh. Combining free viral utilities with high-velocity, non-drop SMM fulfillment.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                SSL 256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">24/7 Server Queue</span>
            </div>
          </div>

          {/* Column 1: Growth Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Growth Store</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-white transition-colors">
                  Facebook Page Likes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-white transition-colors">
                  YouTube Monetization Hours
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-white transition-colors">
                  Instagram Real Followers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-white transition-colors">
                  TikTok Viral Views
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('store')} className="hover:text-white transition-colors">
                  Telegram Channel Members
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Free Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Free Creator Tools</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-white transition-colors">
                  TikTok Video Downloader
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-white transition-colors">
                  YouTube SEO Tag Extractor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-white transition-colors">
                  Engagement Rate Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-white transition-colors">
                  AI Viral Hashtag Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tools')} className="hover:text-white transition-colors">
                  Fancy Bio Font Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Reseller */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Developers & Support</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('api')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Reseller API v2</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('orders')} className="hover:text-white transition-colors">
                  Track Live Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('bundles')} className="hover:text-white transition-colors">
                  1-Click Monetization Packs
                </button>
              </li>
              <li>
                <a href="https://t.me/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-indigo-400 font-bold">
                  24/7 Telegram Support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment Methods Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold mr-2">Supported Gateways:</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-pink-400">
              bKash Auto
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-amber-400">
              Nagad MFS
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-indigo-400">
              Binance USDT
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-bold text-emerald-400">
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
