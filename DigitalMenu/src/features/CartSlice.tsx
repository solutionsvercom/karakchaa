import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*  TYPES  */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  veg?: boolean;
}

interface CartState {
  items: CartItem[];
}

/*  INITIAL STATE  */

const initialState: CartState = {
  items: [],
};

/*  SLICE  */

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {

    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ 
          ...action.payload, 
          quantity: action.payload.quantity || 1 
        });
      }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(
        (i) => i.productId === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
    },

    clearCart: (state) => {
      state.items = [];
    },

  },
});

/*  EXPORT  */

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;