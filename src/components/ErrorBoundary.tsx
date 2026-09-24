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
    // Clear potentially corrupted local session storage safely if needed
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      localStorage.removeItem('hwg_smm_orders');
      localStorage.removeItem('hwg_master_orders');
      localStorage.removeItem('hwg_affiliate_profile');
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

            <h1 className="text-2xl font-bold font-serif mb-2 tracking-tight">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We encountered a temporary loading error. Click below to reload HereWeGrow smoothly.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium py-3 px-6 rounded-2xl border border-slate-700/60 transition-all text-xs"
              >
                <Home className="w-3.5 h-3.5" />
                Reset & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
