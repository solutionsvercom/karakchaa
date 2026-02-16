import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ================= TYPES ================= */

export interface Sale {
  _id: string;
  invoiceNumber: string;
  quantity: number;
  sellingPrice: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  product?: {
    _id: string;
    name: string;
    sku: string;
  };
}

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
};

const BASE_URL = "http://localhost:5000/api/sales";

/* ================= ASYNC THUNKS ================= */

// 🔹 Fetch Sales (supports filters)
export const fetchSales = createAsyncThunk<
  Sale[], // what we RETURN
  { from?: string; to?: string; product?: string } | undefined, // payload
  { rejectValue: string } // thunkAPI reject type
>(
  "sales/fetchAll",
  async (filters, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL, { params: filters });
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching sales"
      );
    }
  }
);


// 🔹 Create Sale (POS)
export const createSale = createAsyncThunk<
  Sale,
  any,
  { rejectValue: string }
>(
  "sales/create",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post(BASE_URL, payload);
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating sale"
      );
    }
  }
);


/* ================= SLICE ================= */

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH SALES */
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE SALE */
      .addCase(createSale.fulfilled, (state, action) => {
        // New sale appears at top
        state.sales.unshift(action.payload);
      });
  },
});

export default salesSlice.reducer;