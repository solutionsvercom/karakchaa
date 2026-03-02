import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_EXPENSES } from "../config/Api";


/* ================= TYPES ================= */

export type ExpenseCategory =
  | "misc"
  | "rent"
  | "salary"
  | "utilities"
  | "supplies"
  | "inventory"
  | "marketing"
  | "maintenance"
  | "transport"
  | "taxes";

export type PaymentMethod = "cash" | "upi" | "bank";

export interface Expense {
  _id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  vendor?: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO string
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseTotals {
  totalExpenses: number;
  thisMonthExpenses: number;
  totalTransactions: number;
  averageExpense: number;
}

interface ExpensesState {
  expenses: Expense[];
  totals: ExpenseTotals | null;

  // ✅ for edit screen
  selected: Expense | null;
  loadingSelected: boolean;

  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  totals: null,

  selected: null,
  loadingSelected: false,

  loading: false,
  error: null,
};

/* ================= API BASE ================= */

const BASE_URL = API_EXPENSES;


/* ================= ASYNC THUNKS ================= */

// ✅ GET /api/expenses
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);

      // backend returns: { success: true, items: [...] }  OR { success:true, data:{items:[...]}}
      const data = res.data?.data ?? res.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(res.data?.items)) return res.data.items;

      return [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching expenses"
      );
    }
  }
);

// ✅ GET /api/expenses/:id  (IMPORTANT FOR EDIT)
export const fetchExpenseById = createAsyncThunk(
  "expenses/fetchById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/${id}`);
      return res.data?.data ?? res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching expense"
      );
    }
  }
);

// ✅ GET /api/expenses/totals
export const fetchExpenseTotals = createAsyncThunk(
  "expenses/fetchTotals",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/totals`);
      return res.data?.data ?? res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error fetching totals"
      );
    }
  }
);

// ✅ POST /api/expenses
export const createExpense = createAsyncThunk(
  "expenses/create",
  async (payload: any, thunkAPI) => {
    try {
      const res = await axios.post(BASE_URL, payload);
      return res.data?.data ?? res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error creating expense"
      );
    }
  }
);

// ✅ PUT /api/expenses/:id
export const updateExpense = createAsyncThunk(
  "expenses/update",
  async (
    { id, payload }: { id: string; payload: Partial<Expense> },
    thunkAPI
  ) => {
    try {
      const res = await axios.put(`${BASE_URL}/${id}`, payload);
      return res.data?.data ?? res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Error updating expense"
      );
    }
  }
);

// ✅ DELETE /api/expenses/:id
export const deleteExpense = createAsyncThunk(
  "expenses/delete",
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

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedExpense: (state) => {
      state.selected = null;
      state.loadingSelected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== FETCH EXPENSES ===== */
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== FETCH ONE (EDIT) ===== */
      .addCase(fetchExpenseById.pending, (state) => {
        state.loadingSelected = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loadingSelected = false;
        state.selected = action.payload;

        // keep list in sync if already loaded
        const idx = state.expenses.findIndex((e) => e._id === action.payload?._id);
        if (idx !== -1) state.expenses[idx] = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loadingSelected = false;
        state.error = action.payload as string;
      })

      /* ===== TOTALS ===== */
      .addCase(fetchExpenseTotals.fulfilled, (state, action) => {
        state.totals = action.payload;
      })

      /* ===== CREATE ===== */
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })

      /* ===== UPDATE ===== */
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.expenses[index] = action.payload;

        // update selected too
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })

      /* ===== DELETE ===== */
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      });
  },
});

export default expensesSlice.reducer;
export const { clearError, clearSelectedExpense } = expensesSlice.actions;
