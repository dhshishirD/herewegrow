import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { findTemplate } from '../../shared/templates';

// The template cart: ids only, kept on this device between visits.

interface CartValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  addMany: (ids: string[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const KEY = 'hwg_cart';
const PENDING = 'hwg_cart_pending';
const CartContext = createContext<CartValue | null>(null);

const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((id): id is string => typeof id === 'string' && !!findTemplate(id)) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(read);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable: the cart lasts for this visit only
    }
  }, [ids]);

  const value: CartValue = {
    ids,
    has: (id) => ids.includes(id),
    toggle: (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    addMany: (more) => setIds((cur) => [...cur, ...more.filter((id) => !cur.includes(id))]),
    remove: (id) => setIds((cur) => cur.filter((x) => x !== id)),
    clear: () => setIds([]),
    isOpen,
    setOpen,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error('useCart must be used inside CartProvider');
  return v;
}

/** Marks that a payment was started from the cart, so the cart can be emptied once it is paid. */
export const markCartPending = () => {
  try {
    localStorage.setItem(PENDING, '1');
  } catch {
    /* ignore */
  }
};

export const takeCartPending = (): boolean => {
  try {
    const v = localStorage.getItem(PENDING) === '1';
    localStorage.removeItem(PENDING);
    return v;
  } catch {
    return false;
  }
};
