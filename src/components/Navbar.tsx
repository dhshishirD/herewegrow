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
  ShieldCheck,
  ArrowUpRight
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
    { id: 'tools', label: 'Free Creator Tools', icon: Wrench, badge: 'Free' },
    { id: 'orders', label: 'Track Orders', icon: Activity },
    { id: 'api', label: 'Reseller API', icon: Code2 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-600 transition-colors">
              <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  HereWeGrow
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Creator Studio & Growth Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'BDT'
                    ? 'bg-white text-emerald-800 shadow-xs font-extrabold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Bangladeshi Taka (bKash/Nagad rate)"
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-white text-indigo-700 shadow-xs font-extrabold border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="US Dollars (Crypto / Card rate)"
              >
                $ USD
              </button>
            </div>

            {/* Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 font-semibold block leading-none">Wallet</span>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {currency === 'BDT' ? `৳ ${wallet.balanceBDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$ ${wallet.balanceUSD.toFixed(2)}`}
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                + Add
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Automated 24/7 Delivery
            </span>
            <a 
              href="https://t.me/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 hover:underline flex items-center gap-0.5 font-bold"
            >
              24/7 Telegram Support <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
