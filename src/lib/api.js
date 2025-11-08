
import axios from "axios";

const api = axios.create({
     baseURL: process.env.NEXT_PUBLIC_PROD_API_URL + "/api/parentauth",
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
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
        localStorage.removeItem("token");
        localStorage.removeItem("studentId");
        const path = window.location.pathname;
        const onLogin = path === "/" || path.startsWith("/login");
        if (!onLogin) window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
