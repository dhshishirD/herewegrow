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
  Plus,
  Users,
  Globe
} from 'lucide-react';
import type { UserWallet } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: 'BDT' | 'USD';
  setCurrency: (c: 'BDT' | 'USD') => void;
  wallet: UserWallet;
  onOpenWallet: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  wallet,
  onOpenWallet,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastLogoTapRef = React.useRef<number>(0);
  const { t, country, language, setIsGeoModalOpen } = useLanguage();

  const navItems = [
    { id: 'store', label: t('nav_store'), icon: ShoppingBag },
    { id: 'bundles', label: t('nav_bundles'), icon: Sparkles, badge: t('nav_badge_popular') },
    { id: 'affiliate', label: t('nav_affiliate'), icon: Users, badge: t('nav_badge_earn') },
    { id: 'tools', label: t('nav_tools'), icon: Wrench },
    { id: 'orders', label: t('nav_orders'), icon: Activity },
    { id: 'api', label: t('nav_api'), icon: Code2 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoTapRef.current < 500) {
      if (onOpenAdmin) onOpenAdmin();
    } else {
      handleNavClick('store');
    }
    lastLogoTapRef.current = now;
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Monogram & Title */}
          <div 
            onClick={handleLogoClick}
            onDoubleClick={onOpenAdmin}
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

          {/* Right Controls: Geo/Language, Currency & Clean Wallet */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Geo & Language Selector Trigger Button */}
            <button
              onClick={() => setIsGeoModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
              title="Change Country, Language & Currency"
            >
              <span className="text-sm">{country.flag}</span>
              <span className="hidden md:inline text-[11px]">
                {language === 'bn' ? 'বাংলা' : 'EN'}
              </span>
              <Globe className="w-3 h-3 text-slate-500" />
            </button>

            {/* Currency Pill Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/90 text-xs font-bold">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
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
                className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
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
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 pl-2.5 sm:pl-3 shadow-2xs">
              <div className="flex items-center gap-1 sm:gap-1.5 mr-1.5 sm:mr-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-mono font-bold text-slate-900">
                  {currency === 'BDT' ? `৳${wallet.balanceBDT.toFixed(2)}` : `$${wallet.balanceUSD.toFixed(2)}`}
                </span>
              </div>
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">{t('nav_deposit')}</span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
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
          {/* Quick Geo & Currency Selector inside mobile drawer */}
          <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsGeoModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <span className="text-lg">{country.flag}</span>
              <span>{country.name} ({language === 'bn' ? 'বাংলা' : 'English'})</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-indigo-600">
              {currency === 'BDT' ? '৳ BDT' : '$ USD'}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
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
