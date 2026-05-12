import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import logService from "../services/logService";

const initialState = {
  logs: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const getLogsFromPayload = (payload) => payload?.logs || payload || [];

export const getLogs = createAsyncThunk("logs/getAll", async (params, thunkAPI) => {
  try {
    return await logService.getLogs(params);
  } catch (error) {
    const message = error.message || "An unknown error occurred.";
    return thunkAPI.rejectWithValue(message);
  }
});

export const logSlice = createSlice({
  name: "logs",
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
      .addCase(getLogs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.logs = getLogsFromPayload(action.payload);
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(getLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = logSlice.actions;
export default logSlice.reducer;
