import { apiClient } from "@/lib/axios/client";
import { unwrapApiData } from "@/lib/api/api-response";

export const departmentsApi = {
  getDepartments: async (params = {}) => {
    const response = await apiClient.get("/departments", {
      params,
    });

    return unwrapApiData(response);
  },

  getDepartmentById: async (departmentId) => {
    const response = await apiClient.get(`/departments/${departmentId}`);
    return unwrapApiData(response);
  },

  createDepartment: async (payload) => {
    const response = await apiClient.post("/departments", payload);
    return unwrapApiData(response);
  },

  updateDepartment: async ({ departmentId, payload }) => {
    const response = await apiClient.patch(
      `/departments/${departmentId}`,
      payload
    );

    return unwrapApiData(response);
  },

  deleteDepartment: async (departmentId) => {
    const response = await apiClient.delete(`/departments/${departmentId}`);
    return unwrapApiData(response);
  },
};