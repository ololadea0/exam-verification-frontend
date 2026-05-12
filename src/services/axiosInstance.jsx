import axios from "axios";
const BACKEND_URL =
  "https://exam-verification-backend.onrender.com" || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`, // Proxy to backend server
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
