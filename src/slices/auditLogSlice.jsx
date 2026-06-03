import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import auditLogService from "../services/auditLogService";

const initialState = {
  auditLogs: [],
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

export const getAuditLogs = createAsyncThunk(
  "auditLogs/getAll",
  async (params, thunkAPI) => {
    try {
      return await auditLogService.getAuditLogs(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "An unknown error occurred.",
      );
    }
  },
);

export const auditLogSlice = createSlice({
  name: "auditLogs",
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
      .addCase(getAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.auditLogs = action.payload?.auditLogs || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = auditLogSlice.actions;
export default auditLogSlice.reducer;
