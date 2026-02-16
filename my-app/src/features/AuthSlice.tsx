import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


const token = localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/* ================= TYPES ================= */


export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  modules: string[];
  phoneNumber?: string;
}



interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
 isAuthenticated: !!localStorage.getItem("token"),

  loading: false,
  error: null,
};

/* ================= API BASE ================= */

const BASE_URL = "http://localhost:5000/api/auth";

/* ================= ASYNC THUNKS ================= */

/**
 * Login
 */
export const login = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials);
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.token);
    
    // Set default Authorization header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    
    return {
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Invalid email or password"
    );
  }
});

export const changePassword = createAsyncThunk<
  string,
  { newPassword: string },
  { rejectValue: string }
>(
  "auth/changePassword",
  async ({ newPassword }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.message;

    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Password change failed"
      );
    }
  }
);


/**
 * Verify token and get current user
 */
export const verifyToken = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/verifyToken", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    
    // Set Authorization header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    const response = await axios.get(`${BASE_URL}/me`);
    return response.data.user;
  } catch (error: any) {
    // Clear invalid token
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Token verification failed"
    );
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
      delete axios.defaults.headers.common["Authorization"];
    } catch (error: any) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== LOGIN ===== */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      })

      /* ===== VERIFY TOKEN ===== */
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })

    .addCase(verifyToken.fulfilled, (state, action: PayloadAction<User>) => {
  state.loading = false;
  state.isAuthenticated = true;
  state.user = action.payload;
  state.token = localStorage.getItem("token"); // IMPORTANT
})

      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      /* ===== LOGOUT ===== */
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

/* ================= EXPORT ================= */

export const { clearError } = authSlice.actions;
export default authSlice.reducer;