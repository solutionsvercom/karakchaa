import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
<<<<<<< HEAD
import stockReducer from "../features/StockmanagementSlice";
import employeesReducer from "../features/EmployeesSlice";
import authReducer from "../features/AuthSlice";
export const store = configureStore({
  reducer: {
     employees: employeesReducer,
    customer: customerReducer,
    stock: stockReducer,
    auth: authReducer,
=======
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
