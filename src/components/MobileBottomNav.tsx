import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Activity, 
  Wallet,
  Wrench
} from 'lucide-react';
import type { UserWallet } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wallet: UserWallet;
  currency: 'BDT' | 'USD';
  onOpenWallet: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  currency,
  onOpenWallet,
}) => {
  const balance = currency === 'BDT' ? `৳${wallet.balanceBDT.toFixed(0)}` : `$${wallet.balanceUSD.toFixed(1)}`;

  const navItems = [
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'bundles', label: 'Bundles', icon: Sparkles, badge: 'Popular' },
    { id: 'tools', label: 'Tools', icon: Wrench, badge: 'Free' },
    { id: 'orders', label: 'Track', icon: Activity },
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
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative min-h-[48px] ${
                isActive 
                  ? 'bg-slate-950 text-white shadow-xs' 
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : 'text-slate-700'}`} />
              <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                {item.label}
              </span>
              {item.badge && !isActive && (
                <span className="absolute -top-1 right-1 text-[8px] font-black uppercase px-1 rounded-full bg-indigo-600 text-white leading-tight">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* 5th Button: Quick Deposit / Wallet Button */}
        <button
          onClick={onOpenWallet}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 transition-all active:scale-95 cursor-pointer min-h-[48px]"
        >
          <div className="flex items-center gap-0.5 text-indigo-700">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold text-indigo-900 font-mono mt-0.5">
            {balance}
          </span>
        </button>

      </div>
    </div>
  );
};
