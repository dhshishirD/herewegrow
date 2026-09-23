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
  TrendingUp,
  Plus
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
    { id: 'tools', label: 'Free Creator Tools', icon: Wrench, badge: '7 Free' },
    { id: 'orders', label: 'Track Orders', icon: Activity },
    { id: 'api', label: 'Reseller API', icon: Code2 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Monogram & Title */}
          <div 
            onClick={() => handleNavClick('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-950 transition-all">
              <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-950">
                  HereWeGrow
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                  .PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">
                Creator Studio & Growth Engine
              </p>
            </div>
          </div>

          {/* Minimalist Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/90 shadow-2xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Currency & Clean Wallet */}
          <div className="flex items-center gap-2.5">
            
            {/* Currency Pill Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/90 text-xs font-bold">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === 'BDT'
                    ? 'bg-white text-emerald-950 shadow-2xs font-extrabold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Bangladeshi Taka (bKash & Nagad)"
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-indigo-950 shadow-2xs font-extrabold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="US Dollars (Crypto & Card)"
              >
                $ USD
              </button>
            </div>

            {/* Clean Wallet Pill */}
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 pl-3 shadow-2xs">
              <div className="flex items-center gap-1.5 mr-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-mono font-bold text-slate-900">
                  {currency === 'BDT' ? `৳${wallet.balanceBDT.toFixed(2)}` : `$${wallet.balanceUSD.toFixed(2)}`}
                </span>
              </div>
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Deposit</span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
