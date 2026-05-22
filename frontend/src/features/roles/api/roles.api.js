import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const rolesApi = {
  getRoles: async (params = {}) => {
    const response = await apiClient.get("/roles", {
      params,
    });

    return unwrapApiData(response);
  },

  getRoleById: async (roleId) => {
    const response = await apiClient.get(`/roles/${roleId}`);
    return unwrapApiData(response);
  },

  createRole: async (payload) => {
    const response = await apiClient.post("/roles", payload);
    return unwrapApiData(response);
  },

  updateRole: async ({ roleId, payload }) => {
    const response = await apiClient.patch(`/roles/${roleId}`, payload);
    return unwrapApiData(response);
  },

  deleteRole: async (roleId) => {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return unwrapApiData(response);
  },

  replacePermissions: async ({ roleId, permissions }) => {
    const response = await apiClient.patch(`/roles/${roleId}/permissions`, {
      permissions,
    });

    return unwrapApiData(response);
  },

  appendPermissions: async ({ roleId, permissions }) => {
    const response = await apiClient.patch(
      `/roles/${roleId}/permissions/append`,
      {
        permissions,
      }
    );

    return unwrapApiData(response);
  },

  removePermissions: async ({ roleId, permissions }) => {
    const response = await apiClient.patch(
      `/roles/${roleId}/permissions/remove`,
      {
        permissions,
      }
    );

    return unwrapApiData(response);
  },
};