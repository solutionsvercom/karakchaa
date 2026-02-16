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
import employeesReducer from "../features/EmployeesSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    product : productReducer,
    sales : salesReducer,
    employees: employeesReducer,
>>>>>>> e279d8c36ae24903da95d253960efaa0d52b1310
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
