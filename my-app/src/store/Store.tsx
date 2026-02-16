
import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import productReducer from "../features/ProductsSlice";
import stockReducer from "../features/StockmanagementSlice";
import salesReducer from "../features/SalesSlice";
import employeesReducer from "../features/EmployeesSlice";
import authReducer from "../features/AuthSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    auth: authReducer,
    stock: stockReducer,
    product : productReducer,
    sales : salesReducer,
    employees: employeesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
