import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { calculatePricing, PricingSummary } from "./pricing";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchSettings } from "../../features/SettingsSlice";

type Product = {
  id: string;
  name: string;
  price: number;
  maxQty?: number;
};

type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextType = {
  items: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
  gstRate: number;
  pricing: PricingSummary;
  addItem: (product: Product) => void;
  increment: (id: string, maxQty?: number) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  setGstRate: (gstRate: number) => void;
  resetPricing: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const cartReducer = (state: CartState, action: any): CartState => {
  switch (action.type) {
    case "ADD":
      const exists = state.items.find(i => i.id === action.payload.id);
      if (
        !exists &&
        typeof action.payload.maxQty === "number" &&
        action.payload.maxQty <= 0
      ) {
        return state;
      }
      if (exists) {
        const maxQty =
          typeof action.payload.maxQty === "number"
            ? action.payload.maxQty
            : undefined;
        if (typeof maxQty === "number" && exists.quantity >= maxQty) {
          return state;
        }
        return {
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };

    case "INC":
      const itemToInc = state.items.find(i => i.id === action.payload.id);
      if (!itemToInc) return state;
      if (
        typeof action.payload.maxQty === "number" &&
        itemToInc.quantity >= action.payload.maxQty
      ) {
        return state;
      }
      return {
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };

    case "DEC":
      return {
        items: state.items
          .map(i =>
            i.id === action.payload
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )
          .filter(i => i.quantity > 0),
      };

    case "REMOVE":
      return {
        items: state.items.filter(i => i.id !== action.payload),
      };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatchCart] = useReducer(cartReducer, { items: [] });
  const reduxDispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);

  // Still allow local overrides if needed (e.g., custom discount on the fly)
  const [localDiscount, setDiscountState] = React.useState<number | null>(null);
  const [localGstRate, setGstRateState] = React.useState<number | null>(null);

  // Fetch global settings once when provider mounts
  useEffect(() => {
    reduxDispatch(fetchSettings());
  }, [reduxDispatch]);

  const activeDiscountValue = localDiscount !== null ? localDiscount : settings.discountValue;
  // If we applied a local override, assume it's flat, else use system default
  const activeDiscountType = localDiscount !== null ? "flat" : settings.discountType;
  const activeGstRate = localGstRate !== null ? localGstRate : settings.gstRate;

  const pricing = React.useMemo(
    () => calculatePricing(state.items, activeDiscountType, activeDiscountValue, activeGstRate),
    [state.items, activeDiscountType, activeDiscountValue, activeGstRate]
  );

  const setDiscount = (nextDiscount: number) => {
    setDiscountState(Math.max(Number(nextDiscount) || 0, 0));
  };

  const setGstRate = (nextGstRate: number) => {
    const normalizedRate = Number(nextGstRate) || 0;
    setGstRateState(Math.min(Math.max(normalizedRate, 0), 100));
  };

  const resetPricing = () => {
    setDiscountState(0);
    setGstRateState(0);
  };

  const value: CartContextType = {
    items: state.items,
    subtotal: pricing.subtotal,
    total: pricing.total,
    discount: activeDiscountValue,
    gstRate: activeGstRate,
    pricing,
    addItem: (product) => dispatchCart({ type: "ADD", payload: product }),
    increment: (id, maxQty) => dispatchCart({ type: "INC", payload: { id, maxQty } }),
    decrement: (id) => dispatchCart({ type: "DEC", payload: id }),
    removeItem: (id) => dispatchCart({ type: "REMOVE", payload: id }),
    clearCart: () => {
      dispatchCart({ type: "CLEAR" });
      resetPricing();
    },
    setDiscount,
    setGstRate,
    resetPricing,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
