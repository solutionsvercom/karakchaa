import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
/* ================= TYPES ================= */

export interface StockHistoryItem {
  action: "add" | "remove";
  quantity: number;
  reason: string;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface StockItem {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  stockHistory: StockHistoryItem[];
  createdAt: string;
}

export interface StockStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface StockState {
  items: StockItem[];
  stats: StockStats | null;
  loading: boolean;
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: StockState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
};

/* ================= API BASE ================= */

const BASE_URL = `${API_BASE_URL}/stock`;

/* ================= ASYNC THUNKS ================= */

/**
 * Fetch all stock items
 */
export const fetchStockItems = createAsyncThunk<
  StockItem[],
  void,
  { rejectValue: string }
>("stock/fetchAll", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    return response.data?.data ?? [];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching stock items"
    );
  }
});

/**
 * Fetch stock statistics
 */
export const fetchStockStats = createAsyncThunk<
  StockStats,
  void,
  { rejectValue: string }
>("stock/fetchStats", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/stats`);
    return {
      totalProducts: response.data?.totalProducts ?? 0,
      inStock: response.data?.inStock ?? 0,
      lowStock: response.data?.lowStock ?? 0,
      outOfStock: response.data?.outOfStock ?? 0,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching stats"
    );
  }
});

/**
 * Create stock item
 */
export const createStockItem = createAsyncThunk<
  StockItem,
  Partial<StockItem>,
  { rejectValue: string }
>("stock/create", async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      return thunkAPI.rejectWithValue(
        "Product already exists with this SKU"
      );
    }
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error creating stock item"
    );
  }
});

/**
 * Add stock
 */
export const addStock = createAsyncThunk<
  StockItem,
  { id: string; quantity: number; reason: string; referenceNo?: string; notes?: string },
  { rejectValue: string }
>("stock/add", async ({ id, quantity, reason, referenceNo, notes }, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/add/${id}`, {
      quantity,
      reason,
      referenceNo,
      notes,
    });
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error adding stock"
    );
  }
});

/**
 * Remove stock
 */
export const removeStock = createAsyncThunk<
  StockItem,
  { id: string; quantity: number; reason: string; referenceNo?: string; notes?: string },
  { rejectValue: string }
>("stock/remove", async ({ id, quantity, reason, referenceNo, notes }, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/remove/${id}`, {
      quantity,
      reason,
      referenceNo,
      notes,
    });
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error removing stock"
    );
  }
});

/**
 * Get stock history
 */
export const fetchStockHistory = createAsyncThunk<
  StockHistoryItem[],
  string,
  { rejectValue: string }
>("stock/fetchHistory", async (id, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/history/${id}`);
    return response.data?.data ?? [];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching stock history"
    );
  }
});

/**
 * Get single stock item by ID
 */
export const fetchStockById = createAsyncThunk<
  StockItem,
  string,
  { rejectValue: string }
>("stock/fetchById", async (id, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching stock item"
    );
  }
});

/* ================= SLICE ================= */

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== FETCH STOCK ITEMS ===== */
      .addCase(fetchStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStockItems.fulfilled,
        (state, action: PayloadAction<StockItem[]>) => {
          state.loading = false;

          const uniqueItems = action.payload.reduce((acc, item) => {
            if (!acc.find((i) => i._id === item._id)) {
              acc.push(item);
            }
            return acc;
          }, [] as StockItem[]);

          state.items = uniqueItems;
        }
      )
      .addCase(fetchStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stock items";
      })

      /* ===== FETCH STATS ===== */
      .addCase(fetchStockStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStockStats.fulfilled,
        (state, action: PayloadAction<StockStats>) => {
          state.loading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchStockStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stats";
      })

      /* ===== CREATE STOCK ITEM ===== */
      .addCase(createStockItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createStockItem.fulfilled,
        (state, action: PayloadAction<StockItem>) => {
          state.loading = false;

          const exists = state.items.find((i) => i._id === action.payload._id);

          if (!exists) {
            state.items.unshift(action.payload);
          }
        }
      )
      .addCase(createStockItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create stock item";
      })

      /* ===== ADD STOCK ===== */
      .addCase(addStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addStock.fulfilled,
        (state, action: PayloadAction<StockItem>) => {
          state.loading = false;

          const index = state.items.findIndex(
            (i) => i._id === action.payload._id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      .addCase(addStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add stock";
      })

      /* ===== REMOVE STOCK ===== */
      .addCase(removeStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeStock.fulfilled,
        (state, action: PayloadAction<StockItem>) => {
          state.loading = false;

          const index = state.items.findIndex(
            (i) => i._id === action.payload._id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      .addCase(removeStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove stock";
      })

      /* ===== FETCH STOCK BY ID ===== */
      .addCase(fetchStockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStockById.fulfilled,
        (state, action: PayloadAction<StockItem>) => {
          state.loading = false;

          const index = state.items.findIndex(
            (i) => i._id === action.payload._id
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          } else {
            state.items.push(action.payload);
          }
        }
      )
      .addCase(fetchStockById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stock item";
      })

      /* ===== FETCH STOCK HISTORY ===== */
      .addCase(fetchStockHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockHistory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stock history";
      });
  },
});

/* ================= EXPORT ================= */

export const { clearError } = stockSlice.actions;
export default stockSlice.reducer;