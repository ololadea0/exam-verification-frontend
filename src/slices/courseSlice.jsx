import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import courseService from "../services/courseService";

const initialState = {
  courses: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const getCourses = createAsyncThunk(
  "courses/getAll",
  async (params, thunkAPI) => {
    try {
      return await courseService.getCourses(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "An unknown error occurred.",
      );
    }
  },
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (courseData, thunkAPI) => {
    try {
      return await courseService.createCourse(courseData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "An unknown error occurred.",
      );
    }
  },
);

export const deleteCourse = createAsyncThunk(
  "courses/delete",
  async (id, thunkAPI) => {
    try {
      return await courseService.deleteCourse(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "An unknown error occurred.",
      );
    }
  },
);

export const courseSlice = createSlice({
  name: "courses",
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
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = action.payload?.courses || [];
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.course) {
          state.courses.push(action.payload.course);
          state.courses.sort((a, b) =>
            a.course_code.localeCompare(b.course_code),
          );
        }
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = state.courses.filter(
          (course) => course._id !== action.payload?.id,
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = courseSlice.actions;
export default courseSlice.reducer;
