import React, { createContext, useContext, useReducer } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextType = {
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const cartReducer = (state: CartState, action: any): CartState => {
  switch (action.type) {
    case "ADD":
      const exists = state.items.find(i => i.id === action.payload.id);
      if (exists) {
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
      return {
        items: state.items.map(i =>
          i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
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
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items: state.items,
    total,
    addItem: (product) => dispatch({ type: "ADD", payload: product }),
    increment: (id) => dispatch({ type: "INC", payload: id }),
    decrement: (id) => dispatch({ type: "DEC", payload: id }),
    removeItem: (id) => dispatch({ type: "REMOVE", payload: id }),
    clearCart: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};