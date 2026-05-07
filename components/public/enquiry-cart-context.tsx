'use client';

import * as React from 'react';
import type { EnquiryItem } from '@/lib/types';

interface EnquiryCartContextValue {
  items: EnquiryItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: { product_id: string; product_name: string }) => void;
  remove: (product_id: string) => void;
  setQty: (product_id: string, qty: number) => void;
  clear: () => void;
  count: number;
}

const Ctx = React.createContext<EnquiryCartContextValue | null>(null);

const STORAGE_KEY = 'tpgh-enquiry-cart-v1';

export function EnquiryCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<EnquiryItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const add: EnquiryCartContextValue['add'] = React.useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product_id === item.product_id);
      if (existing) {
        return prev.map((p) =>
          p.product_id === item.product_id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const remove = React.useCallback((product_id: string) => {
    setItems((prev) => prev.filter((p) => p.product_id !== product_id));
  }, []);

  const setQty = React.useCallback((product_id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((p) => p.product_id !== product_id));
      return;
    }
    setItems((prev) =>
      prev.map((p) => (p.product_id === product_id ? { ...p, quantity: qty } : p))
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  const value = React.useMemo(
    () => ({ items, open, setOpen, add, remove, setQty, clear, count }),
    [items, open, add, remove, setQty, clear, count]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEnquiryCart() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useEnquiryCart must be used within EnquiryCartProvider');
  return ctx;
}
