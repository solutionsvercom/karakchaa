import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ================= TYPES ================= */

export interface Customer {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  points: number;
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  totalPurchases: number;
  totalRevenue: number;
}

interface CustomerState {
  customers: Customer[];
  stats: CustomerStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  stats: null,
  loading: false,
  error: null,
};

/* ================= API BASE ================= */

const BASE_URL = "http://localhost:5000/api/customers";


/* ================= ASYNC THUNKS ================= */

// 🔹 Get All Customers
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customers/all"
      );

      return response.data.data; // 🔥 FIXED
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching customers"
      );
    }
  }
);


// 🔹 Get Stats
export const fetchCustomerStats = createAsyncThunk(
  "customer/fetchStats",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/customers/stats"
      );

      return response.data.data; // 🔥 important
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching stats"
      );
    }
  }
);


// 🔹 Create Customer
export const createCustomer = createAsyncThunk(
  "customer/create",
  async (data: any, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/create`,
        data
      );

      return response.data.data; // 🔥 IMPORTANT
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating customer"
      );
    }
  }
);


// 🔹 Update Customer
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, data }: { id: string; data: Partial<Customer> }, thunkAPI) => {
    try {
      const response = await axios.put(`${BASE_URL}/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error updating customer");
    }
  }
);

// 🔹 Delete Customer
export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/delete/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error deleting customer");
    }
  }
);

/* ================= SLICE ================= */

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ===== FETCH ALL ===== */
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== FETCH STATS ===== */
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      /* ===== CREATE ===== */
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
      })

      /* ===== UPDATE ===== */
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })

      /* ===== DELETE ===== */
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (c) => c._id !== action.payload
        );
      });
  },
});

export default customerSlice.reducer;
