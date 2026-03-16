import React, { createContext, useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { AlertCircle } from "lucide-react";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../features/CartSlice";
import type { MenuItem } from "../types/menu";
import type { CartItem } from "../types/cart";
import { fetchSettings } from "../features/SettingsSlice";

type CartContextType = {
  items: Record<string, CartItem>;
  totalQty: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;

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
  const products = useAppSelector((state) => state.digitalMenu.products);
  const settings = useAppSelector((state) => state.settings);
  const [cartError, setCartError] = useState<string | null>(null);

  // Fetch settings on boot
  React.useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const showError = (msg: string) => {
    setCartError(msg);
    setTimeout(() => {
      setCartError(null);
    }, 3000);
  };

  // Convert Redux array format to Context object format
  const items: Record<string, CartItem> = useMemo(() => {
    const result: Record<string, CartItem> = {};
    
    reduxItems.forEach((reduxItem) => {
      const product = products.find((p) => p._id === reduxItem.productId);
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
          stockQty: product?.stockQty ?? 0,
        },
        qty: reduxItem.quantity,
      };
    });
    
    return result;
  }, [reduxItems]);

  const getQty = (id: string) => items[id]?.qty ?? 0;

  const add = (item: MenuItem) => {
    const currentQty = getQty(item.id);
    const product = products.find(p => p._id === item.id);
    if (product && currentQty + 1 > product.stockQty) {
      showError(`Cannot add more. Only ${product.stockQty} available in stock.`);
      return;
    }
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
    const currentQty = getQty(id);
    const product = products.find(p => p._id === id);
    if (product && currentQty + 1 > product.stockQty) {
      showError(`Cannot add more. Only ${product.stockQty} available in stock.`);
      return;
    }
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

  const { totalQty, subtotal, discountAmount, taxAmount, total } = useMemo(() => {
    const values = Object.values(items);
    const totalQty = values.reduce((sum, x) => sum + x.qty, 0);
    const grossSubtotal = values.reduce((sum, x) => sum + x.qty * x.item.price, 0);
    
    // Apply Settings
    let discountAmount = 0;
    if (settings.discountType === "percentage") {
      discountAmount = (grossSubtotal * settings.discountValue) / 100;
    } else {
      discountAmount = settings.discountValue;
    }
    
    // Clamp discount
    discountAmount = Math.max(0, Math.min(discountAmount, grossSubtotal));
    const taxableAmount = Math.max(0, grossSubtotal - discountAmount);
    
    const taxAmount = (taxableAmount * settings.gstRate) / 100;
    const total = taxableAmount + taxAmount;
    
    return { 
      totalQty, 
      subtotal: grossSubtotal,
      discountAmount,
      taxAmount,
      total
    };
  }, [items, settings]);

  const value: CartContextType = {
    items,
    totalQty,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    getQty,
    add,
    inc,
    dec,
    remove,
    clear,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      
      {/* PROFESSIONAL TOAST OVERLAY REPLACE BROWSER ALERT */}
      {cartError && (
        <div 
          style={{ 
            position: "fixed", 
            bottom: "32px", 
            left: "50%", 
            transform: "translateX(-50%)", 
            background: "#1C2024", 
            border: "1px solid #E5484D",
            color: "white", 
            padding: "12px 20px", 
            borderRadius: "12px", 
            zIndex: 99999, 
            fontWeight: 500, 
            fontSize: "14px",
            boxShadow: "0 12px 32px rgba(229, 72, 77, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideUp 0.3s ease forwards"
          }}
        >
          <AlertCircle size={20} color="#FFC53D" />
          {cartError}
          <style>
            {`
              @keyframes slideUp {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
              }
            `}
          </style>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}