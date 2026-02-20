import { configureStore } from "@reduxjs/toolkit";

import digitalMenuReducer from "../features/DigitalMenuSlice";
import cartReducer from "../features/CartSlice";
import digitalOrderReducer from "../features/DigitalOrderSlice";

export const store = configureStore({
  reducer: {
    digitalMenu: digitalMenuReducer,
    cart: cartReducer,
    digitalOrder: digitalOrderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;