import studentService from "../services/studentService";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  students: [],
  student: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const getStudentFromPayload = (payload) => payload?.student || payload;
const getStudentsFromPayload = (payload) => payload?.students || payload || [];

export const registerStudent = createAsyncThunk(
  "students/register",
  async (studentData, thunkAPI) => {
    try {
      return await studentService.registerStudent(studentData);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const editStudent = createAsyncThunk(
  "students/edit",
  async ({ id, studentData }, thunkAPI) => {
    try {
      return await studentService.editStudent(id, studentData);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const reregisterStudentFace = createAsyncThunk(
  "students/reregisterFace",
  async ({ id, faceData }, thunkAPI) => {
    try {
      return await studentService.reregisterStudentFace(id, faceData);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getStudents = createAsyncThunk(
  "students/getAll",
  async (params, thunkAPI) => {
    try {
      return await studentService.getStudents(params);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, thunkAPI) => {
    try {
      return await studentService.deleteStudent(id);
    } catch (error) {
      const message = error.message || "An unknown error occurred.";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    setStudent: (state, action) => {
      state.student = action.payload;
    },
    clearStudent: (state) => {
      state.student = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(registerStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const student = getStudentFromPayload(action.payload);
        state.student = student;

        if (student) {
          state.students.push(student);
        }
      })
      .addCase(registerStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(editStudent.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(editStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedStudent = getStudentFromPayload(action.payload);
        state.student = updatedStudent;

        if (updatedStudent?._id) {
          state.students = state.students.map((student) =>
            student._id === updatedStudent._id ? updatedStudent : student,
          );
        }
      })
      .addCase(editStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(reregisterStudentFace.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(reregisterStudentFace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedStudent = getStudentFromPayload(action.payload);
        state.student = updatedStudent;

        if (updatedStudent?._id) {
          state.students = state.students.map((student) =>
            student._id === updatedStudent._id ? updatedStudent : student,
          );
        }
      })
      .addCase(reregisterStudentFace.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.students = getStudentsFromPayload(action.payload);
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const deletedId = action.payload?.id;

        if (deletedId) {
          state.students = state.students.filter(
            (student) => student._id !== deletedId,
          );
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setStudent, clearStudent } = studentSlice.actions;
export default studentSlice.reducer;
