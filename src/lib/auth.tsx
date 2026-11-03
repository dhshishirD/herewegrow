import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AccountUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  lang: string;
  proUntil: number | null;
  pro: boolean;
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
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);
  const [googleEnabled, setGoogle] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetch('/api/auth/me')
      .then((r) => r.json() as Promise<{ user?: AccountUser | null; google?: boolean }>)
      .then((d) => {
        if (!live) return;
        setUser(d.user ?? null);
        setGoogle(!!d.google);
      })
      .catch(() => {})
      .finally(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, ready, googleEnabled, loginOpen, openLogin: () => setLoginOpen(true), closeLogin: () => setLoginOpen(false), setUser, logout }}
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
