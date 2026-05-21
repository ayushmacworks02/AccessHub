import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const authApi = {
  login: async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    return unwrapApiData(response);
  },

  me: async () => {
    const response = await apiClient.get("/auth/me");
    return unwrapApiData(response);
  },

  refresh: async () => {
    const response = await apiClient.post("/auth/refresh");
    return unwrapApiData(response);
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return unwrapApiData(response);
  },

  logoutAll: async () => {
    const response = await apiClient.post("/auth/logout-all");
    return unwrapApiData(response);
  },

  forgotPassword: async (payload) => {
    const response = await apiClient.post("/auth/forgot-password", payload);
    return unwrapApiData(response);
  },

  resetPassword: async ({ token, payload }) => {
    const response = await apiClient.post(`/auth/reset-password/${token}`, payload);
    return unwrapApiData(response);
  },
};