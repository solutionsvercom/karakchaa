import React, { createContext, useContext, useMemo, useState } from "react";
import type { MenuItem } from "../types/menu";
import type { CartItem } from "../types/cart";

type CartContextType = {
  items: Record<string, CartItem>;
  totalQty: number;
  subtotal: number;

  getQty: (id: string) => number;
  add: (item: MenuItem) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, CartItem>>({});

  const getQty = (id: string) => items[id]?.qty ?? 0;

  const add = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev[item.id];
      const qty = existing ? existing.qty + 1 : 1;
      return { ...prev, [item.id]: { item, qty } };
    });
  };

  const inc = (id: string) => {
    setItems((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, qty: existing.qty + 1 } };
    });
  };

  const dec = (id: string) => {
    setItems((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...existing, qty: nextQty } };
    });
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clear = () => setItems({});

  const { totalQty, subtotal } = useMemo(() => {
    const values = Object.values(items);
    const totalQty = values.reduce((sum, x) => sum + x.qty, 0);
    const subtotal = values.reduce((sum, x) => sum + x.qty * x.item.price, 0);
    return { totalQty, subtotal };
  }, [items]);

  const value: CartContextType = {
    items,
    totalQty,
    subtotal,
    getQty,
    add,
    inc,
    dec,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
