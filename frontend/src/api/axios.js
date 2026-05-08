import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log('🔗 API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const getToken = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);
const setAccessToken = (value) => {
  if (localStorage.getItem("refreshToken")) {
    localStorage.setItem("accessToken", value);
  }
  if (sessionStorage.getItem("refreshToken")) {
    sessionStorage.setItem("accessToken", value);
  }
};

api.interceptors.request.use((config) => {
  const token = getToken("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const refreshToken = getToken("refreshToken");
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
