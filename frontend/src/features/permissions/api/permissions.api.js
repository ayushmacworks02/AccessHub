import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const permissionsApi = {
  getPermissions: async ({ grouped = true } = {}) => {
    const response = await apiClient.get("/permissions", {
      params: {
        grouped,
      },
    });

    return unwrapApiData(response);
  },
};