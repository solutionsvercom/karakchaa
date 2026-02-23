import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  customerName?: string;
  phone?: string;
  orderType: "dine-in" | "takeaway" | "delivery" | "online";
  paymentMethod?: string; // ✅ NEW
  status:
    | "Pending"
    | "Accepted"
    | "Preparing"
    | "Ready"
    | "Completed"
    | "Cancelled";
  totalAmount: number;
  createdAt: string;
  notes?: string;
  saleCreated?: boolean;
}

interface CreateOrderPayload {
  items: OrderItem[];
  customerName?: string;
  phone?: string;
  orderType: "dine-in" | "takeaway" | "delivery" | "online";
  paymentMethod?: string; // ✅ NEW
  notes?: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const BASE_URL = "http://localhost:5000/api/orders";

export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetch", async (_, thunkAPI) => {
  try {
    const res = await axios.get(BASE_URL);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch orders"
    );
  }
});

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderPayload,
  { rejectValue: string }
>("orders/create", async (payload, thunkAPI) => {
  try {
    const res = await axios.post(BASE_URL, payload);
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to create order"
    );
  }
});

export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: Order["status"] },
  { rejectValue: string }
>("orders/updateStatus", async ({ id, status }, thunkAPI) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}/status`, { status });
    return res.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to update order status"
    );
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update order";
      });
  },
});

export default ordersSlice.reducer;