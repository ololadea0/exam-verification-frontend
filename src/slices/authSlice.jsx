import authService from "../services/authService";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  admin: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const registerAdmin = createAsyncThunk(
  "auth/register",
  async (admin, thunkAPI) => {
    try {
      return await authService.adminRegister(admin);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const loginAdmin = createAsyncThunk(
  "auth/login",
  async (user, thunkAPI) => {
    try {
      return await authService.adminLogin(user);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getCurrentAdmin = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      return await authService.getCurrentAdmin();
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.admin = null;
      })
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.admin = null;
      })
      .addCase(getCurrentAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload;
      })
      .addCase(getCurrentAdmin.rejected, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "";
        state.admin = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.admin = null;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.error.message || "An unknown error occurred during logout.";
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
