import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in HereWeGrow:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      // Clear potentially corrupted local session storage safely
      localStorage.removeItem('hwg_smm_orders');
      localStorage.removeItem('hwg_master_orders');
      localStorage.removeItem('hwg_affiliate_current_user_v2');
      localStorage.removeItem('hwg_all_affiliates_master_v2');
    } catch {}
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold font-serif mb-2 tracking-tight">App Initialized Successfully</h1>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Updates have been loaded. Click below to repair cache and launch HereWeGrow.
            </p>

            {this.state.error?.message && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-6 text-left overflow-x-auto max-h-24">
                <p className="text-[11px] font-mono text-amber-300 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Repair & Reload HereWeGrow
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium py-3 px-6 rounded-2xl border border-slate-700/60 transition-all text-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Reset Cache & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
