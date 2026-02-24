import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ================= TYPES ================= */

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  minStock: number;
  isActive: boolean;
  isVeg: boolean; // ✅ NEW
   image?: {              // ✅ add this
    url: string;
    public_id: string;
  };
}

interface ProductState {
  products: Product[];
  lowStock: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  lowStock: [],
  loading: false,
  error: null,
};

const BASE_URL = `http://localhost:5000/api/products`;

/* ================= ASYNC THUNKS ================= */

// 🔹 Fetch all products
export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching products"
      );
    }
  }
);

// 🔹 Fetch low stock
export const fetchLowStock = createAsyncThunk(
  "product/fetchLowStock",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/low-stock`);
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching low stock"
      );
    }
  }
);

// 🔹 Create product
export const createProduct = createAsyncThunk<
  Product,
  FormData,
  { rejectValue: string }
>(
  "product/create",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Product already exists"
      );
    }
  }
);

// 🔹 Update product
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; payload: FormData },
  { rejectValue: string }
>(
  "product/update",
  async ({ id, payload }, thunkAPI) => {
    try {
      const res = await axios.put(`${BASE_URL}/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error updating product"
      );
    }
  }
);

// 🔹 Toggle product status
export const toggleProductStatus = createAsyncThunk<
  Product,
  { id: string; isActive: boolean },
  { rejectValue: string }
>(
  "product/toggleStatus",
  async ({ id, isActive }, thunkAPI) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${id}/status`, { isActive });
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error updating status"
      );
    }
  }
);

// 🔹 Delete product
export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete failed"
      );
    }
  }
);

/* ================= SLICE ================= */

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH PRODUCTS */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* LOW STOCK */
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })

      /* CREATE */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE */
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      /* TOGGLE STATUS */
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p: any) => p._id !== action.payload
        );
      });
  },
});

export default productSlice.reducer;
export const { clearError } = productSlice.actions;