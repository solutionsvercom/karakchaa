import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_SETTINGS } from "../config/Api";

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

export const fetchSettings = createAsyncThunk<SettingsState, void, { rejectValue: string }>(
  "settings/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_SETTINGS);
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
    const res = await axios.put(API_SETTINGS, payload);
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
