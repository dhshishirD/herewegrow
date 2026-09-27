import React from 'react';
import { 
  ShoppingBag, 
  Activity, 
  Wallet,
  Wrench,
  Users
} from 'lucide-react';
import type { UserWallet, SmmOrder } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: UserWallet;
  currency: 'BDT' | 'USD';
  orders?: SmmOrder[];
  onOpenWallet: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  currency,
  orders = [],
  onOpenWallet,
}) => {
  const { language } = useLanguage();
  const balance = currency === 'BDT' ? `৳${wallet.balanceBDT.toFixed(0)}` : `$${wallet.balanceUSD.toFixed(1)}`;
  const activeOrdersCount = orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length;

  const navItems = [
    { 
      id: 'store', 
      label: language === 'bn' ? 'স্টোর' : 'Store', 
      icon: ShoppingBag 
    },
    { 
      id: 'orders', 
      label: language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Orders', 
      icon: Activity,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : (orders.length > 0 ? `${orders.length}` : undefined),
      badgeColor: activeOrdersCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-700 text-white',
      isHighlight: activeOrdersCount > 0
    },
    { 
      id: 'affiliate', 
      label: language === 'bn' ? 'ইনকাম' : 'Earn', 
      icon: Users, 
      badge: '15%' 
    },
    { 
      id: 'tools', 
      label: language === 'bn' ? 'টুলস' : 'Tools', 
      icon: Wrench, 
      badge: 'Free' 
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(15,23,42,0.08)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative min-h-[50px] ${
                isActive 
                  ? 'bg-slate-950 text-white shadow-xs' 
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : (item.id === 'orders' && item.isHighlight ? 'text-amber-600' : 'text-slate-700')}`} />
                {item.badge && !isActive && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-indigo-600 text-white'} leading-tight shadow-xs`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[65px] ${isActive ? 'text-white font-extrabold' : 'text-slate-800'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th Button: Quick Deposit / Wallet Button */}
        <button
          onClick={onOpenWallet}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 transition-all active:scale-95 cursor-pointer min-h-[50px]"
          title="Open Deposit & Balance"
        >
          <div className="flex items-center gap-0.5 text-indigo-700">
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] font-extrabold text-indigo-950 font-mono mt-0.5 truncate max-w-[60px]">
            {balance}
          </span>
        </button>

      </div>
    </div>
  );
};
