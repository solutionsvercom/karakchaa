// src/features/SuppliersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/Store";

/**
 * ✅ Adjust this if your API base is different
 * Example: `${import.meta.env.VITE_API_BASE_URL}/api/suppliers`
 */
const BASE_URL = `http://localhost:5000/api/suppliers`;

/* -------------------- TYPES -------------------- */
export type Supplier = {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gst?: string;
  paymentTerms?: string;
  productsSupplied?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierListResponse = {
  items: Supplier[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ListParams = {
  search?: string;
  active?: "true" | "false";
  page?: number;
  limit?: number;
  sort?: string; // e.g. "-createdAt"
};

export type CreateSupplierPayload = Omit<Supplier, "_id" | "createdAt" | "updatedAt">;
export type UpdateSupplierPayload = Partial<CreateSupplierPayload> & { _id: string };

/* -------------------- SMALL FETCH HELPER -------------------- */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Try to read json error message if any
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

function toQuery(params?: ListParams) {
  const q = new URLSearchParams();
  if (!params) return "";

  if (params.search) q.set("search", params.search);
  if (params.active) q.set("active", params.active);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sort) q.set("sort", params.sort);

  const s = q.toString();
  return s ? `?${s}` : "";
}

/* -------------------- THUNKS -------------------- */
export const fetchSuppliers = createAsyncThunk<SupplierListResponse, ListParams | undefined>(
  "suppliers/fetchSuppliers",
  async (params) => {
    // If your backend returns {success:true,data:{items...}} then adjust here.
    return request<SupplierListResponse>(`${BASE_URL}${toQuery(params)}`);
  }
);

export const createSupplier = createAsyncThunk<Supplier, CreateSupplierPayload>(
  "suppliers/createSupplier",
  async (payload) => {
    return request<Supplier>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
);

export const updateSupplier = createAsyncThunk<Supplier, UpdateSupplierPayload>(
  "suppliers/updateSupplier",
  async ({ _id, ...payload }) => {
    return request<Supplier>(`${BASE_URL}/${_id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
);

export const deleteSupplier = createAsyncThunk<{ _id: string }, string>(
  "suppliers/deleteSupplier",
  async (_id) => {
    await request<{ success?: boolean }>(`${BASE_URL}/${_id}`, { method: "DELETE" });
    return { _id };
  }
);

/* -------------------- SLICE -------------------- */
type SuppliersState = {
  items: Supplier[];
  page: number;
  limit: number;
  total: number;
  pages: number;

  loadingList: boolean;
  loadingSave: boolean;
  loadingDelete: boolean;

  errorList: string | null;
  errorSave: string | null;
  errorDelete: string | null;
};

const initialState: SuppliersState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,

  loadingList: false,
  loadingSave: false,
  loadingDelete: false,

  errorList: null,
  errorSave: null,
  errorDelete: null,
};

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    clearSuppliersErrors(state) {
      state.errorList = null;
      state.errorSave = null;
      state.errorDelete = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- LIST --------
      .addCase(fetchSuppliers.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<SupplierListResponse>) => {
        state.loadingList = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.error.message || "Failed to fetch suppliers";
      })

      // -------- CREATE --------
      .addCase(createSupplier.pending, (state) => {
        state.loadingSave = true;
        state.errorSave = null;
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loadingSave = false;
        // Put new supplier at top
        state.items = [action.payload, ...state.items];
        state.total += 1;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loadingSave = false;
        state.errorSave = action.error.message || "Failed to create supplier";
      })

      // -------- UPDATE --------
      .addCase(updateSupplier.pending, (state) => {
        state.loadingSave = true;
        state.errorSave = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loadingSave = false;
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loadingSave = false;
        state.errorSave = action.error.message || "Failed to update supplier";
      })

      // -------- DELETE --------
      .addCase(deleteSupplier.pending, (state) => {
        state.loadingDelete = true;
        state.errorDelete = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
        state.loadingDelete = false;
        state.items = state.items.filter((s) => s._id !== action.payload._id);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loadingDelete = false;
        state.errorDelete = action.error.message || "Failed to delete supplier";
      });
  },
});

export const { clearSuppliersErrors } = suppliersSlice.actions;
export default suppliersSlice.reducer;

/* -------------------- SELECTORS -------------------- */
export const selectSuppliers = (state: RootState) => state.suppliers.items;
export const selectSuppliersMeta = (state: RootState) => ({
  page: state.suppliers.page,
  limit: state.suppliers.limit,
  total: state.suppliers.total,
  pages: state.suppliers.pages,
});
export const selectSuppliersLoading = (state: RootState) => ({
  loadingList: state.suppliers.loadingList,
  loadingSave: state.suppliers.loadingSave,
  loadingDelete: state.suppliers.loadingDelete,
});
export const selectSuppliersErrors = (state: RootState) => ({
  errorList: state.suppliers.errorList,
  errorSave: state.suppliers.errorSave,
  errorDelete: state.suppliers.errorDelete,
});
