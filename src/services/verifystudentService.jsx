import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/verify-student";

const getErrorMessage = (error) => {
  const details = error?.response?.data?.details;
  const message =
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred.";

  if (details && details !== message) {
    return `${message} Details: ${details}`;
  }

  return message;
};

// verify students

const verifyStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, studentData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const verifyStudentService = { verifyStudent };

export default verifyStudentService;
