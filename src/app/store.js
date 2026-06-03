import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import studentReducer from "../slices/studentSlice";
import verifyReducer from "../slices/verifyStudentSlice";
import logReducer from "../slices/logSlice";
import attendanceReducer from "../slices/attendanceSlice";
import courseReducer from "../slices/courseSlice";
import auditLogReducer from "../slices/auditLogSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        students: studentReducer,
        verify: verifyReducer,
        logs: logReducer,
        attendance: attendanceReducer,
        courses: courseReducer,
        auditLogs: auditLogReducer
    },
});

export default store;
