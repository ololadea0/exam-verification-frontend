import verifyStudentService from "../services/verifystudentService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  result: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const verifyStudent = createAsyncThunk(
  "verifyStudent/verify",
  async (studentData, thunkAPI) => {
    try {
      return await verifyStudentService.verifyStudent(studentData);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const verifySlice = createSlice({
  name: "verifyStudent",
  initialState,
  reducers: {
    reset: (state) => {
      state.result = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(verifyStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.result = action.payload;
      })
      .addCase(verifyStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.result = null;
      });
  },
});

export const { reset } = verifySlice.actions;
const { reducer } = verifySlice;
export default reducer;
