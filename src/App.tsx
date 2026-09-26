import { useState, useEffect } from 'react';
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
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LiveSupportWidget } from './components/LiveSupportWidget';
import { CategoryLandingPage, CATEGORY_CONFIGS } from './pages/CategoryLandingPage';
import { ToolLandingPage, TOOL_CONFIGS } from './pages/ToolLandingPage';
import { AffiliatePortal } from './components/AffiliatePortal';
import { GeoSelectorModal } from './components/GeoSelectorModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { updatePageSEO } from './services/seoService';
import confetti from 'canvas-confetti';
import { Footer } from './components/Footer';
import { getLocalWallet, getLocalOrders, saveLocalWallet, createPaidGatewayOrder, depositFunds, verifyAndCreditPayment } from './services/growthService';
import { captureReferralCodeFromUrl, creditAffiliateOnOrder } from './services/affiliateService';
import { ALL_SERVICES } from './data/growthData';
import type { UserWallet, SmmOrder, SmmService, GrowthBundle, SocialPlatform } from './types';

function MainAppContent() {
  const { currency, setCurrency, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('store');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  const [wallet, setWallet] = useState<UserWallet>(() => getLocalWallet());
  const [orders, setOrders] = useState<SmmOrder[]>(() => getLocalOrders());
  
  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<SmmOrder | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
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

  // URL Routing & Payment Gateway Callback Auto-Verification
  useEffect(() => {
    // Capture referral code if present (?ref=CODE)
    captureReferralCodeFromUrl();

    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path.startsWith('services/')) {
      const slug = path.replace('services/', '');
      if (CATEGORY_CONFIGS[slug]) {
        setActiveCategorySlug(slug);
        setActiveToolSlug(null);
        setActiveTab('category_landing');
      }
    } else if (path.startsWith('tools/')) {
      const slug = path.replace('tools/', '');
      if (TOOL_CONFIGS[slug]) {
        setActiveToolSlug(slug);
        setActiveCategorySlug(null);
        setActiveTab('tool_landing');
      }
    } else if (path === 'affiliate') {
      setActiveTab('affiliate');
      setActiveCategorySlug(null);
      setActiveToolSlug(null);
    } else {
      // Default homepage SEO
      updatePageSEO({
        title: language === 'bn'
          ? 'HereWeGrow — বাংলাদেশের সেরা সোশ্যাল ক্রিয়েটর টুলস ও গ্রোথ ইঞ্জিন'
          : 'HereWeGrow — All-in-One Social Creator Tools & Verified Growth Studio',
        description: language === 'bn'
          ? 'ফ্রি ক্রিয়েটর টুলস (টিকটক ডাউনলোডার, ইউটিউব ট্যাগ এক্সট্র্যাক্টর, ইআর% ক্যালকুলেটর) এবং নন-ড্রপ গ্যারান্টিযুক্ত গ্রোথ সার্ভিস। বিকাশ, নগদ ও বাইনান্স পে।'
          : 'Supercharge your social reach with 100% Free Creator Tools (TikTok Downloader, YouTube Tag Extractor, ER% Calculator, Bio Fonts) and verified reliable growth services with bKash, Nagad, Crypto & Cards.',
        canonicalUrl: 'https://herewegrow.pro/',
        keywords: [
          'smm panel bangladesh',
          'buy facebook followers bkash',
          'youtube 4000 watch hours',
          'free tiktok downloader hd',
          'instagram engagement calculator',
          'HereWeGrow'
        ]
      });
    }

    // Check if returning from Paymently gateway (bKash/Nagad/Cards)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const invoiceId = urlParams.get('invoice_id') || urlParams.get('invoiceId') || urlParams.get('transaction_id') || urlParams.get('trx_id');
    const statusParam = urlParams.get('status');

    const isPaymentSuccess = 
      paymentStatus === 'success' || 
      paymentStatus === 'COMPLETED' || 
      statusParam === 'COMPLETED' || 
      statusParam === 'SUCCESS' || 
      Boolean(invoiceId);

    if (isPaymentSuccess) {
      setIsWalletModalOpen(false);

      if (invoiceId) {
        verifyAndCreditPayment(invoiceId).then(res => {
          if (res.wallet) {
            setWallet(res.wallet);
          }
          if (res.order) {
            setOrders(prev => [res.order!, ...prev]);
            setConfirmedOrder(res.order);
            setIsConfirmationModalOpen(true);
            setActiveTab('orders');
          }
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        const pendingOrderStr = localStorage.getItem('hwg_pending_order');
        if (pendingOrderStr) {
          try {
            const pending = JSON.parse(pendingOrderStr);
            const catalogService = ALL_SERVICES.find(s => s.id === pending.serviceId);
            const targetService: SmmService = catalogService || {
              id: pending.serviceId,
              name: 'Direct Order Package',
              platform: 'facebook',
              category: 'Growth Package',
              ratePer1kBDT: pending.cost,
              ratePer1kUSD: pending.cost / 122,
              minQty: pending.quantity,
              maxQty: pending.quantity,
              speed: 'Instant Server Queue',
              refillDays: 30,
              badges: ['non-drop', 'instant', 'best-seller'],
              description: 'Direct Gateway Checkout Order'
            };

            createPaidGatewayOrder(targetService, pending.link, pending.quantity, pending.currency, pending.cost).then(res => {
              localStorage.removeItem('hwg_pending_order');
              if (res.order) {
                setOrders(prev => [res.order!, ...prev]);
                setConfirmedOrder(res.order);
                setIsConfirmationModalOpen(true);
                setActiveTab('orders');
                try {
                  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                } catch (e) {
                  console.error(e);
                }
              }
            });
          } catch (e) {
            console.error('Error auto-finalizing pending order:', e);
            localStorage.removeItem('hwg_pending_order');
          }
        }

        const pendingDepositStr = localStorage.getItem('hwg_pending_deposit');
        if (pendingDepositStr) {
          try {
            const pending = JSON.parse(pendingDepositStr);
            const updated = depositFunds('bkash', pending.amount, pending.currency);
            setWallet(updated);
            localStorage.removeItem('hwg_pending_deposit');
            try {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } catch (e) {
              console.error(e);
            }
          } catch (e) {
            console.error('Error auto-finalizing deposit:', e);
            localStorage.removeItem('hwg_pending_deposit');
          }
        }
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [language]);

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
    setConfirmedOrder(newOrder);
    setIsConfirmationModalOpen(true);
    creditAffiliateOnOrder(newOrder.chargeBDT || 0);
  };

  const handleSelectServiceTabFromTool = (platformId?: string) => {
    if (platformId) {
      setSelectedStorePlatform(platformId as SocialPlatform);
    }
    setActiveCategorySlug(null);
    setActiveToolSlug(null);
    setActiveTab('store');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleTabNavigate = (tabId: string) => {
    setActiveCategorySlug(null);
    setActiveToolSlug(null);
    setActiveTab(tabId);
    if (tabId === 'affiliate') {
      window.history.pushState({}, '', '/affiliate');
    } else if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    setActiveToolSlug(null);
    setActiveTab('category_landing');
    window.history.pushState({}, '', `/services/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTool = (slug: string) => {
    setActiveToolSlug(slug);
    setActiveCategorySlug(null);
    setActiveTab('tool_landing');
    window.history.pushState({}, '', `/tools/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshOrders = () => {
    setOrders(getLocalOrders());
  };

  // Secret Admin Shortcut: Ctrl + Shift + A or Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased pb-28 lg:pb-0">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabNavigate}
        currency={currency}
        setCurrency={handleCurrencyChange}
        wallet={wallet}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Dedicated Organic SEO Category Landing Page */}
        {activeTab === 'category_landing' && activeCategorySlug && (
          <CategoryLandingPage
            categorySlug={activeCategorySlug}
            currency={currency}
            onSelectService={handleOpenServiceOrder}
            onOpenWallet={() => setIsWalletModalOpen(true)}
            onNavigateHome={() => handleTabNavigate('store')}
            onNavigateCategory={handleNavigateCategory}
          />
        )}

        {/* Dedicated High-Intent Free Tool Landing Page */}
        {activeTab === 'tool_landing' && activeToolSlug && (
          <ToolLandingPage
            toolSlug={activeToolSlug}
            currency={currency}
            onNavigateHome={() => handleTabNavigate('store')}
            onNavigateCategory={handleNavigateCategory}
          />
        )}

        {/* Tab 1: Hero & Main Growth Catalog Store */}
        {activeTab === 'store' && (
          <>
            <HeroSection
              onExploreTools={(url) => {
                setPrefilledToolUrl(url);
                handleTabNavigate('tools');
              }}
              onExploreBundles={() => handleTabNavigate('bundles')}
              onExploreStore={(q) => {
                const el = document.getElementById('catalog-search-input');
                if (el) {
                  el.focus();
                  if (q) (el as HTMLInputElement).value = q;
                }
              }}
            />

            <GrowthCatalogSection
              currency={currency}
              initialPlatform={selectedStorePlatform}
              onSelectServiceForOrder={handleOpenServiceOrder}
              onOrderService={handleOpenServiceOrder}
              onExploreBundles={() => handleTabNavigate('bundles')}
              onExploreTools={() => handleTabNavigate('tools')}
              onOpenWallet={() => setIsWalletModalOpen(true)}
              onOrderPlaced={handleOrderPlaced}
              wallet={wallet}
            />
          </>
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
            onExploreServices={() => {
              setActiveTab('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTopUpClick={() => setIsWalletModalOpen(true)}
            onOpenProviderSettings={() => setIsAdminModalOpen(true)}
          />
        )}

        {/* Tab 5: Reseller API Documentation */}
        {activeTab === 'api' && (
          <ApiDocsSection currency={currency} />
        )}

        {/* Tab 6: Dedicated Student Affiliate & Partner Portal */}
        {activeTab === 'affiliate' && (
          <AffiliatePortal 
            currency={currency} 
            onNavigateStore={() => handleTabNavigate('store')} 
          />
        )}

      </main>

      {/* Footer */}
      <Footer 
        onNavigateTab={handleTabNavigate} 
        onNavigateCategory={handleNavigateCategory}
        onNavigateTool={handleNavigateTool}
        onOpenAdmin={() => setIsAdminModalOpen(true)} 
      />

      {/* Mobile Sticky Quick Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabNavigate}
        wallet={wallet}
        currency={currency}
        onOpenWallet={() => setIsWalletModalOpen(true)}
      />

      {/* Geo / Location / Currency / Language Selector Modal */}
      <GeoSelectorModal />

      {/* Wallet Deposit Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        currency={currency}
        onWalletUpdated={(updated) => setWallet(updated)}
      />

      {/* Place Order Modal (Equipped with Direct 1-Click Gateway Checkout) */}
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

      {/* Digital Receipt & Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        order={confirmedOrder}
        onNavigateToTracker={() => {
          setIsConfirmationModalOpen(false);
          setActiveCategorySlug(null);
          setActiveToolSlug(null);
          setActiveTab('orders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Comprehensive Executive Admin Center */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onRefreshParent={refreshOrders}
      />

      {/* Floating 24/7 Live Support & Instant WhatsApp Assistant */}
      <LiveSupportWidget />

    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}

export default App;
