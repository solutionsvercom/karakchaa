import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import productReducer from "../features/ProductsSlice";
import salesReducer from "../features/SalesSlice";
import employeesReducer from "../features/EmployeesSlice";
import expensesReducer from "../features/ExpensesSlice";
import suppliersReducer from "../features/SuppliersSlice";



export const store = configureStore({
  reducer: {
    customer: customerReducer,
    product : productReducer,
    sales : salesReducer,
    employees: employeesReducer,
    expenses: expensesReducer,
    suppliers: suppliersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
