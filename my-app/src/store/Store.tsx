
import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import employeesReducer from "../features/EmployeesSlice";
import stockReducer from "../features/StockmanagementSlice";
import authReducer from "../features/AuthSlice";
import productReducer from "../features/ProductsSlice";
import salesReducer from "../features/SalesSlice";
import expensesReducer from "../features/ExpensesSlice";
import suppliersReducer from "../features/SuppliersSlice";
import ordersReducer from "../features/OrdersSlice";
import settingsReducer from "../features/SettingsSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    auth: authReducer,
    stock: stockReducer,
    product : productReducer,
    sales : salesReducer,
    employees: employeesReducer,
    expenses: expensesReducer,
    suppliers: suppliersReducer,
    orders: ordersReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
