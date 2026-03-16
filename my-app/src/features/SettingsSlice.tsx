import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface SettingsState {
  storeName: string;
  gstRate: number;
  discountType: "percentage" | "flat";
  discountValue: number;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  storeName: "Karakchaa",
  gstRate: 5,
  discountType: "percentage",
  discountValue: 0,
  loading: false,
  error: null,
};

const BASE_URL = "http://localhost:5000/api/settings"; // fallback if missing config

export const fetchSettings = createAsyncThunk<SettingsState, void, { rejectValue: string }>(
  "settings/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch settings"
      );
    }
  }
);

export const updateSettings = createAsyncThunk<
  SettingsState,
  {
    storeName?: string;
    gstRate?: number;
    discountType?: "percentage" | "flat";
    discountValue?: number;
  },
  { rejectValue: string }
>("settings/update", async (payload, thunkAPI) => {
  try {
    const res = await axios.put(BASE_URL, payload);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to update settings"
    );
  }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.storeName = action.payload.storeName;
        state.gstRate = action.payload.gstRate;
        state.discountType = action.payload.discountType;
        state.discountValue = action.payload.discountValue;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch settings";
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.storeName = action.payload.storeName;
        state.gstRate = action.payload.gstRate;
        state.discountType = action.payload.discountType;
        state.discountValue = action.payload.discountValue;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update settings";
      });
  },
});

export default settingsSlice.reducer;
