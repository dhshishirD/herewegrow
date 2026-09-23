import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  Copy, 
  Check, 
  Zap,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { depositFunds } from '../services/growthService';
import { initiateAutomatedPayment } from '../services/paymentService';
import type { UserWallet } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  onWalletUpdated: (updated: UserWallet) => void;
  currency: 'BDT' | 'USD';
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onWalletUpdated,
  currency,
}) => {
  if (!isOpen) return null;

  const [paymentMode, setPaymentMode] = useState<'automated' | 'manual_bkash' | 'manual_nagad' | 'binance'>('automated');
  const [selectedAmount, setSelectedAmount] = useState<number>(currency === 'BDT' ? 500 : 10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  const bdtPresets = [100, 250, 500, 1000, 2500, 5000];
  const usdPresets = [5, 10, 25, 50, 100];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleAutomatedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount <= 0) return;

    setIsProcessing(true);
    setGatewayError(null);

    try {
      const res = await initiateAutomatedPayment(
        finalAmount,
        customerName || 'HereWeGrow Creator',
        customerEmail || 'creator@herewegrow.pro'
      );

      setIsProcessing(false);

      if (res.success && res.paymentUrl) {
        // Open the official secure payment page in a new popup or redirect
        window.location.href = res.paymentUrl;
      } else {
        setGatewayError(res.message || 'Payment gateway connection timeout. Please choose Direct bKash.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setGatewayError(err.message || 'Could not initiate payment session.');
    }
  };

  const handleManualDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount <= 0) return;

    if (!trxId.trim()) {
      alert('Please enter your Transaction ID (TrxID) after completing payment.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const updated = depositFunds(
        paymentMode === 'binance' ? 'binance' : paymentMode === 'manual_nagad' ? 'nagad' : 'bkash',
        finalAmount,
        currency
      );
      onWalletUpdated(updated);
      setIsProcessing(false);
      setDepositSuccess(true);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => {
        setDepositSuccess(false);
        onClose();
      }, 2200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-xs">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-950">Add Funds to Wallet</h3>
            <p className="text-xs text-slate-500">
              Current Balance: <span className="text-emerald-700 font-bold font-mono">{currency === 'BDT' ? `৳ ${wallet.balanceBDT.toFixed(2)}` : `$ ${wallet.balanceUSD.toFixed(2)}`}</span>
            </p>
          </div>
        </div>

        {depositSuccess ? (
          <div className="text-center py-8 space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-950">Deposit Verified!</h4>
            <p className="text-xs text-slate-600">
              Your wallet balance has been credited with <strong className="text-emerald-700 font-bold">{currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                {/* 1. Automated Gateway */}
                <button
                  type="button"
                  onClick={() => setPaymentMode('automated')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                    paymentMode === 'automated'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute -top-2 right-2 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-indigo-600 text-white">
                    Auto
                  </span>
                  <div className="text-xs font-bold text-indigo-700 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Instant Pay</span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">bKash/Nagad/Card</div>
                </button>

                {/* 2. Direct bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMode('manual_bkash')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMode === 'manual_bkash'
                      ? 'bg-pink-50 border-pink-500 text-pink-950 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-[#D12053]">bKash</div>
                  <div className="text-[9px] text-pink-800">Merchant Pay</div>
                </button>

                {/* 3. Direct Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMode('manual_nagad')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMode === 'manual_nagad'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-[#F7931E]">Nagad</div>
                  <div className="text-[9px] text-amber-800">Send Money</div>
                </button>

                {/* 4. Binance Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMode('binance')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMode === 'binance'
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-950 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-[#F3BA2F]">Binance</div>
                  <div className="text-[9px] text-yellow-800">Pay ID: 1280862245</div>
                </button>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Amount</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(currency === 'BDT' ? bdtPresets : usdPresets).map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {currency === 'BDT' ? `৳${amt}` : `$${amt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Or Custom Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency === 'BDT' ? '৳' : '$'}
                </span>
                <input
                  type="number"
                  min="50"
                  placeholder={currency === 'BDT' ? 'e.g. 500' : 'e.g. 10'}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* VIEW 1: AUTOMATED INSTANT GATEWAY (UddoktaPay / Paymently) */}
            {/* ========================================================= */}
            {paymentMode === 'automated' && (
              <form onSubmit={handleAutomatedCheckout} className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-indigo-900">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Instant Automated Verification Gateway</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-800">
                    Pay seamlessly with <strong>bKash, Nagad, Rocket, Upay, Visa or Mastercard</strong>. Your wallet balance is credited automatically within seconds!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                  <input
                    type="email"
                    placeholder="Your Email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                {gatewayError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {gatewayError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Secure Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Pay Now ➔ {currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: DIRECT BKASH MERCHANT PAYMENT */}
            {/* ========================================================= */}
            {paymentMode === 'manual_bkash' && (
              <form onSubmit={handleManualDeposit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-pink-200 text-pink-900">
                        bKash Merchant Payment
                      </span>
                      <div className="text-sm font-extrabold text-slate-950 mt-1 font-mono tracking-wide">
                        01981505761
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('01981505761')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100 border border-pink-300 text-xs font-bold text-pink-900 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-pink-700" />}
                      <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-pink-200 text-[11px] text-slate-700 space-y-1 font-medium">
                    <div>1. Open bKash App or dial *247#</div>
                    <div>2. Select <strong>"Make Payment" (পেমেন্ট করুন)</strong></div>
                    <div>3. Merchant Number: <strong>01981505761</strong> • Counter: 1 • Ref: HWG</div>
                    <div>4. Enter Amount & PIN to confirm payment</div>
                    <div>5. Enter TrxID below to credit instantly!</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Sender Number (e.g. 017...)"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="TrxID (e.g. BKT982172)"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-mono font-bold uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? <span>Verifying TrxID...</span> : <span>Verify & Add ৳{customAmount || selectedAmount} Balance</span>}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: DIRECT NAGAD PAYMENT */}
            {/* ========================================================= */}
            {paymentMode === 'manual_nagad' && (
              <form onSubmit={handleManualDeposit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Nagad Send Money
                      </span>
                      <div className="text-sm font-extrabold text-slate-950 mt-1 font-mono tracking-wide">
                        01981505761
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('01981505761')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
                      <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-[11px] text-slate-700 space-y-1 font-medium">
                    <div>1. Open Nagad App or dial *167#</div>
                    <div>2. Select <strong>"Send Money"</strong> ➔ Number: <strong>01981505761</strong></div>
                    <div>3. Enter Amount & Reference: HWG</div>
                    <div>4. Enter PIN to confirm & paste TrxID below!</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Sender Number (e.g. 018...)"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nagad TrxID (e.g. 71JA821)"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-mono font-bold uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? <span>Verifying TrxID...</span> : <span>Verify & Add ৳{customAmount || selectedAmount} Balance</span>}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: BINANCE PAY (0% FEE INSTANT) */}
            {/* ========================================================= */}
            {paymentMode === 'binance' && (
              <form onSubmit={handleManualDeposit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-yellow-50/70 border border-yellow-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-200 text-yellow-900">
                        Binance Pay ID (0% Transfer Fee)
                      </span>
                      <div className="text-base font-extrabold text-slate-950 mt-1 font-mono tracking-wide">
                        1280862245
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('1280862245')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-yellow-100 border border-yellow-300 text-xs font-bold text-yellow-900 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-yellow-700" />}
                      <span>{copiedNumber ? 'Copied!' : 'Copy Pay ID'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-yellow-200 text-[11px] text-slate-700 space-y-1 font-medium">
                    <div>1. Open Binance App ➔ tap <strong>"Binance Pay"</strong></div>
                    <div>2. Select <strong>"Send"</strong> ➔ choose <strong>"Pay ID"</strong></div>
                    <div>3. Enter Binance Pay ID: <strong>1280862245</strong></div>
                    <div>4. Currency: <strong>USDT</strong> • Reference: HWG</div>
                    <div>5. Enter Binance TxID/Order ID below!</div>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Binance Order ID / TxID"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900 font-mono font-bold"
                />

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? <span>Verifying Binance Transfer...</span> : <span>Verify & Add ${customAmount || selectedAmount} Balance</span>}
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
