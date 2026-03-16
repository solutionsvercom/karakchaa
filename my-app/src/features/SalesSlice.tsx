import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_SALES } from "../config/Api";

/* TYPES  */

export interface Sale {
  _id: string;
  invoiceNumber: string;
  quantity: number;
  sellingPrice: number;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  gstRate?: number;
  gstAmount?: number;
  taxableAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  // Added: populated customer object from backend
  customer?: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
  };
  customerName?: string;
  product?: {
    _id: string;
    name: string;
    sku: string;
  };
  items?: {
    product?: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface SalesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
}

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  pagination: SalesPagination | null;
  summary: SalesSummary | null;
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
};

const BASE_URL = API_SALES;

/*  ASYNC THUNKS  */

export const fetchSales = createAsyncThunk<
  { data: Sale[]; pagination: SalesPagination },
  { from?: string; to?: string; product?: string; orderSource?: string; page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("sales/fetchAll", async (filters, thunkAPI) => {
  try {
    const res = await axios.get(BASE_URL, { params: filters });
    return {
      data: res.data.data as Sale[],
      pagination: res.data.pagination as SalesPagination,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching sales"
    );
  }
});

export const fetchSalesSummary = createAsyncThunk<
  SalesSummary,
  void,
  { rejectValue: string }
>("sales/fetchSummary", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${BASE_URL}/summary`);
    return res.data.data as SalesSummary;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching sales summary"
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

/*  SLICE */

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
        state.sales = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* SUMMARY */
      .addCase(fetchSalesSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
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