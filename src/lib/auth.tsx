import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AccountUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  lang: string;
  proUntil: number | null;
  pro: boolean;
  /** Plan id whose perks apply now (pro-7, pro-30, pro-365), else null/absent. */
  proPlan?: string | null;
}

interface AuthValue {
  user: AccountUser | null;
  /** False until the first /api/auth/me answer arrives. */
  ready: boolean;
  googleEnabled: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  setUser: (u: AccountUser | null) => void;
  logout: () => Promise<void>;
  /** Read the account again from the server, for example after buying Pro. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);
  const [googleEnabled, setGoogle] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = (await (await fetch('/api/auth/me')).json()) as { user?: AccountUser | null; google?: boolean };
      setUser(d.user ?? null);
      setGoogle(!!d.google);
    } catch {
      // offline or not set up: stay as we are
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, ready, googleEnabled, loginOpen, openLogin: () => setLoginOpen(true), closeLogin: () => setLoginOpen(false), setUser, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
