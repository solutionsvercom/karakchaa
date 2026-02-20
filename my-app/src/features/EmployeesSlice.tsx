import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
const API_URL = `${API_BASE_URL}/employees`;

/* ================= TYPES ================= */

export interface Employee {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  role: "staff" | "manager" | "owner" | "cashier" | "chef" | "delivery";
  salary: number;
  joinDate?: string;
  address?: string;
  emergencyContact?: string;
  active?: boolean;
}

interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

/* ================= ASYNC THUNKS ================= */

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (search: string = "", { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: { search },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (data: Employee, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (
    { id, data }: { id: string; data: Employee },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/* ================= SLICE ================= */

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE */
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE (Optimistic Ready) */
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.employees.findIndex(
          (emp) => emp._id === action.payload._id
        );

        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE (Optimistic) */
      .addCase(deleteEmployee.pending, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp._id !== action.meta.arg
        );
      })
      .addCase(deleteEmployee.rejected, (state, action: any) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = employeesSlice.actions;
export default employeesSlice.reducer;
