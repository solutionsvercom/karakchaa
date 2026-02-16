import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import productReducer from "../features/ProductsSlice";
import salesReducer from "../features/SalesSlice";
import employeesReducer from "../features/EmployeesSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    product : productReducer,
    sales : salesReducer,
    employees: employeesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
