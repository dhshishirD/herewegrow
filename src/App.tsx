import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FreeToolsSection } from './components/FreeToolsSection';
import { GrowthCatalogSection } from './components/GrowthCatalogSection';
import { BundlesSection } from './components/BundlesSection';
import { OrdersTracker } from './components/OrdersTracker';
import { ApiDocsSection } from './components/ApiDocsSection';
import { WalletModal } from './components/WalletModal';
import { OrderModal } from './components/OrderModal';
import { Footer } from './components/Footer';
import { getLocalWallet, getLocalOrders, saveLocalWallet } from './services/growthService';
import type { UserWallet, SmmOrder, SmmService, GrowthBundle, SocialPlatform } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('store');
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [wallet, setWallet] = useState<UserWallet>(() => getLocalWallet());
  const [orders, setOrders] = useState<SmmOrder[]>(() => getLocalOrders());
  
  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [orderModalState, setOrderModalState] = useState<{
    isOpen: boolean;
    service: SmmService | null;
    bundle: GrowthBundle | null;
  }>({
    isOpen: false,
    service: null,
    bundle: null,
  });

  const [selectedStorePlatform, setSelectedStorePlatform] = useState<SocialPlatform>('all');

  const handleCurrencyChange = (newCurr: 'BDT' | 'USD') => {
    setCurrency(newCurr);
    const updated = { ...wallet, currencyPreference: newCurr };
    setWallet(updated);
    saveLocalWallet(updated);
  };

  const handleOpenServiceOrder = (service: SmmService) => {
    setOrderModalState({
      isOpen: true,
      service,
      bundle: null,
    });
  };

  const handleOpenBundleOrder = (bundle: GrowthBundle) => {
    setOrderModalState({
      isOpen: true,
      service: null,
      bundle,
    });
  };

  const handleOrderPlaced = (newOrder: SmmOrder, updatedWallet: UserWallet) => {
    setOrders((prev) => [newOrder, ...prev]);
    setWallet(updatedWallet);
  };

  const handleSelectServiceTabFromTool = (platformId?: string) => {
    if (platformId) {
      setSelectedStorePlatform(platformId as SocialPlatform);
    }
    setActiveTab('store');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const refreshOrders = () => {
    setOrders(getLocalOrders());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={handleCurrencyChange}
        wallet={wallet}
        onOpenWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        
        {/* Hero Section shown on primary landing tabs */}
        {(activeTab === 'store' || activeTab === 'bundles') && (
          <HeroSection
            onExploreStore={() => {
              setActiveTab('store');
              window.scrollTo({ top: 450, behavior: 'smooth' });
            }}
            onExploreBundles={() => {
              setActiveTab('bundles');
              window.scrollTo({ top: 450, behavior: 'smooth' });
            }}
            onExploreTools={() => {
              setActiveTab('tools');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 1: Growth Services Store */}
        {activeTab === 'store' && (
          <GrowthCatalogSection
            currency={currency}
            onSelectServiceForOrder={handleOpenServiceOrder}
            initialPlatform={selectedStorePlatform}
          />
        )}

        {/* Tab 2: 1-Click Bundles */}
        {activeTab === 'bundles' && (
          <BundlesSection
            currency={currency}
            onOrderBundle={handleOpenBundleOrder}
          />
        )}

        {/* Tab 3: Free Creator Tools */}
        {activeTab === 'tools' && (
          <FreeToolsSection
            currency={currency}
            onSelectServiceTab={handleSelectServiceTabFromTool}
          />
        )}

        {/* Tab 4: Live Orders Tracker */}
        {activeTab === 'orders' && (
          <OrdersTracker
            orders={orders}
            onRefreshOrders={refreshOrders}
            wallet={wallet}
            currency={currency}
            onExploreServices={() => setActiveTab('store')}
          />
        )}

        {/* Tab 5: Reseller API Docs */}
        {activeTab === 'api' && <ApiDocsSection />}

      </main>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onWalletUpdated={(updated) => setWallet(updated)}
        currency={currency}
      />

      <OrderModal
        isOpen={orderModalState.isOpen}
        onClose={() => setOrderModalState({ isOpen: false, service: null, bundle: null })}
        service={orderModalState.service}
        bundle={orderModalState.bundle}
        currency={currency}
        wallet={wallet}
        onOrderPlaced={handleOrderPlaced}
        onOpenWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Footer */}
      <Footer onNavigateTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

    </div>
  );
}

export default App;
