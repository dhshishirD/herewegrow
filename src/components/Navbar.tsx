import React, { useState } from 'react';
import { 
  Sparkles, 
  Wallet, 
  ShoppingBag, 
  Wrench, 
  Activity, 
  Code2, 
  Menu, 
  X, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import type { UserWallet } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: 'BDT' | 'USD';
  setCurrency: (c: 'BDT' | 'USD') => void;
  wallet: UserWallet;
  onOpenWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  wallet,
  onOpenWallet,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'store', label: 'Growth Store', icon: ShoppingBag },
    { id: 'bundles', label: '1-Click Bundles', icon: Sparkles, badge: 'Popular' },
    { id: 'tools', label: 'Free Creator Tools', icon: Wrench, badge: '100% Free' },
    { id: 'orders', label: 'Track Orders', icon: Activity },
    { id: 'api', label: 'Reseller API', icon: Code2 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090D16]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:text-pink-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  HereWeGrow
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Creator Studio & SMM Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar (Currency Switch + Wallet + Quick Deposit) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Live Switcher */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'BDT'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bangladeshi Taka (bKash/Nagad rate)"
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/40 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="US Dollars (Crypto / Card rate)"
              >
                $ USD
              </button>
            </div>

            {/* Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 shadow-sm transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Wallet</span>
                <span className="text-xs font-black text-emerald-400 leading-tight">
                  {currency === 'BDT' ? `৳ ${wallet.balanceBDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$ ${wallet.balanceUSD.toFixed(2)}`}
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                + Add
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#090D16] px-4 py-4 space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated 24/7 Delivery
            </span>
            <a 
              href="https://t.me/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              24/7 Support <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
