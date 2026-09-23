import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  Copy, 
  Check, 
  Zap,
  ShieldCheck,
  Smartphone,
  CreditCard,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { depositFunds } from '../services/growthService';
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

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'binance'>('bkash');
  const [selectedAmount, setSelectedAmount] = useState<number>(currency === 'BDT' ? 500 : 10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const bdtPresets = [100, 250, 500, 1000, 2500, 5000];
  const usdPresets = [5, 10, 25, 50, 100];

  const paymentDetails = {
    bkash: {
      number: '01981505761',
      type: 'bKash Merchant (Make Payment)',
      badge: 'Merchant Payment',
      counter: '1',
      ref: 'HWG',
      instructions: [
        '1. Open bKash App or dial *247#',
        '2. Select "Make Payment" (পেমেন্ট করুন)',
        '3. Enter Merchant Number: 01981505761',
        '4. Enter Amount & Reference: HWG',
        '5. Enter bKash PIN to confirm payment',
        '6. Enter your TrxID below to credit instantly!'
      ]
    },
    nagad: {
      number: '01981505761',
      type: 'Nagad Business / Send Money',
      badge: 'Send Money / Payment',
      counter: '1',
      ref: 'HWG',
      instructions: [
        '1. Open Nagad App or dial *167#',
        '2. Select "Send Money" or "Payment"',
        '3. Enter Number: 01981505761',
        '4. Enter Amount & Reference: HWG',
        '5. Enter Nagad PIN to confirm',
        '6. Enter your TrxID below to credit instantly!'
      ]
    },
    binance: {
      number: '1280862245',
      type: 'Binance Pay (Instant 0% Fee)',
      badge: 'Binance Pay ID: 1280862245',
      counter: '',
      ref: 'HWG',
      instructions: [
        '1. Open Binance App ➔ tap "Pay" or "Binance Pay"',
        '2. Select "Send" ➔ choose "Pay ID / Binance ID"',
        '3. Enter Binance Pay ID: 1280862245',
        '4. Select Currency: USDT & enter Amount ($ USD)',
        '5. Note / Reference: HWG & Confirm Transfer',
        '6. Enter your Binance Order/TxID below to credit instantly!'
      ]
    }
  };

  const currentDetails = paymentDetails[paymentMethod];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentDetails.number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount <= 0) return;

    if (!trxId.trim()) {
      alert('Please enter your Transaction ID (TrxID) after making the payment.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const updated = depositFunds(paymentMethod, finalAmount, currency);
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
          <form onSubmit={handleDeposit} className="space-y-5">
            
            {/* Payment Method Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-50 border-pink-500 text-pink-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-extrabold text-[#D12053]">bKash</div>
                  <div className="text-[10px] text-pink-800 font-semibold">Merchant Payment</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-extrabold text-[#F7931E]">Nagad</div>
                  <div className="text-[10px] text-amber-800 font-semibold">Send Money</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'binance'
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-extrabold text-[#F3BA2F]">Binance</div>
                  <div className="text-[10px] text-yellow-800 font-semibold">USDT TRC20</div>
                </button>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Deposit Amount</label>
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

            {/* Merchant Account Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {currentDetails.badge}
                  </span>
                  <div className="text-sm font-extrabold text-slate-950 mt-1 font-mono tracking-wide">
                    {currentDetails.number}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>

              {/* Step by Step Instructions */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1">
                {currentDetails.instructions.map((step, idx) => (
                  <div key={idx} className="font-medium">{step}</div>
                ))}
              </div>

              {/* Input Sender Phone & TrxID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Sender Number (e.g. 017...)"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 font-medium"
                />
                <input
                  type="text"
                  required
                  placeholder="TrxID (e.g. BKT982172)"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 font-mono font-bold uppercase"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span>Verifying TrxID & Crediting Balance...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Verify & Add {currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`} Balance</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
