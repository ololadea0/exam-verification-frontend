import axios from "axios";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://exam-verification-backend.onrender.com");

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`, // Proxy to backend server
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// axiosInstance.interceptors.request.use((config) => {
//   if (config.data instanceof FormData) {
//     delete config.headers["Content-Type"];
//   }
//   return config;
// });
axiosInstance.interceptors.request.use((config) => {
  console.log(
    "API REQUEST:",
    config.method?.toUpperCase(),
    config.url,
    "withCredentials:",
    config.withCredentials,
  );

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default axiosInstance;
