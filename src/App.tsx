import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FreeToolsSection } from './components/FreeToolsSection';
import { GrowthCatalogSection } from './components/GrowthCatalogSection';
import { BundlesSection } from './components/BundlesSection';
import { OrdersTracker } from './components/OrdersTracker';
import { ApiDocsSection } from './components/ApiDocsSection';
import { WalletModal } from './components/WalletModal';
import { OrderModal } from './components/OrderModal';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
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
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
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
  const [prefilledToolUrl, setPrefilledToolUrl] = useState<string | undefined>(undefined);

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
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      
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
            onExploreStore={(_query) => {
              setActiveTab('store');
              window.scrollTo({ top: 480, behavior: 'smooth' });
            }}
            onExploreBundles={() => {
              setActiveTab('bundles');
              window.scrollTo({ top: 480, behavior: 'smooth' });
            }}
            onExploreTools={(url) => {
              if (url) {
                setPrefilledToolUrl(url);
              }
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
            initialPrefilledUrl={prefilledToolUrl}
          />
        )}

        {/* Tab 4: Live Orders Tracker */}
        {activeTab === 'orders' && (
          <OrdersTracker
            orders={orders}
            onRefreshOrders={refreshOrders}
            wallet={wallet}
            currency={currency}
            onTopUpClick={() => setIsWalletModalOpen(true)}
            onOpenProviderSettings={() => setIsProviderModalOpen(true)}
          />
        )}

        {/* Tab 5: Reseller API Documentation */}
        {activeTab === 'api' && (
          <ApiDocsSection currency={currency} />
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Wallet Deposit Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        currency={currency}
        onWalletUpdated={(updated) => setWallet(updated)}
      />

      {/* Place Order Modal */}
      <OrderModal
        isOpen={orderModalState.isOpen}
        onClose={() => setOrderModalState({ isOpen: false, service: null, bundle: null })}
        service={orderModalState.service}
        bundle={orderModalState.bundle}
        wallet={wallet}
        currency={currency}
        onOrderPlaced={handleOrderPlaced}
        onOpenWallet={() => {
          setOrderModalState({ isOpen: false, service: null, bundle: null });
          setIsWalletModalOpen(true);
        }}
      />

      {/* Wholesale SMM Provider Settings Modal */}
      <ProviderSettingsModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />

    </div>
  );
}
export default App;
