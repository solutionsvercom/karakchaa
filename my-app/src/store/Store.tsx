import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import productReducer from "../features/ProductsSlice";
import salesReducer from "../features/SalesSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    product : productReducer,
    sales : salesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
