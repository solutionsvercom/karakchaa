import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DigitalOrder {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  customerName: string;
  phone: string;
  tableNumber?: string;
  orderType: string;
  status: string;
  createdAt: string;
}

interface OrderState {
  order: DigitalOrder | null;
  loading: boolean;
  error: string | null;
}


const initialState: OrderState = {
  order: null,
  loading: false,
  error: null,
};


const BASE_URL = "http://localhost:5000/api/digital-menu";


export const createDigitalOrder = createAsyncThunk<
  DigitalOrder,
  Partial<DigitalOrder>,
  { rejectValue: string }
>("digitalOrder/create", async (data, thunkAPI) => {
  try {
    const payload = {
      ...data,
      orderType: "online", // ← Force this to 'online'
    };
    
    const response = await axios.post(`${BASE_URL}/orders`, payload);
    return response.data.data; // Note: Changed from response.data.order
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error creating order"
    );
  }
});

export const fetchOrderStatus = createAsyncThunk<
  DigitalOrder,
  string,
  { rejectValue: string }
>("digitalOrder/status", async (orderRef, thunkAPI) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/orders/status/${orderRef}`
    );

    return response.data.order;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error fetching order status"
    );
  }
});


const digitalOrderSlice = createSlice({
  name: "digitalOrder",
  initialState,

  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder


      .addCase(createDigitalOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        createDigitalOrder.fulfilled,
        (state, action: PayloadAction<DigitalOrder>) => {
          state.loading = false;
          state.order = action.payload;
        }
      )

      .addCase(createDigitalOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })


      .addCase(
        fetchOrderStatus.fulfilled,
        (state, action: PayloadAction<DigitalOrder>) => {
          state.order = action.payload;
        }
      )

      .addCase(fetchOrderStatus.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch status";
      });
  },
});


export const { clearOrderError } = digitalOrderSlice.actions;
export default digitalOrderSlice.reducer;
