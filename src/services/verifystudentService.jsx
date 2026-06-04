import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/verify-student";

const getErrorMessage = (error) => {
  if (error?.code === "ECONNABORTED") {
    return "Verification exceeded the 10-second processing limit. Please try again.";
  }

  const details = error?.response?.data?.details || error?.response?.data?.debug;
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
    const response = await axiosInstance.post(API_BASE_URL, studentData, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const verifyStudentService = { verifyStudent };

export default verifyStudentService;
