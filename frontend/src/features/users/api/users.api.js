import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const usersApi = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/users", {
      params,
    });

    return unwrapApiData(response);
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return unwrapApiData(response);
  },

  createUser: async (payload) => {
    const response = await apiClient.post("/users", payload);
    return unwrapApiData(response);
  },

  updateUser: async ({ userId, payload }) => {
    const response = await apiClient.patch(`/users/${userId}`, payload);
    return unwrapApiData(response);
  },

  updateUserStatus: async ({ userId, status }) => {
    const response = await apiClient.patch(`/users/${userId}/status`, {
      status,
    });

    return unwrapApiData(response);
  },

  assignUserRoles: async ({ userId, roles }) => {
    const response = await apiClient.patch(`/users/${userId}/roles`, {
      roles,
    });

    return unwrapApiData(response);
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return unwrapApiData(response);
  },
};