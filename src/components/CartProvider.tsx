'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CartLine = {
  productSlug: string;
  variantId: string;
  size: string;
  nameAr: string;
  nameEn: string;
  price: number; // EXCL VAT, halalas — single source of truth, VAT applied at display
  image?: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  subtotal: number; // excl VAT
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'albazar_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore corrupt cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    // Debounced fire-and-forget sync — server stores it only for logged-in
    // users (admin abandoned-cart visibility); guests are ignored server-side.
    const id = setTimeout(() => {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(id);
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue['add'] = (line, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.variantId === line.variantId);
        if (existing) {
          return prev.map((l) =>
            l.variantId === line.variantId ? { ...l, qty: l.qty + qty } : l,
          );
        }
        return [...prev, { ...line, qty }];
      });
    };
    const remove: CartContextValue['remove'] = (variantId) =>
      setLines((prev) => prev.filter((l) => l.variantId !== variantId));
    const setQty: CartContextValue['setQty'] = (variantId, qty) =>
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => l.variantId !== variantId)
          : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l)),
      );
    const clear = () => setLines([]);

    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      add,
      remove,
      setQty,
      clear,
      subtotal: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
