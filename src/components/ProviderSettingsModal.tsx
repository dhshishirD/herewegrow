import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Key, 
  Globe, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Lock,
  Save,
  Zap
} from 'lucide-react';
import { 
  getProviderConfig, 
  saveProviderConfig, 
  fetchProviderBalance,
  type SmmProviderConfig 
} from '../services/smmProviderService';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SmmProviderConfig>(() => getProviderConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; balance?: string } | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getProviderConfig());
      setTestResult(null);
      setSavedMsg(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetchProviderBalance();
      if (res.success) {
        setTestResult({
          success: true,
          message: `Connected successfully! Provider balance: $${res.balance} ${res.currency}`,
          balance: res.balance
        });
      } else {
        setTestResult({
          success: false,
          message: res.message || 'Connection test failed.'
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Error communicating with provider endpoint.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProviderConfig(config);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-950">Wholesale SMM Provider API</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  config.isActive && config.apiKey
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {config.isActive && config.apiKey ? 'LIVE API READY' : 'SIMULATION MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Standard SMM API v2 Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Automated 1-Click Order Routing</span>
            </div>
            <p>
              Connect any standard SMM panel (e.g. SMMFollowers, JAP, Secsers, Peakerr). When customers place an order, it is automatically pushed to your supplier server.
            </p>
          </div>

          {/* Provider API URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Provider API v2 URL</span>
            </label>
            <input
              type="url"
              required
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder="https://your-smm-supplier.com/api/v2"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-slate-900 transition-all"
            />
          </div>

          {/* Provider API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Provider Secret API Key</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Paste your supplier API key here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-slate-900 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Order Routing Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Order Dispatch & Balance Safety Mode</span>
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Protected</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Safe Mode (Manual Approval) */}
              <div 
                onClick={() => setConfig({ ...config, autoDispatch: false })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  !config.autoDispatch 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="routingMode"
                    checked={!config.autoDispatch}
                    onChange={() => setConfig({ ...config, autoDispatch: false })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">🛡️ Safe Manual Mode</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Recommended. Customer pays ➔ order waits in dashboard ➔ you click <strong>Approve & Dispatch</strong>. Balance is never spent automatically.
                </p>
              </div>

              {/* Option 2: Auto-Dispatch Mode */}
              <div 
                onClick={() => setConfig({ ...config, autoDispatch: true })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  config.autoDispatch 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="routingMode"
                    checked={Boolean(config.autoDispatch)}
                    onChange={() => setConfig({ ...config, autoDispatch: true })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">⚡ Auto-Dispatch</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Instant. Every customer order is immediately routed to Peakerr API and deducted from your balance automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Enable Provider Engine</span>
              <span className="text-[11px] text-slate-500">Enable live connection to Peakerr / SMM provider API</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.isActive}
                onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-950"></div>
            </label>
          </div>

          {/* Test Status Box */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}

          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center animate-fadeIn">
              ✓ Provider settings saved successfully!
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-600" />}
              <span>Test API & Balance</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Config</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
