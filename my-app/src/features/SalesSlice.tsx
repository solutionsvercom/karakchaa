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

export const fetchSales = createAsyncThunk<
  Sale[],
  { from?: string; to?: string; product?: string } | undefined,
  { rejectValue: string }
>("sales/fetchAll", async (filters, thunkAPI) => {
  try {
    const res = await axios.get(BASE_URL, { params: filters });
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching sales"
    );
  }
});

export const createSale = createAsyncThunk<
  Sale,
  any,
  { rejectValue: string }
>(
  "sales/create",
  async (payload, thunkAPI) => {
    try {
        const body = {
      product: payload.productId,
      quantity: payload.quantity,
      sellingPrice: payload.sellingPrice,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      customer: payload.customer,
    };


      const res = await axios.post(BASE_URL, body);

      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating sale"
      );
    }
  }
);


export const updateSale = createAsyncThunk<
  Sale,
  { id: string; data: any },
  { rejectValue: string }
>("sales/update", async ({ id, data }, thunkAPI) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error updating sale"
    );
  }
});

export const deleteSale = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("sales/delete", async (id, thunkAPI) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error deleting sale"
    );
  }
});

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

      /* CREATE */
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter((s) => s._id !== action.payload);
      });
  },
});

export default salesSlice.reducer;
