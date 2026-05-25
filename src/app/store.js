import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import studentReducer from "../slices/studentSlice";
import verifyReducer from "../slices/verifyStudentSlice";
import logReducer from "../slices/logSlice";
import attendanceReducer from "../slices/attendanceSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        students: studentReducer,
        verify: verifyReducer,
        logs: logReducer,
        attendance: attendanceReducer
    },
});

export default store;
