import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const groupsApi = {
  getGroups: async (params = {}) => {
    const response = await apiClient.get("/groups", {
      params,
    });

    return unwrapApiData(response);
  },

  getGroupById: async (groupId) => {
    const response = await apiClient.get(`/groups/${groupId}`);

    return unwrapApiData(response);
  },

  createGroup: async (payload) => {
    const response = await apiClient.post("/groups", payload);

    return unwrapApiData(response);
  },

  updateGroup: async ({ groupId, payload }) => {
    const response = await apiClient.patch(`/groups/${groupId}`, payload);

    return unwrapApiData(response);
  },

  assignGroupUsers: async ({ groupId, users }) => {
    const response = await apiClient.patch(`/groups/${groupId}/users`, {
      users,
    });

    return unwrapApiData(response);
  },

  assignGroupRoles: async ({ groupId, roles }) => {
    const response = await apiClient.patch(`/groups/${groupId}/roles`, {
      roles,
    });

    return unwrapApiData(response);
  },

  deleteGroup: async (groupId) => {
    const response = await apiClient.delete(`/groups/${groupId}`);

    return unwrapApiData(response);
  },
};