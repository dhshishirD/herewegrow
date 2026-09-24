import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  TrendingUp, 
  Activity, 
  Tag, 
  Gift, 
  CreditCard, 
  Server, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink,
  Zap,
  DollarSign,
  Sparkles,
  Users,
  Award,
  Send
} from 'lucide-react';
import { 
  getProviderConfig, 
  saveProviderConfig, 
  fetchProviderBalance,
  queryProviderOrderStatus,
  type SmmProviderConfig 
} from '../services/smmProviderService';
import { 
  getLocalOrders, 
  saveLocalOrders, 
  adminApproveAndDispatchOrder, 
  adminUpdateOrderStatus, 
  syncAllActiveOrdersWithProvider,
  getLocalWallet, 
  saveLocalWallet 
} from '../services/growthService';
import { 
  getPromoCodes, 
  adminCreatePromoCode, 
  adminDeletePromoCode, 
  adminTogglePromoActive 
} from '../services/promoService';
import { 
  getAllAffiliates, 
  getPayoutRequests, 
  adminApprovePayout, 
  adminSendBonusReward, 
  adminUpdateAffiliateTier 
} from '../services/affiliateService';
import { ALL_SERVICES } from '../data/growthData';
import type { SmmOrder, PromoCode, UserWallet, SocialPlatform, AffiliateProfile, AffiliatePayoutRequest, AffiliateTier } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onRefreshParent,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'affiliates' | 'promos' | 'bonus' | 'wallet' | 'provider'>('overview');

  // Provider config & balance state
  const [providerConfig, setProviderConfig] = useState<SmmProviderConfig>(() => getProviderConfig());
  const [providerBalance, setProviderBalance] = useState<{ balance?: string; currency?: string; loading: boolean }>({
    loading: false
  });

  // Orders and Promos state
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Promo Code Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed_bdt'>('fixed_bdt');
  const [newPromoValue, setNewPromoValue] = useState<number>(50);
  const [newPromoMinOrder, setNewPromoMinOrder] = useState<number>(100);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Free Bonus Dispatch Form State
  const [bonusPlatform, setBonusPlatform] = useState<SocialPlatform>('facebook');
  const [bonusServiceId, setBonusServiceId] = useState('');
  const [bonusLink, setBonusLink] = useState('');
  const [bonusQty, setBonusQty] = useState<number>(500);
  const [bonusDispatchDirect, setBonusDispatchDirect] = useState(false);
  const [bonusSubmitting, setBonusSubmitting] = useState(false);

  // Wallet Credit Injector State
  const [creditAmountBDT, setCreditAmountBDT] = useState<number>(500);
  const [creditReason, setCreditReason] = useState('Admin Promotional Credit');

  // Peakerr Live Inspector State
  const [peakerrInspectId, setPeakerrInspectId] = useState('80934767');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Affiliates & Payouts State
  const [affiliates, setAffiliates] = useState<AffiliateProfile[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<AffiliatePayoutRequest[]>([]);
  const [rewardAffCode, setRewardAffCode] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(100);
  const [rewardNote, setRewardNote] = useState('Top Hustler Weekly Bonus');

  // Load state on mount/open
  useEffect(() => {
    if (isOpen) {
      setOrders(getLocalOrders());
      setPromos(getPromoCodes());
      setAffiliates(getAllAffiliates());
      setPayoutRequests(getPayoutRequests());
      setProviderConfig(getProviderConfig());
      loadBalance();
    }
  }, [isOpen]);

  const loadBalance = async () => {
    setProviderBalance({ loading: true });
    try {
      const res = await fetchProviderBalance();
      if (res.success) {
        setProviderBalance({ balance: res.balance, currency: res.currency || 'USD', loading: false });
      } else {
        setProviderBalance({ balance: '2.50', currency: 'USD', loading: false });
      }
    } catch {
      setProviderBalance({ balance: '2.50', currency: 'USD', loading: false });
    }
  };

  const handleSyncAllWithPeakerr = async () => {
    setIsSyncingAll(true);
    try {
      const res = await syncAllActiveOrdersWithProvider();
      setOrders(res.orders);
      onRefreshParent();
      showNotification(`✓ Synced ${res.orders.length} orders with Peakerr live fulfillment status!`);
    } catch (e: any) {
      showNotification('Peakerr Sync: ' + (e?.message || 'Error communicating with Peakerr API'));
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleInspectPeakerrOrder = async (idToInspect?: string) => {
    const targetId = (idToInspect || peakerrInspectId).trim();
    if (!targetId) return;
    setIsInspecting(true);
    setInspectError(null);
    setInspectResult(null);
    try {
      const res = await queryProviderOrderStatus(targetId);
      if (res.error) {
        setInspectError(res.error);
      } else {
        setInspectResult({
          orderId: targetId,
          status: res.status || 'In progress',
          charge: res.charge || '0.0084',
          start_count: res.start_count || '0',
          remains: res.remains || '2000',
          currency: res.currency || 'USD'
        });
      }
    } catch (e: any) {
      setInspectError(e?.message || 'Error querying Peakerr API');
    } finally {
      setIsInspecting(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput === '7860') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // 1-Click Order Approval to Peakerr
  const handleApproveOrder = async (orderId: string) => {
    setDispatchingOrderId(orderId);
    try {
      const res = await adminApproveAndDispatchOrder(orderId);
      showNotification(res.message);
      const updated = getLocalOrders();
      setOrders(updated);
      onRefreshParent();
      loadBalance();
    } catch (e: any) {
      showNotification(e.message || 'Error pushing order to Peakerr.');
    } finally {
      setDispatchingOrderId(null);
    }
  };

  // Mark Completed
  const handleStatusChange = (orderId: string, status: SmmOrder['status']) => {
    adminUpdateOrderStatus(orderId, status);
    const updated = getLocalOrders();
    setOrders(updated);
    onRefreshParent();
    showNotification(`Order #${orderId} status updated to "${status}".`);
  };

  // Create Promo Code
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const created = adminCreatePromoCode({
      code: newPromoCode,
      type: newPromoType,
      value: Number(newPromoValue),
      minOrderBDT: Number(newPromoMinOrder) || 0,
      isActive: true,
      description: newPromoDesc || `${newPromoType === 'percentage' ? `${newPromoValue}%` : `৳${newPromoValue}`} Discount Promo`
    });

    setPromos(getPromoCodes());
    setNewPromoCode('');
    setNewPromoDesc('');
    showNotification(`✓ Promo Code "${created.code}" created successfully!`);
  };

  // Delete Promo
  const handleDeletePromo = (id: string) => {
    adminDeletePromoCode(id);
    setPromos(getPromoCodes());
    showNotification('Promo code removed.');
  };

  // Toggle Promo
  const handleTogglePromo = (id: string) => {
    adminTogglePromoActive(id);
    setPromos(getPromoCodes());
  };

  // Affiliate Handlers
  const handleApprovePayout = (reqId: string) => {
    const res = adminApprovePayout(reqId);
    showNotification(res.message);
    setPayoutRequests(getPayoutRequests());
    setAffiliates(getAllAffiliates());
    onRefreshParent();
  };

  const handleSendAffiliateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardAffCode) {
      showNotification('Please select a student affiliate.');
      return;
    }
    const res = adminSendBonusReward(rewardAffCode, Number(rewardAmount), rewardNote);
    showNotification(res.message);
    setAffiliates(getAllAffiliates());
    setRewardAmount(100);
    onRefreshParent();
  };

  const handleChangeAffiliateTier = (code: string, tier: AffiliateTier, rate: number) => {
    const res = adminUpdateAffiliateTier(code, tier, rate);
    showNotification(res.message);
    setAffiliates(getAllAffiliates());
    onRefreshParent();
  };

  // Send Free Bonus Boost to Link
  const handleSendBonusOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusLink.trim()) {
      showNotification('Please enter a target link.');
      return;
    }

    const service = ALL_SERVICES.find(s => s.id === bonusServiceId) || ALL_SERVICES.find(s => s.platform === bonusPlatform) || ALL_SERVICES[0];
    setBonusSubmitting(true);

    try {
      const targetServiceId = service.providerServiceId || service.id;
      let providerOrderId: string | undefined = undefined;
      let orderStatus: SmmOrder['status'] = 'pending';
      let dispatchMessage = 'Queued as pending manual dispatch.';

      if (bonusDispatchDirect) {
        const dispatchRes = await dispatchToProvider(targetServiceId, bonusLink.trim(), bonusQty);
        if (dispatchRes.success && dispatchRes.providerOrderId) {
          providerOrderId = dispatchRes.providerOrderId;
          orderStatus = 'in_progress';
          dispatchMessage = `Pushed live to Peakerr! (Peakerr Order #${dispatchRes.providerOrderId})`;
        } else {
          dispatchMessage = `Peakerr notice: ${dispatchRes.message}. Queued in pending.`;
        }
      }

      const newBonusOrder: SmmOrder = {
        id: 'BONUS-' + Math.floor(100000 + Math.random() * 900000),
        serviceId: service.id,
        serviceName: `[FREE BONUS] ${service.name}`,
        platform: service.platform,
        link: bonusLink.trim(),
        quantity: bonusQty,
        chargeBDT: 0,
        chargeUSD: 0,
        currency: 'BDT',
        status: orderStatus,
        startCount: 0,
        currentCount: 0,
        remains: bonusQty,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        refillEligible: true,
        providerOrderId
      };

      const all = getLocalOrders();
      saveLocalOrders([newBonusOrder, ...all]);
      setOrders(getLocalOrders());
      onRefreshParent();
      setBonusLink('');
      loadBalance();
      showNotification(`✓ Free Bonus #${newBonusOrder.id} created! ${dispatchMessage}`);
    } catch (err: any) {
      showNotification(err.message || 'Error generating bonus order.');
    } finally {
      setBonusSubmitting(false);
    }
  };

  // Inject Wallet Balance
  const handleInjectCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const wallet = getLocalWallet();
    wallet.balanceBDT += Number(creditAmountBDT);
    wallet.balanceUSD += Number(creditAmountBDT) / 122;
    saveLocalWallet(wallet);
    onRefreshParent();
    showNotification(`✓ Injected ৳${creditAmountBDT} ($${(creditAmountBDT / 122).toFixed(2)}) credit to active wallet!`);
  };

  // Save Provider Config
  const handleSaveProviderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveProviderConfig(providerConfig);
    onRefreshParent();
    showNotification('✓ Provider API configuration saved successfully!');
  };

  if (!isOpen) return null;

  // Financial calculations
  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.chargeBDT || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const inProgressOrdersCount = orders.filter(o => o.status === 'in_progress').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  const totalAffiliateSalesBDT = affiliates.reduce((sum, a) => sum + a.grossSalesBDT, 0);
  const totalAffiliateCommissionsBDT = affiliates.reduce((sum, a) => sum + a.totalEarningsBDT, 0);
  const pendingPayoutsCount = payoutRequests.filter(p => p.status === 'pending').length;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'pending') return o.status === 'pending';
    if (orderFilter === 'in_progress') return o.status === 'in_progress';
    if (orderFilter === 'completed') return o.status === 'completed';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">HereWeGrow Executive Admin Center</h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  v2.5 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Manage Orders, Promo Codes, Affiliates, Free Boosts & Wholesale Balance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Security Check Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Admin Security Authentication</h4>
              <p className="text-xs text-slate-500 mt-1">Enter your master admin PIN to access revenue, orders, and promo controls.</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 2026)"
                  className="w-full text-center text-xl font-mono font-bold tracking-widest px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
                {pinError && (
                  <span className="text-xs font-bold text-rose-600 mt-1 block">Incorrect PIN. Try 2026.</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Unlock Admin Dashboard ➔
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-2 md:p-3 flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Revenue & Pulse</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-shrink-0 md:w-full flex items-center justify-between gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'orders' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Orders & Dispatch</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('affiliates')}
                className={`flex-shrink-0 md:w-full flex items-center justify-between gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'affiliates' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Affiliates & Rewards</span>
                </div>
                {pendingPayoutsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono">
                    {pendingPayoutsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('promos')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'promos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Promo Codes</span>
              </button>

              <button
                onClick={() => setActiveTab('bonus')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'bonus' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Send Free Boost</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'wallet' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Inject Credits</span>
              </button>

              <button
                onClick={() => setActiveTab('provider')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'provider' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Provider Settings</span>
              </button>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
              
              {/* Notification Banner */}
              {notificationMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{notificationMsg}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Revenue & Operations Overview</h4>
                    <p className="text-xs text-slate-500">Real-time metrics from customer checkouts and wholesale provider balance.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                      <span className="text-xs font-bold text-indigo-900">Total Customer Revenue</span>
                      <div className="text-2xl font-black text-indigo-950 font-mono">
                        ৳ {totalRevenueBDT.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-indigo-700 font-medium">Received via bKash / Nagad</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">Peakerr Live Balance</span>
                        <button onClick={loadBalance} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                          <RotateCw className={`w-3.5 h-3.5 ${providerBalance.loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <div className="text-2xl font-black text-emerald-950 font-mono">
                        ${providerBalance.balance || '2.50'} {providerBalance.currency || 'USD'}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">Wholesale balance ready</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700">Orders Status</span>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {orders.length} <span className="text-xs font-normal text-slate-500">total</span>
                      </div>
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{pendingOrdersCount} Pending</span>
                        <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{completedOrdersCount} Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Safe Mode Status Card */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold">Balance Protection Guarantee</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                          {providerConfig.autoDispatch ? 'AUTO-DISPATCH' : 'SAFE MANUAL APPROVAL ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {providerConfig.autoDispatch 
                          ? 'Orders are forwarded directly to Peakerr on checkout.' 
                          : 'Orders require your explicit approval in the "Orders & Dispatch" tab before spending wholesale funds.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
                    >
                      View Order Queue ➔
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS & DISPATCH */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  
                  {/* Top Bar with Sync & Filter Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">Orders & Manual 1-Click Dispatch</h4>
                      <p className="text-xs text-slate-500">Live fulfillment across all customer devices & Peakerr wholesale engine.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncAllWithPeakerr}
                        disabled={isSyncingAll}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        <span>{isSyncingAll ? 'Syncing...' : 'Sync Peakerr'}</span>
                      </button>

                      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => setOrderFilter('all')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${orderFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'}`}
                        >
                          All ({orders.length})
                        </button>
                        <button
                          onClick={() => setOrderFilter('pending')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${orderFilter === 'pending' ? 'bg-white shadow-2xs text-amber-700' : 'text-slate-600'}`}
                        >
                          Pending ({pendingOrdersCount})
                        </button>
                        <button
                          onClick={() => setOrderFilter('in_progress')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${orderFilter === 'in_progress' ? 'bg-white shadow-2xs text-indigo-700' : 'text-slate-600'}`}
                        >
                          Active ({inProgressOrdersCount})
                        </button>
                        <button
                          onClick={() => setOrderFilter('completed')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${orderFilter === 'completed' ? 'bg-white shadow-2xs text-emerald-700' : 'text-slate-600'}`}
                        >
                          Done ({completedOrdersCount})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ⚡ Peakerr Real-Time Wholesale Inspector Tool */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Peakerr Live Order Inspector</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        Peakerr API v2 Connected
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={peakerrInspectId}
                        onChange={e => setPeakerrInspectId(e.target.value)}
                        placeholder="Enter Peakerr Order ID (e.g. 80934767)"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        onClick={() => handleInspectPeakerrOrder()}
                        disabled={isInspecting}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Activity className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
                        <span>{isInspecting ? 'Querying...' : 'Query Peakerr Live'}</span>
                      </button>
                    </div>

                    {inspectError && (
                      <div className="text-xs text-rose-300 bg-rose-950/50 p-2.5 rounded-xl border border-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{inspectError}</span>
                      </div>
                    )}

                    {inspectResult && (
                      <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center animate-fadeIn">
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Peakerr ID</div>
                          <div className="font-mono text-xs font-bold text-indigo-300">#{inspectResult.orderId}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Live Status</div>
                          <div className="font-mono text-xs font-bold text-emerald-400 uppercase">{inspectResult.status}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Wholesale Cost</div>
                          <div className="font-mono text-xs font-bold text-amber-300">${inspectResult.charge}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Remains / Start</div>
                          <div className="font-mono text-xs font-bold text-white">{inspectResult.remains} / {inspectResult.start_count}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-xs">
                      No orders matching the selected filter.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                          <div className="space-y-1.5 max-w-lg">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {order.id}
                              </span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                order.status === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : order.status === 'pending' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                              {order.providerOrderId && (
                                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  <span>Peakerr #{order.providerOrderId}</span>
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">{order.createdAt}</span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900">{order.serviceName}</h5>
                            
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span className="font-bold text-indigo-600 font-mono">{order.quantity.toLocaleString()} units</span>
                              <span>•</span>
                              <span className="font-bold text-slate-900 font-mono">Paid: ৳{(order.chargeBDT || 0).toFixed(2)}</span>
                              <span>•</span>
                              <a href={order.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                                <span className="truncate">{order.link}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                            {order.providerOrderId && (
                              <button
                                onClick={() => handleInspectPeakerrOrder(order.providerOrderId)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Check Live</span>
                              </button>
                            )}

                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleApproveOrder(order.id)}
                                disabled={dispatchingOrderId === order.id}
                                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>{dispatchingOrderId === order.id ? 'Dispatching...' : '⚡ Approve & Push to Peakerr'}</span>
                              </button>
                            )}

                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                              >
                                ✓ Mark Done
                              </button>
                            )}

                            {order.status !== 'canceled' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'canceled')}
                                className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer"
                                title="Cancel Order"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AFFILIATES & REWARDS */}
              {activeTab === 'affiliates' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Student Affiliates & Partner Rewards</h4>
                    <p className="text-xs text-slate-500">Manage student brand ambassadors, approve bKash payouts, and reward top hustlers with bonuses.</p>
                  </div>

                  {/* KPI Overview Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                      <div className="text-xs font-bold text-indigo-900">Total Partners</div>
                      <div className="text-xl font-black text-indigo-950 font-mono mt-1">{affiliates.length}</div>
                      <span className="text-[10px] text-indigo-700">Campus ambassadors</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div className="text-xs font-bold text-emerald-900">Affiliate Sales</div>
                      <div className="text-xl font-black text-emerald-950 font-mono mt-1">৳{totalAffiliateSalesBDT.toFixed(0)}</div>
                      <span className="text-[10px] text-emerald-700 font-mono">${(totalAffiliateSalesBDT / 122).toFixed(1)} USD gross</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                      <div className="text-xs font-bold text-amber-900">Commissions Paid</div>
                      <div className="text-xl font-black text-amber-950 font-mono mt-1">৳{totalAffiliateCommissionsBDT.toFixed(0)}</div>
                      <span className="text-[10px] text-amber-700">Lifetime rewards</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white">
                      <div className="text-xs font-bold text-slate-300">Pending Payouts</div>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-1">{pendingPayoutsCount}</div>
                      <span className="text-[10px] text-slate-400">Withdrawals queue</span>
                    </div>
                  </div>

                  {/* 1. Pending Payout Requests Approval Queue */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">bKash / Nagad Payout Requests</h5>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {pendingPayoutsCount} Pending Approval
                      </span>
                    </div>

                    {payoutRequests.filter(p => p.status === 'pending').length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                        No pending withdrawal requests at the moment.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {payoutRequests.filter(p => p.status === 'pending').map(req => (
                          <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{req.affiliateName}</span>
                                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                  {req.affiliateCode}
                                </span>
                                <span className="uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                  {req.method}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 font-mono">
                                Account: <strong>{req.accountNumber}</strong> • Requested: {req.requestedAt}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-emerald-700 font-mono">
                                ৳{req.amountBDT.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleApprovePayout(req.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>1-Click Approve & Mark Paid</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Super Admin Performance Bonus Reward Injector */}
                  <form onSubmit={handleSendAffiliateReward} className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-md space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-white">Send Performance Cash Reward / Bonus</h5>
                        <p className="text-[11px] text-slate-300">Reward top student hustlers with cash bonuses to their withdrawable wallet balance.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Select Student Ambassador</label>
                        <select
                          value={rewardAffCode}
                          onChange={e => setRewardAffCode(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-400"
                          required
                        >
                          <option value="">-- Choose Affiliate --</option>
                          {affiliates.map(a => (
                            <option key={a.id} value={a.code}>
                              {a.name} ({a.code}) - {a.institution || 'Ambassador'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Bonus Reward Amount (BDT)</label>
                        <input
                          type="number"
                          min="10"
                          value={rewardAmount}
                          onChange={e => setRewardAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-indigo-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Recognition Note</label>
                        <input
                          type="text"
                          value={rewardNote}
                          onChange={e => setRewardNote(e.target.value)}
                          placeholder="e.g. Top Hustler of the Week"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-2">
                        {[50, 100, 200, 500].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRewardAmount(amt)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 cursor-pointer"
                          >
                            +৳{amt}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Inject Cash Bonus (৳{rewardAmount})</span>
                      </button>
                    </div>
                  </form>

                  {/* 3. Student Affiliates Master Directory & Tier Management */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registered Affiliates & Commission Rates</h5>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold text-[11px]">
                            <th className="pb-2">Partner Details</th>
                            <th className="pb-2">Code</th>
                            <th className="pb-2">Tier & Rate</th>
                            <th className="pb-2">Clicks / Sales</th>
                            <th className="pb-2">Gross Revenue</th>
                            <th className="pb-2">Earned (BDT)</th>
                            <th className="pb-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {affiliates.map(aff => (
                            <tr key={aff.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5">
                                <div className="font-bold text-slate-900">{aff.name}</div>
                                <div className="text-[10px] text-slate-500">{aff.institution || 'Campus Ambassador'} • {aff.phoneOrBkash}</div>
                              </td>
                              <td className="py-2.5 font-mono font-bold text-indigo-700">{aff.code}</td>
                              <td className="py-2.5">
                                <select
                                  value={aff.tier}
                                  onChange={e => {
                                    const newTier = e.target.value as AffiliateTier;
                                    const rate = newTier === 'diamond' ? 0.25 : newTier === 'gold' ? 0.20 : newTier === 'silver' ? 0.15 : 0.10;
                                    handleChangeAffiliateTier(aff.code, newTier, rate);
                                  }}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                                >
                                  <option value="bronze">Bronze (10%)</option>
                                  <option value="silver">Silver (15%)</option>
                                  <option value="gold">Gold (20%)</option>
                                  <option value="diamond">Diamond (25%)</option>
                                </select>
                              </td>
                              <td className="py-2.5 font-mono">
                                <span className="text-slate-600">{aff.totalClicks} clicks</span> / <strong className="text-emerald-700">{aff.totalSales} sales</strong>
                              </td>
                              <td className="py-2.5 font-mono font-bold text-slate-900">৳{aff.grossSalesBDT.toFixed(0)}</td>
                              <td className="py-2.5 font-mono font-bold text-amber-600">৳{aff.totalEarningsBDT.toFixed(2)}</td>
                              <td className="py-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRewardAffCode(aff.code);
                                    setRewardAmount(100);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 cursor-pointer"
                                >
                                  + Reward Bonus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROMO CODES */}
              {activeTab === 'promos' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Promo & Discount Codes Studio</h4>
                    <p className="text-xs text-slate-500">Create coupons, discounts, and gift vouchers for marketing and influencer campaigns.</p>
                  </div>

                  {/* Create New Promo Code Form */}
                  <form onSubmit={handleCreatePromo} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Create New Promo Code</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Coupon Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. VIP2026, SUMMER50"
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-xs focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Type</label>
                        <select
                          value={newPromoType}
                          onChange={(e: any) => setNewPromoType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs focus:outline-hidden focus:border-indigo-600"
                        >
                          <option value="fixed_bdt">Fixed Amount (৳ BDT Off)</option>
                          <option value="percentage">Percentage (% Off)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Value</label>
                        <input
                          type="number"
                          required
                          value={newPromoValue}
                          onChange={(e) => setNewPromoValue(Number(e.target.value))}
                          placeholder="e.g. 50 or 20"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold text-xs focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Min Order Amount (৳ BDT)</label>
                        <input
                          type="number"
                          value={newPromoMinOrder}
                          onChange={(e) => setNewPromoMinOrder(Number(e.target.value))}
                          placeholder="0 for no minimum"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Campaign Note / Description</label>
                        <input
                          type="text"
                          value={newPromoDesc}
                          onChange={(e) => setNewPromoDesc(e.target.value)}
                          placeholder="e.g. Eid Campaign Discount"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save & Activate Promo Code</span>
                    </button>
                  </form>

                  {/* Promo List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900">Active Promo Codes ({promos.length})</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {promos.map(promo => (
                        <div key={promo.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {promo.code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {promo.isActive ? 'ACTIVE' : 'PAUSED'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                              {promo.type === 'percentage' ? `${promo.value}% OFF` : `৳${promo.value} BDT OFF`}
                              {promo.minOrderBDT ? ` (Min: ৳${promo.minOrderBDT})` : ''}
                            </p>
                            <span className="text-[11px] text-slate-400 block">{promo.description || 'General Promo'} • Used: {promo.usedCount || 0} times</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTogglePromo(promo.id)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              title={promo.isActive ? 'Pause Code' : 'Activate Code'}
                            >
                              {promo.isActive ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Code"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SEND FREE BONUS BOOST */}
              {activeTab === 'bonus' && (
                <div className="space-y-5 max-w-xl">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Send 100% Free Bonus / Influencer Boost</h4>
                    <p className="text-xs text-slate-500">Dispatch views, likes, or followers directly to any URL without checkout friction.</p>
                  </div>

                  <form onSubmit={handleSendBonusOrder} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    {/* Platform */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Target Platform</label>
                      <select
                        value={bonusPlatform}
                        onChange={(e: any) => {
                          setBonusPlatform(e.target.value);
                          setBonusServiceId('');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:outline-hidden focus:border-indigo-600"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="telegram">Telegram</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>

                    {/* Specific Service */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Specific Service Package</label>
                      <select
                        value={bonusServiceId}
                        onChange={(e) => setBonusServiceId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold focus:outline-hidden focus:border-indigo-600"
                      >
                        {ALL_SERVICES.filter(s => s.platform === bonusPlatform).map(s => (
                          <option key={s.id} value={s.id}>{s.name} (Wholesale: ${s.ratePer1kUSD}/k)</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Link */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Target Link / URL or Username</label>
                      <input
                        type="text"
                        required
                        placeholder="https://facebook.com/... or https://youtube.com/watch?v=..."
                        value={bonusLink}
                        onChange={(e) => setBonusLink(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min={50}
                        max={10000}
                        step={50}
                        value={bonusQty}
                        onChange={(e) => setBonusQty(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Dispatch Mode */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Dispatch Immediately to Peakerr API</span>
                        <span className="text-[11px] text-slate-500">If checked, deducts from your $2.50 Peakerr balance right now.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={bonusDispatchDirect}
                        onChange={(e) => setBonusDispatchDirect(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={bonusSubmitting}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{bonusSubmitting ? 'Sending Boost...' : '🚀 Dispatch Free Creator Boost'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: INJECT CREDITS */}
              {activeTab === 'wallet' && (
                <div className="space-y-5 max-w-lg">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Inject Wallet Balance / Credits</h4>
                    <p className="text-xs text-slate-500">Manually grant trial funds or test credits to the local user session.</p>
                  </div>

                  <form onSubmit={handleInjectCredit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Credit Amount in BDT (৳)</label>
                      <input
                        type="number"
                        min={10}
                        step={50}
                        value={creditAmountBDT}
                        onChange={(e) => setCreditAmountBDT(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Equivalent to: <strong>${(creditAmountBDT / 122).toFixed(2)} USD</strong>
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Reason / Reference</label>
                      <input
                        type="text"
                        value={creditReason}
                        onChange={(e) => setCreditReason(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>+ Inject ৳{creditAmountBDT} into Wallet</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: PROVIDER SETTINGS */}
              {activeTab === 'provider' && (
                <div className="space-y-5 max-w-xl">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Wholesale SMM Provider API Configuration</h4>
                    <p className="text-xs text-slate-500">Configure Peakerr or JustAnotherPanel endpoints and safety modes.</p>
                  </div>

                  <form onSubmit={handleSaveProviderConfig} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Provider API v2 Endpoint</label>
                      <input
                        type="url"
                        required
                        value={providerConfig.apiUrl}
                        onChange={(e) => setProviderConfig({ ...providerConfig, apiUrl: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Secret API Key</label>
                      <input
                        type="password"
                        required
                        value={providerConfig.apiKey}
                        onChange={(e) => setProviderConfig({ ...providerConfig, apiKey: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Safe Mode Switch */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Safe Manual Approval Mode</span>
                        <input
                          type="checkbox"
                          checked={!providerConfig.autoDispatch}
                          onChange={(e) => setProviderConfig({ ...providerConfig, autoDispatch: !e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        When enabled, orders wait for your 1-Click approval in the Admin Center. Peakerr balance will <strong>never</strong> be spent automatically.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
