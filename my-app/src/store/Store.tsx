import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import stockReducer from "../features/StockmanagementSlice";
import authReducer from "../features/AuthSlice";
export const store = configureStore({
  reducer: {
    customer: customerReducer,
    stock: stockReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
