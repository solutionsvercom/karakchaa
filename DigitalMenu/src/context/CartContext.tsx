import React, { createContext, useContext, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../features/CartSlice";
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
  const dispatch = useAppDispatch();
  const reduxItems = useAppSelector((state) => state.cart.items);

  // Convert Redux array format to Context object format
  const items: Record<string, CartItem> = useMemo(() => {
    const result: Record<string, CartItem> = {};
    
    reduxItems.forEach((reduxItem) => {
      result[reduxItem.productId] = {
        item: {
          id: reduxItem.productId,
          name: reduxItem.name,
          price: reduxItem.price,
          category: reduxItem.category || "",
          image: reduxItem.image || "",
          description: "",
          veg: reduxItem.veg ?? true,
          available: true,
        },
        qty: reduxItem.quantity,
      };
    });
    
    return result;
  }, [reduxItems]);

  const getQty = (id: string) => items[id]?.qty ?? 0;

  const add = (item: MenuItem) => {
    dispatch(
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        veg: item.veg,
      })
    );
  };

  const inc = (id: string) => {
    // Redux addToCart already handles incrementing
    const existing = reduxItems.find((item) => item.productId === id);
    if (existing) {
      dispatch(
        addToCart({
          productId: existing.productId,
          name: existing.name,
          price: existing.price,
          image: existing.image,
          category: existing.category,
          veg: existing.veg,
        })
      );
    }
  };

  const dec = (id: string) => {
    const existing = items[id];
    if (!existing) return;

    if (existing.qty === 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(decreaseQuantity(id));
    }
  };

  const remove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const clear = () => {
    dispatch(clearCart());
  };

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