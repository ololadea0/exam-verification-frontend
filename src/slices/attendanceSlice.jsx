import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import attendanceService from "../services/attendanceService";

const initialState = {
  attendance: [],
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

const getAttendanceFromPayload = (payload) =>
  payload?.attendance || payload || [];

export const getAttendance = createAsyncThunk(
  "attendance/getAll",
  async (params, thunkAPI) => {
    try {
      return await attendanceService.getAttendance(params);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const attendanceSlice = createSlice({
  name: "attendance",
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
      .addCase(getAttendance.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendance = getAttendanceFromPayload(action.payload);
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(getAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = attendanceSlice.actions;
export default attendanceSlice.reducer;
