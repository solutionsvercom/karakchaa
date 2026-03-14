import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


export interface MenuProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
  isVeg: boolean;
  stockQty: number;
}

interface DigitalMenuState {
  products: MenuProduct[];
  loading: boolean;
  error: string | null;
}


const initialState: DigitalMenuState = {
  products: [],
  loading: false,
  error: null,
};


const BASE_URL = "http://localhost:5000/api/digital-menu";


export const fetchDigitalMenuProducts = createAsyncThunk<
  MenuProduct[],
  void,
  { rejectValue: string }
>("digitalMenu/fetchProducts", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data?.products ?? [];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching menu products"
    );
  }
});


const digitalMenuSlice = createSlice({
  name: "digitalMenu",
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
    setMenuError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchDigitalMenuProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchDigitalMenuProducts.fulfilled,
        (state, action: PayloadAction<MenuProduct[]>) => {
          state.loading = false;

          const uniqueProducts = action.payload.reduce((acc, product) => {
            if (!acc.find((p) => p._id === product._id)) {
              acc.push(product);
            }
            return acc;
          }, [] as MenuProduct[]);

          state.products = uniqueProducts;
        }
      )

      .addCase(fetchDigitalMenuProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch menu";
      });
  },
});


export const { clearMenuError, setMenuError } = digitalMenuSlice.actions;
export default digitalMenuSlice.reducer;