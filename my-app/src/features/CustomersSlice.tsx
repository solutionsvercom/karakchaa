import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

export interface CustomerStats {
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

/* ================= INITIAL STATE ================= */

const initialState: CustomerState = {
  customers: [],
  stats: null,
  loading: false,
  error: null,
};

/* ================= API BASE ================= */

const BASE_URL = "http://localhost:5000/api/customers";

/* ================= ASYNC THUNKS ================= */

/**
 * Fetch all customers
 */
export const fetchCustomers = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>("customers/fetchAll", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    return response.data?.data ?? [];

  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching customers"
    );
  }
});

/**
 * Fetch customer stats
 */
export const fetchCustomerStats = createAsyncThunk<
  CustomerStats,
  void,
  { rejectValue: string }
>("customers/fetchStats", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/stats`);
    return response.data?.data ?? {
  totalCustomers: 0,
  totalPurchases: 0,
  totalRevenue: 0,
};

  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching stats"
    );
  }
});

/**
 * Create customer
 */
export const createCustomer = createAsyncThunk<
  Customer,
  Partial<Customer>,
  { rejectValue: string }
>("customers/create", async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, data);
    return response.data.data;
  } catch (error: any) {
  if (error.response?.status === 409) {
    return thunkAPI.rejectWithValue(
      "Customer already exists with this name and phone number"
    );
  }
  return thunkAPI.rejectWithValue(
    error.response?.data?.message || "Error creating customer"
  );
}
});

/**
 * Update customer
 */
export const updateCustomer = createAsyncThunk<
  Customer,
  { id: string; data: Partial<Customer> },
  { rejectValue: string }
>("customers/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${id}`, data);
    return response.data.data;
  } catch (error: any) {
  if (error.response?.status === 409) {
    return thunkAPI.rejectWithValue(
      "Customer already exists with this name and phone number"
    );
  }
  return thunkAPI.rejectWithValue(
    error.response?.data?.message || "Error updating customer"
  );
}
});

/**
 * Delete customer
 */
export const deleteCustomer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("customers/delete", async (id, thunkAPI) => {
  try {
    await axios.delete(`${BASE_URL}/delete/${id}`);
    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error deleting customer"
    );
  }
});

/* ================= SLICE ================= */

const customersSlice = createSlice({
  name: "customer", // ✅ FIXED: Changed from "customer" to "customers"
  initialState,
  reducers: {
    // Clear error manually if needed
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== FETCH CUSTOMERS ===== */
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(
  fetchCustomers.fulfilled,
  (state, action: PayloadAction<Customer[]>) => {
    state.loading = false;
    
    const uniqueCustomers = action.payload.reduce((acc, customer) => {
      if (!acc.find((c) => c._id === customer._id)) {
        acc.push(customer);
      }
      return acc;
    }, [] as Customer[]);
    
    state.customers = uniqueCustomers;
  }
)

      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customers";
      })

      /* ===== FETCH STATS ===== */
      .addCase(fetchCustomerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomerStats.fulfilled,
        (state, action: PayloadAction<CustomerStats>) => {
          state.loading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stats";
      })

      /* ===== CREATE CUSTOMER ===== */
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(
  createCustomer.fulfilled,
  (state, action: PayloadAction<Customer>) => {
    state.loading = false;

    const exists = state.customers.find(
      (c) => c._id === action.payload._id
    );

    if (!exists) {
      state.customers.unshift(action.payload);
    }
  }
)

      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create customer";
      })

      /* ===== UPDATE CUSTOMER ===== */
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
  updateCustomer.fulfilled,
  (state, action: PayloadAction<Customer>) => {
    state.loading = false;
    
    const index = state.customers.findIndex(
      (c) => c._id === action.payload._id
    );
    
    if (index !== -1) {
      state.customers[index] = action.payload;
    } else {
      state.customers.unshift(action.payload);
    }
  }
)
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update customer";
      })

      /* ===== DELETE CUSTOMER ===== */
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCustomer.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.customers = state.customers.filter(
            (c) => c._id !== action.payload
          );
        }
      )
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete customer";
      });
  },
});

/* ================= EXPORT ================= */

export const { clearError } = customersSlice.actions;
export default customersSlice.reducer;