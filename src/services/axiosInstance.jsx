import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_API_PROXY_TARGET || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL + "/api", // Proxy to backend server
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default axiosInstance;
