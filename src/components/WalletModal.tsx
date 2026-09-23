import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  Copy, 
  Check, 
  Zap
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
    bkash: '01889-123456 (Personal/Merchant)',
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
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Instant Wallet Top-Up</h3>
            <p className="text-xs text-slate-500">
              Current Balance: <span className="text-emerald-700 font-bold">{currency === 'BDT' ? `৳ ${wallet.balanceBDT.toFixed(2)}` : `$ ${wallet.balanceUSD.toFixed(2)}`}</span>
            </p>
          </div>
        </div>

        {depositSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Deposit Confirmed!</h4>
            <p className="text-xs text-slate-600">
              Your wallet balance has been credited with {currency === 'BDT' ? `৳${customAmount || selectedAmount}` : `$${customAmount || selectedAmount}`}.
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
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-50 border-pink-500 text-pink-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold text-pink-700">bKash</div>
                  <div className="text-[10px] text-slate-500">Auto & Manual</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold text-amber-700">Nagad</div>
                  <div className="text-[10px] text-slate-500">Instant MFS</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'binance'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold text-indigo-700">Binance Pay</div>
                  <div className="text-[10px] text-slate-500">USDT TRC20</div>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Amount</label>
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
                          ? 'bg-slate-900 text-white shadow-xs'
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Or Enter Custom Amount</label>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Merchant Info & TrxID */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Merchant Account:</span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  <span>{merchantNumbers[paymentMethod]}</span>
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter TrxID / Transaction ID (e.g. BKT982172)"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Verifying & Crediting Balance...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-400" />
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
