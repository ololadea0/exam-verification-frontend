import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/admin";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred."
  );
};

// Admin Registration
const adminRegister = async (userData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/register`,
      userData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};
// Admin Login
const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/login`,
      credentials,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Get Current Admin
const getCurrentAdmin = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/me`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Logout Admin
const logout = async () => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/logout`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const authService = {
  adminRegister,
  adminLogin,
  getCurrentAdmin,
  logout,
};

export default authService;
