import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/CustomersSlice";
import employeesReducer from "../features/EmployeesSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employees: employeesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
