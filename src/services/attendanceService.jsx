import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/attendance";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred."
  );
};

const getAttendance = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const attendanceService = { getAttendance };

export default attendanceService;
