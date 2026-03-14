import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ORDERS } from "../config/Api";

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
  orderSource?: "POS" | "DIGITAL"; 
  paymentMethod?: string;
  status:
  | "Pending"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";
  totalAmount: number;
  discount?: number;
  createdAt: string;
  notes?: string;
  saleCreated?: boolean;
}

interface CreateOrderPayload {
  items: OrderItem[];
  customerName?: string;
  phone?: string;
  orderType: "dine-in" | "takeaway" | "delivery" | "online";
  paymentMethod?: string;
  notes?: string;
  discount?: number;
}

// STAFF-LEVEL: Pagination state
interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface OrdersState {
  orders: Order[];
  pagination: PaginationState | null; 
  loading: boolean;
  error: string | null;
  // STAFF-LEVEL: Track if we're loading more (for lazy load UX)
  loadingMore: boolean;
}

const initialState: OrdersState = {
  orders: [],
  pagination: null,
  loading: false,
  error: null,
  loadingMore: false,
};

const BASE_URL = API_ORDERS;

// UPDATED: Fetch orders with pagination support
export const fetchOrders = createAsyncThunk<
  { data: Order[]; pagination: PaginationState },
  {
    page?: number;
    limit?: number;
    status?: string;
    orderSource?: string;
    orderType?: string;
  } | void,
  { rejectValue: string }
>("orders/fetch", async (params, thunkAPI) => {
  try {
    const p = params ?? {};
    const queryParams = new URLSearchParams();

    if (p.page) queryParams.append("page", p.page.toString());
    if (p.limit) queryParams.append("limit", p.limit.toString());
    if (p.status) queryParams.append("status", p.status);
    if (p.orderSource) queryParams.append("orderSource", p.orderSource);
    if (p.orderType) queryParams.append("orderType", p.orderType);

    const url = `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const res = await axios.get(url);

    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// NEW: Load more orders (for lazy loading)
export const loadMoreOrders = createAsyncThunk<
  { data: Order[]; pagination: PaginationState },
  {
    page: number;
    limit?: number;
    status?: string;
    orderSource?: string;
    orderType?: string;
  },
  { rejectValue: string }
>("orders/loadMore", async (params, thunkAPI) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.orderSource) queryParams.append("orderSource", params.orderSource);
    if (params.orderType) queryParams.append("orderType", params.orderType);

    const url = `${BASE_URL}?${queryParams.toString()}`;
    const res = await axios.get(url);

    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to load more orders"
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
  { id: string; status: Order["status"]; paymentMethod?: string },
  { rejectValue: string }
>("orders/updateStatus", async ({ id, status, paymentMethod }, thunkAPI) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}/status`, {
      status,
      ...(paymentMethod && { paymentMethod })
    });
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
  reducers: {
    //STAFF-LEVEL: Reset pagination when filters change
    resetOrders: (state) => {
      state.orders = [];
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ORDERS */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      /* LOAD MORE ORDERS (Lazy Loading) */
      .addCase(loadMoreOrders.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreOrders.fulfilled, (state, action) => {
        state.loadingMore = false;
        //STAFF-LEVEL: Append new orders, don't replace
        state.orders = [...state.orders, ...action.payload.data];
        state.pagination = action.payload.pagination;
      })
      .addCase(loadMoreOrders.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload || "Failed to load more orders";
      })

      /* CREATE ORDER */
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        // STAFF-LEVEL: Update total count
        if (state.pagination) {
          state.pagination.total += 1;
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })

      /* UPDATE ORDER STATUS */
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

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
