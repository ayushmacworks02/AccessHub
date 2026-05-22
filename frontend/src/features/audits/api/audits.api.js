import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const auditsApi = {
  getAudits: async (params = {}) => {
    const response = await apiClient.get("/audits", {
      params,
    });

    return unwrapApiData(response);
  },

  getAuditById: async (auditId) => {
    const response = await apiClient.get(`/audits/${auditId}`);
    return unwrapApiData(response);
  },
};