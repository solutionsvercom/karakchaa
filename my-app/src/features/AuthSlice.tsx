import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_AUTH } from "../config/Api";


/* ================= TYPES ================= */

export interface User {
  _id: string;
  companyId: string;   //CHANGED: login credential
  email?: string;      // contact only, optional
  name: string;
  role: string;
  modules: string[];
  phoneNumber?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: false,
  loading: false,
  initializing: true,
  error: null,
};

/*  API BASE  */

const BASE_URL = API_AUTH;

/*  AXIOS INTERCEPTOR */

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
        const { token: newToken } = response.data;

        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/*  ASYNC THUNKS  */

/**
 * Login — CHANGED: sends { companyId, password } instead of { email, password }
 */
export const login = createAsyncThunk<
  { user: User; token: string; refreshToken: string },
  { companyId: string; password: string },  
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    //Store role so frontend admin checks work (AddUser companyId lock etc.)
    localStorage.setItem("userRole", response.data.user.role);

    axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

    return {
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Invalid Company ID or password";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * Verify token
 */
export const verifyToken = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/verifyToken", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return thunkAPI.rejectWithValue("No token found");

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await axios.get(`${BASE_URL}/me`);

    // Keep userRole in sync on every verify
    if (response.data.user?.role) {
      localStorage.setItem("userRole", response.data.user.role);
    }

    return response.data.user;

  } catch (error: any) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    delete axios.defaults.headers.common["Authorization"];
    const message = error.response?.data?.message || "Token verification failed";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * Logout
 */
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole"); // clear role on logout
      delete axios.defaults.headers.common["Authorization"];
      return;
    } catch (error: any) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

/**
 * Change Password
 */
export const changePassword = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/changePassword", async ({ currentPassword, newPassword }, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BASE_URL}/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.message;
  } catch (error: any) {
    const message = error.response?.data?.message || "Password change failed";
    return thunkAPI.rejectWithValue(message);
  }
});

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.initializing = false; },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
      axios.defaults.headers.common["Authorization"] = `Bearer ${action.payload}`;
    },
  },

  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.initializing = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload || "Login failed";
        state.initializing = false;
      })

      /* VERIFY TOKEN */
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.initializing = false;
        state.token = localStorage.getItem("token");
        state.refreshToken = localStorage.getItem("refreshToken");
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.initializing = false;
      })

      /* LOGOUT */
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
        state.loading = false;
      })

      /* CHANGE PASSWORD */
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Password change failed";
      });
  },
});

export const { clearError, setInitialized, updateToken } = authSlice.actions;
export default authSlice.reducer;