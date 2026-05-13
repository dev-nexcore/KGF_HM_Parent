
import axios from "axios";

const rawURL = process.env.NEXT_PUBLIC_PROD_API_URL;
// Handle cases where the env var is missing, "undefined", or "null" (as strings)
const isValid = rawURL && rawURL !== "undefined" && rawURL !== "null" && rawURL.startsWith("http");
export const API_URL = isValid ? rawURL : "http://localhost:5224";

if (typeof window !== "undefined") {
  console.log("%c[API Config]", "color: #7A8B5E; font-weight: bold", "Using Base URL:", API_URL);
}

const api = axios.create({
  baseURL: API_URL.replace(/\/$/, "") + "/api/parentauth",
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("parentToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("parentToken");
        // localStorage.removeItem("studentId");
        const path = window.location.pathname;
        const onLogin = path === "/" || path.startsWith("/login");
        if (!onLogin) window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
