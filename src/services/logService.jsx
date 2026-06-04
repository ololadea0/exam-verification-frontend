import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/logs";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred."
  );
};

const getLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getTimingSummary = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/timing-summary`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const logService = { getLogs, getTimingSummary };

export default logService;
