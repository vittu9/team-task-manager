import api from "./axios";

export const signupApi = (payload) => api.post("/auth/signup", payload).then((r) => r.data);
export const loginApi = (payload) => {
  console.log('🚀 Login API called with payload:', payload);
  return api.post("/auth/login", payload)
    .then((response) => {
      console.log('📥 Login API response:', response);
      console.log('📥 Response data:', response.data);
      return response.data;
    })
    .catch((error) => {
      console.log('❌ Login API error:', error);
      console.log('❌ Error response:', error.response);
      throw error;
    });
};
export const meApi = () => api.get("/auth/me").then((r) => r.data);
