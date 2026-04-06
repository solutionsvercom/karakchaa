import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_PRODUCT_CATEGORIES } from "../config/Api";

export interface ProductCategory {
  _id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductCategoriesState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductCategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchProductCategories = createAsyncThunk<
  ProductCategory[],
  { includeInactive?: boolean } | void,
  { rejectValue: string }
>("productCategories/fetch", async (arg, thunkAPI) => {
  try {
    const includeInactive = arg?.includeInactive === true;
    const q = includeInactive ? "?includeInactive=true" : "";
    const res = await axios.get(`${API_PRODUCT_CATEGORIES}${q}`);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to load categories"
    );
  }
});

export const createProductCategory = createAsyncThunk<
  ProductCategory,
  { label: string; slug?: string },
  { rejectValue: string }
>("productCategories/create", async (payload, thunkAPI) => {
  try {
    const res = await axios.post(API_PRODUCT_CATEGORIES, payload);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Could not create category"
    );
  }
});

export const updateProductCategory = createAsyncThunk<
  ProductCategory,
  { id: string; label?: string; sortOrder?: number; isActive?: boolean },
  { rejectValue: string }
>("productCategories/update", async ({ id, ...body }, thunkAPI) => {
  try {
    const res = await axios.patch(`${API_PRODUCT_CATEGORIES}/${id}`, body);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Could not update category"
    );
  }
});

export const removeProductCategory = createAsyncThunk<
  ProductCategory,
  string,
  { rejectValue: string }
>("productCategories/remove", async (id, thunkAPI) => {
  try {
    const res = await axios.delete(`${API_PRODUCT_CATEGORIES}/${id}`);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Could not remove category"
    );
  }
});

/** Permanently removes the category document (only when no products use its slug). */
export const permanentDeleteProductCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("productCategories/permanentDelete", async (id, thunkAPI) => {
  try {
    const res = await axios.delete(
      `${API_PRODUCT_CATEGORIES}/${id}?permanent=true`
    );
    return res.data.data._id || id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Could not delete category"
    );
  }
});

const productCategoriesSlice = createSlice({
  name: "productCategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load categories";
      })
      .addCase(createProductCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(createProductCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.categories.sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
        );
      })
      .addCase(createProductCategory.rejected, (state, action) => {
        state.error = action.payload || "Create failed";
      })
      .addCase(updateProductCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProductCategory.fulfilled, (state, action) => {
        const i = state.categories.findIndex(
          (c) => c._id === action.payload._id
        );
        if (i !== -1) state.categories[i] = action.payload;
      })
      .addCase(updateProductCategory.rejected, (state, action) => {
        state.error = action.payload || "Update failed";
      })
      .addCase(removeProductCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(removeProductCategory.fulfilled, (state, action) => {
        const i = state.categories.findIndex(
          (c) => c._id === action.payload._id
        );
        if (i !== -1) state.categories[i] = action.payload;
      })
      .addCase(removeProductCategory.rejected, (state, action) => {
        state.error = action.payload || "Remove failed";
      })
      .addCase(permanentDeleteProductCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(permanentDeleteProductCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(permanentDeleteProductCategory.rejected, (state, action) => {
        state.error = action.payload || "Delete failed";
      });
  },
});

export default productCategoriesSlice.reducer;
export const { clearError: clearProductCategoriesError } =
  productCategoriesSlice.actions;
