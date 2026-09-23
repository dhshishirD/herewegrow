import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Sparkles, 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  Zap,
  ArrowRight
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const bdtPresets = [200, 500, 1000, 2500, 5000];
  const usdPresets = [5, 10, 25, 50, 100];

  const merchantNumbers = {
    bkash: '01889-123456 (Merchant/Personal)',
    nagad: '01889-123456 (Merchant)',
    binance: 'TP52oP9wG2vL8k1... (USDT TRC20)'
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumbers[paymentMethod]);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const updated = depositFunds(paymentMethod, finalAmount, currency);
      onWalletUpdated(updated);
      setIsProcessing(false);
      setDepositSuccess(true);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1322] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Instant Wallet Top-Up</h3>
            <p className="text-xs text-slate-400">
              Current Balance: <span className="text-emerald-400 font-bold">{currency === 'BDT' ? `৳ ${wallet.balanceBDT.toFixed(2)}` : `$ ${wallet.balanceUSD.toFixed(2)}`}</span>
            </p>
          </div>
        </div>

        {depositSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Deposit Confirmed!</h4>
            <p className="text-xs text-slate-300">
              Your wallet has been credited with {currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-5">
            
            {/* Payment Method Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-950/40 border-pink-500 text-pink-300 shadow-md shadow-pink-500/20 font-bold'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-pink-500/30'
                  }`}
                >
                  <div className="text-sm font-black">bKash</div>
                  <div className="text-[10px] opacity-75">Auto & Manual</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-amber-500/30'
                  }`}
                >
                  <div className="text-sm font-black">Nagad</div>
                  <div className="text-[10px] opacity-75">Instant MFS</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'binance'
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20 font-bold'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="text-sm font-black">Crypto / Pay</div>
                  <div className="text-[10px] opacity-75">Binance USDT</div>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Select Amount</label>
              <div className="grid grid-cols-5 gap-2">
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
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-900 text-slate-300 border border-white/5 hover:border-emerald-500/40'
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Or Enter Custom Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency === 'BDT' ? '৳' : '$'}
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder={currency === 'BDT' ? 'e.g. 1500' : 'e.g. 20'}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Merchant Info & TrxID field */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Payment Account:</span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>{merchantNumbers[paymentMethod]}</span>
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter TrxID / Transaction Hash (e.g. BKT982172)"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Verifying & Crediting Balance...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Instant Credit {currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`}</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
